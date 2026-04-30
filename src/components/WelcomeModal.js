import { useState } from "react";

const SPLASH_ART = `${process.env.PUBLIC_URL ?? ""}/images/coffeehouse-splash.png`;
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
          <div className="welcome-scroll">
            <div className="welcome-inner">
              <img
                className="welcome-hero-img"
                src={SPLASH_ART}
                alt=""
                width={1024}
                height={683}
                decoding="async"
              />

              <div style={{ textAlign: "center", marginBottom: 12 }}>
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
                    margin: "14px auto 0",
                  }}
                />
              </div>

              <p
                style={{
                  margin: "0 0 20px",
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
                <span style={{ color: GOLD, fontWeight: 700 }}>Istanbul</span>, <span style={{ color: GOLD, fontWeight: 700 }}>Tehran</span>,{" "}
                <span style={{ color: GOLD, fontWeight: 700 }}>Tel Aviv</span>, <span style={{ color: GOLD, fontWeight: 700 }}>Beirut</span>, and beyond.
              </p>

              <div
                style={{
                  border: `1px solid rgba(212, 169, 58, 0.5)`,
                  padding: "16px 14px",
                  marginBottom: 22,
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
                  marginBottom: 26,
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
                    padding: "15px 20px",
                    background: GOLD,
                    border: `1px solid rgba(212, 169, 58, 0.65)`,
                    borderRadius: 10,
                    cursor: "pointer",
                    color: BURGUNDY,
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: 3,
                    fontFamily: "Georgia,serif",
                    boxShadow: hoverCta
                      ? "0 8px 28px rgba(212, 169, 58, 0.35)"
                      : "0 6px 22px rgba(212, 169, 58, 0.28)",
                    filter: hoverCta ? "brightness(1.05)" : "none",
                    transition: "filter 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  YALLA — LET&apos;S PLAY
                </button>
              </div>
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
        }

        .welcome-shell {
          box-sizing: border-box;
          width: 100%;
          min-height: 100dvh;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding-top: calc(16px + env(safe-area-inset-top, 0px));
          padding-right: calc(16px + env(safe-area-inset-right, 0px));
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          padding-left: calc(16px + env(safe-area-inset-left, 0px));
        }

        .welcome-frame {
          flex: 1 1 auto;
          min-height: 0;
          box-sizing: border-box;
          border: 1.5px solid ${GOLD};
          background: transparent;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: welcomeReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .welcome-scroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          display: flex;
          justify-content: center;
          overscroll-behavior: contain;
        }

        /* Desktop: vertically center column in scroll viewport */
        @media (min-width: 900px) {
          .welcome-scroll {
            align-items: center;
            padding-block: clamp(28px, 5vh, 56px);
          }
        }

        @media (max-width: 899.98px) {
          .welcome-scroll {
            align-items: flex-start;
          }
        }

        .welcome-inner {
          box-sizing: border-box;
          width: 100%;
          max-width: 600px;
          padding: clamp(22px, 5vw, 36px) max(22px, 5vw);
        }

        .welcome-hero-img {
          display: block;
          width: min(280px, 70vw);
          height: auto;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: clamp(14px, 4vw, 22px);
          background-color: ${BURGUNDY};
        }

        .welcome-cta-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        @media (min-width: 768px) {
          .welcome-shell {
            padding-top: calc(32px + env(safe-area-inset-top, 0px));
            padding-right: calc(32px + env(safe-area-inset-right, 0px));
            padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
            padding-left: calc(32px + env(safe-area-inset-left, 0px));
          }
        }
      `}</style>
    </div>
  );
}
