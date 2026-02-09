import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

type AmazonLink = {
  searchQuery: string;
  url: string;
  category: string;
  purpose: string;
  redFlags?: string;
};

type AIGuidance = {
  summary: string;
  disclaimers: string[];
  amazonLinks: AmazonLink[];
};

interface JwtPayload {
  sub: string;   
  email: string;
}

export const runtime = "nodejs";

function buildPrompt(input: {
  message: string;
  user: {
    name?: string;
    fitnessMetrics?: any;
  };
}) {
  const fm = input.user.fitnessMetrics || {};
  const latest = fm.latestBMI || {};
  const bmiValue = typeof latest.value === "number" ? latest.value : null;

  return `
You are a fitness and supplement guidance assistant.
You must NOT diagnose, treat, or prescribe.
Use ONLY the user data provided below and the user message.

USER DATA (trusted):
- Name: ${input.user.name ?? "User"}
- BMI: ${bmiValue ?? "unknown"}
- BMI category: ${latest.category ?? "unknown"}
- Weight: ${latest.weight ?? "unknown"} ${latest.unit === "imperial" ? "lb" : "kg"}
- Height: ${latest.height ?? fm.height ?? "unknown"} ${latest.unit === "imperial" ? "in" : "cm"}
- Goal weight: ${fm.goalWeight ?? "unknown"}

USER MESSAGE:
"${input.message}"

TASK:
1) Give 1–3 sentences of guidance relevant to the user's message and data.
2) Recommend 1–3 supplement TYPES (not brands). Prioritize common, evidence-based options.
3) For each recommendation, include a generic Amazon search link:
   "https://www.amazon.com/s?k=<url-encoded query>"

RULES:
- If the message is unrelated to fitness/supplements, politely redirect.
- Do not invent medical conditions, medications, or age.
- Output MUST be valid JSON only (no markdown, no extra text).

OUTPUT JSON SHAPE:
{
  "summary": "...",
  "disclaimers": [
    "This is general information, not medical advice.",
    "Consult a healthcare professional before starting new supplements."
  ],
  "amazonLinks": [
    {
      "searchQuery": "Creatine Monohydrate",
      "url": "https://www.amazon.com/s?k=Creatine+Monohydrate",
      "category": "performance",
      "purpose": "Supports strength and high-intensity training",
      "redFlags": "Avoid if you have kidney disease unless cleared by a clinician."
    }
  ]
}
`.trim();
}

export async function POST(req: Request) {
  try {
    // 1 -> Auth from cookie (same as /api/auth/me)
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 2 -> Parse body
    const body = (await req.json().catch(() => null)) as { message?: string } | null;
    const message = body?.message?.trim();

    if (!message) {
      return NextResponse.json(
        { ok: false, message: "Message is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(decoded.sub)) {
      return NextResponse.json(
        { ok: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    // 3 -> Load user
    const db = await getDb("Users");
    const users = db.collection("userdata");
    const user = await users.findOne({ _id: new ObjectId(decoded.sub) });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 4 -> Call Gemini
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = buildPrompt({
      message,
      user: { name: user.name, fitnessMetrics: user.fitnessMetrics },
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // 5 -> Defensive parsing: strip ```json fences if present
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

    let parsed: AIGuidance | null = null;
    try {
      parsed = JSON.parse(text) as AIGuidance;
    } catch {
      parsed = null;
    }

    const fallback: AIGuidance = {
      summary:
        "I can help with fitness and supplement guidance. Ask about your goals (muscle gain, fat loss, energy, recovery) and I’ll suggest options.",
      disclaimers: [
        "This is general information, not medical advice.",
        "Consult a healthcare professional before starting new supplements.",
      ],
      amazonLinks: [],
    };

    return NextResponse.json(parsed ?? fallback);
  } catch (err) {
    console.error("AI guidance error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}