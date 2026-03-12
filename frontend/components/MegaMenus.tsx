"use client";
// MegaMenus.tsx — shared dropdown menus used by both HeroSection and Navbar
// Import and use <ShopMegaMenu> and <AboutMegaMenu> in both places

import { useState } from "react";

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
const SHOP_COLS = [
  {
    label: "All Products",
    href: "/products/more-cah",
    img: "https://img.cah.io/images/vc07edlh/production/c1f921d8c8fd60969110124ebb20ad5d9878861c-1080x1080.png?auto=format&q=75&w=600",
    bg: "#7b5cf0",
  },
  {
    label: "Expansions",
    href: "#",
    img: "https://img.cah.io/images/vc07edlh/production/31fcc3f68a626462e5707bcc5ce19ee716f2e173-1080x1080.png?auto=format&q=75&w=600",
    bg: "#e8c53a",
  },
  {
    label: "Twists",
    href: "#",
    img: "https://img.cah.io/images/vc07edlh/production/1acdec5a623b0761a127ac03492b998879ead549-680x680.png?auto=format&q=75&w=600",
    bg: "#5bc8d4",
  },
];

export function ShopMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed left-0 right-0 z-[100] bg-black"
      style={{ top: 0 }}
      onClick={e => e.stopPropagation()}
    >
      {/* invisible top strip so the nav buttons stay clickable */}
      <div style={{ height: 64 }} />
      <div style={{ padding: "0 40px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {SHOP_COLS.map(col => (
            <a
              key={col.label}
              href={col.href}
              onClick={onClose}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: col.bg, aspectRatio: "4/3", position: "relative" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={col.img}
                  alt={col.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <p className="text-white font-black mt-3" style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)" }}>
                {col.label}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── About Mega-Menu ────────────────────────────────────────────────────────────
// Full-width black panel: tagline+CTA | Info links | Help links | Email+socials
export function AboutMegaMenu({ onClose, cmsHome }: { onClose: () => void; cmsHome?: any }) {
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
      className="fixed left-0 right-0 z-[100] bg-black"
      style={{ top: 0 }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ height: 64 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "0 48px",
          padding: "32px 40px 48px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Col 1 — tagline + buy button */}
        <div>
          <p
            className="text-white font-black leading-tight mb-8"
            style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontFamily: "Georgia, serif" }}
          >
            A party game<br />for horrible<br />people.
          </p>
          <a
            href="/products/more-cah"
            onClick={onClose}
            className="inline-block font-black text-black bg-white rounded-full hover:bg-gray-100 transition-colors"
            style={{ padding: "14px 28px", fontSize: "1.1rem", textDecoration: "none" }}
          >
            Buy Stuff
          </a>
        </div>

        {/* Col 2 — Info */}
        <div>
          <p className="text-white font-black mb-4 opacity-50 uppercase tracking-widest" style={{ fontSize: "0.8rem" }}>Info</p>
          {infoLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={onClose}
              className="block text-white font-black hover:opacity-70 transition-opacity"
              style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", textDecoration: "none", lineHeight: 1.15, marginBottom: 4 }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Col 3 — Help */}
        <div>
          <p className="text-white font-black mb-4 opacity-50 uppercase tracking-widest" style={{ fontSize: "0.8rem" }}>Help</p>
          {helpLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={onClose}
              className="block text-white font-black hover:opacity-70 transition-opacity"
              style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", textDecoration: "none", lineHeight: 1.15, marginBottom: 4 }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Col 4 — Email list + socials */}
        <div>
          <p className="text-white font-black mb-2" style={{ fontSize: "1rem" }}>Email List</p>
          <p className="text-white mb-5" style={{ fontSize: "0.95rem", lineHeight: 1.5, opacity: 0.75 }}>
            Sign up and we&apos;ll let you know first when we do anything.
          </p>
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: "1.5px solid rgba(255,255,255,0.4)" }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none"
              style={{ padding: "12px 14px", fontSize: "0.95rem" }}
            />
            <button
              type="button"
              className="flex items-center justify-center rounded-full border border-white/40 hover:bg-white hover:text-black transition-colors flex-shrink-0 text-white"
              style={{ width: 36, height: 36, margin: "0 6px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          {/* Socials */}
          <div className="flex gap-4 mt-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="text-white hover:opacity-70 transition-opacity"
              style={{ width: 40, height: 40, border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Facebook */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="text-white hover:opacity-70 transition-opacity"
              style={{ width: 40, height: 40, border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Instagram */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Backdrop (closes menu on click outside) ───────────────────────────────────
export function MenuBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[99]"
      onClick={onClose}
    />
  );
}