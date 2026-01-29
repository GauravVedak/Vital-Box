import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getDb } from "../../../../lib/mongodb";

/**
 * Syncs Auth0 user to MongoDB using Naveed's DB structure:
 * getDb("Users"), collection "userdata", with name, email, auth0UserId, fitnessMetrics.
 * Auth0 users have no passwordHash.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const user = session.user;
    const auth0UserId = user.sub;
    const email = user.email;
    const name = user.name ?? user.nickname ?? "";

    if (!email) {
      return NextResponse.json(
        { message: "User has no email" },
        { status: 400 },
      );
    }

    const db = await getDb("Users");
    const col = db.collection("userdata");

    await col.updateOne(
      { $or: [{ auth0UserId }, { email }] },
      {
        $set: {
          name,
          email,
          auth0UserId,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          fitnessMetrics: {},
        },
      },
      { upsert: true },
    );

    const saved = await col.findOne({ email });
    return NextResponse.json({
      message: "User synced successfully",
      user: saved
        ? {
            id: saved._id.toString(),
            email: saved.email,
            name: saved.name,
            auth0UserId: saved.auth0UserId,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error in sync user route:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
