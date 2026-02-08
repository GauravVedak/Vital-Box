"use client";

import { useState, useMemo, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  LogOut,
  TrendingUp,
  Weight,
  Target,
  Home,
  X,
  Save,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type PanelSection = "body-stats";
type PanelForm = "body" | "goal";

type BodyStatsForm = {
  weight: string;
  weightUnit: "kg" | "lb";
};

export function UserPanel() {
  const { user, logout, refreshUser } = useAuth();
  const [activeSection, setActiveSection] =
    useState<PanelSection>("body-stats");
  const [isStatsFormOpen, setIsStatsFormOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<PanelForm>("body");
  const [bodyStatsForm, setBodyStatsForm] = useState<BodyStatsForm>({
    weight: "",
    weightUnit: "kg",
  });
  const [goalWeightInput, setGoalWeightInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read from user.fitnessMetrics - NO local state overrides
  const bmiHistory = user?.fitnessMetrics?.bmiHistory ?? [];
  const latestBMI = user?.fitnessMetrics?.latestBMI;
  const goalWeight = user?.fitnessMetrics?.goalWeight ?? null;
  const savedHeight = user?.fitnessMetrics?.height ?? 0;
  const savedHeightUnit = user?.fitnessMetrics?.unit ?? "metric";

  // Compute chart data from bmiHistory
  const chartData = useMemo(() => {
    if (bmiHistory.length === 0) return [];

    const sorted = [...bmiHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((entry) => {
      const d = new Date(entry.date);
      const dateLabel = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return {
        date: dateLabel,
        fullDate: d.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        weight: entry.weight,
        bmi: entry.value,
        goalWeight: goalWeight ?? null,
        timestamp: d.getTime(),
      };
    });
  }, [bmiHistory, goalWeight]);

  const currentWeight = chartData[chartData.length - 1]?.weight ?? 0;
  const startWeight = chartData[0]?.weight ?? 0;

  const progressRange = goalWeight ? Math.abs(startWeight - goalWeight) : 0;
  const currentProgress = goalWeight ? Math.abs(startWeight - currentWeight) : 0;
  const weightProgress =
    progressRange === 0
      ? 0
      : Math.max(0, Math.min(100, (currentProgress / progressRange) * 100));

  // Pie chart data - simplified
  const pieData = useMemo(() => {
    if (!goalWeight || currentWeight === 0 || startWeight === 0) return [];

    const achieved = currentProgress;
    const remaining = Math.abs(currentWeight - goalWeight);

    return [
      { name: "Achieved", value: achieved, color: "#10b981" },
      { name: "Remaining", value: remaining, color: "#e5e7eb" },
    ];
  }, [currentWeight, startWeight, goalWeight, currentProgress]);

  const minBMI = chartData.length > 0 ? Math.min(...chartData.map((p) => p.bmi)) : 0;
  const maxBMI = chartData.length > 0 ? Math.max(...chartData.map((p) => p.bmi)) : 0;

  const handleLogout = () => {
    logout();
    window.location.hash = "#home";
  };

  const handleBackToHome = () => {
    window.location.hash = "#home";
  };

  const handleOpenBodyStatsForm = () => {
    setActiveForm("body");
    setBodyStatsForm({
      weight: currentWeight.toString(),
      weightUnit: "kg",
    });
    setIsStatsFormOpen(true);
  };

  const handleOpenGoalWeightForm = () => {
    setActiveForm("goal");
    setGoalWeightInput(goalWeight ? goalWeight.toString() : "");
    setIsStatsFormOpen(true);
  };

  const handleCloseStatsForm = () => {
    setIsStatsFormOpen(false);
  };

  const handleBodyStatsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const rawWeight = Number(bodyStatsForm.weight);

    if (Number.isNaN(rawWeight) || rawWeight <= 0 || !savedHeight) {
      setIsSubmitting(false);
      return;
    }

    const nextWeightKg =
      bodyStatsForm.weightUnit === "lb" ? rawWeight * 0.453592 : rawWeight;
    const nextHeightMeters =
      savedHeightUnit === "imperial" ? savedHeight * 0.3048 : savedHeight / 100;

    const nextBmi =
      nextHeightMeters > 0
        ? nextWeightKg / (nextHeightMeters * nextHeightMeters)
        : 0;

    let category = "Normal Weight";
    if (nextBmi < 18.5) category = "Underweight";
    else if (nextBmi >= 25 && nextBmi < 30) category = "Overweight";
    else if (nextBmi >= 30) category = "Obese";

    const now = new Date().toISOString();
    const entry = {
      value: Math.round(nextBmi * 10) / 10,
      category,
      height: savedHeight,
      weight: Number(nextWeightKg.toFixed(1)),
      unit: savedHeightUnit,
      date: now,
    };

    const res = await fetch("/api/user/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        latestBMI: entry,
        height: savedHeight,
        weight: Number(nextWeightKg.toFixed(1)),
        unit: savedHeightUnit,
        bmiHistoryEntry: entry,
      }),
    });

    if (res.ok) {
      setIsStatsFormOpen(false);
      await refreshUser();
    }
    setIsSubmitting(false);
  };

  const handleGoalWeightSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const nextGoalWeight = Number(goalWeightInput);
    if (Number.isNaN(nextGoalWeight) || nextGoalWeight <= 0) {
      setIsSubmitting(false);
      return;
    }

    const res = await fetch("/api/user/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        goalWeight: nextGoalWeight,
      }),
    });

    if (res.ok) {
      setIsStatsFormOpen(false);
      await refreshUser();
    }
    setIsSubmitting(false);
  };

  // Custom dot renderer for recorded entries
  const CustomDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth={2}
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
        />
        <circle cx={cx} cy={cy} r={3} fill="#ffffff" />
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-200 rounded-xl p-3 shadow-lg">
          <p className="text-xs font-semibold text-emerald-900 mb-1">
            {data.fullDate}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-bold text-emerald-600">{data.weight} kg</span>
          </p>
          {goalWeight && (
            <p className="text-xs text-orange-600 mt-1">Goal: {goalWeight} kg</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-emerald-50/40 to-white overflow-x-hidden">
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar Navigation (desktop-first) */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Health Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">{user?.name}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <motion.button
              onClick={handleBackToHome}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back To Home</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveSection("body-stats")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Body Stats</span>
            </motion.button>
          </nav>

          <div className="p-4 border-t border-gray-200">
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="relative max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Body Stats</h1>
                <p className="text-gray-600 mt-2">
                  Track your weight and BMI progress over time
                  {user?.fitnessMetrics?.lastCalculated && (
                    <>
                      {" · Last updated "}
                      {new Date(
                        user.fitnessMetrics.lastCalculated
                      ).toLocaleString()}
                    </>
                  )}
                </p>
              </div>
              {latestBMI && (
                <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold text-sm">
                    {latestBMI.value.toFixed(1)}
                  </div>
                  <div className="text-xs leading-snug">
                    <p className="font-semibold text-gray-800">
                      BMI • {latestBMI.category}
                    </p>
                    <p className="text-gray-600">
                      {latestBMI.weight}kg ·{" "}
                      {latestBMI.height}
                      {latestBMI.unit === "metric" ? "cm" : "in"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* If no BMI data yet, show guidance */}
            {bmiHistory.length === 0 && !latestBMI && (
              <Card className="border-dashed border-emerald-300 bg-emerald-50/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Start tracking your health
                  </CardTitle>
                  <CardDescription>
                    Calculate your BMI once to unlock trend graphs and goal
                    tracking.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => {
                      window.location.hash = "#bmi";
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow hover:shadow-md transition"
                  >
                    Go to BMI Calculator
                  </button>
                </CardContent>
              </Card>
            )}

            {/* Goal Weight Progress - SIMPLIFIED PIE CHART */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Goal Weight Progress
                </CardTitle>
                <CardDescription>
                  {goalWeight
                    ? `From ${startWeight}kg to ${goalWeight}kg`
                    : "Set a target and start logging your weight"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-end">
                  <motion.button
                    onClick={handleOpenGoalWeightForm}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {goalWeight ? "Update" : "Set"} Goal Weight
                  </motion.button>
                </div>
                {goalWeight && currentWeight > 0 && startWeight > 0 && (
                  <div className="flex items-center justify-center gap-12">
                    {/* Simplified Pie Chart */}
                    <div className="relative">
                      <ResponsiveContainer width={300} height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-bold text-emerald-600">
                          {Math.round(weightProgress)}%
                        </span>
                        <span className="text-sm text-gray-600 mt-1">
                          Complete
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Starting Weight</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {startWeight} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Weight</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {currentWeight} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Goal Weight</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {goalWeight} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-xl font-bold text-gray-700">
                          {Math.abs(currentWeight - goalWeight).toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!goalWeight && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Set a goal weight to track your progress.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Weight Timeline - Calendar-style Graph with Dots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Weight className="w-5 h-5 text-emerald-600" />
                  Weight Timeline
                </CardTitle>
                <CardDescription>
                  Your weight journey with recorded measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-end">
                  <motion.button
                    onClick={handleOpenBodyStatsForm}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Log New Entry
                  </motion.button>
                </div>
                {chartData.length === 0 ? (
                  <div className="h-96 flex items-center justify-center text-gray-500 text-sm">
                    No history yet. Calculate your BMI to start tracking.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={{ stroke: "#d1d5db" }}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={{ stroke: "#d1d5db" }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip content={<CustomTooltip />} />

                      {/* Goal weight reference line */}
                      {goalWeight && (
                        <ReferenceLine
                          y={goalWeight}
                          stroke="#f97316"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: `Goal: ${goalWeight} kg`,
                            position: "right",
                            fill: "#f97316",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        />
                      )}

                      {/* Area fill */}
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorWeight)"
                        dot={<CustomDot />}
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* BMI History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  BMI History
                </CardTitle>
                <CardDescription>
                  Your BMI progression over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-xs text-gray-600">
                  <span>
                    Min BMI: <strong>{minBMI ? minBMI.toFixed(1) : "-"}</strong>
                  </span>
                  <span>
                    Max BMI: <strong>{maxBMI ? maxBMI.toFixed(1) : "-"}</strong>
                  </span>
                </div>
                {chartData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-gray-500 text-sm">
                    No BMI history yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={{ stroke: "#d1d5db" }}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={{ stroke: "#d1d5db" }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="bmi"
                        stroke="#14b8a6"
                        strokeWidth={3}
                        fill="url(#colorBmi)"
                        dot={{ fill: "#14b8a6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Side drawer for forms */}
            <AnimatePresence>
              {isStatsFormOpen && (
                <div className="fixed inset-0 z-40 flex justify-end">
                  <div
                    className="flex-1 bg-black/40"
                    onClick={handleCloseStatsForm}
                  />
                  <motion.aside
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 28,
                    }}
                    className="w-full max-w-sm h-full bg-white shadow-xl border-l border-gray-200 flex flex-col"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          {activeForm === "body"
                            ? "Log New Weight Entry"
                            : "Set Goal Weight"}
                        </h2>
                        <p className="text-xs text-gray-600">
                          {activeForm === "body"
                            ? "Enter your current weight."
                            : "Set the target you'd like to reach."}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseStatsForm}
                        className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                      {activeForm === "body" ? (
                        <form
                          className="space-y-5"
                          onSubmit={handleBodyStatsSubmit}
                        >
                          {savedHeight > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                              <p className="text-xs text-emerald-700">
                                <strong>Using saved height:</strong> {savedHeight}
                                {savedHeightUnit === "metric" ? "cm" : "ft"}
                              </p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Weight
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                required
                                value={bodyStatsForm.weight}
                                onChange={(event) =>
                                  setBodyStatsForm((prev) => ({
                                    ...prev,
                                    weight: event.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Enter weight"
                              />
                              <select
                                value={bodyStatsForm.weightUnit}
                                onChange={(event) =>
                                  setBodyStatsForm((prev) => ({
                                    ...prev,
                                    weightUnit: event.target
                                      .value as BodyStatsForm["weightUnit"],
                                  }))
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                              >
                                <option value="kg">kg</option>
                                <option value="lb">lb</option>
                              </select>
                            </div>
                          </div>

                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save Entry
                              </>
                            )}
                          </motion.button>
                        </form>
                      ) : (
                        <form
                          className="space-y-5"
                          onSubmit={handleGoalWeightSubmit}
                        >
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Goal Weight (kg)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              required
                              value={goalWeightInput}
                              onChange={(event) =>
                                setGoalWeightInput(event.target.value)
                              }
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                              placeholder="Enter your goal weight"
                            />
                          </div>
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4" />
                                Set Goal Weight
                              </>
                            )}
                          </motion.button>
                        </form>
                      )}
                    </div>
                  </motion.aside>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}