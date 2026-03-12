import { NextRequest, NextResponse } from "next/server";

interface Bucket { count: number; resetAt: number; }
const store = new Map<string, Bucket>();

const MAX_ENTRIES = 3000;

function pruneIfNeeded() {
  if (store.size < MAX_ENTRIES) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.resetAt < now) store.delete(k);
    if (store.size < MAX_ENTRIES * 0.8) break;
  }
}

function check(key: string, limit: number, windowMs: number): boolean {
  pruneIfNeeded();
  const now = Date.now();
  let b = store.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }
  b.count += 1;
  return b.count <= limit;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

const ROUTES: { path: string; limit: number; windowMs: number }[] = [
  { path: "/api/auth/signup",  limit: 5,  windowMs: 10 * 60 * 1000 },
  { path: "/api/auth/login",   limit: 10, windowMs: 15 * 60 * 1000 },
  { path: "/api/auth/me",      limit: 30, windowMs: 60 * 1000 },
  { path: "/api/auth/verify",  limit: 30, windowMs: 60 * 1000 },
  { path: "/api/user/metrics", limit: 10, windowMs: 15 * 60 * 1000 },
  { path: "/api/ai/guidance",  limit: 10, windowMs: 15 * 60 * 1000 },
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip   = getIp(req);

  for (const route of ROUTES) {
    if (!path.startsWith(route.path)) continue;
    const allowed = check(`${route.path}:${ip}`, route.limit, route.windowMs);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ ok: false, message: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "60" },
        }
      );
    }
    break;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*", "/api/user/:path*", "/api/ai/:path*"],
};