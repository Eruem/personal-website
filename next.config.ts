import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark Cloudflare-specific packages as external so webpack
  // doesn't try to bundle them. They're only available at runtime
  // in Cloudflare Workers / Pages.
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("@cloudflare/next-on-pages");
    // Server-only externals
    if (config.externals) {
      (config.externals as unknown[]).push("better-sqlite3");
    }
    return config;
  },

  // Allow server-side imports of native Node.js modules
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
