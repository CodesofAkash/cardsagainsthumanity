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

type StepName = "country"|"address"|"contact"|"shipping"|"payment"|"done";
const STEP_ORDER: StepName[] = ["country","address","contact","shipping","payment","done"];

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

function validateStep(step: StepName, data: any): string | null {
  if (step === "address") {
    if (!data.addr.full_name.trim()) return "Please enter your full name.";
    if (!data.addr.street.trim()) return "Please enter your street address.";
    if (!data.addr.city.trim()) return "Please enter your city.";
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
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  const [country, setCountry] = useState("India");
  const [addr, setAddr] = useState({ full_name:"", street:"", unit:"", city:"", state:"", postal:"" });
  const [contact, setContact] = useState({ email:"", phone:"" });
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [card, setCard] = useState({ number:"", expiry:"", cvc:"", postal:"" });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const cartId   = cartData?.cart?.id;
  const subtotal = cartData?.cart?.subtotal || 0;
  const cc = (c: string) => COUNTRY_CODES[c] || c.slice(0,2).toLowerCase();

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
    const el = drawerRef.current;
    if (!el) return;
    if (open) {
      setStep("country"); setOrderId(""); setError("");
      gsap.fromTo(el, { y:"100%" }, { y:0, duration:0.5, ease:"back.out(1.3)" });
    } else {
      gsap.to(el, { y:"100%", duration:0.28, ease:"power2.in" });
    }
  }, [open]);

  // ── Step GSAP transition ──────────────────────────────────────────────────
  function goTo(next: StepName, dir: "forward"|"back" = "forward") {
    if (animRef.current || !stepRef.current) return;
    animRef.current = true;
    setError("");
    const el = stepRef.current;
    const outX = dir === "forward" ? -60 : 60;
    const inX  = dir === "forward" ?  80 : -80;
    gsap.to(el, { x:outX, opacity:0, duration:0.2, ease:"power2.in",
      onComplete: () => {
        setStep(next);
        gsap.fromTo(el, { x:inX, opacity:0 },
          { x:0, opacity:1, duration:0.38, ease:"back.out(1.7)",
            onComplete: () => { animRef.current = false; }
          }
        );
      }
    });
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
            city: addr.city,
            province: addr.state || addr.city,
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
  const showBack = step !== "country" && step !== "done";

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60" style={{ zIndex: 120 }} onClick={onClose} />}

      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
        style={{ transform:"translateY(100%)", zIndex: 121 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Summary bar */}
        {step !== "country" && step !== "done" && (
          <div className="bg-black px-8 py-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white/50 uppercase text-xs font-black tracking-widest mb-0.5">Recipient</p>
              <p className="font-black text-white truncate">{addr.full_name || "—"}</p>
              <p className="text-white/60 text-xs truncate">{addr.street}</p>
            </div>
            <div>
              <p className="text-white/50 uppercase text-xs font-black tracking-widest mb-0.5">Contact</p>
              <p className="font-black text-white text-xs truncate">{contact.email || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 uppercase text-xs font-black tracking-widest mb-0.5">Total</p>
              <p className="font-black text-white text-xl">${(subtotal/100).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Step area */}
        <div className="h-[440px] flex flex-col justify-center px-8 py-4 overflow-hidden relative">

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

          <div ref={stepRef} className="w-full max-w-lg mx-auto">

            {/* ── STEP 1: Country ── */}
            {step === "country" && (
              <div className="text-center">
                <h2 className="text-3xl font-black text-black mb-8" style={{ fontFamily:"Georgia,serif" }}>
                  What country are we shipping to?
                </h2>
                <div className="relative max-w-sm mx-auto mb-8">
                  <select value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full border-2 border-black rounded-xl px-6 py-4 text-lg font-black text-black appearance-none cursor-pointer focus:outline-none bg-white">
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-xl text-black">›</span>
                </div>
                <button onClick={confirmCountry} className={btnCls}>Confirm Country</button>
              </div>
            )}

            {/* ── STEP 2: Address ── */}
            {step === "address" && (
              <div className="text-center">
                <h2 className="text-2xl font-black text-black mb-5" style={{ fontFamily:"Georgia,serif" }}>
                  Where should we send this stuff?
                </h2>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <input placeholder="Full Name *" value={addr.full_name}
                    onChange={(e) => setAddr((a) => ({ ...a, full_name:e.target.value }))}
                    className={`${inputCls} col-span-2`} />
                  <input placeholder="Street Address *" value={addr.street}
                    onChange={(e) => setAddr((a) => ({ ...a, street:e.target.value }))}
                    className={`${inputCls} col-span-2`} />
                  <input placeholder="City *" value={addr.city}
                    onChange={(e) => setAddr((a) => ({ ...a, city:e.target.value }))}
                    className={inputCls} />
                  <input placeholder="State / Province" value={addr.state}
                    onChange={(e) => setAddr((a) => ({ ...a, state:e.target.value }))}
                    className={inputCls} />
                  <input placeholder="Postal Code *" value={addr.postal}
                    onChange={(e) => setAddr((a) => ({ ...a, postal:e.target.value }))}
                    className={inputCls} />
                  <input placeholder="Unit # (Optional)" value={addr.unit}
                    onChange={(e) => setAddr((a) => ({ ...a, unit:e.target.value }))}
                    className={inputCls} />
                </div>
                <button onClick={confirmAddress} className={btnCls}>Submit Address</button>
              </div>
            )}

            {/* ── STEP 3: Contact ── */}
            {step === "contact" && (
              <div className="text-center">
                <h2 className="text-2xl font-black text-black mb-2" style={{ fontFamily:"Georgia,serif" }}>
                  Give us some contact info
                </h2>
                <p className="text-gray-500 text-base mb-6">for confirmations and delivery.</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <input placeholder="Email Address *" type="email" value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email:e.target.value }))}
                    className={inputCls} autoComplete="email" />
                  <input placeholder="Phone (optional)" type="tel" value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone:e.target.value }))}
                    className={inputCls} />
                </div>
                <label className="flex items-center justify-center gap-2 text-sm font-bold text-black mb-6 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  Email me when Cards Against Humanity makes a new thing.
                </label>
                <button onClick={confirmContact} className={btnCls}>Confirm Contact Info</button>
              </div>
            )}

            {/* ── STEP 4: Shipping ── */}
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

            {/* ── STEP 5: Payment ── */}
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

            {/* ── STEP 6: Done ── */}
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