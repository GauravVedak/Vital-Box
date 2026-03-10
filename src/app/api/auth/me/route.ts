/**
 * src/app/api/auth/me/route.ts
 */

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "../../../../lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("[startup] JWT_SECRET environment variable is not set.");
}

interface JwtPayload {
  sub:   string;
  email: string;
}

export async function GET(req: Request) {
  // ── 1. DDoS shield ───────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(`me:${ip}`, 30, 60 * 1000); 
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  // ── 2. Verify token ───────────────────────────────────────────────────────
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token        = cookieHeader.match(/access_token=([^;]+)/)?.[1];

    if (!token) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    } catch {
      return NextResponse.json(
        { ok: false, message: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    if (!decoded.sub || !ObjectId.isValid(decoded.sub)) {
      return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
    }

    // ── 3. Fetch user — sensitive fields excluded at DB level ─────────────
    const db    = await getDb("Users");
    const users = db.collection("userdata");

    const user = await users.findOne(
      { _id: new ObjectId(decoded.sub) },
      {
        projection: {
          passwordHash: 0,
          signupIp:     0,
          lastLoginIp:  0,
        },
      }
    );

    // Return 401 (not 404) — don't reveal whether the user ID exists
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({
      ok:   true,
      user: {
        id:             user._id.toString(),
        name:           user.name,
        email:          user.email,
        role:           user.role ?? "user",
        fitnessMetrics: user.fitnessMetrics ?? {},
        adminNote:      user.adminNote ?? "",
      },
    });
  } catch (err) {
    console.error("[me] error:", err);
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}