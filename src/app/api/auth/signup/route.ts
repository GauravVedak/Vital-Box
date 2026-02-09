import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_EXPIRES_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing fields" },
        { status: 400 },
      );
    }

    const db = await getDb("Users");
    const users = db.collection("userdata");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "User already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      name,
      email,
      passwordHash,
      role: "user",
      createdAt: new Date(),
      fitnessMetrics: {},
    });

    const userId = result.insertedId.toString();

    const user = {
      id: userId,
      name,
      email,
      role: "user",
      fitnessMetrics: {},
    };

    // Generate JWT token for auto-login after signup
    const token = jwt.sign({ sub: userId, email }, JWT_SECRET, {
      expiresIn: ACCESS_EXPIRES_SECONDS,
    });

    const res = NextResponse.json({ ok: true, user }, { status: 201 });

    // Set the cookie so user is automatically logged in
    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_EXPIRES_SECONDS,
    });

    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
