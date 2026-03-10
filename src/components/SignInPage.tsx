"use client";

/**
 * SignInPage.tsx
 *
 * Security fixes:
 *  ✓ "Login as admin" checkbox completely removed — role is server-determined
 *  ✓ asAdmin is no longer passed to login() (AuthContext no longer accepts it)
 *  ✓ onSuccess no longer receives "admin-panel" redirect hint from client
 *    — the parent should read user.role from AuthContext after login completes
 *  ✓ Client-side input trimming before sending (prevents whitespace-only submissions)
 *  ✓ Email lowercased client-side to match server normalization
 *  ✓ Password length pre-checked to avoid unnecessary round trips
 *  ✓ Rate-limit response (429) surfaced with appropriate message
 *  ✓ Account locked response (423) surfaced clearly
 *  ✓ All UI imports migrated away from ./ui/* — uses only CSS Module styling
 *    (change the imports below if your project keeps the ui folder)
 */

import { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import styles from "./SignInPage.module.css";

interface SignInPageProps {
  onSwitchToSignUp: () => void;
  /**
   * Called on successful login.
   * Do NOT use this to determine admin redirect — read user.role from useAuth()
   * after onSuccess fires instead.
   */
  onSuccess: () => void;
}

export function SignInPage({ onSwitchToSignUp, onSuccess }: SignInPageProps) {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Client-side pre-validation ─────────────────────────────────────────
    const trimmedEmail    = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email and password.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Basic email format check — server validates strictly, this is UX only
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // ── No asAdmin — role comes from the server ────────────────────────────
    const res = await login(trimmedEmail, trimmedPassword);

    setIsLoading(false);

    if (!res.ok) {
      // Surface specific server messages for lockout / rate limit
      setError(res.message ?? "Login failed. Please check your credentials.");
      toast.error(res.message ?? "Login failed.");
      return;
    }

    toast.success("Welcome back!");
    onSuccess();
    // Caller reads user.role from useAuth() to decide where to navigate
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Sparkles className={styles.icon} />
          </div>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>
            Sign in to Vital Box to continue your health journey.
          </p>
        </div>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>Sign in with email</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.form} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label htmlFor="signin-email" className={styles.label}>
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={styles.input}
              maxLength={254}
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="signin-password" className={styles.label}>
                Password
              </label>
              {/* Forgot password — disabled until implemented */}
              <span className={styles.forgotDisabled}>Forgot password?</span>
            </div>
            <div className={styles.passwordWrap}>
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`${styles.input} ${styles.inputPadRight}`}
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={styles.eyeBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className={styles.eyeIcon} />
                ) : (
                  <Eye className={styles.eyeIcon} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <Loader2 className={`${styles.btnIcon} ${styles.spin}`} />
                Signing you in…
              </>
            ) : (
              <>
                <LogIn className={styles.btnIcon} />
                Sign in to Vital Box
              </>
            )}
          </button>
        </form>

        {/* Switch to signup */}
        <div className={styles.switchRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>New to Vital Box?</span>
          <span className={styles.dividerLine} />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={onSwitchToSignUp}
          className={styles.switchBtn}
        >
          <LogIn className={styles.btnIcon} />
          Create a new account
        </button>
      </div>
    </div>
  );
}