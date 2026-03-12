"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import CartProvider, { useCartCtx } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";

const HeroSection  = dynamic(() => import("@/components/HeroSection"),  { ssr: false });
const BuySection   = dynamic(() => import("@/components/BuySection"),   { ssr: false });
const EmailSection = dynamic(() => import("@/components/EmailSection"), { ssr: false });
const FAQSection   = dynamic(() => import("@/components/FAQSection"),   { ssr: false });
const Navbar       = dynamic(() => import("@/components/Navbar"),       { ssr: false });

function PageContent({ cmsHome, quotes, buyCardItems, phrases, faqItems, aboutSlot, stealSlot, stuffSlot, footerSlot }: any) {
  const { cartData, cartCount, cartOpen, checkoutOpen, setCartOpen, setCheckoutOpen, updateCart, clearCart } = useCartCtx();

  return (
    <>
      {/* Sticky navbar — fades in after scrolling past hero */}
      <Navbar cmsHome={cmsHome} />

      {/* Cart + Checkout drawers */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartData={cartData}
        onCartUpdate={updateCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartData={cartData}
        onOrderComplete={clearCart}
      />

      {/* Black full-viewport fallback while HeroSection JS loads */}
      <Suspense fallback={<div style={{ height: "100svh", minHeight: 620, background: "#000" }} />}>
        <HeroSection
          quotes={quotes}
          cartCount={cartCount}
          onCartOpen={() => setCartOpen(true)}
          cmsHome={cmsHome}
        />
      </Suspense>

      {aboutSlot}

      <BuySection
        heading={cmsHome?.buySection?.heading || "Buy the game."}
        buyCards={buyCardItems}
      />

      {stealSlot}
      {stuffSlot}

      <EmailSection
        prefix={cmsHome?.emailSection?.headingPrefix || "To find out first when"}
        suffix={cmsHome?.emailSection?.headingSuffix || "give us your email:"}
        disclaimer={cmsHome?.emailSection?.disclaimer || "We'll only email you like twice a year..."}
        placeholder={cmsHome?.emailSection?.placeholder || "Email Address"}
        phrases={phrases}
      />

      <FAQSection
        heading={cmsHome?.faqSection?.heading || "Your dumb questions."}
        faqs={faqItems}
      />

      {footerSlot}
    </>
  );
}

export default function ClientShell(props: any) {
  return (
    <CartProvider>
      <PageContent {...props} />
    </CartProvider>
  );
}