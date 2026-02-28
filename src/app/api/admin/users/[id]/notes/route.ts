import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

interface JwtPayload {
  sub: string;
  email: string;
}

async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
  const token = tokenMatch?.[1];

  if (!token) {
    return { ok: false as const, status: 401, usersCollection: null };
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return { ok: false as const, status: 401, usersCollection: null };
  }

  const db = await getDb("Users");
  const users = db.collection("userdata");
  const me = await users.findOne({ _id: new ObjectId(decoded.sub) });

  if (!me || (me.role ?? "user") !== "admin") {
    return { ok: false as const, status: 403, usersCollection: null };
  }

  return { ok: true as const, status: 200, usersCollection: users };
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok || !auth.usersCollection) {
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: auth.status },
      );
    }

    const { id } = await context.params;
    const userId = id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid user id" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { adminNote } = body as { adminNote?: string };

    const updateResult = await auth.usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { adminNote: (adminNote ?? "").trim() } },
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin note update error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
