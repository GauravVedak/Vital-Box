/**
 * Subscriptions Section View
 *
 * Displays monthly subscription mix: stacked bar chart and summary stats
 * (top plan, yearly growth, plan diversity).
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { SubscriptionMonth } from "../../../lib/admin/types";

interface SubscriptionsSectionViewProps {
  subscriptionData: SubscriptionMonth[];
}

export function SubscriptionsSectionView({
  subscriptionData,
}: SubscriptionsSectionViewProps) {
  return (
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
  );
}
