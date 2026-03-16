"use client";

import { useState } from "react";
import Image from "next/image";

/* ─── Types ──────────────────────────────────────────────────────────── */
type StuffPost = {
  id?: string;
  tag?: string;
  label: string;
  image?: { url?: string } | null;
  href?: string;
  cta?: string;
  backgroundColor?: string;
  textColor?: string;
  tagBg?: string;
  tagColor?: string;
  order?: number;
  published?: boolean;
};

type StuffHome = {
  stuffSection?: { heading?: string };
};

/* ─── Helper ─────────────────────────────────────────────────────────── */
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "";
function resolveUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${CMS_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

/* ─── Fallback data ──────────────────────────────────────────────────── */
const FALLBACK: StuffPost[] = [
  {
    tag: "Black Friday 2018",
    label: "Holy fuck we had some deals.",
    href: "#", cta: "Read",
    backgroundColor: "#fffe5b", textColor: "#fe2f2f",
    tagBg: "#fe2f2f", tagColor: "#fff", order: 10,
  },
  {
    tag: "Science Scholarship",
    label: "A full-tuition scholarship for women.",
    href: "#", cta: "Read",
    backgroundColor: "#ede5ff", textColor: "#7333f1",
    tagBg: "#7333f1", tagColor: "#fff", order: 20,
  },
  {
    tag: "Holiday Hole",
    label: "You paid us to dig a big hole in the ground.",
    href: "#", cta: "Read",
    backgroundColor: "#1b5bff", textColor: "#d7b73b",
    tagBg: "#d7b73b", tagColor: "#000", order: 30,
  },
];

/* ══════════════════════════════════════════════════════════════════════
   SINGLE CARD
   ══════════════════════════════════════════════════════════════════════ */
function StuffCard({ post }: { post: StuffPost }) {
  const [hovered, setHovered] = useState(false);

  const bg       = post.backgroundColor || "#fff";
  const txtColor = post.textColor       || "#000";
  const tBg      = post.tagBg           || "#000";
  const tColor   = post.tagColor        || "#fff";
  const ctaLabel = post.cta             || "Read";
  const imgSrc   = resolveUrl(post.image?.url);

  return (
    <a
      href={post.href || "#"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:       "relative",
        display:        "block",
        background:     bg,
        borderRadius:   20,
        overflow:       "hidden",
        textDecoration: "none",
        aspectRatio:    "3 / 4.2",
      }}
    >
      {/* Floating illustration — moves bottom-left -> top-right on hover */}
      {imgSrc && (
        <div
          style={{
            position:   "absolute",
            bottom:     "-9%",
            left:       "-10%",
            width:      "74%",
            zIndex:     1,
            transform:  hovered ? "translate(14px, -14px) scale(1.04)" : "translate(0, 0) scale(1)",
            transition: "transform 0.45s ease",
            pointerEvents: "none",
          }}
        >
          <Image
            src={imgSrc}
            alt={post.label}
            width={800}
            height={800}
            unoptimized
            style={{
              width:     "100%",
              height:    "auto",
              objectFit: "contain",
              display:   "block",
            }}
          />
        </div>
      )}

      {/* Content layer — above image */}
      <div style={{
        position:       "absolute",
        inset:          0,
        zIndex:         2,
        padding:        "clamp(18px,2.3vw,30px)",
      }}>

        {/* Tag pill — top left */}
        <div>
          {post.tag && (
            <span style={{
              display:       "inline-block",
              background:    tBg,
              color:         tColor,
              fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
              fontWeight:    800,
              fontSize:      "clamp(10px,0.85vw,13px)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding:       "6px 14px",
              borderRadius:  9999,
              whiteSpace:    "nowrap",
            }}>
              {post.tag}
            </span>
          )}
        </div>

        {/* Bottom: headline + CTA */}
        <div style={{ maxWidth: "86%", marginTop: "clamp(22px,2.8vw,44px)" }}>
          <p style={{
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
            fontWeight:    800,
            fontSize:      "clamp(1.5rem,2.2vw,2.8rem)",
            color:         txtColor,
            letterSpacing: "-0.02em",
            lineHeight:    1.1,
            margin:        0,
          }}>
            {post.label}
          </p>
        </div>

        {/* "Read →" CTA row */}
        <div style={{
          position: "absolute",
          right: "clamp(18px,2.3vw,30px)",
          bottom: "clamp(18px,2.3vw,30px)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{
            fontFamily: "Helvetica Neue, Arial Black, sans-serif",
            fontWeight: 800,
            fontSize:   "clamp(14px,1.2vw,18px)",
            color:      txtColor,
          }}>
            {ctaLabel}
          </span>

          {/* Circle arrow — inverts on hover */}
          <div style={{
            width:          "clamp(32px,2.5vw,42px)",
            height:         "clamp(32px,2.5vw,42px)",
            borderRadius:   "50%",
            border:         `2px solid ${txtColor}`,
            background:     hovered ? txtColor : "transparent",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transition:     "background 0.2s ease",
            flexShrink:     0,
          }}>
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={hovered ? bg : txtColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(-45deg)", transition: "stroke 0.2s ease" }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STUFF SECTION
   ══════════════════════════════════════════════════════════════════════ */
export default function StuffSection({
  cmsHome,
  stuffPosts,
}: {
  cmsHome?: StuffHome | null;
  stuffPosts?: StuffPost[];
}) {
  const heading = cmsHome?.stuffSection?.heading || "Stuff we've done.";

  const posts = (stuffPosts?.length ? stuffPosts : FALLBACK)
    .filter(p => p.published !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <section style={{
      background: "#000",
      padding: "clamp(60px,7vw,100px) clamp(24px,5vw,64px)",
    }}>
      {/* Header row */}
      <div style={{
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        marginBottom:   "clamp(28px,3.5vw,48px)",
      }}>
        <h2 style={{
          fontFamily:    "Georgia, 'Times New Roman', serif",
          fontWeight:    900,
          fontSize:      "clamp(2.2rem,4.5vw,4rem)",
          letterSpacing: "-0.03em",
          lineHeight:    1,
          color:         "#fff",
          margin:        0,
        }}>
          {heading}
        </h2>

        {/* "More to come!" starburst */}
        <Image
          src="https://img.cah.io/images/vc07edlh/production/6d7d67943605f882af1c5c779e5e77f7c23bb6a4-86x86.svg"
          alt="More to come!"
          width={86}
          height={86}
          loading="lazy"
          style={{ display: "block", flexShrink: 0, marginLeft: 24 }}
        />
      </div>

      {/* 3-column grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap:                 "clamp(10px,1.5vw,20px)",
      }}>
        {posts.map((post, i) => (
          <StuffCard key={post.id ?? i} post={post} />
        ))}
      </div>
    </section>
  );
}