/**
 * Admin API client – fetches orders, promotions, analytics from backend.
 */

import type { Order, Promotion, AdminAnalytics } from "./types";

const BASE = "/api/admin";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data as T;
}

export async function fetchOrders(): Promise<Order[]> {
  const { orders } = await fetchJson<{ ok: boolean; orders: Order[] }>(
    `${BASE}/orders`
  );
  return orders ?? [];
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const { promotions } = await fetchJson<{
    ok: boolean;
    promotions: Promotion[];
  }>(`${BASE}/promotions`);
  return promotions ?? [];
}

export async function fetchAnalytics(): Promise<AdminAnalytics> {
  const { analytics } = await fetchJson<{
    ok: boolean;
    analytics: AdminAnalytics;
  }>(`${BASE}/analytics`);
  return analytics ?? { signups: [], memberships: [], subscriptions: [] };
}

export async function createPromotion(
  promo: Omit<Promotion, "id" | "status" | "createdAt" | "updatedAt">
): Promise<Promotion> {
  const res = await fetch(`${BASE}/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(promo),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to create promotion");
  }
  return data.promotion;
}
