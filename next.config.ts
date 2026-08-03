import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Logo.dev's CDN — powers every brand logo on subscription cards/rows.
  // The token is a publishable key, safe to ship client-side (per logo.dev docs).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
