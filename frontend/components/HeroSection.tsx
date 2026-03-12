"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { CartIcon, ShopMegaMenu, AboutMegaMenu, MenuBackdrop } from "./MegaMenus";

let gsapInstance: any = null;
async function getGSAP() {
  if (gsapInstance) return gsapInstance;
  const mod = await import("gsap");
  gsapInstance = mod.gsap ?? mod.default;
  return gsapInstance;
}

const CARD_SETS = [
  {
    black: "I only saw my father cry twice: once after Mom died, and once after ___________.",
    whites: ["Shitting into a Coinstar machine.", "This boring-ass white bitch from work.", "Teenage pregnancy.", "Police brutality.", "Sewing two hamsters together to make a Double Hamster Supreme.", "Cuddling."],
  },
  {
    black: "A new adventure awaits at Walt Disney's Magical Kingdom of ___________!",
    whites: ["Drug-resistant bacteria.", "The Flintstones.", "Praying the gay away.", "Exactly what you'd expect.", "Giving 110%.", "Tasteful sideboob."],
  },
  {
    black: "Yo, is ___________ racist?",
    whites: ["The Trail of Tears.", "My collection of exotic sex trophies.", "Auschwitz.", "A tiny horse.", "Whatever Morgan Freeman tells me to do.", "Abstinence-only education."],
  },
];

const SPREAD = [
  { x: -370, y: -210, rot: -14 },
  { x:  120, y: -230, rot:   7 },
  { x: -400, y:   40, rot:  11 },
  { x:  340, y:   30, rot:  -8 },
  { x: -260, y:  250, rot: -11 },
  { x:  210, y:  265, rot:   9 },
];

function PlayingCard({ text, black = false }: { text: string; black?: boolean }) {
  return (
    <div
      className={`w-full h-full rounded-2xl p-6 flex flex-col justify-between select-none ${
        black ? "bg-black text-white border-2 border-white/20" : "bg-white text-black"
      }`}
      style={{
        boxShadow: black
          ? "0 12px 60px rgba(255,255,255,0.05),0 4px 12px rgba(0,0,0,0.9)"
          : "0 12px 60px rgba(0,0,0,0.6),0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      <p className="font-black leading-snug" style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.1rem,1.8vw,1.55rem)" }}>
        {text}
      </p>
      <div className={`flex items-center gap-2 opacity-40 ${black ? "text-white" : "text-black"}`}>
        <div className={`rounded-sm border-2 flex-shrink-0 ${black ? "border-white" : "border-black"}`} style={{ width: 22, height: 22 }} />
        <span className="font-black tracking-wide" style={{ fontSize: "0.7rem" }}>Cards Against Humanity</span>
      </div>
    </div>
  );
}

function LaurelBadge({ quote, source }: { quote: string; source: string }) {
  const LeafSVG = () => (
    <svg width="42" height="52" viewBox="0 0 42 52" fill="none">
      {[5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 47].map((cy, i) => (
        <ellipse key={i}
          cx={5 + Math.abs(Math.sin(i * 0.7)) * 4} cy={cy} rx="3.2" ry="4.8" fill="white"
          transform={`rotate(${-25 + i * 5.5} ${5 + Math.abs(Math.sin(i * 0.7)) * 4} ${cy})`}
          opacity={0.85 + (i % 2) * 0.15} />
      ))}
    </svg>
  );
  return (
    <div className="flex items-center gap-3">
      <LeafSVG />
      <div className="text-white text-center">
        <p className="font-black italic leading-none" style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.6rem,3vw,2.4rem)" }}>{quote}</p>
        <p className="font-black tracking-[0.25em] mt-1 uppercase" style={{ fontSize: "0.7rem" }}>{source}</p>
      </div>
      <div style={{ transform: "scaleX(-1)" }}><LeafSVG /></div>
    </div>
  );
}

