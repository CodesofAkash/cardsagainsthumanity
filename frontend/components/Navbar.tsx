"use client";

import { useState, useEffect, useRef } from "react";
import { useCartCtx } from "./CartProvider";
import { CartIcon, ShopMegaMenu, AboutMegaMenu, MenuBackdrop } from "./MegaMenus";
import Link from "next/link";

const MENU_CLOSE_MS = 440;
const CART_TRANSITION_MS = 440;

function formatCartPrice(amountCents: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

export default function Navbar({ cmsHome, alwaysVisible = false }: { cmsHome: unknown; alwaysVisible?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"shop" | "about" | null>(null);
  const [renderedMenu, setRenderedMenu] = useState<"shop" | "about" | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [cartIconHovered, setCartIconHovered] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cartCount, cartOpen, setCartOpen, cartData } = useCartCtx();

  const cartSubtotal = (cartData as any)?.cart?.subtotal || 0;
  const cartCurrencyCode = ((cartData as any)?.cart?.currency_code as string | undefined) || "usd";
  const cartIconLabel = cartCount > 0
    ? (cartIconHovered ? formatCartPrice(cartSubtotal, cartCurrencyCode) : String(cartCount))
    : "";

  // Show navbar after scrolling
  useEffect(() => {
    if (alwaysVisible) return;

    const fn = () => setIsScrolled(window.scrollY > window.innerHeight * 0.2);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, [alwaysVisible]);

  const vis = alwaysVisible || isScrolled;

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const clearSwitchTimer = () => {
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
  };

  const openMenu = (menu: "shop" | "about") => {
    setRenderedMenu(menu);
    setActiveMenu(menu);
    setMenuVisible(false);

    requestAnimationFrame(() => {
      setMenuVisible(true);
    });
  };

  const closeAll = () => {
    clearCloseTimer();
    clearSwitchTimer();
    setActiveMenu(null);
    setMenuVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setRenderedMenu(null);
      closeTimerRef.current = null;
    }, MENU_CLOSE_MS);
  };

  const toggleMenu = (menu: "shop" | "about") => {
    if (activeMenu === menu && menuVisible) {
      closeAll();
      return;
    }

    clearCloseTimer();
    clearSwitchTimer();

    if (cartOpen) {
      setCartOpen(false);
      switchTimerRef.current = setTimeout(() => {
        switchTimerRef.current = null;
        openMenu(menu);
      }, CART_TRANSITION_MS);
      return;
    }

    if (activeMenu && activeMenu !== menu && menuVisible) {
      setActiveMenu(null);
      setMenuVisible(false);
      switchTimerRef.current = setTimeout(() => {
        switchTimerRef.current = null;
        openMenu(menu);
      }, MENU_CLOSE_MS);
      return;
    }

    openMenu(menu);
  };

  const toggleCart = () => {
    clearCloseTimer();
    clearSwitchTimer();

    if (cartOpen) {
      setCartOpen(false);
      return;
    }

    if (activeMenu && menuVisible) {
      setActiveMenu(null);
      setMenuVisible(false);
      switchTimerRef.current = setTimeout(() => {
        setRenderedMenu(null);
        switchTimerRef.current = null;
        setCartOpen(true);
      }, MENU_CLOSE_MS);
      return;
    }

    setCartOpen(true);
  };

  const chevron = (open: boolean) => (
    <svg
      width="18"
      height="12"
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
      {renderedMenu && <MenuBackdrop onClose={closeAll} visible={menuVisible} />}

      {/* Mega menus */}
      {renderedMenu === "shop" && <ShopMegaMenu onClose={closeAll} visible={menuVisible} />}
      {renderedMenu === "about" && <AboutMegaMenu onClose={closeAll} cmsHome={cmsHome} visible={menuVisible} />}

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-101 bg-black text-white"
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
              onClick={() => toggleMenu("shop")}
            >
              Shop {chevron(activeMenu === "shop" && menuVisible)}
            </button>

            {/* About */}
            <button
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ fontSize: "28px", fontWeight: 800 }}
              onClick={() => toggleMenu("about")}
            >
              About {chevron(activeMenu === "about" && menuVisible)}
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              onMouseEnter={() => setCartIconHovered(true)}
              onMouseLeave={() => setCartIconHovered(false)}
              className="relative flex items-center"
              aria-label="Open cart"
            >
              <CartIcon />

              <span
                className="absolute font-extrabold"
                style={{
                  fontSize: cartIconHovered && cartCount > 0 ? "12px" : "20px",
                  fontWeight: 800,
                  color: "#ffffff",
                  top: cartIconHovered && cartCount > 0 ? "46%" : "-6px",
                  left: cartIconHovered && cartCount > 0 ? "50%" : "auto",
                  right: cartIconHovered && cartCount > 0 ? "auto" : "20px",
                  transform: cartIconHovered && cartCount > 0 ? "translate(-50%, -52%)" : "none",
                  transition: "font-size 0.15s ease, left 0.15s ease, right 0.15s ease, top 0.15s ease, transform 0.15s ease",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                {cartIconLabel}
              </span>
            </button>

          </div>
        </div>
      </nav>
    </>
  );
}