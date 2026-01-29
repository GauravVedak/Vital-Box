import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

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

interface AuthResult {
  ok: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSocial: (provider: string) => Promise<boolean>;
  loginWithAuth0: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateFitnessMetrics: (metrics: FitnessMetrics) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [fitnessMetrics, setFitnessMetrics] = useState<
    FitnessMetrics | undefined
  >();

  // Sync Auth0 user with local user state
  useEffect(() => {
    if (auth0User) {
      setLocalUser({
        id: auth0User.sub || "auth0-user",
        name: auth0User.name || auth0User.nickname || "User",
        email: auth0User.email || "",
        avatar: auth0User.picture || undefined,
        role: auth0User.email?.includes("admin") ? "admin" : "user",
        fitnessMetrics: fitnessMetrics,
      });
    } else if (!auth0Loading) {
      setLocalUser(null);
    }
  }, [auth0User, auth0Loading, fitnessMetrics]);

  // Sync Auth0 user to MongoDB when user logs in
  useEffect(() => {
    if (auth0User && !auth0Loading) {
      console.log("Auth0 user detected, syncing to MongoDB...", {
        auth0UserId: auth0User.sub,
        email: auth0User.email,
      });

      const syncUserToMongoDB = async () => {
        try {
          const response = await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("✅ User synced to MongoDB successfully:", {
              status: data.status,
              userId: data.user?.id,
              email: data.user?.email,
              auth0UserId: data.user?.auth0UserId,
            });
          } else {
            const errorData = await response.json();
            console.error("❌ Failed to sync user to MongoDB:", errorData);
          }
        } catch (error) {
          console.error("❌ Error syncing user to MongoDB:", error);
        }
      };

      syncUserToMongoDB();
    }
  }, [auth0User, auth0Loading]);

  const API_BASE =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "";

  // Redirect to Auth0 login
  const loginWithAuth0 = () => {
    window.location.href = "/auth/login";
  };

  // Legacy login function - now redirects to Auth0
  const login = async (email: string, password: string): Promise<boolean> => {
    // Redirect to Auth0 for authentication
    window.location.href = "/auth/login";
    return true;
  };

  // Social login - redirects to Auth0 with connection hint (Google only)
  const loginWithSocial = async (provider: string): Promise<boolean> => {
    const connectionMap: Record<string, string> = {
      Google: "google-oauth2",
    };
    const connection = connectionMap[provider] || provider.toLowerCase();
    window.location.href = `/auth/login?connection=${connection}`;
    return true;
  };

  // Signup - redirects to Auth0 signup
  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    window.location.href = "/auth/login?screen_hint=signup";
    return true;
  };

  // Logout - redirects to Auth0 logout
  const logout = () => {
    window.location.href = "/auth/logout";
  };

  const updateFitnessMetrics = (metrics: FitnessMetrics) => {
    const updatedMetrics = {
      ...fitnessMetrics,
      ...metrics,
      lastCalculated: new Date(),
    };
    setFitnessMetrics(updatedMetrics);

    if (localUser) {
      setLocalUser({
        ...localUser,
        fitnessMetrics: updatedMetrics,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: localUser,
        isLoading: auth0Loading,
        login,
        loginWithSocial,
        loginWithAuth0,
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
