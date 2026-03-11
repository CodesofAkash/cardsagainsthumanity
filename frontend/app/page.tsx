"use client";
import { useState, useEffect, useRef } from "react";
import { useCart, getOrCreateCart, medusaHeaders, MEDUSA_URL } from "@/hooks/useCart";
import CartDrawer from "@/components/CartDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({
  cartCount,
  onCartOpen,
}: {
  cartCount: number;
  onCartOpen: () => void;
}) {
  const [shopOpen, setShopOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      setShopOpen(false);
      setAboutOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        scrolled ? "bg-black" : "bg-transparent"
      }`}
    >
      <a
        href="/"
        className="text-white font-black text-base tracking-tight"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Cards Against Humanity
      </a>
      <div className="flex items-center gap-8">
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="text-white font-black text-xl flex items-center gap-1 hover:opacity-70"
            onClick={() => {
              setShopOpen(!shopOpen);
              setAboutOpen(false);
            }}
          >
            Shop <span className="text-sm">▾</span>
          </button>
          {shopOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white text-black rounded-xl shadow-2xl py-3 w-48 flex flex-col">
              {[
                "All Products",
                "Main Games",
                "Expansions",
                "Family",
                "Packs",
                "Other Stuff",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-5 py-2 hover:bg-gray-100 font-black text-sm text-black"
                >
                  {item}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="text-white font-black text-xl flex items-center gap-1 hover:opacity-70"
            onClick={() => {
              setAboutOpen(!aboutOpen);
              setShopOpen(false);
            }}
          >
            About <span className="text-sm">▾</span>
          </button>
          {aboutOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white text-black rounded-xl shadow-2xl py-3 w-40 flex flex-col">
              {[
                "About",
                "Support",
                "Contact",
                "Retailers",
                "Steal",
                "Careers",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-5 py-2 hover:bg-gray-100 font-black text-sm text-black"
                >
                  {item}
                </a>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onCartOpen}
          className="text-white font-black flex items-center gap-1 hover:opacity-70"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="text-base">{cartCount}/</span>
        </button>
      </div>
    </nav>
  );
}

// ── Playing Card ──────────────────────────────────────────────────────────────
function PlayingCard({
  text,
  black = false,
  style = {},
}: {
  text: string;
  black?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`absolute rounded-2xl p-5 shadow-2xl flex flex-col justify-between select-none ${
        black
          ? "bg-black text-white border-2 border-white/30"
          : "bg-white text-black"
      }`}
    >
      <p
        className="font-black text-lg leading-snug"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {text}
      </p>
      <div
        className={`flex items-center gap-2 mt-4 opacity-50 ${
          black ? "text-white" : "text-black"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-sm border-2 ${
            black ? "border-white" : "border-black"
          }`}
        />
        <span className="text-xs font-black tracking-wide">
          Cards Against Humanity
        </span>
      </div>
    </div>
  );
}

// // ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const titleRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: "back.out(1.4)", delay: 0.1 }
      );
    }
    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.5 }
      );
    }
    // Stagger cards in
    gsap.fromTo(
      ".hero-card",
      { y: 30, opacity: 0, rotation: (i) => (i % 2 === 0 ? -5 : 5) },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.4)",
        delay: 0.2,
      }
    );
  }, []);

  const cards = [
    { text: "Drag queens.", black: false, style: { width: 210, height: 270, top: "6%", left: "32%", transform: "rotate(-8deg)" } },
    { text: "Bad music for stupid people.", black: false, style: { width: 230, height: 270, top: "4%", right: "18%", transform: "rotate(3deg)" } },
    { text: "Stalin.", black: false, style: { width: 190, height: 250, top: "34%", left: "28%", transform: "rotate(5deg)" } },
    { text: "Seriously guys, there's nothing funny about", black: true, style: { width: 230, height: 290, top: "26%", left: "44%", transform: "rotate(-3deg)", zIndex: 20 } },
    { text: "A fuck-ton of almonds.", black: false, style: { width: 210, height: 250, top: "28%", right: "4%", transform: "rotate(-5deg)" } },
    { text: "Squirting.", black: false, style: { width: 190, height: 250, top: "60%", left: "30%", transform: "rotate(-6deg)" } },
    { text: "Eating a hard boiled egg out of my husband's asshole.", black: false, style: { width: 230, height: 270, top: "52%", right: "16%", transform: "rotate(4deg)" } },
  ];

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={titleRef} className="absolute top-28 left-8 z-20">
        <h1
          className="text-white font-black leading-none"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
          }}
        >
          Cards
          <br />
          Against
          <br />
          Humanity
        </h1>
      </div>

      {cards.map((c, i) => (
        <div key={i} className="hero-card" style={{ position: "absolute", ...c.style }}>
          <PlayingCard text={c.text} black={c.black} />
        </div>
      ))}

      <div
        ref={quoteRef}
        className="absolute bottom-10 left-8 flex items-center gap-3 z-10"
      >
        <span style={{ fontSize: "2rem" }}>🌿</span>
        <div className="text-white">
          <p
            className="text-2xl font-black italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            &ldquo;Hysterical.&rdquo;
          </p>
          <p className="text-sm font-black tracking-[0.2em]">TIME</p>
        </div>
        <span style={{ fontSize: "2rem" }}>🌿</span>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
const ABOUT_ICONS = [
  { icon: "🚀", top: "8%", left: "3%" },
  { icon: "🧪", top: "20%", left: "88%" },
  { icon: "🌐", top: "45%", left: "2%" },
  { icon: "♟️", top: "70%", left: "90%" },
  { icon: "💾", top: "80%", left: "5%" },
  { icon: "🌿", top: "10%", left: "92%" },
  { icon: "👊", top: "60%", left: "94%" },
  { icon: "🤜", top: "85%", left: "87%" },
];

function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll("p"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section className="relative bg-white py-24 px-8 overflow-hidden min-h-[400px]">
      {ABOUT_ICONS.map(({ icon, top, left }, i) => (
        <span
          key={i}
          className="absolute text-3xl select-none pointer-events-none"
          style={{ top, left }}
        >
          {icon}
        </span>
      ))}
      <div ref={ref} className="relative max-w-2xl mx-auto text-center z-10">
        <p
          className="text-black text-2xl font-black leading-relaxed mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <strong>Cards Against Humanity</strong> is a fill-in-the-blank party
          game that turns your awkward personality and lackluster social skills
          into hours of fun! Wow.
        </p>
        <p
          className="text-black text-2xl leading-relaxed"
          style={{ fontFamily: "Georgia, serif" }}
        >
          The game is simple. Each round, one player asks a question from a
          black card, and everyone else answers with their funniest white card.
        </p>
      </div>
    </section>
  );
}

// ── Buy Section ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { bg: "#000000", textColor: "#ffffff", label: "THE ORIGINAL", lines: ["Cards Against Humanity.", "A party game for horrible people."] },
  { bg: "#f5e642", textColor: "#000000", label: "FAMILY EDITION", lines: ["Play CAH with your kids."] },
  { bg: "#f4b8d4", textColor: "#000000", label: "CULTURE WARS PACK", lines: ["Mooooore cards!"] },
  { bg: "#4169e1", textColor: "#ffffff", label: "EXPANSION PACK", lines: ["The absurd expansion."] },
  { bg: "#e63946", textColor: "#ffffff", label: "RED BOX", lines: ["More terrible cards."] },
];

function BuySection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });

  return (
    <section className="bg-black py-16 overflow-hidden">
      <div className="flex items-center justify-between px-8 mb-8">
        <h2
          ref={headingRef}
          className="text-white font-black"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem,5vw,3.5rem)",
          }}
        >
          Buy the game.
        </h2>
        <div className="flex gap-3">
          {(["←", "→"] as const).map((arrow, i) => (
            <button
              key={i}
              onClick={() => scroll(i === 0 ? "left" : "right")}
              className="w-10 h-10 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors text-lg font-black"
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pl-8"
        style={{ scrollbarWidth: "none" }}
      >
        {PRODUCTS.map((p, i) => (
          <a
            key={i}
            href="/products/more-cah"
            className="flex-shrink-0 flex flex-col justify-end p-8 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ width: 320, height: 480, backgroundColor: p.bg }}
          >
            {p.lines.map((line, j) => (
              <p
                key={j}
                className="font-black text-3xl leading-tight"
                style={{ fontFamily: "Georgia, serif", color: p.textColor }}
              >
                {line}
              </p>
            ))}
            <p
              className="text-xs font-black mt-3 opacity-60"
              style={{ color: p.textColor }}
            >
              {p.label}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Starburst ─────────────────────────────────────────────────────────────────
function Starburst({
  text,
  bg = "#c8f7c5",
  size = 130,
}: {
  text: string;
  bg?: string;
  size?: number;
}) {
  const points = 16,
    cx = size / 2,
    cy = size / 2,
    outerR = size / 2 - 2,
    innerR = size / 2 - 14;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    d +=
      (i === 0 ? "M" : "L") +
      `${(cx + r * Math.cos(angle)).toFixed(2)},${(
        cy +
        r * Math.sin(angle)
      ).toFixed(2)}`;
  }
  d += "Z";
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path d={d} fill={bg} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="text-black font-black text-center leading-tight whitespace-pre-line"
          style={{ fontSize: 11, zIndex: 1 }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

// ── Steal ─────────────────────────────────────────────────────────────────────
function StealSection() {
  return (
    <section className="bg-white py-24 px-8 relative overflow-hidden">
      <div className="absolute top-10 right-16">
        <Starburst text={"Free!\nDownload\nnow!"} bg="#c8f7c5" size={140} />
      </div>
      <div className="max-w-2xl">
        <h2
          className="text-black font-black mb-8"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2.5rem,6vw,4rem)",
          }}
        >
          Steal the game.
        </h2>
        <p
          className="text-black text-2xl leading-relaxed mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Since day one, Cards Against Humanity has been available as{" "}
          <a href="#" className="underline">
            a free download on our website
          </a>
          . You can download the PDFs and printing instructions right
          here—all you need is a printer, scissors, and a prehensile appendage.
        </p>
        <p
          className="text-black text-2xl leading-relaxed"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Please note: there&apos;s no legal way to use these PDFs to make
          money, so don&apos;t ask.
        </p>
      </div>
    </section>
  );
}

// ── Stuff ─────────────────────────────────────────────────────────────────────
const STUFF_CARDS = [
  { bg: "#f5e642", tag: "BLACK FRIDAY 2018", tagBg: "#e63946", title: "Holy fuck we had some deals.", titleColor: "#e63946" },
  { bg: "#ede7f6", tag: "SCIENCE SCHOLARSHIP", tagBg: "#9c27b0", title: "A full-tuition scholarship for women.", titleColor: "#9c27b0" },
  { bg: "#4169e1", tag: "HOLIDAY HOLE", tagBg: "#f5e642", title: "You paid us to dig a big hole in the ground.", titleColor: "#f5e642" },
];

function StuffSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;
    gsap.fromTo(
      cardsRef.current.children,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
      }
    );
  }, []);

  return (
    <section className="bg-black py-20 px-8">
      <div className="flex items-start justify-between mb-10">
        <h2
          className="text-white font-black"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem,5vw,3.5rem)",
          }}
        >
          Stuff we&apos;ve done.
        </h2>
        <div className="flex-shrink-0 ml-4">
          <Starburst text={"More to\ncome!"} bg="#ffffff" size={100} />
        </div>
      </div>
      <div ref={cardsRef} className="grid grid-cols-3 gap-4">
        {STUFF_CARDS.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl p-8 min-h-[420px] flex flex-col"
            style={{ backgroundColor: c.bg }}
          >
            <span
              className="text-white text-xs font-black px-3 py-1 rounded-full self-start"
              style={{ backgroundColor: c.tagBg }}
            >
              {c.tag}
            </span>
            <p
              className="text-4xl font-black mt-6 leading-tight"
              style={{ fontFamily: "Georgia, serif", color: c.titleColor }}
            >
              {c.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Email ─────────────────────────────────────────────────────────────────────
function EmailSection() {
  const [email, setEmail] = useState("");
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-3xl">
        <h2
          className="text-black font-black leading-tight mb-10"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2.5rem,5vw,4rem)",
          }}
        >
          To find out first when we chop up a Picasso, give us your email:
        </h2>
        <div className="flex items-stretch border-2 border-black rounded-xl overflow-hidden">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="flex-1 px-6 py-5 text-xl outline-none bg-white text-black placeholder-gray-400"
          />
          <button className="px-6 bg-white hover:bg-gray-50 border-l-2 border-black text-2xl font-black text-black">
            →
          </button>
        </div>
        <p className="text-gray-500 mt-3 text-sm">
          We&apos;ll only email you like twice a year and we won&apos;t share
          your info with anybody else.
        </p>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Where can I buy Cards Against Humanity?", a: "You can buy it right here on our website, or from retailers like Amazon and Target." },
  { q: "Can I still buy it even if I'm not in America?", a: "Yes! We ship worldwide." },
  { q: "How do I play Cards Against Humanity?", a: "One player asks a question from a black card and everyone else answers with their funniest white card." },
  { q: "Do you sell expansions?", a: "Yes, we have tons of expansions available in our shop." },
  { q: "I bought something from you and now there's a problem.", a: "Please contact our support team and we'll make it right." },
  { q: "Can I sell Cards Against Humanity in my store?", a: "Check our retailers page for information on wholesale." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  return (
    <section className="bg-black py-20 px-8">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-white font-black"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem,5vw,3.5rem)",
          }}
        >
          Your dumb questions.
        </h2>
        <button
          onClick={() => setAllOpen(!allOpen)}
          className="bg-white text-black font-black text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-4"
        >
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>
      <div className="border-t border-white/20">
        {FAQS.map((faq, i) => {
          const isOpen = allOpen || open === i;
          return (
            <div key={i} className="border-b border-white/20">
              <button
                className="w-full flex items-center justify-between py-6 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className="text-white font-black text-xl"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {faq.q}
                </span>
                <span className="text-white font-black text-3xl leading-none flex-shrink-0">
                  {isOpen ? "×" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="text-gray-300 text-lg pb-6 max-w-3xl">{faq.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState("");
  const cols = [
    { heading: "Shop", links: ["All Products", "Main Games", "Expansions", "Family", "Packs", "Other Stuff"] },
    { heading: "Info", links: ["About", "Support", "Contact", "Retailers", "Steal", "Careers"] },
    { heading: "Find Us", links: ["Facebook", "Instagram", "TikTok", "Bluesky", "Amazon", "Target"] },
  ];
  return (
    <footer className="bg-white py-16 px-8">
      <div
        className="grid gap-8 mb-12"
        style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr" }}
      >
        <div>
          <p
            className="text-black font-black text-2xl leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Cards
            <br />
            Against
            <br />
            Humanity
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.heading}>
            <p className="font-black text-black mb-4 text-sm">{col.heading}</p>
            {col.links.map((l) => (
              <a
                key={l}
                href="#"
                className="block text-black underline text-sm mb-2 hover:opacity-60"
              >
                {l}
              </a>
            ))}
          </div>
        ))}
        <div>
          <p className="font-black text-black mb-2 text-sm">Email List</p>
          <p className="text-sm text-black mb-4">
            Sign up and we&apos;ll let you know first when we do anything:
          </p>
          <div className="flex items-stretch border-2 border-black rounded-lg overflow-hidden">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="flex-1 px-3 py-3 text-sm outline-none text-black"
            />
            <button className="px-3 border-l-2 border-black hover:bg-gray-100 text-lg text-black font-black">
              →
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-black/10 pt-6 flex-wrap gap-4">
        <button className="border border-black rounded-full px-4 py-1 text-sm font-black text-black hover:bg-black hover:text-white transition-colors">
          India ›
        </button>
        <div className="flex gap-6 text-sm text-black flex-wrap">
          {[
            "Terms of Use",
            "Privacy Policy",
            "Submission Terms",
            "Cookie Preferences",
          ].map((l) => (
            <a key={l} href="#" className="hover:underline text-black">
              {l}
            </a>
          ))}
        </div>
        <p className="text-sm text-black">
          ©2026 Cards Against Humanity LLC
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const {
    cartData,
    cartCount,
    cartOpen,
    checkoutOpen,
    setCartOpen,
    setCheckoutOpen,
    updateCart,
    clearCart,
  } = useCart();

  return (
    <main>
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartData={cartData}
        onCartUpdate={updateCart}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartData={cartData}
        onOrderComplete={clearCart}
      />

      <Hero />
      <AboutSection />
      <BuySection />
      <StealSection />
      <StuffSection />
      <EmailSection />
      <FAQSection />
      <Footer />
    </main>
  );
}