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

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok || !auth.usersCollection) {
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: auth.status },
      );
    }

    const docs = await auth.usersCollection
      .find(
        {},
        {
          projection: {
            name: 1,
            email: 1,
            role: 1,
            fitnessMetrics: 1,
            adminNote: 1,
          },
        },
      )
      .toArray();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = docs.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role ?? "user",
      fitnessMetrics: u.fitnessMetrics ?? {},
      adminNote: u.adminNote ?? "",
    }));

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error("Admin users list error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
