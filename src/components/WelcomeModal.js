import { useState } from "react";
import { COFFEEHOUSE_LINE_ART_URL, COFFEEHOUSE_SPLASH_LEGACY_URL } from "../constants/publicAssets";

const BURGUNDY = "#4a0a0a";
const GOLD = "#d4a93a";
const CREAM = "#f5ecd9";

/** Corner cut length for octagonal-ish clip (ties to “7 spring” / stats chip vibe) */
const CORNER = "20px";

const hb = {
  fontFamily: "'Noto Sans Hebrew','Segoe UI',Helvetica,Arial,sans-serif",
  fontWeight: 700,
  color: GOLD,
  fontStyle: "normal",
};

export default function WelcomeModal({ onClose }) {
  const [hoverCta, setHoverCta] = useState(false);
  const [heroSrc, setHeroSrc] = useState(COFFEEHOUSE_LINE_ART_URL);

  const notchedPolygon = [
    `${CORNER} 0`,
    `calc(100% - ${CORNER}) 0`,
    `100% ${CORNER}`,
    `100% calc(100% - ${CORNER})`,
    `calc(100% - ${CORNER}) 100%`,
    `${CORNER} 100%`,
    `0 calc(100% - ${CORNER})`,
    `0 ${CORNER}`,
  ].join(", ");

  return (
    <div
      className="welcome-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        WebkitTapHighlightColor: "transparent",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        height: "100dvh",
      }}
    >
      <div
        className="welcome-shell"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          className="welcome-frame"
          style={{
            clipPath: `polygon(${notchedPolygon})`,
            WebkitClipPath: `polygon(${notchedPolygon})`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="welcome-inner">
            <img
              className="welcome-hero-img"
              src={heroSrc}
              alt=""
              width={1024}
              height={683}
              decoding="async"
              onError={() => setHeroSrc(COFFEEHOUSE_SPLASH_LEGACY_URL)}
            />

            <div style={{ textAlign: "center", marginBottom: 9 }}>
              <div
                id="welcome-title"
                style={{
                  fontSize: "clamp(30px, 6.5vw, 40px)",
                  fontWeight: 900,
                  letterSpacing: 5,
                  color: GOLD,
                  fontFamily: "Georgia,serif",
                  margin: 0,
                }}
              >
                SHESH BESH
              </div>
              <div
                style={{
                  width: 60,
                  height: 1.5,
                  background: `linear-gradient(90deg,transparent,${GOLD},transparent)`,
                  margin: "11px auto 0",
                }}
              />
            </div>

            <p
              style={{
                margin: "0 0 15px",
                fontSize: 14,
                lineHeight: 1.85,
                textAlign: "center",
                fontFamily: "Georgia,serif",
                color: "rgba(245, 236, 217, 0.85)",
              }}
            >
              For over two thousand years, this game outlasted the Roman and Byzantine empires, flourished across the{" "}
              <span style={{ color: GOLD, fontWeight: 700 }}>Ottoman</span> world, reached France by the 11th century,
              and echoed through the coffeehouses of{" "}
              <span style={{ color: GOLD, fontWeight: 700 }}>Istanbul</span>,{" "}
              <span style={{ color: GOLD, fontWeight: 700 }}>Tehran</span>,{" "}
              <span style={{ color: GOLD, fontWeight: 700 }}>Tel Aviv</span>,{" "}
              <span style={{ color: GOLD, fontWeight: 700 }}>Beirut</span>, and beyond.
            </p>

            <div
              style={{
                border: `1px solid rgba(212, 169, 58, 0.5)`,
                padding: "11px 12px",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  color: CREAM,
                  opacity: 0.88,
                  fontSize: 13,
                  lineHeight: 1.85,
                  margin: 0,
                  fontFamily: "Georgia,serif",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                The names tell the story — <span style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>Shesh</span> is Six in Persian,{" "}
                <span style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>Besh</span> is Five in Turkish, and Israelis have played{" "}
                <span dir="rtl" lang="he" style={hb}>
                  שש בש
                </span>{" "}
                in cafés from <span style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>Jaffa</span> to{" "}
                <span style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>Jerusalem</span>. A game born at the crossroads of empires, carried west to
                medieval France, belonging to everyone who played it.
              </p>
            </div>

            <div
              style={{
                color: CREAM,
                opacity: 0.9,
                fontSize: "clamp(11px, 2.85vw, 12.5px)",
                lineHeight: 1.75,
                textAlign: "center",
                marginBottom: 20,
                fontFamily: "Georgia,serif",
                letterSpacing: 0.2,
              }}
            >
              Every dice roll has a name.
              <br />
              Every position has a lesson.
              <br />
              Master the ancient game — one puzzle at a time.
            </div>

            <div className="welcome-cta-wrap">
              <button
                type="button"
                onClick={onClose}
                className="welcome-cta-btn"
                onMouseEnter={() => setHoverCta(true)}
                onMouseLeave={() => setHoverCta(false)}
                onFocus={() => setHoverCta(true)}
                onBlur={() => setHoverCta(false)}
                style={{
                  width: "100%",
                  maxWidth: 340,
                  padding: "14px 20px",
                  background: GOLD,
                  border: `1px solid rgba(212, 169, 58, 0.65)`,
                  borderRadius: 10,
                  cursor: "pointer",
                  color: BURGUNDY,
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: 3,
                  fontFamily: "Georgia,serif",
                  boxShadow: hoverCta ? "0 8px 28px rgba(212, 169, 58, 0.35)" : "0 6px 22px rgba(212, 169, 58, 0.28)",
                  filter: hoverCta ? "brightness(1.05)" : "none",
                  transition: "filter 0.2s ease, box-shadow 0.2s ease",
                  marginBottom: 16,
                }}
              >
                YALLA — LET&apos;S PLAY
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes welcomeReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .welcome-root {
          background-color: ${BURGUNDY};
          background-image:
            radial-gradient(ellipse 92% 78% at 50% 28%, rgba(90, 26, 26, 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 110% 90% at 50% 100%, rgba(32, 4, 4, 0.42) 0%, transparent 55%),
            repeating-linear-gradient(35deg, rgba(212, 169, 58, 0.025) 0 1px, transparent 1px 6px),
            linear-gradient(168deg, #521212 0%, ${BURGUNDY} 52%, #3a0707 100%);
          overflow-x: hidden;
        }

        .welcome-shell {
          box-sizing: border-box;
          width: 100%;
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding-top: calc(14px + env(safe-area-inset-top, 0px));
          padding-right: calc(16px + env(safe-area-inset-right, 0px));
          padding-bottom: 12px;
          padding-left: calc(16px + env(safe-area-inset-left, 0px));
        }

        .welcome-frame {
          flex: 0 0 auto;
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid ${GOLD};
          background: transparent;
          animation: welcomeReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .welcome-inner {
          box-sizing: border-box;
          width: 100%;
          max-width: 600px;
          margin-inline: auto;
          padding-top: clamp(16px, 3.6vw, 27px);
          padding-left: clamp(16px, 3.75vw, 26px);
          padding-right: clamp(16px, 3.75vw, 26px);
          padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
        }

        .welcome-hero-img {
          display: block;
          width: min(226px, 58vw);
          height: auto;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: clamp(10px, 3vw, 15px);
        }

        .welcome-cta-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        @media (min-width: 900px) {
          .welcome-shell {
            padding-top: calc(28px + env(safe-area-inset-top, 0px));
            padding-bottom: 24px;
            padding-left: calc(32px + env(safe-area-inset-left, 0px));
            padding-right: calc(32px + env(safe-area-inset-right, 0px));
          }
          .welcome-inner {
            padding-top: clamp(22px, 4vw, 34px);
            padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
          }
        }

        @media (min-width: 768px) and (max-width: 899.98px) {
          .welcome-shell {
            padding-top: calc(24px + env(safe-area-inset-top, 0px));
            padding-right: calc(28px + env(safe-area-inset-right, 0px));
            padding-bottom: 16px;
            padding-left: calc(28px + env(safe-area-inset-left, 0px));
          }
        }
      `}</style>
    </div>
  );
}
