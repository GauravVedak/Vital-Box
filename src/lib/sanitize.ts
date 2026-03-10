/**
 * src/lib/sanitize.ts
 *
 * Central security utilities — import from here across every API route.
 *
 * Coverage:
 *  - String sanitization (HTML, null bytes, control chars, JS injection)
 *  - Email + password validation
 *  - Numeric clamping with hard physical bounds
 *  - Proxy-aware IP extraction (Cloudflare → X-Forwarded-For → X-Real-IP)
 *  - Body size guard (blocks giant JSON payloads before parse)
 *  - In-memory sliding-window rate limiter (zero dependencies)
 *  - Response header helpers
 */

import { NextResponse } from "next/server";

// ─── String sanitization ──────────────────────────────────────────────────────

/** Strip script blocks, HTML tags, JS event attrs, dangerous control characters. */
export function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\0/g, "")
    .trim();
}

/**
 * Sanitize a string from untrusted input.
 * Rejects non-strings, strips HTML/control chars, hard-truncates to maxLength.
 * Returns null if the result is empty after sanitization.
 */
export function sanitizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  // Reject strings grotesquely over limit before any processing
  if (value.length > maxLength * 4) return null;
  const cleaned = stripHtml(value).slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

/** Strict email validation — RFC 5322 simplified. */
export function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  if (email.includes("..")) return false;
  if (/[\s<>()[\]\\,;:"]/.test(email)) return false;
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Password policy: 8–128 chars, at least one letter, at least one digit,
 * not whitespace-only.
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 128) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (/^\s+$/.test(password)) return false;
  return true;
}

// ─── Numeric clamping ─────────────────────────────────────────────────────────

/**
 * Parse + clamp a number to [min, max].
 * Returns null for NaN, Infinity, non-numeric, or out-of-range values.
 * Result is rounded to 1 decimal place.
 */
export function clampNumber(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n) || isNaN(n)) return null;
  if (n < min || n > max) return null;
  return Math.round(n * 10) / 10;
}

/** Strict unit type guard — only "metric" or "imperial". */
export function isValidUnit(value: unknown): value is "metric" | "imperial" {
  return value === "metric" || value === "imperial";
}

// ─── Body size guard ──────────────────────────────────────────────────────────

/**
 * Read the raw request body as text and enforce a hard byte limit.
 * Prevents oversized JSON payloads from reaching JSON.parse or MongoDB.
 *
 * Call this BEFORE req.json() on every mutating endpoint.
 *
 * @param req      Incoming Request
 * @param maxBytes Max allowed payload size in bytes (default 4 KB)
 */
export async function safeReadBody(
  req: Request,
  maxBytes = 4096
): Promise<{ ok: true; text: string } | { ok: false; response: Response }> {
  let text: string;
  try {
    text = await req.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Could not read request body." },
        { status: 400 }
      ),
    };
  }

  const byteLength = new TextEncoder().encode(text).length;
  if (byteLength > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Request body too large." },
        { status: 413 }
      ),
    };
  }

  return { ok: true, text };
}

/** Safe JSON parse — returns null on any failure instead of throwing. */
export function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── IP extraction ────────────────────────────────────────────────────────────

// Characters never valid in an IPv4 or IPv6 address
const INVALID_IP_CHARS = /[^a-fA-F0-9.:[\]]/;

function cleanIp(raw: string | null): string | null {
  if (!raw) return null;
  const clean = raw.split(",")[0].trim(); // take first if comma-separated
  if (!clean || INVALID_IP_CHARS.test(clean)) return null;
  return clean;
}

/**
 * Extract the real client IP.
 *
 * Priority order:
 *  1. CF-Connecting-IP  (Cloudflare — cannot be spoofed by client)
 *  2. X-Forwarded-For   (first entry = originating client)
 *  3. X-Real-IP         (Nginx)
 *  4. "unknown"         (fallback — never crashes)
 *
 * ⚠ Ensure your reverse proxy OVERWRITES X-Forwarded-For rather than
 *   appending to it, to prevent IP spoofing via header injection.
 */
export function getClientIp(req: Request): string {
  return (
    cleanIp(req.headers.get("cf-connecting-ip")) ??
    cleanIp(req.headers.get("x-forwarded-for")) ??
    cleanIp(req.headers.get("x-real-ip")) ??
    "unknown"
  );
}

// ─── In-memory sliding-window rate limiter ────────────────────────────────────
//
// Zero external dependencies. Effective for single-instance deployments.
//
// ⚠ Multi-region caveat: each process has its own store. For global limits
//   across multiple Vercel/Edge instances, swap the Map for Redis INCR + EXPIRE.

interface RateBucket {
  count:   number;
  resetAt: number; // epoch ms
}

const _store = new Map<string, RateBucket>();

// Prune expired buckets every 5 minutes — prevents unbounded memory growth
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of _store) {
      if (bucket.resetAt < now) _store.delete(key);
    }
  }, 5 * 60 * 1000);
  // Don't block Node.js process from exiting
  if (typeof timer === "object" && "unref" in timer) (timer as NodeJS.Timeout).unref();
}

/**
 * Check and increment a rate-limit counter.
 *
 * @param key       Unique bucket key, e.g. "login:1.2.3.4"
 * @param limit     Max requests allowed within the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(
  key:      string,
  limit:    number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let bucket = _store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    _store.set(key, bucket);
  }

  bucket.count += 1;

  return {
    allowed:   bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt:   bucket.resetAt,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Today as "YYYY-MM-DD" in UTC. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Start of today at 00:00:00.000 UTC. */
export function startOfTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** A Date object N full days before right now. */
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// ─── Response helpers ─────────────────────────────────────────────────────────

/** Standard rate-limit response headers. */
export function rateLimitHeaders(
  remaining: number,
  resetAt:   number
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset":     String(Math.ceil(resetAt / 1000)),
    "Retry-After":           String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
  };
}