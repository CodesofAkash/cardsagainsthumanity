"use client";
import { useEffect, useRef, useState } from "react";

export default function EmailSection({ prefix, suffix, disclaimer, placeholder, phrases }:
  { prefix:string; suffix:string; disclaimer:string; placeholder:string; phrases:{phrase:string}[] }) {
  const [email, setEmail] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phraseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (phrases.length < 2) return;

    const interval = setInterval(async () => {
      const el = phraseRef.current;
      if (!el) return;

      const mod = await import("gsap");
      const gsap = mod.gsap ?? mod.default;

      gsap.to(el, {
        y: -34,
        opacity: 0,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => {
          setPhraseIdx((p) => (p + 1) % phrases.length);
          gsap.fromTo(
            el,
            { y: 34, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.34, ease: "back.out(2)" },
          );
        },
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [phrases]);

  const middlePhrase = phrases[phraseIdx % phrases.length]?.phrase || "we release new stuff,";

  return (
    <section style={{ background: "#ececec", padding: "clamp(54px,7vw,102px) clamp(18px,5vw,64px)" }}>
      <div className="mx-auto" style={{ maxWidth: 1040 }}>
        <h2
          className="text-black mb-10"
          style={{
            fontWeight: 700,
            fontSize: "clamp(1.7rem,4.2vw,3.6rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 980,
          }}
        >
          {prefix}
          <br />
          <span style={{ display: "inline-block", overflow: "hidden", minHeight: "1.2em", verticalAlign: "bottom" }}>
            <span ref={phraseRef} style={{ display: "inline-block" }}>{middlePhrase}</span>
          </span>
          <br />
          {suffix}
        </h2>

        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center border-2 border-black rounded-xl overflow-hidden"
          style={{ background: "#ececec", maxWidth: 1000 }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none text-black placeholder-gray-600"
            style={{
              background: "transparent",
              padding: "clamp(14px,2vw,22px) clamp(16px,2.2vw,28px)",
              fontSize: "clamp(1.2rem,2.4vw,2.4rem)",
            }}
          />
          <button
            aria-label="Submit email"
            className="flex items-center justify-center rounded-full border-2 border-black text-black hover:bg-black hover:text-white transition-colors shrink-0"
            style={{ width: "clamp(46px,4.6vw,64px)", height: "clamp(46px,4.6vw,64px)", margin: "0 clamp(10px,1.1vw,16px)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <p className="text-black mt-5" style={{ fontSize: "clamp(0.95rem,1.4vw,1.6rem)", opacity: 0.9, lineHeight: 1.5 }}>
          {disclaimer}
        </p>
      </div>
    </section>
  );
}