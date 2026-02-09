"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchOrders,
  fetchPromotions,
  fetchAnalytics,
  createPromotion,
} from "../lib/admin/api";
import type { Order, Promotion, AdminAnalytics } from "../lib/admin/types";

interface UseAdminDataResult {
  orders: Order[];
  promotions: Promotion[];
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addPromotion: (promo: Parameters<typeof createPromotion>[0]) => Promise<void>;
}

export function useAdminData(): UseAdminDataResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersData, promotionsData, analyticsData] = await Promise.all([
        fetchOrders(),
        fetchPromotions(),
        fetchAnalytics(),
      ]);
      setOrders(ordersData);
      setPromotions(promotionsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
      setOrders([]);
      setPromotions([]);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPromotion = useCallback(
    async (promo: Parameters<typeof createPromotion>[0]) => {
      const created = await createPromotion(promo);
      setPromotions((prev) => [created, ...prev]);
    },
    []
  );

  return {
    orders,
    promotions,
    analytics,
    isLoading,
    error,
    refetch: load,
    addPromotion,
  };
}
