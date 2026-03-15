"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  LogOut,
  TrendingUp,
  Weight,
  Target,
  Home,
  Menu,
  X,
  Save,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import s from "./UserPanel.module.css";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type PanelForm = "body" | "goal";
type RangeKey  = "7d" | "30d" | "all";
type ToastState = { msg: string; type: "success" | "error" } | null;

type BodyStatsForm = { weight: string; weightUnit: "kg" | "lb" };

type ChartPoint = {
  date: string;
  fullDate: string;
  weight: number;
  bmi: number;
  goalWeight: number | null;
  timestamp: number;
};

type TooltipPayloadItem = { payload: ChartPoint };

type WeightTipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  goalWeight?: number | null;
};

type BMITipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
};

/* ─── Tooltip styles ─────────────────────────────────────────────────────── */
const tipBox: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8ed",
  borderRadius: "0.625rem",
  padding: "0.625rem 0.875rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.09)",
  fontFamily: "-apple-system, system-ui, sans-serif",
  minWidth: 136,
};

const WeightTooltip: React.FC<WeightTipProps> = ({ active, payload, goalWeight }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tipBox}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#aeaeb2", margin: "0 0 4px" }}>
        {d.fullDate}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#10b981", margin: 0 }}>
        {d.weight} kg
      </p>
      {goalWeight != null && (
        <p style={{ fontSize: 11, color: "#c2410c", margin: "3px 0 0", fontWeight: 500 }}>
          Goal: {goalWeight} kg
        </p>
      )}
    </div>
  );
};

const BMITooltip: React.FC<BMITipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tipBox}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#aeaeb2", margin: "0 0 4px" }}>
        {d.fullDate}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#14b8a6", margin: 0 }}>
        BMI {d.bmi.toFixed(1)}
      </p>
    </div>
  );
};

