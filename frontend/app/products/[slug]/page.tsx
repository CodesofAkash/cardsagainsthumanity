"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useCart,
  getOrCreateCart,
  fetchCartById,
  medusaHeaders,
  MEDUSA_URL,
} from "@/hooks/useCart";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import { CartIcon } from "@/components/MegaMenus";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

function cmsImg(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${CMS_URL}${url}`;
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
  @keyframes cahImgSlideIn {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
  @keyframes cahImgSlideOut {
    from { transform: translateX(0);    opacity: 1; }
    to   { transform: translateX(-60px); opacity: 0; }
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
  const [open, setOpen]       = useState(false);
  const [viewIdx, setViewIdx] = useState(0);
  const [sliding, setSliding] = useState<"in" | "out" | null>(null);
  const imgKey = useRef(0);

  const navigate = useCallback((dir: "prev" | "next") => {
    setSliding("out");
    setTimeout(() => {
      setViewIdx(i => dir === "next"
        ? (i + 1) % images.length
        : (i - 1 + images.length) % images.length);
      imgKey.current++;
      setSliding("in");
      setTimeout(() => setSliding(null), 400);
    }, 220);
  }, [images.length]);

  if (images.length < 2) return null;

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {images.map((src, i) => (
          <button key={i} onClick={() => { setViewIdx(i); setOpen(true); }}
            style={{ width: 68, height: 68, border: "2px solid rgba(255,255,255,0.25)",
              borderRadius: 10, overflow: "hidden", background: "#111", flexShrink: 0, cursor: "pointer",
              transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "white")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
      {open && (
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          width: "clamp(320px,42vw,520px)",
          background: "#fff", borderRadius: "0 16px 0 0", zIndex: 50,
          overflow: "hidden", boxShadow: "0 -4px 40px rgba(0,0,0,0.6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <button onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
                border: "1.5px solid #000", borderRadius: 9999, padding: "6px 14px",
                fontWeight: 900, fontSize: "0.85rem", cursor: "pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
              </svg>
              HIDE
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {(["prev","next"] as const).map(dir => (
                <button key={dir} onClick={() => navigate(dir)}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #000",
                    background: "none", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points={dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: "clamp(280px,35vw,420px)", display: "flex", alignItems: "center",
            justifyContent: "center", background: "#fff", padding: 24, overflow: "hidden" }}>
            <img key={imgKey.current} src={images[viewIdx]} alt=""
              style={{
                maxHeight: "100%", maxWidth: "100%", objectFit: "contain",
                animation: sliding === "in"
                  ? "cahImgSlideIn 0.35s ease forwards"
                  : sliding === "out"
                    ? "cahImgSlideOut 0.22s ease forwards"
                    : "none",
              }} />
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   RELATED PRODUCT CARD
   — Specific CAH stickers fly out on hover
   — Stickers follow mouse movement direction (parallax offset)
════════════════════════════════════════════════════════════════════════ */
// Sticker positions relative to card (as % offsets)
const STICKER_SLOTS = [
  { top: "8%",  left: "-14%", rotation: -25, scale: 1.1 },
  { top: "45%", left: "-18%", rotation: 18,  scale: 0.95 },
  { top: "10%", right: "-14%",rotation: 22,  scale: 1.05 },
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

  // Mouse position relative to card center — for parallax
  const [mouseOff, setMouseOff] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const stickerSrc = CAH_STICKERS[stickerIdx % CAH_STICKERS.length];

  const images: string[] = (product.images ?? [])
    .map((img: any) => img.image?.url ? cmsImg(img.image.url) : "")
    .filter(Boolean);
  const mainImg   = images[0] || null;
  const price     = product.price ? `€${(product.price / 100).toFixed(2)}` : null;
  const href      = product.slug  ? `/products/${product.slug}` : "#";
  const variantId = product.variantId || "";

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    // Offset from card center, normalized -1 to 1
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
    <div ref={cardRef} style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMouseOff({ x: 0, y: 0 }); }}
      onMouseMove={onMouseMove}>

      {/* ── Stickers — fly out on hover, follow mouse with parallax ── */}
      {stickerSlots.map((slot, i) => {
        // Parallax: move up to 12px in mouse direction, staggered per sticker
        const parallaxStrength = 12 + i * 4;
        const px = hovered ? mouseOff.x * parallaxStrength : 0;
        const py = hovered ? mouseOff.y * parallaxStrength : 0;

        return (
          <div key={i} style={{
            position:      "absolute",
            top:           slot.top,
            left:          (slot as any).left,
            right:         (slot as any).right,
            width:         "clamp(52px,6vw,80px)",
            zIndex:        40,
            pointerEvents: "none",
            // Fly in/out: opacity + scale + translate
            opacity:       hovered ? 1 : 0,
            transform:     hovered
              ? `rotate(${slot.rotation}deg) scale(${slot.scale}) translate(${px}px, ${py}px)`
              : `rotate(${slot.rotation}deg) scale(0.3) translateY(30px)`,
            transition:    `opacity 0.35s ease ${i * 0.06}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerSrc} alt=""
              style={{ width: "100%", height: "auto", display: "block",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))" }} />
          </div>
        );
      })}

      {/* ── Card body ── */}
      <a href={href} style={{
        display: "flex", flexDirection: "column",
        background: "#0a0a0a",
        border: "1.5px solid rgba(255,255,255,0.12)",
        borderRadius: 18, overflow: "hidden",
        textDecoration: "none", minHeight: 520,
        cursor: "pointer", position: "relative",
      }}>
        {/* Oscillating badge */}
        <div style={{ position: "absolute", top: -14, right: -14, zIndex: 20 }}>
          <StarburstBadge text="New!" size={72} />
        </div>

        {/* Title + description */}
        <div style={{ padding: "28px 28px 0" }}>
          <h3 style={{ color: "#fff", fontWeight: 900,
            fontSize: "clamp(1.3rem,1.8vw,1.6rem)", letterSpacing: "-0.02em", marginBottom: 10 }}>
            {product.title}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.55 }}>
            {product.description}
          </p>
        </div>

        {/* Main image — scales + tilts on hover */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 28px", minHeight: 240, overflow: "hidden" }}>
          {mainImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImg} alt={product.title} style={{
              maxHeight: 240, maxWidth: "100%", objectFit: "contain",
              filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.85))",
              transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
              transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              transformOrigin: "center bottom",
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
            <button onClick={handleAdd} disabled={adding} style={{
              width: "100%", fontWeight: 900, borderRadius: 9999, border: "none",
              cursor: adding ? "not-allowed" : "pointer",
              padding: "18px 28px", fontSize: "1.1rem",
              background: added ? "#22c55e" : "#fff",
              color: added ? "#fff" : "#000",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "background 0.25s",
            }}>
              <span>{adding ? "Adding…" : added ? "✓ Added!" : "Add to Cart"}</span>
              <span>{price}</span>
            </button>
          ) : (
            <button disabled style={{
              width: "100%", fontWeight: 900, borderRadius: 9999,
              padding: "18px 28px", fontSize: "1.1rem",
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
        overflow: "visible" }}>
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

/* ─── Navbar ─────────────────────────────────────────────────────────── */
function Navbar({ cartCount, onCartOpen }: { cartCount: number; onCartOpen: () => void }) {
  const [shopOpen, setShopOpen]   = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const close = () => { setShopOpen(false); setAboutOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const chevron = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );

  return (
    <nav className="bg-black sticky top-0 z-30 flex items-center justify-between"
      style={{ padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <Link href="/" className="text-white font-black hover:opacity-80"
        style={{ fontSize: "1.25rem", textDecoration: "none" }}>
        Cards Against Humanity
      </Link>
      <div className="flex items-center" style={{ gap: 48 }}>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button className="text-white font-black flex items-center gap-1.5 hover:opacity-70 bg-transparent border-none cursor-pointer"
            style={{ fontSize: "1.35rem" }}
            onClick={() => { setShopOpen(o => !o); setAboutOpen(false); }}>
            Shop {chevron}
          </button>
          {shopOpen && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 z-50" style={{ minWidth: 220 }}>
              {["All Products","Main Games","Expansions","Family","Packs","Other Stuff"].map(x => (
                <a key={x} href="#" className="block px-6 py-2.5 hover:bg-gray-50 font-black text-base text-black"
                  style={{ textDecoration: "none" }}>{x}</a>
              ))}
            </div>
          )}
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button className="text-white font-black flex items-center gap-1.5 hover:opacity-70 bg-transparent border-none cursor-pointer"
            style={{ fontSize: "1.35rem" }}
            onClick={() => { setAboutOpen(o => !o); setShopOpen(false); }}>
            About {chevron}
          </button>
          {aboutOpen && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 z-50" style={{ minWidth: 220 }}>
              {["Our Story","Team","Press","Careers","Contact"].map(x => (
                <a key={x} href="#" className="block px-6 py-2.5 hover:bg-gray-50 font-black text-base text-black"
                  style={{ textDecoration: "none" }}>{x}</a>
              ))}
            </div>
          )}
        </div>
        <button
          className="relative flex items-center hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer text-white"
          aria-label="Open cart" onClick={onCartOpen}
          style={{ gap: 8, fontSize: "1.2rem", fontWeight: 900 }}>
          <CartIcon />
          <span>\{cartCount}/</span>
        </button>
      </div>
    </nav>
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
  useInjectStyle("cah-product-anim", INJECT_CSS);

  const params = useParams();
  const slug   = typeof params?.slug === "string" ? params.slug : "more-cah";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [added,   setAdded]   = useState(false);

  const { cartData, cartCount, cartOpen, checkoutOpen,
          setCartOpen, setCheckoutOpen, updateCart, clearCart } = useCart();

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

  const images: string[] = product?.images?.length
    ? product.images.map((img: any) => img.image?.url ? cmsImg(img.image.url) : "").filter(Boolean)
    : [];
  const mainImage    = images[0] || "";
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
    <div className="min-h-screen bg-black">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
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
            <ImageViewer images={images} />
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