import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function POST(req: Request) {
  try {
    // Read JWT from access_token cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      latestBMI,
      height,
      weight,
      unit,
      bmiHistoryEntry,
      lastCalculated,
      goalWeight,
    } = body as {
      latestBMI?: {
        value: number;
        category: string;
        height: number;
        weight: number;
        unit: "metric" | "imperial";
        date: string;
      };
      height?: number;
      weight?: number;
      unit?: "metric" | "imperial";
      bmiHistoryEntry?: {
        value: number;
        category: string;
        date: string;
      };
      lastCalculated?: string;
      goalWeight?: number;
    };

    const db = await getDb("Users");
    const users = db.collection("userdata");

    const setUpdate: Record<string, unknown> = {};

    if (latestBMI) {
      setUpdate["fitnessMetrics.latestBMI"] = latestBMI;
    }
    if (typeof height === "number") {
      setUpdate["fitnessMetrics.height"] = height;
    }
    if (typeof weight === "number") {
      setUpdate["fitnessMetrics.weight"] = weight;
    }
    if (unit) {
      setUpdate["fitnessMetrics.unit"] = unit;
    }
    if (lastCalculated) {
      setUpdate["fitnessMetrics.lastCalculated"] = lastCalculated;
    }
    if (typeof goalWeight === "number") {
      setUpdate["fitnessMetrics.goalWeight"] = goalWeight;
    }

    const updateOps: Record<string, unknown> = {};
    if (Object.keys(setUpdate).length > 0) {
      updateOps["$set"] = setUpdate;
    }
    if (bmiHistoryEntry) {
      updateOps["$push"] = {
        "fitnessMetrics.bmiHistory": bmiHistoryEntry,
      };
    }

    if (Object.keys(updateOps).length === 0) {
      return NextResponse.json(
        { ok: false, message: "Nothing to update" },
        { status: 400 },
      );
    }

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(decoded.sub) },
      updateOps,
      { returnDocument: "after" },
    );

    return NextResponse.json({
      ok: true,
      fitnessMetrics: result.value?.fitnessMetrics ?? null,
    });
  } catch (err) {
    console.error("Error updating fitness metrics:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
