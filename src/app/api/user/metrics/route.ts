import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";
import {
  safeReadBody,
  safeParse,
  clampNumber,
  isValidUnit,
  assertSafeFields,
  assertSafeObject,
  getClientIp,
  rateLimit,
  rateLimitHeaders,
  startOfTodayUTC,
  daysAgo,
} from "../../../../lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("[startup] JWT_SECRET is not set.");

interface JwtPayload { sub: string; email: string; }
type Unit = "metric" | "imperial";

type BMIEntry = {
  value: number; category: string;
  height: number; weight: number;
  unit: Unit; date: string;
};

const VALID_CATEGORIES = new Set(["Underweight", "Normal Weight", "Overweight", "Obese"]);
const LIFETIME_BMI_CAP = 2;
const DAILY_BMI_CAP    = 2;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`metrics:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const token        = cookieHeader.match(/access_token=([^;]+)/)?.[1];
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
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  if (!assertSafeFields(raw, ["unit", "height", "weight", "goalWeight"])) {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  if (raw.latestBMI !== undefined && !assertSafeObject(raw.latestBMI)) {
    return NextResponse.json({ ok: false, message: "Invalid BMI data." }, { status: 400 });
  }

  const rawUnit = raw.unit ?? (raw.latestBMI as Record<string, unknown> | undefined)?.unit;
  const unit    = isValidUnit(rawUnit) ? rawUnit : null;

  const hMin = unit === "imperial" ? 20  : 50;
  const hMax = unit === "imperial" ? 120 : 300;
  const wMin = unit === "imperial" ? 44  : 20;
  const wMax = unit === "imperial" ? 1100 : 500;

  const height     = raw.height     != null ? clampNumber(raw.height,     hMin, hMax) : undefined;
  const weight     = raw.weight     != null ? clampNumber(raw.weight,     wMin, wMax) : undefined;
  const goalWeight = raw.goalWeight != null ? clampNumber(raw.goalWeight, wMin, wMax) : undefined;

  let bmiEntry: BMIEntry | null = null;

  if (raw.latestBMI != null) {
    if (typeof raw.latestBMI !== "object" || Array.isArray(raw.latestBMI)) {
      return NextResponse.json({ ok: false, message: "Invalid BMI data." }, { status: 400 });
    }

    const e        = raw.latestBMI as Record<string, unknown>;
    const bmiUnit  = isValidUnit(e.unit) ? e.unit : unit;
    const bHMin    = bmiUnit === "imperial" ? 20 : 50;
    const bHMax    = bmiUnit === "imperial" ? 120 : 300;
    const bWMin    = bmiUnit === "imperial" ? 44 : 20;
    const bWMax    = bmiUnit === "imperial" ? 1100 : 500;

    const bmiValue  = clampNumber(e.value,  10, 80);
    const bmiHeight = clampNumber(e.height, bHMin, bHMax);
    const bmiWeight = clampNumber(e.weight, bWMin, bWMax);
    const bmiCat    = typeof e.category === "string" && VALID_CATEGORIES.has(e.category)
      ? e.category : null;

    if (!bmiValue || !bmiHeight || !bmiWeight || !bmiUnit || !bmiCat) {
      return NextResponse.json({ ok: false, message: "Invalid BMI data." }, { status: 400 });
    }

    bmiEntry = {
      value: bmiValue, category: bmiCat,
      height: bmiHeight, weight: bmiWeight,
      unit: bmiUnit, date: new Date().toISOString(),
    };
  }

  try {
    const db    = await getDb("Users");
    const users = db.collection("userdata");

    const user = await users.findOne(
      { _id: new ObjectId(decoded.sub) },
      {
        projection: {
          "fitnessMetrics.totalBmiSubmissions": 1,
          "fitnessMetrics.bmiSubmissionsToday": 1,
          "fitnessMetrics.firstBMIDate":        1,
          "fitnessMetrics.aiSeededAt":          1,
        },
      }
    );

    if (!user) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });

    const fm = (user.fitnessMetrics ?? {}) as {
      totalBmiSubmissions?: number;
      bmiSubmissionsToday?: string[];
      firstBMIDate?:        string | null;
      aiSeededAt?:          string | null;
    };

    if (bmiEntry) {
      if ((fm.totalBmiSubmissions ?? 0) >= LIFETIME_BMI_CAP) {
        return NextResponse.json(
          { ok: false, message: "BMI limit reached. Update weight via your profile panel.", lifetimeLimitReached: true },
          { status: 429 }
        );
      }

      const todayStart       = startOfTodayUTC();
      const submissionsToday = (fm.bmiSubmissionsToday ?? []).filter(
        (d: string) => new Date(d) >= todayStart
      );

      if (submissionsToday.length >= DAILY_BMI_CAP) {
        return NextResponse.json(
          { ok: false, message: "Daily BMI limit reached. Try again tomorrow.", limitReached: true },
          { status: 429 }
        );
      }
    }

    const $set:  Record<string, unknown> = {};
    const $push: Record<string, unknown> = {};
    const $inc:  Record<string, unknown> = {};

    if (bmiEntry) {
      $set["fitnessMetrics.latestBMI"]      = bmiEntry;
      $set["fitnessMetrics.lastCalculated"] = bmiEntry.date;
      $inc["fitnessMetrics.totalBmiSubmissions"] = 1;

      if (!fm.firstBMIDate) {
        $set["fitnessMetrics.firstBMIDate"] = bmiEntry.date;
      }

      const aiSeededAt = fm.aiSeededAt ? new Date(fm.aiSeededAt) : null;
      if (!aiSeededAt || aiSeededAt < daysAgo(10)) {
        $set["fitnessMetrics.aiSeededAt"] = bmiEntry.date;
      }

      $push["fitnessMetrics.bmiSubmissionsToday"] = {
        $each: [bmiEntry.date], $slice: -10,
      };
      $push["fitnessMetrics.bmiHistory"] = {
        $each: [bmiEntry], $slice: -100,
      };
    }

    if (typeof height     === "number") $set["fitnessMetrics.height"]     = height;
    if (typeof weight     === "number") $set["fitnessMetrics.weight"]     = weight;
    if (unit)                           $set["fitnessMetrics.unit"]       = unit;
    if (typeof goalWeight === "number") $set["fitnessMetrics.goalWeight"] = goalWeight;

    const updateOps: Record<string, unknown> = {};
    if (Object.keys($set).length  > 0) updateOps["$set"]  = $set;
    if (Object.keys($push).length > 0) updateOps["$push"] = $push;
    if (Object.keys($inc).length  > 0) updateOps["$inc"]  = $inc;

    if (Object.keys(updateOps).length === 0) {
      return NextResponse.json({ ok: false, message: "No valid data provided." }, { status: 400 });
    }

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(decoded.sub) },
      updateOps,
      {
        returnDocument: "after",
        projection:     { passwordHash: 0, signupIp: 0, lastLoginIp: 0 },
      }
    );

    return NextResponse.json({ ok: true, fitnessMetrics: result?.fitnessMetrics ?? null });
  } catch (err) {
    console.error("[metrics]", err);
    return NextResponse.json(
      { ok: false, message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}