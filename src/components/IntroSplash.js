import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C } from "../constants/palette";
import { playSplashDice, tryResumeAudioContext } from "../audio/puzzleSfx";

/** Public path — preload matches in index.html */
const SPLASH_ART = `${process.env.PUBLIC_URL ?? ""}/images/coffeehouse-splash.png`;
/** Intrinsic size (coffeehouse hero asset) — stable layout slot */
const ART_W = 1024;
const ART_H = 683;

/** Full-viewport intro every load; tap to skip; ~1.8s sequence (PNG — no stroke-draw). */
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
    const ms = reduceMotion ? 460 : tapSkip ? 295 : 1815;
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

  function consumeTapDismissTransitionEnd(e) {
    if (!tapSkip || finished.current || e.propertyName !== "opacity") return;
    if (e.target !== e.currentTarget) return;
    finish();
  }

  return (
    <div
      data-intro-splash
      role="button"
      tabIndex={tapSkip ? -1 : 0}
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
        backgroundColor: C.bgDeep,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        paddingLeft: "max(14px, env(safe-area-inset-left))",
        paddingRight: "max(14px, env(safe-area-inset-right))",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxSizing: "border-box",
      }}
      className={rootClass || undefined}
      onTransitionEnd={consumeTapDismissTransitionEnd}
    >
      <style>{`
        @keyframes splashCoffeeArt {
          0% {
            opacity: 0;
            transform: scale(0.98);
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }
          33.333% {
            opacity: 1;
            transform: scale(1);
            animation-timing-function: linear;
          }
          83.333% {
            opacity: 1;
            transform: scale(1);
            animation-timing-function: ease-out;
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes splashCoffeeWordmark {
          0%, 27.78% {
            opacity: 0;
            transform: translateY(8px);
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }
          50% {
            opacity: 1;
            transform: translateY(0);
            animation-timing-function: linear;
          }
          83.333% {
            opacity: 1;
            transform: translateY(0);
            animation-timing-function: ease-out;
          }
          100% {
            opacity: 0;
            transform: translateY(0);
          }
        }

        @keyframes splashCoffeeHebrew {
          0%, 44.44% {
            opacity: 0;
            transform: translateY(6px);
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }
          66.667% {
            opacity: 1;
            transform: translateY(0);
            animation-timing-function: linear;
          }
          83.333% {
            opacity: 1;
            transform: translateY(0);
            animation-timing-function: ease-out;
          }
          100% {
            opacity: 0;
            transform: translateY(0);
          }
        }

        .intro-splash__stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          pointer-events: none;
          width: 100%;
          max-width: min(640px, 92vw);
          transform: translateY(-4vh);
        }

        .intro-splash__art-wrap {
          width: min(600px, 85vw);
          max-width: 100%;
          margin: 0 auto;
        }

        .intro-splash__art {
          display: block;
          width: 100%;
          height: auto;
          animation: splashCoffeeArt 1.8s both;
        }

        .intro-splash__wordmark {
          margin-top: clamp(14px, 3.8vw, 22px);
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 900;
          font-size: clamp(28px, 10.5vw, 40px);
          letter-spacing: clamp(5px, 1.8vw, 10px);
          color: ${C.accent};
          text-shadow: 0 2px 28px rgba(212, 169, 58, 0.22);
          line-height: 1.08;
          animation: splashCoffeeWordmark 1.8s both;
          max-width: 100%;
        }

        .intro-splash__hebrew {
          margin-top: clamp(10px, 3vw, 14px);
          font-family: "Noto Sans Hebrew", system-ui, sans-serif;
          font-size: clamp(18px, 6vw, 22px);
          font-weight: 600;
          letter-spacing: clamp(5px, 2vw, 9px);
          color: ${C.hebrewMuted};
          direction: rtl;
          unicode-bidi: embed;
          animation: splashCoffeeHebrew 1.8s both;
          max-width: 100%;
        }

        [data-intro-splash].intro-splash--reduce .intro-splash__stack {
          transform: none;
        }

        [data-intro-splash].intro-splash--reduce .intro-splash__art,
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
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        [data-intro-splash].intro-splash--tap {
          opacity: 0;
          transition: opacity 0.28s ease;
          /* Invisible layer must not swallow clicks toward the landing / modal below */
          pointer-events: none;
        }

        [data-intro-splash].intro-splash--tap .intro-splash__art,
        [data-intro-splash].intro-splash--tap .intro-splash__wordmark,
        [data-intro-splash].intro-splash--tap .intro-splash__hebrew {
          animation: none !important;
        }
      `}</style>

      <div className="intro-splash__stack">
        <div className="intro-splash__art-wrap">
          <img
            className="intro-splash__art"
            src={SPLASH_ART}
            alt=""
            width={ART_W}
            height={ART_H}
            decoding="sync"
            fetchPriority="high"
            draggable={false}
          />
        </div>
        <div className="intro-splash__wordmark">SHESH BESH</div>
        <div className="intro-splash__hebrew">שש בש</div>
      </div>
    </div>
  );
}
