/**
 * Membership Section View
 *
 * Displays monthly membership purchases, filtered table, ongoing orders,
 * and recent orders. Owns its own filter and search state.
 */

import { useMemo, useState } from "react";
import { CalendarCheck, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { STATUS_STYLES } from "../constants";
import type { MembershipMonth, Order } from "../../../lib/admin/types";

interface MembershipSectionViewProps {
  membershipData: MembershipMonth[];
  orders: Order[];
}

const MAX_ORDERS_DISPLAYED = 10;

export function MembershipSectionView({
  membershipData,
  orders,
}: MembershipSectionViewProps) {
  const [membershipMonthFilter, setMembershipMonthFilter] =
    useState<string>("all");
  const [membershipYearFilter, setMembershipYearFilter] =
    useState<string>("all");
  const [ongoingSearch, setOngoingSearch] = useState("");
  const [recentSearch, setRecentSearch] = useState("");

  const ongoingOrders = useMemo(
    () => orders.filter((o) => o.status === "Ongoing"),
    [orders],
  );
  const recentOrders = useMemo(
    () => orders.filter((o) => o.status !== "Ongoing"),
    [orders],
  );

  const membershipTotals = membershipData.reduce(
    (t, e) => t + e.memberships,
    0,
  );
  const currentMemberships =
    membershipData[membershipData.length - 1]?.memberships ?? 0;
  const previousMemberships =
    membershipData[membershipData.length - 2]?.memberships ?? 0;
  const membershipChange =
    previousMemberships > 0
      ? ((currentMemberships - previousMemberships) / previousMemberships) * 100
      : 0;

  const latestMembershipEntry = membershipData[membershipData.length - 1];
  const monthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].indexOf(latestMembershipEntry?.month ?? "");
  const latestMonthLabel = latestMembershipEntry
    ? new Date(
        latestMembershipEntry.year ?? new Date().getFullYear(),
        monthIndex >= 0 ? monthIndex : 0,
        1,
      ).toLocaleString("default", { month: "long" })
    : "—";

  const filteredMembershipTableData = useMemo(() => {
    return membershipData.filter((row) => {
      const matchMonth =
        membershipMonthFilter === "all" || row.month === membershipMonthFilter;
      const matchYear =
        membershipYearFilter === "all" ||
        String(row.year ?? "") === membershipYearFilter;
      return matchMonth && matchYear;
    });
  }, [membershipData, membershipMonthFilter, membershipYearFilter]);

  const membershipYears = useMemo(
    () =>
      Array.from(
        new Set(
          membershipData.map((r) => String(r.year ?? "")).filter(Boolean),
        ),
      ).sort((a, b) => b.localeCompare(a)),
    [membershipData],
  );

  const filteredOngoingOrders = useMemo(() => {
    const q = ongoingSearch.trim().toLowerCase();
    if (!q) return ongoingOrders;
    return ongoingOrders.filter((o) =>
      [o.id, o.customer, o.subscription, o.status, o.startDate]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [ongoingOrders, ongoingSearch]);

  const filteredRecentOrders = useMemo(() => {
    const q = recentSearch.trim().toLowerCase();
    if (!q) return recentOrders;
    return recentOrders.filter((o) =>
      [o.id, o.customer, o.subscription, o.status, o.orderDate]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [recentOrders, recentSearch]);

  const displayedOngoingOrders = useMemo(
    () => filteredOngoingOrders.slice(0, MAX_ORDERS_DISPLAYED),
    [filteredOngoingOrders],
  );
  const displayedRecentOrders = useMemo(
    () => filteredRecentOrders.slice(0, MAX_ORDERS_DISPLAYED),
    [filteredRecentOrders],
  );

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
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
            <CardDescription>
              Memberships sold in {latestMonthLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {currentMemberships}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {latestMembershipEntry
                ? `${latestMonthLabel} ${latestMembershipEntry.year}`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Monthly Purchases by Month</CardTitle>
              <CardDescription>
                Memberships bought each month — filter by month or year
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl bg-slate-50 pl-12 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Filter
              </span>
              <div className="h-6 w-px bg-slate-200" aria-hidden />
              <div className="flex items-center gap-2">
                <label
                  htmlFor="membership-month-filter"
                  className="text-sm font-medium text-slate-600"
                >
                  Month
                </label>
                <div className="relative">
                  <select
                    id="membership-month-filter"
                    value={membershipMonthFilter}
                    onChange={(e) =>
                      setMembershipMonthFilter(e.target.value)
                    }
                    className="h-9 w-[140px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  >
                    <option value="all" className="px-4">
                      All months
                    </option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="membership-year-filter"
                  className="text-sm font-medium text-slate-600"
                >
                  Year
                </label>
                <div className="relative">
                  <select
                    id="membership-year-filter"
                    value={membershipYearFilter}
                    onChange={(e) =>
                      setMembershipYearFilter(e.target.value)
                    }
                    className="h-9 w-[110px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  >
                    <option value="all">All years</option>
                    {membershipYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">
                  Memberships sold
                </TableHead>
                <TableHead className="text-right">% of total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembershipTableData.map((row) => (
                <TableRow key={`${row.month}-${row.year ?? ""}`}>
                  <TableCell className="font-medium">
                    {row.month}
                  </TableCell>
                  <TableCell>{row.year ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {row.memberships}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {membershipTotals > 0
                      ? (
                          (row.memberships / membershipTotals) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembershipTableData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-slate-500"
                  >
                    No data for the selected month/year.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
              <Input
                value={ongoingSearch}
                onChange={(event) =>
                  setOngoingSearch(event.target.value)
                }
                placeholder="Search ongoing orders..."
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
                {displayedOngoingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="capitalize">
                      {order.subscription}
                    </TableCell>
                    <TableCell>{order.startDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[order.status]}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOngoingOrders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-500"
                    >
                      No ongoing orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {filteredOngoingOrders.length > MAX_ORDERS_DISPLAYED && (
              <p className="mt-2 text-center text-sm text-slate-500">
                Showing first {MAX_ORDERS_DISPLAYED} of{" "}
                {filteredOngoingOrders.length} orders. Use search to
                narrow results.
              </p>
            )}
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
              <Input
                value={recentSearch}
                onChange={(event) =>
                  setRecentSearch(event.target.value)
                }
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
                {displayedRecentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="capitalize">
                      {order.subscription}
                    </TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[order.status]}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecentOrders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-500"
                    >
                      No recent orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {filteredRecentOrders.length > MAX_ORDERS_DISPLAYED && (
              <p className="mt-2 text-center text-sm text-slate-500">
                Showing first {MAX_ORDERS_DISPLAYED} of{" "}
                {filteredRecentOrders.length} orders. Use search to
                narrow results.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
