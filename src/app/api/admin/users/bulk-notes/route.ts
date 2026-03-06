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

type BulkNotesBody = {
  userIds?: string[];
  adminNote?: string;
};

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok || !auth.usersCollection) {
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: auth.status },
      );
    }

    const body = (await req.json().catch(() => ({}))) as BulkNotesBody;
    const { userIds, adminNote } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { ok: false, message: "No users selected" },
        { status: 400 },
      );
    }

    const trimmedNote = (adminNote ?? "").trim();
    if (!trimmedNote) {
      return NextResponse.json(
        { ok: false, message: "Note cannot be empty" },
        { status: 400 },
      );
    }

    const validObjectIds = userIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (validObjectIds.length === 0) {
      return NextResponse.json(
        { ok: false, message: "No valid user IDs" },
        { status: 400 },
      );
    }

    const updateResult = await auth.usersCollection.updateMany(
      { _id: { $in: validObjectIds } },
      { $set: { adminNote: trimmedNote } },
    );

    return NextResponse.json({
      ok: true,
      matched: updateResult.matchedCount,
      modified: updateResult.modifiedCount,
    });
  } catch (err) {
    console.error("Admin bulk note update error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
