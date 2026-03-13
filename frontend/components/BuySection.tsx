"use client";

import { useEffect, useRef, useState } from "react";
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
  label: string;
  cta: string;
  href?: string;
  backgroundColor: string;
  darkBackground?: boolean;
  // legacy single image (backwards compat)
  productImage?: { url?: string } | null;
  // new multi-image array
  images?: ImageEntry[];
};

/* ─── Fallback cards (matching the reference style) ─────────────────── */
const FALLBACK_CARDS: BuyCard[] = [
  {
    label: "America's #1\ngerbil coffin.",
    cta: "Buy Now",
    href: "/products/more-cah",
    backgroundColor: "#f472b6", // hot pink
    darkBackground: false,
    images: [
      { top: "-8%", right: "2%",  width: "52%", rotation: -12, zIndex: 2 },
    ],
  },
  {
    label: "For whatever\nyou're into.",
    cta: "Buy $5 Packs",
    href: "#",
    backgroundColor: "#86efac", // lime green
    darkBackground: false,
    images: [
      { top: "-12%", right: "28%", width: "42%", rotation: -18, zIndex: 3 },
      { top: "8%",   right: "-2%", width: "48%", rotation: 10,  zIndex: 2 },
    ],
  },
  {
    label: "What is\nstuff?",
    cta: "Find Out",
    href: "#",
    backgroundColor: "#fb923c", // orange
    darkBackground: false,
    images: [
      { top: "-5%", right: "-4%", width: "58%", rotation: 8, zIndex: 2 },
    ],
  },
  {
    label: "Play CAH\nwith your kids.",
    cta: "Buy Family Edition",
    href: "#",
    backgroundColor: "#fde047", // yellow
    darkBackground: false,
    images: [
      { top: "-6%", right: "0%", width: "54%", rotation: -10, zIndex: 2 },
    ],
  },
  {
    label: "Mooooore\ncards!",
    cta: "Buy Expansions",
    href: "#",
    backgroundColor: "#818cf8", // purple-ish
    darkBackground: false,
    images: [
      { top: "-10%", right: "15%", width: "38%", rotation: -20, zIndex: 3 },
      { top: "5%",   right: "-3%", width: "44%", rotation: 12,  zIndex: 2 },
    ],
  },
  {
    label: "The game\nthat started it.",
    cta: "Buy Original",
    href: "#",
    backgroundColor: "#111111",
    darkBackground: true,
    images: [
      { top: "-8%", right: "0%", width: "56%", rotation: -8, zIndex: 2 },
    ],
  },
];

