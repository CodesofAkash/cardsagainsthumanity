"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

type BuyCard = {
  label: string;
  cta: string;
  href?: string;
  backgroundColor: string;
  darkBackground?: boolean;
  productImage?: { url?: string } | null;
};

const FALLBACK_CARDS: BuyCard[] = [
  { label: "America's #1\ngerbil coffin.", cta: "Buy Now",           href: "/products/more-cah", backgroundColor: "#87CEEB" },
  { label: "Play CAH\nwith your kids.",    cta: "Buy Family Edition", href: "#",                  backgroundColor: "#FFE135" },
  { label: "Moooooore\ncards!",            cta: "Buy Expansions",     href: "#",                  backgroundColor: "#FFB3D9" },
  { label: "For whatever\nyou're into.",   cta: "Buy $5 Packs",       href: "#",                  backgroundColor: "#90EE90" },
  { label: "What is\nthis stuff?",         cta: "Find Out",           href: "#",                  backgroundColor: "#111111", darkBackground: true },
];

export default function BuySection({
  heading,
  buyCards,
}: {
  heading?: string;
  buyCards?: BuyCard[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const cards: BuyCard[] = buyCards?.length ? buyCards : FALLBACK_CARDS;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const cardsWidth = track.scrollWidth / 2;

    gsap.to(track, {
      x: -cardsWidth,
      duration: 25,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <section className="bg-black py-24 overflow-hidden">
      {/* Heading */}
      <div className="px-16 mb-12">
        <h2
          className="text-white font-black"
          style={{
            fontSize: "clamp(2.8rem,5vw,4rem)",
            letterSpacing: "-0.03em",
          }}
        >
          {heading || "Buy it now"}
        </h2>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">

        <div
          ref={trackRef}
          className="flex gap-8"
          style={{ width: "max-content", paddingLeft: "64px" }}
        >
          {[...cards, ...cards].map((card, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 group overflow-hidden"
              style={{
                width: 850,
                height: 560,
                borderRadius: 28,
                background: card.backgroundColor,
              }}
            >
              {/* Image */}
              {card.productImage?.url && (
                <div
                  className="absolute right-0 top-0 h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ width: "60%" }}
                >
                  <Image
                    src={card.productImage.url}
                    alt={card.label}
                    width={420}
                    height={420}
                    style={{
                      objectFit: "contain",
                      transform: "rotate(10deg)",
                      filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))",
                    }}
                  />
                </div>
              )}

              {/* Text */}
              <div
                className="absolute bottom-0 left-0"
                style={{ padding: "44px", maxWidth: card.productImage?.url ? "60%" : "80%" }}
              >
                <p
                  className="font-black mb-6"
                  style={{
                    fontSize: "2.6rem",
                    color: card.darkBackground ? "#fff" : "#000",
                    letterSpacing: "-0.03em",
                    lineHeight: "1.1",
                    whiteSpace: "pre-line",
                  }}
                >
                  {card.label}
                </p>

                <a
                  href={card.href || "#"}
                  className="inline-block font-black"
                  style={{
                    background: card.darkBackground ? "#fff" : "#000",
                    color: card.darkBackground ? "#000" : "#fff",
                    padding: "14px 28px",
                    borderRadius: 40,
                    fontSize: "16px",
                    textDecoration: "none",
                  }}
                >
                  {card.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
