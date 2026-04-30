import { useEffect } from "react";
import { C } from "../constants/palette";
import WelcomeModal from "../components/WelcomeModal";
import IQGauge from "../components/IQGauge";
import { loadProgress } from "../storage/progress";

const NOTCH = 16;

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
      style={{
        minHeight: "100vh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: "Georgia,serif",
      }}
    >
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div style={{ maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 6 }}>🎲</div>
          <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: 4, color: C.gold, fontFamily: "Georgia,serif" }}>
            SHESH BESH
          </div>
        </div>

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
              <div style={{ color: C.textMid, fontSize: 14, fontWeight: 700 }}>#{Math.max(1, Math.round((1200 - iq) * 0.8) + 1)}</div>
              <div style={{ color: C.textSoft, fontSize: 9, letterSpacing: 1 }}>GLOBAL RANK</div>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
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
      </div>
    </div>
  );
}
