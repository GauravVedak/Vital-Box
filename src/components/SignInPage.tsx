"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Shield, Loader2, LogIn, Eye, EyeOff, Sparkles } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
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

    // pass the intent to the auth layer
    const res = await login(email, password, { asAdmin: isAdminLogin });
    setIsLoading(false);

    if (!res.ok) {
      setError(res.message || "Login failed.");
      toast.error(res.message || "Login failed.");
      return;
    }

    toast.success("Welcome back!");
    // if backend/session says user is admin, you can redirect to /admin here
    // otherwise default dashboard
    onSuccess(isAdminLogin ? "admin-panel" : "home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfeff,_#f9fafb_45%,_#eef2ff)] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-soft-light" />

      <div className="relative z-10 w-full max-w-5xl flex justify-center">
        <Card className="w-full max-w-xl p-8 md:p-10 rounded-[2.25rem] shadow-2xl bg-white/95 backdrop-blur-md border border-gray-100">
          {/* Logo + title */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Sign in to Vital Box to continue your health journey.
            </p>
          </div>

          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
              Sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-[11px] text-gray-500 hover:text-gray-700 transition-colors"
                  disabled
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Admin login toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="select-none">
                  Login as admin
                </span>
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
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

          {/* Divider + switch */}
          <div className="flex items-center gap-4 pt-6">
            <Separator className="flex-1" />
            <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
              New to Vital Box?
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="mt-4 text-center">
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
        </Card>
      </div>
    </div>
  );
}
