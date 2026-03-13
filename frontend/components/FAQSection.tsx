"use client";
import { useState } from "react";

function lexicalToText(rt: any): string {
  if (!rt) return "";
  if (typeof rt === "string") return rt;
  const root = rt?.root ?? rt;
  function extract(node: any): string {
    if (!node) return "";
    if (node.text) return node.text;
    if (node.children) return node.children.map(extract).join("");
    return "";
  }
  if (root?.children) return root.children.map((n:any) => extract(n)).join("\n");
  return "";
}

export default function FAQSection({ heading, faqs }: { heading: string; faqs: any[] }) {
  const [open, setOpen] = useState<number|null>(null);
  const [allOpen, setAllOpen] = useState(false);

  return (
    <section className="bg-black" style={{ padding:"80px 48px" }}>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-white font-black" style={{ fontFamily:"Georgia, serif", fontSize:"clamp(2rem,5vw,3.2rem)", letterSpacing:"-0.02em" }}>
          {heading}
        </h2>
        <button onClick={()=>setAllOpen(o=>!o)}
          className="bg-white text-black font-black rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-8"
          style={{ padding:"14px 32px", fontSize:"1.05rem" }}>
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.15)" }}>
        {faqs.map((f:any, i:number) => {
          const isOpen = allOpen || open === i;
          const answerText = typeof f.answer === "string" ? f.answer : lexicalToText(f.answer);
          return (
            <div key={f.id??i} style={{ borderBottom:"1px solid rgba(255,255,255,0.25)" }}>
              <button className="w-full flex items-center justify-between text-left" style={{ padding:"22px 0", gap:16 }}
                onClick={()=>setOpen(open===i ? null : i)}>
                <span className="text-white font-black" style={{ fontFamily:"Georgia, serif", fontSize:"clamp(1.3rem,2vw,1.8rem)", lineHeight:1.4 }}>{f.question}</span>
                <span className="text-white font-black flex-shrink-0" style={{ fontSize:"1.8rem", lineHeight:1 }}>{isOpen?"−":"+"}</span>
              </button>
              {isOpen && (
                <div className="text-gray-300" style={{ maxHeight: isOpen ? 500 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(.12,.67,.53,1)" }}>
                  {answerText}
                </div>
              )}
              
            </div>
          );
        })}
      </div>
    </section>
  );
}