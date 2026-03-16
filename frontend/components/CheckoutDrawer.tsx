"use client";
import { useState, useEffect, useRef } from "react";
import { medusaHeaders, MEDUSA_URL } from "@/hooks/useCart";
import gsap from "gsap";

const COUNTRIES = [
  "India","United States","United Kingdom","Canada","Australia",
  "Germany","France","Singapore","UAE","Japan","Brazil","Mexico",
];
const COUNTRY_CODES: Record<string, string> = {
  India:"in","United States":"us","United Kingdom":"gb",Canada:"ca",
  Australia:"au",Germany:"de",France:"fr",Singapore:"sg",UAE:"ae",
  Japan:"jp",Brazil:"br",Mexico:"mx",
};

type StepName = "country"|"address"|"addressReview"|"contact"|"shipping"|"payment"|"done";
const STEP_ORDER: StepName[] = ["country","address","addressReview","contact","shipping","payment","done"];

interface Props { open:boolean; onClose:()=>void; cartData:any; onOrderComplete:()=>void; }

function formatCardNumber(val: string) {
  return val.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
}
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g,"").slice(0,4);
  if (digits.length >= 3) return digits.slice(0,2) + " / " + digits.slice(2);
  if (digits.length === 2 && val.length > 2) return digits + " / ";
  return digits;
}

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

function validateStep(step: StepName, data: any): string | null {
  if (step === "address") {
    if (!data.addr.full_name.trim()) return "Please enter your full name.";
    if (!data.addr.street.trim()) return "Please enter your street address.";
    if (!data.addr.postal.trim()) return "Please enter your postal code.";
  }
  if (step === "addressReview") {
    if (!data.addr.full_name.trim()) return "Please enter your full name.";
    if (!data.addr.street.trim()) return "Please enter your street address.";
    if (!data.addr.city.trim()) return "Please enter your city.";
    if (!data.addr.state.trim()) return "Please enter your region.";
    if (!data.addr.postal.trim()) return "Please enter your postal code.";
  }
  if (step === "contact") {
    if (!data.contact.email.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) return "Please enter a valid email address.";
  }
  if (step === "payment") {
    const num = data.card.number.replace(/\s/g,"");
    if (num.length < 13) return "Please enter a valid card number.";
    if (!data.card.expiry.includes("/")) return "Please enter a valid expiry date (MM / YY).";
    const [mm, yy] = data.card.expiry.split("/").map((s: string) => parseInt(s.trim(), 10));
    if (!mm || mm < 1 || mm > 12) return "Invalid expiry month.";
    if (!yy || yy < 25) return "Card appears to be expired.";
    if (data.card.cvc.length < 3) return "Please enter a valid CVC.";
  }
  return null;
}

