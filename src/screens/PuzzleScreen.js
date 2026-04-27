import { useEffect, useMemo, useRef } from "react";
import { C } from "../constants/palette";
import { evaluatePosition } from "../engine/evaluator";
import { applyMove } from "../game/moveEngine";
import EvalBar from "../components/EvalBar";
import FlatBoard from "../components/FlatBoard";
import ResultPopup from "../components/ResultPopup";
import PashaAlert from "../components/PashaAlert";

export default function PuzzleScreen(props) {
  const {
    setScreen, handleHint, iq, streak, accuracy, puzzleIdx, label, puzzle, currentPct, deltaPct,
    liveBoard, movesDone, resultBoard, selected, legalDests, handlePointClick, handleBearOff, borneOff, diceUsedFlags, wrongFlash,
    canBearOffFromState, phase, popupOpen, setPopupOpen, setPhase, isCorrect, handleNextPuzzle, handleRetry, attempts,
    iqDelta, resultIqDelta, onRecordPuzzleAttempt,
  } = props;
  const recordedResultRef = useRef("");

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
    <div style={{
      height:"100vh",
      width:"100%",
      background:C.boardFelt,
      fontFamily:"Georgia,serif",
      position:"relative",
      overflow:"hidden",
      display:"flex",
      flexDirection:"column",
    }}>
      {/* Status-bar safe area */}
      <div style={{height:"env(safe-area-inset-top, 12px)", flexShrink:0, minHeight:12}}/>

      {/* Top row: menu (left) · centered stats pill · hint (right) */}
      <div style={{
        padding:"4px 14px 6px",
        display:"flex",
        alignItems:"center",
        gap:10,
        flexShrink:0,
      }}>
        <button onClick={()=>setScreen("home")} style={{
          width:46, height:46, borderRadius:"50%",
          background:"#EADBB8",
          border:"1px solid rgba(80,55,30,0.15)",
          color:C.text, fontSize:20, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 6px rgba(0,0,0,0.1)",
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
            background:"rgba(255,250,235,0.85)",
            borderRadius:16, border:"1px solid rgba(80,55,30,0.15)",
            overflow:"hidden",
          }}>
            {[
              {v:iq,l:"IQ",c:C.gold},
              {v:streak+"🔥",l:"STREAK",c:C.text},
              {v:accuracy+"%",l:"ACC",c:C.blue},
            ].map((x,i)=>(
              <div key={i} style={{
                display:"flex",flexDirection:"column",alignItems:"center",
                padding:"4px 14px",
                borderRight:i<2?"1px solid rgba(80,55,30,0.12)":"none",
              }}>
                <div style={{color:x.c,fontSize:13,fontWeight:800,lineHeight:1}}>{x.v}</div>
                <div style={{color:C.textSoft,fontSize:8,letterSpacing:1,marginTop:1}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleHint} style={{
          width:46, height:46, borderRadius:"50%",
          background:"#8B7355",
          border:"1px solid rgba(60,40,20,0.3)",
          cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 6px rgba(0,0,0,0.15)",
          padding:0, flexShrink:0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FDF6E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.8.7 1 1.4 1 2.3h6c0-.9.2-1.6 1-2.3A7 7 0 0 0 12 2z"/>
          </svg>
        </button>
      </div>

      {/* Puzzle info — centered below stats */}
      <div style={{
        padding:"0 14px 4px",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        gap:2,
        flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.gold,fontSize:14,fontWeight:800,fontFamily:"Georgia,serif"}}>
            #{puzzleIdx+1} · {label}
          </span>
          <span style={{
            background:puzzle.diffColor+"22",
            color:puzzle.diffColor,
            fontSize:9,fontWeight:800,
            padding:"2px 7px",borderRadius:10,
            border:"1px solid "+puzzle.diffColor+"44",
            letterSpacing:0.5,
          }}>{puzzle.difficulty.toUpperCase()}</span>
        </div>
        <div style={{color:C.textMid,fontSize:11,fontWeight:600}}>
          {puzzle.concept}
        </div>
      </div>

      {/* Eval bar — tight, directly above the board */}
      <div style={{padding:"4px 14px 6px", flexShrink:0}}>
        <EvalBar pct={currentPct} delta={deltaPct}/>
      </div>

      {/* THE BOARD — fills the remaining middle space */}
      <div style={{
        flex:1,
        minHeight:0,
        display:"flex", flexDirection:"column",
        position:"relative",
      }}>
        <FlatBoard
          board={liveBoard||puzzle.board}
          selected={selected}
          legalDests={legalDests}
          onPointClick={handlePointClick}
          onBearOff={handleBearOff}
          borneOff={borneOff}
          dice={[puzzle.dice[0], puzzle.dice[1]]}
          diceUsed={diceUsedFlags}
          wrongFlashPoint={wrongFlash}
        />
      </div>

      {/* Single bear-off pocket below the board (older design) */}
      <div style={{padding:"8px 14px 14px", flexShrink:0}}>
        <div
          onClick={canBearOffFromState ? handleBearOff : undefined}
          style={{
            background: canBearOffFromState ? 'rgba(212,160,23,0.15)' : 'rgba(120,85,50,0.12)',
            border: canBearOffFromState ? '2px solid rgba(212,160,23,0.7)' : '2px dashed rgba(80,55,30,0.25)',
            borderRadius:12,
            padding:'10px 14px',
            display:'flex', alignItems:'center', gap:10,
            cursor: canBearOffFromState ? 'pointer' : 'default',
            animation: canBearOffFromState ? 'trayPulse 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <div style={{display:'flex', flexWrap:'wrap', gap:4, flex:1, minHeight:22}}>
            {Array.from({length:Math.min(borneOff,15)}).map((_,i)=>(
              <div key={i} style={{
                width:20, height:20, borderRadius:'50%',
                background:'radial-gradient(circle at 38% 30%,#FFFFFF 0%,#F4EBD6 35%,#D4C2A0 75%,#A09070 100%)',
                border:'1.5px solid #A08B60',
                boxShadow:'0 1px 3px rgba(0,0,0,0.25)',
              }}/>
            ))}
            {borneOff===0 && (
              <div style={{color:'rgba(60,40,20,0.35)', fontSize:12, fontStyle:'italic', lineHeight:'22px'}}>
                Bear off pocket
              </div>
            )}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{
              color: canBearOffFromState ? '#B8860B' : 'rgba(60,40,20,0.45)',
              fontSize:10, fontWeight:800, letterSpacing:1,
            }}>
              {canBearOffFromState ? 'TAP TO BEAR OFF' : 'BORNE OFF'}
            </div>
            <div style={{
              color: canBearOffFromState ? '#B8860B' : 'rgba(60,40,20,0.5)',
              fontSize:18, fontWeight:800, marginTop:1,
            }}>{borneOff} / 15</div>
          </div>
        </div>
      </div>

      {/* Home-indicator safe area */}
      <div style={{height:"env(safe-area-inset-bottom, 0)", flexShrink:0}}/>

      {/* Floating Re-open button — shown when popup was dismissed mid-result */}
      {phase==="result" && !popupOpen && (
        <PashaAlert onClick={()=>setPopupOpen(true)} isCorrect={isCorrect} />
      )}

      <style>{`
        @keyframes fabSlideUp {
          from { opacity:0; transform:translate(-50%, 20px); }
          to   { opacity:1; transform:translate(-50%, 0); }
        }
      `}</style>

      {/* Minimal draggable popup */}
      <ResultPopup open={popupOpen} onClose={()=>{
        setPopupOpen(false);
        if (phase==="hint") setPhase("playing");
      }}>
        {phase==="hint" ? (
          <>
            <div style={{color:C.gold,fontSize:22,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:6}}>Hint</div>
            <div style={{color:C.textSoft,fontSize:11,marginBottom:14,letterSpacing:0.5}}>
              {label} · {puzzle.difficulty}
            </div>
            <p style={{color:C.textMid,fontSize:14,lineHeight:1.7,margin:"0 0 16px",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              {puzzle.description}
            </p>
            <div style={{
              background:"rgba(184,134,11,0.08)",
              border:"1px solid rgba(184,134,11,0.25)",
              borderRadius:10, padding:"12px 14px",
              color:C.textMid, fontSize:13, lineHeight:1.6,
              fontFamily:"Georgia,serif", marginBottom:20,
            }}>
              <strong style={{color:C.gold}}>Theme:</strong> {puzzle.concept}
            </div>
            <button onClick={()=>{ setPopupOpen(false); setPhase("playing"); }} style={{
              width:"100%", padding:"14px", background:C.goldBtn, border:"none", borderRadius:12,
              cursor:"pointer", color:"#FDF6E3", fontSize:14, fontWeight:800, letterSpacing:2,
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
              cursor:"pointer", color:"#FDF6E3", fontSize:16, fontWeight:800, letterSpacing:3,
              fontFamily:"Georgia,serif", boxShadow:"0 4px 16px rgba(184,134,11,0.28)",
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
                flex:1, padding:"14px", background:C.bgDeep, border:`1.5px solid ${C.border}`,
                borderRadius:12, cursor:"pointer", color:C.textMid, fontSize:13, fontWeight:700,
                letterSpacing:2, fontFamily:"Georgia,serif",
              }}>
                SKIP
              </button>
              <button onClick={handleRetry} style={{
                flex:2, padding:"14px", background:C.goldBtn, border:"none", borderRadius:12,
                cursor:"pointer", color:"#FDF6E3", fontSize:14, fontWeight:800, letterSpacing:2,
                fontFamily:"Georgia,serif", boxShadow:"0 4px 16px rgba(184,134,11,0.28)",
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
