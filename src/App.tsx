import { useState, useEffect } from "react";
import { MinimalNavbar } from "./components/MinimalNavbar";
import { HomePage } from "./components/HomePage";
import { AIAdvisorPage } from "./components/AIAdvisorPage";
import { ChooseBoxPage } from "./components/ChooseBoxPage";
import { BMICalculatorPage } from "./components/BMICalculatorPage";
import { SignInPage } from "./components/SignInPage";
import { SignUpPage } from "./components/SignUpPage";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { AIRecommendationProvider } from "./components/AIRecommendationEngine";
import { Toaster } from "./components/ui/sonner";

// Main app content with authentication checks
function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [intendedPage, setIntendedPage] = useState<string | null>(null);
  const { user } = useAuth();

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
  const protectedPages = ["bmi", "ai-advisor", "choose-box"];
  const isProtectedPage = protectedPages.includes(currentPage);

  // If user tries to access protected page without being logged in
  useEffect(() => {
    if (isProtectedPage && !user && !authMode) {
      setIntendedPage(currentPage);
      setAuthMode("signin");
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

  const handleAuthSuccess = () => {
    setAuthMode(null);
    // If user was trying to access a protected page, redirect them there
    if (intendedPage) {
      window.location.hash = `#${intendedPage}`;
      setIntendedPage(null);
    } else {
      window.location.hash = "#home";
    }
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
        <MinimalNavbar onSignInClick={handleSignInClick} />
        {currentPage === "bmi" && user && <BMICalculatorPage onSignInClick={handleSignInClick} />}
        {currentPage === "ai-advisor" && user && <AIAdvisorPage onSignInClick={handleSignInClick} />}
        {currentPage === "choose-box" && user && <ChooseBoxPage onSignInClick={handleSignInClick} />}
        {currentPage === "home" && <HomePage />}
      </div>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AIRecommendationProvider>
        <AppContent />
      </AIRecommendationProvider>
    </AuthProvider>
  );
}