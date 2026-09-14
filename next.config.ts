import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Hosted Supabase Storage (production/preview).
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Local Supabase Storage (`supabase start`).
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Next.js 16 blocks the image optimizer from fetching private/local IPs
    // by default (SSRF protection). Only relevant in local dev, where
    // Supabase Storage runs on 127.0.0.1 — the hosted project is always a
    // public HTTPS *.supabase.co domain, so this stays off in production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
