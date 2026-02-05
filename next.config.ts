import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Auth0: /auth/login, /auth/logout, /auth/callback -> /api/auth/*
      { source: "/auth/login", destination: "/api/auth/login" },
      { source: "/auth/logout", destination: "/api/auth/logout" },
      { source: "/auth/callback", destination: "/api/auth/callback" },
    ];
  },
};

export default nextConfig;
