/** Shared types for admin panel data (orders, promotions, analytics) */

export type OrderStatus = "Ongoing" | "Completed" | "Pending" | "Cancelled";

export type PromotionStatus = "Active" | "Scheduled" | "Expired";

export interface Order {
  id: string;
  customer: string;
  customerId?: string | null;
  subscription: "3-month" | "6-month" | "yearly";
  status: OrderStatus;
  amount: number;
  startDate?: string | null;
  orderDate: string;
  promoCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupMonth {
  month: string;
  year?: number;
  signups: number;
}

export interface MembershipMonth {
  month: string;
  year?: number;
  memberships: number;
}

export interface SubscriptionMonth {
  month: string;
  year?: number;
  threeMonth: number;
  sixMonth: number;
  yearly: number;
}

export interface AdminAnalytics {
  signups: SignupMonth[];
  memberships: MembershipMonth[];
  subscriptions: SubscriptionMonth[];
}

export type AdminSection = "signups" | "membership" | "subscriptions" | "promotions";
