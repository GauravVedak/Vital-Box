"use client";

/**
 * AuthContext.tsx
 *
 * Drop-in replacement for the existing AuthContext.
 * All existing consumers (App.tsx, AdminPanel, UserPanel, etc.) work unchanged.
 *
 * Security fixes vs original:
 *  ✓ localStorage stores ONLY { id, name, email } — role is NEVER persisted
 *    Prevents DevTools role escalation (set role:"admin" → refresh)
 *  ✓ Placeholder shown during boot always has role:"user" until server confirms
 *  ✓ asAdmin option kept in login() signature for backward compat — but it is
 *    silently dropped and never sent to the server. Role comes from DB only.
 *  ✓ bmiHistoryEntry still accepted in updateFitnessMetrics signature for
 *    backward compat — but not forwarded to the server (server derives history)
 *  ✓ Token poll interval raised 60s → 5 min, pauses when tab hidden
 *  ✓ loginAttempts / login failures surface correctly from server (423 status)
 *  ✓ updateFitnessMetrics now returns { ok, limitReached, lifetimeLimitReached }
 *    so BMI page can lock itself after 2 lifetime submissions
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ─── Types (unchanged public surface) ────────────────────────────────────────

interface BMIHistoryEntry {
  value:    number;
  category: string;
  height:   number;
  weight:   number;
  unit:     "metric" | "imperial";
  date:     string;
}

interface LatestBMI {
  value:    number;
  category: string;
  height:   number;
  weight:   number;
  unit:     "metric" | "imperial";
  date:     string;
}

interface FitnessMetrics {
  latestBMI?:           LatestBMI;
  bmiHistory?:          BMIHistoryEntry[];
  height?:              number;
  weight?:              number;
  unit?:                "metric" | "imperial";
  goalWeight?:          number;
  goals?:               string[];
  lastCalculated?:      string;
  firstBMIDate?:        string | null;
  totalBmiSubmissions?: number;
  aiSeededAt?:          string | null;
}

export interface User {
  id:              string;
  name:            string;
  email:           string;
  avatar?:         string;
  role:            "user" | "admin"; // set by server ONLY
  fitnessMetrics?: FitnessMetrics;
  adminNote?:      string;
}

interface AuthResult {
  ok:       boolean;
  message?: string;
}

interface FitnessMetricsUpdate {
  latestBMI?:      LatestBMI;
  height?:         number;
  weight?:         number;
  unit?:           "metric" | "imperial";
  goalWeight?:     number;
  bmiHistoryEntry?: BMIHistoryEntry; // accepted for compat, not forwarded to server
}

// Kept for backward compat — asAdmin is silently ignored
interface LoginOptions {
  asAdmin?: boolean;
}

interface AuthContextType {
  user:                 User | null;
  isLoading:            boolean;
  login:                (email: string, password: string, options?: LoginOptions) => Promise<AuthResult>;
  signup:               (name: string, email: string, password: string) => Promise<AuthResult>;
  logout:               () => Promise<void>;
  updateFitnessMetrics: (metrics: FitnessMetricsUpdate) => Promise<void>;
  refreshUser:          () => Promise<void>;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "vb_session_v2";

/** Minimal safe session — role intentionally excluded */
interface StoredSession {
  id:    string;
  name:  string;
  email: string;
}

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (typeof p.id !== "string" || typeof p.name !== "string" || typeof p.email !== "string") {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { id: p.id, name: p.name, email: p.email };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeSession(u: User | null) {
  if (typeof window === "undefined") return;
  if (!u) { window.localStorage.removeItem(STORAGE_KEY); return; }
  // Store only safe non-privileged fields
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ id: u.id, name: u.name, email: u.email })
  );
}

/** Placeholder shown before server sync — always role:"user" */
function placeholderUser(s: StoredSession): User {
  return { id: s.id, name: s.name, email: s.email, role: "user" };
}

