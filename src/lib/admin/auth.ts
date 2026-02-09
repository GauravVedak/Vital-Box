import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
  return tokenMatch?.[1] ?? null;
}

export async function verifyAdmin(req: Request): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse }
> {
  const token = getTokenFromRequest(req);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Invalid token" },
        { status: 401 }
      ),
    };
  }

  const db = await getDb("Users");
  const users = db.collection("userdata");
  const user = await users.findOne({ _id: new ObjectId(decoded.sub) });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Forbidden: admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    userId: decoded.sub,
    email: decoded.email,
  };
}
