"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getOrCreateCart,
  fetchCartById,
  medusaHeaders,
  MEDUSA_URL,
} from "@/hooks/useCart";
import CartProvider, { useCartCtx } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import Navbar from "@/components/Navbar";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

function cmsImg(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${CMS_URL}${url}`;
}

type CMSUpload = string | { url?: string | null } | null | undefined;
type ProductImageRow = { image?: CMSUpload } | null | undefined;
type ProductWithMedia = {
  mainImage?: CMSUpload;
  galleryImages?: ProductImageRow[] | null;
  images?: ProductImageRow[] | null;
};

function getUploadUrl(upload: CMSUpload): string {
  if (!upload) return "";
  if (typeof upload === "string") return cmsImg(upload);
  return cmsImg(upload.url ?? undefined);
}

function resolveProductMedia(product: ProductWithMedia | null | undefined): { mainImage: string; galleryImages: string[] } {
  if (!product) return { mainImage: "", galleryImages: [] };

  const fromGallery = (product.galleryImages ?? [])
    .map((entry: ProductImageRow) => getUploadUrl(entry?.image))
    .filter(Boolean);

  const fromLegacy = (product.images ?? [])
    .map((entry: ProductImageRow) => getUploadUrl(entry?.image))
    .filter(Boolean);

  const all = Array.from(new Set([...fromGallery, ...fromLegacy]));
  const explicitMain = getUploadUrl(product.mainImage);
  const mainImage = explicitMain || all[0] || "";
  const galleryImages = Array.from(new Set([mainImage, ...all].filter(Boolean)));

  return { mainImage, galleryImages };
}

/* ─── CAH sticker images — 3 unique ones, cycled per product ─────────── */
const CAH_STICKERS = [
  "https://cdn.sanity.io/images/vc07edlh/production/d98a87617638bf60abb3bd34aae39e710f2ec718-81x81.svg",
  "https://cdn.sanity.io/images/vc07edlh/production/d798a01794503606266a78a74409f913cc586da6-80x81.svg",
  "https://cdn.sanity.io/images/vc07edlh/production/0d3c92b84597615cbf086163fff344e68e2e2359-80x81.svg",
];

/* ─── inject CSS ─────────────────────────────────────────────────────── */
const INJECT_CSS = `
  @keyframes cahBadgeSpin {
    0%   { transform: rotate(-6deg); }
    50%  { transform: rotate(6deg); }
    100% { transform: rotate(-6deg); }
  }
  @keyframes cahImgSlideInFromRight {
    from { transform: translateX(120%); }
    to   { transform: translateX(0); }
  }
  @keyframes cahImgSlideOutToLeft {
    from { transform: translateX(0); }
    to   { transform: translateX(-120%); }
  }
  @keyframes cahImgSlideInFromLeft {
    from { transform: translateX(-120%); }
    to   { transform: translateX(0); }
  }
  @keyframes cahImgSlideOutToRight {
    from { transform: translateX(0); }
    to   { transform: translateX(120%); }
  }
  @keyframes cahPanelScaleIn {
    from { transform: scale(0.22); opacity: 0.35; }
    to   { transform: scale(1); opacity: 1; }
  }
  @keyframes cahPanelScaleOut {
    from { transform: scale(1); opacity: 1; }
    to   { transform: scale(0.14); opacity: 0; }
  }
  .cah-panel-control {
    background: #f4f4f4;
    color: #111;
    border: 2px solid #111;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
  .cah-panel-control:hover {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .cah-panel-control:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cah-panel-control:disabled:hover {
    background: #f4f4f4;
    color: #111;
    border-color: #111;
  }
  @media (prefers-reduced-motion: reduce) {
    .cah-badge-spin { animation: none !important; }
  }
`;

function useInjectStyle(id: string, css: string) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}

/* ─── PlusIcons ──────────────────────────────────────────────────────── */
function PlusIcons() {
  const positions: React.CSSProperties[] = [
    { top: "9%",  left: "6%" }, { top: "28%", left: "3%" },
    { top: "52%", left: "4%" }, { top: "74%", left: "3%" },
    { top: "14%", right: "2%" }, { top: "38%", right: "2%" },
    { top: "60%", right: "3%" }, { top: "5%",  left: "50%" },
    { top: "82%", left: "44%" }, { top: "46%", right: "8%" },
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <span key={i} className="absolute select-none pointer-events-none font-black"
          style={{ ...pos, color: "rgba(255,255,255,0.18)", fontSize: "1.4rem", lineHeight: 1 }}>
          ✦
        </span>
      ))}
    </>
  );
}

/* ─── StarburstBadge ─────────────────────────────────────────────────── */
function StarburstBadge({ text, size = 80 }: { text: string; size?: number }) {
  const n = 16, cx = size / 2, cy = size / 2, oR = cx - 2, iR = cx - 10;
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 ? iR : oR;
    d += (i ? "L" : "M") + `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  d += "Z";
  return (
    <div className="cah-badge-spin" style={{
      width: size, height: size, position: "relative", flexShrink: 0,
      animation: "cahBadgeSpin 3s ease-in-out infinite",
      transformOrigin: "center",
    }}>
      <svg width={size} height={size} style={{ position: "absolute" }}>
        <path d={d} fill="white" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 6 }}>
        <span className="font-black text-black text-center leading-tight"
          style={{ fontSize: size * 0.155 }}>
          {text}
        </span>
      </div>
    </div>
  );
}

