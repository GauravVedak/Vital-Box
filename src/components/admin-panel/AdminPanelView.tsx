/**
 * Admin Panel View
 *
 * This view is restricted to users with role "admin" and provides a dashboard for monitoring
 * signups, membership purchases, subscription mix, and promotions. Data flows from MongoDB
 * via /api/admin/* routes: orders and promotions from the Purchases database, and signup
 * analytics from the Users database. The useAdminData hook fetches all data on mount and
 * exposes refetch and addPromotion for live updates. The sidebar navigation switches
 * between four sections (signups, membership, subscriptions, promotions), each rendered
 * by a dedicated section view component for easier refactoring and maintenance.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Home, LogOut, Shield } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useAdminData } from "../../hooks/useAdminData";
import { NAVIGATION_ITEMS } from "./constants";
import {
  SignupsSectionView,
  MembershipSectionView,
  SubscriptionsSectionView,
  PromotionsSectionView,
} from "./sections";

export function AdminPanelView() {
  const { user, logout } = useAuth();
  const {
    orders,
    promotions,
    analytics,
    isLoading,
    error,
    refetch,
    addPromotion,
  } = useAdminData();

  const [activeSection, setActiveSection] = useState<"signups" | "membership" | "subscriptions" | "promotions">("signups");
  const [createPromoError, setCreatePromoError] = useState<string | null>(null);

  const signupData = analytics?.signups ?? [];
  const membershipData = analytics?.memberships ?? [];
  const subscriptionData = analytics?.subscriptions ?? [];

  const handleBackToHome = () => {
    window.location.hash = "#home";
  };

  const handleLogout = () => {
    logout();
    window.location.hash = "#home";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-6 border-b border-slate-200 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Admin Panel
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Welcome, {user?.name ?? "Admin"}
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Monitor growth, orders, and promotions in one place.
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <motion.button
              onClick={handleBackToHome}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </motion.button>
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </motion.button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {isLoading && (
            <div className="max-w-6xl mx-auto mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              Loading admin data…
            </div>
          )}
          {error && (
            <div className="max-w-6xl mx-auto mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-center justify-between">
              <p className="text-rose-700">{error}</p>
              <button
                onClick={refetch}
                className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-medium text-rose-800 hover:bg-rose-200"
              >
                Retry
              </button>
            </div>
          )}
          {createPromoError && (
            <div className="max-w-6xl mx-auto mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              {createPromoError}
            </div>
          )}
          {!isLoading && !error && (
            <>
              {activeSection === "signups" && (
                <SignupsSectionView signupData={signupData} />
              )}
              {activeSection === "membership" && (
                <MembershipSectionView
                  membershipData={membershipData}
                  orders={orders}
                />
              )}
              {activeSection === "subscriptions" && (
                <SubscriptionsSectionView
                  subscriptionData={subscriptionData}
                />
              )}
              {activeSection === "promotions" && (
                <PromotionsSectionView
                  promotions={promotions}
                  addPromotion={addPromotion}
                  onPromotionError={setCreatePromoError}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
