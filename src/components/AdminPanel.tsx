"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Loader2,
  Shield,
  Users,
  Home,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
} from "recharts";

import "./AdminPanel.css";

type BMIHistoryEntry = {
  value: number;
  category: string;
  height: number;
  weight: number;
  unit: "metric" | "imperial";
  date: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  fitnessMetrics?: {
    latestBMI?: {
      value?: number;
      category?: string;
      weight?: number;
    };
    goalWeight?: number;
    lastCalculated?: string;
    bmiHistory?: BMIHistoryEntry[];
  };
  adminNote?: string;
};

type MiniPoint = {
  dateLabel: string;
  dateFull: string;
  weight: number;
};

type FilterKey = "all" | "reached-goal" | "good-progress";

export function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [bulkNote, setBulkNote] = useState("");
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/users", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError("You are not authorized to view this page.");
          } else {
            setError("Failed to load users.");
          }
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (!data.ok) {
          setError(data.message || "Failed to load users.");
          setIsLoading(false);
          return;
        }

        const list: AdminUser[] = data.users;
        setUsers(list);
        const initialNotes: Record<string, string> = {};
        list.forEach((u) => {
          initialNotes[u.id] = u.adminNote ?? "";
        });
        setNotes(initialNotes);
        if (list.length > 0) {
          setSelectedUserId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load admin users:", err);
        setError("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      loadUsers();
    } else {
      setIsLoading(false);
      setError("You are not authorized to view this page.");
    }
  }, [user]);

  const handleBackHome = () => {
    window.location.hash = "#home";
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveNote = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNote: notes[id] ?? "" }),
      });

      if (!res.ok) {
        console.error("Failed to save note");
      }
    } catch (err) {
      console.error("Failed to save note", err);
    } finally {
      setSavingId(null);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const setSelectAllVisible = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Filters: all / reached-goal / good-progress (>= 3 records and not regressing)
  const filteredUsers = useMemo(() => {
    if (filter === "all") return users;

    if (filter === "reached-goal") {
      return users.filter((u) => {
        const fm = u.fitnessMetrics;
        if (!fm?.latestBMI || fm.goalWeight == null) return false;
        return fm.latestBMI.weight === fm.goalWeight;
      });
    }

    if (filter === "good-progress") {
      return users.filter((u) => {
        const fm = u.fitnessMetrics;
        const history = fm?.bmiHistory ?? [];
        if (history.length < 3) return false; // your “actively tracking” rule

        const sorted = [...history].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const goal = fm?.goalWeight ?? last.weight;
        const startDiff = Math.abs(first.weight - goal);
        const endDiff = Math.abs(last.weight - goal);

        return endDiff <= startDiff;
      });
    }

    return users;
  }, [users, filter]);

  const visibleIds = filteredUsers.map((u) => u.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

  const selectedCount = selectedIds.size;

  const handleBulkSave = async () => {
    const trimmed = bulkNote.trim();
    if (!trimmed || selectedIds.size === 0) return;

    setIsBulkSaving(true);
    try {
      const res = await fetch("/api/admin/users/bulk-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userIds: Array.from(selectedIds),
          adminNote: trimmed,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save bulk note");
      } else {
        setNotes((prev) => {
          const next = { ...prev };
          selectedIds.forEach((id) => {
            next[id] = trimmed;
          });
          return next;
        });
        setBulkNote("");
        clearSelection();
      }
    } catch (err) {
      console.error("Failed to save bulk note", err);
    } finally {
      setIsBulkSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-root admin-root-loading">
        <div className="admin-loading">
          <Loader2 className="admin-loading-icon" />
          <span className="admin-loading-text">Loading admin panel…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-root admin-root-loading">
        <div className="admin-error">
          <p className="admin-error-text">{error}</p>
          <Button variant="outline" size="sm" onClick={handleBackHome}>
            <Home className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  return (
    <div className="admin-root">
      <div className="admin-shell">
        {/* Sidebar */}
        <aside className="admin-sidebar admin-sidebar-narrow">
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-id">
              <div className="admin-sidebar-icon">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="admin-sidebar-title">Admin</p>
                <p className="admin-sidebar-subtitle">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="admin-sidebar-home-button"
              onClick={handleBackHome}
            >
              Home
            </Button>
          </div>

          <div className="admin-sidebar-section-label">
            Users
          </div>

          {/* Filters */}
          <div className="admin-filter-bar">
            <button
              type="button"
              className={[
                "admin-filter-chip",
                filter === "all" && "admin-filter-chip--active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={[
                "admin-filter-chip",
                filter === "reached-goal" && "admin-filter-chip--active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter("reached-goal")}
            >
              Reached goal
            </button>
            <button
              type="button"
              className={[
                "admin-filter-chip",
                filter === "good-progress" && "admin-filter-chip--active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter("good-progress")}
            >
              Good progress
            </button>
          </div>

          {/* Header row */}
          <div className="admin-table-header">
            <button
              type="button"
              className="admin-table-header-select"
              onClick={() =>
                allVisibleSelected
                  ? clearSelection()
                  : setSelectAllVisible(visibleIds)
              }
            >
              {allVisibleSelected ? (
                <CheckSquare className="admin-table-checkbox-icon" />
              ) : someVisibleSelected ? (
                <CheckSquare className="admin-table-checkbox-icon admin-table-checkbox-icon--indeterminate" />
              ) : (
                <Square className="admin-table-checkbox-icon" />
              )}
            </button>
            <span className="admin-table-header-label">User</span>
            <span className="admin-table-header-col">Current</span>
            <span className="admin-table-header-col">Goal</span>
          </div>

          {/* Table-like list */}
          <div className="admin-sidebar-list admin-sidebar-list-table">
            {filteredUsers.length === 0 ? (
              <p className="admin-sidebar-empty">
                No users in this view.
              </p>
            ) : (
              <ul className="admin-user-list">
                {filteredUsers.map((u) => {
                  const isSelected = selectedIds.has(u.id);
                  const isFocused = u.id === selectedUserId;
                  const latestWeight =
                    u.fitnessMetrics?.latestBMI?.weight ?? null;
                  const goalWeight = u.fitnessMetrics?.goalWeight ?? null;

                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        className={[
                          "admin-user-row",
                          isFocused && "admin-user-row--focused",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setSelectedUserId(u.id)}
                      >
                        <button
                          type="button"
                          className="admin-user-row-check"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectOne(u.id);
                          }}
                        >
                          {isSelected ? (
                            <CheckSquare className="admin-table-checkbox-icon" />
                          ) : (
                            <Square className="admin-table-checkbox-icon" />
                          )}
                        </button>
                        <div className="admin-user-row-main">
                          <span className="admin-user-list-name">
                            {u.name || u.email}
                          </span>
                          <span className="admin-user-list-subline">
                            {u.email}
                          </span>
                        </div>
                        <span className="admin-user-row-metric">
                          {latestWeight != null ? `${latestWeight} kg` : "—"}
                        </span>
                        <span className="admin-user-row-metric">
                          {goalWeight != null ? `${goalWeight} kg` : "—"}
                        </span>
                        <ChevronRight className="admin-user-list-chevron" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Right side */}
        <main className="admin-main">
          <div className="admin-main-inner admin-main-inner-wide">
            <div className="admin-main-breadcrumb">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Users & progress</span>
            </div>

            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={selectedUser?.id ?? "none"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
              >
                {selectedUser ? (
                  <UserDetailLayout
                    user={selectedUser}
                    note={notes[selectedUser.id] ?? ""}
                    onChangeNote={(value) =>
                      handleNoteChange(selectedUser.id, value)
                    }
                    onSaveNote={() => handleSaveNote(selectedUser.id)}
                    saving={savingId === selectedUser.id}
                  />
                ) : (
                  <div className="admin-main-empty">
                    Select a user from the list to view details.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bulk panel */}
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="admin-bulk-panel"
              >
                <div className="admin-bulk-panel-inner">
                  <div className="admin-bulk-panel-header">
                    <span className="admin-bulk-panel-title">
                      Coach note for {selectedCount} user
                      {selectedCount > 1 ? "s" : ""}
                    </span>
                    <span className="admin-bulk-panel-subtitle">
                      This note will appear in each selected user’s panel.
                    </span>
                  </div>
                  <div className="admin-bulk-panel-body">
                    <textarea
                      value={bulkNote}
                      onChange={(e) => setBulkNote(e.target.value)}
                      rows={3}
                      placeholder="Write a shared coach note for selected users…"
                      className="admin-bulk-textarea-rect"
                    />
                    <div className="admin-bulk-panel-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        className="admin-bulk-cancel-rect"
                        onClick={() => {
                          setBulkNote("");
                          clearSelection();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="admin-bulk-submit-rect"
                        disabled={isBulkSaving || !bulkNote.trim()}
                        onClick={handleBulkSave}
                      >
                        {isBulkSaving ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          "Send note"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

type UserDetailProps = {
  user: AdminUser;
  note: string;
  onChangeNote: (value: string) => void;
  onSaveNote: () => void;
  saving: boolean;
};

function UserDetailLayout({
  user,
  note,
  onChangeNote,
  onSaveNote,
  saving,
}: UserDetailProps) {
  const latestWeight = user.fitnessMetrics?.latestBMI?.weight ?? null;
  const goalWeight = user.fitnessMetrics?.goalWeight ?? null;
  const bmiValue = user.fitnessMetrics?.latestBMI?.value ?? null;
  const bmiCategory = user.fitnessMetrics?.latestBMI?.category ?? "";
  const lastUpdated = user.fitnessMetrics?.lastCalculated
    ? new Date(user.fitnessMetrics.lastCalculated).toLocaleString()
    : "";

  const bmiHistory = user.fitnessMetrics?.bmiHistory ?? [];

  const miniChartData: MiniPoint[] = useMemo(() => {
    if (!bmiHistory.length) return [];
    const sorted = [...bmiHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return sorted.map((entry) => {
      const d = new Date(entry.date);
      return {
        weight: entry.weight,
        dateLabel: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        dateFull: d.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  }, [bmiHistory]);

  return (
    <div className="admin-detail-layout">
      {/* Identity */}
      <section className="admin-detail-identity">
        <div className="admin-detail-identity-main">
          <div className="admin-detail-name-row">
            <h1 className="admin-detail-name">
              {user.name || user.email}
            </h1>
            {user.role === "admin" && (
              <span className="admin-detail-role-pill">
                Admin
              </span>
            )}
          </div>
          <p className="admin-detail-email">{user.email}</p>
          {lastUpdated && (
            <p className="admin-detail-updated">
              Last updated {lastUpdated}
            </p>
          )}
        </div>

        {bmiValue && (
          <div className="admin-detail-bmi">
            <div className="admin-detail-bmi-value">
              {bmiValue.toFixed(1)}
            </div>
            <div className="admin-detail-bmi-meta">
              <p className="admin-detail-bmi-label">
                BMI • {bmiCategory}
              </p>
              <p className="admin-detail-bmi-sub">
                {latestWeight != null ? `${latestWeight} kg` : "Weight —"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Metrics + mini chart */}
      <section className="admin-detail-middle">
        <div className="admin-detail-metrics-grid">
          <Card className="admin-detail-metric-card admin-detail-metric-card-plain">
            <CardHeader className="admin-detail-metric-header">
              <div className="admin-detail-metric-title-row">
                <span className="admin-detail-metric-label">
                  Current weight
                </span>
              </div>
            </CardHeader>
            <CardContent className="admin-detail-metric-content">
              <p className="admin-detail-metric-value">
                {latestWeight != null ? `${latestWeight} kg` : "—"}
              </p>
            </CardContent>
          </Card>

          <Card className="admin-detail-metric-card admin-detail-metric-card-plain">
            <CardHeader className="admin-detail-metric-header">
              <div className="admin-detail-metric-title-row">
                <span className="admin-detail-metric-label">
                  Goal weight
                </span>
              </div>
            </CardHeader>
            <CardContent className="admin-detail-metric-content">
              <p className="admin-detail-metric-value">
                {goalWeight != null ? `${goalWeight} kg` : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {miniChartData.length > 1 && (
          <div className="admin-detail-mini-chart">
            <div className="admin-detail-mini-chart-header">
              <p className="admin-detail-mini-chart-label">Weight trend</p>
              {latestWeight != null && goalWeight != null && (
                <p className="admin-detail-mini-chart-meta">
                  {latestWeight} kg • Goal {goalWeight} kg
                </p>
              )}
            </div>
            <div className="admin-detail-mini-chart-inner">
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={miniChartData}>
                  <defs>
                    <linearGradient id="adminWeightMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dateLabel"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                  />
                  <RechartsTooltip
                    cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const p = payload[0].payload as MiniPoint;
                      return (
                        <div className="admin-mini-tooltip">
                          <p className="admin-mini-tooltip-date">
                            {p.dateFull}
                          </p>
                          <p className="admin-mini-tooltip-weight">
                            {p.weight} kg
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#adminWeightMini)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* Single-user note */}
      <section className="admin-detail-notes">
        <p className="admin-detail-notes-label">
          Coach note (this user)
        </p>
        <textarea
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          rows={4}
          placeholder="Add a specific coach note for this user…"
          className="admin-detail-notes-textarea"
        />
        <div className="admin-detail-notes-actions">
          <Button
            size="sm"
            className="admin-detail-notes-save"
            onClick={onSaveNote}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Saving…
              </>
            ) : (
              "Save note"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
