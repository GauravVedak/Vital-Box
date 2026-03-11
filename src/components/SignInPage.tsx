"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import styles from "./SignInPage.module.css";

interface SignInPageProps {
  onSwitchToSignUp: () => void;
  onSuccess: (redirectTo?: string) => void;
  onBack: () => void;
}

export function SignInPage({ onSwitchToSignUp, onSuccess, onBack }: SignInPageProps) {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail    = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email.");
      return;
    }
    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const res = await login(trimmedEmail, trimmedPassword);
    setIsLoading(false);

    if (!res.ok) {
      setError(res.message ?? "Invalid credentials.");
      toast.error(res.message ?? "Login failed.");
      return;
    }

    toast.success("Welcome back.");
    onSuccess();
  };

  return (
    <div className={styles.root}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.orb}  aria-hidden />

      <button
        type="button"
        className={styles.back}
        onClick={onBack}
        aria-label="Back to home"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>Vital Box</span>
        </div>

        <h1 className={styles.heading}>Sign in</h1>
        <p className={styles.sub}>Continue your health journey.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="si-email" className={styles.label}>Email</label>
            <input
              id="si-email"
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

          <div className={styles.field}>
            <label htmlFor="si-password" className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <input
                id="si-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`${styles.input} ${styles.inputPr}`}
                maxLength={128}
              />
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" disabled={isLoading} className={styles.submit}>
            {isLoading
              ? <><Loader2 size={15} className={styles.spin} /> Signing in…</>
              : "Sign in"}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <button
          type="button"
          className={styles.ghost}
          onClick={onSwitchToSignUp}
          disabled={isLoading}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}