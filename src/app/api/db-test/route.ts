// *** Made By Naveed *** //

import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";


// Function to retrieve the User Authentication Credentials...
export async function GETUSER() {
  try {
    const db = await getDb("Users");
    const collections = await db.listCollections().toArray();
    return NextResponse.json({ ok: true, collections: collections.map((c) => c.name) });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
