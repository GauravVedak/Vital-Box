"use client";

import { useState } from "react";
import { SignInPage } from "@/components/SignInPage";
import { SignUpPage } from "@/components/SignUpPage";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return mode === "signin" ? (
    <SignInPage onSwitchToSignUp={() => setMode("signup")} />
  ) : (
    <SignUpPage onSwitchToSignIn={() => setMode("signin")} />
  );
}
