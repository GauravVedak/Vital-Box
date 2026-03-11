import { useState, useEffect, useRef } from "react";
import { MinimalNavbar } from "./components/MinimalNavbar";
import { HomePage } from "./components/HomePage";
import { AIAdvisorPage } from "./components/AIAdvisorPage";
import { BMICalculatorPage } from "./components/bmi-calculator/BMICalculatorPage";
import { SignInPage } from "./components/SignInPage";
import { SignUpPage } from "./components/SignUpPage";
import { UserPanel } from "./components/UserPanel";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { AdminPanel } from "./components/AdminPanel";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [intendedPage, setIntendedPage] = useState<string | null>(null);
  const { user } = useAuth();

  const hasQueuedAuthRef = useRef(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setCurrentPage(hash || "home");
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const protectedPages = ["bmi", "ai-advisor", "user-panel", "admin-panel"];
  const isProtectedPage = protectedPages.includes(currentPage);

  useEffect(() => {
    if (!isProtectedPage || user || authMode) {
      hasQueuedAuthRef.current = false;
      return;
    }
    if (!hasQueuedAuthRef.current) {
      hasQueuedAuthRef.current = true;
      setTimeout(() => {
        setIntendedPage((prev) => prev ?? currentPage);
        setAuthMode((prev) => prev ?? "signin");
      }, 0);
    }
  }, [currentPage, user, authMode, isProtectedPage]);

  const handleSignInClick = () => setAuthMode("signin");
  const handleSwitchToSignUp = () => setAuthMode("signup");
  const handleSwitchToSignIn = () => setAuthMode("signin");

  // Called on successful login/signup
  const handleAuthSuccess = (redirectTo?: string) => {
    setAuthMode(null);
    hasQueuedAuthRef.current = false;

    if (redirectTo) {
      window.location.hash = `#${redirectTo}`;
      setIntendedPage(null);
      return;
    }
    if (intendedPage) {
      window.location.hash = `#${intendedPage}`;
      setIntendedPage(null);
      return;
    }
    window.location.hash = "#home";
  };

  // Called when user presses Back on auth pages — never redirects to intendedPage
  const handleAuthDismiss = () => {
    setAuthMode(null);
    setIntendedPage(null);
    hasQueuedAuthRef.current = false;
    window.location.hash = "#home";
  };

  if (authMode === "signin") {
    return (
      <>
        <SignInPage
          onSwitchToSignUp={handleSwitchToSignUp}
          onSuccess={handleAuthSuccess}
          onBack={handleAuthDismiss}
        />
        <Toaster />
      </>
    );
  }

  if (authMode === "signup") {
    return (
      <>
        <SignUpPage
          onSwitchToSignIn={handleSwitchToSignIn}
          onSuccess={handleAuthSuccess}
          onBack={handleAuthDismiss}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="relative z-10">
        {currentPage === "user-panel" && user ? (
          <UserPanel />
        ) : currentPage === "admin-panel" && user?.role === "admin" ? (
          <AdminPanel />
        ) : (
          <>
            <MinimalNavbar onSignInClick={handleSignInClick} />
            {currentPage === "bmi" && user && (
              <BMICalculatorPage onSignInClick={handleSignInClick} />
            )}
            {currentPage === "ai-advisor" && user && <AIAdvisorPage />}
            {currentPage === "home" && <HomePage />}
          </>
        )}
      </div>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}