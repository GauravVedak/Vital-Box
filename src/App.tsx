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

//First Deployment: 2026-02-22
// Deployment made by: Naveed Ahmed Syed

// Main app content with authentication checks
function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [intendedPage, setIntendedPage] = useState<string | null>(null);
  const { user } = useAuth();

  // Guard to avoid repeated auth redirects
  const hasQueuedAuthRef = useRef(false);

  useEffect(() => {
    // Handle hash changes for navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage("home");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Protected pages that require authentication
  const protectedPages = ["bmi", "ai-advisor", "user-panel"];
  const isProtectedPage = protectedPages.includes(currentPage);

  // If user tries to access protected page without being logged in
  useEffect(() => {
    if (!isProtectedPage || user || authMode) {
      // When not in the redirect condition, reset the guard
      hasQueuedAuthRef.current = false;
      return;
    }

    if (!hasQueuedAuthRef.current) {
      hasQueuedAuthRef.current = true;

      // Defer state updates so they are not considered "synchronous" in the effect
      setTimeout(() => {
        setIntendedPage((prev) => prev ?? currentPage);
        setAuthMode((prev) => prev ?? "signin");
      }, 0);
    }
  }, [currentPage, user, authMode, isProtectedPage]);

  const handleSignInClick = () => {
    setAuthMode("signin");
  };

  const handleSwitchToSignUp = () => {
    setAuthMode("signup");
  };

  const handleSwitchToSignIn = () => {
    setAuthMode("signin");
  };

  const handleAuthSuccess = (redirectTo?: string) => {
    setAuthMode(null);
    hasQueuedAuthRef.current = false;

    if (redirectTo) {
      window.location.hash = `#${redirectTo}`;
      setIntendedPage(null);
      return;
    }
    // If user was trying to access a protected page, redirect them there
    if (intendedPage) {
      window.location.hash = `#${intendedPage}`;
      setIntendedPage(null);
      return;
    }
    window.location.hash = "#home";
  };

  // Show authentication pages
  if (authMode === "signin") {
    return (
      <>
        <SignInPage
          onSwitchToSignUp={handleSwitchToSignUp}
          onSuccess={handleAuthSuccess}
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
        />
        <Toaster />
      </>
    );
  }

  // Show other pages
  return (
    <>
      <div className="relative z-10">
        {currentPage === "user-panel" && user ? (
          <UserPanel />
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
