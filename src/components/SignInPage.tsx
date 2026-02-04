"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Shield, Loader2, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface SignInPageProps {
  onSwitchToSignUp: () => void;
  onSuccess: (redirectTo?: string) => void;
}

export function SignInPage({ onSwitchToSignUp, onSuccess }: SignInPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await login(email, password);

    setIsLoading(false);

    if (!res.ok) {
      setError(res.message || "Login failed.");
      toast.error(res.message || "Login failed.");
      return;
    }

    toast.success("Welcome back!");
    onSuccess();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfeff,_#f9fafb_45%,_#eef2ff)]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-soft-light" />

      <div className="relative z-10 w-full max-w-5xl px-4 py-16 flex justify-center">
        <Card className="w-full max-w-xl rounded-[2.25rem] border border-gray-100 bg-white/95 backdrop-blur-md shadow-2xl">
          <div className="px-8 md:px-10 py-10 space-y-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Vital Box
              </span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Welcome back
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Sign in with your email to continue to your supplement plan.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 pt-1">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-1 w-full h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm md:text-base font-medium shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing you in…
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Shield className="w-4 h-4" />
                    Sign in to Vital Box
                  </span>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-4 pt-1">
              <Separator className="flex-1" />
              <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                New to Vital Box?
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={onSwitchToSignUp}
                className="w-full h-12 rounded-full border-gray-200 text-sm md:text-base hover:border-emerald-400"
              >
                <span className="flex items-center gap-3 justify-center">
                  <LogIn className="w-4 h-4" />
                  Create a new account
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
