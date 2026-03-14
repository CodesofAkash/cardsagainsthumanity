"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

/* ─── Types ──────────────────────────────────────────────────────────── */
type ImageEntry = {
  image?: { url?: string } | null;
  top?: string;
  right?: string;
  width?: string;
  rotation?: number;
  zIndex?: number;
};

type BuyCard = {
  id?: string;
  label: string;
  cta: string;
  href?: string;
  backgroundColor: string;
  darkBackground?: boolean;
  productImage?: { url?: string } | null;
  images?: ImageEntry[];
  order?: number;
  published?: boolean;
};

/* ─── Fix literal "\n" strings from Payload CMS ─────────────────────── */
function fixNewlines(str: string): string {
  return (str ?? "").replace(/\\n/g, "\n");
}

/* ─── Resolve full image URL ─────────────────────────────────────────── */
// Payload sometimes returns relative URLs like /media/foo.jpg
// We prefix with the CMS URL if it's not already absolute.
const CMS_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:3001"
    : (window as any).__NEXT_DATA__?.props?.pageProps?.cmsUrl ??
      process.env.NEXT_PUBLIC_CMS_URL ??
      "";

function resolveUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // relative path — prepend CMS origin
  const base = CMS_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

/* ─── Image position defaults per slot ──────────────────────────────── */
const IMAGE_DEFAULTS = [
  { top: "-12%", right: "0%",  width: "58%", rotation: -12 },
  { top:   "5%", right: "-3%", width: "50%", rotation:  10 },
  { top:  "-5%", right: "22%", width: "38%", rotation: -18 },
];

/* ─── Fallback cards (used when CMS has no data) ─────────────────────── */
const FALLBACK_CARDS: BuyCard[] = [
  { label: "America's #1\ngerbil coffin.",  cta: "Buy Now",           href: "/products/more-cah", backgroundColor: "#87CEEB", order: 1 },
  { label: "Play CAH\nwith your kids.",     cta: "Buy Family Edition", href: "#",                  backgroundColor: "#FFE135", order: 2 },
  { label: "Moooooore\ncards!",             cta: "Buy Expansions",     href: "#",                  backgroundColor: "#FFB3D9", order: 3 },
  { label: "For whatever\nyou're into.",    cta: "Buy $5 Packs",       href: "#",                  backgroundColor: "#90EE90", order: 4 },
  { label: "What is\nthis stuff?",          cta: "Find Out",           href: "#",                  backgroundColor: "#111111", darkBackground: true, order: 5 },
];

/* ══════════════════════════════════════════════════════════════════════
   SINGLE CARD
   ══════════════════════════════════════════════════════════════════════ */
