"use client";

import { useState, useEffect } from "react";
import { useCartCtx } from "./CartProvider";
import { CartIcon, ShopMegaMenu, AboutMegaMenu, MenuBackdrop } from "./MegaMenus";
import Link from "next/link";

export default function Navbar({ cmsHome }: { cmsHome: any }) {
  const [vis, setVis] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { cartCount, setCartOpen } = useCartCtx();

  // Show navbar after scrolling
  useEffect(() => {
    const fn = () => setVis(window.scrollY > window.innerHeight * 0.2);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeAll = () => {
    setShopOpen(false);
    setAboutOpen(false);
  };

  const chevron = (open: boolean) => (
    <svg
      width="14"
      height="9"
      viewBox="0 0 14 9"
      fill="currentColor"
      style={{
        marginTop: 4,
        transition: "transform 0.2s",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="M7.0076 6.0436L12.4196 0.592773L13.8389 2.00192L7.71723 8.16747L7.00759 8.8822L6.29796 8.16747L0.176383 2.00192L1.59565 0.592776L7.0076 6.0436Z" />
    </svg>
  );

  return (
    <>
      {/* Backdrop */}
      {(shopOpen || aboutOpen) && <MenuBackdrop onClose={closeAll} />}

      {/* Mega menus */}
      {shopOpen && <ShopMegaMenu onClose={closeAll} />}
      {aboutOpen && <AboutMegaMenu onClose={closeAll} cmsHome={cmsHome} />}

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[101] bg-black text-white"
        style={{
          height: "72px",
          padding: "0 40px",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(-6px)",
          pointerEvents: vis ? "auto" : "none",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <div className="flex items-center justify-between h-full">

          {/* Logo (text version) */}
          <Link
            href="/"
            className="font-extrabold hover:opacity-70 transition-opacity"
            style={{
              fontSize: "28px",
              letterSpacing: "-0.02em",
              textDecoration: "none",
            }}
          >
            Cards Against Humanity
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-10">

            {/* Shop */}
            <button
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ fontSize: "28px", fontWeight: 800 }}
              onClick={() => {
                setShopOpen((o) => !o);
                setAboutOpen(false);
              }}
            >
              Shop {chevron(shopOpen)}
            </button>

            {/* About */}
            <button
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ fontSize: "28px", fontWeight: 800 }}
              onClick={() => {
                setAboutOpen((o) => !o);
                setShopOpen(false);
              }}
            >
              About {chevron(aboutOpen)}
            </button>

            {/* Cart */}
            <button
              onClick={() => {
                closeAll();
                setCartOpen(true);
              }}
              className="relative flex items-center hover:opacity-70 transition-opacity"
              aria-label="Open cart"
            >
              <CartIcon />

              <span
                className="absolute font-extrabold"
                style={{
                  fontSize: "20px",
                  top: "-6px",
                  right: "20px",
                }}
              >
                {cartCount}
              </span>
            </button>

          </div>
        </div>
      </nav>
    </>
  );
}