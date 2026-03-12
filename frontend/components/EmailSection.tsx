"use client";
import { useState, useEffect, useRef } from "react";

export default function EmailSection({ prefix, suffix, disclaimer, placeholder, phrases }:
  { prefix:string; suffix:string; disclaimer:string; placeholder:string; phrases:{phrase:string}[] }) {
  const [email, setEmail] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phraseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (phrases.length < 2) return;
    const interval = setInterval(async () => {
      const el = phraseRef.current; if (!el) return;
      // Lazy load gsap only when animation actually runs
      const mod = await import("gsap");
      const gsap = mod.gsap ?? mod.default;
      gsap.to(el, { y:-36, opacity:0, duration:0.28, ease:"power2.in",
        onComplete: () => {
          setPhraseIdx(p => (p+1) % phrases.length);
          gsap.fromTo(el, { y:36, opacity:0 }, { y:0, opacity:1, duration:0.4, ease:"back.out(2.2)" });
        }
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="bg-white" style={{ padding:"96px 48px" }}>
      <div className="mx-auto text-center" style={{ maxWidth:800 }}>
        <h2 className="text-black font-black leading-tight mb-10"
          style={{ fontSize:"clamp(2.2rem,4.5vw,3.5rem)", letterSpacing:"-0.025em", lineHeight:1.2 }}>
          {prefix}{" "}
          <span style={{ display:"inline-block", overflow:"hidden", verticalAlign:"bottom" }}>
            <span ref={phraseRef} style={{ display:"inline-block" }}>{phrases[phraseIdx%phrases.length]?.phrase}</span>
          </span>
          {" "}{suffix}
        </h2>
        <div className="flex items-center border-2 border-black rounded-xl overflow-hidden" style={{ background:"white", maxWidth:620, margin:"0 auto" }}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={placeholder}
            className="flex-1 outline-none bg-white text-black placeholder-gray-400"
            style={{ padding:"20px 24px", fontSize:"1.2rem" }} />
          <button className="flex items-center justify-center rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors flex-shrink-0"
            style={{ width:48, height:48, margin:"0 8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
        <p className="text-gray-500 mt-5" style={{ fontSize:"1rem" }}>{disclaimer}</p>
      </div>
    </section>
  );
}