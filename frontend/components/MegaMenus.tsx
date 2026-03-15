"use client";
// MegaMenus.tsx — shared dropdown menus used by both HeroSection and Navbar
// Import and use <ShopMegaMenu> and <AboutMegaMenu> in both places

import { useEffect, useState } from "react";
import Link from "next/link";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

type BuyCardImage = {
  image?: { url?: string } | null;
};

type BuyCardDoc = {
  label?: string;
  href?: string;
  backgroundColor?: string;
  productImage?: { url?: string } | null;
  images?: BuyCardImage[];
  order?: number;
  published?: boolean;
};

type ShopCard = {
  label: string;
  href: string;
  img: string;
  bg: string;
};

function resolveCmsUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${CMS_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

function pickCardImage(doc: BuyCardDoc): string {
  const imageFromList = doc.images?.find((entry) => entry.image?.url)?.image?.url;
  return resolveCmsUrl(imageFromList || doc.productImage?.url);
}

const MEGA_CARD_ANIM_STYLE = `
  @keyframes cahMegaTilt {
    0%   { transform: rotate(calc(var(--base-rot, 0deg) - 2.2deg)) scale(var(--mega-scale, 1)); }
    50%  { transform: rotate(calc(var(--base-rot, 0deg) + 2.2deg)) scale(var(--mega-scale, 1)); }
    100% { transform: rotate(calc(var(--base-rot, 0deg) - 2.2deg)) scale(var(--mega-scale, 1)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cah-mega-tilt { animation: none !important; }
  }
`;

function useInjectMegaCardAnim() {
  useEffect(() => {
    const id = "cah-mega-card-anim";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = MEGA_CARD_ANIM_STYLE;
    document.head.appendChild(el);
    return () => document.getElementById(id)?.remove();
  }, []);
}

// ── Cart Icon (exact SVG from real CAH site) ──────────────────────────────────
export function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="54" height="25" viewBox="0 0 54 25"
      fill="none" preserveAspectRatio="none"
      className={className}
      style={{ display: "block" }}
    >
      <path fillRule="evenodd" clipRule="evenodd"
        d="M6.06299 1.34888L8.19709 1.3489L15.8851 22H16.5002V24H14.4955L6.06299 1.34888Z"
        fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd"
        d="M47.937 1.34924L39.4959 24H37V22H38.1068L45.8027 1.34917L47.937 1.34924Z"
        fill="currentColor" />
      <rect x="16" y="22" width="22" height="2" fill="currentColor" />
    </svg>
  );
}

// ── Shop Mega-Menu ─────────────────────────────────────────────────────────────
// Full-width black panel with 3 product image columns
const SHOP_FALLBACK_COLS: ShopCard[] = [
  {
    label: "All Products",
    href: "/products/more-cah",
    img: "https://cardsagainsthumanity-cms.vercel.app/api/media/file/mcah",
    bg: "#7b5cf0",
  },
  {
    label: "Expansions",
    href: "/products/more-cah",
    img: "https://cardsagainsthumanity-cms.vercel.app/api/media/file/tales",
    bg: "#e8c53a",
  },
  {
    label: "Twists",
    href: "/products/more-cah",
    img: "https://cardsagainsthumanity-cms.vercel.app/api/media/file/bundle",
    bg: "#5bc8d4",
  },
];

