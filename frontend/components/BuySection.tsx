"use client";
import { useRef } from "react";
import Image from "next/image";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";
function cmsImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${CMS_URL}${url}`;
}

export default function BuySection({ heading, buyCards }: { heading: string; buyCards: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-black overflow-hidden" style={{ paddingTop:56, paddingBottom:56 }}>
      <div className="flex items-center justify-between mb-6" style={{ paddingLeft:48, paddingRight:48 }}>
        <h2 className="text-white font-black" style={{ fontSize:"clamp(2.5rem,5vw,4rem)", letterSpacing:"-0.03em" }}>{heading}</h2>
        <div className="flex gap-3">
          {[false,true].map((isNext,i)=>(
            <button key={i} onClick={()=>scrollRef.current?.scrollBy({ left:isNext?390:-390, behavior:"smooth" })}
              className="flex items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-colors flex-shrink-0"
              style={{ width:44, height:44 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isNext?<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto" style={{ paddingLeft:48, paddingRight:48, gap:10, scrollbarWidth:"none" }}>
        {buyCards.map((card:any, i:number)=>{
          const bg = card.backgroundColor || "#87CEEB";
          const dark = card.darkBackground ?? false;
          const textColor = dark ? "#fff" : "#000";
          const btnBg = dark ? "white" : "black";
          const btnColor = dark ? "black" : "white";
          const imgUrl = card.productImage?.url ? cmsImg(card.productImage.url) : null;
          return (
            <a key={card.id??i} href={card.href||"#"} className="flex-shrink-0 relative overflow-hidden group"
              style={{ width:360, height:520, background:bg, borderRadius:20, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"28px 32px 32px", textDecoration:"none" }}>
              {imgUrl && (
                <div className="absolute inset-0 flex items-center justify-end pointer-events-none" style={{ paddingRight:20, paddingTop:20 }}>
                  <Image src={imgUrl} alt={card.label||""} width={270} height={300}
                    style={{ maxHeight:300, maxWidth:"75%", objectFit:"contain", transform:"rotate(7deg) translateY(-8px)", filter:"drop-shadow(0 20px 40px rgba(0,0,0,0.35))" }}
                    loading="lazy" />
                </div>
              )}
              <div style={{ position:"relative", zIndex:2 }}>
                <p className="font-black leading-tight mb-5 whitespace-pre-line"
                  style={{ fontSize:"clamp(1.7rem,2.8vw,2.1rem)", color:textColor, letterSpacing:"-0.025em" }}>
                  {card.label}
                </p>
                <span className="inline-block font-black rounded-full transition-all group-hover:scale-105"
                  style={{ fontSize:"1rem", padding:"13px 28px", background:btnBg, color:btnColor }}>
                  {card.cta}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}