/* ─── ImageViewer ────────────────────────────────────────────────────── */
function ImageViewer({ images }: { images: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [viewIdx, setViewIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [sliding, setSliding] = useState<"in" | "out" | null>(null);
  const [slideDir, setSlideDir] = useState<"prev" | "next">("next");
  const currentIdx = images.length ? viewIdx % images.length : 0;
  const autoAdvanceTimer = useRef<number | null>(null);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current !== null) {
      window.clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  useEffect(() => {
    clearAutoAdvance();
    if (expanded || images.length < 2) return undefined;

    autoAdvanceTimer.current = window.setTimeout(() => {
      setSlideDir("next");
      setSliding("out");
      window.setTimeout(() => {
        setViewIdx((i) => (i + 1) % images.length);
        setAnimKey((k) => k + 1);
        setSliding("in");
        window.setTimeout(() => setSliding(null), 420);
      }, 120);
    }, 5000);

    return clearAutoAdvance;
  }, [clearAutoAdvance, currentIdx, expanded, images.length]);

  const navigate = useCallback((dir: "prev" | "next") => {
    if (!images.length) return;
    clearAutoAdvance();
    setSlideDir(dir);
    setSliding("out");
    setTimeout(() => {
      setViewIdx(i => dir === "next"
        ? (i + 1) % images.length
        : (i - 1 + images.length) % images.length);
      setAnimKey((k) => k + 1);
      setSliding("in");
      setTimeout(() => setSliding(null), 400);
    }, 120);
  }, [clearAutoAdvance, images.length]);

  const closeExpanded = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setExpanded(false);
      setIsClosing(false);
    }, 320);
  }, []);

  if (!images.length) return null;

  return (
    <div style={{ position: "absolute", bottom: -72, left: -120, zIndex: 50 }}>
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Open product gallery"
          style={{
            width: 92,
            height: 92,
            borderRadius: 14,
            border: "2px solid rgba(255,255,255,0.6)",
            background: "#f2f2f2",
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#fff", borderRadius: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={animKey}
              src={images[currentIdx]}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 8,
                animation: sliding === "in"
                  ? slideDir === "next"
                    ? "cahImgSlideInFromRight 0.42s ease forwards"
                    : "cahImgSlideInFromLeft 0.42s ease forwards"
                  : sliding === "out"
                    ? slideDir === "next"
                      ? "cahImgSlideOutToLeft 0.24s ease forwards"
                      : "cahImgSlideOutToRight 0.24s ease forwards"
                    : "none",
              }}
            />
          </div>
        </button>
      )}

      {(expanded || isClosing) && (
        <div style={{
          width: "clamp(320px,42vw,520px)",
          background: "#fff",
          color: "#000",
          borderRadius: 24,
          border: "2px solid #000",
          zIndex: 50,
          overflow: "hidden",
          boxShadow: "0 18px 44px rgba(0,0,0,0.55)",
          transformOrigin: "left bottom",
          animation: isClosing
            ? "cahPanelScaleOut 0.32s cubic-bezier(0.4, 0, 1, 1) forwards"
            : "cahPanelScaleIn 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <button onClick={closeExpanded}
              className="cah-panel-control"
              style={{ display: "flex", alignItems: "center", gap: 6,
                borderRadius: 9999, padding: "6px 14px",
                fontWeight: 950, fontSize: "1rem", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75">
                <path d="M18 6L6 18M6 18H14M6 18V10"/>
              </svg>
              HIDE
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {(["prev","next"] as const).map(dir => (
                <button key={dir} onClick={() => navigate(dir)}
                  aria-label={dir === "prev" ? "Previous image" : "Next image"}
                  className="cah-panel-control"
                  disabled={images.length < 2}
                  style={{ width: 42, height: 42, borderRadius: "50%",
                    cursor: images.length < 2 ? "not-allowed" : "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", fontWeight: 950, fontSize: "1.05rem", lineHeight: 1 }}>
                  <span>{dir === "prev" ? "<-" : "->"}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: "clamp(280px,35vw,420px)", display: "flex", alignItems: "center",
            justifyContent: "center", background: "#fff", padding: 24, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={animKey} src={images[currentIdx]} alt=""
              style={{
                maxHeight: "100%", maxWidth: "100%", objectFit: "contain",
                animation: sliding === "in"
                  ? slideDir === "next"
                    ? "cahImgSlideInFromRight 0.35s ease forwards"
                    : "cahImgSlideInFromLeft 0.35s ease forwards"
                  : sliding === "out"
                    ? slideDir === "next"
                      ? "cahImgSlideOutToLeft 0.22s ease forwards"
                      : "cahImgSlideOutToRight 0.22s ease forwards"
                    : "none",
              }} />
          </div>

        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   RELATED PRODUCT CARD
   — Specific CAH stickers fly out on hover
   — Stickers follow mouse movement direction (parallax offset)
════════════════════════════════════════════════════════════════════════ */
// Sticker positions relative to card (as % offsets)
const STICKER_SLOTS = [
  { top: "-3%", left: "41%", rotation: -8, scale: 1.02, xDir: 0, yDir: -1 },
  { top: "41%", left: "-14%", rotation: -14, scale: 1.0, xDir: -1, yDir: 0 },
  { top: "41%", right: "-14%", rotation: 14, scale: 1.0, xDir: 1, yDir: 0 },
  { top: "85%", left: "9%", rotation: -10, scale: 0.96, xDir: -1, yDir: 1 },
  { top: "85%", right: "9%", rotation: 10, scale: 0.96, xDir: 1, yDir: 1 },
];

function RelatedProductCard({
  product,
  stickerIdx,   // which sticker image to use (0,1,2) — cycles per card
  onCartUpdate,
  onCartOpen,
}: {
  product: any;
  stickerIdx: number;
  onCartUpdate: (d: any) => void;
  onCartOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [added,   setAdded]   = useState(false);
  const [ctaHover, setCtaHover] = useState(false);

  // Mouse position relative to card center — for parallax
  const [mouseOff, setMouseOff] = useState({ x: 0, y: 0 });
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const stickerSrc = CAH_STICKERS[stickerIdx % CAH_STICKERS.length];

  const { mainImage: mainImg } = resolveProductMedia(product);
  const price     = product.price ? `€${(product.price / 100).toFixed(2)}` : null;
  const href      = product.slug  ? `/products/${product.slug}` : "#";
  const variantId = product.variantId || "";

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imageAreaRef.current) return;
    const rect = imageAreaRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    setMouseOff({ x: nx, y: ny });
  }

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId) return;
    setAdding(true);
    try {
      const cartId = await getOrCreateCart();
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
        method: "POST", headers: medusaHeaders,
        body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      });
      const data = await fetchCartById(cartId);
      onCartUpdate(data);
      setAdded(true);
      onCartOpen();
      setTimeout(() => setAdded(false), 2500);
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  }

  // We show 3 copies of the same sticker image in different positions
  // (matching the screenshots where the same sticker type repeats around the card)
  const stickerSlots = STICKER_SLOTS;

  return (
    <div style={{ position: "relative", zIndex: hovered ? 40 : 1 }}>
      {/* ── Card body ── */}
      <a href={href} style={{
        display: "flex", flexDirection: "column",
        background: "#0a0a0a",
        border: "2px solid #fff",
        borderRadius: 18, overflow: "visible",
        textDecoration: "none", minHeight: 640,
        cursor: "pointer", position: "relative", width: "100%", maxWidth: 415, zIndex: 10,
      }}>
        {/* Oscillating badge */}
        <div style={{ position: "absolute", top: -14, right: -14, zIndex: 20 }}>
          <StarburstBadge text="New!" size={72} />
        </div>

        {/* Title + description */}
        <div style={{ padding: "28px 28px 0" }}>
          <h3 style={{ color: "#fff", fontWeight: 900,
            fontSize: "clamp(2rem,2.2vw,2.45rem)", lineHeight: 1.07,
            letterSpacing: "-0.015em", marginBottom: 12 }}>
            {product.title}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1.05rem", lineHeight: 1.35, fontWeight: 600 }}>
            {product.description}
          </p>
        </div>

        {/* Main image — scales + tilts on hover */}
        <div
          ref={imageAreaRef}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px 28px", minHeight: 240, overflow: "visible", position: "relative" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setMouseOff({ x: 0, y: 0 }); }}
          onMouseMove={onMouseMove}
        >
          {stickerSlots.map((slot, i) => {
            const parallaxStrength = 16;
            const px = hovered ? mouseOff.x * parallaxStrength : 0;
            const py = hovered ? mouseOff.y * parallaxStrength : 0;

            return (
              <div key={i} style={{
                position: "absolute",
                top: slot.top,
                left: "left" in slot ? slot.left : undefined,
                right: "right" in slot ? slot.right : undefined,
                width: "clamp(58px,6.1vw,92px)",
                zIndex: 120,
                pointerEvents: "none",
                opacity: hovered ? 1 : 0,
                transform: hovered
                  ? `translate(${px}px, ${py}px) rotate(${slot.rotation}deg) scale(${slot.scale})`
                  : `translate(0px, 0px) rotate(${slot.rotation}deg) scale(0.62)`,
                transition: "opacity 0.2s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stickerSrc}
                  alt=""
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.55))",
                  }}
                />
              </div>
            );
          })}

          {mainImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImg} alt={product.title} style={{
              maxHeight: 240, maxWidth: "100%", objectFit: "contain",
              filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.85))",
              transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
              transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              transformOrigin: "center bottom", position: "relative", zIndex: 180,
            }} />
          ) : (
            <div style={{ width: 140, height: 200, background: "#111", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 900, fontSize: "0.85rem",
                textAlign: "center", padding: "0 12px" }}>{product.title}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "0 20px 20px" }}>
          {price && variantId ? (
            <button onClick={handleAdd} disabled={adding}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              style={{
              width: "100%", fontWeight: 900, borderRadius: 9999, border: ctaHover ? "2px solid #000" : "2px solid #fff",
              cursor: adding ? "not-allowed" : "pointer",
              padding: "18px 28px", fontSize: "1.4rem",
              background: added ? "#22c55e" : ctaHover ? "#fff" : "#000",
              color: added ? "#fff" : ctaHover ? "#000" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}>
              <span style={{ fontWeight: 700, fontSize: "1.65rem", letterSpacing: "0.02em", lineHeight: 1 }}>
                {adding ? "Adding…" : added ? "✓ Added!" : "Add to Cart"}
              </span>
              <span style={{ fontWeight: 700, fontSize: "1.65rem", letterSpacing: "0.02em", lineHeight: 1 }}>
                {price}
              </span>
            </button>
          ) : (
            <button disabled style={{
              width: "100%", fontWeight: 700, borderRadius: 9999,
              padding: "18px 28px", fontSize: "1.4rem",
              background: "transparent", color: "#fff",
              border: "2px solid rgba(255,255,255,0.25)", cursor: "not-allowed",
            }}>
              Unavailable In Your Region
            </button>
          )}
        </div>
      </a>
    </div>
  );
}

