import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { verifyAdmin } from "../../../../lib/admin/auth";
import type { Promotion } from "../../../../lib/admin/types";

/**
 * GET /api/admin/promotions
 * Returns all promotions from Purchases.promotions. Admin only.
 */
export async function GET(req: Request) {
  const auth = await verifyAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const db = await getDb("Purchases");
    const promotions = db.collection("promotions");
    const docs = await promotions.find({}).sort({ createdAt: -1 }).toArray();

    const data: Promotion[] = docs.map((doc) => ({
      id: doc.id ?? doc._id?.toString(),
      name: doc.name ?? "",
      code: doc.code ?? "",
      discountType: doc.discountType ?? "percent",
      discountValue: doc.discountValue ?? 0,
      startDate: doc.startDate ?? "",
      endDate: doc.endDate ?? "",
      status: doc.status ?? "Scheduled",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ ok: true, promotions: data });
  } catch (err) {
    console.error("Admin promotions fetch error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promotions
 * Creates a new promotion. Admin only.
 */
export async function POST(req: Request) {
  const auth = await verifyAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { name, code, discountType, discountValue, startDate, endDate } =
      body as Partial<Promotion>;

    const trimmedCode = (code ?? "").trim().toUpperCase();
    const value = Number(discountValue);

    if (!name?.trim() || !trimmedCode || Number.isNaN(value) || value <= 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid promotion data" },
        { status: 400 }
      );
    }

    const db = await getDb("Purchases");
    const promotions = db.collection("promotions");

    const existing = await promotions.findOne({ code: trimmedCode });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Promo code already exists" },
        { status: 409 }
      );
    }

    const now = new Date();
    const doc = {
      id: `promo-${Date.now()}`,
      name: name.trim(),
      code: trimmedCode,
      discountType: discountType ?? "percent",
      discountValue: value,
      startDate: startDate ?? now.toISOString().slice(0, 10),
      endDate: endDate ?? now.toISOString().slice(0, 10),
      status: "Scheduled",
      createdAt: now,
      updatedAt: now,
    };

    await promotions.insertOne(doc);

    return NextResponse.json({
      ok: true,
      promotion: {
        id: doc.id,
        name: doc.name,
        code: doc.code,
        discountType: doc.discountType,
        discountValue: doc.discountValue,
        startDate: doc.startDate,
        endDate: doc.endDate,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    console.error("Admin promotion create error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to create promotion" },
      { status: 500 }
    );
  }
}
