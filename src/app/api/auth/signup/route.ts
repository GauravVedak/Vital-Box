import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  safeReadBody,
  safeParse,
  sanitizeString,
  isValidEmail,
  isValidPassword,
  assertSafeFields,
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "../../../../lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("[startup] JWT_SECRET is not set.");

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const FAIL = { ok: false, message: "Unable to create account." };

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`signup:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  const bodyResult = await safeReadBody(req, 2048);
  if (!bodyResult.ok) return bodyResult.response;

  const body = safeParse(bodyResult.text);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(FAIL, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  if (!assertSafeFields(raw, ["name", "email", "password"])) {
    return NextResponse.json(FAIL, { status: 400 });
  }

  const name     = sanitizeString(raw.name,     60);
  const email    = sanitizeString(raw.email,    254);
  const password = sanitizeString(raw.password, 128);

  if (!name || !email || !password) {
    return NextResponse.json(FAIL, { status: 400 });
  }

  if (!/^[\p{L}\p{M}' \-]{1,60}$/u.test(name)) {
    return NextResponse.json(FAIL, { status: 400 });
  }

  const emailLower = email.toLowerCase();

  if (!isValidEmail(emailLower)) {
    return NextResponse.json(FAIL, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { ok: false, message: "Password must be 8–128 characters with at least one letter and one number." },
      { status: 400 }
    );
  }

  try {
    const db    = await getDb("Users");
    const users = db.collection("userdata");

    const existing = await users.findOne({ email: emailLower }, { projection: { _id: 1 } });
    if (existing) return NextResponse.json(FAIL, { status: 400 });

    if (ip === "unknown") {
      return NextResponse.json(
        { ok: false, message: "Cannot verify request origin. Please try again." },
        { status: 403 }
      );
    }

    const ipCount = await users.countDocuments({ signupIp: ip });
    if (ipCount >= 3) return NextResponse.json(FAIL, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    const now          = new Date();

    const result = await users.insertOne({
      name,
      email:    emailLower,
      passwordHash,
      role:     "user",
      signupIp: ip,
      createdAt: now,
      fitnessMetrics: {
        totalBmiSubmissions: 0,
        bmiSubmissionsToday: [],
        firstBMIDate:        null,
        aiSeededAt:          null,
        aiRequestsToday:     [],
        loginAttempts:       [],
      },
    });

    const userId = result.insertedId.toString();
    const token  = jwt.sign(
      { sub: userId, email: emailLower },
      JWT_SECRET as string,
      { expiresIn: COOKIE_MAX_AGE }
    );

    const res = NextResponse.json({
      ok:   true,
      user: { id: userId, name, email: emailLower, role: "user", fitnessMetrics: {} },
    }, { status: 201 });

    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   COOKIE_MAX_AGE,
    });

    return res;
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json(FAIL, { status: 500 });
  }
}