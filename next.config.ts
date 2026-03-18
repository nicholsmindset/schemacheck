import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow 30s Vercel timeout for serverless functions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