export function ShopMegaMenu({ onClose, visible = true }: { onClose: () => void; visible?: boolean }) {
  useInjectMegaCardAnim();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shopCards, setShopCards] = useState<ShopCard[]>(
    SHOP_FALLBACK_COLS.map((card) => ({ ...card, img: "" })),
  );

  useEffect(() => {
    let active = true;

    fetch(`${CMS_URL}/api/buy-cards?where[published][equals]=true&sort=order&limit=3&depth=2`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data?.docs?.length) return;

        const docs: BuyCardDoc[] = (data.docs as BuyCardDoc[])
          .filter((doc) => doc.published !== false)
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          .slice(0, 3);

        if (!docs.length) return;

        const mapped: ShopCard[] = docs.map((doc, i) => {
          const fallback = SHOP_FALLBACK_COLS[i] ?? SHOP_FALLBACK_COLS[0];
          return {
            label: fallback.label,
            href: fallback.href,
            img: pickCardImage(doc),
            bg: fallback.bg,
          };
        });

        setShopCards(mapped);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-100 bg-black"
      style={{
        top: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-30px)",
        transition: "opacity 0.38s ease, transform 0.44s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* logo row — visible when opened from top of page where sticky nav is hidden */}
      <div style={{ height: 72, padding: "0 40px", display: "flex", alignItems: "center" }}>
        <Link
          href="/"
          onClick={onClose}
          className="font-extrabold text-white hover:opacity-70 transition-opacity"
          style={{ fontSize: "28px", letterSpacing: "-0.02em", textDecoration: "none" }}
        >
          Cards Against Humanity
        </Link>
      </div>

      <div
        style={{
          padding: "20px 36px 34px",
          borderTop: "1px solid rgba(255,255,255,0.18)",
          borderBottom: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "420px minmax(0, 1fr)",
            gap: 28,
            alignItems: "start",
          }}
        >
          <div style={{ paddingTop: 8 }}>
            <p
              className="text-white font-bold leading-[1.1]"
              style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", letterSpacing: "-0.03em", marginBottom: 45 }}
            >
              A party game
              <br />
              for horrible
              <br />
              people.
            </p>
            <Link
              href="/products/more-cah"
              onClick={onClose}
              className="inline-block font-bold text-black bg-white rounded-full hover:bg-gray-100 transition-colors"
              style={{ padding: "10px 28px", fontSize: "1.5rem", textDecoration: "none", letterSpacing: "-0.01em" }}
            >
              Buy Stuff
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 22 }}>
            {shopCards.map((col, idx) => {
              const hovered = hoveredIndex === idx;
              const baseRotation = idx % 2 === 0 ? -1.6 : 1.6;

              return (
              <a
                key={col.label}
                href={col.href}
                onClick={onClose}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{ background: col.bg, aspectRatio: "1.85/1", position: "relative" }}
                >
                  {col.img ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="cah-mega-tilt"
                        src={col.img}
                        alt={col.label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center",
                          padding: "6%",
                          boxSizing: "border-box",
                          display: "block",
                          ["--base-rot" as never]: `${baseRotation}deg`,
                          ["--mega-scale" as never]: hovered ? "1.06" : "1",
                          animation: `cahMegaTilt ${6.6 + idx * 1.1}s ease-in-out ${idx * 0.25}s infinite`,
                        }}
                      />
                    </>
                  ) : null}
                </div>
                <p
                  className="text-white font-black"
                  style={{
                    fontSize: "clamp(1.1rem,2.9vw,2.1rem)",
                    lineHeight: 1.06,
                    marginTop: 10,
                    letterSpacing: "-0.02em",
                    textDecoration: hovered ? "underline" : "none",
                    textUnderlineOffset: "0.14em",
                    textDecorationThickness: "0.11em",
                  }}
                >
                  {col.label}
                </p>
              </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── About Mega-Menu ────────────────────────────────────────────────────────────
// Full-width black panel: tagline+CTA | Info links | Help links | Email+socials
export function AboutMegaMenu({ onClose, visible = true }: { onClose: () => void; cmsHome?: unknown; visible?: boolean }) {
  const [email, setEmail] = useState("");

  const infoLinks = [
    { label: "About",     href: "#" },
    { label: "Retailers", href: "#" },
    { label: "Steal",     href: "#" },
  ];
  const helpLinks = [
    { label: "Support",  href: "#" },
    { label: "Careers",  href: "#" },
    { label: "Contact",  href: "#" },
  ];

  return (
    <div
      className="fixed left-0 right-0 z-100 bg-black"
      style={{
        top: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-30px)",
        transition: "opacity 0.38s ease, transform 0.44s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* logo row — visible when opened from top of page where sticky nav is hidden */}
      <div style={{ height: 72, padding: "0 40px", display: "flex", alignItems: "center" }}>
        <Link
          href="/"
          onClick={onClose}
          className="font-extrabold text-white hover:opacity-70 transition-opacity"
          style={{ fontSize: "28px", letterSpacing: "-0.02em", textDecoration: "none" }}
        >
          Cards Against Humanity
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px minmax(0, 1fr)",
          gap: "0 34px",
          padding: "20px 36px 34px",
          borderTop: "1px solid rgba(255,255,255,0.18)",
          borderBottom: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        {/* Col 1 — tagline + buy button */}
        <div style={{ paddingTop: 8 }}>
          <p
            className="text-white font-bold leading-[1.1]"
            style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", letterSpacing: "-0.03em", marginBottom: 45 }}
          >
            A party game
            <br />
            for horrible
            <br />
            people.
          </p>
          <Link
            href="/products/more-cah"
            onClick={onClose}
            className="inline-block font-bold text-black bg-white rounded-full hover:bg-gray-100 transition-colors"
            style={{ padding: "10px 28px", fontSize: "1.5rem", textDecoration: "none", letterSpacing: "-0.01em" }}
          >
            Buy Stuff
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.1fr", gap: "0 48px" }}>
          {/* Col 2 — Info */}
          <div>
            <p className="text-white font-black mb-4 opacity-85" style={{ fontSize: "1.05rem", letterSpacing: "0.01em" }}>Info</p>
            {infoLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={onClose}
                className="block text-white font-black hover:opacity-70 transition-opacity"
                style={{ fontSize: "clamp(2rem,3.6vw,3.6rem)", textDecoration: "none", lineHeight: 1.02, marginBottom: 10, letterSpacing: "-0.03em" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Col 3 — Help */}
          <div>
            <p className="text-white font-black mb-4 opacity-85" style={{ fontSize: "1.05rem", letterSpacing: "0.01em" }}>Help</p>
            {helpLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={onClose}
                className="block text-white font-black hover:opacity-70 transition-opacity"
                style={{ fontSize: "clamp(2rem,3.6vw,3.6rem)", textDecoration: "none", lineHeight: 1.02, marginBottom: 10, letterSpacing: "-0.03em" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Col 4 — Email list + socials */}
          <div>
            <p className="text-white font-bold mb-3" style={{ fontSize: "1.5rem", letterSpacing: "0.01em" }}>Email List</p>
            <p className="text-white mb-5 font-bold" style={{ fontSize: "1.5rem", letterSpacing: "0.01em", lineHeight: 1 }}>
              Sign up and we&apos;ll let you know first when we do anything.
            </p>
            <div
              className="flex items-center rounded-2xl overflow-hidden"
              style={{ border: "2px solid rgba(255,255,255,0.85)" }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 bg-transparent text-white placeholder-white/70 outline-none"
                style={{ padding: "10px 14px", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" }}
              />
              <button
                type="button"
                className="flex items-center justify-center rounded-full border text-white hover:bg-white hover:text-black transition-colors shrink-0"
                style={{ width: 34, height: 34, margin: "0 6px", borderColor: "rgba(255,255,255,0.85)", borderWidth: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Socials */}
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-black bg-white hover:opacity-80 transition-opacity"
                style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Facebook */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-black bg-white hover:opacity-80 transition-opacity"
                style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Instagram */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Backdrop (closes menu on click outside) ───────────────────────────────────
export function MenuBackdrop({ onClose, visible = true }: { onClose: () => void; visible?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-99"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.32s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={onClose}
    />
  );
}