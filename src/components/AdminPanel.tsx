"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  Loader2,
  Users,
  Home,
  CheckSquare,
  Square,
  ChevronRight,
  MousePointer,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
} from "recharts";
import s from "./AdminPanel.module.css";

/* ─── Types (unchanged from original) ───────────────────────────────────── */
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

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
}

function computeProgress(u: AdminUser): number {
  const history = u.fitnessMetrics?.bmiHistory ?? [];
  const goal    = u.fitnessMetrics?.goalWeight ?? null;
  if (!history.length || !goal) return 0;
  const sorted  = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const start   = sorted[0].weight;
  const current = sorted[sorted.length - 1].weight;
  const total   = Math.abs(start - goal);
  if (total === 0) return 100;
  return Math.max(0, Math.min(100, (Math.abs(start - current) / total) * 100));
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function AdminPanel() {
  const { user } = useAuth();

  /* ── State — identical to original ─────────────────────────────────────── */
  const [users,          setUsers]          = useState<AdminUser[]>([]);
  const [notes,          setNotes]          = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [filter,         setFilter]         = useState<FilterKey>("all");
  const [bulkNote,       setBulkNote]       = useState("");
  const [isBulkSaving,   setIsBulkSaving]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(true);
  const [savingId,       setSavingId]       = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);

  /* ── Load users — identical to original ────────────────────────────────── */
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

  /* ── Handlers — identical to original ──────────────────────────────────── */
  const handleBackHome = () => {
    window.location.hash = "#home";
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
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

  /* ── Filters — identical to original ───────────────────────────────────── */
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
        if (history.length < 3) return false;
        const sorted = [...history].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        const first = sorted[0];
        const last  = sorted[sorted.length - 1];
        const goal  = fm?.goalWeight ?? last.weight;
        const startDiff = Math.abs(first.weight - goal);
        const endDiff   = Math.abs(last.weight - goal);
        return endDiff <= startDiff;
      });
    }

    return users;
  }, [users, filter]);

  const visibleIds = filteredUsers.map((u) => u.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;
  const selectedCount = selectedIds.size;

  /* ── Bulk save — identical to original ─────────────────────────────────── */
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
          selectedIds.forEach((id) => { next[id] = trimmed; });
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

  /* ── Loading / error ────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className={s.rootCenter}>
        <div className={s.loadingBox}>
          <Loader2 className={s.loadingIcon} />
          <span className={s.loadingText}>Loading admin panel…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.rootCenter}>
        <div className={s.errorBox}>
          <p className={s.errorText}>{error}</p>
          <button className={s.errorBtn} onClick={handleBackHome}>
            <Home size={14} />Back to home
          </button>
        </div>
      </div>
    );
  }

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className={s.root}>
      <div className={s.shell}>

        {/* ══ PANE 1 — USER LIST ════════════════════════════════════════════ */}
        <div className={s.listPane}>

          {/* Header */}
          <div className={s.listHeader}>
            <div className={s.listHeaderRow}>
              <button className={s.backBtn} onClick={handleBackHome}>
                <Home size={13} />Back
              </button>
              <div className={s.listTitleGroup}>
                <span className={s.listTitle}>Users</span>
                <span className={s.listCount}>{filteredUsers.length}</span>
              </div>
            </div>

            {/* Filter chips */}
            <div className={s.filterRow}>
              {(["all", "reached-goal", "good-progress"] as FilterKey[]).map(f => (
                <button
                  key={f}
                  type="button"
                  className={`${s.chip} ${filter === f ? s.chipActive : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "reached-goal" ? "Goal reached" : "On track"}
                </button>
              ))}
            </div>
          </div>

          {/* Select-all bar */}
          <div className={s.selectBar}>
            <button
              type="button"
              className={s.selectAllBtn}
              onClick={() =>
                allVisibleSelected
                  ? clearSelection()
                  : setSelectAllVisible(visibleIds)
              }
            >
              {allVisibleSelected ? (
                <CheckSquare size={14} style={{ color: "#111111" }} />
              ) : someVisibleSelected ? (
                <CheckSquare size={14} style={{ color: "#111111", opacity: 0.4 }} />
              ) : (
                <Square size={14} style={{ color: "#D1D5DB" }} />
              )}
              {allVisibleSelected ? "Deselect all" : "Select all"}
            </button>
            {selectedCount > 0 && (
              <span className={s.selectedBadge}>{selectedCount} selected</span>
            )}
          </div>

          {/* User rows */}
          <div className={s.listScroll}>
            {filteredUsers.length === 0 ? (
              <div className={s.listEmpty}>No users in this view.</div>
            ) : (
              filteredUsers.map((u) => {
                const isChecked = selectedIds.has(u.id);
                const isFocused = u.id === selectedUserId;
                const latestWeight = u.fitnessMetrics?.latestBMI?.weight ?? null;
                const goalW        = u.fitnessMetrics?.goalWeight ?? null;
                const progress     = computeProgress(u);

                return (
                  <button
                    key={u.id}
                    type="button"
                    className={`${s.userRow} ${isFocused ? s.userRowSelected : ""}`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    {/* Checkbox */}
                    <span
                      className={`${s.rowCheck} ${isChecked ? s.rowCheckOn : ""}`}
                      role="button"
                      aria-label="Select user"
                      onClick={(e) => { e.stopPropagation(); toggleSelectOne(u.id); }}
                    >
                      {isChecked
                        ? <CheckSquare size={14} />
                        : <Square size={14} />
                      }
                    </span>

                    {/* Avatar */}
                    <div className={`${s.avatar} ${isFocused ? s.avatarSelected : ""}`}>
                      {getInitials(u.name || u.email)}
                    </div>

                    {/* Name / email */}
                    <div className={s.rowBody}>
                      <div className={s.rowName}>{u.name || u.email}</div>
                      <div className={s.rowEmail}>{u.email}</div>
                    </div>

                    {/* Weight + mini bar */}
                    <div className={s.rowMeta}>
                      {latestWeight != null ? (
                        <div className={s.rowWeights}>
                          <span className={s.rowWeightBold}>{latestWeight}</span>
                          {goalW != null ? ` → ${goalW}` : ""} kg
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.6875rem", color: "#D1D5DB" }}>—</span>
                      )}
                      {latestWeight != null && goalW != null && (
                        <div className={s.rowBar}>
                          <div className={s.rowBarFill} style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>

                    <ChevronRight size={13} style={{ color: "#D1D5DB", flexShrink: 0 }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══ PANE 2 — DETAIL ══════════════════════════════════════════════ */}
        <div className={s.detailPane}>
          {selectedUser ? (
            <div className={s.detailInner} key={selectedUser.id}>

              {/* Breadcrumb */}
              <div className={s.breadcrumb}>
                <Users size={13} />
                <span>Users</span>
                <span style={{ color: "#E5E7EB" }}>·</span>
                <span className={s.breadcrumbActive}>{selectedUser.name || selectedUser.email}</span>
              </div>

              <UserDetailLayout
                user={selectedUser}
                note={notes[selectedUser.id] ?? ""}
                onChangeNote={(value) => handleNoteChange(selectedUser.id, value)}
                onSaveNote={() => handleSaveNote(selectedUser.id)}
                saving={savingId === selectedUser.id}
              />

            </div>
          ) : (
            <div className={s.detailEmpty}>
              <div className={s.detailEmptyIcon}><MousePointer size={20} /></div>
              <div className={s.detailEmptyTitle}>Select a user</div>
              <div className={s.detailEmptySub}>Choose someone from the list to view their health data and add coaching notes.</div>
            </div>
          )}
        </div>

      </div>

      {/* ══ BULK PANEL ════════════════════════════════════════════════════ */}
      {selectedCount > 0 && (
        <div className={s.bulkOuter}>
          <div className={s.bulkPanel}>
            <div className={s.bulkTopRow}>
              <div>
                <div className={s.bulkTitle}>
                  Coach note · {selectedCount} user{selectedCount > 1 ? "s" : ""}
                </div>
                <div className={s.bulkSub}>This note will appear in each selected user&apos;s panel.</div>
              </div>
              <button
                className={s.bulkCancelBtn}
                onClick={() => { setBulkNote(""); clearSelection(); }}
              >
                Cancel
              </button>
            </div>
            <div className={s.bulkInputRow}>
              <textarea
                className={s.bulkTextarea}
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                rows={2}
                placeholder="Write a shared coach note for selected users…"
              />
              <button
                className={s.bulkSendBtn}
                disabled={isBulkSaving || !bulkNote.trim()}
                onClick={handleBulkSave}
              >
                {isBulkSaving
                  ? <><div className={s.spinner} />Sending…</>
                  : "Send note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── UserDetailLayout — mirrors original structure ──────────────────────── */
type UserDetailProps = {
  user: AdminUser;
  note: string;
  onChangeNote: (value: string) => void;
  onSaveNote: () => void;
  saving: boolean;
};

function UserDetailLayout({ user, note, onChangeNote, onSaveNote, saving }: UserDetailProps) {
  const latestWeight = user.fitnessMetrics?.latestBMI?.weight ?? null;
  const goalWeight   = user.fitnessMetrics?.goalWeight ?? null;
  const bmiValue     = user.fitnessMetrics?.latestBMI?.value ?? null;
  const bmiCategory  = user.fitnessMetrics?.latestBMI?.category ?? "";
  const lastUpdated  = user.fitnessMetrics?.lastCalculated
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
        weight:    entry.weight,
        dateLabel: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        dateFull:  d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      };
    });
  }, [bmiHistory]);

  return (
    <div className={s.detailLayout}>

      {/* ── Identity ── */}
      <div className={s.card}>
        <div className={s.cardBody}>
          <div className={s.headerRow}>
            <div className={s.headerLeft}>
              <div className={s.nameRow}>
                <h1 className={s.detailName}>{user.name || user.email}</h1>
                {user.role === "admin" && <span className={s.adminBadge}>Admin</span>}
              </div>
              <div className={s.detailEmail}>{user.email}</div>
              {lastUpdated && (
                <div className={s.detailUpdated}>Last updated {lastUpdated}</div>
              )}
            </div>

            {bmiValue != null && (
              <div className={s.bmiPill}>
                <div className={s.bmiNum}>{bmiValue.toFixed(1)}</div>
                <div>
                  <div className={s.bmiLabel}>BMI · {bmiCategory}</div>
                  <div className={s.bmiSub}>
                    {latestWeight != null ? `${latestWeight} kg` : "—"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics strip ── */}
      <div className={s.metricsStrip}>
        <div className={s.metricCell}>
          <div className={s.metricLabel}>Current weight</div>
          <div className={s.metricVal}>
            {latestWeight != null
              ? <>{latestWeight}<span className={s.metricUnit}>kg</span></>
              : <span style={{ color: "#D1D5DB" }}>—</span>}
          </div>
        </div>
        <div className={s.metricCell}>
          <div className={s.metricLabel}>Goal weight</div>
          <div className={s.metricVal}>
            {goalWeight != null
              ? <>{goalWeight}<span className={s.metricUnit}>kg</span></>
              : <span style={{ color: "#D1D5DB" }}>—</span>}
          </div>
        </div>
        <div className={s.metricCell}>
          <div className={s.metricLabel}>Progress</div>
          <div className={s.metricVal}>
            {goalWeight != null && latestWeight != null
              ? <>{Math.round(computeProgress(user))}<span className={s.metricUnit}>%</span></>
              : <span style={{ color: "#D1D5DB" }}>—</span>}
          </div>
          {bmiHistory.length > 0 && (
            <div className={s.metricSub}>{bmiHistory.length} entries</div>
          )}
        </div>
      </div>

      {/* ── Weight trend chart ── */}
      {miniChartData.length > 1 && (
        <div className={s.card}>
          <div className={s.cardBody}>
            <div className={s.chartHead}>
              <span className={s.chartHeadTitle}>Weight trend</span>
              {latestWeight != null && goalWeight != null && (
                <span className={s.chartHeadMeta}>{latestWeight} kg · Goal {goalWeight} kg</span>
              )}
            </div>
            <div className={s.chartWrap}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={miniChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminWeightMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dateLabel"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "-apple-system, system-ui" }}
                    interval="preserveStartEnd"
                  />
                  <RechartsTooltip
                    cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload as MiniPoint;
                      return (
                        <div className={s.chartTooltip}>
                          <div className={s.chartTooltipDate}>{p.dateFull}</div>
                          <div className={s.chartTooltipVal}>{p.weight} kg</div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fill="url(#adminWeightMini)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#22C55E", stroke: "#fff", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Coach note ── */}
      <div className={s.card}>
        <div className={s.cardBody}>
          <div className={s.notesEyebrow}>Coach Note</div>
          <div className={s.notesTitle}>
            Write a note for {user.name?.split(" ")[0] || "this user"}
          </div>
          <textarea
            className={s.notesTextarea}
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            rows={4}
            placeholder="Add a specific coach note for this user…"
          />
          <div className={s.notesFooter}>
            <button
              className={s.saveBtn}
              onClick={onSaveNote}
              disabled={saving}
            >
              {saving
                ? <><div className={s.spinnerDark} />Saving…</>
                : "Save note"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}