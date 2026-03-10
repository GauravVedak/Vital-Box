import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "../../../../lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("[startup] JWT_SECRET environment variable is not set.");
}

export async function GET(req: Request) {
  // ── 1. DDoS shield ───────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(`verify:${ip}`, 30, 60 * 1000); 

  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  // ── 2. Token verification ─────────────────────────────────────────────────
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token        = cookieHeader.match(/access_token=([^;]+)/)?.[1];

    if (!token) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET as string);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }
  } catch (err) {
    console.error("[verify] error:", err);
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}