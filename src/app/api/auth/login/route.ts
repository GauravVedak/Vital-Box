import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  safeReadBody,
  safeParse,
  sanitizeString,
  isValidEmail,
  getClientIp,
  rateLimit,
  rateLimitHeaders,
  daysAgo,
} from "../../../../lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("[startup] JWT_SECRET environment variable is not set.");
}

const ACCESS_EXPIRES_SECONDS = 60 * 60 * 24 * 7;
const MAX_FAILURES            = 5;
const LOCKOUT_MS              = 15 * 60 * 1000; 
const DUMMY_HASH =
  "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/y.2GgK2";

export async function POST(req: Request) {
  // ── 1. IP + DDoS shield ──────────────────────────────────────────────────
  const ip = getClientIp(req);

  // 10 login attempts per IP per 15 min
  const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  // ── 2. Body size guard (2 KB) ─────────────────────────────────────────────
  const bodyResult = await safeReadBody(req, 2048);
  if (!bodyResult.ok) return bodyResult.response;

  const body = safeParse(bodyResult.text);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials." },
      { status: 401 }
    );
  }

  const raw = body as Record<string, unknown>;

  // ── 3. Sanitize inputs ────────────────────────────────────────────────────
  const email    = sanitizeString(raw.email,    254);
  const password = sanitizeString(raw.password, 128);
  const INVALID = { ok: false, message: "Invalid credentials." };

  if (!email || !password) {
    return NextResponse.json(INVALID, { status: 401 });
  }

  const emailLower = email.toLowerCase();

  if (!isValidEmail(emailLower)) {
    return NextResponse.json(INVALID, { status: 401 });
  }

  // ── 4. Database + auth ────────────────────────────────────────────────────
  try {
    const db    = await getDb("Users");
    const users = db.collection("userdata");

    const user = await users.findOne({ email: emailLower });

    // ── 4a. Lockout check BEFORE bcrypt  ─
    if (user) {
      const attempts: { at: string | Date; ip: string }[] =
        user.fitnessMetrics?.loginAttempts ?? [];

      const windowStart    = new Date(Date.now() - LOCKOUT_MS);
      const recentFailures = attempts.filter(
        (a) => new Date(a.at) >= windowStart
      );

      if (recentFailures.length >= MAX_FAILURES) {
        await bcrypt.compare(password, DUMMY_HASH);
        return NextResponse.json(
          {
            ok:      false,
            message: "Account temporarily locked due to too many failed attempts. Try again in 15 minutes.",
          },
          { status: 423 }
        );
      }
    }

    // ── 4b. Password check (always runs bcrypt for timing consistency) ──────
    const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
    const match       = await bcrypt.compare(password, hashToCheck);

    if (!user || !match) {
      if (user) {
        const failEntry = { at: new Date().toISOString(), ip };

        // Prune entries older than lockout window while adding new one
        // This prevents the loginAttempts array from growing without bound
        const cutoff = new Date(Date.now() - LOCKOUT_MS).toISOString();

        await users.updateOne(
          { email: emailLower },
          {
            $push: {
              "fitnessMetrics.loginAttempts": {
                $each:  [failEntry],
                $slice: -20, 
              },
            } as never,
          }
        );
      }

      return NextResponse.json(INVALID, { status: 401 });
    }

    // ── 4c. Successful login ─────────────────────────────────────────────
    // Clear failed attempts + record login metadata
    await users.updateOne(
      { email: emailLower },
      {
        $set: {
          "fitnessMetrics.loginAttempts": [],
          lastLoginAt:                    new Date(),
          lastLoginIp:                    ip,
        },
      }
    );

    const safeUser = {
      id:             user._id.toString(),
      name:           user.name,
      email:          user.email,
      role:           user.role ?? "user",
      fitnessMetrics: user.fitnessMetrics ?? {},
      adminNote:      user.adminNote ?? "",
    };

    const token = jwt.sign(
      { sub: safeUser.id, email: safeUser.email },
      JWT_SECRET as string,
      { expiresIn: ACCESS_EXPIRES_SECONDS }
    );

    const res = NextResponse.json({ ok: true, user: safeUser });

    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   ACCESS_EXPIRES_SECONDS,
    });

    return res;
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}