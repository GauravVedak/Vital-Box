import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "No token" },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { ok: false, message: "Token expired or invalid" },
        { status: 401 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
