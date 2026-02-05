"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface SignUpPageProps {
  onSwitchToSignIn: () => void;
  onSuccess: (redirectTo?: string) => void;
}

export function SignUpPage({ onSwitchToSignIn, onSuccess }: SignUpPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const res = await signup(fullName, email, password);

    setIsLoading(false);

    if (!res.ok) {
      setError(res.message || "Failed to create account.");
      toast.error(res.message || "Failed to create account.");
      return;
    }

    toast.success("Account created successfully!");
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfeff,_#f9fafb_45%,_#eef2ff)] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-soft-light" />

      <div className="relative z-10 w-full max-w-5xl flex justify-center">
        <Card className="w-full max-w-xl p-8 md:p-10 rounded-[2.25rem] shadow-2xl bg-white/95 backdrop-blur-md border border-gray-100">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              Create your account
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Join Vital Box and start your health journey.
            </p>
          </div>

          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
              Sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm md:text-base font-medium shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your account…
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <LogIn className="w-4 h-4" />
                  Create account
                </span>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 pt-6">
            <Separator className="flex-1" />
            <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
              Already have an account?
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={onSwitchToSignIn}
              className="w-full h-12 rounded-full border-gray-200 text-sm md:text-base hover:border-emerald-400"
            >
              <span className="flex items-center gap-3 justify-center">
                <LogIn className="w-4 h-4" />
                Sign in instead
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
