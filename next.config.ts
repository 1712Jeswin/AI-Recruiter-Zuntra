import type { NextConfig } from "next";

// next.config.ts
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: !isProd,
  },
  eslint: {
    ignoreDuringBuilds: !isProd,
  },
  // ... any other config you already have
};

export default nextConfig as any;
