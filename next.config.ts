import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bake server-side env vars at build time — workaround for Vercel runtime injection
  env: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "AdminSchema99",
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  },
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