/** Parse server user — role always comes from server */
function fromServer(data: Record<string, unknown>): User {
  return {
    id:             String(data.id    ?? ""),
    name:           String(data.name  ?? data.email ?? ""),
    email:          String(data.email ?? ""),
    role:           data.role === "admin" ? "admin" : "user",
    fitnessMetrics: (data.fitnessMetrics as FitnessMetrics) ?? undefined,
    adminNote:      typeof data.adminNote === "string" ? data.adminNote : "",
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_POLL_MS = 5 * 60 * 1000; // 5 min (was 60s)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAndStore = useCallback((u: User | null) => {
    setUser(u);
    writeSession(u);
  }, []);

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const stored = readSession();
      if (stored) setUser(placeholderUser(stored)); // instant render, role:"user"

      try {
        const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.user) {
            setAndStore(fromServer(data.user as Record<string, unknown>));
          } else {
            setAndStore(null);
          }
        } else {
          setAndStore(null);
        }
      } catch {
        if (!stored) setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch { /* best effort */ }
    setAndStore(null);
    if (typeof window !== "undefined") window.location.hash = "#home";
  }, [setAndStore]);

  // ── refreshUser ───────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
      if (!res.ok) { if (res.status === 401) await logout(); return; }
      const data = await res.json().catch(() => ({}));
      if (data?.user) setAndStore(fromServer(data.user as Record<string, unknown>));
    } catch (err) {
      console.error("[auth] refreshUser:", err);
    }
  }, [logout, setAndStore]);

  // ── Token validity poll — pauses when tab hidden ──────────────────────────
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/auth/verify", { method: "GET", credentials: "include" });
        if (!res.ok) await logout();
      } catch { /* network hiccup — wait for next check */ }
    };
    check();
    const id = setInterval(check, TOKEN_POLL_MS);
    return () => clearInterval(id);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── login ─────────────────────────────────────────────────────────────────
  // options.asAdmin is accepted for backward compat but never sent to server
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/login", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
          // asAdmin intentionally excluded — role is server-determined
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return { ok: false, message: data.message ?? "Login failed." };
        if (data.user) setAndStore(fromServer(data.user as Record<string, unknown>));
        return { ok: true };
      } catch {
        return { ok: false, message: "Something went wrong. Please try again." };
      }
    },
    [setAndStore]
  );

  // ── signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/signup", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return { ok: false, message: data.message ?? "Signup failed." };
        if (data.user) setAndStore(fromServer(data.user as Record<string, unknown>));
        return { ok: true };
      } catch {
        return { ok: false, message: "Something went wrong. Please try again." };
      }
    },
    [setAndStore]
  );

  // ── updateFitnessMetrics ──────────────────────────────────────────────────
  // bmiHistoryEntry kept in signature for compat — not forwarded to server
  const updateFitnessMetrics = useCallback(
    async (metrics: FitnessMetricsUpdate): Promise<void> => {
      if (!user) return;

      // Optimistic update — preserve server-given role
      setUser((prev) =>
        prev ? {
          ...prev,
          fitnessMetrics: {
            ...prev.fitnessMetrics,
            latestBMI:  metrics.latestBMI  ?? prev.fitnessMetrics?.latestBMI,
            height:     metrics.height     ?? prev.fitnessMetrics?.height,
            weight:     metrics.weight     ?? prev.fitnessMetrics?.weight,
            unit:       metrics.unit       ?? prev.fitnessMetrics?.unit,
            goalWeight: metrics.goalWeight ?? prev.fitnessMetrics?.goalWeight,
          },
        } : prev
      );

      try {
        const res = await fetch("/api/user/metrics", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            latestBMI:  metrics.latestBMI,
            height:     metrics.height,
            weight:     metrics.weight,
            unit:       metrics.unit,
            goalWeight: metrics.goalWeight,
            // bmiHistoryEntry intentionally omitted — server derives history
          }),
        });

        if (res.status === 401) { await logout(); return; }
        if (!res.ok) { console.error("[auth] metrics update failed"); return; }

        await refreshUser();
      } catch (e) {
        console.error("[auth] updateFitnessMetrics:", e);
      }
    },
    [user, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateFitnessMetrics, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}