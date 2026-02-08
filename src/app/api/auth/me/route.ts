import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

interface JwtPayload {
  sub: string;
  email: string;
}

export async function GET(req: Request) {
  try {
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

    const db = await getDb("Users");
    const users = db.collection("userdata");
    const user = await users.findOne({ _id: new ObjectId(decoded.sub) });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      fitnessMetrics: user.fitnessMetrics || {},
    };

    return NextResponse.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}