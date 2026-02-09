import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { verifyAdmin } from "../../../../lib/admin/auth";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthName(date: Date): string {
  return MONTHS[date.getMonth()];
}

function parseDate(val: string | Date): Date {
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * GET /api/admin/analytics
 * Aggregates signups (from Users), memberships and subscription mix (from Purchases.orders).
 * Admin only.
 */
export async function GET(req: Request) {
  const auth = await verifyAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const usersDb = await getDb("Users");
    const purchasesDb = await getDb("Purchases");
    const userdata = usersDb.collection("userdata");
    const orders = purchasesDb.collection("orders");

    // Signups: count users created per month (last 6 months)
    const signupAgg = await userdata
      .aggregate([
        { $match: { createdAt: { $exists: true } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ])
      .toArray();

    const signups = signupAgg.map((x: { _id: { year: number; month: number }; count: number }) => ({
      month: MONTHS[(x._id.month ?? 1) - 1],
      year: x._id.year,
      signups: x.count,
    }));

    // Membership & subscription mix: aggregate from orders
    const orderDocs = await orders.find({}).toArray();

    const byMonth: Record<
      string,
      { memberships: number; threeMonth: number; sixMonth: number; yearly: number }
    > = {};

    for (const order of orderDocs) {
      const orderDate = order.orderDate ?? order.createdAt ?? order.updatedAt;
      if (!orderDate) continue;
      const d = parseDate(orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) {
        byMonth[key] = { memberships: 0, threeMonth: 0, sixMonth: 0, yearly: 0 };
      }
      byMonth[key].memberships += 1;
      const sub = (order.subscription ?? "3-month").toLowerCase();
      if (sub.includes("3") || sub === "3-month") byMonth[key].threeMonth += 1;
      else if (sub.includes("6") || sub === "6-month") byMonth[key].sixMonth += 1;
      else byMonth[key].yearly += 1;
    }

    const sortedKeys = Object.keys(byMonth).sort().slice(-6);
    const memberships = sortedKeys.map((key) => {
      const [year, monthNum] = key.split("-");
      return {
        month: MONTHS[parseInt(monthNum, 10) - 1],
        year: parseInt(year ?? "2026", 10),
        memberships: byMonth[key].memberships,
      };
    });

    const subscriptions = sortedKeys.map((key) => {
      const [year, monthNum] = key.split("-");
      const m = byMonth[key];
      return {
        month: MONTHS[parseInt(monthNum, 10) - 1],
        year: parseInt(year ?? "2026", 10),
        threeMonth: m.threeMonth,
        sixMonth: m.sixMonth,
        yearly: m.yearly,
      };
    });

    // Fallback if no data: use empty arrays or minimal placeholder
    const fallbackSignups =
      signups.length > 0
        ? signups
        : MONTHS.slice(0, 6).map((m, i) => ({ month: m, year: 2026, signups: 0 }));
    const fallbackMemberships =
      memberships.length > 0
        ? memberships
        : MONTHS.slice(0, 6).map((m, i) => ({ month: m, year: 2026, memberships: 0 }));
    const fallbackSubscriptions =
      subscriptions.length > 0
        ? subscriptions
        : MONTHS.slice(0, 6).map((m) => ({
            month: m,
            year: 2026,
            threeMonth: 0,
            sixMonth: 0,
            yearly: 0,
          }));

    return NextResponse.json({
      ok: true,
      analytics: {
        signups: fallbackSignups,
        memberships: fallbackMemberships,
        subscriptions: fallbackSubscriptions,
      },
    });
  } catch (err) {
    console.error("Admin analytics fetch error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
