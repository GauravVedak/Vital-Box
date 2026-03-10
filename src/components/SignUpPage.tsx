"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import styles from "./SignUpPage.module.css";

interface SignUpPageProps {
  onSwitchToSignIn: () => void;
  onSuccess: (redirectTo?: string) => void;
}

const NAME_RE = /^[\p{L}\p{M}' \-]{1,60}$/u;

// “Reasonable” email, with some extra constraints:
// - local part: 2–64 chars, letters/digits and _.+-
// - domain: at least two labels, each 2+ chars, letters/digits/hyphens
// - TLD: 2+ letters
const EMAIL_RE =
  /^(?=.{6,254}$)([A-Za-z0-9](?:[A-Za-z0-9._+-]{0,62}[A-Za-z0-9])?)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

// Password: 8–128 chars, at least 1 lowercase, 1 uppercase, 1 digit, 1 symbol
// Allowed symbols: @$!%*#?&^_-+=
const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^_\-+=])[A-Za-z\d@$!%*#?&^_\-+=]{8,128}$/;

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

  const validateInputs = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !confirmPassword) {
      return "Please fill in all fields.";
    }

    if (!NAME_RE.test(trimmedName)) {
      return "Name may only contain letters, spaces, hyphens, and apostrophes.";
    }

    if (!EMAIL_RE.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    // Extra semantic checks to avoid things like a@test.com, a@a.com, a@a
    const [localPart, domainPart] = trimmedEmail.split("@");
    if (!localPart || !domainPart) {
      return "Please enter a valid email address.";
    }

    // Require at least 2 chars in local part and each domain label
    if (localPart.length < 2) {
      return "Email local part is too short.";
    }

    const domainLabels = domainPart.split(".");
    if (domainLabels.length < 2) {
      return "Email domain must include a dot and a valid TLD.";
    }
    if (domainLabels.some((label) => label.length < 2)) {
      return "Each part of the email domain must be at least 2 characters.";
    }

    if (!PASSWORD_RE.test(trimmedPassword)) {
      return "Password must be 8–128 characters and include an uppercase letter, lowercase letter, number, and symbol.";
    }

    if (trimmedPassword !== confirmPassword) {
      return "Passwords don't match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    const res = await signup(trimmedName, trimmedEmail, trimmedPassword);
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
      <div className={styles.orb} aria-hidden />

      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>Vital Box</span>
        </div>

        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>Start your health journey today.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="su-name" className={styles.label}>
              Full name
            </label>
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
            <label htmlFor="su-email" className={styles.label}>
              Email
            </label>
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
            <label htmlFor="su-password" className={styles.label}>
              Password
            </label>
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
            <span className={styles.hint}>
              8–128 characters · at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="su-confirm" className={styles.label}>
              Confirm password
            </label>
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

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className={styles.submit}>
            {isLoading ? (
              <>
                <Loader2 size={15} className={styles.spin} /> Creating account…
              </>
            ) : (
              "Create account"
            )}
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
