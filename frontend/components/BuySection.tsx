"use client";

import { useEffect, useRef } from "react";
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
  productImage?: { url?: string } | null;
  images?: ImageEntry[];
  order?: number;
  published?: boolean;
};

/* ─── Fallback cards ─────────────────────────────────────────────────── */
const FALLBACK_CARDS: BuyCard[] = [
  {
    label: "America's #1\ngerbil coffin.",
    cta: "Buy Now",
    href: "/products/more-cah",
    backgroundColor: "#f472b6",
    order: 1,
  },
  {
    label: "Play CAH\nwith your kids.",
    cta: "Buy Family Edition",
    href: "#",
    backgroundColor: "#fde047",
    order: 2,
  },
  {
    label: "Moooooore\ncards!",
    cta: "Buy Expansions",
    href: "#",
    backgroundColor: "#818cf8",
    order: 3,
  },
  {
    label: "For whatever\nyou're into.",
    cta: "Buy $5 Packs",
    href: "#",
    backgroundColor: "#86efac",
    order: 4,
  },
  {
    label: "What is\nthis stuff?",
    cta: "Find Out",
    href: "#",
    backgroundColor: "#fb923c",
    order: 5,
  },
];

/* ─── Fix literal "\n" strings from CMS ─────────────────────────────── */
// Payload stores "America's #1\ngerbil coffin." as a literal backslash-n.
// This converts it to an actual newline so whiteSpace:"pre-line" renders correctly.
function fixNewlines(str: string): string {
  return str.replace(/\\n/g, "\n");
}

/* ─── Image position defaults by index ──────────────────────────────── */
// When no explicit position is set in CMS, use sensible defaults per image slot
const IMAGE_DEFAULTS = [
  { top: "-10%", right: "0%",   width: "60%", rotation: -12 },
  { top: "5%",   right: "-3%",  width: "52%", rotation:  10 },
  { top: "-5%",  right: "20%",  width: "40%", rotation: -18 },
];

/* ─── Single card ────────────────────────────────────────────────────── */
function BuyCard({ card }: { card: BuyCard }) {
  const fg    = card.darkBackground ? "#fff" : "#000";
  const btnBg = card.darkBackground ? "#fff" : "#000";
  const btnFg = card.darkBackground ? "#000" : "#fff";

  // Build image list — new array OR legacy single image
  const imageList: ImageEntry[] = card.images?.length
    ? card.images
    : card.productImage?.url
      ? [{ image: card.productImage }]
      : [];

  const label = fixNewlines(card.label ?? "");

  return (
    <a
      href={card.href || "#"}
      className="group relative flex-shrink-0 block"
      style={{
        width:        "clamp(480px, 40vw, 740px)",
        height:       "clamp(380px, 30vw, 560px)",
        borderRadius: 24,
        background:   card.backgroundColor || "#eee",
        textDecoration: "none",
        // overflow visible so images bleed above card top edge
        overflow: "visible",
      }}
    >
      {/* ── Floating product images ── */}
      {imageList.map((entry, idx) => {
        const src = entry.image?.url;
        if (!src) return null;
        const def = IMAGE_DEFAULTS[idx] ?? IMAGE_DEFAULTS[0];
        return (
          <div
            key={idx}
            className="absolute pointer-events-none"
            style={{
              top:       entry.top      ?? def.top,
              right:     entry.right    ?? def.right,
              width:     entry.width    ?? def.width,
              zIndex:    entry.zIndex   ?? (3 - idx), // first image on top
              transform: `rotate(${entry.rotation ?? def.rotation}deg)`,
            }}
          >
            <Image
              src={src}
              alt={label}
              width={600}
              height={600}
              style={{
                width:       "100%",
                height:      "auto",
                objectFit:   "contain",
                filter:      "drop-shadow(0 24px 52px rgba(0,0,0,0.42))",
                transition:  "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              className="group-hover:scale-110"
            />
          </div>
        );
      })}

      {/* ── Rounded clipping mask for card body ──
          The outer <a> is overflow:visible for images.
          This inner div clips the coloured card background to rounded rect
          so the card itself still has rounded corners.
      ── */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: card.backgroundColor || "#eee", zIndex: 0 }}
      />

      {/* ── Text + CTA — bottom left, above background div ── */}
      <div
        className="absolute bottom-0 left-0 z-10"
        style={{
          padding:  "clamp(24px,3.5vw,44px)",
          maxWidth: imageList.length ? "52%" : "88%",
        }}
      >
        <p
          className="font-black"
          style={{
            fontSize:    "clamp(2rem,3.4vw,3.4rem)",
            color:       fg,
            letterSpacing: "-0.03em",
            lineHeight:  1.08,
            whiteSpace:  "pre-line",    // renders actual \n as line break
            marginBottom: "clamp(14px,1.8vw,26px)",
            fontFamily:  "Helvetica Neue, Arial Black, sans-serif",
          }}
        >
          {label}
        </p>

        <span
          className="inline-block font-black"
          style={{
            background:    btnBg,
            color:         btnFg,
            padding:       "clamp(10px,1.1vw,15px) clamp(20px,2vw,30px)",
            borderRadius:  9999,
            fontSize:      "clamp(13px,1.1vw,16px)",
            letterSpacing: "-0.01em",
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
            fontWeight:    900,
            whiteSpace:    "nowrap",
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
  const posRef    = useRef(0);
  const pausedRef = useRef(false);
  const SPEED     = 0.38; // px per frame

  // Sort by order asc, filter published, fall back to FALLBACK_CARDS
  const raw = buyCards?.length ? buyCards : FALLBACK_CARDS;
  const cards = raw
    .filter(c => c.published !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  /* ── RAF infinite scroll — no GSAP to avoid reset flicker ── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let singleWidth = 0;

    // Measure after paint
    const setup = requestAnimationFrame(() => {
      singleWidth = track.scrollWidth / 2;

      const tick = () => {
        if (!pausedRef.current) {
          posRef.current -= SPEED;
          if (Math.abs(posRef.current) >= singleWidth) {
            posRef.current += singleWidth; // seamless jump
          }
          track.style.transform = `translateX(${posRef.current}px)`;
        }
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(setup);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [cards.length]); // re-init if card count changes

  return (
    <section
      className="bg-black py-20"
      style={{ overflow: "hidden" }}
    >
      {/* Heading */}
      <div style={{ paddingLeft: "clamp(32px,6vw,80px)", marginBottom: "clamp(28px,3.5vw,52px)" }}>
        <h2
          className="text-white font-black"
          style={{
            fontSize:      "clamp(2.2rem,4.5vw,4rem)",
            letterSpacing: "-0.035em",
            lineHeight:    1,
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
          }}
        >
          {heading || "Buy it now"}
        </h2>
      </div>

      {/*
        Wrapper: overflow visible so card images bleed upward,
        but the parent <section> clips everything via overflow:hidden.
        paddingTop gives the images room above the card tops.
      */}
      <div
        style={{ paddingTop: "clamp(36px,5.5vw,72px)", overflow: "visible" }}
        onMouseEnter={() => { pausedRef.current = true;  }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            width:       "max-content",
            gap:         "clamp(14px,1.8vw,24px)",
            paddingLeft: "clamp(32px,6vw,80px)",
            willChange:  "transform",
          }}
        >
          {/* Duplicate set for seamless infinite loop */}
          {[...cards, ...cards].map((card, i) => (
            <BuyCard key={`${i}-${card.label}`} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}