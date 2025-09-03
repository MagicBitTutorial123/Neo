import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow images from ANY Supabase project domain
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