function BuyCardSlide({
  card,
  active,
}: {
  card: BuyCard;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const label  = fixNewlines(card.label ?? "");
  const isDark = card.darkBackground ?? false;

  // Text color
  const textColor  = isDark ? "#fff" : "#000";
  // Button: on hover invert, otherwise match dark/light
  const btnBg      = hovered ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#000");
  const btnFg      = hovered ? (isDark ? "#fff" : "#000") : (isDark ? "#000" : "#fff");
  const btnBorder  = isDark ? "2px solid #fff" : "2px solid #000";

  // Resolve image list
  const imageList: ImageEntry[] = card.images?.filter(e => e.image?.url).length
    ? card.images!
    : card.productImage?.url
      ? [{ image: card.productImage }]
      : [];

  return (
    <a
      href={card.href || "#"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:        "relative",
        display:         "block",
        width:           "100%",
        height:          "100%",
        background:      card.backgroundColor || "#eee",
        borderRadius:    24,
        textDecoration:  "none",
        overflow:        "hidden",       // clip the card itself
        flexShrink:      0,
      }}
    >
      {/* ── Floating product images ── */}
      {imageList.map((entry, idx) => {
        const src = resolveUrl(entry.image?.url);
        if (!src) return null;
        const def = IMAGE_DEFAULTS[idx] ?? IMAGE_DEFAULTS[0];
        return (
          <div
            key={idx}
            style={{
              position:  "absolute",
              top:       entry.top    ?? def.top,
              right:     entry.right  ?? def.right,
              width:     entry.width  ?? def.width,
              zIndex:    entry.zIndex ?? (10 - idx),
              transform: `rotate(${entry.rotation ?? def.rotation}deg) scale(${hovered ? 1.07 : 1})`,
              transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents: "none",
            }}
          >
            <Image
              src={src}
              alt={label}
              width={600}
              height={600}
              unoptimized           // avoids domain whitelist issues entirely
              priority={active}     // preload the active card's images
              style={{
                width:      "100%",
                height:     "auto",
                objectFit:  "contain",
                filter:     "drop-shadow(0 24px 52px rgba(0,0,0,0.45))",
                display:    "block",
              }}
            />
          </div>
        );
      })}

      {/* ── Text + CTA ── */}
      <div
        style={{
          position:  "absolute",
          bottom:    0,
          left:      0,
          zIndex:    20,
          padding:   "clamp(24px,3.5vw,48px)",
          maxWidth:  imageList.length ? "54%" : "88%",
        }}
      >
        <p
          style={{
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
            fontWeight:    900,
            fontSize:      "clamp(2rem,3.2vw,3.2rem)",
            color:         textColor,
            letterSpacing: "-0.03em",
            lineHeight:    1.08,
            whiteSpace:    "pre-line",
            margin:        0,
            marginBottom:  "clamp(14px,2vw,28px)",
          }}
        >
          {label}
        </p>

        <span
          style={{
            display:       "inline-block",
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
            fontWeight:    900,
            fontSize:      "clamp(13px,1.1vw,17px)",
            background:    btnBg,
            color:         btnFg,
            border:        btnBorder,
            padding:       "clamp(10px,1.1vw,15px) clamp(22px,2.2vw,34px)",
            borderRadius:  9999,
            letterSpacing: "-0.01em",
            whiteSpace:    "nowrap",
            transition:    "background 0.2s, color 0.2s",
          }}
        >
          {card.cta}
        </span>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BUY SECTION  —  slide carousel
   • One card visible at a time (full width)
   • Auto-advances every 5 seconds
   • Pauses on hover
   • Left / right arrow buttons to navigate
   • Dot indicators at bottom
   ══════════════════════════════════════════════════════════════════════ */
const AUTO_ADVANCE_MS = 5000;

export default function BuySection({
  heading,
  buyCards,
}: {
  heading?: string;
  buyCards?: BuyCard[];
}) {
  const raw = buyCards?.length ? buyCards : FALLBACK_CARDS;
  const cards = raw
    .filter(c => c.published !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const [idx, setIdx]         = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const hoveredRef            = useRef(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = cards.length;

  const go = useCallback((dir: "left" | "right") => {
    setAnimDir(dir);
    setIdx(prev =>
      dir === "right"
        ? (prev + 1) % count
        : (prev - 1 + count) % count
    );
  }, [count]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!hoveredRef.current) go("right");
    }, AUTO_ADVANCE_MS);
  }, [go]);

  // Auto-advance
  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, resetTimer]);

  if (!count) return null;

  return (
    <section
      style={{
        background: "#000",
        padding:    "clamp(48px,6vw,80px) 0 clamp(48px,6vw,80px) 0",
        overflow:   "hidden",
      }}
    >
      {/* ── Heading ── */}
      <div style={{ paddingLeft: "clamp(32px,6vw,80px)", marginBottom: "clamp(24px,3vw,44px)" }}>
        <h2
          style={{
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
            fontWeight:    900,
            fontSize:      "clamp(2.2rem,4.5vw,4rem)",
            letterSpacing: "-0.035em",
            lineHeight:    1,
            color:         "#fff",
            margin:        0,
          }}
        >
          {heading ?? "Buy it now"}
        </h2>
      </div>

      {/* ── Card stage ── */}
      <div
        style={{ position: "relative", padding: "0 clamp(32px,6vw,80px)" }}
        onMouseEnter={() => { hoveredRef.current = true; }}
        onMouseLeave={() => { hoveredRef.current = false; }}
      >
        {/* Card wrapper — fixed aspect ratio */}
        <div
          style={{
            position:     "relative",
            width:        "100%",
            aspectRatio:  "16/7",
            minHeight:    340,
            maxHeight:    620,
            borderRadius: 24,
            overflow:     "hidden",
          }}
        >
          {/* Render all cards; only active is visible — CSS handles slide transition */}
          {cards.map((card, i) => {
            const isActive = i === idx;
            return (
              <div
                key={card.id ?? i}
                style={{
                  position:   "absolute",
                  inset:      0,
                  opacity:    isActive ? 1 : 0,
                  transform:  isActive
                    ? "translateX(0)"
                    : animDir === "right"
                      ? "translateX(-4%)"
                      : "translateX(4%)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex:     isActive ? 1 : 0,
                }}
              >
                <BuyCardSlide card={card} active={isActive} />
              </div>
            );
          })}

          {/* ── Left / Right nav arrows ── */}
          <button
            aria-label="Previous card"
            onClick={() => { go("left"); resetTimer(); }}
            style={{
              position:       "absolute",
              left:           16,
              top:            "50%",
              transform:      "translateY(-50%)",
              zIndex:         30,
              background:     "rgba(0,0,0,0.45)",
              border:         "none",
              borderRadius:   "50%",
              width:          44,
              height:         44,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
              backdropFilter: "blur(4px)",
              transition:     "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.45)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            aria-label="Next card"
            onClick={() => { go("right"); resetTimer(); }}
            style={{
              position:       "absolute",
              right:          16,
              top:            "50%",
              transform:      "translateY(-50%)",
              zIndex:         30,
              background:     "rgba(0,0,0,0.45)",
              border:         "none",
              borderRadius:   "50%",
              width:          44,
              height:         44,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
              backdropFilter: "blur(4px)",
              transition:     "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.45)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* ── Dot indicators ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            10,
            marginTop:      20,
          }}
        >
          {cards.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to card ${i + 1}`}
              onClick={() => { setAnimDir(i > idx ? "right" : "left"); setIdx(i); resetTimer(); }}
              style={{
                width:      i === idx ? 28 : 8,
                height:     8,
                borderRadius: 9999,
                background: i === idx ? "#fff" : "rgba(255,255,255,0.35)",
                border:     "none",
                cursor:     "pointer",
                padding:    0,
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}