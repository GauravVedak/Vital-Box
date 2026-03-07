// src/proxy.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(_ : NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
