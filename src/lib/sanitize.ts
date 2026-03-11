import { NextResponse } from "next/server";

// ─── NoSQL injection guards ───────────────────────────────────────────────────

export function assertSafeFields(
  body: Record<string, unknown>,
  fields: string[]
): boolean {
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null) continue;
    if (typeof val === "object") return false;
    if (typeof val === "string") {
      if (val.trimStart().startsWith("$")) return false;
      if (val.includes("__proto__") || val.includes("constructor")) return false;
    }
  }
  return true;
}

export function assertSafeObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  for (const key of Object.keys(value as object)) {
    if (
      key.startsWith("$") ||
      key === "__proto__"  ||
      key === "constructor" ||
      key === "prototype"
    ) return false;
  }
  return true;
}

// ─── String sanitization ──────────────────────────────────────────────────────

export function stripDangerous(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\x80-\x9F]/g, "")
    .replace(/\0/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069\u200F\u200E\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

export function sanitizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = stripDangerous(value).slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  if (email.length < 6 || email.length > 254) return false;

  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === email.length - 1) return false;
  if (email.indexOf("@") !== atIndex) return false;

  const local  = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (local.length < 1 || local.length > 64) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (!/^[a-zA-Z0-9._%+\-]+$/.test(local)) return false;

  if (domain.length < 4) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.startsWith("-") || domain.endsWith("-")) return false;
  if (domain.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.length < 2) return false;

  for (const label of labels) {
    if (label.length < 1 || label.length > 63) return false;
    if (!/^[a-zA-Z0-9\-]+$/.test(label)) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
  }

  const tld = labels[labels.length - 1];
  return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
}

// 8–128 chars, at least one letter, at least one digit — matches frontend exactly
export function isValidPassword(password: string): boolean {
  if (typeof password !== "string") return false;
  if (password.length < 8 || password.length > 128) return false;
  if (/^\s+$/.test(password)) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function clampNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value === "object") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return Math.round(n * 10) / 10;
}

export function isValidUnit(value: unknown): value is "metric" | "imperial" {
  return value === "metric" || value === "imperial";
}

// ─── Body guard ───────────────────────────────────────────────────────────────

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

  if (new TextEncoder().encode(text).length > maxBytes) {
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

export function safeParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return null; }
}

// ─── IP extraction ────────────────────────────────────────────────────────────

const VALID_IP_RE = /^[a-fA-F0-9.:[\]]+$/;

function cleanIp(raw: string | null): string | null {
  if (!raw) return null;
  const candidate = raw.split(",")[0].trim();
  if (!candidate || candidate.length > 45) return null;
  if (!VALID_IP_RE.test(candidate)) return null;
  if (!candidate.includes(".") && !candidate.includes(":")) return null;
  return candidate;
}

export function getClientIp(req: Request): string {
  return (
    cleanIp(req.headers.get("cf-connecting-ip")) ??
    cleanIp(req.headers.get("x-forwarded-for"))  ??
    cleanIp(req.headers.get("x-real-ip"))        ??
    "unknown"
  );
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

interface RateBucket { count: number; resetAt: number; }
const _rlStore = new Map<string, RateBucket>();

if (typeof setInterval !== "undefined") {
  const t = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of _rlStore) if (b.resetAt < now) _rlStore.delete(k);
  }, 5 * 60 * 1000);
  if (typeof t === "object" && "unref" in t) (t as NodeJS.Timeout).unref();
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let b = _rlStore.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    _rlStore.set(key, b);
  }
  b.count += 1;
  return {
    allowed:   b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    resetAt:   b.resetAt,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function todayUTC(): string { return new Date().toISOString().slice(0, 10); }

export function startOfTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export function rateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset":     String(Math.ceil(resetAt / 1000)),
    "Retry-After":           String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
  };
}