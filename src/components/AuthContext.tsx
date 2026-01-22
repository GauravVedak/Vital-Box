import { createContext, useContext, useState, ReactNode } from "react";

interface FitnessMetrics {
  bmi?: number;
  height?: number;
  weight?: number;
  unit?: "metric" | "imperial";
  goals?: string[];
  lastCalculated?: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  fitnessMetrics?: FitnessMetrics;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSocial: (provider: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateFitnessMetrics: (metrics: FitnessMetrics) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "";

  const login = async (email: string, password: string): Promise<boolean> => {
<<<<<<< HEAD
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock successful login
    setUser({
      id: "1",
      name: email.split("@")[0],
      email: email,
      role: password === "admin123" ? "admin" : "user",
    });
    return true;
=======
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setUser({
        id: data.user.email, // or data.user.id if available
        name: data.user.name || data.user.email.split("@")[0],
        email: data.user.email,
      });
      return true;
    } catch {
      return false;
    }
>>>>>>> 97d42e2b9301784ed0ecc25ac9970eba71b71e93
  };

  const loginWithSocial = async (provider: string): Promise<boolean> => {
    // Simulate social login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setUser({
      id: "1",
      name: `User from ${provider}`,
      email: `user@${provider.toLowerCase()}.com`,
      role: "user",
    });
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
<<<<<<< HEAD
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock successful signup
    setUser({
      id: "1",
      name: name,
      email: email,
      role: password === "admin123" ? "admin" : "user",
    });
    return true;
=======
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        return false;
      }
      // Optionally auto-login after signup
      return await login(email, password);
    } catch {
      return false;
    }
>>>>>>> 97d42e2b9301784ed0ecc25ac9970eba71b71e93
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateFitnessMetrics = (metrics: FitnessMetrics) => {
    if (user) {
      setUser({
        ...user,
        fitnessMetrics: {
          ...user.fitnessMetrics,
          ...metrics,
          lastCalculated: new Date(),
        },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithSocial, signup, logout, updateFitnessMetrics }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
