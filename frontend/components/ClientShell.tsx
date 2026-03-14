"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import CartProvider, { useCartCtx } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import BuySection from "@/components/BuySection";
import HeroSection from "@/components/HeroSection";

type Quote = { quote: string; source: string };
type BuyCardItem = {
  id?: string;
  label: string;
  cta: string;
  href?: string;
  backgroundColor: string;
  darkBackground?: boolean;
};
type PhraseItem = { phrase: string };
type FAQItem = { question: string; answer: string };

type ClientShellProps = {
  cmsHome: {
    buySection?: { heading?: string };
    emailSection?: {
      headingPrefix?: string;
      headingSuffix?: string;
      disclaimer?: string;
      placeholder?: string;
    };
    faqSection?: { heading?: string };
  } | null;
  quotes: Quote[];
  buyCardItems: BuyCardItem[];
  phrases: PhraseItem[];
  faqItems: FAQItem[];
  aboutSlot: React.ReactNode;
  stealSlot: React.ReactNode;
  stuffSlot: React.ReactNode;
  footerSlot: React.ReactNode;
};

const EmailSection = dynamic(() => import("@/components/EmailSection"), { ssr: false });
const FAQSection   = dynamic(() => import("@/components/FAQSection"),   { ssr: false });
const Navbar       = dynamic(() => import("@/components/Navbar"),       { ssr: false });

function PageContent({ cmsHome, quotes, buyCardItems, phrases, faqItems, aboutSlot, stealSlot, stuffSlot, footerSlot }: ClientShellProps) {
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

      {<BuySection
        heading={cmsHome?.buySection?.heading || "Buy the game."}
        buyCards={buyCardItems}
      />}

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

export default function ClientShell(props: ClientShellProps) {
  return (
    <CartProvider>
      <PageContent {...props} />
    </CartProvider>
  );
}