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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock successful login
    setUser({
      id: "1",
      name: email.split("@")[0],
      email: email,
    });
    return true;
  };

  const loginWithSocial = async (provider: string): Promise<boolean> => {
    // Simulate social login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setUser({
      id: "1",
      name: `User from ${provider}`,
      email: `user@${provider.toLowerCase()}.com`,
    });
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock successful signup
    setUser({
      id: "1",
      name: name,
      email: email,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
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
