// middleware.ts (project root - same level as package.json)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const PROTECTED_PATHS = ['/admin', '/api/admin'];
const BLOCKED_USER_AGENTS = [
  'curl', 'wget', 'python-requests', 'axios', 'httpie',
  'Mozilla/5.0 (compatible; bot)', 'Googlebot', 'Bingbot'
];

interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         request.headers.get('x-client-ip') ||
         'anonymous';
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BLOCKED_USER_AGENTS.some(ua => userAgent.toLowerCase().includes(ua.toLowerCase()));
}

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get('host');
  // FIXED: Explicit null checks to ensure boolean return type
  return !!(host && (host.includes('localhost') || host.includes('127.0.0.1')));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Skip ALL security checks on localhost (for dev)
  if (isLocalhost(request)) {
    const response = NextResponse.next();
    return response;
  }
  
  // Block obvious bots/cargo spam
  if (isBot(userAgent)) {
    return new NextResponse('Blocked', { status: 403 });
  }
  
  // Rate limiting (all paths)
  const cacheKey = `rate:${clientIp}`;
  const now = Date.now();
  const data = rateLimitStore.get(cacheKey) as RateLimitData | undefined;
  
  if (!data || now > data.resetTime) {
    rateLimitStore.set(cacheKey, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
  } else {
    const newData = { ...data, count: data.count + 1 };
    rateLimitStore.set(cacheKey, newData);
    
    if (newData.count > RATE_LIMIT_REQUESTS) {
      return new NextResponse('Too many requests', { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((newData.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': newData.resetTime.toString()
        }
      });
    }
  }
  
  // Extra strict rate limiting for admin paths
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    const adminKey = `admin:${clientIp}`;
    const adminData = rateLimitStore.get(adminKey) as RateLimitData | undefined;
    
    if (adminData && now <= adminData.resetTime && adminData.count >= 10) {
      return new NextResponse('Admin access limited', { status: 429 });
    }
    
    const newAdminData = adminData ? 
      { ...adminData, count: adminData.count + 1 } :
      { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    
    rateLimitStore.set(adminKey, newAdminData);
  }
  
  // Security headers only in production
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT_REQUESTS - (data?.count || 1)).toString());
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
