import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow images from ANY Supabase project domain
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Disable Turbopack to fix font loading issues
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

export default nextConfig;
