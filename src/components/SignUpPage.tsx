"use client";

/**
 * SignUpPage.tsx
 *
 * Security fixes:
 *  ✓ All inputs trimmed before sending — no whitespace-only submissions
 *  ✓ Email lowercased client-side to match server normalization
 *  ✓ Password validation aligned with server rules (8–128 chars, letter + digit)
 *  ✓ Name validated client-side (letters, spaces, hyphens only — matches server regex)
 *  ✓ Confirm password check before any network call
 *  ✓ Rate-limit (429) and IP cap (400 generic) responses surfaced clearly
 *  ✓ No sensitive data stored or logged client-side
 *  ✓ maxLength attributes on all inputs — belt-and-suspenders before server
 *  ✓ Migrated from ./ui/* imports to CSS Module
 */

import { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import styles from "./SignUpPage.module.css";

interface SignUpPageProps {
  onSwitchToSignIn: () => void;
  onSuccess:        () => void;
}

// Must match the server-side name regex in signup/route.ts
const NAME_RE = /^[\p{L}\p{M}' \-]{1,60}$/u;

export function SignUpPage({ onSwitchToSignIn, onSuccess }: SignUpPageProps) {
  const [fullName,            setFullName]            = useState("");
  const [email,               setEmail]               = useState("");
  const [password,            setPassword]            = useState("");
  const [confirmPassword,     setConfirmPassword]     = useState("");
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading,           setIsLoading]           = useState(false);
  const [error,               setError]               = useState<string | null>(null);

  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Client-side pre-validation ─────────────────────────────────────────
    const trimmedName     = fullName.trim();
    const trimmedEmail    = email.trim().toLowerCase();
    const trimmedPassword = password; // don't trim passwords — spaces may be intentional

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Name: letters, spaces, hyphens, apostrophes only (matches server regex)
    if (!NAME_RE.test(trimmedName)) {
      setError("Name may only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }

    if (trimmedName.length > 60) {
      setError("Name must be 60 characters or fewer.");
      return;
    }

    // Basic email format check (server validates strictly)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password rules aligned with server policy
    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (trimmedPassword.length > 128) {
      setError("Password must be 128 characters or fewer.");
      return;
    }
    if (!/[a-zA-Z]/.test(trimmedPassword)) {
      setError("Password must contain at least one letter.");
      return;
    }
    if (!/[0-9]/.test(trimmedPassword)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (trimmedPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    const res = await signup(trimmedName, trimmedEmail, trimmedPassword);

    setIsLoading(false);

    if (!res.ok) {
      setError(res.message ?? "Failed to create account.");
      toast.error(res.message ?? "Failed to create account.");
      return;
    }

    toast.success("Account created! Welcome to Vital Box.");
    onSuccess();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Sparkles className={styles.icon} />
          </div>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>
            Join Vital Box and start your health journey.
          </p>
        </div>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>Sign up with email</span>
          <span className={styles.dividerLine} />
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Full name */}
          <div className={styles.field}>
            <label htmlFor="signup-name" className={styles.label}>
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className={styles.input}
              maxLength={60}
            />
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label htmlFor="signup-email" className={styles.label}>
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            <p className={styles.hint}>
              8–128 characters, at least one letter and one number.
            </p>
          </div>

          {/* Confirm password */}
          <div className={styles.field}>
            <label htmlFor="signup-confirm" className={styles.label}>
              Confirm password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="signup-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={`${styles.input} ${styles.inputPadRight}`}
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className={styles.eyeBtn}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
                Creating your account…
              </>
            ) : (
              <>
                <LogIn className={styles.btnIcon} />
                Create account
              </>
            )}
          </button>
        </form>

        {/* Switch to sign in */}
        <div className={styles.switchRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>Already have an account?</span>
          <span className={styles.dividerLine} />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={onSwitchToSignIn}
          className={styles.switchBtn}
        >
          <LogIn className={styles.btnIcon} />
          Sign in instead
        </button>
      </div>
    </div>
  );
}