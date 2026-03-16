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
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cartCount, cartOpen, setCartOpen, cartData } = useCartCtx();

  const cartSubtotal = (cartData as any)?.cart?.subtotal || 0;
  const cartCurrencyCode = ((cartData as any)?.cart?.currency_code as string | undefined) || "usd";
  const cartIconLabel = cartIconHovered && cartCount > 0
    ? formatCartPrice(cartSubtotal, cartCurrencyCode)
    : String(cartCount);

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

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

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
    setMobileOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setRenderedMenu(null);
      closeTimerRef.current = null;
    }, MENU_CLOSE_MS);
  };

  const toggleMenu = (menu: "shop" | "about") => {
    if (mobileOpen) {
      setMobileOpen(false);
      return;
    }

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
    if (mobileOpen) {
      setMobileOpen(false);
    }
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
          padding: "0 20px",
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
              fontSize: "clamp(22px,4vw,28px)",
              letterSpacing: "-0.02em",
              textDecoration: "none",
            }}
          >
            Cards Against Humanity
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-6 md:gap-10">
            <div className="hidden md:flex items-center gap-10">
              <button
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ fontSize: "28px", fontWeight: 800 }}
                onClick={() => toggleMenu("shop")}
              >
                Shop {chevron(activeMenu === "shop" && menuVisible)}
              </button>
              <button
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ fontSize: "28px", fontWeight: 800 }}
                onClick={() => toggleMenu("about")}
              >
                About {chevron(activeMenu === "about" && menuVisible)}
              </button>
            </div>

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
                  top: "46%",
                  left: "50%",
                  right: "auto",
                  transform: "translate(-50%, -52%)",
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

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/40"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className="sr-only">Toggle menu</span>
              <div className="space-y-1.5">
                <span className={`block h-0.5 w-6 bg-white transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-6 bg-white transition-opacity ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`block h-0.5 w-6 bg-white transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-16 left-0 right-0 px-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4 text-white font-black text-2xl">
              <Link href="/products/more-cah" onClick={() => setMobileOpen(false)} className="hover:opacity-70">Shop</Link>
              <Link href="/#about" onClick={() => setMobileOpen(false)} className="hover:opacity-70">About</Link>
              <button
                className="text-left hover:opacity-70"
                onClick={() => { setMobileOpen(false); toggleCart(); }}
              >
                Cart ({cartCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}