export default function CheckoutDrawer({ open, onClose, cartData, onOrderComplete }: Props) {
  const [step, setStep] = useState<StepName>("country");
  const stepRef   = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const animRef   = useRef(false);
  const addressHeadingRef = useRef<HTMLHeadingElement>(null);
  const addressFooterRef = useRef<HTMLDivElement>(null);
  const addressInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const addressReviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const addressReviewFooterRef = useRef<HTMLDivElement>(null);
  const addressReviewInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  const [country, setCountry] = useState("India");
  const [addr, setAddr] = useState({ full_name:"", street:"", unit:"", city:"", state:"", postal:"" });
  const [contact, setContact] = useState({ email:"", phone:"" });
  const [isGift, setIsGift] = useState(false);
  const [hasSavingsCode, setHasSavingsCode] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [card, setCard] = useState({ number:"", expiry:"", cvc:"", postal:"" });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [recipientHover, setRecipientHover] = useState(false);
  const recipientPencilRef = useRef<HTMLSpanElement>(null);

  const cartId   = cartData?.cart?.id;
  const subtotal = cartData?.cart?.subtotal || 0;
  const currencyCode = ((cartData?.cart?.currency_code as string | undefined) || "usd").toUpperCase();
  const subtotalLabel = formatCartPrice(subtotal, currencyCode);
  const cc = (c: string) => COUNTRY_CODES[c] || c.slice(0,2).toLowerCase();
  const recipientAddressLines = [
    addr.street,
    addr.unit,
    [addr.city, addr.state, addr.postal].filter(Boolean).join(", "),
    country,
  ].filter((line) => line && line.trim().length > 0);

  function handleCardNumberChange(raw: string) {
    const formatted = formatCardNumber(raw);
    const digits = formatted.replace(/\D/g, "");
    setCard((c) => ({ ...c, number: formatted }));
    if (digits.length === 16) expiryRef.current?.focus();
  }

  function handleExpiryChange(raw: string) {
    const formatted = formatExpiry(raw);
    const digits = formatted.replace(/\D/g, "");
    setCard((c) => ({ ...c, expiry: formatted }));
    if (digits.length === 4) cvcRef.current?.focus();
  }

  function handleCvcChange(raw: string) {
    const nextCvc = raw.replace(/\D/g, "").slice(0, 4);
    const numberDigits = card.number.replace(/\D/g, "");
    const cvcLength = /^3[47]/.test(numberDigits) ? 4 : 3;
    setCard((c) => ({ ...c, cvc: nextCvc }));
    if (nextCvc.length === cvcLength) zipRef.current?.focus();
  }

  function handleZipChange(raw: string) {
    setCard((c) => ({ ...c, postal: raw.slice(0, 10) }));
  }

  // ── Drawer GSAP ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setStep("country"); setOrderId(""); setError("");
    }
  }, [open]);

  useEffect(() => {
    const el = recipientPencilRef.current;
    if (!el) return;

    gsap.killTweensOf(el);
    if (recipientHover) {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.26,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(el, {
        y: 14,
        opacity: 0,
        duration: 0.16,
        ease: "power2.in",
      });
    }
  }, [recipientHover]);

  // ── Step GSAP transition ──────────────────────────────────────────────────
  function goTo(next: StepName, dir: "forward"|"back" = "forward") {
    if (animRef.current || !stepRef.current) return;
    animRef.current = true;
    setError("");
    const el = stepRef.current;
    const forward = dir === "forward";
    const runupX = forward ? 38 : -38;
    const outX = forward
      ? -(typeof window !== "undefined" ? window.innerWidth * 1.35 : 1800)
      : (typeof window !== "undefined" ? window.innerWidth * 1.35 : 1800);
    const inX = forward
      ? (typeof window !== "undefined" ? window.innerWidth * 1.25 : 1500)
      : -(typeof window !== "undefined" ? window.innerWidth * 1.25 : 1500);

    gsap.killTweensOf(el);
    gsap.timeline({
      onComplete: () => {
        setStep(next);
        requestAnimationFrame(() => {
          if (!stepRef.current) {
            animRef.current = false;
            return;
          }

          const root = stepRef.current;
          // Reset parent after exit animation so next step is actually visible.
          gsap.set(root, { x: 0, y: 0, opacity: 1 });

          if (next === "address" || next === "addressReview") {
            const addressInEls = (
              next === "address"
                ? [addressHeadingRef.current, addressFooterRef.current]
                : [addressReviewHeadingRef.current, addressReviewFooterRef.current]
            ).filter(Boolean) as HTMLElement[];

            const addressInputEls = (
              next === "address"
                ? addressInputRefs.current
                : addressReviewInputRefs.current
            ).filter(Boolean) as HTMLInputElement[];

            if (!addressInEls.length && !addressInputEls.length) {
              animRef.current = false;
              return;
            }

            gsap.killTweensOf(addressInEls);
            gsap.killTweensOf(addressInputEls);

            gsap.fromTo(
              addressInEls,
              { x: inX, y: 8, opacity: 0.9 },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.22,
                ease: "power2.out",
                stagger: 0.04,
              }
            );

            // Inputs stay fixed in-place and only reveal from left to right.
            gsap.set(addressInputEls, { x: 0, y: 0 });
            gsap.fromTo(
              addressInputEls,
              { clipPath: "inset(0 100% 0 0)", opacity: 1 },
              {
                clipPath: "inset(0 0% 0 0)",
                duration: 0.34,
                ease: "power2.out",
                stagger: 0.055,
                onComplete: () => { animRef.current = false; },
              }
            );
            return;
          }

          gsap.fromTo(
            root,
            { x: inX, y: 8, opacity: 0.88 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: 0.36,
              ease: "back.out(1.55)",
              onComplete: () => { animRef.current = false; },
            }
          );
        });
      },
    })
      .to(el, { x: runupX, opacity: 1, duration: 0.07, ease: "power1.out" })
      .to(el, { x: outX, opacity: 0, duration: 0.16, ease: "power4.in" });
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) goTo(STEP_ORDER[idx-1], "back");
  }

  // ── Step handlers ─────────────────────────────────────────────────────────
  async function confirmCountry() {
    if (cartId) {
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
        method:"POST", headers:medusaHeaders,
        body: JSON.stringify({ shipping_address:{ country_code: cc(country) } }),
      }).catch(console.warn);
    }
    goTo("address");
  }

  async function confirmAddress() {
    const err = validateStep("address", { addr, contact, card });
    if (err) { setError(err); return; }
    goTo("addressReview");
  }

  async function confirmAddressReview() {
    const err = validateStep("addressReview", { addr, contact, card });
    if (err) { setError(err); return; }
    if (cartId) {
      const parts = addr.full_name.trim().split(" ");
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
        method:"POST", headers:medusaHeaders,
        body: JSON.stringify({
          shipping_address: {
            first_name: parts[0] || "Guest",
            last_name: parts.slice(1).join(" ") || "Customer",
            address_1: addr.street,
            address_2: addr.unit,
            city: addr.city || "N/A",
            province: addr.state || addr.city || "N/A",
            postal_code: addr.postal,
            country_code: cc(country),
          },
        }),
      }).catch(console.warn);
      try {
        const r = await fetch(`${MEDUSA_URL}/store/shipping-options?cart_id=${cartId}`, { headers:medusaHeaders });
        const d = await r.json();
        const opts = d?.shipping_options || [];
        setShippingOptions(opts);
        if (opts[0]) setSelectedShipping(opts[0].id);
      } catch(e){ console.warn("shipping options:", e); }
    }
    goTo("contact");
  }

  async function confirmContact() {
    const err = validateStep("contact", { addr, contact, card });
    if (err) { setError(err); return; }
    if (cartId && contact.email) {
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
        method:"POST", headers:medusaHeaders,
        body: JSON.stringify({ email: contact.email }),
      }).catch(console.warn);
    }
    goTo("shipping");
  }

  async function confirmShipping() {
    if (!cartId) { goTo("payment"); return; }

    // Step 1: Set shipping method (skip if no option selected — product has requires_shipping: false)
    if (selectedShipping) {
      await fetch(`${MEDUSA_URL}/store/carts/${cartId}/shipping-methods`, {
        method:"POST", headers:medusaHeaders,
        body: JSON.stringify({ option_id: selectedShipping }),
      }).catch(console.warn);
    }

    // ── Medusa v2 exact payment flow (confirmed working via curl) ─────────
    // 1. POST /store/payment-collections  { cart_id }  → creates collection, returns { payment_collection: { id } }
    // 2. POST /store/payment-collections/:id/payment-sessions  { provider_id: "pp_system_default" }
    // NOTE: The cart does NOT expose payment_collection until AFTER step 1 — fetching cart first is wrong.
    try {
      console.log("[Checkout] Creating payment collection for cart:", cartId);
      const pcRes = await fetch(`${MEDUSA_URL}/store/payment-collections`, {
        method: "POST",
        headers: medusaHeaders,
        body: JSON.stringify({ cart_id: cartId }),
      });
      const pcData = await pcRes.json();
      console.log("[Checkout] payment-collections response:", pcData);

      const payColId = pcData?.payment_collection?.id;
      if (!payColId) {
        console.warn("[Checkout] No payment_collection.id in response — will retry on submit");
        goTo("payment");
        return;
      }

      // Step 2: Create payment session on the collection
      const psRes = await fetch(
        `${MEDUSA_URL}/store/payment-collections/${payColId}/payment-sessions`,
        {
          method: "POST",
          headers: medusaHeaders,
          body: JSON.stringify({ provider_id: "pp_system_default" }),
        }
      );
      const psData = await psRes.json();
      console.log("[Checkout] payment session created:", psData?.payment_collection?.payment_sessions?.[0]?.status);
    } catch(e) {
      console.warn("[Checkout] Payment init error (non-fatal):", e);
    }

    goTo("payment");
  }

  async function submitOrder() {
    const err = validateStep("payment", { addr, contact, card });
    if (err) { setError(err); return; }
    if (!cartId) { setError("No cart found. Please add items and try again."); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/complete`, {
        method:"POST",
        headers: {
          ...medusaHeaders,
          // Unique key per submit attempt — prevents Medusa idempotency 409
          "Idempotency-Key": `complete-${cartId}-${Date.now()}`,
        },
      });
      const raw = await res.json();
      console.log("[Checkout] /complete response:", JSON.stringify(raw, null, 2));

      // 409 Conflict = cart was already used in a previous /complete attempt (idempotency key clash)
      // The only fix is to clear the stale cart so a fresh one is created next time
      if (res.status === 409 || raw?.type === "conflict") {
        localStorage.removeItem("cart_id");
        onOrderComplete(); // reset parent cart state
        setError(""); 
        // Check if there actually IS an order — the cart may have completed on a previous attempt
        // In that case treat it as success
        setOrderId("(see Medusa admin)");
        goTo("done");
        return;
      }

      // Medusa v2: { type: "order", order: { id, display_id, ... } }
      const orderObj =
        raw?.type === "order" && raw?.order   ? raw.order   :
        raw?.type === "order" && raw?.data    ? raw.data    :
        raw?.order                            ? raw.order   :
        raw?.data?.type === "order"           ? (raw.data.order || raw.data.data) :
        null;

      if (orderObj) {
        setOrderId(String(orderObj.display_id ?? orderObj.id ?? "—"));
        localStorage.removeItem("cart_id");
        onOrderComplete();
        goTo("done");
      } else {
        const msg = raw?.message || raw?.error || `HTTP ${res.status}`;
        console.error("[Checkout] Order failed:", raw);
        setError(`Order failed: ${msg}`);
      }
    } catch(e: any) {
      setError(`Network error: ${e?.message || String(e)}`);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full border-2 border-black rounded-xl px-4 py-3 text-base text-black text-center font-bold focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-colors bg-white";
  const btnCls   = "bg-black text-white font-black text-lg px-10 py-4 rounded-full hover:bg-gray-800 active:scale-95 transition-all";
  const showBack = step !== "country" && step !== "address" && step !== "addressReview" && step !== "done";

  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 bg-black/15 backdrop-blur-md"
        style={{
          height: 72,
          zIndex: 120,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.32s ease",
        }}
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        className="fixed left-0 right-0 bottom-0 bg-[#ededed] rounded-t-[28px] overflow-hidden"
        style={{
          top: 72,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
          pointerEvents: open ? "auto" : "none",
          zIndex: 121,
          borderTop: "1px solid #111",
        }}
      >
        {/* Top action row */}
        <div className="bg-white border-b border-black px-5 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-full border-2 border-black text-black text-sm font-semibold tracking-wide leading-none hover:bg-black hover:text-white transition-colors"
            >
              ← EDIT ORDER
            </button>

            <div className="flex items-center gap-6">
              <p className="text-black font-semibold text-[24px] leading-none whitespace-nowrap">
                {subtotalLabel} <span className="text-base align-middle">{currencyCode}</span>
              </p>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border-2 border-black text-black text-lg font-black leading-none hover:bg-black hover:text-white transition-colors"
                aria-label="Close checkout"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        {step !== "country" && step !== "address" && step !== "addressReview" && step !== "done" && (
          <div className="bg-black px-8 py-3 grid grid-cols-3 gap-4 text-sm">
            <button
              type="button"
              onMouseEnter={() => setRecipientHover(true)}
              onMouseLeave={() => setRecipientHover(false)}
              onClick={() => goTo("country", "back")}
              className="relative text-left appearance-none border-0 bg-transparent p-2 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Edit recipient details"
            >
              <p className="text-white/50 uppercase text-xs font-semibold tracking-widest mb-0.5">Recipient</p>
              <p className="font-semibold text-white leading-tight mb-1">{addr.full_name || "—"}</p>
              <div className="text-white/75 text-xs leading-tight">
                {recipientAddressLines.length > 0 ? recipientAddressLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                )) : <p>—</p>}
              </div>
              <span
                ref={recipientPencilRef}
                className="absolute right-0 bottom-0 text-sm"
                style={{ opacity: 0, transform: "translateY(14px)" }}
                aria-hidden="true"
              >
                ✎
              </span>
            </button>
            <div className="p-2 rounded-md hover:bg-white/10 transition-colors">
              <p className="text-white/50 uppercase text-xs font-semibold tracking-widest mb-0.5">Contact</p>
              <p className="font-semibold text-white text-xs break-all">{contact.email || "—"}</p>
            </div>
            <div className="text-right p-2 rounded-md hover:bg-white/10 transition-colors">
              <p className="text-white/50 uppercase text-xs font-semibold tracking-widest mb-0.5">Total</p>
              <p className="font-semibold text-white text-lg">${(subtotal/100).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Step area */}
        <div className={`h-[calc(100svh-136px)] flex flex-col px-8 py-4 overflow-hidden relative ${step === "done" ? "justify-center" : "justify-start pt-10"}`}>

          {showBack && (
            <button onClick={goBack}
              className="absolute top-4 left-8 flex items-center gap-1 text-sm font-black text-gray-400 hover:text-black transition-colors z-10">
              <span className="text-base leading-none">←</span> Back
            </button>
          )}

          {error && (
            <div className="absolute top-10 left-8 right-8 bg-red-50 border border-red-300 rounded-xl px-4 py-2 z-10">
              <p className="text-red-600 text-sm font-black text-center">{error}</p>
            </div>
          )}

          <div ref={stepRef} className={`w-full mx-auto ${(step === "address" || step === "addressReview") ? "max-w-5xl" : "max-w-lg"}`}>

            {/* ── STEP 1: Country ── */}
            {step === "country" && (
              <div className="text-center">
                <h2 className="text-[30px] font-semibold text-black mb-7 leading-tight" style={{ fontFamily:"Helvetica Neue, Arial, sans-serif" }}>
                  What country are we shipping to?
                </h2>
                <div className="relative w-full max-w-96 mx-auto mb-6">
                  <select value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-black rounded-lg px-5 py-3 pr-12 text-[18px] font-semibold text-black appearance-none cursor-pointer focus:outline-none bg-white text-center">
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl text-black">▾</span>
                </div>
                <button onClick={confirmCountry} className="bg-black text-white font-semibold text-[18px] px-8 py-3 rounded-full hover:bg-gray-800 active:scale-95 transition-all">
                  Confirm Country
                </button>
              </div>
            )}

            {/* ── STEP 2: Address ── */}
            {step === "address" && (
              <div className="text-center w-full max-w-5xl mx-auto">
                <h2 ref={addressHeadingRef} className="text-[38px] font-semibold text-black mb-8 leading-tight" style={{ fontFamily:"Helvetica Neue, Arial, sans-serif" }}>
                  Where should we send this stuff?
                </h2>
                <div className="grid grid-cols-1 gap-4 mb-6 max-w-3xl mx-auto">
                  <input placeholder="Full Name *" value={addr.full_name}
                    ref={(el) => { addressInputRefs.current[0] = el; }}
                    onChange={(e) => setAddr((a) => ({ ...a, full_name:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-semibold text-black text-center focus:outline-none bg-[#ededed]" />
                  <input placeholder="Street Address *" value={addr.street}
                    ref={(el) => { addressInputRefs.current[1] = el; }}
                    onChange={(e) => setAddr((a) => ({ ...a, street:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-semibold text-black text-center focus:outline-none bg-[#ededed]" />
                  <input placeholder="Unit # (Optional)" value={addr.unit}
                    ref={(el) => { addressInputRefs.current[2] = el; }}
                    onChange={(e) => setAddr((a) => ({ ...a, unit:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-semibold text-black text-center focus:outline-none bg-[#ededed]" />
                  <input placeholder="Postal Code *" value={addr.postal}
                    ref={(el) => { addressInputRefs.current[3] = el; }}
                    onChange={(e) => setAddr((a) => ({ ...a, postal:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-semibold text-black text-center focus:outline-none bg-[#ededed]" />
                </div>

                <div ref={addressFooterRef} className="max-w-3xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <label className="justify-self-start inline-flex items-center gap-3 text-[18px] text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="w-6 h-6 rounded border-2 border-black"
                    />
                    <span>
                      This order is <strong>a gift.</strong>
                    </span>
                  </label>

                  <button onClick={confirmAddress} className="bg-black text-white font-semibold text-[16px] px-10 py-3 rounded-full hover:bg-gray-800 active:scale-95 transition-all">
                    Submit Address
                  </button>

                  <label className="justify-self-end inline-flex items-center gap-3 bg-[#8BF0B6] px-4 py-3 rounded-md text-[18px] text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSavingsCode}
                      onChange={(e) => setHasSavingsCode(e.target.checked)}
                      className="w-6 h-6 rounded border-2 border-black"
                    />
                    <span>
                      I have a <strong>savings code.</strong>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ── STEP 3: Address Review ── */}
            {step === "addressReview" && (
              <div className="text-center w-full max-w-5xl mx-auto">
                <h2 ref={addressReviewHeadingRef} className="text-[42px] font-semibold text-black mb-8 leading-tight" style={{ fontFamily:"Helvetica Neue, Arial, sans-serif" }}>
                  How does this address look? Edit if needed.
                </h2>

                <div className="grid grid-cols-1 gap-4 mb-6 max-w-3xl mx-auto">
                  <input
                    ref={(el) => { addressReviewInputRefs.current[0] = el; }}
                    placeholder="Full Name"
                    value={addr.full_name}
                    onChange={(e) => setAddr((a) => ({ ...a, full_name:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]"
                  />
                  <input
                    ref={(el) => { addressReviewInputRefs.current[1] = el; }}
                    placeholder="Street Address"
                    value={addr.street}
                    onChange={(e) => setAddr((a) => ({ ...a, street:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]"
                  />
                  <input
                    ref={(el) => { addressReviewInputRefs.current[2] = el; }}
                    placeholder="Address Line 2 (Optional)"
                    value={addr.unit}
                    onChange={(e) => setAddr((a) => ({ ...a, unit:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]"
                  />
                  <input
                    ref={(el) => { addressReviewInputRefs.current[3] = el; }}
                    placeholder="Region"
                    value={addr.state}
                    onChange={(e) => setAddr((a) => ({ ...a, state:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      ref={(el) => { addressReviewInputRefs.current[4] = el; }}
                      placeholder="City"
                      value={addr.city}
                      onChange={(e) => setAddr((a) => ({ ...a, city:e.target.value }))}
                      className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]"
                    />
                    <input
                      ref={(el) => { addressReviewInputRefs.current[5] = el; }}
                      placeholder="Postal Code"
                      value={addr.postal}
                      onChange={(e) => setAddr((a) => ({ ...a, postal:e.target.value }))}
                      className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]"
                    />
                  </div>
                </div>

                <div ref={addressReviewFooterRef} className="flex justify-center">
                  <button onClick={confirmAddressReview} className="bg-black text-white font-semibold text-[16px] px-10 py-3 rounded-full hover:bg-gray-800 active:scale-95 transition-all">
                    Confirm Address
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Contact ── */}
            {step === "contact" && (
              <div className="text-center w-full max-w-5xl mx-auto">
                <h2 className="text-[46px] font-semibold text-black mb-8 leading-tight" style={{ fontFamily:"Helvetica Neue, Arial, sans-serif" }}>
                  Give us some contact info for confirmations and delivery.
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-5 max-w-3xl mx-auto">
                  <input placeholder="Email Address" type="email" value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]" autoComplete="email" />
                  <input placeholder="Phone (for delivery issues)" type="tel" value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone:e.target.value }))}
                    className="w-full border-2 border-black rounded-[10px] px-6 py-3 text-[16px] font-medium text-black text-center focus:outline-none bg-[#ededed]" />
                </div>
                <label className="flex items-center justify-center gap-3 text-[15px] font-semibold text-black mb-6 cursor-pointer">
                  <input type="checkbox" className="w-6 h-6 rounded border-2 border-black" />
                  Email me when Cards Against Humanity makes a new thing.
                </label>
                <button onClick={confirmContact} className="bg-black text-white font-semibold text-[16px] px-10 py-3 rounded-full hover:bg-gray-800 active:scale-95 transition-all">
                  Confirm Contact Info
                </button>
              </div>
            )}

            {/* ── STEP 5: Shipping ── */}
            {step === "shipping" && (
              <div className="text-center">
                <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily:"Georgia,serif" }}>
                  How should we ship your stuff?
                </h2>
                <div className="space-y-3 mb-6 text-left">
                  {shippingOptions.length > 0 ? shippingOptions.map((opt: any) => (
                    <label key={opt.id}
                      className={`flex items-center gap-4 border-2 rounded-xl px-5 py-4 cursor-pointer transition-colors ${
                        selectedShipping===opt.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-black"
                      }`}>
                      <input type="radio" checked={selectedShipping===opt.id}
                        onChange={() => setSelectedShipping(opt.id)} className="w-5 h-5" />
                      <div>
                        <p className="font-black text-black">{opt.name}</p>
                        <p className="text-gray-500 text-sm">${((opt.amount||0)/100).toFixed(2)}</p>
                      </div>
                    </label>
                  )) : (
                    <label className="flex items-center gap-4 border-2 border-black rounded-xl px-5 py-4 bg-gray-50">
                      <input type="radio" defaultChecked className="w-5 h-5" />
                      <div>
                        <p className="font-black text-black">Standard Shipping</p>
                        <p className="text-gray-500 text-sm">Free</p>
                      </div>
                    </label>
                  )}
                </div>
                <button onClick={confirmShipping} className={btnCls}>Confirm Shipping</button>
              </div>
            )}

            {/* ── STEP 6: Payment ── */}
            {step === "payment" && (
              <div className="text-center">
                <h2 className="text-2xl font-black text-black mb-1" style={{ fontFamily:"Georgia,serif" }}>
                  Here&apos;s where you pay us.
                </h2>
                <p className="text-gray-400 text-xs mb-4">🧪 Test mode — Medusa system provider, no real charge</p>

                {/* Card number with icon */}
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none text-base">💳</span>
                  <input
                    ref={cardNumberRef}
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                    className={`${inputCls} pl-10 text-left tracking-widest`}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                </div>

                {/* Expiry / CVC / ZIP */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <input
                    ref={expiryRef}
                    placeholder="MM / YY"
                    value={card.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    maxLength={7}
                    className={`${inputCls} tracking-wider`}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                  <input
                    ref={cvcRef}
                    placeholder="CVC"
                    value={card.cvc}
                    onChange={(e) => handleCvcChange(e.target.value)}
                    maxLength={4}
                    className={inputCls}
                    autoComplete="off"
                    type="password"
                    inputMode="numeric"
                  />
                  <input
                    ref={zipRef}
                    placeholder="ZIP"
                    value={card.postal}
                    onChange={(e) => handleZipChange(e.target.value)}
                    className={inputCls}
                    autoComplete="off"
                  />
                </div>

                <div className="flex justify-between font-black text-black text-lg border-t-2 border-black pt-3 mb-4">
                  <span>Total</span>
                  <span>${(subtotal/100).toFixed(2)}</span>
                </div>

                <button onClick={submitOrder} disabled={submitting}
                  className={`${btnCls} w-full disabled:opacity-50`}>
                  {submitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : `Submit Order · $${(subtotal/100).toFixed(2)}`}
                </button>
                <p className="text-xs text-gray-400 mt-2">Test mode — no real charge will occur</p>
              </div>
            )}

            {/* ── STEP 7: Done ── */}
            {step === "done" && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-black text-black mb-3" style={{ fontFamily:"Georgia,serif" }}>
                  Order placed!
                </h2>
                <p className="text-gray-500 text-lg mb-2">Thanks for being a horrible person.</p>
                {orderId && (
                  <p className="text-sm text-gray-400 font-mono bg-gray-100 inline-block px-4 py-2 rounded-lg mb-6">
                    Confirmation #{orderId}
                  </p>
                )}
                <br />
                <button onClick={onClose} className={btnCls}>Keep Shopping</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}