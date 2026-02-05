// *** Made By Naveed *** //
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";


// --- Database users retrival and verification --- //
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const db = await getDb("Users");
    const users = db.collection("userdata");
    const docs = await users.find().toArray();
    const safe = docs.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    }));
    return NextResponse.json({ ok: true, users: safe });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
