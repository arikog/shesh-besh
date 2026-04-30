import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Die from "./Die";
import { playSplashDice, tryResumeAudioContext } from "../audio/puzzleSfx";

const BG =
  `radial-gradient(ellipse at 38% 12%, rgba(184,134,11,0.09) 0%, transparent 42%),
   radial-gradient(ellipse at 70% 88%, rgba(0,0,0,0.22) 0%, transparent 48%),
   repeating-linear-gradient(0deg, rgba(44,34,26,0.06) 0 1px, transparent 1px 3px),
   repeating-linear-gradient(90deg, rgba(44,34,26,0.05) 0 1px, transparent 1px 3px),
   linear-gradient(160deg,#3a2817 0%,#312214 42%,#24180e 100%)`;

/** Full-viewport Chess.com-style intro → landing (every load; tap to skip). */
export default function IntroSplash({ onDone }) {
  const finished = useRef(false);
  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  const [tapSkip, setTapSkip] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    playSplashDice();
  }, [reduceMotion]);

  useEffect(() => {
    const ms = reduceMotion ? 440 : tapSkip ? 295 : 1520;
    const id = window.setTimeout(() => finish(), ms);
    return () => window.clearTimeout(id);
  }, [tapSkip, reduceMotion, finish]);

  function handleDismissIntent() {
    tryResumeAudioContext();
    setTapSkip(true);
  }

  const rootClass = [tapSkip && "intro-splash--tap", reduceMotion && "intro-splash--reduce"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-intro-splash
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onPointerDown={(e) => {
        if (reduceMotion || tapSkip) return;
        if (e.button !== undefined && e.button !== 0) return;
        handleDismissIntent();
      }}
      onKeyDown={(e) => {
        if (reduceMotion || tapSkip) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        handleDismissIntent();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: BG,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      className={rootClass || undefined}
    >
      <style>{`
        @keyframes splashDieFade {
          0% { opacity: 0; }
          20% { opacity: 1; }
          86.666% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes splashDieScale {
          0%, 20% { transform: scale(1.1); }
          40% { transform: scale(1); }
          86.666%, 100% { transform: scale(1); }
        }
        @keyframes splashWordFade {
          0%, 20% { opacity: 0; transform: translateY(10px); }
          40% { opacity: 1; transform: translateY(0); }
          86.666% { opacity: 1; }
          100% { opacity: 0; transform: translateY(0); }
        }
        @keyframes splashHebrewFade {
          0%, 40% { opacity: 0; transform: translateY(8px); }
          66.667% { opacity: 1; transform: translateY(0); }
          86.666% { opacity: 1; }
          100% { opacity: 0; transform: translateY(0); }
        }
        .intro-splash__stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          pointer-events: none;
        }
        .intro-splash__die {
          animation:
            splashDieFade 1.5s ease forwards,
            splashDieScale 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          width: 92px;
          height: 92px;
          filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.35));
        }
        .intro-splash__wordmark {
          margin-top: 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 900;
          font-size: clamp(26px, 7vw, 36px);
          letter-spacing: 4px;
          color: #B8860B;
          text-shadow: 0 2px 22px rgba(184,134,11,0.22);
          animation: splashWordFade 1.5s ease forwards;
        }
        .intro-splash__hebrew {
          margin-top: 8px;
          font-family: "Noto Sans Hebrew", system-ui, sans-serif;
          font-size: clamp(17px, 4.5vw, 20px);
          font-weight: 600;
          letter-spacing: 6px;
          color: #B07010;
          direction: rtl;
          unicode-bidi: embed;
          animation: splashHebrewFade 1.5s ease forwards;
        }
        [data-intro-splash].intro-splash--reduce .intro-splash__die,
        [data-intro-splash].intro-splash--reduce .intro-splash__wordmark,
        [data-intro-splash].intro-splash--reduce .intro-splash__hebrew {
          animation: none !important;
          opacity: 1;
          transform: none;
        }
        [data-intro-splash].intro-splash--reduce {
          animation: splashReduceFade 0.42s ease forwards;
        }
        @keyframes splashReduceFade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        [data-intro-splash].intro-splash--tap {
          opacity: 0;
          transition: opacity 0.29s ease;
        }
        [data-intro-splash].intro-splash--tap .intro-splash__die,
        [data-intro-splash].intro-splash--tap .intro-splash__wordmark,
        [data-intro-splash].intro-splash--tap .intro-splash__hebrew {
          animation: none !important;
        }
      `}</style>

      <div className="intro-splash__stack">
        <div className="intro-splash__die">
          <Die value={6} size={92} />
        </div>
        <div className="intro-splash__wordmark">SHESH BESH</div>
        <div className="intro-splash__hebrew">שש בש</div>
      </div>
    </div>
  );
}
