import { useEffect, useState } from "react";
import { C } from "../constants/palette";
import WelcomeModal from "../components/WelcomeModal";
import IQGauge from "../components/IQGauge";
import { loadProgress } from "../storage/progress";
import { COFFEEHOUSE_LINE_ART_URL, COFFEEHOUSE_SPLASH_LEGACY_URL } from "../constants/publicAssets";

const NOTCH = 14;

export default function HomeScreen({
  showWelcome,
  setShowWelcome,
  iq,
  streak,
  accuracy,
  totalAnswered,
  setScreen,
  setPuzzleIdx,
  onHydrateProgress,
}) {
  const [heroSrc, setHeroSrc] = useState(COFFEEHOUSE_LINE_ART_URL);

  useEffect(() => {
    if (typeof onHydrateProgress !== "function") return;
    onHydrateProgress(loadProgress());
  }, [onHydrateProgress]);

  const statClip = [
    `${NOTCH}px 0%`,
    `calc(100% - ${NOTCH}px) 0%`,
    `100% ${NOTCH}px`,
    `100% calc(100% - ${NOTCH}px)`,
    `calc(100% - ${NOTCH}px) 100%`,
    `${NOTCH}px 100%`,
    `0 calc(100% - ${NOTCH}px)`,
    `0 ${NOTCH}px`,
  ].join(", ");

  const rankNum = Math.max(1, Math.round((1200 - iq) * 0.8) + 1);

  const pageBg = `linear-gradient(165deg,${C.bgSecondary} 0%,${C.bgDeep} 45%,${C.bgPrimary} 100%)`;

  const statNumStyle = {
    fontWeight: 800,
    fontSize: "clamp(17px, 4.9vw, 22px)",
    lineHeight: 1.1,
  };
  const statCapStyle = {
    color: C.textSoft,
    fontSize: "clamp(8px, 2.1vw, 10px)",
    letterSpacing: 1,
    marginTop: 2,
  };

  return (
    <div
      className="home-screen-root"
      style={{
        minHeight: "100dvh",
        height: "100dvh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia,serif",
        boxSizing: "border-box",
      }}
    >
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      <div
        className="home-top-safe"
        style={{
          flexShrink: 0,
          height: "env(safe-area-inset-top, 0px)",
          minHeight: 0,
        }}
        aria-hidden
      />

      <div
        className="home-scroll-column"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          boxSizing: "border-box",
          paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
          paddingTop: 4,
          paddingBottom: "max(24px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="home-inner">
          <div className="home-hero-block">
            <img
              className="home-hero-img"
              src={heroSrc}
              alt=""
              width={1024}
              height={683}
              decoding="async"
              draggable={false}
              onError={() => setHeroSrc(COFFEEHOUSE_SPLASH_LEGACY_URL)}
              style={{ display: "block", height: "auto" }}
            />
            <div
              style={{
                textAlign: "center",
                fontSize: 38,
                fontWeight: 900,
                letterSpacing: 4,
                color: C.gold,
                fontFamily: "Georgia,serif",
                lineHeight: 1.1,
              }}
            >
              SHESH BESH
            </div>
          </div>

          <div className="home-stats-shell">
            <div className="home-stats-panel home-stats-panel--wide">
              <IQGauge iq={iq} />
              <div className="home-stats-vsep" aria-hidden />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ ...statNumStyle, color: C.gold }}>
                    {streak}
                    🔥
                  </div>
                  <div style={statCapStyle}>STREAK</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ ...statNumStyle, color: C.blue }}>{accuracy}%</div>
                  <div style={statCapStyle}>ACCURACY</div>
                </div>
              </div>
              <div className="home-stats-vsep" aria-hidden />
              <div style={{ textAlign: "center", minWidth: 0 }}>
                <div style={{ ...statNumStyle, color: C.text }}>{totalAnswered}</div>
                <div style={statCapStyle}>PUZZLES</div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ color: C.textMid, fontSize: "clamp(12px, 3.6vw, 14px)", fontWeight: 700 }}>#{rankNum}</div>
                  <div style={statCapStyle}>GLOBAL RANK</div>
                </div>
              </div>
            </div>

            <div className="home-stats-panel home-stats-panel--narrow">
              <div className="home-stats-row-iq">
                <IQGauge iq={iq} variant="compact" />
              </div>
              <div className="home-stats-row-metrics">
                <div style={{ textAlign: "center", minWidth: 0 }}>
                  <div style={{ ...statNumStyle, color: C.gold }}>
                    {streak}
                    🔥
                  </div>
                  <div style={statCapStyle}>STREAK</div>
                </div>
                <div style={{ textAlign: "center", minWidth: 0 }}>
                  <div style={{ ...statNumStyle, color: C.blue }}>{accuracy}%</div>
                  <div style={statCapStyle}>ACCURACY</div>
                </div>
                <div style={{ textAlign: "center", minWidth: 0 }}>
                  <div style={{ ...statNumStyle, color: C.text }}>{totalAnswered}</div>
                  <div style={statCapStyle}>PUZZLES</div>
                  <div style={{ marginTop: 4 }}>
                    <div style={{ color: C.textMid, fontSize: 12, fontWeight: 700 }}>#{rankNum}</div>
                    <div style={{ ...statCapStyle, marginTop: 1 }}>GLOBAL RANK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-footer-cluster">
            <div className="home-buttons-stack">
              <button
                type="button"
                onClick={() => {
                  setPuzzleIdx((prev) => prev + 1);
                  setScreen("puzzle");
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: C.goldBtn,
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  color: C.textOnDark,
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: 3,
                  boxShadow: `0 6px 22px ${C.goldGlow}`,
                  fontFamily: "Georgia,serif",
                }}
              >
                PLAY MIXED PUZZLES
              </button>
              <button
                type="button"
                onClick={() => setScreen("categories")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: C.accentWash,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  color: C.textOnDark,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  fontFamily: "Georgia,serif",
                }}
              >
                CATEGORY PERFORMANCE
              </button>
              <button
                type="button"
                onClick={() => setScreen("learn")}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: C.accentWash,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  color: C.textOnDark,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 2,
                  fontFamily: "Georgia,serif",
                }}
              >
                DICE NAMES GUIDE 🎲
              </button>
            </div>

            <div className="home-die-footer">
              <span style={{ fontSize: 52, lineHeight: 1, display: "inline-block" }} aria-hidden>
                🎲
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .home-inner {
          width: 100%;
          max-width: min(404px, calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          min-height: 0;
        }

        .home-hero-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
          width: 100%;
        }

        .home-stats-shell {
          width: 100%;
          margin-top: 24px;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .home-stats-panel {
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          background: linear-gradient(172deg, #fffdf8, #f5ecd9 55%, ${C.surface});
          clip-path: polygon(${statClip});
          -webkit-clip-path: polygon(${statClip});
          border: 1.5px solid ${C.borderStrong};
          box-shadow: ${C.shadowCard}, inset 0 0 0 1px ${C.borderInner};
        }

        .home-stats-panel--wide {
          padding: clamp(14px, 3.8vw, 20px) clamp(10px, 2.8vw, 16px);
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 8px;
          min-width: 0;
        }

        .home-stats-panel--narrow {
          display: none;
          padding: 12px 10px;
        }

        .home-stats-row-iq {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .home-stats-row-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          column-gap: 6px;
          row-gap: 4px;
          align-items: start;
          min-width: 0;
        }

        .home-stats-vsep {
          width: 1px;
          align-self: stretch;
          min-height: 54px;
          background: ${C.border};
          flex-shrink: 0;
        }

        .home-footer-cluster {
          width: 100%;
          margin-top: 22px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: clamp(28px, 7vw, 44px);
        }

        .home-buttons-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .home-die-footer {
          text-align: center;
        }

        .home-hero-img {
          width: min(260px, calc(86vw - 32px));
          max-width: 100%;
        }

        @media (max-width: 429.98px) {
          .home-stats-panel--wide {
            display: none;
          }
          .home-stats-panel--narrow {
            display: block;
          }
        }

        @media (min-width: 768px) {
          .home-inner {
            max-width: min(440px, calc(92vw - 48px));
          }
          .home-hero-img {
            width: min(280px, 42vw);
          }
        }
      `}</style>
    </div>
  );
}
