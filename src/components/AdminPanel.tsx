import { useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgePercent,
  CalendarCheck,
  ClipboardList,
  Home,
  LineChart,
  LogOut,
  PackageCheck,
  Search,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type AdminSection = "signups" | "membership" | "subscriptions" | "promotions";

type PromotionStatus = "Active" | "Scheduled" | "Expired";
type Promotion = {
  id: string;
  name: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
};

const signupData = [
  { month: "Jan", signups: 120 },
  { month: "Feb", signups: 154 },
  { month: "Mar", signups: 190 },
  { month: "Apr", signups: 175 },
  { month: "May", signups: 210 },
  { month: "Jun", signups: 245 },
];

const membershipData = [
  { month: "Jan", memberships: 88 },
  { month: "Feb", memberships: 102 },
  { month: "Mar", memberships: 128 },
  { month: "Apr", memberships: 120 },
  { month: "May", memberships: 146 },
  { month: "Jun", memberships: 165 },
];

const subscriptionData = [
  { month: "Jan", threeMonth: 32, sixMonth: 38, yearly: 18 },
  { month: "Feb", threeMonth: 40, sixMonth: 44, yearly: 20 },
  { month: "Mar", threeMonth: 45, sixMonth: 52, yearly: 24 },
  { month: "Apr", threeMonth: 41, sixMonth: 50, yearly: 29 },
  { month: "May", threeMonth: 48, sixMonth: 60, yearly: 32 },
  { month: "Jun", threeMonth: 52, sixMonth: 68, yearly: 38 },
];

const initialPromotions: Promotion[] = [
  {
    id: "promo-1",
    name: "Spring Reset",
    code: "SPRING15",
    discountType: "percent",
    discountValue: 15,
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    status: "Active",
  },
  {
    id: "promo-2",
    name: "New Member Boost",
    code: "NEW25",
    discountType: "percent",
    discountValue: 25,
    startDate: "2026-02-10",
    endDate: "2026-04-15",
    status: "Active",
  },
  {
    id: "promo-3",
    name: "Summer Annual",
    code: "YEAR20",
    discountType: "percent",
    discountValue: 20,
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    status: "Scheduled",
  },
];

const ongoingOrders = [
  {
    id: "ORD-1009",
    customer: "Mia Diaz",
    subscription: "6-month",
    status: "Ongoing",
    amount: 179,
    startDate: "2026-01-05",
  },
  {
    id: "ORD-1014",
    customer: "Noah Kim",
    subscription: "yearly",
    status: "Ongoing",
    amount: 299,
    startDate: "2026-01-09",
  },
  {
    id: "ORD-1021",
    customer: "Ava Patel",
    subscription: "3-month",
    status: "Ongoing",
    amount: 99,
    startDate: "2026-01-12",
  },
  {
    id: "ORD-1028",
    customer: "Jamal Green",
    subscription: "6-month",
    status: "Ongoing",
    amount: 179,
    startDate: "2026-01-18",
  },
  {
    id: "ORD-1035",
    customer: "Sofia Torres",
    subscription: "yearly",
    status: "Ongoing",
    amount: 299,
    startDate: "2026-01-20",
  },
];

const recentOrders = [
  {
    id: "ORD-1039",
    customer: "Oliver Park",
    subscription: "3-month",
    status: "Completed",
    amount: 99,
    orderDate: "2026-01-21",
  },
  {
    id: "ORD-1041",
    customer: "Liam Chen",
    subscription: "6-month",
    status: "Completed",
    amount: 179,
    orderDate: "2026-01-22",
  },
  {
    id: "ORD-1043",
    customer: "Harper Lee",
    subscription: "yearly",
    status: "Completed",
    amount: 299,
    orderDate: "2026-01-22",
  },
  {
    id: "ORD-1048",
    customer: "Grace Singh",
    subscription: "3-month",
    status: "Pending",
    amount: 99,
    orderDate: "2026-01-23",
  },
  {
    id: "ORD-1050",
    customer: "Ethan Ross",
    subscription: "6-month",
    status: "Completed",
    amount: 179,
    orderDate: "2026-01-24",
  },
];

const statusStyles: Record<string, string> = {
  Ongoing: "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pending: "border-blue-200 bg-blue-50 text-blue-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const promotionStatusStyles: Record<PromotionStatus, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  Expired: "border-slate-200 bg-slate-50 text-slate-600",
};

const navigationItems = [
  {
    id: "signups" as AdminSection,
    label: "Monthly Signups",
    icon: Users,
  },
  {
    id: "membership" as AdminSection,
    label: "Membership Purchases",
    icon: PackageCheck,
  },
  {
    id: "subscriptions" as AdminSection,
    label: "Subscription Mix",
    icon: LineChart,
  },
  {
    id: "promotions" as AdminSection,
    label: "Promotions",
    icon: BadgePercent,
  },
];

export function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("signups");
  const [promotionFormOpen, setPromotionFormOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [promotionForm, setPromotionForm] = useState({
    name: "",
    code: "",
    discountType: "percent" as Promotion["discountType"],
    discountValue: "",
    startDate: "",
    endDate: "",
  });
  const [ongoingSearch, setOngoingSearch] = useState("");
  const [recentSearch, setRecentSearch] = useState("");

  const signupTotals = signupData.reduce((total, entry) => total + entry.signups, 0);
  const currentSignups = signupData[signupData.length - 1]?.signups ?? 0;
  const previousSignups = signupData[signupData.length - 2]?.signups ?? 0;
  const signupChange =
    previousSignups > 0
      ? ((currentSignups - previousSignups) / previousSignups) * 100
      : 0;

  const membershipTotals = membershipData.reduce(
    (total, entry) => total + entry.memberships,
    0
  );
  const currentMemberships =
    membershipData[membershipData.length - 1]?.memberships ?? 0;
  const previousMemberships =
    membershipData[membershipData.length - 2]?.memberships ?? 0;
  const membershipChange =
    previousMemberships > 0
      ? ((currentMemberships - previousMemberships) / previousMemberships) * 100
      : 0;

  const filteredOngoingOrders = useMemo(() => {
    const query = ongoingSearch.trim().toLowerCase();
    if (!query) {
      return ongoingOrders;
    }
    return ongoingOrders.filter((order) =>
      [
        order.id,
        order.customer,
        order.subscription,
        order.status,
        order.startDate,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [ongoingSearch]);

  const filteredRecentOrders = useMemo(() => {
    const query = recentSearch.trim().toLowerCase();
    if (!query) {
      return recentOrders;
    }
    return recentOrders.filter((order) =>
      [order.id, order.customer, order.subscription, order.status, order.orderDate]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [recentSearch]);

  const activePromotions = promotions.filter((promo) => promo.status === "Active");

  const handleBackToHome = () => {
    window.location.hash = "#home";
  };

  const handleLogout = () => {
    logout();
    window.location.hash = "#home";
  };

  const handleCreatePromotion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCode = promotionForm.code.trim().toUpperCase();
    const discountValue = Number(promotionForm.discountValue);
    if (!promotionForm.name.trim() || !trimmedCode || Number.isNaN(discountValue)) {
      return;
    }
    const nextPromotion: Promotion = {
      id: `promo-${promotions.length + 1}`,
      name: promotionForm.name.trim(),
      code: trimmedCode,
      discountType: promotionForm.discountType,
      discountValue: discountValue,
      startDate: promotionForm.startDate || "2026-01-25",
      endDate: promotionForm.endDate || "2026-02-28",
      status: "Scheduled",
    };
    setPromotions((prev) => [nextPromotion, ...prev]);
    setPromotionFormOpen(false);
    setPromotionForm({
      name: "",
      code: "",
      discountType: "percent",
      discountValue: "",
      startDate: "",
      endDate: "",
    });
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </motion.button>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </motion.button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {activeSection === "signups" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Monthly User Signups
                </h1>
                <p className="text-slate-600 mt-2">
                  Track user growth trends and monthly momentum.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Signups</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">
                      {signupTotals}
                    </p>
                    <p className="text-sm text-emerald-600 mt-2">
                      +{signupChange.toFixed(1)}% vs last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Month</CardTitle>
                    <CardDescription>New signups this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">
                      {currentSignups}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">June 2026</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Churn Watch</CardTitle>
                    <CardDescription>Weekly retention risk</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">3.2%</p>
                    <p className="text-sm text-amber-600 mt-2">
                      Stable compared to last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Signup Growth</CardTitle>
                  <CardDescription>Monthly new user signups</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      signups: { label: "Signups", color: "#10b981" },
                    }}
                    className="h-[320px] w-full"
                  >
                    <RechartsLineChart data={signupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="signups"
                        stroke="var(--color-signups)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </RechartsLineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === "membership" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Monthly Membership Purchases
                </h1>
                <p className="text-slate-600 mt-2">
                  Monitor membership revenue and active orders.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Purchases</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">
                      {membershipTotals}
                    </p>
                    <p className="text-sm text-emerald-600 mt-2">
                      +{membershipChange.toFixed(1)}% vs last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Month</CardTitle>
                    <CardDescription>Memberships sold in June</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">
                      {currentMemberships}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">June 2026</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Projection</CardTitle>
                    <CardDescription>Estimated monthly revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">$42.8K</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Based on current orders
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Purchases</CardTitle>
                  <CardDescription>Memberships bought each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      memberships: { label: "Memberships", color: "#0ea5e9" },
                    }}
                    className="h-[320px] w-full"
                  >
                    <BarChart data={membershipData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="memberships"
                        fill="var(--color-memberships)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Ongoing Orders</CardTitle>
                        <CardDescription>
                          Orders currently in progress
                        </CardDescription>
                      </div>
                      <ClipboardList className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={ongoingSearch}
                        onChange={(event) => setOngoingSearch(event.target.value)}
                        placeholder="Search ongoing orders..."
                        className="pl-9"
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Start</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOngoingOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="capitalize">
                              {order.subscription}
                            </TableCell>
                            <TableCell>{order.startDate}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statusStyles[order.status]}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredOngoingOrders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-slate-500">
                              No ongoing orders found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                          Latest completed and pending orders
                        </CardDescription>
                      </div>
                      <CalendarCheck className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={recentSearch}
                        onChange={(event) => setRecentSearch(event.target.value)}
                        placeholder="Search recent orders..."
                        className="pl-9"
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="capitalize">
                              {order.subscription}
                            </TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statusStyles[order.status]}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredRecentOrders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-slate-500">
                              No recent orders found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {activeSection === "subscriptions" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Monthly Subscription Mix
                </h1>
                <p className="text-slate-600 mt-2">
                  See which subscription types your customers choose.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Type Breakdown</CardTitle>
                  <CardDescription>
                    3-month vs 6-month vs yearly memberships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      threeMonth: { label: "3-month", color: "#34d399" },
                      sixMonth: { label: "6-month", color: "#22d3ee" },
                      yearly: { label: "Yearly", color: "#38bdf8" },
                    }}
                    className="h-[340px] w-full"
                  >
                    <BarChart data={subscriptionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="threeMonth"
                        stackId="total"
                        fill="var(--color-threeMonth)"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="sixMonth"
                        stackId="total"
                        fill="var(--color-sixMonth)"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="yearly"
                        stackId="total"
                        fill="var(--color-yearly)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Plan</CardTitle>
                    <CardDescription>Most chosen in June</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900">6-month</p>
                    <p className="text-sm text-slate-500 mt-2">68 subscriptions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Yearly Growth</CardTitle>
                    <CardDescription>Yearly plan momentum</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900">+22%</p>
                    <p className="text-sm text-slate-500 mt-2">Since last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Diversity</CardTitle>
                    <CardDescription>Mix of plan types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900">Balanced</p>
                    <p className="text-sm text-slate-500 mt-2">
                      All tiers performing well
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {activeSection === "promotions" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Current Promotions
                </h1>
                <p className="text-slate-600 mt-2">
                  Create and manage discounts for customer checkout.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Running Promotions</CardTitle>
                        <CardDescription>
                          Active discounts live for customers
                        </CardDescription>
                      </div>
                      <Tag className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activePromotions.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                        No active promotions yet.
                      </div>
                    )}
                    {activePromotions.map((promo) => (
                      <div
                        key={promo.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">
                              {promo.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              Code:{" "}
                              <span className="font-medium text-slate-900">
                                {promo.code}
                              </span>
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={promotionStatusStyles[promo.status]}
                          >
                            {promo.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>
                            Discount:{" "}
                            <strong className="text-slate-900">
                              {promo.discountType === "percent"
                                ? `${promo.discountValue}%`
                                : `$${promo.discountValue}`}
                            </strong>
                          </span>
                          <span>
                            Ends:{" "}
                            <strong className="text-slate-900">
                              {promo.endDate}
                            </strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Create Promotion</CardTitle>
                        <CardDescription>
                          Add a new discount for checkout
                        </CardDescription>
                      </div>
                      <motion.button
                        onClick={() => setPromotionFormOpen((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                        {promotionFormOpen ? "Hide Form" : "Create Promotion"}
                      </motion.button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {promotionFormOpen ? (
                      <form onSubmit={handleCreatePromotion} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Promotion Name
                          </label>
                          <Input
                            value={promotionForm.name}
                            onChange={(event) =>
                              setPromotionForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            placeholder="January Reset"
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Code
                            </label>
                            <Input
                              value={promotionForm.code}
                              onChange={(event) =>
                                setPromotionForm((prev) => ({
                                  ...prev,
                                  code: event.target.value,
                                }))
                              }
                              placeholder="RESET20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Discount Value
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={promotionForm.discountValue}
                              onChange={(event) =>
                                setPromotionForm((prev) => ({
                                  ...prev,
                                  discountValue: event.target.value,
                                }))
                              }
                              placeholder="20"
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Discount Type
                            </label>
                            <select
                              value={promotionForm.discountType}
                              onChange={(event) =>
                                setPromotionForm((prev) => ({
                                  ...prev,
                                  discountType:
                                    event.target.value as Promotion["discountType"],
                                }))
                              }
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            >
                              <option value="percent">Percent</option>
                              <option value="flat">Flat Amount</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Start Date
                            </label>
                            <Input
                              type="date"
                              value={promotionForm.startDate}
                              onChange={(event) =>
                                setPromotionForm((prev) => ({
                                  ...prev,
                                  startDate: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={promotionForm.endDate}
                            onChange={(event) =>
                              setPromotionForm((prev) => ({
                                ...prev,
                                endDate: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <motion.button
                          type="submit"
                          className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Save Promotion
                        </motion.button>
                      </form>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                        Click "Create Promotion" to add a new discount.
                      </div>
                    )}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-medium text-slate-900 mb-1">
                        Checkout integration
                      </p>
                      <p>
                        New promotions will be available at customer checkout once
                        connected to the pricing service.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Promotions</CardTitle>
                  <CardDescription>Every campaign and scheduled offer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell className="font-medium">{promo.name}</TableCell>
                          <TableCell>{promo.code}</TableCell>
                          <TableCell>
                            {promo.discountType === "percent"
                              ? `${promo.discountValue}%`
                              : `$${promo.discountValue}`}
                          </TableCell>
                          <TableCell>
                            {promo.startDate} - {promo.endDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={promotionStatusStyles[promo.status]}
                            >
                              {promo.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
