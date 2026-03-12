"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

export default function BuySection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      title: "America’s #1 gerbil coffin.",
      image:
        "https://img.cah.io/images/vc07edlh/production/69d14a8c4c8084841b5f3437eb8a06124162dc0d-660x1270.png",
      color: "#00FFFF",
    },
    {
      title: "Play with horrible people.",
      image:
        "https://img.cah.io/images/vc07edlh/production/63e9bcc5935e9cae00a4a9594d3637d89608c443-660x1270.png",
      color: "#FFFF00",
    },
    {
      title: "A terrible party game.",
      image:
        "https://img.cah.io/images/vc07edlh/production/69d14a8c4c8084841b5f3437eb8a06124162dc0d-660x1270.png",
      color: "#FF1493",
    },
    {
      title: "Now with more chaos.",
      image:
        "https://img.cah.io/images/vc07edlh/production/63e9bcc5935e9cae00a4a9594d3637d89608c443-660x1270.png",
      color: "#00FF00",
    },
    {
      title: "Your friends will regret this.",
      image:
        "https://img.cah.io/images/vc07edlh/production/69d14a8c4c8084841b5f3437eb8a06124162dc0d-660x1270.png",
      color: "#FFA500",
    },
  ];

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
          Buy it now
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
                background: card.color,
              }}
            >
              {/* Image */}
              <div
                className="absolute right-0 top-0 h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{ width: "60%" }}
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  width={420}
                  height={420}
                  style={{
                    objectFit: "contain",
                    transform: "rotate(10deg)",
                    filter:
                      "drop-shadow(0 20px 40px rgba(0,0,0,0.35))",
                  }}
                />
              </div>

              {/* Text */}
              <div
                className="absolute bottom-0 left-0"
                style={{ padding: "44px", maxWidth: "60%" }}
              >
                <p
                  className="font-black mb-6"
                  style={{
                    fontSize: "2.6rem",
                    color: "#000",
                    letterSpacing: "-0.03em",
                    lineHeight: "1.1",
                  }}
                >
                  {card.title}
                </p>

                <span
                  className="inline-block font-black"
                  style={{
                    background: "#000",
                    color: "#fff",
                    padding: "14px 28px",
                    borderRadius: 40,
                    fontSize: "16px",
                  }}
                >
                  Buy Now
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}