/* ─── Single card ────────────────────────────────────────────────────── */
function BuyCard({ card }: { card: BuyCard }) {
  const fg = card.darkBackground ? "#fff" : "#000";
  const bg = card.darkBackground ? "#fff" : "#000";
  const fgBtn = card.darkBackground ? "#000" : "#fff";

  // Resolve image list — support both legacy single image and new array
  const imageList: ImageEntry[] = card.images?.length
    ? card.images
    : card.productImage?.url
      ? [{ image: card.productImage, top: "-8%", right: "0%", width: "56%", rotation: -10, zIndex: 2 }]
      : [];

  return (
    <a
      href={card.href || "#"}
      className="group relative flex-shrink-0 block overflow-visible"
      style={{
        width: "clamp(520px, 42vw, 780px)",
        height: "clamp(360px, 28vw, 520px)",
        borderRadius: 24,
        background: card.backgroundColor,
        textDecoration: "none",
        // overflow visible so images can bleed above card top
      }}
    >
      {/* ── Floating product images ── */}
      {imageList.map((entry, idx) => {
        const src = entry.image?.url;
        if (!src) return null;
        return (
          <div
            key={idx}
            className="absolute pointer-events-none"
            style={{
              top: entry.top ?? "-8%",
              right: entry.right ?? "0%",
              width: entry.width ?? "55%",
              zIndex: entry.zIndex ?? 2,
              transform: `rotate(${entry.rotation ?? -10}deg)`,
              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <Image
              src={src}
              alt={card.label}
              width={600}
              height={600}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.38))",
                // Subtle lift on card hover — group-hover targets parent <a>
              }}
              className="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        );
      })}

      {/* ── Text + CTA — bottom left ── */}
      <div
        className="absolute bottom-0 left-0 z-10"
        style={{ padding: "clamp(28px,4vw,48px)", maxWidth: imageList.length ? "55%" : "85%" }}
      >
        <p
          className="font-black"
          style={{
            fontSize: "clamp(1.9rem,3.2vw,3rem)",
            color: fg,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            whiteSpace: "pre-line",
            marginBottom: "clamp(16px,2vw,28px)",
            fontFamily: "Helvetica Neue, Arial Black, sans-serif",
          }}
        >
          {card.label}
        </p>

        <span
          className="inline-block font-black transition-opacity duration-200 group-hover:opacity-80"
          style={{
            background: bg,
            color: fgBtn,
            padding: "clamp(10px,1.2vw,16px) clamp(20px,2.2vw,32px)",
            borderRadius: 9999,
            fontSize: "clamp(14px,1.2vw,17px)",
            letterSpacing: "-0.01em",
            fontFamily: "Helvetica Neue, Arial Black, sans-serif",
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {card.cta}
        </span>
      </div>
    </a>
  );
}

/* ─── Buy Section ────────────────────────────────────────────────────── */
export default function BuySection({
  heading,
  buyCards,
}: {
  heading?: string;
  buyCards?: BuyCard[];
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const animRef   = useRef<number | null>(null);
  const posRef    = useRef(0);           // current x offset in px (negative = scrolled right)
  const speedRef  = useRef(0.6);         // px per frame
  const pausedRef = useRef(false);

  const cards: BuyCard[] = buyCards?.length ? buyCards : FALLBACK_CARDS;

  // ── Pure rAF scroll (no GSAP needed — avoids reset flash) ────────────
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Wait one frame so the DOM has measured
    const raf = requestAnimationFrame(() => {
      const singleWidth = track.scrollWidth / 2; // half = one set of cards

      const tick = () => {
        if (!pausedRef.current) {
          posRef.current -= speedRef.current;
          // Seamless loop: when we've scrolled exactly one full set, jump back
          if (Math.abs(posRef.current) >= singleWidth) {
            posRef.current += singleWidth;
          }
          track.style.transform = `translateX(${posRef.current}px)`;
        }
        animRef.current = requestAnimationFrame(tick);
      };

      animRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [cards.length]);

  // Pause on hover
  const pause  = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <section className="bg-black py-24" style={{ overflow: "hidden" }}>
      {/* ── Heading ── */}
      <div style={{ paddingLeft: "clamp(32px,6vw,80px)", marginBottom: "clamp(32px,4vw,56px)" }}>
        <h2
          className="text-white font-black"
          style={{
            fontSize: "clamp(2.4rem,5vw,4.2rem)",
            letterSpacing: "-0.035em",
            lineHeight: 1,
            fontFamily: "Helvetica Neue, Arial Black, sans-serif",
          }}
        >
          {heading || "Buy it now"}
        </h2>
      </div>

      {/*
        ── Carousel track ──
        Cards have overflow:visible so images bleed above card top.
        The outer section clips via overflow:hidden (set above).
        Extra top padding lets the bleeding images show.
      */}
      <div
        style={{
          paddingTop: "clamp(40px, 6vw, 80px)", // room for images bleeding above cards
          paddingBottom: "8px",
          overflow: "visible",
        }}
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            width: "max-content",
            gap: "clamp(16px,2vw,28px)",
            paddingLeft: "clamp(32px,6vw,80px)",
            willChange: "transform",
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...cards, ...cards].map((card, i) => (
            <BuyCard key={i} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}