import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "@/lib/mongodb";
import {
  safeReadBody,
  safeParse,
  sanitizeString,
  stripDangerous,
  assertSafeFields,
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("[startup] JWT_SECRET is not set.");

export const runtime = "nodejs";

interface JwtPayload { sub: string; email: string; }

type AmazonLink = {
  searchQuery: string; url: string;
  category: string; purpose: string;
  redFlags?: string;
};

type AIGuidance = {
  summary: string;
  disclaimers: string[];
  amazonLinks: AmazonLink[];
};

type FitnessMetrics = {
  latestBMI?:       { value: number; category: string; height: number; weight: number; unit: "metric" | "imperial"; date: string; };
  goalWeight?:      number;
  height?:          number;
  unit?:            "metric" | "imperial";
  firstBMIDate?:    string | null;
  aiSeededAt?:      string | null;
  aiRequestsToday?: string[];
};

const DAILY_AI_CAP = 20;

function buildPrompt(p: {
  message: string; userName: string;
  bmiValue: number | null; bmiCategory: string;
  weight: number | null; height: number | null;
  unit: "metric" | "imperial"; goalWeight: number | null;
}): string {
  const wu = p.unit === "imperial" ? "lb" : "kg";
  const hu = p.unit === "imperial" ? "in" : "cm";

  return `You are a fitness and supplement guidance assistant.
You must NOT diagnose, treat, or prescribe medication.
Use ONLY the verified user data below. Do not invent or assume any data not listed.

USER DATA (server-verified):
- Name: ${p.userName}
- BMI: ${p.bmiValue ?? "not provided"}
- BMI category: ${p.bmiCategory}
- Weight: ${p.weight != null ? `${p.weight} ${wu}` : "not provided"}
- Height: ${p.height != null ? `${p.height} ${hu}` : "not provided"}
- Goal weight: ${p.goalWeight != null ? `${p.goalWeight} ${wu}` : "not provided"}

USER MESSAGE: "${p.message}"

TASK:
1) 1–3 sentences of guidance relevant to the user's message and data.
2) Recommend 1–3 supplement TYPES (not brands). Evidence-based only.
3) For each, include a generic Amazon search URL: https://www.amazon.com/s?k=<encoded-query>

RULES:
- Unrelated to fitness/supplements? Politely redirect.
- Do not invent medical conditions, age, or medications.
- Output MUST be valid JSON only — no markdown, no fences, no preamble.

OUTPUT SHAPE (strictly):
{
  "summary": "string",
  "disclaimers": ["This is general information, not medical advice.", "Consult a healthcare professional before starting new supplements."],
  "amazonLinks": [{ "searchQuery": "string", "url": "https://www.amazon.com/s?k=...", "category": "string", "purpose": "string", "redFlags": "optional string" }]
}`.trim();
}

function isValidGuidance(obj: unknown): obj is AIGuidance {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  const g = obj as Record<string, unknown>;
  return (
    typeof g.summary === "string" &&
    Array.isArray(g.disclaimers) &&
    Array.isArray(g.amazonLinks)
  );
}

function sanitizeGuidance(raw: AIGuidance): AIGuidance {
  return {
    summary:     stripDangerous(raw.summary).slice(0, 2000),
    disclaimers: raw.disclaimers.slice(0, 5).map((d) => stripDangerous(String(d)).slice(0, 300)),
    amazonLinks: raw.amazonLinks.slice(0, 5).map((link) => {
      const url = String(link.url ?? "");
      return {
        searchQuery: stripDangerous(String(link.searchQuery ?? "")).slice(0, 200),
        url:         url.startsWith("https://www.amazon.com/s?k=") ? url.slice(0, 500) : "",
        category:    stripDangerous(String(link.category ?? "")).slice(0, 100),
        purpose:     stripDangerous(String(link.purpose  ?? "")).slice(0, 300),
        ...(link.redFlags ? { redFlags: stripDangerous(String(link.redFlags)).slice(0, 300) } : {}),
      };
    }),
  };
}

const FALLBACK: AIGuidance = {
  summary: "I can help with fitness and supplement guidance. Ask about your goals — muscle gain, fat loss, energy, or recovery — and I'll provide suggestions based on your profile.",
  disclaimers: [
    "This is general information, not medical advice.",
    "Consult a healthcare professional before starting new supplements.",
  ],
  amazonLinks: [],
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`ai:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  const token = req.headers.get("cookie")?.match(/access_token=([^;]+)/)?.[1];
  if (!token) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Session expired." }, { status: 401 });
  }

  if (!ObjectId.isValid(decoded.sub)) {
    return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
  }

  const bodyResult = await safeReadBody(req, 1024);
  if (!bodyResult.ok) return bodyResult.response;

  const body = safeParse(bodyResult.text);

  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    if (!assertSafeFields(body as Record<string, unknown>, ["message"])) {
      return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
    }
  }

  const rawMessage = sanitizeString((body as Record<string, unknown>)?.message, 500);
  if (!rawMessage) {
    return NextResponse.json(
      { ok: false, message: "Message is required (max 500 characters)." },
      { status: 400 }
    );
  }

  const message = stripDangerous(rawMessage);

  try {
    const db    = await getDb("Users");
    const users = db.collection("userdata");

    const user = await users.findOne(
      { _id: new ObjectId(decoded.sub) },
      {
        projection: {
          name:                              1,
          "fitnessMetrics.latestBMI":        1,
          "fitnessMetrics.goalWeight":       1,
          "fitnessMetrics.height":           1,
          "fitnessMetrics.unit":             1,
          "fitnessMetrics.firstBMIDate":     1,
          "fitnessMetrics.aiSeededAt":       1,
          "fitnessMetrics.aiRequestsToday":  1,
        },
      }
    );

    if (!user) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });

    const fm = (user.fitnessMetrics ?? {}) as FitnessMetrics;

    if (!fm.firstBMIDate) {
      return NextResponse.json(
        { ok: false, message: "Please calculate your BMI first.", bmiRequired: true },
        { status: 403 }
      );
    }

    const oneDayAgo      = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequests = (fm.aiRequestsToday ?? []).filter((d: string) => new Date(d) > oneDayAgo);

    if (recentRequests.length >= DAILY_AI_CAP) {
      return NextResponse.json(
        { ok: false, message: "Daily AI request limit reached. Try again tomorrow.", limitReached: true },
        { status: 429 }
      );
    }

    await users.updateOne(
      { _id: new ObjectId(decoded.sub) },
      {
        $push: {
          "fitnessMetrics.aiRequestsToday": {
            $each:  [new Date().toISOString()],
            $slice: -25,
          },
        } as never,
      }
    );

    const latest     = fm.latestBMI;
    const bmiValue   = typeof latest?.value    === "number" && Number.isFinite(latest.value) ? latest.value : null;
    const bmiCat     = latest?.category ?? "unknown";
    const weight     = typeof latest?.weight   === "number" ? latest.weight : null;
    const height     = typeof (latest?.height ?? fm.height) === "number" ? (latest?.height ?? fm.height) as number : null;
    const unit       = latest?.unit ?? fm.unit ?? "metric";
    const goalWeight = typeof fm.goalWeight    === "number" ? fm.goalWeight : null;
    const userName   = stripDangerous(typeof user.name === "string" ? user.name : "User").slice(0, 60);

    const prompt = buildPrompt({ message, userName, bmiValue, bmiCategory: bmiCat, weight, height, unit, goalWeight });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, message: "AI service is temporarily unavailable." }, { status: 503 });
    }

    const ai     = new GoogleGenerativeAI(apiKey);
    const model  = ai.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);

    let text = result.response.text().trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: AIGuidance | null = null;
    try {
      const candidate = JSON.parse(text) as unknown;
      if (isValidGuidance(candidate)) parsed = sanitizeGuidance(candidate);
    } catch {
      parsed = null;
    }

    return NextResponse.json(parsed ?? FALLBACK);
  } catch (err) {
    console.error("[ai/guidance]", err);
    return NextResponse.json(
      { ok: false, message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}