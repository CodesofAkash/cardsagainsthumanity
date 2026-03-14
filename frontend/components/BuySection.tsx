"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

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
function fixNewlines(str: string) {
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

/*
  ─── CSS keyframe injection ────────────────────────────────────────────
  We inject a <style> tag once so each floating image can use a CSS
  animation for oscillation. The rotation center point comes from the
  CMS `rotation` value, passed as a CSS custom property --base-rot.
  This keeps the animation fully in CSS (no JS per-frame) and doesn't
  conflict with the hover scale which is applied via inline transform.
*/
const ANIM_STYLE = `
  @keyframes cahTilt {
    0%   { transform: rotate(calc(var(--base-rot, 0deg) - 2.5deg)) scale(var(--img-scale, 1)); }
    50%  { transform: rotate(calc(var(--base-rot, 0deg) + 2.5deg)) scale(var(--img-scale, 1)); }
    100% { transform: rotate(calc(var(--base-rot, 0deg) - 2.5deg)) scale(var(--img-scale, 1)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cah-img-tilt { animation: none !important; }
  }
`;

function useInjectStyle() {
  useEffect(() => {
    const id = "cah-buy-anim";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = ANIM_STYLE;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
}

/* ═══════════════════════════════════════════════════════════════════════
   SINGLE CARD
   ═══════════════════════════════════════════════════════════════════════ */
function BuyCardItem({ card, isCenter }: { card: BuyCard; isCenter: boolean }) {
  const [hovered, setHovered] = useState(false);
  useInjectStyle();

  const label  = fixNewlines(card.label ?? "");
  const isDark = card.darkBackground ?? false;

  // Button: on hover → invert colors
  const ctaBg    = hovered ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#000");
  const ctaColor = hovered ? (isDark ? "#fff" : "#000") : (isDark ? "#000" : "#fff");

  const imageList: ImageEntry[] = card.images?.filter(e => e.image?.url).length
    ? card.images!
    : card.productImage?.url
      ? [{ image: card.productImage }]
      : [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:   "relative",
        width:      "100%",
        height:     "100%",
        background: card.backgroundColor || "#eee",
        borderRadius: 16,
        overflow:   "hidden",
        opacity:    isCenter ? 1 : 0.55,
        transition: "opacity 0.35s ease",
        userSelect: "none",
        cursor:     "pointer",
      }}
    >
      {/* ── Floating product images ── */}
      {imageList.map((entry, idx) => {
        const src = resolveUrl(entry.image?.url);
        if (!src) return null;

        // CMS rotation value (degrees) — becomes the CSS variable center point
        const baseRot = entry.rotation ?? 0;
        // Stagger animation start per image so they don't all move in sync
        const delay = idx * 1.8;
        // Duration varies slightly per image for organic feel
        const duration = 8 + idx * 2.5;

        return (
          <div
            key={idx}
            className="cah-img-tilt"
            style={{
              position:      "absolute",
              top:           entry.top   ?? "-10%",
              right:         entry.right ?? "0%",
              width:         entry.width ?? "55%",
              zIndex:        entry.zIndex ?? (10 - idx),
              pointerEvents: "none",
              // CSS custom properties used by the keyframe animation
              ["--base-rot" as any]:   `${baseRot}deg`,
              // Scale: 1 normally, 1.07 on hover — CSS var picked up by keyframe
              ["--img-scale" as any]:  hovered ? "1.07" : "1",
              animation: `cahTilt ${duration}s ease-in-out ${delay}s infinite`,
            }}
          >
            <Image
              src={src}
              alt={label}
              width={660}
              height={1200}
              unoptimized
              priority={isCenter}
              style={{
                width:     "100%",
                height:    "auto",
                objectFit: "contain",
                filter:    "drop-shadow(0 16px 40px rgba(0,0,0,0.4))",
                display:   "block",
              }}
            />
          </div>
        );
      })}

      {/* ── Text + CTA — bottom left ── */}
      <div style={{
        position: "absolute",
        bottom:   0,
        left:     0,
        zIndex:   20,
        padding:  "clamp(24px,3vw,48px)",
        maxWidth: imageList.length ? "50%" : "85%",
      }}>
        <p style={{
          fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
          fontWeight:    800,
          fontSize:      "clamp(2rem,3.2vw,4rem)",
          color:         isDark ? "#fff" : "#000",
          letterSpacing: "-0.03em",
          lineHeight:    1.08,
          whiteSpace:    "pre-line",
          margin:        "0 0 clamp(14px,2vw,28px) 0",
        }}>
          {label}
        </p>

        <a
          href={card.href || "#"}
          style={{
            display:        "inline-block",
            fontFamily:     "Helvetica Neue, Arial Black, sans-serif",
            fontWeight:     800,
            fontSize:       "clamp(14px,1.2vw,18px)",
            color:          ctaColor,
            background:     ctaBg,
            padding:        "clamp(10px,1vw,16px) clamp(20px,2vw,36px)",
            borderRadius:   9999,
            textDecoration: "none",
            whiteSpace:     "nowrap",
            letterSpacing:  "-0.01em",
            transition:     "background 0.25s ease, color 0.25s ease",
            border:         `2px solid ${isDark ? "#fff" : "#000"}`,
          }}
        >
          {card.cta}
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BUY SECTION — keen-slider, loop:true, center origin, auto-advance 5s
   ═══════════════════════════════════════════════════════════════════════ */
export default function BuySection({
  heading,
  buyCards,
}: {
  heading?: string;
  buyCards?: BuyCard[];
}) {
  const raw   = buyCards?.length ? buyCards : FALLBACK_CARDS;
  const cards = raw
    .filter(c => c.published !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const [currentSlide, setCurrentSlide] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
    slides: {
      origin:  "center",
      perView: 1.58,
      spacing: 26,
    },
    breakpoints: {
      "(min-width: 600px)": {
        slides: { origin: "center", perView: 1.64, spacing: 32 },
      },
      "(min-width: 1000px)": {
        slides: { origin: "center", perView: 1.68, spacing: 32 },
      },
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  const scheduleAuto = () => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      instanceRef.current?.next();
      scheduleAuto();
    }, 5000);
  };

  useEffect(() => {
    scheduleAuto();
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, []); // eslint-disable-line

  const pauseAuto  = () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  const resumeAuto = () => scheduleAuto();

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

      {/* Slider */}
      <div
        ref={sliderRef}
        className="keen-slider"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
        onTouchStart={pauseAuto}
        onTouchEnd={resumeAuto}
      >
        {cards.map((card, i) => (
          <div
            key={card.id ?? i}
            className="keen-slider__slide"
            style={{
              aspectRatio:  "16 / 11.5",
              borderRadius: 16,
              overflow:     "hidden",
            }}
          >
            <BuyCardItem card={card} isCenter={i === currentSlide} />
          </div>
        ))}
      </div>
    </section>
  );
}