import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // image.tmdb.org resolves via NAT64 (64:ff9b::/96) in this environment, which
    // Next.js flags as a private IP. TMDB already serves pre-sized images so
    // skipping Next.js optimization has no practical downside.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