interface HeroSectionProps {
  quotes: { quote: string; source: string }[];
  cartCount?: number;
  onCartOpen?: () => void;
  cmsHome?: any;
}

export default function HeroSection({ quotes, cartCount = 0, onCartOpen = () => {}, cmsHome }: HeroSectionProps) {
  const blackRef  = useRef<HTMLDivElement>(null);
  const whiteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef  = useRef<HTMLDivElement>(null);
  const badgeRef  = useRef<HTMLDivElement>(null);
  const navRef    = useRef<HTMLDivElement>(null);

  const setIdxRef   = useRef(0);
  const quoteIdxRef = useRef(0);
  const busy  = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [setIdx,   setSetIdx]   = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [shopOpen,  setShopOpen]  = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); };
  const closeAll = () => { setShopOpen(false); setAboutOpen(false); };

  const flyUpNext = useCallback(async () => {
    clearTimer(); busy.current = true;
    const gsap = await getGSAP();
    const all = [blackRef.current, ...whiteRefs.current].filter(Boolean) as HTMLDivElement[];
    gsap.to(all, {
      y: "-130vh", opacity: 0, rotate: (i: number) => (i % 2 ? 18 : -18),
      duration: 0.55, stagger: 0.045, ease: "power2.in",
      onComplete: () => {
        const ni = (setIdxRef.current + 1) % CARD_SETS.length;
        const nq = (quoteIdxRef.current + 1) % quotes.length;
        setIdxRef.current = ni; quoteIdxRef.current = nq;
        setSetIdx(ni); setQuoteIdx(nq); busy.current = false;
      },
    });
  }, [quotes.length]);

  // Black card zooms OUT (starts large = close, shrinks = moves away)
  const doSpread = useCallback(async () => {
    if (!blackRef.current) return;
    const gsap = await getGSAP();
    busy.current = true;
    whiteRefs.current.forEach(el => { if (el) gsap.set(el, { x: 0, y: 0, rotate: 0, scale: 0.6, opacity: 0, zIndex: 1 }); });
    gsap.set(blackRef.current, { x: 0, y: 0, rotate: 0, scale: 1.8, opacity: 1, zIndex: 20 });
    gsap.to(blackRef.current, {
      scale: 1, rotate: -3, duration: 0.75, ease: "power2.out", delay: 0.1,
      onComplete: () => {
        whiteRefs.current.forEach((el, i) => {
          if (!el) return;
          const sp = SPREAD[i];
          gsap.to(el, {
            x: sp.x, y: sp.y, rotate: sp.rot, scale: 1, opacity: 1, zIndex: 5,
            duration: 0.5, delay: i * 0.065, ease: "back.out(1.3)",
            onComplete: i === 5 ? () => { busy.current = false; timer.current = setTimeout(flyUpNext, 4200); } : undefined,
          });
        });
      },
    });
  }, [flyUpNext]);

  useEffect(() => {
    const run = async () => {
      const gsap = await getGSAP();
      gsap.fromTo(titleRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.1 });
      gsap.fromTo(badgeRef.current, { opacity: 0, y: 18 },  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 });
      gsap.fromTo(navRef.current,   { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.2 });
    };
    run();
  }, []);

  useEffect(() => { doSpread(); return clearTimer; }, [setIdx]);

  const onEnter = async (i: number) => {
    if (busy.current) return;
    const el = whiteRefs.current[i]; if (!el) return;
    const gsap = await getGSAP();
    gsap.to(el, { rotate: SPREAD[i].rot + 8, scale: 1.08, zIndex: 30, duration: 0.2, ease: "power2.out" });
  };
  const onLeave = async (i: number) => {
    const el = whiteRefs.current[i]; if (!el) return;
    const gsap = await getGSAP();
    gsap.to(el, { rotate: SPREAD[i].rot, scale: 1, zIndex: 5, duration: 0.2, ease: "power2.out" });
  };
  const onClick = async (i: number) => {
    if (busy.current) return; clearTimer(); busy.current = true;
    const gsap = await getGSAP();
    whiteRefs.current.forEach((el, j) => {
      if (!el) return; const sp = SPREAD[j];
      if (j === i) gsap.to(el, { x: sp.x * 0.35, y: sp.y * 0.35 - 10, scale: 1.15, rotate: sp.rot * 0.3, zIndex: 28, duration: 0.4, ease: "back.out(1.2)" });
      else gsap.to(el, { x: sp.x * 1.7, y: sp.y * 1.6, scale: 0.85, opacity: 0.5, duration: 0.4, ease: "power2.out" });
    });
    gsap.to(blackRef.current, { scale: 1.06, duration: 0.4, ease: "back.out(1.2)" });
    timer.current = setTimeout(() => { busy.current = false; flyUpNext(); }, 2200);
  };

  const set = CARD_SETS[setIdx];
  const chevron = (open: boolean) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginTop: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
  const btnCls = "text-white font-black flex items-center gap-1 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity";
  const btnStyle: React.CSSProperties = { fontSize: "clamp(1.1rem,1.5vw,1.4rem)", fontFamily: "inherit" };

  return (
    <>
      {/* Mega-menu backdrop — above hero, below menus */}
      {(shopOpen || aboutOpen) && <MenuBackdrop onClose={closeAll} />}
      {shopOpen  && <ShopMegaMenu  onClose={closeAll} />}
      {aboutOpen && <AboutMegaMenu onClose={closeAll} cmsHome={cmsHome} />}

      <section className="relative w-full bg-black overflow-hidden" style={{ height: "100svh", minHeight: 620 }}>
        {/* Title — top left */}
        <div ref={titleRef} className="absolute top-8 left-8 z-30" style={{ opacity: 0 }}>
          <h1 className="text-white font-black leading-none" style={{ fontFamily: "Georgia,serif", fontSize: "clamp(2.8rem,6vw,5.5rem)" }}>
            Cards<br />Against<br />Humanity
          </h1>
        </div>

        {/* Top-right nav */}
        <div ref={navRef} className="absolute top-8 right-8 z-[102] flex items-center gap-10" style={{ opacity: 0 }}>
          <button className={btnCls} style={btnStyle}
            onClick={() => { setShopOpen(o => !o); setAboutOpen(false); }}>
            Shop {chevron(shopOpen)}
          </button>
          <button className={btnCls} style={btnStyle}
            onClick={() => { setAboutOpen(o => !o); setShopOpen(false); }}>
            About {chevron(aboutOpen)}
          </button>
          {/* Cart — opens CartDrawer via onCartOpen prop */}
          <button
            className="relative flex items-center hover:opacity-70 transition-opacity"
            aria-label="Open cart"
            onClick={() => { closeAll(); onCartOpen(); }}
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

        {/* Cards stage */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
          <div ref={blackRef} className="absolute" style={{ width: "clamp(240px,22vw,320px)", height: "clamp(310px,28vw,415px)" }}>
            <PlayingCard text={set.black} black />
          </div>
          {set.whites.map((text, i) => (
            <div key={`${setIdx}-${i}`} ref={el => { whiteRefs.current[i] = el; }}
              className="absolute cursor-pointer"
              style={{ width: "clamp(200px,19vw,290px)", height: "clamp(260px,24vw,370px)" }}
              onMouseEnter={() => onEnter(i)} onMouseLeave={() => onLeave(i)} onClick={() => onClick(i)}>
              <PlayingCard text={text} />
            </div>
          ))}
        </div>

        {/* Laurel — bottom left */}
        <div ref={badgeRef} className="absolute bottom-10 left-8 z-30" style={{ opacity: 0 }}>
          <LaurelBadge
            quote={quotes[quoteIdx % quotes.length]?.quote ?? ""}
            source={quotes[quoteIdx % quotes.length]?.source ?? ""}
          />
        </div>
      </section>
    </>
  );
}