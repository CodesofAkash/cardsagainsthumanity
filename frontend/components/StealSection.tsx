"use client";

import { useState } from "react";

type CmsHome = {
  stealSection?: {
    heading?: string;
    body?: string;
    body2?: string;
    downloadUrl?: string;
  };
};

const STEAL_BADGE_SRC = "https://www.cardsagainsthumanity.com/images/steal-badge.svg";
const STEAL_ARROW_SRC = "https://www.cardsagainsthumanity.com/images/steal-arrow.svg";
const MAIN_GAME_PDF = "https://cdn.sanity.io/files/vc07edlh/production/024751665e12163130085836650f4f7387e2de0a.pdf";

export default function StealSection({ cmsHome }: { cmsHome: CmsHome | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const heading = cmsHome?.stealSection?.heading || "Steal the game.";
  const body =
    cmsHome?.stealSection?.body ||
    "Since day one, Cards Against Humanity has been available as a free download on our website. You can download the PDFs and printing instructions right here-all you need is a printer, scissors, and a prehensile appendage.";
  const body2 =
    cmsHome?.stealSection?.body2 ||
    "Please note: there's no legal way to use these PDFs to make money, so don't ask.";

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: "#ececec",
          padding: "clamp(64px,7vw,104px) clamp(28px,5vw,64px)",
        }}
      >
        <div
          className="absolute steal-badge-wrap"
          style={{ top: 30, right: "clamp(24px,4.5vw,76px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STEAL_BADGE_SRC}
            alt="Free download now"
            width={152}
            height={152}
            className="steal-badge"
            loading="lazy"
            style={{ display: "block" }}
          />
        </div>

        <div className="mx-auto" style={{ maxWidth: 1020 }}>
          <h2
            className="text-black mb-8"
            style={{
              fontWeight: 800,
              fontSize: "clamp(3rem,6.1vw,5.15rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.03,
            }}
          >
            {heading}
          </h2>

          <p
            className="text-black mb-6"
            style={{
              fontSize: "clamp(1.8rem,2.9vw,2.45rem)",
              lineHeight: 1.28,
              maxWidth: 980,
            }}
          >
            {body}
          </p>

          <p
            className="text-black mb-12"
            style={{
              fontSize: "clamp(1.8rem,2.9vw,2.45rem)",
              lineHeight: 1.28,
              maxWidth: 980,
            }}
          >
            {body2}
          </p>

          <div className="flex items-center gap-7 flex-wrap">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Open download options"
              style={{
                padding: 0,
                margin: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STEAL_ARROW_SRC}
                alt="Download click here"
                width={290}
                height={78}
                className="steal-arrow"
                loading="lazy"
                style={{ display: "block" }}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="font-black rounded-full"
              style={{
                background: "#000",
                color: "#fff",
                padding: "18px 56px",
                fontSize: "clamp(1.15rem,1.4vw,1.65rem)",
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Download Files
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="steal-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="steal-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="steal-modal-topbar">
              <button
                type="button"
                aria-label="Close download modal"
                className="steal-close"
                onClick={() => setIsModalOpen(false)}
              >
                x
              </button>
            </div>

            <div className="steal-modal-content">
              <div className="steal-modal-grid">
                <div>
                  <h3>U.S. Edition:</h3>
                  <a href={MAIN_GAME_PDF} target="_blank" rel="noopener noreferrer">
                    Main Game
                  </a>
                  <p>Main Game</p>
                  <p>Family Edition</p>
                  <p>Family Edition</p>
                </div>

                <div>
                  <h3>International Editions:</h3>
                  <p>U.K. Edition</p>
                  <p>Canadian Edition</p>
                  <p>Australian Edition</p>
                  <p>INTL Edition</p>
                </div>
              </div>

              <hr />

              <div>
                <h3>Unofficial Fan Translations:</h3>
                <div className="steal-modal-langs">
                  <div>
                    <p>Dutch by Hannah Mathon</p>
                    <p>Portuguese (BZ) by Matheus Sanches</p>
                    <p>Turkish by Mertka</p>
                    <p>Romanian by Andrei Dumitras</p>
                    <p>Hebrew by Dar</p>
                  </div>
                  <div>
                    <p>Galician by Maruxa do Recho</p>
                    <p>Portuguese (PT) by Marta Mamede</p>
                    <p>Catalan by Victor</p>
                    <p>Czech by Jakub.</p>
                    <p>German by Jonas</p>
                  </div>
                  <div>
                    <p>Italian by Edoardo Zanella</p>
                    <p>Spanish (AR) by @fieritacatalano</p>
                    <p>Greek by Man0s Tavernarakis</p>
                    <p>Spanish (Spain) by Lucas</p>
                    <p>Russian by Roman M.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .steal-badge {
          animation: badgeWobble 3.4s ease-in-out infinite;
          transform-origin: center;
        }

        .steal-arrow {
          animation: arrowNudge 0.6s ease-in-out infinite;
          transform-origin: center;
        }

        .steal-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 220ms ease-out;
        }

        .steal-modal-panel {
          width: min(1120px, 95vw);
          max-height: 90vh;
          overflow: auto;
          background: #ececec;
          border: 3px solid #222;
          border-radius: 24px;
          transform-origin: center;
          animation: modalZoom 260ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }

        .steal-modal-topbar {
          height: 50px;
          background: #f6696d;
          border-bottom: 3px solid #222;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .steal-close {
          position: absolute;
          right: 10px;
          top: 8px;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 3px solid #222;
          background: #fff;
          color: #222;
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
          cursor: pointer;
        }

        .steal-modal-content {
          padding: 36px 58px 44px;
          color: #111;
        }

        .steal-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 24px;
        }

        .steal-modal-content h3 {
          margin: 0 0 12px;
          color: #f35f63;
          font-weight: 900;
          font-size: 42px;
          line-height: 1.1;
        }

        .steal-modal-content a,
        .steal-modal-content p {
          margin: 0 0 10px;
          font-size: clamp(24px, 2.2vw, 44px);
          font-weight: 700;
          line-height: 1.06;
          color: #111;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }

        .steal-modal-content a {
          display: inline-block;
          font-weight: 900;
          cursor: pointer;
        }

        .steal-modal-content p {
          text-decoration-thickness: 1.5px;
          font-weight: 700;
        }

        .steal-modal-content hr {
          border: none;
          border-top: 3px solid #f35f63;
          margin: 14px 0 18px;
        }

        .steal-modal-langs {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px 26px;
        }

        .steal-modal-langs p {
          font-size: clamp(14px, 1.35vw, 22px);
          line-height: 1.2;
          margin-bottom: 10px;
          text-decoration-thickness: 1.2px;
        }

        @media (max-width: 900px) {
          .steal-modal-content {
            padding: 26px 20px 28px;
          }

          .steal-modal-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .steal-modal-langs {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }

        @keyframes badgeWobble {
          0% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
          100% {
            transform: rotate(-8deg);
          }
        }

        @keyframes arrowNudge {
          0% {
            transform: translateX(-6px);
          }
          50% {
            transform: translateX(6px);
          }
          100% {
            transform: translateX(-6px);
          }
        }

        @keyframes modalZoom {
          0% {
            opacity: 0;
            transform: scale(0.84);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .steal-badge,
          .steal-arrow,
          .steal-modal-overlay,
          .steal-modal-panel {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
