import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  images: {
    remotePatterns: [
      // ── Vercel Blob Storage (Payload media uploads) ─────────────
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },

      // ── Your CMS deployments ────────────────────────────────────
      {
        protocol: "https",
        hostname: "cardsagainsthumanity-cms.vercel.app",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },

      // ── Local CMS dev server ────────────────────────────────────
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },

      // ── Cards Against Humanity CDN ──────────────────────────────
      {
        protocol: "https",
        hostname: "img.cah.io",
      },

      // ── Wikimedia images (if used anywhere) ─────────────────────
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },

      // ── Optional catch-all HTTPS fallback (remove later) ────────
      {
        protocol: "https",
        hostname: "**",
      },
    ],

    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },

  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;