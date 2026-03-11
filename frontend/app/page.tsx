"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "../hooks/useCart";
import CartDrawer from "../components/CartDrawer";
import CheckoutDrawer from "../components/CheckoutDrawer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

function useCMSHome() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`${CMS_URL}/api/globals/home-page?depth=1`)
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);
  return data;
}

function useCMSProducts() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${CMS_URL}/api/products?depth=2&limit=20`)
      .then(r => r.json()).then(d => setProducts(d?.docs ?? [])).catch(() => {});
  }, []);
  return products;
}

function cmsImg(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${CMS_URL}${url}`;
}

// ── Laurel Badge ──────────────────────────────────────────────────────────────
function LaurelBadge({ quote, source }: { quote: string; source: string }) {
  const LeafSVG = () => (
    <svg width="38" height="46" viewBox="0 0 38 46" fill="none">
      {[5,9,13,17,21,25,29,33,37,41].map((cy, i) => (
        <ellipse key={i} cx={5 + Math.abs(Math.sin(i * 0.7)) * 4} cy={cy} rx="3" ry="4.5"
          fill="white" transform={`rotate(${-25 + i * 6} ${5 + Math.abs(Math.sin(i * 0.7)) * 4} ${cy})`}
          opacity={0.85 + (i % 2) * 0.15} />
      ))}
    </svg>
  );
  return (
    <div className="flex items-center gap-2">
      <LeafSVG />
      <div className="text-white text-center">
        <p className="text-2xl font-black italic leading-none" style={{ fontFamily: "Georgia, serif" }}>{quote}</p>
        <p className="text-xs font-black tracking-[0.25em] mt-1 uppercase">{source}</p>
      </div>
      <div style={{ transform: "scaleX(-1)" }}><LeafSVG /></div>
    </div>
  );
}

// ── Playing Card ──────────────────────────────────────────────────────────────
function PlayingCard({ text, black = false }: { text: string; black?: boolean }) {
  return (
    <div className={`w-full h-full rounded-2xl p-5 flex flex-col justify-between select-none ${black ? "bg-black text-white border-2 border-white/30" : "bg-white text-black"}`}
      style={{ boxShadow: black ? "0 8px 40px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.8)" : "0 8px 40px rgba(0,0,0,0.5)" }}>
      <p className="font-black text-lg leading-snug" style={{ fontFamily: "Georgia, serif" }}>{text}</p>
      <div className={`flex items-center gap-2 opacity-50 ${black ? "text-white" : "text-black"}`}>
        <div className={`w-5 h-5 rounded-sm border-2 flex-shrink-0 ${black ? "border-white" : "border-black"}`} />
        <span className="text-xs font-black tracking-wide">Cards Against Humanity</span>
      </div>
    </div>
  );
}

