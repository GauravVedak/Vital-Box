import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";
import { getClientIp, rateLimit, rateLimitHeaders } from "../../../../lib/sanitize";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("[startup] JWT_SECRET is not set.");

interface JwtPayload { sub: string; email: string; }

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`me:${ip}`, 30, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  try {
    const token = req.headers.get("cookie")?.match(/access_token=([^;]+)/)?.[1];
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    } catch {
      return NextResponse.json({ ok: false, message: "Session expired." }, { status: 401 });
    }

    if (!decoded.sub || !ObjectId.isValid(decoded.sub)) {
      return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
    }

    const db   = await getDb("Users");
    const user = await db.collection("userdata").findOne(
      { _id: new ObjectId(decoded.sub) },
      { projection: { passwordHash: 0, signupIp: 0, lastLoginIp: 0 } }
    );

    if (!user) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });

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
    console.error("[me]", err);
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}