import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},

  async rewrites() {
    return [
      { source: "/auth/login", destination: "/api/auth/login" },
      { source: "/auth/logout", destination: "/api/auth/logout" },
      { source: "/auth/callback", destination: "/api/auth/callback" },
    ];
  },


  output: 'standalone',
  bundlePagesRouterDependencies: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;