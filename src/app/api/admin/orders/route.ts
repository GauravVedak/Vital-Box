import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { verifyAdmin } from "../../../../lib/admin/auth";

/**
 * GET /api/admin/orders
 * Returns all orders from Purchases.orders. Admin only.
 */
export async function GET(req: Request) {
  const auth = await verifyAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const db = await getDb("Purchases");
    const orders = db.collection("orders");
    const docs = await orders.find({}).sort({ orderDate: -1 }).toArray();

    const data = docs.map((doc) => ({
      id: doc.id ?? doc._id?.toString(),
      customer: doc.customer ?? "",
      customerId: doc.customerId ?? null,
      subscription: doc.subscription ?? "3-month",
      status: doc.status ?? "Pending",
      amount: doc.amount ?? 0,
      startDate: doc.startDate ?? null,
      orderDate: doc.orderDate ?? doc.createdAt ?? "",
      promoCode: doc.promoCode ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ ok: true, orders: data });
  } catch (err) {
    console.error("Admin orders fetch error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