const CustomDot = ({ cx, cy }: { cx?: number; cy?: number }) => {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={4.5} fill="#10b981" stroke="#fff" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill="#fff" />
    </g>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function bmiCategoryBadge(cat?: string): string {
  if (cat === "Underweight")   return s.badgeBlue;
  if (cat === "Normal Weight") return s.badgeGreen;
  if (cat === "Overweight")    return s.badgeOrange;
  if (cat === "Obese")         return s.badgeRed;
  return s.badgeGray;
}

function bmiSegActive(cat?: string): [boolean, boolean, boolean, boolean] {
  return [
    cat === "Underweight",
    cat === "Normal Weight",
    cat === "Overweight",
    cat === "Obese",
  ];
}

function bmiFromBMI(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal Weight";
  if (bmi < 30)   return "Overweight";
  return "Obese";
}

function buildInsight(
  chartData: ChartPoint[],
  goalWeight: number | null,
  weightProgress: number,
  daysSinceLastEntry: number | null,
): string {
  if (!chartData.length) return "Calculate your BMI to begin tracking your health journey.";

  if (daysSinceLastEntry !== null && daysSinceLastEntry >= 14) {
    return `No new entries in ${daysSinceLastEntry} days — log your weight to keep your progress up to date.`;
  }

  if (chartData.length === 1) {
    return "You've logged your first entry. Log again after a few days to start seeing trends.";
  }

  const first = chartData[0].weight;
  const last  = chartData[chartData.length - 1].weight;
  const delta = last - first;
  const days  = Math.max(
    1,
    Math.round(
      (chartData[chartData.length - 1].timestamp - chartData[0].timestamp) / 86_400_000,
    ),
  );

  if (goalWeight && weightProgress >= 100) {
    return `Goal reached! You hit your target of ${goalWeight} kg. Consider setting a new goal.`;
  }

  if (goalWeight && weightProgress > 0) {
    const remaining = Math.abs(last - goalWeight).toFixed(1);
    return `You're ${Math.round(weightProgress)}% of the way to your goal — ${remaining} kg to go. Keep it up.`;
  }

  if (Math.abs(delta) < 0.5) {
    return `Your weight has been stable over the past ${days} day${days !== 1 ? "s" : ""}. Consistency is progress.`;
  }

  const sign = delta < 0 ? "lost" : "gained";
  const abs  = Math.abs(delta).toFixed(1);
  return `You've ${sign} ${abs} kg over ${days} day${days !== 1 ? "s" : ""}${goalWeight ? `, tracking toward your ${goalWeight} kg goal` : ""}.`;
}

function filterByRange(data: ChartPoint[], range: RangeKey): ChartPoint[] {
  if (range === "all") return data;
  const ms     = range === "7d" ? 7 * 86_400_000 : 30 * 86_400_000;
  const cutoff = Date.now() - ms;
  return data.filter((p) => p.timestamp >= cutoff);
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function RangeFilter({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (r: RangeKey) => void;
}) {
  return (
    <div className={s.rangeFilter}>
      {(["7d", "30d", "all"] as RangeKey[]).map((r) => (
        <button
          key={r}
          className={`${s.rangeBtn} ${value === r ? s.rangeBtnActive : ""}`}
          onClick={() => onChange(r)}
        >
          {r === "all" ? "All" : r}
        </button>
      ))}
    </div>
  );
}

function ChartHeader({
  icon,
  title,
  sub,
  range,
  onRange,
  action,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  range: RangeKey;
  onRange: (r: RangeKey) => void;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className={s.chartTopRow}>
      <div>
        <div className={s.sectionTitle}>
          {icon}
          {title}
        </div>
        <div className={s.sectionSub}>{sub}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {action && onAction && (
          <button className={s.sectionAction} onClick={onAction}>
            {action}
          </button>
        )}
        <RangeFilter value={range} onChange={onRange} />
      </div>
    </div>
  );
}

function DotTimeline({
  data,
  goalWeight,
}: {
  data: ChartPoint[];
  goalWeight: number | null;
}) {
  return (
    <div className={s.dotTimeline}>
      {[...data].reverse().map((pt, i) => (
        <div key={pt.timestamp} className={s.dotTimelineItem}>
          <div className={`${s.dotDot} ${i === 0 ? s.dotDotLatest : ""}`} />
          <div className={s.dotContent}>
            <div className={s.dotDate}>{pt.fullDate}</div>
            <div className={s.dotVals}>
              <div>
                <div className={s.dotVal}>{pt.weight} kg</div>
                <div className={s.dotValLabel}>Weight</div>
              </div>
              <div>
                <div className={s.dotVal}>{pt.bmi.toFixed(1)}</div>
                <div className={s.dotValLabel}>BMI</div>
              </div>
              {goalWeight && (
                <div>
                  <div className={s.dotVal} style={{ color: "#c2410c" }}>
                    {Math.abs(pt.weight - goalWeight).toFixed(1)} kg
                  </div>
                  <div className={s.dotValLabel}>From goal</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function UserPanel() {
  const { user, logout, refreshUser } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isStatsFormOpen,     setIsStatsFormOpen]     = useState(false);
  const [isDesktop,           setIsDesktop]           = useState(false);
  const [activeForm,          setActiveForm]          = useState<PanelForm>("body");
  const [weightRange,         setWeightRange]         = useState<RangeKey>("all");
  const [bmiRange,            setBmiRange]            = useState<RangeKey>("all");
  const [historyOpen,         setHistoryOpen]         = useState(false);
  const [toast,               setToast]               = useState<ToastState>(null);

  const [bodyStatsForm,   setBodyStatsForm]   = useState<BodyStatsForm>({ weight: "", weightUnit: "kg" });
  const [goalWeightInput, setGoalWeightInput] = useState("");
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  const adminNote       = user?.adminNote?.trim() ?? "";
  const bmiHistory      = useMemo(() => user?.fitnessMetrics?.bmiHistory ?? [], [user?.fitnessMetrics?.bmiHistory]);
  const latestBMI       = user?.fitnessMetrics?.latestBMI;
  const goalWeight      = user?.fitnessMetrics?.goalWeight ?? null;
  const savedHeight     = user?.fitnessMetrics?.height ?? 0;
  const savedHeightUnit = user?.fitnessMetrics?.unit ?? "metric";

  /* Responsive */
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Chart data ─────────────────────────────────────────────────────────── */
  const allChartData: ChartPoint[] = useMemo(() => {
    if (!bmiHistory.length) return [];
    return [...bmiHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => {
        const d = new Date(entry.date);
        return {
          date:      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          fullDate:  d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          weight:    entry.weight,
          bmi:       entry.value,
          goalWeight: goalWeight ?? null,
          timestamp:  d.getTime(),
        };
      });
  }, [bmiHistory, goalWeight]);

  const weightChartData = useMemo(() => filterByRange(allChartData, weightRange), [allChartData, weightRange]);
  const bmiChartData    = useMemo(() => filterByRange(allChartData, bmiRange),    [allChartData, bmiRange]);

  const currentWeight = allChartData[allChartData.length - 1]?.weight ?? 0;
  const startWeight   = allChartData[0]?.weight ?? 0;
  const minBMI = allChartData.length ? Math.min(...allChartData.map((p) => p.bmi)) : 0;
  const maxBMI = allChartData.length ? Math.max(...allChartData.map((p) => p.bmi)) : 0;

  const progressRange   = goalWeight ? Math.abs(startWeight - goalWeight) : 0;
  const currentProgress = goalWeight ? Math.abs(startWeight - currentWeight) : 0;
  const weightProgress  =
    progressRange === 0
      ? 0
      : Math.max(0, Math.min(100, (currentProgress / progressRange) * 100));

  const daysSinceLastEntry = useMemo(() => {
    if (!allChartData.length) return null;
    return Math.floor(
      (Date.now() - allChartData[allChartData.length - 1].timestamp) / 86_400_000,
    );
  }, [allChartData]);

  const insight = useMemo(
    () => buildInsight(allChartData, goalWeight, weightProgress, daysSinceLastEntry),
    [allChartData, goalWeight, weightProgress, daysSinceLastEntry],
  );

  const [under, normal, over, obese] = bmiSegActive(latestBMI?.category);

  /* ── Handlers ───────────────────────────────────────────────────────────── */
  const handleLogout     = () => { logout(); window.location.hash = "#home"; };
  const handleBackToHome = () => { setIsMobileSidebarOpen(false); window.location.hash = "#home"; };

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
  }, []);

  const openBodyForm = () => {
    setActiveForm("body");
    setBodyStatsForm({ weight: currentWeight > 0 ? currentWeight.toString() : "", weightUnit: "kg" });
    setIsStatsFormOpen(true);
  };

  const openGoalForm = () => {
    setActiveForm("goal");
    setGoalWeightInput(goalWeight ? goalWeight.toString() : "");
    setIsStatsFormOpen(true);
  };

  const handleBodySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const rawW = Number(bodyStatsForm.weight);
    if (isNaN(rawW) || rawW <= 0 || !savedHeight) {
      setIsSubmitting(false);
      return;
    }

    const wKg = bodyStatsForm.weightUnit === "lb" ? rawW * 0.453592 : rawW;
    const hM  = savedHeightUnit === "imperial" ? savedHeight * 0.3048 : savedHeight / 100;
    const bmi = hM > 0 ? wKg / (hM * hM) : 0;

    let category = "Normal Weight";
    if (bmi < 18.5)             category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30)         category = "Obese";

    const entry = {
      value:    Math.round(bmi * 10) / 10,
      category,
      height:   savedHeight,
      weight:   Number(wKg.toFixed(1)),
      unit:     savedHeightUnit,
      date:     new Date().toISOString(),
    };

    const res = await fetch("/api/user/metrics", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        latestBMI:       entry,
        height:          savedHeight,
        weight:          entry.weight,
        unit:            savedHeightUnit,
        bmiHistoryEntry: entry,
      }),
    });

    if (res.ok) {
      setIsStatsFormOpen(false);
      await refreshUser();
      showToast("Entry saved successfully", "success");
    } else {
      showToast("Failed to save entry", "error");
    }
    setIsSubmitting(false);
  };

  const handleGoalSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const gw = Number(goalWeightInput);
    if (isNaN(gw) || gw <= 0) {
      setIsSubmitting(false);
      return;
    }

    const res = await fetch("/api/user/metrics", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ goalWeight: gw }),
    });

    if (res.ok) {
      setIsStatsFormOpen(false);
      await refreshUser();
      showToast("Goal weight updated", "success");
    } else {
      showToast("Failed to update goal", "error");
    }
    setIsSubmitting(false);
  };

  /* ── Sidebar ────────────────────────────────────────────────────────────── */
  function SidebarContent() {
    return (
      <>
        <div className={s.sidebarHead}>
          <div className={s.sidebarBrand}>
            <span className={s.brandDot} />
            <span className={s.brandName}>Vital Box</span>
          </div>
          <div className={s.sidebarUser}>
            <div className={s.avatar}>{getInitials(user?.name)}</div>
            <div>
              <div className={s.userName}>{user?.name ?? "User"}</div>
              <div className={s.userRole}>Member</div>
            </div>
          </div>
        </div>

        <nav className={s.sidebarNav}>
          <div className={s.navSection}>Navigation</div>
          <button className={s.navBtn} onClick={handleBackToHome}>
            <Home size={14} />
            Back to Home
          </button>
          <button
            className={`${s.navBtn} ${s.navBtnActive}`}
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <Activity size={14} />
            Body Stats
          </button>
          <div className={s.navSection} style={{ marginTop: "0.375rem" }}>
            Quick Actions
          </div>
        </nav>

        <div className={s.quickActions}>
          <button
            className={s.quickActionBtn}
            onClick={() => {
              setIsMobileSidebarOpen(false);
              window.location.hash = "#ai-advisor";
            }}
          >
            <Brain size={13} style={{ color: "#8b5cf6" }} />
            AI Advisor
          </button>
        </div>

        <div className={s.sidebarFoot}>
          <button className={`${s.navBtn} ${s.navBtnDanger}`} onClick={handleLogout}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className={s.root}>

      {/* Desktop sidebar */}
      {isDesktop && (
        <aside className={s.sidebar}>
          <SidebarContent />
        </aside>
      )}

      <div className={s.main}>

        {/* Mobile topbar */}
        {!isDesktop && (
          <div className={s.topbar}>
            <div className={s.topbarBrand}>
              <span className={s.topbarDot} />
              <span className={s.topbarTitle}>Dashboard</span>
            </div>
            <button
              className={s.topbarMenuBtn}
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        )}

        <div className={s.content}>

          {/* Page header */}
          <div className={s.pageHeader}>
            <p className={s.pageEyebrow}>Health Dashboard</p>
            <h1 className={s.pageTitle}>Body Statistics</h1>
            <p className={s.pageSub}>
              {user?.fitnessMetrics?.lastCalculated
                ? `Last updated ${new Date(user.fitnessMetrics.lastCalculated).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`
                : "Track your weight and BMI over time"}
            </p>
          </div>

          {/* Admin note */}
          {adminNote && (
            <div className={s.adminNote}>
              <div className={s.adminNoteTitle}>Note from your coach</div>
              <div className={s.adminNoteBody}>{adminNote}</div>
            </div>
          )}

          {/* Stat cards — flat, fast, auto-fit grid */}
          <div className={s.statsGrid}>

            {/* BMI */}
            <div className={s.stat}>
              <span className={s.statLabel}>BMI</span>
              {latestBMI ? (
                <>
                  <span className={s.statValue}>{latestBMI.value.toFixed(1)}</span>
                  <span className={`${s.badge} ${bmiCategoryBadge(latestBMI.category)}`}>
                    {latestBMI.category}
                  </span>
                  <div className={s.bmiBar}>
                    <div className={`${s.bmiSeg} ${s.bmiSegUnder}  ${under  ? s.bmiSegActive : ""}`} />
                    <div className={`${s.bmiSeg} ${s.bmiSegNormal} ${normal ? s.bmiSegActive : ""}`} />
                    <div className={`${s.bmiSeg} ${s.bmiSegOver}   ${over   ? s.bmiSegActive : ""}`} />
                    <div className={`${s.bmiSeg} ${s.bmiSegObese}  ${obese  ? s.bmiSegActive : ""}`} />
                  </div>
                  <div className={s.bmiBarLabel}>Under · Normal · Over · Obese</div>
                </>
              ) : (
                <span className={s.statMeta}>No data yet</span>
              )}
            </div>

            {/* Weight */}
            <div className={s.stat}>
              <span className={s.statLabel}>Weight</span>
              {latestBMI ? (
                <>
                  <span className={s.statValue}>
                    {latestBMI.weight}
                    <span className={s.statUnit}>kg</span>
                  </span>
                  <span className={s.statMeta}>
                    {latestBMI.height}
                    {latestBMI.unit === "metric" ? " cm" : " in"} tall
                  </span>
                </>
              ) : (
                <span className={s.statMeta}>No data yet</span>
              )}
            </div>

            {/* Goal */}
            <div className={s.stat}>
              <span className={s.statLabel}>Goal Weight</span>
              {goalWeight ? (
                <>
                  <span className={s.statValue}>
                    {goalWeight}
                    <span className={s.statUnit}>kg</span>
                  </span>
                  <span className={s.statMeta}>
                    {currentWeight > 0
                      ? `${Math.abs(currentWeight - goalWeight).toFixed(1)} kg remaining`
                      : "Set"}
                  </span>
                </>
              ) : (
                <span className={s.statMeta}>Not set yet</span>
              )}
            </div>

            {/* Entries */}
            <div className={s.stat}>
              <span className={s.statLabel}>Entries</span>
              <span className={s.statValue}>{bmiHistory.length}</span>
              <span className={s.statMeta}>
                {daysSinceLastEntry !== null
                  ? `Last: ${daysSinceLastEntry === 0 ? "today" : `${daysSinceLastEntry}d ago`}`
                  : "BMI recordings"}
              </span>
            </div>
          </div>

          {/* Insight banner */}
          {allChartData.length > 0 && (
            <div className={s.insightBanner}>
              <div className={s.insightIcon}>
                <Sparkles size={15} />
              </div>
              <div>
                <div className={s.insightLabel}>Trend Insight</div>
                <div className={s.insightBody}>{insight}</div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!bmiHistory.length && !latestBMI && (
            <div className={s.card} style={{ marginBottom: "1rem" }}>
              <div className={s.emptyState}>
                <div className={s.emptyIcon}>
                  <Activity size={20} />
                </div>
                <div className={s.emptyTitle}>Start tracking your health</div>
                <div className={s.emptyBody}>
                  Calculate your BMI once to unlock trend graphs, goal tracking, and AI guidance.
                </div>
                <button
                  className={s.emptyBtn}
                  onClick={() => { window.location.hash = "#bmi"; }}
                >
                  Go to BMI Calculator
                </button>
              </div>
            </div>
          )}

          {/* Goal progress */}
          <div className={s.goalCard}>
            <div className={s.sectionHead}>
              <div>
                <div className={s.sectionTitle}>
                  <Target size={15} style={{ color: "#10b981" }} />
                  Goal Progress
                </div>
                <div className={s.sectionSub}>
                  {goalWeight
                    ? `${startWeight} kg → ${goalWeight} kg`
                    : "Set a target weight to track your progress"}
                </div>
              </div>
              <button className={s.sectionAction} onClick={openGoalForm}>
                {goalWeight ? "Update" : "Set goal"}
              </button>
            </div>

            {goalWeight && currentWeight > 0 ? (
              <>
                <div className={s.goalNums}>
                  <div>
                    <div className={s.goalNumLabel}>Start</div>
                    <div className={s.goalNumValue}>{startWeight} kg</div>
                  </div>
                  <div>
                    <div className={s.goalNumLabel}>Current</div>
                    <div className={`${s.goalNumValue} ${s.goalNumGreen}`}>{currentWeight} kg</div>
                  </div>
                  <div>
                    <div className={s.goalNumLabel}>Target</div>
                    <div className={`${s.goalNumValue} ${s.goalNumOrange}`}>{goalWeight} kg</div>
                  </div>
                  <div>
                    <div className={s.goalNumLabel}>Remaining</div>
                    <div className={s.goalNumValue}>{Math.abs(currentWeight - goalWeight).toFixed(1)} kg</div>
                  </div>
                </div>

                <div className={s.progressWrap}>
                  <div className={s.progressLabels}>
                    <span className={s.progressLeft}>{startWeight} kg</span>
                    <span className={s.progressPct}>{Math.round(weightProgress)}% complete</span>
                    <span className={s.progressRight}>{goalWeight} kg</span>
                  </div>
                  <div className={s.progressTrack}>
                    <div className={s.progressFill} style={{ width: `${weightProgress}%` }}>
                      {weightProgress >= 8 && (
                        <span className={s.progressFillLabel}>{currentWeight} kg</span>
                      )}
                    </div>
                  </div>
                  <div className={s.progressSubs}>
                    <span>Starting point</span>
                    <span>Goal</span>
                  </div>
                </div>

                {weightProgress >= 100 && (
                  <div className={s.goalReached}>
                    <CheckCircle2 size={14} />
                    Goal reached!
                  </div>
                )}
              </>
            ) : (
              <div className={s.setGoalEmpty}>
                <div className={s.setGoalEmptyIcon}>
                  <Target size={20} />
                </div>
                <div className={s.setGoalEmptyText}>
                  Set a goal weight to start tracking your progress toward it.
                </div>
                <button
                  className={s.sectionAction}
                  style={{ marginTop: "0.25rem" }}
                  onClick={openGoalForm}
                >
                  Set goal →
                </button>
              </div>
            )}
          </div>

          {/* Weight timeline */}
          <div className={s.chartCard}>
            <ChartHeader
              icon={<Weight size={15} style={{ color: "#10b981" }} />}
              title="Weight Timeline"
              sub="Recorded weight measurements over time"
              range={weightRange}
              onRange={setWeightRange}
              action="Log entry"
              onAction={openBodyForm}
            />

            {weightChartData.length > 0 && (
              <div className={s.chartMeta}>
                <div>
                  <div className={s.chartMetaLabel}>Current</div>
                  <div className={s.chartMetaValue}>{currentWeight} kg</div>
                </div>
                {goalWeight && (
                  <div>
                    <div className={s.chartMetaLabel}>Goal</div>
                    <div className={s.chartMetaValue} style={{ color: "#c2410c" }}>
                      {goalWeight} kg
                    </div>
                  </div>
                )}
                <div>
                  <div className={s.chartMetaLabel}>Change</div>
                  <div
                    className={s.chartMetaValue}
                    style={{ color: currentWeight <= startWeight ? "#15803d" : "#c2410c" }}
                  >
                    {currentWeight > startWeight ? "+" : ""}
                    {(currentWeight - startWeight).toFixed(1)} kg
                  </div>
                </div>
              </div>
            )}

            {!allChartData.length ? (
              <div className={s.emptyState}>
                <div className={s.emptyIcon}>
                  <Weight size={18} />
                </div>
                <div className={s.emptyTitle}>No weight data yet</div>
                <div className={s.emptyBody}>Calculate your BMI to start recording.</div>
              </div>
            ) : weightChartData.length < 4 ? (
              <DotTimeline data={weightChartData} goalWeight={goalWeight} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={weightChartData}
                  margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#10b981" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f2f2f7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#aeaeb2", fontSize: 10, fontFamily: "-apple-system" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#aeaeb2", fontSize: 10, fontFamily: "-apple-system" }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    width={32}
                  />
                  <Tooltip
                    content={<WeightTooltip goalWeight={goalWeight} />}
                    cursor={{ stroke: "#e8e8ed", strokeWidth: 1 }}
                  />
                  {goalWeight && (
                    <ReferenceLine
                      y={goalWeight}
                      stroke="#c2410c"
                      strokeDasharray="5 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Goal ${goalWeight}kg`,
                        position: "insideTopRight",
                        fill: "#c2410c",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#wGrad)"
                    dot={<CustomDot />}
                    activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* BMI history */}
          <div className={s.chartCard}>
            <ChartHeader
              icon={<TrendingUp size={15} style={{ color: "#14b8a6" }} />}
              title="BMI History"
              sub="Body mass index progression"
              range={bmiRange}
              onRange={setBmiRange}
            />

            {bmiChartData.length > 0 && (
              <div className={s.chartMeta}>
                <div>
                  <div className={s.chartMetaLabel}>Min</div>
                  <div className={s.chartMetaValue}>{minBMI.toFixed(1)}</div>
                </div>
                <div>
                  <div className={s.chartMetaLabel}>Max</div>
                  <div className={s.chartMetaValue}>{maxBMI.toFixed(1)}</div>
                </div>
                <div>
                  <div className={s.chartMetaLabel}>Current</div>
                  <div className={s.chartMetaValue} style={{ color: "#14b8a6" }}>
                    {allChartData[allChartData.length - 1]?.bmi.toFixed(1) ?? "—"}
                  </div>
                </div>
              </div>
            )}

            {!allChartData.length ? (
              <div className={s.emptyState}>
                <div className={s.emptyIcon}>
                  <TrendingUp size={18} />
                </div>
                <div className={s.emptyTitle}>No BMI history yet</div>
                <div className={s.emptyBody}>Your trend will appear once you have recordings.</div>
              </div>
            ) : bmiChartData.length < 4 ? (
              <DotTimeline data={bmiChartData} goalWeight={goalWeight} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={bmiChartData}
                  margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#14b8a6" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f2f2f7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#aeaeb2", fontSize: 10, fontFamily: "-apple-system" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#aeaeb2", fontSize: 10, fontFamily: "-apple-system" }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    width={32}
                  />
                  <Tooltip
                    content={<BMITooltip />}
                    cursor={{ stroke: "#e8e8ed", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bmi"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="url(#bGrad)"
                    dot={{ fill: "#14b8a6", r: 3.5, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Entry history table */}
          {allChartData.length > 0 && (
            <div className={s.historyCard}>
              <div className={s.historyHead}>
                <div>
                  <div className={s.sectionTitle} style={{ marginBottom: 0 }}>
                    <Scale size={15} style={{ color: "#10b981" }} />
                    Entry History
                  </div>
                  <div className={s.sectionSub}>
                    {bmiHistory.length} recording{bmiHistory.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  className={s.collapseBtn}
                  onClick={() => setHistoryOpen((h) => !h)}
                >
                  {historyOpen ? (
                    <><ChevronUp size={14} />Hide</>
                  ) : (
                    <><ChevronDown size={14} />View all</>
                  )}
                </button>
              </div>

              {historyOpen && (
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th>BMI</th>
                        <th>Category</th>
                        <th>Height</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...allChartData].reverse().map((pt) => {
                        const cat = bmiFromBMI(pt.bmi);
                        return (
                          <tr key={pt.timestamp}>
                            <td style={{ color: "#636366" }}>{pt.fullDate}</td>
                            <td style={{ fontWeight: 600 }}>{pt.weight} kg</td>
                            <td style={{ fontWeight: 600, color: "#14b8a6" }}>{pt.bmi.toFixed(1)}</td>
                            <td>
                              <span className={`${s.badge} ${bmiCategoryBadge(cat)}`}>
                                {cat}
                              </span>
                            </td>
                            <td style={{ color: "#636366" }}>
                              {latestBMI?.height}
                              {latestBMI?.unit === "metric" ? " cm" : " in"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {isMobileSidebarOpen && (
        <>
          <div className={s.overlay} onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className={s.drawerSidebar}>
            <div className={s.drawerHead}>
              <div className={s.drawerTitle}>Menu</div>
              <button
                className={s.drawerClose}
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Form drawer */}
      {isStatsFormOpen && (
        <>
          <div className={s.overlay} onClick={() => setIsStatsFormOpen(false)} />
          <aside className={s.formDrawer}>
            <div className={s.drawerHead}>
              <div>
                <div className={s.drawerTitle}>
                  {activeForm === "body" ? "Log Weight Entry" : "Set Goal Weight"}
                </div>
                <div className={s.drawerSub}>
                  {activeForm === "body"
                    ? "Record your current weight."
                    : "Set your target weight."}
                </div>
              </div>
              <button
                className={s.drawerClose}
                onClick={() => setIsStatsFormOpen(false)}
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>

            <div className={s.drawerBody}>
              {activeForm === "body" ? (
                <form onSubmit={handleBodySubmit}>
                  {savedHeight > 0 && (
                    <div className={s.formHint}>
                      <Scale size={12} />
                      Height: {savedHeight}
                      {savedHeightUnit === "metric" ? " cm" : " ft"}
                    </div>
                  )}
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Weight</label>
                    <div className={s.formInputRow}>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        required
                        className={s.formInput}
                        placeholder="Enter weight"
                        value={bodyStatsForm.weight}
                        onChange={(e) =>
                          setBodyStatsForm((p) => ({ ...p, weight: e.target.value }))
                        }
                      />
                      <select
                        className={s.formSelect}
                        value={bodyStatsForm.weightUnit}
                        onChange={(e) =>
                          setBodyStatsForm((p) => ({
                            ...p,
                            weightUnit: e.target.value as BodyStatsForm["weightUnit"],
                          }))
                        }
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={s.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><div className={s.spinner} />Saving…</>
                    ) : (
                      <><Save size={14} />Save Entry</>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleGoalSubmit}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Goal Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      className={s.formInput}
                      placeholder="e.g. 72"
                      value={goalWeightInput}
                      onChange={(e) => setGoalWeightInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className={s.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><div className={s.spinner} />Saving…</>
                    ) : (
                      <><Target size={14} />Set Goal</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`${s.toast} ${
            toast.type === "success" ? s.toastSuccess : s.toastError
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={13} /> : <X size={13} />}
          {toast.msg}
        </div>
      )}

    </div>
  );
}