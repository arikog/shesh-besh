import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "../constants/palette";
import { evaluatePosition } from "../engine/evaluator";
import { applyMove } from "../game/moveEngine";
import EvalBar from "../components/EvalBar";
import FlatBoard from "../components/FlatBoard";
import FlatBoardPortrait from "../components/FlatBoardPortrait";
import ResultPopup from "../components/ResultPopup";
import PashaAlert from "../components/PashaAlert";

export default function PuzzleScreen(props) {
  const {
    setScreen, handleHint, iq, streak, accuracy, puzzleIdx, label, puzzle, currentPct, deltaPct,
    liveBoard, movesDone, resultBoard, selected, legalDests, handlePointClick, handleBearOff, borneOff, diceUsedFlags, wrongFlash,
    canBearOffFromState, phase, popupOpen, setPopupOpen, setPhase, isCorrect, handleNextPuzzle, handleRetry, attempts,
    iqDelta, resultIqDelta, onRecordPuzzleAttempt,
    sfxMuted, toggleSfxMuted,
  } = props;
  const recordedResultRef = useRef("");
  const [narrowPortraitBoard, setNarrowPortraitBoard] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 767.98px) and (orientation: portrait)");
    const apply = () => setNarrowPortraitBoard(Boolean(mq.matches));
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  const lineBoard = (phase === "result" && resultBoard) ? resultBoard : (movesDone || []).reduce(
    (acc, move) => applyMove(acc, move.from, move.to),
    [...puzzle.board]
  );

  const yourPositionEval = useMemo(() => {
    return evaluatePosition(lineBoard, puzzle.dice, "white");
  }, [lineBoard, puzzle]);

  const bestPositionEval = useMemo(() => {
    const start = [...puzzle.board];
    const resolved = puzzle.bestMoves.reduce((acc, move) => applyMove(acc, move.from, move.to), start);
    return evaluatePosition(resolved, puzzle.dice, "white");
  }, [puzzle]);

  const isValidPct = (value) => Number.isFinite(value) && value >= 0 && value <= 100;
  const yourWinPct = isValidPct(yourPositionEval.winPct) ? yourPositionEval.winPct : puzzle.yourWinPct;
  const bestWinPct = isValidPct(bestPositionEval.winPct) ? bestPositionEval.winPct : puzzle.bestWinPct;
  const displayedYourWinPct = isCorrect ? currentPct : yourWinPct;

  const opponentBorneOff = useMemo(() => {
    let blackOnBoard = 0;
    for (let i = 0; i < lineBoard.length; i++) {
      const v = lineBoard[i];
      if (v < 0) blackOnBoard += -v;
    }
    return Math.min(15, Math.max(0, 15 - blackOnBoard));
  }, [lineBoard]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && phase === "result") {
      // eslint-disable-next-line no-console
      console.log("[evaluator] puzzle result breakdown", {
        puzzleId: puzzle.id,
        yourWinPct,
        bestWinPct,
        yourBreakdown: yourPositionEval.breakdown,
        bestBreakdown: bestPositionEval.breakdown,
      });
    }
  }, [bestPositionEval.breakdown, bestWinPct, phase, puzzle.id, yourPositionEval.breakdown, yourWinPct]);

  useEffect(() => {
    if (phase !== "result" || !popupOpen || typeof onRecordPuzzleAttempt !== "function") return;
    const key = `${puzzle.id}:${isCorrect ? "1" : "0"}:${attempts}:${resultIqDelta}`;
    if (recordedResultRef.current === key) return;
    recordedResultRef.current = key;
    onRecordPuzzleAttempt({
      puzzleId: puzzle.id,
      wasCorrect: isCorrect,
      iqDelta: resultIqDelta,
    });
  }, [attempts, isCorrect, onRecordPuzzleAttempt, phase, popupOpen, puzzle.id, resultIqDelta]);

  return (
    <div
      className="puzzle-screen-root"
      style={{
        width: "100%",
        minHeight: "100dvh",
        height: "100dvh",
        background: `linear-gradient(165deg,${C.bg} 0%,${C.bgDeep} 72%)`,
        fontFamily: "Georgia,serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Status-bar safe area */}
      <div style={{height:"env(safe-area-inset-top, 12px)", flexShrink:0, minHeight:8}}/>

      {/* Top row: menu (left) · centered stats pill · hint (right) */}
      <div className="puzzle-chrome puzzle-chrome--top"
        style={{
        paddingTop: 2,
        paddingBottom: 4,
        display:"flex",
        alignItems:"center",
        gap:10,
        flexShrink:0,
      }}>
        <button onClick={()=>setScreen("home")} style={{
          width:46, height:46, borderRadius:"50%",
          background:C.surface,
          border:`1px solid ${C.border}`,
          color:C.textHeading, fontSize:20, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:C.chromeShadow,
          padding:0, flexShrink:0,
        }}>⋯</button>

        {/* Centered stats pill */}
        <div style={{
          flex:1,
          display:"flex",
          justifyContent:"center",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:0,
            background:C.surface,
            borderRadius:16, border:`1px solid ${C.borderStrong}`,
            overflow:"hidden",
            boxShadow:`inset 0 0 0 1px ${C.borderInner}`,
          }}>
            {[
              {v:iq,l:"IQ",c:C.accent},
              {v:streak+"🔥",l:"STREAK",c:C.textHeading},
              {v:accuracy+"%",l:"ACC",c:C.blue},
            ].map((x,i)=>(
              <div key={i} style={{
                display:"flex",flexDirection:"column",alignItems:"center",
                padding:"4px 14px",
                borderRight:i<2?`1px solid ${C.borderInner}`:"none",
              }}>
                <div style={{color:x.c,fontSize:13,fontWeight:800,lineHeight:1}}>{x.v}</div>
                <div style={{color:C.textBody,opacity:0.85,fontSize:8,letterSpacing:1,marginTop:1}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={toggleSfxMuted}
            title={sfxMuted ? "Turn sound on" : "Mute sound"}
            aria-label={sfxMuted ? "Unmute sound effects" : "Mute sound effects"}
            aria-pressed={sfxMuted}
            style={{
              width:46, height:46, borderRadius:"50%",
              background:sfxMuted ? C.speakerMuted : "#4a7f5c",
              border:`1px solid ${C.borderStrong}`,
              cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:C.chromeShadow,
              padding:0,
            }}
          >
            {sfxMuted ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textOnDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textOnDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M14.5 9 q2 3 0 6" fill="none" />
                <path d="M16.5 6 q3.2 6 0 12" fill="none" />
              </svg>
            )}
          </button>

          <button type="button" onClick={handleHint} aria-label="Show hint" style={{
            width:46, height:46, borderRadius:"50%",
            background:C.hintBg,
            border:`1px solid ${C.hintBorder}`,
            cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:C.chromeShadow,
            padding:0, flexShrink:0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textOnDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.8.7 1 1.4 1 2.3h6c0-.9.2-1.6 1-2.3A7 7 0 0 0 12 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Puzzle info — centered below stats */}
      <div className="puzzle-chrome puzzle-chrome--title"
        style={{
        paddingTop: 0,
        paddingBottom: 2,
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        gap:2,
        flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.accent,fontSize:14,fontWeight:800,fontFamily:"Georgia,serif"}}>
            #{puzzleIdx+1} · {label}
          </span>
          <span style={{
            background: `${puzzle.diffColor}26`,
            color:C.textHeading,
            fontSize:9,fontWeight:800,
            padding:"2px 8px",borderRadius:10,
            border:`1px solid rgba(212,169,58,0.45)`,
            letterSpacing:0.5,
            boxShadow:`inset 0 0 0 1px ${C.borderInner}`,
          }}>{puzzle.difficulty.toUpperCase()}</span>
        </div>
        <div style={{color:C.subtitleOnDark,fontSize:11,fontWeight:600,textAlign:"center"}}>
          {puzzle.concept}
        </div>
      </div>

      {/* Eval bar — tight spacing (~24–32px to board edge on desktop via CSS vars) */}
      <div className="puzzle-chrome puzzle-chrome--eval" style={{paddingTop: 2, paddingBottom: 4, flexShrink:0}}>
        <EvalBar pct={currentPct} delta={deltaPct}/>
      </div>

      {/* Play area: compact fills viewport below header with cream mat; desktop = framed card */}
      <div
        className="puzzle-play-area"
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="puzzle-centered-col">
          <div
            className={`puzzle-board-mat${narrowPortraitBoard ? " puzzle-board-mat--narrow-portrait" : ""}`}
            style={{
              background: C.boardFelt,
              padding: "clamp(7px, 2vw, 12px)",
              border: `1px solid rgba(212, 169, 58, 0.32)`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              minHeight: 0,
              gap: 0,
            }}
          >
          {narrowPortraitBoard && (
            <div className="puzzle-bear-off-row puzzle-bear-off-row--opponent-top">
              <div
                style={{
                  background: "rgba(25,14,12,0.28)",
                  border: "max(2px, 0.24vw) dashed rgba(80,55,30,0.35)",
                  borderRadius: "clamp(10px, 2.2vw, 16px)",
                  padding: "clamp(6px, 1.8vw, 11px) clamp(10px, 2.6vw, 18px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(8px, 2vw, 14px)",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "clamp(5px, 1.2vw, 10px)",
                    flex: 1,
                    minWidth: 0,
                    minHeight: "clamp(18px, 4vw, 32px)",
                  }}
                >
                  {Array.from({ length: Math.min(opponentBorneOff, 15) }).map((_, i) => (
                    <div
                      key={`op-${i}`}
                      style={{
                        width: "clamp(14px, calc((100%) / 26), 34px)",
                        height: "clamp(14px, calc((100%) / 26), 34px)",
                        borderRadius: "50%",
                        flexShrink: 0,
                        boxSizing: "border-box",
                        background:
                          "radial-gradient(circle at 38% 30%, #6B4020 0%, #3D1E08 45%, #1A0A02 85%, #0A0402 100%)",
                        border: "max(1.5px, 0.12vw) solid #0A0402",
                        boxShadow: "0 clamp(2px, 0.55vw, 8px) clamp(6px, 1.3vw, 14px) rgba(0,0,0,0.22)",
                      }}
                    />
                  ))}
                  {opponentBorneOff === 0 && (
                    <div
                      style={{
                        color: "rgba(60,40,20,0.35)",
                        fontSize: "clamp(10px, 2.8vw, 14px)",
                        fontStyle: "italic",
                        lineHeight: "clamp(18px, 4vw, 32px)",
                      }}
                    >
                      Black bear-off
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      color: "rgba(60,40,20,0.48)",
                      fontSize: "clamp(8px, 2.1vw, 11px)",
                      fontWeight: 800,
                      letterSpacing: 1,
                    }}
                  >
                    BLACK BORNE
                  </div>
                  <div
                    style={{
                      color: "rgba(60,40,20,0.52)",
                      fontSize: "clamp(14px, 4vw, 22px)",
                      fontWeight: 800,
                      marginTop: 1,
                    }}
                  >
                    {opponentBorneOff} / 15
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={`puzzle-board-play-slot${narrowPortraitBoard ? " puzzle-board-play-slot--narrow-portrait" : ""}`}
          >
            <div
              className={`puzzle-board-aspect${narrowPortraitBoard ? " puzzle-board-aspect--narrow-portrait-native" : ""}`}
            >
              {narrowPortraitBoard ? (
                <FlatBoardPortrait
                  board={liveBoard || puzzle.board}
                  selected={selected}
                  legalDests={legalDests}
                  onPointClick={handlePointClick}
                  dice={[puzzle.dice[0], puzzle.dice[1]]}
                  diceUsed={diceUsedFlags}
                  wrongFlashPoint={wrongFlash}
                />
              ) : (
                <FlatBoard
                  board={liveBoard || puzzle.board}
                  selected={selected}
                  legalDests={legalDests}
                  onPointClick={handlePointClick}
                  dice={[puzzle.dice[0], puzzle.dice[1]]}
                  diceUsed={diceUsedFlags}
                  wrongFlashPoint={wrongFlash}
                />
              )}
            </div>
          </div>

          <div
            className={`puzzle-bear-off-row${narrowPortraitBoard ? " puzzle-bear-off-row--player-bottom" : ""}`}
          >
            <div
              onClick={canBearOffFromState ? handleBearOff : undefined}
              style={{
                background: canBearOffFromState ? C.accentWashBold : "rgba(80,55,30,0.1)",
                border: canBearOffFromState
                  ? "max(2px, 0.24vw) solid rgba(212,169,58,0.75)"
                  : "max(2px, 0.24vw) dashed rgba(80,55,30,0.28)",
                borderRadius: "clamp(10px, 2.2vw, 16px)",
                padding: "clamp(8px, 2.2vw, 14px) clamp(10px, 2.6vw, 18px)",
                display: "flex",
                alignItems: "center",
                gap: "clamp(8px, 2vw, 14px)",
                cursor: canBearOffFromState ? "pointer" : "default",
                animation: canBearOffFromState ? "trayPulse 1.2s ease-in-out infinite" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "clamp(5px, 1.2vw, 10px)",
                  flex: 1,
                  minWidth: 0,
                  minHeight: "clamp(20px, 5vw, 36px)",
                }}
              >
                {Array.from({ length: Math.min(borneOff, 15) }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "clamp(14px, calc((100%) / 26), 34px)",
                      height: "clamp(14px, calc((100%) / 26), 34px)",
                      borderRadius: "50%",
                      flexShrink: 0,
                      boxSizing: "border-box",
                      background:
                        "radial-gradient(circle at 38% 30%,#FFFFFF 0%,#F4EBD6 35%,#D4C2A0 75%,#A09070 100%)",
                      border: "max(1.5px, 0.12vw) solid #A08B60",
                      boxShadow: "0 clamp(2px, 0.55vw, 8px) clamp(6px, 1.3vw, 14px) rgba(0,0,0,0.22)",
                    }}
                  />
                ))}
                {borneOff === 0 && (
                  <div
                    style={{
                      color: "rgba(60,40,20,0.35)",
                      fontSize: "clamp(11px, 3.2vw, 15px)",
                      fontStyle: "italic",
                      lineHeight: "clamp(20px, 5vw, 36px)",
                    }}
                  >
                    Bear off pocket
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    color: canBearOffFromState ? C.accent : "rgba(60,40,20,0.48)",
                    fontSize: "clamp(9px, 2.25vw, 12px)",
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  {canBearOffFromState ? "TAP TO BEAR OFF" : "BORNE OFF"}
                </div>
                <div
                  style={{
                    color: canBearOffFromState ? C.accent : "rgba(60,40,20,0.52)",
                    fontSize: "clamp(15px, 4.75vw, 24px)",
                    fontWeight: 800,
                    marginTop: 1,
                  }}
                >
                  {borneOff} / 15
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Compact: safe area lives in cream mat (bear-off). Desktop keeps a thin burgundy pad below framed card */}
      <div className="puzzle-bottom-safe-pad" aria-hidden />

      {/* Floating Re-open button — shown when popup was dismissed mid-result */}
      {phase==="result" && !popupOpen && (
        <PashaAlert onClick={()=>setPopupOpen(true)} isCorrect={isCorrect} />
      )}

      <style>{`
        @keyframes fabSlideUp {
          from { opacity:0; transform:translate(-50%, 20px); }
          to   { opacity:1; transform:translate(-50%, 0); }
        }
        @keyframes trayPulse{0%,100%{border-color:rgba(212,169,58,0.55)}50%{border-color:rgba(212,169,58,0.95)}}

        /* Header / eval rows: comfy inset on phones; overridden below for horizontal padding only */
        .puzzle-chrome {
          box-sizing: border-box;
        }

        .puzzle-play-area {
          flex: 1;
          min-height: 0;
          container-type: size;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 0;
          padding-bottom: 0;
          padding-left: clamp(12px, 2vw, 36px);
          padding-right: clamp(12px, 2vw, 36px);
        }

        .puzzle-board-mat {
          border-radius: clamp(10px, 2vw, 20px);
        }

        /* Column that holds mat; width tracks min(1100, pane); desktop height capped to pane */
        .puzzle-centered-col {
          width: min(1100px, min(95vw, 100cqw));
          flex: 0 1 auto;
          min-height: 0;
          max-height: 100cqh;
          display: flex;
          flex-direction: column;
        }

        .puzzle-board-play-slot {
          width: 100%;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 1 auto;
        }

        /* Extra bottom slice under framed desktop card — home-indicator / bezel */
        .puzzle-bottom-safe-pad {
          flex-shrink: 0;
          display: none;
          min-height: 0;
          width: 100%;
          box-sizing: border-box;
          pointer-events: none;
        }

        .puzzle-bear-off-row {
          flex-shrink: 0;
          width: 100%;
          padding-top: clamp(6px, 1.4vw, 10px);
        }

        .puzzle-chrome.puzzle-chrome--top,
        .puzzle-chrome.puzzle-chrome--title,
        .puzzle-chrome.puzzle-chrome--eval {
          padding-left: clamp(12px, 2vw, 36px);
          padding-right: clamp(12px, 2vw, 36px);
        }

        /*
         * ≥1024px: centered card / burgundy gutter (current desktop UX).
         * ≤1023.98px: full-bleed cream under header → bottom-of-viewport mat.
         */
        @media (min-width: 1024px) {
          .puzzle-play-area {
            overflow: hidden;
            padding-top: 14px;
            padding-bottom: 10px;
          }

          .puzzle-board-play-slot {
            display: flex;
            justify-content: center;
          }

          .puzzle-bottom-safe-pad {
            display: block;
            height: env(safe-area-inset-bottom, 0px);
          }

          /*
           * Wide board framing: height = 3/5 of width → aspect 5:3.
           * --pane-slot reserves mat vertical padding + bear-off + gap (~22px).
           */
          .puzzle-board-aspect {
            --pane-slot: clamp(132px, 15cqh, 162px);
            --cap-w: min(1100px, min(95vw, 100cqw));
            --cap-h: calc(100cqh - var(--pane-slot));
            --board-w: min(var(--cap-w), calc(var(--cap-h) * 5 / 3));
            box-sizing: border-box;
            margin-inline: auto;
            flex-shrink: 0;
            width: var(--board-w);
            height: calc(var(--board-w) * 3 / 5);
            max-width: min(1100px, 95cqw);
            position: relative;
            overflow: hidden;
          }
        }

        @media (max-width: 1023.98px) {
          .puzzle-chrome.puzzle-chrome--top,
          .puzzle-chrome.puzzle-chrome--title,
          .puzzle-chrome.puzzle-chrome--eval {
            padding-left: max(16px, env(safe-area-inset-left, 0px));
            padding-right: max(16px, env(safe-area-inset-right, 0px));
          }

          .puzzle-play-area {
            overflow: hidden;
            align-items: stretch;
            justify-content: flex-start;
            padding-left: 0;
            padding-right: 0;
            padding-top: 0;
            padding-bottom: 0;
            width: 100%;
          }

          .puzzle-centered-col {
            width: 100%;
            flex: 1 1 auto;
            max-width: none;
            margin-left: 0;
            margin-right: 0;
            align-self: stretch;
            max-height: none;
          }

          .puzzle-board-mat {
            flex: 1 1 auto;
            border-radius: 0;
            min-height: 0;
          }

          .puzzle-board-play-slot {
            flex: 1 1 auto;
            min-height: 0;
            container-type: size;
          }

          /*
           * Inscribed 3:2 rectangle; extra vertical space stays cream (centering in slot).
           * cqw/cqh measured against play-slot container.
           */
          .puzzle-board-aspect {
            box-sizing: border-box;
            width: min(100cqw, calc(100cqh * 3 / 2));
            aspect-ratio: 3 / 2;
            flex-shrink: 0;
            max-height: 100cqh;
            position: relative;
            overflow: hidden;
          }

          .puzzle-bear-off-row:not(.puzzle-bear-off-row--opponent-top) {
            padding-bottom: max(env(safe-area-inset-bottom, 0px), 10px);
          }

          .puzzle-bottom-safe-pad {
            display: none !important;
            height: 0 !important;
          }
        }

        /*
         * Phone portrait — native tall board fills play slot (no rotation).
         * iPad portrait (≥768 css px) uses horizontal FlatBoard via width breakpoint.
         */
        @media (max-width: 767.98px) and (orientation: portrait) {
          .puzzle-board-mat--narrow-portrait {
            padding-inline: clamp(4px, 1.5vw, 9px);
            padding-top: clamp(4px, 1vw, 8px);
            padding-bottom: 0;
          }

          .puzzle-bear-off-row--opponent-top {
            padding-top: clamp(4px, 1vw, 8px);
            padding-bottom: 4px;
            flex-shrink: 0;
          }

          .puzzle-board-play-slot.puzzle-board-play-slot--narrow-portrait {
            position: relative;
            overflow: hidden;
            align-items: stretch !important;
            justify-content: flex-start !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
          }

          .puzzle-board-aspect.puzzle-board-aspect--narrow-portrait-native {
            box-sizing: border-box;
            position: relative;
            width: 100%;
            height: 100%;
            aspect-ratio: unset !important;
            max-height: none !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            flex-shrink: 1 !important;
            transform: none !important;
            margin-inline: 0 !important;
            overflow: hidden;
          }
        }
      `}</style>

      {/* Minimal draggable popup */}
      <ResultPopup open={popupOpen} onClose={()=>{
        setPopupOpen(false);
        if (phase==="hint") setPhase("playing");
      }}>
        {phase==="hint" ? (
          <>
            <div style={{color:C.accent,fontSize:22,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:6}}>Hint</div>
            <div style={{color:C.textSoft,fontSize:11,marginBottom:14,letterSpacing:0.5}}>
              {label} · {puzzle.difficulty}
            </div>
            <p style={{color:C.textMid,fontSize:14,lineHeight:1.7,margin:"0 0 16px",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              {puzzle.description}
            </p>
            <div style={{
              background:C.accentWashBold,
              border:`1px solid ${C.borderInner}`,
              borderRadius:10, padding:"12px 14px",
              color:C.textBody, fontSize:13, lineHeight:1.6,
              fontFamily:"Georgia,serif", marginBottom:20,
            }}>
              <strong style={{color:C.accent}}>Theme:</strong> {puzzle.concept}
            </div>
            <button onClick={()=>{ setPopupOpen(false); setPhase("playing"); }} style={{
              width:"100%", padding:"14px", background:C.goldBtn, border:"none", borderRadius:12,
              cursor:"pointer", color:C.textOnDark, fontSize:14, fontWeight:800, letterSpacing:2,
              fontFamily:"Georgia,serif",
            }}>
              GOT IT
            </button>
          </>
        ) : isCorrect ? (
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <span style={{fontSize:32}}>✅</span>
              <div style={{flex:1}}>
                <div style={{color:C.green,fontSize:22,fontWeight:800,fontFamily:"Georgia,serif"}}>
                  {attempts===0 ? "Excellent move!" : "Solved!"}
                </div>
                <div style={{color:C.textSoft,fontSize:11,marginTop:2,letterSpacing:0.5}}>{puzzle.concept}</div>
              </div>
              <div style={{
                background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.4)",
                borderRadius:8, padding:"6px 12px", textAlign:"center",
              }}>
                <div style={{color:C.green,fontSize:16,fontWeight:800}}>+{attempts===0?iqDelta:Math.round(iqDelta/2)}</div>
                <div style={{color:C.textSoft,fontSize:9,letterSpacing:1}}>IQ</div>
              </div>
            </div>

            <div style={{
              background:"rgba(46,125,50,0.07)",
              border:"1px solid rgba(46,125,50,0.25)",
              borderRadius:10, padding:"12px 14px", marginBottom:16,
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div>
                <div style={{color:C.textSoft,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>YOUR WIN PROBABILITY</div>
                <div style={{color:C.green,fontSize:22,fontWeight:800}}>{Math.round(displayedYourWinPct)}%</div>
              </div>
              <div style={{
                color:C.green, fontSize:15, fontWeight:800,
                background:"rgba(46,125,50,0.15)", padding:"6px 12px", borderRadius:8,
              }}>
                BEST {Math.round(bestWinPct)}%
              </div>
            </div>

            <p style={{color:C.textMid,fontSize:13,lineHeight:1.7,margin:"0 0 18px",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              {puzzle.bestExplanation}
            </p>

            <button onClick={handleNextPuzzle} style={{
              width:"100%", padding:"15px", background:C.goldBtn, border:"none", borderRadius:12,
              cursor:"pointer", color:C.textOnDark, fontSize:16, fontWeight:800, letterSpacing:3,
              fontFamily:"Georgia,serif", boxShadow:`0 4px 16px ${C.goldGlow}`,
            }}>
              NEXT PUZZLE →
            </button>
          </>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <span style={{fontSize:32}}>❌</span>
              <div style={{flex:1}}>
                <div style={{color:C.red,fontSize:20,fontWeight:800,fontFamily:"Georgia,serif"}}>
                  Not the best move
                </div>
                <div style={{color:C.textSoft,fontSize:11,marginTop:2,letterSpacing:0.5}}>
                  Win probability dropped by {Math.round(Math.abs(deltaPct))}%
                </div>
              </div>
            </div>

            <p style={{color:C.textMid,fontSize:13,lineHeight:1.7,margin:"0 0 18px",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              Try again — the solution is still there to find. Think about what <em>structural</em> advantage you can create with these dice.
            </p>
            <div style={{
              background:"rgba(183,28,28,0.07)",
              border:"1px solid rgba(183,28,28,0.22)",
              borderRadius:10, padding:"10px 12px", marginBottom:14,
              color:C.textMid, fontSize:12, lineHeight:1.5,
            }}>
              Your line: <strong>{Math.round(displayedYourWinPct)}%</strong> · Best line: <strong>{Math.round(bestWinPct)}%</strong>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={handleNextPuzzle} style={{
                flex:1, padding:"14px", background:C.surface, border:`1.5px solid ${C.border}`,
                borderRadius:12, cursor:"pointer", color:C.textHeading, fontSize:13, fontWeight:700,
                letterSpacing:2, fontFamily:"Georgia,serif", boxShadow:`inset 0 0 0 1px ${C.borderInner}`,
              }}>
                SKIP
              </button>
              <button onClick={handleRetry} style={{
                flex:2, padding:"14px", background:C.goldBtn, border:"none", borderRadius:12,
                cursor:"pointer", color:C.textOnDark, fontSize:14, fontWeight:800, letterSpacing:2,
                fontFamily:"Georgia,serif", boxShadow:`0 4px 16px ${C.goldGlow}`,
              }}>
                TRY AGAIN
              </button>
            </div>
          </>
        )}
      </ResultPopup>
    </div>
  );
}
