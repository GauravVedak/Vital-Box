import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_EXPIRES_SECONDS = 60 * 15; // 15 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing fields" },
        { status: 400 },
      );
    }

    const db = await getDb("Users");
    const users = db.collection("userdata");
    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash || "");
    if (!match) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      fitnessMetrics: user.fitnessMetrics || {},
    };

    const token = jwt.sign(
      { sub: safeUser.id, email: safeUser.email },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES_SECONDS },
    );

    const res = NextResponse.json({ ok: true, user: safeUser });

    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_EXPIRES_SECONDS,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
