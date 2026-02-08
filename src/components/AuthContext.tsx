"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface BMIHistoryEntry {
  value: number;
  category: string;
  height: number;
  weight: number;
  unit: "metric" | "imperial";
  date: string; // ISO string
}

interface LatestBMI {
  value: number;
  category: string;
  height: number;
  weight: number;
  unit: "metric" | "imperial";
  date: string; // ISO string
}

interface FitnessMetrics {
  latestBMI?: LatestBMI;
  bmiHistory?: BMIHistoryEntry[];
  height?: number;
  weight?: number;
  unit?: "metric" | "imperial";
  goalWeight?: number;
  goals?: string[];
  lastCalculated?: string; // ISO string
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  fitnessMetrics?: FitnessMetrics;
}

interface AuthResult {
  ok: boolean;
  message?: string;
}

interface FitnessMetricsUpdate {
  latestBMI?: LatestBMI;
  height?: number;
  weight?: number;
  unit?: "metric" | "imperial";
  goalWeight?: number;
  bmiHistoryEntry?: BMIHistoryEntry;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateFitnessMetrics: (metrics: FitnessMetricsUpdate) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "currentUser";
const TOKEN_CHECK_INTERVAL = 60000; // Check every 60 seconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on first render
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      saveUser(null);
      if (typeof window !== "undefined") {
        window.location.hash = "#home";
      }
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          await logout();
        }
        return;
      }

      const data = await res.json();
      if (data.user) {
        const u: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "user",
          fitnessMetrics: data.user.fitnessMetrics,
        };
        saveUser(u);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  // Auto-logout when token expires
  useEffect(() => {
    if (!user) return;

    const checkTokenValidity = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok || res.status === 401) {
          // Token expired or invalid - logout
          console.log("Token expired, logging out...");
          await logout();
        }
      } catch (err) {
        console.error("Token check failed:", err);
      }
    };

    // Check immediately on mount if user exists
    checkTokenValidity();

    // Then check periodically
    const interval = setInterval(checkTokenValidity, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || data.error || "Login failed" };
      }

      if (data.user) {
        const u: User = {
          id: data.user.id,
          name: data.user.name ?? data.user.email,
          email: data.user.email,
          role: "user",
          fitnessMetrics: data.user.fitnessMetrics,
        };
        saveUser(u);
      }

      return { ok: true };
    } catch (err) {
      console.error("Error during login:", err);
      return { ok: false, message: "Something went wrong. Please try again." };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || data.error || "Signup failed" };
      }

      if (data.user) {
        const u: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: "user",
          fitnessMetrics: data.user.fitnessMetrics,
        };
        saveUser(u);
      }

      return { ok: true };
    } catch (err) {
      console.error("Error during signup:", err);
      return { ok: false, message: "Something went wrong. Please try again." };
    }
  };

  const updateFitnessMetrics = async (metrics: FitnessMetricsUpdate) => {
    if (!user) return;

    // Optimistically update local state first
    const updatedUser: User = {
      ...user,
      fitnessMetrics: {
        ...user.fitnessMetrics,
        latestBMI: metrics.latestBMI ?? user.fitnessMetrics?.latestBMI,
        height: metrics.height ?? user.fitnessMetrics?.height,
        weight: metrics.weight ?? user.fitnessMetrics?.weight,
        unit: metrics.unit ?? user.fitnessMetrics?.unit,
        goalWeight: metrics.goalWeight ?? user.fitnessMetrics?.goalWeight,
      },
    };
    saveUser(updatedUser);

    try {
      const res = await fetch("/api/user/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          latestBMI: metrics.latestBMI,
          height: metrics.height,
          weight: metrics.weight,
          unit: metrics.unit,
          goalWeight: metrics.goalWeight,
          bmiHistoryEntry: metrics.bmiHistoryEntry,
        }),
      });

      // If token expired during this call, logout
      if (res.status === 401) {
        console.log("Token expired during metrics update, logging out...");
        await logout();
        return;
      }

      if (!res.ok) {
        console.error("Failed to persist fitness metrics");
        return;
      }

      // Sync with server response
      await refreshUser();
    } catch (e) {
      console.error("Failed to persist fitness metrics", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateFitnessMetrics,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
