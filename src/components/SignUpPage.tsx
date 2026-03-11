"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import styles from "./SignUpPage.module.css";

interface SignUpPageProps {
  onSwitchToSignIn: () => void;
  onSuccess: (redirectTo?: string) => void;
  onBack: () => void;
}

const NAME_RE = /^[\p{L}\p{M}' \-]{1,60}$/u;

export function SignUpPage({ onSwitchToSignIn, onSuccess, onBack }: SignUpPageProps) {
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

    const name = fullName.trim();
    const em   = email.trim().toLowerCase();
    const pw   = password;

    if (!name || !em || !pw || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!NAME_RE.test(name)) {
      setError("Name may only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (pw.length < 8 || pw.length > 128) {
      setError("Password must be 8–128 characters.");
      return;
    }
    if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }
    if (pw !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    const res = await signup(name, em, pw);
    setIsLoading(false);

    if (!res.ok) {
      setError(res.message ?? "Failed to create account.");
      toast.error(res.message ?? "Signup failed.");
      return;
    }

    toast.success("Account created. Welcome to Vital Box.");
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

        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>Start your health journey today.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="su-name" className={styles.label}>Full name</label>
            <input
              id="su-name"
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

          <div className={styles.field}>
            <label htmlFor="su-email" className={styles.label}>Email</label>
            <input
              id="su-email"
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
            <label htmlFor="su-password" className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <input
                id="su-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            <span className={styles.hint}>8–128 characters · at least one letter and one number</span>
          </div>

          <div className={styles.field}>
            <label htmlFor="su-confirm" className={styles.label}>Confirm password</label>
            <div className={styles.inputWrap}>
              <input
                id="su-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={`${styles.input} ${styles.inputPr}`}
                maxLength={128}
              />
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" disabled={isLoading} className={styles.submit}>
            {isLoading
              ? <><Loader2 size={15} className={styles.spin} /> Creating account…</>
              : "Create account"}
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
          onClick={onSwitchToSignIn}
          disabled={isLoading}
        >
          Sign in instead
        </button>
      </div>
    </div>
  );
}