/* ─── Related Products section ───────────────────────────────────────── */
function RelatedProducts({
  excludeSlug, onCartUpdate, onCartOpen,
}: {
  excludeSlug: string;
  onCartUpdate: (d: any) => void;
  onCartOpen: () => void;
}) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${CMS_URL}/api/products?depth=2&limit=20`)
      .then(r => r.json())
      .then(d => {
        const all = d?.docs ?? [];
        setProducts(all.filter((p: any) => p.slug !== excludeSlug).slice(0, 3));
      })
      .catch(() => {});
  }, [excludeSlug]);

  if (!products.length) return null;

  return (
    <section style={{ background: "#000", padding: "80px 48px",
      borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <h2 style={{ color: "#fff", fontWeight: 900,
        fontSize: "clamp(1.8rem,3.5vw,2.6rem)", letterSpacing: "-0.02em", marginBottom: 40 }}>
        You should check out:
      </h2>
      {/* overflow:visible so stickers can fly outside card bounds */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 415px))", gap: 25,
        overflow: "visible", justifyContent: "center", justifyItems: "center" }}>
        {products.map((p: any, i: number) => (
          <RelatedProductCard
            key={p.id ?? i}
            product={p}
            stickerIdx={i}        // card 0 → sticker[0], card 1 → sticker[1], card 2 → sticker[2]
            onCartUpdate={onCartUpdate}
            onCartOpen={onCartOpen}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: "Shop",    links: ["All Products","Main Games","Expansions","Family","Packs","Other Stuff"] },
    { heading: "Info",    links: ["About","Support","Contact","Retailers","Steal","Careers"] },
    { heading: "Find Us", links: ["Facebook","Instagram","TikTok","Bluesky","Amazon","Target"] },
  ];
  return (
    <footer className="bg-white" style={{ padding: "64px 48px 32px" }}>
      <div className="grid mb-12" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr", gap: "0 48px" }}>
        <p className="text-black font-black leading-tight" style={{ fontFamily: "Georgia,serif", fontSize: "2rem", letterSpacing: "-0.02em" }}>
          Cards<br />Against<br />Humanity
        </p>
        {cols.map(col => (
          <div key={col.heading}>
            <p className="font-black text-black mb-4 text-base">{col.heading}</p>
            {col.links.map(l => (
              <a key={l} href="#" className="block text-black underline text-sm mb-2 hover:opacity-60">{l}</a>
            ))}
          </div>
        ))}
        <div>
          <p className="font-black text-black mb-2 text-base">Email List</p>
          <p className="text-sm text-black mb-4">Sign up and we&apos;ll let you know first when we do anything:</p>
          <div className="flex items-center border-2 border-black rounded-lg overflow-hidden">
            <input type="email" placeholder="Email Address"
              className="flex-1 px-3 py-3 text-sm outline-none text-black bg-white" />
            <button className="mr-1.5 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap" style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 20, gap: 16 }}>
        <span className="border border-black rounded-full font-black text-black text-sm" style={{ padding: "6px 14px" }}>India ›</span>
        <div className="flex gap-5 flex-wrap">
          {["Terms of Use","Privacy Policy","Submission Terms","Cookie Preferences"].map(l => (
            <a key={l} href="#" className="text-black hover:underline text-sm">{l}</a>
          ))}
        </div>
        <p className="text-sm text-black">©2026 Cards Against Humanity LLC</p>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN PRODUCT PAGE
════════════════════════════════════════════════════════════════════════ */
export default function ProductPage() {
  return (
    <CartProvider>
      <ProductPageContent />
    </CartProvider>
  );
}

function ProductPageContent() {
  useInjectStyle("cah-product-anim", INJECT_CSS);

  const params = useParams();
  const slug   = typeof params?.slug === "string" ? params.slug : "more-cah";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [added,   setAdded]   = useState(false);

  const { cartData, cartOpen, checkoutOpen,
          setCartOpen, setCheckoutOpen, updateCart, clearCart } = useCartCtx();

  useEffect(() => {
    setLoading(true);
    fetch(`${CMS_URL}/api/products?where[slug][equals]=${slug}&depth=2`)
      .then(r => r.json())
      .then(d => { setProduct(d?.docs?.[0] ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const variantId = product?.variantId || "";

  async function handleAddToCart() {
    if (!variantId) return;
    setAdding(true);
    try {
      const cartId = await getOrCreateCart();
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
        method: "POST", headers: medusaHeaders,
        body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      });
      const data = await fetchCartById(cartId);
      updateCart(data);
      setAdded(true);
      setCartOpen(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  }

  const { mainImage, galleryImages } = resolveProductMedia(product);
  const priceDisplay = product?.price ? `€${(product.price / 100).toFixed(2)}` : "€29";

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black text-xl animate-pulse">Loading…</div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <p className="text-white font-black text-2xl">Product not found.</p>
      <Link href="/" className="text-white underline">← Back to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black" style={{ paddingTop: 72 }}>
      <Navbar cmsHome={null} alwaysVisible />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cartData={cartData} onCartUpdate={updateCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)}
        cartData={cartData} onOrderComplete={clearCart} />

      {/* Hero */}
      <div className="relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <PlusIcons />
        <div className="relative z-10" style={{
          maxWidth: 1200, margin: "0 auto", padding: "64px 40px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start",
        }}>
          {/* Left: image + viewer */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 420 }}>
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={product.title}
                  style={{ maxHeight: 500, maxWidth: "100%", objectFit: "contain",
                    filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.8))" }} />
              ) : (
                <div style={{ width: 280, height: 380, background: "#111", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 900,
                    fontSize: "1rem", textAlign: "center", padding: "0 24px" }}>
                    {product.title}
                  </span>
                </div>
              )}
            </div>
            <ImageViewer images={galleryImages} />
          </div>

          {/* Right: info */}
          <div style={{ paddingTop: 8 }}>
            <h1 style={{ color: "#fff", fontWeight: 900,
              fontSize: "clamp(2.2rem,4vw,3rem)", letterSpacing: "-0.02em",
              marginBottom: 28, lineHeight: 1.1 }}>
              {product.title}
            </h1>
            {product.description && (
              <div style={{ color: "#fff", fontSize: "1.1rem", lineHeight: 1.65, marginBottom: 24 }}>
                {(() => {
                  const dot = product.description.indexOf(". ");
                  if (dot === -1) return <p><strong>{product.description}</strong></p>;
                  return <p><strong>{product.description.slice(0, dot + 1)}</strong> {product.description.slice(dot + 2)}</p>;
                })()}
              </div>
            )}
            {product.bullets?.length > 0 && (
              <ul style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                {product.bullets.map((b: any, i: number) => (
                  <li key={i} style={{ color: "#fff", display: "flex", gap: 12,
                    fontSize: "1.05rem", lineHeight: 1.55 }}>
                    <span style={{ marginTop: 4, flexShrink: 0 }}>•</span>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={handleAddToCart} disabled={adding || !variantId}
              style={{
                width: "100%", fontWeight: 900, borderRadius: 9999, border: "none",
                padding: "20px 32px", fontSize: "1.25rem", letterSpacing: "-0.01em",
                cursor: (adding || !variantId) ? "not-allowed" : "pointer",
                background: added ? "#22c55e" : variantId ? "#fff" : "rgba(255,255,255,0.15)",
                color: added ? "#fff" : variantId ? "#000" : "rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "background 0.25s",
              }}>
              <span>
                {!variantId ? "Configure variantId in CMS"
                  : adding ? "Adding…"
                  : added  ? "✓ Added to Cart!"
                  : "Add to Cart"}
              </span>
              <span>{priceDisplay}</span>
            </button>
          </div>
        </div>
      </div>

      <RelatedProducts excludeSlug={slug} onCartUpdate={updateCart} onCartOpen={() => setCartOpen(true)} />
      <Footer />
    </div>
  );
}