import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.cah.io" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "http",  hostname: "localhost", port: "3001" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "*.onrender.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;