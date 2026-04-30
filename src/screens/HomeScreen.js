import { useEffect } from "react";
import { C } from "../constants/palette";
import WelcomeModal from "../components/WelcomeModal";
import IQGauge from "../components/IQGauge";
import { loadProgress } from "../storage/progress";

const NOTCH = 16;
const SPLASH_ART = `${process.env.PUBLIC_URL ?? ""}/images/coffeehouse-splash.png`;

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

  const pageBg = `linear-gradient(165deg,${C.bgSecondary} 0%,${C.bgDeep} 45%,${C.bgPrimary} 100%)`;

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

      {/* Tight top: status/safe area only */}
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
          paddingLeft: "max(24px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(24px, env(safe-area-inset-right, 0px))",
          paddingTop: 4,
        }}
      >
        <div
          className="home-inner"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            minHeight: 0,
            boxSizing: "border-box",
          }}
        >
          {/* Silhouette + wordmark (visual pair) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <img
              className="home-hero-img"
              src={SPLASH_ART}
              alt=""
              width={1024}
              height={683}
              decoding="async"
              draggable={false}
              style={{
                display: "block",
                height: "auto",
                backgroundColor: C.bgPrimary,
              }}
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

          <div
            style={{
              marginTop: 24,
              width: "100%",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                background: `linear-gradient(172deg,#fffdf8,#f5ecd9 55%,${C.surface})`,
                clipPath: `polygon(${statClip})`,
                WebkitClipPath: `polygon(${statClip})`,
                border: `1.5px solid ${C.borderStrong}`,
                boxShadow: `${C.shadowCard}, inset 0 0 0 1px ${C.borderInner}`,
                padding: "22px 20px",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <IQGauge iq={iq} />
              <div style={{ width: 1, height: 60, background: C.border }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: C.gold, fontSize: 22, fontWeight: 800 }}>{streak}🔥</div>
                  <div style={{ color: C.textSoft, fontSize: 10, letterSpacing: 1 }}>STREAK</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: C.blue, fontSize: 22, fontWeight: 800 }}>{accuracy}%</div>
                  <div style={{ color: C.textSoft, fontSize: 10, letterSpacing: 1 }}>ACCURACY</div>
                </div>
              </div>
              <div style={{ width: 1, height: 60, background: C.border }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: C.text, fontSize: 22, fontWeight: 800 }}>{totalAnswered}</div>
                <div style={{ color: C.textSoft, fontSize: 10, letterSpacing: 1 }}>PUZZLES</div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: C.textMid, fontSize: 14, fontWeight: 700 }}>
                    #{Math.max(1, Math.round((1200 - iq) * 0.8) + 1)}
                  </div>
                  <div style={{ color: C.textSoft, fontSize: 9, letterSpacing: 1 }}>GLOBAL RANK</div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
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

          {/* Absorbs extra height on tall phones; die keeps a clear footer band */}
          <div className="home-footer-spacer" style={{ flex: 1, minHeight: 16, width: "100%" }} aria-hidden />

          <div
            className="home-die-footer"
            style={{
              flexShrink: 0,
              marginTop: "clamp(32px, 6vw, 48px)",
              paddingBottom: "max(20px, calc(12px + env(safe-area-inset-bottom, 0px)))",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 52, lineHeight: 1, display: "inline-block" }} aria-hidden>
              🎲
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .home-inner {
          max-width: 400px;
        }
        .home-hero-img {
          width: min(260px, 86vw);
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .home-inner {
            max-width: min(440px, 92vw);
          }
          .home-hero-img {
            width: min(280px, 42vw);
          }
        }
      `}</style>
    </div>
  );
}