const CARD_SETS = [
  { black: "I only saw my father cry twice: once after Mom died, and once after ___________.","whites": ["Shitting into a Coinstar machine.","This boring-ass white bitch from work.","Teenage pregnancy.","Police brutality.","Sewing two hamsters together to make a Double Hamster Supreme.","Cuddling."] },
  { black: "A new adventure awaits at Walt Disney's Magical Kingdom of ___________!","whites": ["Drug-resistant bacteria.","The Flintstones.","Praying the gay away.","Exactly what you'd expect.","Giving 110%.","Tasteful sideboob."] },
  { black: "Yo, is ___________ racist?","whites": ["The Trail of Tears.","My collection of exotic sex trophies.","Auschwitz.","A tiny horse.","Whatever Morgan Freeman tells me to do.","Abstinence-only education."] },
];
const QUOTES = [
  { quote: '"Bad."', source: "NPR" }, { quote: '"Stupid."', source: "Bloomberg" },
  { quote: '"Hysterical."', source: "TIME" }, { quote: '"Wrong."', source: "Washington Post" },
];
const SPREAD = [
  { x: -290, y: -140, rot: -12 }, { x: 80, y: -170, rot: 6 },
  { x: -320, y: 30, rot: 9 }, { x: 260, y: 20, rot: -7 },
  { x: -200, y: 190, rot: -10 }, { x: 160, y: 200, rot: 8 },
];

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const blackRef = useRef<HTMLDivElement>(null);
  const whiteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const setIdxRef = useRef(0); const quoteIdxRef = useRef(0);
  const busy = useRef(false); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [setIdx, setSetIdx] = useState(0); const [quoteIdx, setQuoteIdx] = useState(0);
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); };

  const flyUpNext = useCallback(() => {
    clearTimer(); busy.current = true;
    const all = [blackRef.current, ...whiteRefs.current].filter(Boolean) as HTMLDivElement[];
    gsap.to(all, { y: "-130vh", opacity: 0, rotate: (i: number) => (i % 2 ? 18 : -18), duration: 0.55, stagger: 0.045, ease: "power2.in",
      onComplete: () => { const ni = (setIdxRef.current + 1) % CARD_SETS.length; const nq = (quoteIdxRef.current + 1) % QUOTES.length; setIdxRef.current = ni; quoteIdxRef.current = nq; setSetIdx(ni); setQuoteIdx(nq); busy.current = false; } });
  }, []);

  const doSpread = useCallback(() => {
    if (!blackRef.current) return; busy.current = true;
    gsap.set(blackRef.current, { x: 0, y: 0, rotate: 0, scale: 0.5, opacity: 0, zIndex: 20 });
    whiteRefs.current.forEach(el => { if (el) gsap.set(el, { x: 0, y: 0, rotate: 0, scale: 0.5, opacity: 0, zIndex: 1 }); });
    gsap.to(blackRef.current, { scale: 1, opacity: 1, rotate: -3, duration: 0.65, ease: "back.out(1.3)", delay: 0.15,
      onComplete: () => { whiteRefs.current.forEach((el, i) => { if (!el) return; const sp = SPREAD[i]; gsap.to(el, { x: sp.x, y: sp.y, rotate: sp.rot, scale: 1, opacity: 1, zIndex: 5, duration: 0.5, delay: i * 0.065, ease: "back.out(1.4)", onComplete: i === 5 ? () => { busy.current = false; timer.current = setTimeout(flyUpNext, 4000); } : undefined }); }); } });
  }, [flyUpNext]);

  useEffect(() => { doSpread(); return clearTimer; }, [setIdx]);
  useEffect(() => {
    gsap.fromTo(titleRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.1 });
    gsap.fromTo(badgeRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 });
  }, []);

  const onEnter = (i: number) => { if (busy.current) return; const el = whiteRefs.current[i]; if (!el) return; gsap.to(el, { rotate: SPREAD[i].rot + 9, scale: 1.1, zIndex: 30, duration: 0.22, ease: "power2.out" }); };
  const onLeave = (i: number) => { const el = whiteRefs.current[i]; if (!el) return; gsap.to(el, { rotate: SPREAD[i].rot, scale: 1, zIndex: 5, duration: 0.22, ease: "power2.out" }); };
  const onClick = (i: number) => {
    if (busy.current) return; clearTimer(); busy.current = true;
    whiteRefs.current.forEach((el, j) => { if (!el) return; const sp = SPREAD[j]; if (j === i) gsap.to(el, { x: sp.x * 0.35, y: sp.y * 0.35 - 10, scale: 1.15, rotate: sp.rot * 0.3, zIndex: 28, duration: 0.4, ease: "back.out(1.2)" }); else gsap.to(el, { x: sp.x * 1.7, y: sp.y * 1.6, scale: 0.85, opacity: 0.5, duration: 0.4, ease: "power2.out" }); });
    gsap.to(blackRef.current, { scale: 1.06, duration: 0.4, ease: "back.out(1.2)" });
    timer.current = setTimeout(() => { busy.current = false; flyUpNext(); }, 2200);
  };

  const set = CARD_SETS[setIdx];
  return (
    <section className="relative w-full bg-black overflow-hidden" style={{ height: "100svh", minHeight: 620 }}>
      <div ref={titleRef} className="absolute top-8 left-8 z-30" style={{ opacity: 0 }}>
        <h1 className="text-white font-black leading-none" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}>Cards<br />Against<br />Humanity</h1>
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
        <div ref={blackRef} className="absolute" style={{ width: 240, height: 310 }}><PlayingCard text={set.black} black /></div>
        {set.whites.map((text, i) => (
          <div key={`${setIdx}-${i}`} ref={el => { whiteRefs.current[i] = el; }} className="absolute cursor-pointer" style={{ width: 210, height: 270 }}
            onMouseEnter={() => onEnter(i)} onMouseLeave={() => onLeave(i)} onClick={() => onClick(i)}>
            <PlayingCard text={text} />
          </div>
        ))}
      </div>
      <div ref={badgeRef} className="absolute bottom-10 left-8 z-30" style={{ opacity: 0 }}>
        <LaurelBadge quote={QUOTES[quoteIdx].quote} source={QUOTES[quoteIdx].source} />
      </div>
    </section>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ cartCount, onCartOpen }: { cartCount: number; onCartOpen: () => void }) {
  const [vis, setVis] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => { const fn = () => setVis(window.scrollY > window.innerHeight * 0.12); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { if (!navRef.current) return; gsap.to(navRef.current, { opacity: vis ? 1 : 0, y: vis ? 0 : -6, duration: 0.3, ease: "power2.out" }); navRef.current.style.pointerEvents = vis ? "auto" : "none"; }, [vis]);
  useEffect(() => { const close = () => { setShopOpen(false); setAboutOpen(false); }; document.addEventListener("click", close); return () => document.removeEventListener("click", close); }, []);
  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black" style={{ opacity: 0, padding: "18px 40px" }}>
      <a href="/" className="text-white font-black" style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}>Cards Against Humanity</a>
      <div className="flex items-center" style={{ gap: "48px" }}>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button className="text-white font-black flex items-center hover:opacity-70 transition-opacity" style={{ fontSize: "1.35rem", gap: "6px" }} onClick={() => { setShopOpen(!shopOpen); setAboutOpen(false); }}>
            Shop <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {shopOpen && <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-56 z-50">{["All Products","Main Games","Expansions","Family","Packs","Other Stuff"].map(x => <a key={x} href="#" className="block px-6 py-2.5 hover:bg-gray-50 font-black text-base text-black">{x}</a>)}</div>}
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button className="text-white font-black flex items-center hover:opacity-70 transition-opacity" style={{ fontSize: "1.35rem", gap: "6px" }} onClick={() => { setAboutOpen(!aboutOpen); setShopOpen(false); }}>
            About <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {aboutOpen && <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-56 z-50">{["Our Story","Team","Press","Careers","Contact"].map(x => <a key={x} href="#" className="block px-6 py-2.5 hover:bg-gray-50 font-black text-base text-black">{x}</a>)}</div>}
        </div>
        <button onClick={onCartOpen} className="text-white font-black hover:opacity-70 transition-opacity flex items-center gap-1" style={{ fontSize: "1.35rem" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {cartCount}/
        </button>
      </div>
    </nav>
  );
}

function AboutSection({ cmsData }: { cmsData: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const p1 = cmsData?.about?.paragraph1 || "Cards Against Humanity is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! Wow.";
  const p2 = cmsData?.about?.paragraph2 || "The game is simple. Each round, one player asks a question from a black card, and everyone else answers with their funniest white card.";

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current.querySelectorAll(".anim-p"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.18, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" } }
    );
  }, []);

  // Small CAH logo SVG used as decorative mark
  const CahMark = ({ style }: { style?: React.CSSProperties }) => (
    <div className="absolute pointer-events-none select-none" style={{ opacity: 0.07, ...style }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect width="80" height="80" rx="8" fill="black"/>
        <text x="40" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Georgia, serif">Cards Against</text>
        <text x="40" y="64" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Georgia, serif">Humanity</text>
      </svg>
    </div>
  );

  return (
    <section className="bg-white relative overflow-hidden" style={{ padding: "112px 40px" }}>
      {/* Decorative CAH marks — exactly like the reference */}
      <CahMark style={{ top: 32, left: 48 }} />
      <CahMark style={{ top: 32, right: 48 }} />
      <CahMark style={{ bottom: 32, left: 48 }} />
      <CahMark style={{ bottom: 32, right: 48 }} />
      <CahMark style={{ top: "50%", left: 16, transform: "translateY(-50%)" }} />
      <CahMark style={{ top: "50%", right: 16, transform: "translateY(-50%)" }} />

      {/* Centered content */}
      <div ref={ref} className="relative z-10 mx-auto text-center" style={{ maxWidth: 820 }}>
        <p className="anim-p text-black font-black leading-tight mb-10"
          style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          <strong>Cards Against Humanity</strong> is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! Wow.
        </p>
        <p className="anim-p text-black leading-relaxed"
          style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.5 }}>
          {p2}
        </p>
      </div>
    </section>
  );
}

