import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow 30s Vercel timeout for serverless functions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "schemacheck.dev" }],
        destination: "https://www.schemacheck.dev/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
