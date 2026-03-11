"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart, getOrCreateCart, fetchCartById, medusaHeaders, MEDUSA_URL } from "@/hooks/useCart";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import gsap from "gsap";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";
const VARIANT_ID = process.env.NEXT_PUBLIC_MEDUSA_VARIANT_ID || "";

function cmsImg(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${CMS_URL}${url}`;
}

// ── Plus icons ────────────────────────────────────────────────────────────────
function PlusIcons() {
  const positions = [
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
          style={{ ...pos as React.CSSProperties, color: "rgba(255,255,255,0.25)", fontSize: "1.4rem", lineHeight: 1 }}>
          ✦
        </span>
      ))}
    </>
  );
}

// ── Starburst badge ───────────────────────────────────────────────────────────
function StarburstBadge({ text }: { text: string }) {
  const n = 16, size = 70, cx = size / 2, cy = size / 2, oR = cx - 1, iR = cx - 9;
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 ? iR : oR;
    d += (i ? "L" : "M") + `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  d += "Z";
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute" }}><path d={d} fill="white" /></svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="text-black font-black text-center leading-tight" style={{ fontSize: 10 }}>{text}</span>
      </div>
    </div>
  );
}

// ── Related Products — fetched from CMS, excluding current product ─────────────
function RelatedProducts({ excludeSlug }: { excludeSlug: string }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${CMS_URL}/api/products?depth=2&limit=20`)
      .then(r => r.json())
      .then(d => {
        const all = d?.docs ?? [];
        // Exclude current product, show up to 3
        setProducts(all.filter((p: any) => p.slug !== excludeSlug).slice(0, 3));
      })
      .catch(() => {});
  }, [excludeSlug]);

  if (!products.length) return null;

  return (
    <section className="bg-black py-20 px-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="text-white font-black mb-8" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", letterSpacing: "-0.02em" }}>
        You should check out:
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {products.map((p: any, i: number) => {
          const imgUrl = p.images?.[0]?.image?.url ? cmsImg(p.images[0].image.url) : null;
          const price = p.price ? `$${(p.price / 100).toFixed(2)}` : null;
          const href = p.slug ? `/products/${p.slug}` : "#";

          return (
            <a key={i} href={href} className="relative flex flex-col cursor-pointer group no-underline"
              style={{ background: "#000", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, overflow: "hidden", minHeight: 520, textDecoration: "none" }}>
              {/* Starburst */}
              <div className="absolute top-4 right-4 z-10"><StarburstBadge text="New!" /></div>

              {/* Title + desc */}
              <div className="p-7 pb-0">
                <h3 className="text-white font-black mb-3" style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}>{p.title}</h3>
                <p className="text-white/70" style={{ fontSize: "1rem", lineHeight: 1.5 }}>{p.description}</p>
              </div>

              {/* Product image from CMS */}
              <div className="flex-1 flex items-center justify-center px-6 py-4" style={{ minHeight: 260 }}>
                {imgUrl ? (
                  <img src={imgUrl} alt={p.title}
                    style={{ maxHeight: 240, maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.8))" }} />
                ) : (
                  <div style={{ width: 140, height: 200, background: "#111", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-white/30 font-black text-sm text-center px-4">{p.title}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="p-5 pt-0">
                {price ? (
                  <button className="w-full font-black rounded-full flex items-center justify-between hover:opacity-90 transition-opacity"
                    style={{ background: "white", color: "black", padding: "18px 28px", fontSize: "1.15rem", border: "none" }}>
                    <span>Add to Cart</span><span>{price}</span>
                  </button>
                ) : (
                  <button className="w-full font-black rounded-full"
                    style={{ background: "transparent", color: "white", padding: "18px 28px", fontSize: "1.15rem", border: "2px solid rgba(255,255,255,0.3)" }}>
                    Unavailable In Your Region
                  </button>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState("");
  const cols = [
    { heading: "Shop",    links: ["All Products","Main Games","Expansions","Family","Packs","Other Stuff"] },
    { heading: "Info",    links: ["About","Support","Contact","Retailers","Steal","Careers"] },
    { heading: "Find Us", links: ["Facebook","Instagram","TikTok","Bluesky","Amazon","Target"] },
  ];
  return (
    <footer className="bg-white py-16 px-10">
      <div className="grid gap-8 mb-12" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr" }}>
        <p className="text-black font-black text-3xl leading-tight" style={{ fontFamily: "Georgia, serif" }}>Cards<br />Against<br />Humanity</p>
        {cols.map(col => (
          <div key={col.heading}>
            <p className="font-black text-black mb-4 text-base">{col.heading}</p>
            {col.links.map(l => <a key={l} href="#" className="block text-black underline text-base mb-2 hover:opacity-60">{l}</a>)}
          </div>
        ))}
        <div>
          <p className="font-black text-black mb-2 text-base">Email List</p>
          <p className="text-base text-black mb-4">Sign up and we&apos;ll let you know first when we do anything:</p>
          <div className="relative border-2 border-black rounded-lg flex items-center overflow-hidden">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email Address" className="flex-1 px-3 py-3 text-base outline-none text-black bg-white" />
            <button className="mr-1.5 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-black/10 pt-6 flex-wrap gap-4">
        <button className="border border-black rounded-full px-4 py-1 text-base font-black text-black hover:bg-black hover:text-white transition-colors">India ›</button>
        <div className="flex gap-6 text-base flex-wrap">
          {["Terms of Use","Privacy Policy","Submission Terms","Cookie Preferences"].map(l => (
            <a key={l} href="#" className="text-black hover:underline">{l}</a>
          ))}
        </div>
        <p className="text-base text-black">©2026 Cards Against Humanity LLC</p>
      </div>
    </footer>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ cartCount, onCartOpen }: { cartCount: number; onCartOpen: () => void }) {
  const [shopOpen, setShopOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => {
    const close = () => { setShopOpen(false); setAboutOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  return (
    <nav className="bg-black sticky top-0 z-30 flex items-center justify-between"
      style={{ padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <Link href="/" className="text-white font-black hover:opacity-80 transition-opacity" style={{ fontSize: "1.25rem" }}>
        Cards Against Humanity
      </Link>
      <div className="flex items-center" style={{ gap: "48px" }}>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button className="text-white font-black flex items-center hover:opacity-70" style={{ fontSize: "1.35rem", gap: 6 }}
            onClick={() => { setShopOpen(!shopOpen); setAboutOpen(false); }}>
            Shop <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {shopOpen && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-56 z-50">
              {["All Products","Main Games","Expansions","Family","Packs","Other Stuff"].map(x => (
                <a key={x} href="#" className="block px-6 py-2.5 hover:bg-gray-50 font-black text-base text-black">{x}</a>
              ))}
            </div>
          )}
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button className="text-white font-black flex items-center hover:opacity-70" style={{ fontSize: "1.35rem", gap: 6 }}
            onClick={() => { setAboutOpen(!aboutOpen); setShopOpen(false); }}>
            About <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {aboutOpen && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-56 z-50">
              {["Our Story","Team","Press","Careers","Contact"].map(x => (
                <a key={x} href="#" className="block px-6 py-2.5 hover:bg-gray-50 font-black text-base text-black">{x}</a>
              ))}
            </div>
          )}
        </div>
        <button onClick={onCartOpen} className="text-white font-black hover:opacity-70 flex items-center gap-1" style={{ fontSize: "1.35rem" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {cartCount}/
        </button>
      </div>
    </nav>
  );
}

// ── Main Product Page ─────────────────────────────────────────────────────────
export default function ProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const { cartData, cartCount, cartOpen, checkoutOpen, setCartOpen, setCheckoutOpen, updateCart, clearCart } = useCart();

  useEffect(() => {
    fetch(`${CMS_URL}/api/products?where[slug][equals]=more-cah&depth=2`)
      .then(r => r.json())
      .then(d => { setProduct(d?.docs?.[0] ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && productRef.current) {
      gsap.fromTo(productRef.current.querySelectorAll(".animate-in"),
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)" });
    }
  }, [loading]);

  // Use the variant ID from the CMS product if available, otherwise env var
  const variantId = product?.variantId || VARIANT_ID;

  async function handleAddToCart() {
    setAdding(true);
    if (btnRef.current) gsap.fromTo(btnRef.current, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
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

  // Build images array from CMS
  const images: string[] = product?.images?.length
    ? product.images.map((img: any) => img.image?.url ? cmsImg(img.image.url) : "").filter(Boolean)
    : ["https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Cards_against_humanity_box.png/220px-Cards_against_humanity_box.png"];

  const mainImage = images[activeImg] || images[0];
  const priceDisplay = product?.price ? `$${(product.price / 100).toFixed(0)}` : "$29";

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-black text-xl animate-pulse">Loading...</div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white font-black text-2xl">Product not found.</p>
        <Link href="/" className="text-white underline">Back to Home</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-black">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cartData={cartData} onCartUpdate={updateCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)} cartData={cartData} onOrderComplete={clearCart} />

      {/* Product Hero */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <PlusIcons />
        <div ref={productRef} className="relative z-10"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* Left: Main image + thumbnails */}
          <div className="animate-in flex flex-col gap-4">
            <div className="flex items-center justify-center" style={{ minHeight: 420 }}>
              <img src={mainImage} alt={product.title}
                style={{ maxHeight: 480, maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.8))" }} />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-2">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 80, height: 80,
                      border: activeImg === i ? "2px solid white" : "2px solid rgba(255,255,255,0.2)",
                      borderRadius: 10, overflow: "hidden", background: "#111", flexShrink: 0, cursor: "pointer" }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div style={{ paddingTop: 8 }}>
            <h1 className="animate-in text-white font-black leading-tight"
              style={{ fontSize: "clamp(2.2rem,4vw,3rem)", letterSpacing: "-0.02em", marginBottom: 28 }}>
              {product.title}
            </h1>

            {/* Description — first sentence bold */}
            {product.description && (
              <div className="animate-in text-white leading-relaxed mb-6" style={{ fontSize: "1.1rem" }}>
                {(() => {
                  const firstDot = product.description.indexOf(". ");
                  if (firstDot === -1) return <p><strong>{product.description}</strong></p>;
                  const bold = product.description.slice(0, firstDot + 1);
                  const rest = product.description.slice(firstDot + 2);
                  return <p><strong>{bold}</strong> {rest}</p>;
                })()}
              </div>
            )}

            {/* Bullets from CMS */}
            {product.bullets?.length > 0 && (
              <ul className="animate-in mb-10" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {product.bullets.map((b: any, i: number) => (
                  <li key={i} className="text-white flex gap-3" style={{ fontSize: "1.05rem", lineHeight: 1.55 }}>
                    <span style={{ marginTop: 4, flexShrink: 0 }}>•</span>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Add to Cart — uses variantId from CMS if available */}
            <button ref={btnRef} onClick={handleAddToCart} disabled={adding}
              className="animate-in w-full font-black rounded-full flex items-center justify-between transition-all"
              style={{ padding: "20px 32px", fontSize: "1.25rem", letterSpacing: "-0.01em",
                background: added ? "#22c55e" : "white", color: added ? "white" : "black",
                border: "none", cursor: adding ? "not-allowed" : "pointer" }}>
              <span>{adding ? "Adding..." : added ? "✓ Added to Cart!" : "Add to Cart"}</span>
              <span>{priceDisplay}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related products — fetched from CMS, excluding "more-cah" */}
      <RelatedProducts excludeSlug="more-cah" />
      <Footer />
    </div>
  );
}