// ── Buy Section ───────────────────────────────────────────────────────────────
// Config: 5 product cards matching the reference exactly
const BUY_CONFIG = [
  { slug: "more-cah",   bg: "#87CEEB", textColor: "#000", label: "America's #1\ngerbil coffin.",  cta: "Buy Now",           href: "/products/more-cah" },
  { slug: "family",     bg: "#FFE135", textColor: "#000", label: "Play CAH\nwith your kids.",    cta: "Buy Family Edition", href: "#" },
  { slug: "expansions", bg: "#FFB3D9", textColor: "#000", label: "Moooooore\ncards!",             cta: "Buy Expansions",     href: "#" },
  { slug: "packs",      bg: "#90EE90", textColor: "#000", label: "For whatever\nyou're into.",    cta: "Buy $5 Packs",       href: "#" },
  { slug: "other",      bg: "#111111", textColor: "#fff", label: "What is\nthis stuff?",          cta: "Find Out",           href: "#" },
];

// CSS product visuals — fallback when CMS image not present
function ProductVisualFallback({ type }: { type: string }) {
  if (type === "more-cah") return (
    <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none" style={{ paddingTop: 20 }}>
      <div style={{ width: 190, height: 250, background: "#000", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 14, transform: "rotate(8deg) translateY(-8px)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 18px", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 15, lineHeight: 1.2, fontFamily: "Georgia, serif" }}>Cards<br />Against<br />Humanity.</div>
        <div style={{ color: "white", fontSize: 11, fontWeight: 700, opacity: 0.6 }}>A party game for<br />horrible people.</div>
      </div>
    </div>
  );
  if (type === "family") return (
    <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none" style={{ paddingTop: 20 }}>
      <div style={{ width: 200, height: 250, background: "#fff", borderRadius: 14, transform: "rotate(6deg) translateY(-6px)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "#FFD700", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 13, textAlign: "center", lineHeight: 1.3 }}>Cards<br />Against<br />Humanity<br /><span style={{ fontSize: 11, fontStyle: "italic" }}>Family Edition</span></div>
        </div>
        <div style={{ background: "white", padding: "10px 16px", fontSize: 11, fontWeight: 900, color: "#000" }}>A game for ages 8+</div>
      </div>
    </div>
  );
  if (type === "expansions") return (
    <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none" style={{ paddingTop: 20 }}>
      <div style={{ position: "relative", width: 180, height: 220 }}>
        <div style={{ position: "absolute", top: 0, left: 20, width: 130, height: 170, background: "#111", borderRadius: "8px 8px 22px 22px", transform: "rotate(-14deg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", padding: 16 }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 14, textAlign: "center", lineHeight: 1.2 }}>Culture<br />Wars</div>
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 130, height: 160, background: "#111", borderRadius: 12, transform: "rotate(6deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle, #fff700 0%, #ff8c00 45%, #ff2200 85%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 12, textAlign: "center", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>Hot<br />Box</span>
          </div>
        </div>
      </div>
    </div>
  );
  if (type === "packs") return (
    <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none" style={{ paddingTop: 20 }}>
      <div style={{ width: 150, height: 185, background: "#111", borderRadius: 12, transform: "rotate(-8deg) translateY(-6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", padding: 16 }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 13, textAlign: "center", lineHeight: 1.3, marginBottom: 12 }}>Everything<br />You Need</div>
        <div style={{ width: 32, height: 32, background: "#0ea5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontSize: 16 }}>✦</span>
        </div>
      </div>
    </div>
  );
  // other
  return (
    <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none" style={{ paddingTop: 20 }}>
      <div style={{ width: 140, height: 175, background: "white", borderRadius: 12, transform: "rotate(-7deg) translateY(-4px)", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 16px 40px rgba(255,255,255,0.1)", padding: 14 }}>
        <p style={{ fontWeight: 900, fontSize: 12, lineHeight: 1.4, color: "#000", fontFamily: "Georgia, serif" }}>What is the most important thing we can give a child?</p>
        <div style={{ fontSize: 9, color: "#000", fontWeight: 700, opacity: 0.4 }}>Cards Against Humanity</div>
      </div>
    </div>
  );
}

function BuySection({ cmsProducts }: { cmsProducts: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // slug → CMS image URL
  const imgMap: Record<string, string> = {};
  cmsProducts.forEach(p => {
    const url = p.images?.[0]?.image?.url;
    if (url && p.slug) imgMap[p.slug] = cmsImg(url);
  });

  useEffect(() => {
    if (headingRef.current)
      gsap.fromTo(headingRef.current, { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: "back.out(1.4)", scrollTrigger: { trigger: headingRef.current, start: "top 85%" } });
  }, []);

  return (
    <section className="bg-black overflow-hidden" style={{ paddingTop: 56, paddingBottom: 56 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6" style={{ paddingLeft: 48, paddingRight: 48 }}>
        <h2 ref={headingRef} className="text-white font-black" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", letterSpacing: "-0.03em" }}>
          Buy the game.
        </h2>
        <div className="flex gap-3">
          {[false, true].map((isNext, i) => (
            <button key={i} onClick={() => scrollRef.current?.scrollBy({ left: isNext ? 390 : -390, behavior: "smooth" })}
              className="flex items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-colors flex-shrink-0"
              style={{ width: 44, height: 44 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isNext ? <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></> : <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Cards row — horizontally scrollable */}
      <div ref={scrollRef} className="flex overflow-x-auto" style={{ paddingLeft: 48, paddingRight: 48, gap: 10, scrollbarWidth: "none" }}>
        {BUY_CONFIG.map((p, i) => {
          const imgUrl = imgMap[p.slug];
          return (
            <a key={i} href={p.href} className="flex-shrink-0 relative overflow-hidden group"
              style={{ width: 360, height: 520, background: p.bg, borderRadius: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "28px 32px 32px", textDecoration: "none", cursor: "pointer" }}>
              {/* Product visual (CMS image or CSS fallback) */}
              {imgUrl ? (
                <div className="absolute inset-0 flex items-center justify-end pointer-events-none" style={{ paddingRight: 20, paddingTop: 20 }}>
                  <img src={imgUrl} alt="" style={{ maxHeight: 300, maxWidth: "75%", objectFit: "contain", transform: "rotate(7deg) translateY(-8px)", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))" }} />
                </div>
              ) : (
                <ProductVisualFallback type={p.slug} />
              )}
              {/* Text */}
              <div style={{ position: "relative", zIndex: 2 }}>
                <p className="font-black leading-tight mb-5 whitespace-pre-line"
                  style={{ fontSize: "clamp(1.7rem,2.8vw,2.1rem)", color: p.textColor, letterSpacing: "-0.025em" }}>
                  {p.label}
                </p>
                <span className="inline-block font-black rounded-full transition-all group-hover:scale-105"
                  style={{ fontSize: "1rem", padding: "13px 28px", background: p.textColor === "#fff" ? "white" : "black", color: p.textColor === "#fff" ? "black" : "white" }}>
                  {p.cta}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ── Starburst ─────────────────────────────────────────────────────────────────
function Starburst({ text, bg = "#c8f7c5", size = 130, textColor = "#000" }: { text: string; bg?: string; size?: number; textColor?: string }) {
  const cx = size / 2, cy = size / 2, n = 16, oR = cx - 2, iR = cx - 13;
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 ? iR : oR;
    d += (i ? "L" : "M") + `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  d += "Z";
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute" }}><path d={d} fill={bg} /></svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
        <span className="font-black text-center leading-tight whitespace-pre-line" style={{ fontSize: 12, color: textColor }}>{text}</span>
      </div>
    </div>
  );
}

// ── Steal — centred content ───────────────────────────────────────────────────
function StealSection({ cmsData }: { cmsData: any }) {
  const heading  = cmsData?.stealSection?.heading  || "Steal the game.";
  const body     = cmsData?.stealSection?.body     || "Since day one, Cards Against Humanity has been available as a free download on our website. You can download the PDFs and printing instructions right here—all you need is a printer, scissors, and a prehensile appendage.";
  const badgeTxt = cmsData?.stealSection?.badgeText || "Free!\nDownload\nnow!";

  return (
    <section className="bg-white relative overflow-hidden" style={{ padding: "96px 48px" }}>
      {/* Starburst — top right */}
      <div className="absolute" style={{ top: 40, right: 60 }}>
        <Starburst text={badgeTxt} bg="#b8f5b0" size={170} />
      </div>

      {/* Centered column */}
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <h2 className="text-black font-black mb-8" style={{ fontSize: "clamp(2.8rem,6vw,4.5rem)", letterSpacing: "-0.03em" }}>
          {heading}
        </h2>
        <p className="text-black leading-relaxed mb-6" style={{ fontSize: "clamp(1.15rem,2vw,1.45rem)", lineHeight: 1.65 }}>
          Since day one, Cards Against Humanity has been available as{" "}
          <a href="https://s3.amazonaws.com/cah/CAH_PrintAndPlay.pdf" className="underline" target="_blank" rel="noopener noreferrer">a free download on our website</a>.
          {" "}You can download the PDFs and printing instructions right here—all you need is a printer, scissors, and a prehensile appendage.
        </p>
        <p className="text-black leading-relaxed mb-12" style={{ fontSize: "clamp(1.15rem,2vw,1.45rem)", lineHeight: 1.65 }}>
          Please note: there&apos;s no legal way to use these PDFs to make money, so don&apos;t ask.
        </p>
        <div className="flex items-center gap-5 flex-wrap">
          {/* Red arrow button */}
          <a href="https://s3.amazonaws.com/cah/CAH_PrintAndPlay.pdf" target="_blank" rel="noopener noreferrer"
            className="flex items-center no-underline"
            style={{ textDecoration: "none" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <div style={{
                background: "#e8503a", color: "white", fontWeight: 900, fontSize: "1.05rem",
                padding: "14px 52px 14px 24px", borderRadius: "6px 0 0 6px",
                clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)",
              }}>Download: Click here!</div>
            </div>
          </a>
          {/* Black pill */}
          <a href="https://s3.amazonaws.com/cah/CAH_PrintAndPlay.pdf" target="_blank" rel="noopener noreferrer"
            className="font-black rounded-full hover:bg-gray-900 transition-colors"
            style={{ background: "#000", color: "white", padding: "14px 36px", fontSize: "1.1rem", textDecoration: "none" }}>
            Download Files
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Stuff ─────────────────────────────────────────────────────────────────────
const STUFF = [
  { img: "https://img.cah.io/images/vc07edlh/production/c1f921d8c8fd60969110124ebb20ad5d9878861c-1080x1080.png?auto=format&q=75&w=400", tag: "Read", label: "Black Friday 2018", desc: "Holy fuck we had some deals." },
  { img: "https://img.cah.io/images/vc07edlh/production/31fcc3f68a626462e5707bcc5ce19ee716f2e173-1080x1080.png?auto=format&q=75&w=400", tag: "Read", label: "Science Scholarship", desc: "A full-tuition scholarship for women." },
  { img: "https://img.cah.io/images/vc07edlh/production/1acdec5a623b0761a127ac03492b998879ead549-680x680.png?auto=format&q=75&w=400", tag: "Read", label: "Holiday Hole", desc: "You paid us to dig a big hole in the ground." },
];

function StuffSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(Array.from(ref.current.children),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.4)", scrollTrigger: { trigger: ref.current, start: "top 80%" } }
    );
  }, []);
  return (
    <section className="bg-black" style={{ padding: "80px 48px" }}>
      <div className="flex items-start justify-between mb-10">
        <h2 className="text-white font-black" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem,5vw,3.2rem)", letterSpacing: "-0.02em" }}>Stuff we&apos;ve done.</h2>
        <Starburst text={"More to\ncome!"} bg="#ffffff" size={96} />
      </div>
      <div ref={ref} className="grid grid-cols-3" style={{ gap: 12 }}>
        {STUFF.map((c, i) => (
          <div key={i} className="rounded-2xl overflow-hidden relative cursor-pointer group" style={{ aspectRatio: "1/1" }}>
            <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-white text-xs font-black tracking-[0.2em] uppercase opacity-60">{c.tag}</span>
              <p className="text-white font-black text-xl mt-1" style={{ fontFamily: "Georgia, serif" }}>{c.label}</p>
              <p className="text-white/75 mt-1" style={{ fontSize: "0.95rem" }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Email — centered ──────────────────────────────────────────────────────────
const EMAIL_PHRASES = [
  "we chop up a Picasso,",
  "we buy a private island,",
  "we launch a satellite,",
  "we invent a new color,",
  "we declare war on Denmark,",
  "we eat the last panda,",
];

function EmailSection({ cmsData }: { cmsData: any }) {
  const [email, setEmail] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phraseRef = useRef<HTMLSpanElement>(null);
  const disclaimer = cmsData?.emailSection?.disclaimer || "We'll only email you like twice a year and we won't share your info with anybody else.";

  useEffect(() => {
    const interval = setInterval(() => {
      const el = phraseRef.current; if (!el) return;
      gsap.to(el, { y: -36, opacity: 0, duration: 0.28, ease: "power2.in",
        onComplete: () => {
          setPhraseIdx(p => (p + 1) % EMAIL_PHRASES.length);
          gsap.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2.2)" });
        }
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white" style={{ padding: "96px 48px" }}>
      {/* Centered column */}
      <div className="mx-auto text-center" style={{ maxWidth: 800 }}>
        <h2 className="text-black font-black leading-tight mb-10"
          style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          To find out first when{" "}
          <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", maxWidth: "100%" }}>
            <span ref={phraseRef} style={{ display: "inline-block" }}>{EMAIL_PHRASES[phraseIdx]}</span>
          </span>
          {" "}give us your email:
        </h2>

        {/* Input row */}
        <div className="flex items-center border-2 border-black rounded-xl overflow-hidden" style={{ background: "white", maxWidth: 620, margin: "0 auto" }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address"
            className="flex-1 outline-none bg-white text-black placeholder-gray-400"
            style={{ padding: "20px 24px", fontSize: "1.2rem" }} />
          <button className="flex items-center justify-center rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors flex-shrink-0"
            style={{ width: 48, height: 48, margin: "0 8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <p className="text-gray-500 mt-5" style={{ fontSize: "1rem" }}>{disclaimer}</p>
      </div>
    </section>
  );
}

// ── FAQ — full text, all questions, underlined links ─────────────────────────
const FAQS = [
  { q: "Where can I buy Cards Against Humanity?",
    a: <>Our products are available all over the place, such as our <a href="#" className="underline">webstore</a>, <a href="#" className="underline">Amazon</a>, and at <a href="#" className="underline">all of these retailers</a>.</> },
  { q: "Can I still buy it even if I'm not in America?",
    a: <>We make localized versions of Cards Against Humanity for Canada, Australia, and the UK, plus a whole special &ldquo;International Edition&rdquo; devoid of any exciting country-specific jokes. You can get all of that stuff on our <a href="#" className="underline">webstore</a>.</> },
  { q: "How do I play Cards Against Humanity?",
    a: <>The game is simple. Each round, one player asks a question with a black card, and everyone else answers with their funniest white card. You can read the official rules <a href="#" className="underline">here</a>.</> },
  { q: "Do you sell expansions?",
    a: <>Yes! We sell a handful of <a href="#" className="underline">large boxed expansions</a> and dozens of <a href="#" className="underline">small themed packs</a>, plus a few accessories and <a href="#" className="underline">other bullshit</a>.</> },
  { q: "I bought something from you and now there's a problem.",
    a: <>Take a deep breath. Contemplate the transience of all things. In your mind&apos;s eye, envision the faces of everyone you love and everything you hold dear, and let them go.<br /><br />Then go to our <a href="#" className="underline">webstore FAQ</a>, and if that doesn&apos;t help, send us an email at <a href="mailto:Mail@CardsAgainstHumanity.com" className="underline">Mail@CardsAgainstHumanity.com</a>.</> },
  { q: "Can I sell Cards Against Humanity in my store?",
    a: <>Maybe! Email <a href="mailto:Retail@CardsAgainstHumanity.com" className="underline">Retail@CardsAgainstHumanity.com</a> for more information.</> },
  { q: "Are the expansions available as free downloads like the main game?",
    a: "No. We need to make money somehow." },
  { q: "Do you make a version for families and kids?",
    a: <>Yes, and it&apos;s mostly fart jokes. You can check out Cards Against Humanity: Family Edition <a href="#" className="underline">here</a>.</> },
  { q: "Is Cards Against Humanity the same as when it first came out?",
    a: <>Absolutely. We rewrite huge swaths of the game every year, swapping in spicy hot jokes to replace lame dated references. For example, we recently replaced &ldquo;Hillary Clinton&apos;s emails&rdquo; with &ldquo;A time-traveling Chinese general from the Shang Dynasty.&rdquo; The <a href="#" className="underline">latest edition is 2.3</a>, and it&apos;s almost completely different from the original version of the game.</> },
  { q: "Can I use my Cards Against Humanity cards while playing online?",
    a: "No! We don't want to." },
  { q: "Can I play Cards Against Humanity online?",
    a: <>You can help us test out new cards at the official <a href="#" className="underline">Cards Against Humanity Lab</a>. You can also play online at <a href="#" className="underline">Pretend You&apos;re Xyzzy</a> (though we can&apos;t promise they&apos;ll always have the latest cards and we can&apos;t vouch for their user-generated content).<br /><br />Finally, we highly recommend not playing online and instead playing in the real world so you can look your dad in the eye while saying &ldquo;pixelated bukkake.&rdquo;</> },
  { q: "Can I make my own Cards Against Humanity?",
    a: <>No! We legally own the name &ldquo;Cards Against Humanity&rdquo; as well as the design of our game, the slogan, our logos, and all of our writing. That means you need a license from us to use any of that stuff. Please don&apos;t make anything that confuses people into thinking it&apos;s affiliated with us, or we&apos;ll have to call the lawyers.</> },
  { q: "Do you want my card ideas?",
    a: <>No you don&apos;t. But you can submit your ideas anonymously <a href="#" className="underline">here</a> if you want to. We promise never to look at them.</> },
  { q: "Cards Against Humanity is racist/sexist/homophobic.",
    a: "So are we. It's pretty fucked up!" },
  { q: "Do you need my help making an expansion?",
    a: <>We&apos;re way too busy for bullshit like that. Check out <a href="#" className="underline">Your Dumb Jokes</a>. It contains 50 blank cards that you can fill with your stupid card ideas.<br /><br />Note: this policy does not apply to Hugh Jackman.</> },
  { q: "Can I start my own Cards Against Humanity game night?",
    a: "You don't need the help of Cards Against Humanity LLC to do this." },
  { q: "Do you own land?",
    a: <>We did. It&apos;s in Maine, and you can learn more <a href="#" className="underline">here</a>.</> },
  { q: "Whatever happened to Prongles?",
    a: <>We briefly stopped producing our game to fulfill our lifelong dream of launching <a href="#" className="underline">Original Prongles</a>. But that was a financial catastrophe, so now we&apos;re back to making comedy card games.</> },
  { q: "Whatever happened to the Cards Against Humanity TV show?",
    a: <>Unfortunately, no. That was also a financial catastrophe. But you can check out when we did that <a href="#" className="underline">here</a>.</> },
  { q: "I love you.",
    a: "I love you, too." },
];

function FAQSection({ cmsData }: { cmsData: any }) {
  const [open, setOpen] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  // CMS FAQs override if populated
  const faqs = cmsData?.faq?.length
    ? cmsData.faq.map((f: any) => ({ q: f.question, a: f.answer }))
    : FAQS;

  return (
    <section className="bg-black" style={{ padding: "80px 48px" }}>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-white font-black" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem,5vw,3.2rem)", letterSpacing: "-0.02em" }}>
          Your dumb questions.
        </h2>
        <button onClick={() => setAllOpen(!allOpen)}
          className="bg-white text-black font-black rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-8"
          style={{ padding: "14px 32px", fontSize: "1.05rem" }}>
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        {faqs.map((f: any, i: number) => {
          const isOpen = allOpen || open === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <button className="w-full flex items-center justify-between text-left"
                style={{ padding: "22px 0", gap: 16 }}
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-white font-black" style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", lineHeight: 1.4 }}>{f.q}</span>
                <span className="text-white font-black flex-shrink-0" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="text-gray-300" style={{ fontSize: "1.05rem", lineHeight: 1.7, paddingBottom: 20, maxWidth: 760 }}>
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Footer — pixel perfect ────────────────────────────────────────────────────
function Footer({ cmsData }: { cmsData: any }) {
  const [email, setEmail] = useState("");
  const copyright = cmsData?.footer?.copyright || "©2026 Cards Against Humanity LLC";
  const cols = [
    { heading: "Shop",    links: ["All Products","Main Games","Expansions","Family","Packs","Other Stuff"] },
    { heading: "Info",    links: ["About","Support","Contact","Retailers","Steal","Careers"] },
    { heading: "Find Us", links: ["Facebook","Instagram","TikTok","Bluesky","Amazon","Target"] },
  ];
  return (
    <footer className="bg-white" style={{ padding: "80px 48px 40px" }}>
      {/* Main grid: logo | Shop | Info | Find Us | Email */}
      <div className="grid mb-12" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr", gap: "0 48px" }}>
        {/* Logo */}
        <div>
          <p className="text-black font-black leading-tight" style={{ fontFamily: "Georgia, serif", fontSize: "2rem", letterSpacing: "-0.02em" }}>
            Cards<br />Against<br />Humanity
          </p>
        </div>
        {/* Nav cols */}
        {cols.map(col => (
          <div key={col.heading}>
            <p className="font-black text-black mb-5" style={{ fontSize: "1rem" }}>{col.heading}</p>
            {col.links.map(l => (
              <a key={l} href="#" className="block text-black hover:opacity-60 transition-opacity" style={{ fontSize: "1rem", textDecoration: "underline", marginBottom: 10 }}>{l}</a>
            ))}
          </div>
        ))}
        {/* Email signup */}
        <div>
          <p className="font-black text-black mb-2" style={{ fontSize: "1rem" }}>Email List</p>
          <p className="text-black mb-5" style={{ fontSize: "1rem", lineHeight: 1.5 }}>
            Sign up and we&apos;ll let you know first when we do anything:
          </p>
          <div className="flex items-center border-2 border-black rounded-lg overflow-hidden" style={{ background: "white" }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email Address"
              className="flex-1 outline-none bg-white text-black placeholder-gray-400"
              style={{ padding: "12px 14px", fontSize: "0.95rem" }} />
            <button className="flex items-center justify-center rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors flex-shrink-0"
              style={{ width: 36, height: 36, margin: "0 6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between flex-wrap" style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 24, gap: 16 }}>
        <button className="flex items-center gap-1 border border-black rounded-full font-black text-black hover:bg-black hover:text-white transition-colors"
          style={{ padding: "7px 16px", fontSize: "0.95rem" }}>
          India
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <div className="flex gap-6 flex-wrap">
          {["Terms of Use","Privacy Policy","Submission Terms","Cookie Preferences"].map(l => (
            <a key={l} href="#" className="text-black hover:underline" style={{ fontSize: "0.95rem" }}>{l}</a>
          ))}
        </div>
        <p className="text-black" style={{ fontSize: "0.95rem" }}>{copyright}</p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { cartData, cartCount, cartOpen, checkoutOpen, setCartOpen, setCheckoutOpen, updateCart, clearCart } = useCart();
  const cmsData = useCMSHome();
  const cmsProducts = useCMSProducts();

  return (
    <main>
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cartData={cartData} onCartUpdate={updateCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)} cartData={cartData} onOrderComplete={clearCart} />
      <Hero />
      <AboutSection cmsData={cmsData} />
      <BuySection cmsProducts={cmsProducts} />
      <StealSection cmsData={cmsData} />
      <StuffSection />
      <EmailSection cmsData={cmsData} />
      <FAQSection cmsData={cmsData} />
      <Footer cmsData={cmsData} />
    </main>
  );
}