"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import CartProvider, { useCartCtx } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import BuySection from "@/components/BuySection";
import HeroSection from "@/components/HeroSection";
import { HeroSkeleton, ListSkeleton } from "@/components/Skeletons";

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
  const { cartData, cartCount, cartOpen, checkoutOpen, cartLoading, setCartOpen, setCheckoutOpen, updateCart, clearCart } = useCartCtx();
  const cartSubtotal = (cartData as any)?.cart?.subtotal || 0;
  const cartCurrencyCode = ((cartData as any)?.cart?.currency_code as string | undefined) || "usd";

  return (
    <>
      {/* Sticky navbar — fades in after scrolling past hero */}
      <Suspense fallback={<div className="h-[72px] w-full bg-black/70" />}>
        <Navbar cmsHome={cmsHome} />
      </Suspense>

      {/* Cart + Checkout drawers */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartData={cartData}
        onCartUpdate={updateCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        loading={cartLoading}
      />
      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartData={cartData}
        onOrderComplete={clearCart}
      />

      {/* Black full-viewport fallback while HeroSection JS loads */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection
          quotes={quotes}
          cartCount={cartCount}
          cartSubtotalCents={cartSubtotal}
          cartCurrencyCode={cartCurrencyCode}
          cartOpen={cartOpen}
          onCartOpen={() => setCartOpen(true)}
          onCartClose={() => setCartOpen(false)}
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

      <Suspense fallback={<div className="bg-white px-6 py-12"><ListSkeleton light rows={3} /></div>}>
        <EmailSection
          prefix={cmsHome?.emailSection?.headingPrefix || "To find out first when"}
          suffix={cmsHome?.emailSection?.headingSuffix || "give us your email:"}
          disclaimer={cmsHome?.emailSection?.disclaimer || "We'll only email you like twice a year..."}
          placeholder={cmsHome?.emailSection?.placeholder || "Email Address"}
          phrases={phrases}
        />
      </Suspense>

      <Suspense fallback={<div className="bg-black px-6 py-12"><ListSkeleton rows={4} /></div>}>
        <FAQSection
          heading={cmsHome?.faqSection?.heading || "Your dumb questions."}
          faqs={faqItems}
        />
      </Suspense>

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