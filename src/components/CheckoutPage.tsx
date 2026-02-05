import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, BadgePercent, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import type { Product } from "./AIRecommendationEngine";

type Plan = {
  id: string;
  label: string;
  duration: string;
  highlight: string;
};

type Promo = {
  code: string;
  type: "percent" | "flat";
  value: number;
  label: string;
};

const plans: Plan[] = [
  {
    id: "three-month",
    label: "3 Months",
    duration: "12 weeks",
    highlight: "Flexible starter plan",
  },
  {
    id: "six-month",
    label: "6 Months",
    duration: "24 weeks",
    highlight: "Most popular plan",
  },
  {
    id: "yearly",
    label: "Yearly",
    duration: "12 months",
    highlight: "Best value for long term",
  },
];

const promoCatalog: Promo[] = [
  { code: "SPRING15", type: "percent", value: 15, label: "Spring Reset 15% off" },
  { code: "NEW25", type: "percent", value: 25, label: "New member boost 25% off" },
  { code: "YEAR20", type: "percent", value: 20, label: "Yearly special 20% off" },
];

type CartItem = {
  product: Product;
  quantity: number;
};

const CART_STORAGE_KEY = "vitalBoxCart";
const SHIPPING_BY_PLAN: Record<Plan["id"], number> = {
  "three-month": 10,
  "six-month": 5,
  yearly: 0,
};
const SERVICE_RATE = 0.1;
const TAX_RATE = 0.13;

export function CheckoutPage() {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[1].id);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return;
    }
    try {
      const parsed = JSON.parse(storedCart);
      if (Array.isArray(parsed)) {
        const sanitized = parsed.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.quantity === "number" &&
            item.product &&
            typeof item.product.id === "string"
        ) as CartItem[];
        setCartItems(sanitized);
      }
    } catch {
      // Ignore malformed storage data
    }
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0],
    [selectedPlanId]
  );

  const itemsSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const discount = useMemo(() => {
    if (!appliedPromo) {
      return 0;
    }
    if (appliedPromo.type === "percent") {
      return itemsSubtotal * (appliedPromo.value / 100);
    }
    return appliedPromo.value;
  }, [appliedPromo, itemsSubtotal]);

  const cappedDiscount = Math.min(discount, itemsSubtotal);
  const itemsSubtotalAfterDiscount = Math.max(0, itemsSubtotal - cappedDiscount);
  const shippingFee = SHIPPING_BY_PLAN[selectedPlan.id] ?? 0;
  const serviceFee = itemsSubtotalAfterDiscount * SERVICE_RATE;
  const taxableSubtotal = itemsSubtotalAfterDiscount + serviceFee + shippingFee;
  const tax = taxableSubtotal * TAX_RATE;
  const total = taxableSubtotal + tax;

  const handleApplyPromo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedCode = promoInput.trim().toUpperCase();
    if (!cleanedCode) {
      setPromoMessage({ type: "error", text: "Enter a promotion code to apply." });
      setAppliedPromo(null);
      return;
    }
    const match = promoCatalog.find((promo) => promo.code === cleanedCode);
    if (!match) {
      setPromoMessage({ type: "error", text: "That code is not active right now." });
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(match);
    setPromoMessage({ type: "success", text: `${match.label} applied.` });
  };

  const handleBackToPlans = () => {
    window.location.hash = "#choose-box";
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-gradient-to-b from-slate-50 via-white to-white flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center space-y-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.button
            onClick={handleBackToPlans}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 self-center"
            whileHover={{ x: -2 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Choose Box
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <BadgePercent className="h-3.5 w-3.5" />
              Checkout
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Complete your subscription
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose a subscription, apply a promotion, and confirm your checkout.
            </p>
          </motion.div>
        </div>

        <div className="grid w-full gap-6 lg:grid-cols-2">
          <div className="space-y-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Select your subscription</CardTitle>
                <CardDescription>
                  Pick the plan that matches your training rhythm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {plans.map((plan) => {
                    const isActive = selectedPlanId === plan.id;
                    return (
                      <motion.button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          isActive
                            ? "border-emerald-500 bg-emerald-50 shadow-lg"
                            : "border-slate-200 bg-white hover:border-emerald-300"
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            {plan.label}
                          </p>
                          {isActive && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-3">{plan.duration}</p>
                        <p className="text-sm text-slate-600 mt-3">{plan.highlight}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promotion code</CardTitle>
                <CardDescription>
                  Apply a discount if a campaign is running.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleApplyPromo} className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <BadgePercent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={promoInput}
                      onChange={(event) => setPromoInput(event.target.value)}
                      placeholder="Enter promotion code"
                      className="pl-9"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply
                  </motion.button>
                </form>
                {promoMessage && (
                  <p
                    className={`text-sm ${
                      promoMessage.type === "success"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
                {appliedPromo && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Applied code: <strong>{appliedPromo.code}</strong>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure checkout</CardTitle>
                <CardDescription>
                  Your payment is encrypted and protected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>PCI-compliant payment processing.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <span>Major cards and digital wallets supported.</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Order summary</CardTitle>
                <CardDescription>Review your total before checkout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Selected products
                    </p>
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-start justify-between text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{item.product.name}</p>
                          <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-slate-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    No products selected yet. Go back to Choose Box to add items.
                  </div>
                )}

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Items subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ${itemsSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Selected plan</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPlan.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Discount</span>
                    <span
                      className={`font-semibold ${
                        cappedDiscount > 0 ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      -${cappedDiscount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-slate-900">
                      ${shippingFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service fee (10%)</span>
                    <span className="font-semibold text-slate-900">
                      ${serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>HST/GST (13%)</span>
                    <span className="font-semibold text-slate-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-semibold text-slate-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <motion.button
                  type="button"
                  className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete checkout
                </motion.button>
                <p className="text-xs text-slate-500">
                  You can cancel or change your plan anytime in your dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Included in your plan</CardTitle>
                <CardDescription>Everything you get after checkout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Personalized supplement recommendations.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Monthly AI progress insights and updates.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Priority support from fitness advisors.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
