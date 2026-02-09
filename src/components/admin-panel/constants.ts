import type { AdminSection, PromotionStatus } from "../../lib/admin/types";
import { Users, PackageCheck, LineChart, BadgePercent } from "lucide-react";

export const STATUS_STYLES: Record<string, string> = {
  Ongoing: "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pending: "border-blue-200 bg-blue-50 text-blue-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

export const PROMOTION_STATUS_STYLES: Record<PromotionStatus, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  Expired: "border-slate-200 bg-slate-50 text-slate-600",
};

export const NAVIGATION_ITEMS: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "signups", label: "Monthly Signups", icon: Users },
  { id: "membership", label: "Membership Purchases", icon: PackageCheck },
  { id: "subscriptions", label: "Subscription Mix", icon: LineChart },
  { id: "promotions", label: "Promotions", icon: BadgePercent },
];
