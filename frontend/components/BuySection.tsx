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

/* ─── Helpers ────────────────────────────────────────────────────────── */
function fixNewlines(str: string): string {
  return (str ?? "").replace(/\\n/g, "\n");
}

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "";
function resolveUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${CMS_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

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
function BuyCardItem({
  card,
  isCenter,
}: {
  card: BuyCard;
  isCenter: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const label  = fixNewlines(card.label ?? "");
  const isDark = card.darkBackground ?? false;
  const textColor = isDark ? "#fff" : "#000";
  const btnBg  = hovered ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#000");
  const btnFg  = hovered ? (isDark ? "#fff" : "#000") : (isDark ? "#000" : "#fff");

  // Use ONLY CMS-provided image data — no defaults injected for position/rotation
  const imageList: ImageEntry[] = card.images?.filter(e => e.image?.url).length
    ? card.images!
    : card.productImage?.url
      ? [{ image: card.productImage }]
      : [];

  return (
    <div
      onMouseEnter={() => { if (isCenter) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:   "relative",
        width:      "100%",
        height:     "100%",
        background: card.backgroundColor || "#eee",
        borderRadius: 20,
        overflow:   "hidden",
        filter:     isCenter ? "none" : "brightness(0.75)",
        transform:  isCenter ? "scale(1)" : "scale(0.93)",
        transition: "filter 0.4s ease, transform 0.4s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Product images — positions come entirely from CMS ── */}
      {imageList.map((entry, idx) => {
        const src = resolveUrl(entry.image?.url);
        if (!src) return null;
        return (
          <div
            key={idx}
            style={{
              position:      "absolute",
              // All positioning from CMS — if CMS didn't set them, use safe defaults
              top:           entry.top    ?? "-10%",
              right:         entry.right  ?? "0%",
              width:         entry.width  ?? "55%",
              zIndex:        entry.zIndex ?? (10 - idx),
              transform:     `rotate(${entry.rotation ?? 0}deg) scale(${isCenter && hovered ? 1.07 : 1})`,
              transition:    "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents: "none",
            }}
          >
            <Image
              src={src}
              alt={label}
              width={600}
              height={600}
              unoptimized
              priority={isCenter}
              style={{
                width:     "100%",
                height:    "auto",
                objectFit: "contain",
                filter:    "drop-shadow(0 20px 48px rgba(0,0,0,0.45))",
                display:   "block",
              }}
            />
          </div>
        );
      })}

      {/* ── Text + CTA — only show on center card ── */}
      <div style={{
        position:   "absolute",
        bottom:     0,
        left:       0,
        zIndex:     20,
        padding:    "clamp(20px,3vw,40px)",
        maxWidth:   imageList.length ? "52%" : "86%",
        opacity:    isCenter ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        <p style={{
          fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
          fontWeight:    900,
          fontSize:      "clamp(1.8rem,2.6vw,2.8rem)",
          color:         textColor,
          letterSpacing: "-0.03em",
          lineHeight:    1.08,
          whiteSpace:    "pre-line",
          margin:        "0 0 clamp(12px,1.6vw,22px) 0",
        }}>
          {label}
        </p>
        <span style={{
          display:       "inline-block",
          fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
          fontWeight:    900,
          fontSize:      "clamp(12px,1vw,16px)",
          background:    btnBg,
          color:         btnFg,
          border:        `2px solid ${isDark ? "#fff" : "#000"}`,
          padding:       "clamp(8px,0.9vw,13px) clamp(16px,1.8vw,28px)",
          borderRadius:  9999,
          letterSpacing: "-0.01em",
          whiteSpace:    "nowrap",
          transition:    "background 0.2s, color 0.2s",
        }}>
          {card.cta}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BUY SECTION
   - Drag / swipe to scroll (mouse + touch)
   - Snaps to nearest card after release
   - Auto-advances every 5s (pauses on interaction)
   - Smooth CSS transform animation throughout
   - 3 cards visible: left peek, center full, right peek
   - Width reduced ~22% vs full-bleed
   ══════════════════════════════════════════════════════════════════════ */
const AUTO_MS    = 5000;
// Card width as fraction of container width
const CENTER_W   = 0.66;   // center card = 66% of container
const SIDE_W     = 0.17;   // each side peek = 17%
const GAP_W      = 0.018;  // gap between cards as fraction

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
  const count = cards.length;

  // current center index (can be fractional during drag)
  const [centerIdx, setCenterIdx] = useState(0);

  // live offset in px — updated every frame during drag
  const offsetRef    = useRef(0);       // current rendered offset (px from "resting" position)
  const isDragging   = useRef(false);
  const dragStart    = useRef(0);       // pointer x at drag start
  const offsetAtDrag = useRef(0);       // offsetRef.value at drag start
  const isAnimating  = useRef(false);   // true while spring-snapping
  const autoTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const centerIdxRef = useRef(0);       // mirror of centerIdx for use in closures
  centerIdxRef.current = centerIdx;

  /* ── Measure card width in px ── */
  const cardPx = useCallback((): number => {
    if (!containerRef.current) return 500;
    return containerRef.current.offsetWidth * (CENTER_W + GAP_W);
  }, []);

  /* ── Apply transform without transition (for drag) ── */
  const applyOffset = useCallback((px: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)"
      : "none";
    el.style.transform = `translateX(${px}px)`;
    offsetRef.current = px;
  }, []);

  /* ── Snap to a given index ── */
  const snapTo = useCallback((idx: number, animate = true) => {
    const clamped = Math.max(0, Math.min(count - 1, idx));
    const target  = -clamped * cardPx();
    applyOffset(target, animate);
    setCenterIdx(clamped);
    isAnimating.current = animate;
    if (animate) {
      setTimeout(() => { isAnimating.current = false; }, 480);
    }
  }, [count, cardPx, applyOffset]);

  /* ── Auto-advance ── */
  const resetAutoTimer = useCallback(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      const next = (centerIdxRef.current + 1) % count;
      snapTo(next);
    }, AUTO_MS);
  }, [count, snapTo]);

  // Init position
  useEffect(() => {
    applyOffset(0, false);
    resetAutoTimer();
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, []); // eslint-disable-line

  /* ── Pointer/mouse drag handlers ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isAnimating.current) return;
    isDragging.current   = true;
    dragStart.current    = e.clientX;
    offsetAtDrag.current = offsetRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    // Cancel auto during drag
    if (autoTimer.current) clearTimeout(autoTimer.current);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStart.current;
    // Resist dragging past first/last card
    const raw   = offsetAtDrag.current + delta;
    const min   = -(count - 1) * cardPx();
    const max   = 0;
    // rubber-band resistance at edges
    let clamped = raw;
    if (raw > max) clamped = max + (raw - max) * 0.25;
    if (raw < min) clamped = min + (raw - min) * 0.25;
    applyOffset(clamped, false);
  }, [count, cardPx, applyOffset]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = e.clientX - dragStart.current;
    const cp    = cardPx();
    // Snap: if dragged > 30% of card width, move one card
    let newIdx = centerIdxRef.current;
    if (delta < -cp * 0.3)      newIdx = Math.min(count - 1, newIdx + 1);
    else if (delta > cp * 0.3)  newIdx = Math.max(0, newIdx - 1);
    snapTo(newIdx);
    resetAutoTimer();
  }, [count, cardPx, snapTo, resetAutoTimer]);

  /* ── Touch equivalents ── */
  const touchStart = useRef(0);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current   = e.touches[0].clientX;
    offsetAtDrag.current = offsetRef.current;
    isDragging.current   = true;
    if (autoTimer.current) clearTimeout(autoTimer.current);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientX - touchStart.current;
    const raw   = offsetAtDrag.current + delta;
    const min   = -(count - 1) * cardPx();
    const max   = 0;
    let clamped = raw;
    if (raw > max) clamped = max + (raw - max) * 0.25;
    if (raw < min) clamped = min + (raw - min) * 0.25;
    applyOffset(clamped, false);
  }, [count, cardPx, applyOffset]);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    const cp    = cardPx();
    let newIdx  = centerIdxRef.current;
    if (delta < -cp * 0.3)     newIdx = Math.min(count - 1, newIdx + 1);
    else if (delta > cp * 0.3) newIdx = Math.max(0, newIdx - 1);
    snapTo(newIdx);
    resetAutoTimer();
  }, [count, cardPx, snapTo, resetAutoTimer]);

  if (!count) return null;

  return (
    <section style={{ background: "#000", padding: "clamp(48px,6vw,80px) 0" }}>
      {/* Heading */}
      <div style={{ paddingLeft: "clamp(32px,6vw,80px)", marginBottom: "clamp(24px,3vw,40px)" }}>
        <h2 style={{
          fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
          fontWeight:    900,
          fontSize:      "clamp(2.2rem,4.5vw,4rem)",
          letterSpacing: "-0.035em",
          lineHeight:    1,
          color:         "#fff",
          margin:        0,
        }}>
          {heading ?? "Buy it now"}
        </h2>
      </div>

      {/*
        ── Outer container: 78% width centered ──
        Reduced by ~22% from full-bleed. overflow:hidden clips the peeking cards.
      */}
      <div
        ref={containerRef}
        style={{
          width:    "78%",          // ← ~22% narrower than full width
          margin:   "0 auto",
          overflow: "hidden",
          padding:  "16px 0",       // vertical room for scale transforms
          cursor:   "grab",
          touchAction: "pan-y",     // allow vertical scroll, we handle horizontal
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/*
          ── Track: all cards in a row, shifted by translateX ──
          Width = count * cardWidth.
          Initial position shows center card + both peeks.
          We shift the track left to start at card 0 with left peek visible.
        */}
        <div
          ref={trackRef}
          style={{
            display:    "flex",
            gap:        `${GAP_W * 100}%`,
            width:      "max-content",
            willChange: "transform",
            // Start offset: shift right so the first card sits as "center"
            // with an artificial left gap equal to SIDE_W
            paddingLeft: `${SIDE_W * 100}%`,
          }}
        >
          {cards.map((card, i) => (
            <div
              key={card.id ?? i}
              style={{
                // Center card is wider than side peeks
                // All cards are the same DOM width here; visual size difference
                // comes from scale() on the card itself.
                width:       `${CENTER_W * 100}%`,
                // Aspect ratio: wide landscape
                aspectRatio: "16 / 7.5",
                flexShrink:  0,
              }}
            >
              <BuyCardItem
                card={card}
                isCenter={i === centerIdx}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}