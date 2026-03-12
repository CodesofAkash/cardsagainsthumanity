"use client";
import { useState, useEffect, useRef } from "react";
import { useCartCtx } from "./CartProvider";
import { CartIcon, ShopMegaMenu, AboutMegaMenu, MenuBackdrop } from "./MegaMenus";
import Link from "next/link";

export default function Navbar({ cmsHome }: { cmsHome: any }) {
  const [vis,       setVis]       = useState(false);
  const [shopOpen,  setShopOpen]  = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { cartCount, setCartOpen } = useCartCtx();

  // Show navbar after scrolling ~20% of viewport (hero nav disappears)
  useEffect(() => {
    const fn = () => setVis(window.scrollY > window.innerHeight * 0.2);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeAll = () => { setShopOpen(false); setAboutOpen(false); };

  const btnCls = "text-white font-black flex items-center gap-1 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity";
  const btnStyle: React.CSSProperties = { fontSize: "1.35rem", fontFamily: "inherit" };
  const chevron = (open: boolean) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginTop: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );

  return (
    <>
      {/* Mega-menu backdrop */}
      {(shopOpen || aboutOpen) && <MenuBackdrop onClose={closeAll} />}

      {/* Mega-menus — rendered above everything */}
      {shopOpen  && <ShopMegaMenu  onClose={closeAll} />}
      {aboutOpen && <AboutMegaMenu onClose={closeAll} cmsHome={cmsHome} />}

      {/* Sticky navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[101] flex items-center justify-between bg-black"
        style={{
          padding: "18px 40px",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(-6px)",
          pointerEvents: vis ? "auto" : "none",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <Link href="/" className="text-white font-black hover:opacity-70 transition-opacity"
          style={{ fontSize: "1.15rem", letterSpacing: "-0.01em", textDecoration: "none" }}>
          Cards Against Humanity
        </Link>

        <div className="flex items-center gap-12">
          {/* Shop */}
          <button className={btnCls} style={btnStyle}
            onClick={() => { setShopOpen(o => !o); setAboutOpen(false); }}>
            Shop {chevron(shopOpen)}
          </button>

          {/* About */}
          <button className={btnCls} style={btnStyle}
            onClick={() => { setAboutOpen(o => !o); setShopOpen(false); }}>
            About {chevron(aboutOpen)}
          </button>

          {/* Cart — CartIcon SVG + \N/ — opens CartDrawer */}
          <button
            onClick={() => { closeAll(); setCartOpen(true); }}
            className="text-white hover:opacity-70 transition-opacity flex items-center gap-2 bg-transparent border-none cursor-pointer"
            aria-label="Open cart"
          >
            <CartIcon />
            <span className="font-black" style={{ fontSize: "1.2rem" }}>
              \{cartCount}/
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}