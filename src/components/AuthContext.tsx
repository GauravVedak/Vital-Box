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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateFitnessMetrics: (metrics: FitnessMetrics) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "currentUser";

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

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => {});
    } finally {
      saveUser(null);
      if (typeof window !== "undefined") {
        window.location.hash = "#home";
      }
    }
  };

 const updateFitnessMetrics = async (metrics: FitnessMetrics) => {
  if (!user) return;

  const now = new Date().toISOString();
  const latestBMI = metrics.latestBMI ?? user.fitnessMetrics?.latestBMI;

  const previousHistory = user.fitnessMetrics?.bmiHistory ?? [];
  const historyEntry =
    latestBMI != null
      ? {
          value: latestBMI.value,
          category: latestBMI.category,
          date: latestBMI.date ?? now,
        }
      : undefined;

  const updatedHistory = historyEntry
    ? [...previousHistory, historyEntry]
    : previousHistory;

  const updatedMetrics: FitnessMetrics = {
    ...user.fitnessMetrics,
    ...metrics,
    latestBMI,
    bmiHistory: updatedHistory,
    lastCalculated: now,
  };

  const updatedUser: User = { ...user, fitnessMetrics: updatedMetrics };
  saveUser(updatedUser);

  try {
    await fetch("/api/user/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        latestBMI,
        height: updatedMetrics.height,
        weight: updatedMetrics.weight,
        unit: updatedMetrics.unit,
        bmiHistoryEntry: historyEntry,
        lastCalculated: updatedMetrics.lastCalculated,
      }),
    });
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
