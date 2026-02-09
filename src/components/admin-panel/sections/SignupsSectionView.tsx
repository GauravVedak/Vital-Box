/**
 * Signups Section View
 *
 * Displays monthly user signup analytics: totals, latest month stats,
 * churn watch, and a line chart of signup growth.
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
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { SignupMonth } from "../../../lib/admin/types";

interface SignupsSectionViewProps {
  signupData: SignupMonth[];
}

export function SignupsSectionView({ signupData }: SignupsSectionViewProps) {
  const signupTotals = signupData.reduce((t, e) => t + e.signups, 0);
  const currentSignups = signupData[signupData.length - 1]?.signups ?? 0;
  const previousSignups = signupData[signupData.length - 2]?.signups ?? 0;
  const signupChange =
    previousSignups > 0
      ? ((currentSignups - previousSignups) / previousSignups) * 100
      : 0;

  return (
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
  );
}
