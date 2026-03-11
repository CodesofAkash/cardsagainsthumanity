"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart, getOrCreateCart, fetchCartById, medusaHeaders, MEDUSA_URL } from "@/hooks/useCart";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import gsap from "gsap";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";
const VARIANT_ID = process.env.NEXT_PUBLIC_MEDUSA_VARIANT_ID || "";

function PlusIcons() {
  const positions = [
    { top: "12%", left: "8%" }, { top: "30%", left: "4%" },
    { top: "55%", left: "6%" }, { top: "18%", right: "4%" },
    { top: "42%", right: "3%" }, { top: "65%", right: "5%" },
    { top: "8%", left: "48%" }, { top: "88%", left: "42%" },
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="absolute text-white/30 text-2xl select-none pointer-events-none"
          style={pos as React.CSSProperties}
        >
          ✚
        </span>
      ))}
    </>
  );
}

function RelatedProducts() {
  const items = [
    { title: "Tales Vol. 1", desc: "A book of fill-in-the-blank stories to play with your CAH cards." },
    { title: "Shit List", desc: "A fresh way to play CAH where YOU write the answers, plus 80 black cards." },
    { title: "Twists Bundle", desc: "It's like playing for the first time again, four more times." },
  ];
  return (
    <section className="bg-black py-16 px-8">
      <h2
        className="text-white font-black text-4xl mb-8"
        style={{ fontFamily: "Georgia, serif" }}
      >
        You should check out:
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {items.map((p, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="absolute top-4 right-4 bg-white text-black text-xs font-black px-3 py-1 rounded-full">
              New!
            </div>
            <h3
              className="text-white font-black text-xl mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {p.title}
            </h3>
            <p className="text-gray-400 text-sm mb-6">{p.desc}</p>
            <div className="w-full h-48 bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { heading: "Shop", links: ["All Products", "Main Games", "Expansions", "Family", "Packs", "Other Stuff"] },
    { heading: "Info", links: ["About", "Support", "Contact", "Retailers", "Steal", "Careers"] },
    { heading: "Find Us", links: ["Facebook", "Instagram", "TikTok", "Bluesky", "Amazon", "Target"] },
  ];
  return (
    <footer className="bg-white py-16 px-8">
      <div
        className="grid gap-8 mb-12"
        style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr" }}
      >
        <div>
          <p
            className="text-black font-black text-2xl leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Cards
            <br />
            Against
            <br />
            Humanity
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.heading}>
            <p className="font-black text-black mb-4 text-sm">{col.heading}</p>
            {col.links.map((l) => (
              <a
                key={l}
                href="#"
                className="block text-black underline text-sm mb-2 hover:opacity-60"
              >
                {l}
              </a>
            ))}
          </div>
        ))}
        <div>
          <p className="font-black text-black mb-2 text-sm">Email List</p>
          <p className="text-sm text-black mb-4">
            Sign up and we&apos;ll let you know first:
          </p>
          <div className="flex items-stretch border-2 border-black rounded-lg overflow-hidden">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 px-3 py-3 text-sm outline-none text-black"
            />
            <button className="px-3 border-l-2 border-black hover:bg-gray-100 text-lg text-black font-black">
              →
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-black/10 pt-6 flex-wrap gap-4">
        <button className="border border-black rounded-full px-4 py-1 text-sm text-black font-black">
          India ›
        </button>
        <div className="flex gap-6 text-sm flex-wrap">
          {[
            "Terms of Use",
            "Privacy Policy",
            "Submission Terms",
            "Cookie Preferences",
          ].map((l) => (
            <a key={l} href="#" className="hover:underline text-black">
              {l}
            </a>
          ))}
        </div>
        <p className="text-sm text-black">©2026 Cards Against Humanity LLC</p>
      </div>
    </footer>
  );
}

export default function ProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const {
    cartData,
    cartCount,
    cartOpen,
    checkoutOpen,
    setCartOpen,
    setCheckoutOpen,
    updateCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    fetch(`${CMS_URL}/api/products?where[slug][equals]=more-cah&depth=2`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d?.docs?.[0] ?? null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && productRef.current) {
      gsap.fromTo(
        productRef.current.querySelectorAll(".animate-in"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)" }
      );
    }
  }, [loading]);

  async function handleAddToCart() {
    setAdding(true);
    // Bounce animation on button
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
    }
    try {
      const cartId = await getOrCreateCart();
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
        method: "POST",
        headers: medusaHeaders,
        body: JSON.stringify({ variant_id: VARIANT_ID, quantity: 1 }),
      });
      const data = await fetchCartById(cartId);
      updateCart(data);
      setAdded(true);
      setCartOpen(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  }

  const imageUrl =
    product?.images?.[0]?.image?.url
      ? `${CMS_URL}${product.images[0].image.url}`
      : "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Cards_against_humanity_box.png/220px-Cards_against_humanity_box.png";

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white font-black text-xl">Loading...</p>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white font-black text-xl">Product not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/"
          className="text-white font-black text-base"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Cards Against Humanity
        </Link>
        <div className="flex items-center gap-8">
          <span className="text-white font-black text-xl cursor-pointer hover:opacity-70">
            Shop ▾
          </span>
          <span className="text-white font-black text-xl cursor-pointer hover:opacity-70">
            About ▾
          </span>
          <button
            onClick={() => setCartOpen(true)}
            className="text-white font-black flex items-center gap-1 hover:opacity-70"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>{cartCount}/</span>
          </button>
        </div>
      </nav>

      {/* Shared cart and checkout — same instance as homepage via useCart hook */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartData={cartData}
        onCartUpdate={updateCart}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartData={cartData}
        onOrderComplete={clearCart}
      />

      {/* Product */}
      <div className="relative overflow-hidden">
        <PlusIcons />
        <div
          ref={productRef}
          className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-2 gap-16 items-start"
        >
          {/* Image */}
          <div className="animate-in flex flex-col items-center gap-4">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full max-w-md object-contain drop-shadow-2xl"
            />
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: any, i: number) => (
                  <div
                    key={i}
                    className="w-20 h-20 border-2 border-white/30 rounded-xl overflow-hidden"
                  >
                    <img
                      src={`${CMS_URL}${img.image?.url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pt-4">
            <h1
              className="animate-in text-white font-black text-5xl leading-tight mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {product.title}
            </h1>
            <p className="animate-in text-white text-lg leading-relaxed mb-4">
              {product.description}
            </p>
            {product.bullets?.length > 0 && (
              <ul className="animate-in space-y-3 mb-10">
                {product.bullets.map((b: any, i: number) => (
                  <li key={i} className="text-white text-lg flex gap-3">
                    <span className="mt-1 flex-shrink-0">•</span>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              ref={btnRef}
              onClick={handleAddToCart}
              disabled={adding}
              className={`animate-in w-full py-5 rounded-full text-xl font-black flex items-center justify-between px-8 transition-all border-2 ${
                added
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-white text-black hover:bg-gray-100"
              }`}
            >
              <span>
                {adding ? "Adding..." : added ? "✓ Added!" : "Add to Cart"}
              </span>
              <span>${((product.price || 0) / 100).toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      <RelatedProducts />
      <Footer />
    </div>
  );
}