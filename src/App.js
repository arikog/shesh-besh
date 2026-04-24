import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// PALETTE
// ═══════════════════════════════════════════════════════════════════════════
const C = {
  bg:        "#F0E6C8",
  bgDeep:    "#E8D8B0",
  card:      "#FDF6E3",
  border:    "#C8A96E",
  gold:      "#B8860B",
  goldBtn:   "linear-gradient(135deg,#D4A017,#8B6010)",
  text:      "#2C1A0A",
  textMid:   "#6B4A1A",
  textSoft:  "#A08040",
  green:     "#2E7D32",
  red:       "#B71C1C",
  blue:      "#1565C0",
  // Board (edge-to-edge warm wood)
  boardFelt: "#D4B896",
  triDark:   "#8A6F4E",
  triLight:  "#E6D4B5",
  gapLine:   "rgba(60,40,20,0.28)",
  pointNum:  "rgba(60,40,20,0.55)",
};

// ═══════════════════════════════════════════════════════════════════════════
// DICE NAMES
// ═══════════════════════════════════════════════════════════════════════════
const DICE_NAMES = {
  "1-1":"Yak-Yak","2-1":"Yak-Du","2-2":"Dü-Dü","3-1":"Seh-Yek",
  "3-2":"Seh-Du","3-3":"Seh-Seh","4-1":"Char-Yek","4-2":"Char-Du",
  "4-3":"Char-Seh","4-4":"Dört-Dört","5-1":"Panj-Yek","5-2":"Panj-Du",
  "5-3":"Panj-Seh","5-4":"Panj-Char","5-5":"Hamsa","6-1":"Shesh-Yek",
  "6-2":"Shesh-Du","6-3":"Shesh-Seh","6-4":"Shesh-Char",
  "6-5":"Shesh-Besh","6-6":"Shesh-Shesh",
};
const diceLabel = (d1,d2) => DICE_NAMES[`${Math.max(d1,d2)}-${Math.min(d1,d2)}`]||`${d1}-${d2}`;

// ═══════════════════════════════════════════════════════════════════════════
// PUZZLES (same library as before — concept, win percentages, explanations preserved)
// ═══════════════════════════════════════════════════════════════════════════
const PUZZLES = [
  {
    id:1, difficulty:"Beginner", diffColor:C.green, concept:"Hitting a Blot",
    dice:[6,1],
    board:(()=>{
      const b=new Array(24).fill(0);
      b[23]=2; b[12]=5; b[7]=3; b[5]=5;
      b[0]=-2; b[11]=-4; b[16]=-3; b[18]=-5; b[6]=-1;
      return b;
    })(),
    bestMoves:[{from:12,to:6},{from:7,to:6}],
    yourWinPct:48, bestWinPct:64,
    yourExplanation:"Moving without hitting lets your opponent escape freely.",
    bestExplanation:"Hitting on the 7-point sends your opponent to the bar where they face a 67% chance of failing to re-enter. Win probability jumps from 48% to 64%.",
    description:"Opponent blot on the 7-point — do you hit?",
  },
  {
    id:2, difficulty:"Intermediate", diffColor:"#E65100", concept:"Building a Prime",
    dice:[3,2],
    board:(()=>{
      const b=new Array(24).fill(0);
      b[23]=2; b[12]=4; b[7]=3; b[5]=2; b[4]=1; b[3]=1; b[2]=1; b[1]=1;
      b[0]=-2; b[11]=-5; b[16]=-3; b[18]=-5;
      return b;
    })(),
    bestMoves:[{from:7,to:4},{from:5,to:3}],
    yourWinPct:52, bestWinPct:71,
    yourExplanation:"Other moves leave your prime incomplete, giving your opponent a chance to slip through.",
    bestExplanation:"Extending to a 5-prime traps both opponent checkers with no escape on 94% of rolls, pushing win probability from 52% to 71%.",
    description:"You're one move from a 5-prime — seal it.",
  },
  {
    id:3, difficulty:"Advanced", diffColor:C.red, concept:"Back Game Timing",
    dice:[4,4],
    board:(()=>{
      const b=new Array(24).fill(0);
      b[23]=1; b[21]=1; b[12]=3; b[7]=2; b[5]=4; b[4]=2; b[2]=1; b[1]=1;
      b[22]=-1; b[18]=-4; b[16]=-3; b[11]=-4; b[3]=-2; b[0]=-1;
      return b;
    })(),
    bestMoves:[{from:5,to:1},{from:4,to:0},{from:12,to:8},{from:12,to:8}],
    yourWinPct:38, bestWinPct:55,
    yourExplanation:"Running too early destroys your back game timing — you need to stay back to shoot.",
    bestExplanation:"Holding your anchors preserves a 78% shot chance as your opponent bears off, lifting win probability from 38% to 55%.",
    description:"Back game position — protect your timing.",
  },
  {
    id:4, difficulty:"Beginner", diffColor:C.green, concept:"Bearing Off",
    dice:[5,3],
    board:(()=>{
      const b=new Array(24).fill(0);
      b[5]=3; b[4]=3; b[3]=3; b[2]=3; b[1]=2; b[0]=1;
      b[23]=-3; b[22]=-3; b[21]=-3; b[20]=-3; b[19]=-3;
      return b;
    })(),
    bestMoves:[{from:4,to:-1},{from:2,to:-1}],
    yourWinPct:72, bestWinPct:81,
    yourExplanation:"Holding back any checker in a pure race unnecessarily reduces your pip lead.",
    bestExplanation:"Bearing off two checkers extends your pip lead by 16, pushing win probability from 72% to 81% — every checker off is worth ~1.5 pips.",
    description:"Pure race, you're ahead — bear off efficiently.",
  },
  {
    id:5, difficulty:"Intermediate", diffColor:"#E65100", concept:"Safe Point-Making",
    dice:[6,2],
    board:(()=>{
      const b=new Array(24).fill(0);
      b[23]=2; b[12]=5; b[10]=1; b[7]=2; b[6]=1; b[5]=2; b[4]=1; b[1]=1;
      b[0]=-2; b[11]=-4; b[16]=-3; b[18]=-5; b[22]=-1;
      return b;
    })(),
    bestMoves:[{from:10,to:4},{from:6,to:4}],
    yourWinPct:44, bestWinPct:61,
    yourExplanation:"Leaving a blot on the 5-point exposes you to a 42% chance of being hit.",
    bestExplanation:"Making the golden 5-point cleanly improves your win probability from 44% to 61% and creates an anchor your opponent cannot attack.",
    description:"Make the golden 5-point without leaving a blot.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MOVE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
function allWhiteHome(board) {
  for (let i=6; i<24; i++) if (board[i]>0) return false;
  return true;
}
function getLegalDests(board, fromPt, diceRemaining) {
  const results=[], seen=new Set();
  const home=allWhiteHome(board);
  const uniqueDice=[...new Set(diceRemaining)];
  for (const die of uniqueDice) {
    const to=fromPt-die;
    const key=to<0?'off':to;
    if (seen.has(key)) continue;
    seen.add(key);
    if (to<0) {
      if (!home) continue;
      const isExact=(fromPt-die)===-1;
      const highest=board.reduce((h,v,i)=>(v>0&&i>h?i:h),-1);
      if (isExact||fromPt===highest) results.push({to:-1,die});
      continue;
    }
    if (board[to]<=-2) continue;
    results.push({to,die});
  }
  return results;
}
function applyMove(board, from, to) {
  const nb=[...board];
  nb[from]--;
  if (to>=0) { if (nb[to]===-1) nb[to]=1; else nb[to]++; }
  return nb;
}

// ═══════════════════════════════════════════════════════════════════════════
// HEURISTIC EVALUATOR
// Scores a position from White's perspective and maps to win %.
// Features: pip differential, blot exposure, home board points, prime length,
// golden/bar point bonuses, back checker penalty. Clamped to [5, 95].
// ═══════════════════════════════════════════════════════════════════════════
let _diceCache=null;
function diceCombos(){
  if(_diceCache) return _diceCache;
  const r=[]; for(let a=1;a<=6;a++) for(let b=1;b<=6;b++) r.push([a,b]);
  _diceCache=r; return r;
}
function estimateShotProb(board, blotIdx, attackerColor){
  // attackerColor: 'white' or 'dark'. Point index = 0..23.
  // Dark attackers at indices < blotIdx can hit blot at distance blotIdx - idx.
  // White attackers at indices > blotIdx can hit blot at distance idx - blotIdx.
  const dists=[];
  for(let i=0;i<24;i++){
    const v=board[i]||0;
    if(attackerColor==='dark' && v<0){
      const d=blotIdx-i; if(d>0 && d<=24) dists.push(d);
    } else if(attackerColor==='white' && v>0){
      const d=i-blotIdx; if(d>0 && d<=24) dists.push(d);
    }
  }
  if(dists.length===0) return 0;
  let hits=0;
  for(const [d1,d2] of diceCombos()){
    const possible=new Set([d1,d2,d1+d2]);
    if(d1===d2){ possible.add(d1*3); possible.add(d1*4); }
    for(const dist of dists){ if(possible.has(dist)){ hits++; break; } }
  }
  return hits/36;
}
function longestPrime(board, color){
  let best=0, cur=0;
  for(let i=0;i<24;i++){
    const v=board[i]||0;
    const made = color==='white' ? v>=2 : v<=-2;
    if(made){ cur++; best=Math.max(best,cur); } else cur=0;
  }
  return best;
}
function scorePosition(board){
  // Pip counts. White moves toward index -1 (pip cost per checker = idx+1).
  // Dark moves toward index 24 (pip cost per checker = 24-idx).
  let whitePips=0, darkPips=0;
  for(let i=0;i<24;i++){
    const v=board[i]||0;
    if(v>0) whitePips += v*(i+1);
    else if(v<0) darkPips += (-v)*(24-i);
  }
  let score = (darkPips - whitePips) * 0.008;

  // Blot exposure
  for(let i=0;i<24;i++){
    const v=board[i]||0;
    if(v===1) score -= estimateShotProb(board, i, 'dark') * 0.25;
    else if(v===-1) score += estimateShotProb(board, i, 'white') * 0.25;
  }
  // Home-board points (white home = indices 0..5; dark home = 18..23)
  let whiteHome=0, darkHome=0;
  for(let i=0;i<=5;i++) if((board[i]||0)>=2) whiteHome++;
  for(let i=18;i<=23;i++) if((board[i]||0)<=-2) darkHome++;
  score += whiteHome*0.06 - darkHome*0.06;

  // Prime length
  score += longestPrime(board,'white')*0.04;
  score -= longestPrime(board,'dark')*0.04;

  // Golden & bar points (white 5-pt idx4, bar idx6 / dark 20-pt idx19, 18-pt idx17)
  if((board[4]||0)>=2) score += 0.08;
  if((board[6]||0)>=2) score += 0.08;
  if((board[19]||0)<=-2) score -= 0.08;
  if((board[17]||0)<=-2) score -= 0.08;

  // Back checker penalty (white on 24 = idx 23 is stuck; dark on 1 = idx 0)
  const wb=(board[23]||0), db=(board[0]||0);
  if(wb>=2) score -= 0.02*wb;
  if(db<=-2) score += 0.02*(-db);

  return score;
}
function equityToWinPct(eq){
  const frac = 1/(1+Math.exp(-eq*1.9));
  return Math.max(5, Math.min(95, frac*100));
}
function evaluateBoard(board){
  return equityToWinPct(scorePosition(board));
}

// ═══════════════════════════════════════════════════════════════════════════
// DIE FACE
// ═══════════════════════════════════════════════════════════════════════════
function Die({ value, size=46, used=false }) {
  const dots={
    1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],
    4:[[28,28],[72,28],[28,72],[72,72]],
    5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
    6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
  };
  return (
    <div style={{
      width:size,height:size,position:"relative",flexShrink:0,
      background:used?"#C8B080":"linear-gradient(145deg,#FFFEF0,#F0E8D0)",
      borderRadius:size*0.14,
      border:`2px solid ${used?"#A09060":"#8B6010"}`,
      boxShadow:used?"none":"0 3px 8px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.9)",
      opacity:used?0.4:1,transition:"opacity 0.35s",
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position:"absolute",inset:0}}>
        {(dots[value]||[]).map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r={9} fill={used?"#807050":"#2C1A0A"}/>
        ))}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVAL BAR (horizontal win probability bar above board)
// ═══════════════════════════════════════════════════════════════════════════
function EvalBar({ pct, delta }){
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,width:"100%",padding:"0 14px"}}>
      <div style={{
        fontSize:13, fontWeight:800, fontFamily:"Georgia,serif",
        color: delta>0.5 ? C.green : delta<-0.5 ? C.red : "#E8C84A",
        background:"rgba(44,20,4,0.75)",
        padding:"2px 12px", borderRadius:12,
        border:"1px solid rgba(232,200,74,0.3)",
        transition:"color 0.3s",
        minWidth:52, textAlign:"center",
      }}>
        {Math.round(pct)}%
      </div>
      <div style={{
        width:"100%", height:6, borderRadius:3,
        background:"#2b2018", overflow:"hidden",
        boxShadow:"inset 0 1px 2px rgba(0,0,0,0.4), 0 1px 1px rgba(255,255,255,0.1)",
        position:"relative",
      }}>
        <div style={{
          position:"absolute", left:0, top:0, bottom:0,
          width:`${pct}%`,
          background:"linear-gradient(90deg,#FDF6E3 0%,#F4EBD6 100%)",
          borderRadius:3,
          transition:"width 0.7s cubic-bezier(.4,0,.2,1)",
          boxShadow:"inset 0 1px 1px rgba(255,255,255,0.5)",
        }}/>
        <div style={{
          position:"absolute", left:"50%", top:-1, bottom:-1,
          width:1, background:"rgba(255,255,255,0.2)",
        }}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EDGE-TO-EDGE BOARD (with numbered points 1–24, gap down center, dice inline)
// Orientation: top-left = point 24 (idx 23). Bottom-right = point 1 (idx 0).
// ═══════════════════════════════════════════════════════════════════════════
function FlatBoard({
  board, selected, legalDests, onPointClick, onBearOff, borneOff=0,
  dice=[], diceUsed=[], highlightPoint=null, wrongFlashPoint=null
}){
  // Top row left→right: indices 23,22,21,20,19,18 | 17,16,15,14,13,12 (points 24→13)
  // Bot row left→right: indices 0,1,2,3,4,5        | 6,7,8,9,10,11     (points 1→12)
  const topRow = [23,22,21,20,19,18, 17,16,15,14,13,12];
  const botRow = [0, 1, 2, 3, 4, 5,  6, 7, 8, 9, 10,11];
  const canBearOff = legalDests.some(d=>d.to===-1);
  const isHL  = (idx) => legalDests.some(d=>d.to===idx);
  const isHit = (idx) => isHL(idx) && board[idx]===-1;

  const renderPoint = (ptIdx, colIdx, isTop) => {
    const val   = board[ptIdx]||0;
    const count = Math.abs(val);
    const isW   = val>0;
    const isSel = selected===ptIdx;
    const hl    = isHL(ptIdx);
    const hit   = isHit(ptIdx);
    const dark  = colIdx%2===0;
    const pointNumber = ptIdx+1;
    const wrongFlash = wrongFlashPoint===ptIdx;

    const triFill = dark ? C.triDark : C.triLight;
    const hlFill  = hit  ? "rgba(220,40,40,0.45)" : "rgba(74,143,63,0.35)";
    const hlStroke= hit  ? "#c94a3d" : "#4a8f3f";

    const MAX_SHOW = 5;
    const shown    = Math.min(count,MAX_SHOW);

    return (
      <div
        key={ptIdx}
        onClick={()=>onPointClick(ptIdx)}
        style={{
          flex:1, position:"relative", height:"100%",
          cursor:(val>0||hl)?"pointer":"default", minWidth:0,
        }}
      >
        {/* Triangle SVG fills cell */}
        <svg width="100%" height="100%" viewBox="0 0 40 160" preserveAspectRatio="none"
          style={{position:"absolute",inset:0}}>
          {isTop
            ? <polygon points="20,150 1,2 39,2"  fill={triFill} opacity={0.85}/>
            : <polygon points="20,10  1,158 39,158" fill={triFill} opacity={0.85}/>
          }
          {hl && isTop  && (<>
            <polygon points="20,150 1,2 39,2" fill={hlFill} style={{animation:"triPulse 1.3s ease-in-out infinite"}}/>
            <polygon points="20,150 1,2 39,2" fill="none" stroke={hlStroke} strokeWidth={2} style={{animation:"triPulse 1.3s ease-in-out infinite"}}/>
          </>)}
          {hl && !isTop && (<>
            <polygon points="20,10 1,158 39,158" fill={hlFill} style={{animation:"triPulse 1.3s ease-in-out infinite"}}/>
            <polygon points="20,10 1,158 39,158" fill="none" stroke={hlStroke} strokeWidth={2} style={{animation:"triPulse 1.3s ease-in-out infinite"}}/>
          </>)}
          {wrongFlash && (
            <rect x="0" y="0" width="40" height="160" fill="#c94a3d" opacity="0.5"
              style={{animation:"wrongFlash 0.5s ease-out forwards"}}/>
          )}
        </svg>

        {/* Point number */}
        <div style={{
          position:"absolute",
          [isTop?"top":"bottom"]: 3,
          left:"50%", transform:"translateX(-50%)",
          fontSize:9, fontWeight:600, color:C.pointNum,
          fontFamily:"system-ui, -apple-system, sans-serif",
          letterSpacing:0.5, pointerEvents:"none", zIndex:2,
        }}>{pointNumber}</div>

        {/* Checkers */}
        {count>0 && (
          <div style={{
            position:"absolute",
            top:    isTop ? 14 : "auto",
            bottom: isTop ? "auto" : 14,
            left:0, right:0,
            display:"flex",
            flexDirection: isTop ? "column" : "column-reverse",
            alignItems:"center", gap:1, zIndex:3, pointerEvents:"none",
          }}>
            {Array.from({length:shown}).map((_,i)=>(
              <div key={i} style={{
                width:"82%", aspectRatio:"1 / 1", borderRadius:"50%",
                flexShrink:0,
                background: isW
                  ? "radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4EBD6 35%, #D4C2A0 75%, #A09070 100%)"
                  : "radial-gradient(circle at 38% 30%, #6B4020 0%, #3D1E08 45%, #1A0A02 85%, #0A0402 100%)",
                border: isW
                  ? (isSel ? "2px solid #D4A017" : "1.5px solid #A08B60")
                  : "1.5px solid #0A0402",
                boxShadow: isSel&&isW
                  ? "0 0 0 2.5px rgba(212,160,23,0.75), 0 2px 8px rgba(0,0,0,0.4)"
                  : "0 2px 4px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.25)",
              }}/>
            ))}
            {count>MAX_SHOW && (
              <div style={{
                color: isW?"#2C1A0A":"#FDF6E3", fontSize:10, fontWeight:800,
                textShadow:"0 1px 2px rgba(0,0,0,0.6)", lineHeight:1,
              }}>+{count-MAX_SHOW}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Woven-cloth texture for the board felt
  const feltTexture = `
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.04), transparent 50%),
    repeating-linear-gradient(45deg, rgba(139,105,70,0.03) 0 2px, transparent 2px 4px),
    repeating-linear-gradient(-45deg, rgba(139,105,70,0.03) 0 2px, transparent 2px 4px),
    ${C.boardFelt}
  `;

  return (
    <div style={{
      position:"relative", width:"100%",
      background:feltTexture, userSelect:"none",
      display:"flex", flexDirection:"column",
    }}>

      {/* ── TOP ROW ── */}
      <div style={{display:"flex", height:180, flexShrink:0, position:"relative"}}>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {topRow.slice(0,6).map((ptIdx,ci)=>renderPoint(ptIdx,ci,true))}
        </div>
        <div style={{width:2, background:C.gapLine, flexShrink:0}}/>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {topRow.slice(6).map((ptIdx,ci)=>renderPoint(ptIdx,ci+6,true))}
        </div>
      </div>

      {/* ── MIDDLE (dice area, no bar) ── */}
      <div style={{
        height:50, flexShrink:0, position:"relative",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{position:"absolute", top:0, bottom:0, left:"50%", width:2, transform:"translateX(-50%)", background:C.gapLine}}/>
        {dice.length>0 && (
          <div style={{
            position:"absolute",
            right:"18%",
            top:"50%", transform:"translateY(-50%)",
            display:"flex", gap:8,
          }}>
            <Die value={dice[0]} size={38} used={diceUsed[0]}/>
            <Die value={dice[1]} size={38} used={diceUsed[1]}/>
          </div>
        )}
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{display:"flex", height:180, flexShrink:0, position:"relative"}}>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {botRow.slice(0,6).map((ptIdx,ci)=>renderPoint(ptIdx,ci,false))}
        </div>
        <div style={{width:2, background:C.gapLine, flexShrink:0}}/>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {botRow.slice(6).map((ptIdx,ci)=>renderPoint(ptIdx,ci+6,false))}
        </div>
      </div>

      {/* Bear-off tray (shown inline below board) */}
      <div
        onClick={canBearOff && onBearOff ? onBearOff : undefined}
        style={{
          margin:"8px 10px 0",
          background: canBearOff ? 'rgba(212,160,23,0.12)' : 'rgba(44,26,10,0.04)',
          border: canBearOff ? '2px solid rgba(212,160,23,0.6)' : '2px dashed rgba(44,26,10,0.18)',
          borderRadius:10,
          padding:'8px 12px',
          display:'flex', alignItems:'center', gap:10,
          cursor: canBearOff && onBearOff ? 'pointer' : 'default',
          transition:'all 0.25s',
          animation: canBearOff ? 'trayPulse 1.2s ease-in-out infinite' : 'none',
        }}
      >
        <div style={{display:'flex', flexWrap:'wrap', gap:3, minWidth:80, minHeight:24}}>
          {Array.from({length:Math.min(borneOff,15)}).map((_,i)=>(
            <div key={i} style={{
              width:18, height:18, borderRadius:'50%',
              background:'radial-gradient(circle at 38% 30%,#FFFFFF 0%,#F4EBD6 35%,#D4C2A0 75%,#A09070 100%)',
              border:'1.5px solid #A08B60',
              boxShadow:'0 1px 2px rgba(0,0,0,0.25)',
            }}/>
          ))}
          {borneOff===0 && (
            <div style={{color:'rgba(44,26,10,0.3)', fontSize:11, fontStyle:'italic', lineHeight:'24px'}}>no pieces yet</div>
          )}
        </div>
        <div style={{flex:1, textAlign:'right'}}>
          <div style={{color: canBearOff ? '#B8860B' : 'rgba(44,26,10,0.4)', fontSize:10, fontWeight:800, letterSpacing:1}}>
            {canBearOff ? 'TAP TO BEAR OFF' : 'BORNE OFF'}
          </div>
          <div style={{color: canBearOff ? '#B8860B' : 'rgba(44,26,10,0.5)', fontSize:16, fontWeight:800}}>
            {borneOff} / 15
          </div>
        </div>
      </div>

      <style>{`
        @keyframes triPulse{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes trayPulse{0%,100%{border-color:rgba(212,160,23,0.45)}50%{border-color:rgba(212,160,23,0.95)}}
        @keyframes wrongFlash{0%{opacity:0.5}100%{opacity:0}}
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED BEST-MOVE REPLAY
// ═══════════════════════════════════════════════════════════════════════════
function BestMoveReplay({ startBoard, moves, dice }) {
  const [display,setDisplay]=useState([...startBoard]);
  const [step,setStep]=useState(0);
  const [flashDests,setFlashDests]=useState([]);
  const [replayBorneOff,setReplayBorneOff]=useState(0);

  useEffect(()=>{
    setDisplay([...startBoard]); setStep(0); setFlashDests([]); setReplayBorneOff(0);
  },[startBoard,moves]);

  useEffect(()=>{
    if(step>=moves.length) return;
    setFlashDests([{to:moves[step].to}]);
    const t=setTimeout(()=>{
      if(moves[step].to===-1) setReplayBorneOff(n=>n+1);
      setDisplay(b=>applyMove(b,moves[step].from,moves[step].to));
      setFlashDests([]);
      setStep(s=>s+1);
    },700);
    return()=>clearTimeout(t);
  },[step, moves]); // eslint-disable-line react-hooks/exhaustive-deps

  return <FlatBoard
    board={display} selected={null} legalDests={flashDests}
    onPointClick={()=>{}} borneOff={replayBorneOff}
    dice={dice || []} diceUsed={[]}
  />;
}

// ═══════════════════════════════════════════════════════════════════════════
// BOARD INFO OVERLAY (educational modal, unchanged from original)
// ═══════════════════════════════════════════════════════════════════════════
function BoardInfoOverlay({ onClose }) {
  const quads=[
    {name:"Their Home Board",arabic:"بيتهم",color:"#C84040",pts:"Points 19–24",emoji:"🔴",desc:"Where your two back checkers start. Escaping is one of the key challenges in backgammon."},
    {name:"Their Outer Board",arabic:"خارجهم",color:"#A07010",pts:"Points 13–18",emoji:"🟡",desc:"Your opponent's outer board. Checkers passing through here are making their way home."},
    {name:"Your Outer Board",arabic:"خارجك",color:"#1060B0",pts:"Points 7–12",emoji:"🔵",desc:"Your outer board. Build structure here and prime your opponent's trapped checkers."},
    {name:"Your Home Board",arabic:"بيتك",color:"#208040",pts:"Points 1–6",emoji:"🟢",desc:"Once all your checkers arrive here, you can start bearing them off to win."},
  ];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(44,26,10,0.82)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20,backdropFilter:"blur(6px)"}}>
      <div style={{maxWidth:380,width:"100%",background:`linear-gradient(160deg,${C.card},${C.bg})`,border:`2px solid ${C.border}`,borderRadius:20,padding:"24px 20px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)",position:"relative",animation:"slideUp 0.3s ease"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,width:32,height:32,borderRadius:"50%",background:C.bgDeep,border:`1px solid ${C.border}`,color:C.textMid,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
        <div style={{marginBottom:16,paddingRight:40}}>
          <div style={{color:C.gold,fontSize:19,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:4}}>The Board</div>
          <div style={{color:C.textMid,fontSize:12,lineHeight:1.6}}>White pieces move from Their Home → Their Outer → Your Outer → Your Home, then bear off.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
          {quads.map((q,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${q.color}44`,borderLeft:`3px solid ${q.color}`,borderRadius:10,padding:"9px 12px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0}}>{q.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:q.color,fontSize:12,fontWeight:700}}>{q.name}</span>
                  <span style={{color:"#C8A060",fontSize:12,fontFamily:"Georgia,serif"}}>{q.arabic}</span>
                  <span style={{color:C.textSoft,fontSize:10,marginLeft:"auto"}}>{q.pts}</span>
                </div>
                <div style={{color:C.textMid,fontSize:11,lineHeight:1.5,marginTop:2}}>{q.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 12px",background:"rgba(44,26,10,0.05)",border:`1px solid ${C.border}`,borderRadius:8,display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"radial-gradient(circle at 38% 30%,#FFF,#C0B090)",border:"1.5px solid #A09070",flexShrink:0}}/>
          <div style={{color:C.textMid,fontSize:11,lineHeight:1.5}}><span style={{color:C.text,fontWeight:600}}>You play White.</span> Travel: Their Home → Their Outer → Your Outer → Your Home → Bear off!</div>
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"12px",background:C.goldBtn,border:"none",borderRadius:10,cursor:"pointer",color:"#FDF6E3",fontSize:14,fontWeight:800,letterSpacing:2,fontFamily:"Georgia,serif"}}>GOT IT</button>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME MODAL (unchanged)
// ═══════════════════════════════════════════════════════════════════════════
function WelcomeModal({ onClose }) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(44,26,10,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{maxWidth:360,width:"100%",background:`linear-gradient(160deg,${C.card},${C.bg})`,border:`2px solid ${C.border}`,borderRadius:20,padding:"32px 24px",boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"slideUp2 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:50,marginBottom:6}}>🎲</div>
          <div style={{fontSize:34,fontWeight:900,letterSpacing:4,color:C.gold,fontFamily:"Georgia,serif",marginBottom:2}}>SHESH BESH</div>
          <div style={{color:"#B07010",fontSize:20,letterSpacing:6,fontFamily:"Georgia,serif"}}>شش بش</div>
          <div style={{width:70,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto"}}/>
        </div>
        <div style={{color:C.textMid,fontSize:14,lineHeight:1.85,textAlign:"center",marginBottom:18,fontFamily:"Georgia,serif"}}>
          For over a thousand years, this game echoed through the coffeehouses of{" "}
          <span style={{color:C.gold,fontWeight:700}}>Istanbul</span>,{" "}
          <span style={{color:C.gold,fontWeight:700}}>Tehran</span>, and{" "}
          <span style={{color:C.gold,fontWeight:700}}>Beirut</span>.
        </div>
        <div style={{background:"rgba(184,134,11,0.08)",border:"1px solid rgba(184,134,11,0.2)",borderRadius:12,padding:"16px",marginBottom:18}}>
          <p style={{color:C.textMid,fontSize:13,lineHeight:1.85,margin:0,fontFamily:"Georgia,serif",fontStyle:"italic",textAlign:"center"}}>
            The name itself tells the story — <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Shesh</span> is Six in Persian.{" "}
            <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Besh</span> is Five in Turkish. A name born at the crossroads of two empires, carrying the spirit of a game that belonged to everyone.
          </p>
        </div>
        <div style={{color:C.textSoft,fontSize:12,lineHeight:1.7,textAlign:"center",marginBottom:22,fontFamily:"Georgia,serif"}}>
          Every dice roll has a name.<br/>Every position has a lesson.<br/>Master the ancient game — one puzzle at a time.
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"15px",background:C.goldBtn,border:"none",borderRadius:12,cursor:"pointer",color:"#FDF6E3",fontSize:16,fontWeight:800,letterSpacing:3,fontFamily:"Georgia,serif",boxShadow:"0 4px 20px rgba(184,134,11,0.3)"}}>
          YALLA — LET'S PLAY
        </button>
        <div style={{color:"#C8A060",fontSize:11,textAlign:"center",marginTop:12,letterSpacing:3}}>بسم الله</div>
      </div>
      <style>{`@keyframes slideUp2{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASHA ALERT (kept for fallback; mostly unused in new flow but preserved)
// ═══════════════════════════════════════════════════════════════════════════
function PashaAlert({ onClose }) {
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(44,26,10,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.card},${C.bg})`,border:`2px solid ${C.border}`,borderRadius:18,padding:"30px 28px",textAlign:"center",boxShadow:"0 16px 60px rgba(0,0,0,0.4)",animation:"shake 0.45s ease",maxWidth:280,width:"100%"}}>
        <div style={{fontSize:44,marginBottom:10}}>🎲</div>
        <div style={{color:C.gold,fontSize:22,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:8}}>Yalla, Pasha!</div>
        <div style={{color:C.textMid,fontSize:14,lineHeight:1.65,fontFamily:"Georgia,serif",marginBottom:20}}>Move your pieces on the board<br/>before pressing Go.</div>
        <button onClick={onClose} style={{padding:"11px 32px",background:C.goldBtn,border:"none",borderRadius:10,color:"#FDF6E3",cursor:"pointer",fontSize:13,fontWeight:800,letterSpacing:2,fontFamily:"Georgia,serif"}}>GOT IT</button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// IQ GAUGE (home screen, unchanged)
// ═══════════════════════════════════════════════════════════════════════════
function IQGauge({ iq }) {
  const pct=Math.min(Math.max((iq-800)/400,0),1);
  const r=30,circ=2*Math.PI*r;
  const col=iq>=1150?"#C84040":iq>=1050?"#A07010":iq>=950?"#1060B0":"#208040";
  const lbl=iq>=1150?"Expert":iq>=1050?"Advanced":iq>=950?"Intermediate":"Beginner";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{position:"relative",width:72,height:72}}>
        <svg width={72} height={72} viewBox="0 0 72 72">
          <circle cx={36} cy={36} r={r} fill="none" stroke={C.bgDeep} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*0.25} strokeLinecap="round" transform="rotate(135 36 36)"/>
          <circle cx={36} cy={36} r={r} fill="none" stroke={col} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*(1-pct*0.75)} strokeLinecap="round" transform="rotate(135 36 36)" style={{transition:"stroke-dashoffset 1s ease,stroke 0.5s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginTop:4}}>
          <div style={{color:C.text,fontSize:17,fontWeight:800,lineHeight:1}}>{iq}</div>
          <div style={{color:C.textSoft,fontSize:8,letterSpacing:1}}>IQ</div>
        </div>
      </div>
      <div style={{color:col,fontSize:9,fontWeight:700,letterSpacing:1}}>{lbl.toUpperCase()}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGGABLE POPUP WITH TABS (result screen — draggable to peek at board)
// ═══════════════════════════════════════════════════════════════════════════
function ResultPopup({ open, children, onClose }) {
  const popupRef = useRef(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const heightRef = useRef(0);

  useEffect(() => {
    if (!open) setDrag(0);
  }, [open]);

  const onStart = (clientY) => {
    if (popupRef.current) heightRef.current = popupRef.current.offsetHeight;
    startY.current = clientY;
    setDragging(true);
    setDrag(0);
  };
  const onMove = (clientY) => {
    if (!dragging) return;
    const d = Math.max(0, clientY - startY.current);
    setDrag(d);
  };
  const onEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const threshold = heightRef.current * 0.35;
    if (drag > threshold) { setDrag(0); onClose(); }
    else { setDrag(0); }
  };

  const touchMove = (e) => { if (dragging) e.preventDefault(); onMove(e.touches[0].clientY); };

  return (
    <div
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, zIndex:900,
        background: open ? "rgba(44,26,10,0.5)" : "rgba(44,26,10,0)",
        pointerEvents: open ? "auto" : "none",
        display:"flex", alignItems:"flex-end", justifyContent:"center",
        transition:"background 0.25s",
      }}
    >
      <div
        ref={popupRef}
        style={{
          width:"100%", maxWidth:520,
          background: C.card,
          borderRadius:"20px 20px 0 0",
          transform: open
            ? `translateY(${drag}px)`
            : "translateY(100%)",
          transition: dragging ? "none" : "transform 0.35s cubic-bezier(.2,.9,.3,1)",
          boxShadow:"0 -8px 32px rgba(0,0,0,0.25)",
          maxHeight:"82vh",
          overflowY:"auto",
          position:"relative",
        }}
      >
        {/* Drag handle zone */}
        <div
          onTouchStart={(e)=>onStart(e.touches[0].clientY)}
          onTouchMove={touchMove}
          onTouchEnd={onEnd}
          onMouseDown={(e)=>{
            onStart(e.clientY);
            const mm=(ev)=>onMove(ev.clientY);
            const mu=()=>{ onEnd(); window.removeEventListener("mousemove",mm); window.removeEventListener("mouseup",mu); };
            window.addEventListener("mousemove",mm);
            window.addEventListener("mouseup",mu);
            e.preventDefault();
          }}
          style={{
            display:"flex", justifyContent:"center",
            padding:"12px 20px 8px",
            cursor: dragging ? "grabbing" : "grab",
            touchAction:"none",
          }}
        >
          <div style={{
            width:44, height:5, borderRadius:3,
            background:"rgba(60,40,20,0.25)",
          }}/>
        </div>

        {/* Close button */}
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          width:32, height:32, borderRadius:"50%",
          background:"rgba(60,40,20,0.08)", border:"none",
          color:C.textMid, fontSize:14, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>

        <div style={{padding:"0 20px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function SheshBesh() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPasha,   setShowPasha  ] = useState(false);
  const [showInfo,    setShowInfo   ] = useState(false);
  const [screen,      setScreen     ] = useState("home");
  const [puzzleIdx,   setPuzzleIdx  ] = useState(0);
  const [iq,          setIq         ] = useState(1000);
  const [streak,      setStreak     ] = useState(0);
  const [totalCorrect,setTotalCorrect]= useState(0);
  const [totalAnswered,setTotalAnswered]=useState(0);

  const [liveBoard,  setLiveBoard ] = useState(null);
  const [diceLeft,   setDiceLeft  ] = useState([]);
  const [selected,   setSelected  ] = useState(null);
  const [legalDests, setLegalDests] = useState([]);
  const [movesDone,  setMovesDone ] = useState([]);
  const [borneOff,   setBorneOff  ] = useState(0);
  const [phase,      setPhase     ] = useState("playing"); // playing | result
  const [resultTab,  setResultTab ] = useState("yours");
  const [isCorrect,  setIsCorrect ] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [attempts,   setAttempts  ] = useState(0);
  const [popupOpen,  setPopupOpen ] = useState(false);

  // Eval bar state
  const [basePct,    setBasePct   ] = useState(50);
  const [currentPct, setCurrentPct] = useState(50);

  const puzzle      = PUZZLES[puzzleIdx%PUZZLES.length];
  const accuracy    = totalAnswered>0?Math.round((totalCorrect/totalAnswered)*100):0;
  const label       = diceLabel(puzzle.dice[0],puzzle.dice[1]);
  const movesNeeded = puzzle.dice[0]===puzzle.dice[1]?4:2;
  const iqDelta     = puzzle.difficulty==="Advanced"?18:puzzle.difficulty==="Intermediate"?12:8;

  function initPuzzle(p) {
    const dice=p.dice[0]===p.dice[1]?[p.dice[0],p.dice[0],p.dice[0],p.dice[0]]:[...p.dice];
    setLiveBoard([...p.board]);
    setDiceLeft(dice);
    setSelected(null);
    setLegalDests([]);
    setMovesDone([]);
    setBorneOff(0);
    setPhase("playing");
    setResultTab("yours");
    setAttempts(0);
    setWrongFlash(null);
    setPopupOpen(false);
    // Eval bar baseline from the starting position
    const startPct = evaluateBoard(p.board);
    setBasePct(startPct);
    setCurrentPct(startPct);
  }
  useEffect(()=>{ initPuzzle(PUZZLES[puzzleIdx%PUZZLES.length]); },[puzzleIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helper: does a prefix of moves match any best-move ordering?
  // Best move sequences are order-independent for regular rolls (either die first),
  // and for doubles all 4 moves in any order.
  function isMovePrefixValid(attemptedMoves, bestMoves) {
    if (attemptedMoves.length > bestMoves.length) return false;
    // Treat each move as a {from,to} pair. Attempted moves must be a valid subset
    // (by multiset) of best moves.
    const remaining = bestMoves.map(m=>`${m.from}->${m.to}`);
    for (const m of attemptedMoves) {
      const key = `${m.from}->${m.to}`;
      const idx = remaining.indexOf(key);
      if (idx === -1) return false;
      remaining.splice(idx,1);
    }
    return true;
  }

  function handlePointClick(ptIdx) {
    if (phase!=="playing"||!liveBoard) return;
    const val=liveBoard[ptIdx];

    if (selected===null) {
      if (val>0) { setSelected(ptIdx); setLegalDests(getLegalDests(liveBoard,ptIdx,diceLeft)); }
      return;
    }
    if (ptIdx===selected) { setSelected(null); setLegalDests([]); return; }

    const hl=legalDests.find(d=>d.to===ptIdx);
    if (hl) {
      tryMove(selected, ptIdx, hl.die);
      return;
    }
    if (val>0) { setSelected(ptIdx); setLegalDests(getLegalDests(liveBoard,ptIdx,diceLeft)); return; }
    setSelected(null); setLegalDests([]);
  }

  function handleBearOff() {
    if (phase !== 'playing' || !liveBoard || selected === null) return;
    const hl = legalDests.find(d => d.to === -1);
    if (!hl) return;
    tryMove(selected, -1, hl.die);
  }

  function tryMove(from, to, die){
    // Chess.com-style validation: check if this move continues a valid best-move sequence.
    const attempted = [...movesDone, {from, to}];
    const valid = isMovePrefixValid(attempted, puzzle.bestMoves);

    if (!valid) {
      // WRONG MOVE — snap back, flash, lose a little IQ, show popup
      setWrongFlash(to);
      setTimeout(()=>setWrongFlash(null), 500);
      setSelected(null); setLegalDests([]);
      setAttempts(n=>n+1);
      // Apply hypothetical board to evaluate the wrong-move win%
      const hypBoard = applyMove(liveBoard, from, to);
      const wrongPct = evaluateBoard(hypBoard);
      setCurrentPct(wrongPct);
      // Small IQ penalty per wrong attempt (capped)
      const K = 12;
      const expected = 1 / (1 + Math.pow(10, (1400 - iq) / 400));
      const penalty = Math.max(-5, Math.round(K * (0 - expected)));
      setIq(q=>Math.max(800, q + penalty));
      // Show error popup after brief delay to let the flash register
      setTimeout(()=>{
        setIsCorrect(false);
        setResultTab("yours");
        setPopupOpen(true);
        setPhase("result");
      }, 600);
      return;
    }

    // Correct move — apply it
    const nb = applyMove(liveBoard, from, to);
    const nd = [...diceLeft]; nd.splice(nd.indexOf(die),1);
    setLiveBoard(nb); setDiceLeft(nd);
    setMovesDone(attempted);
    if (to===-1) setBorneOff(n=>n+1);
    setSelected(null); setLegalDests([]);

    // Check if full sequence is complete
    if (attempted.length === puzzle.bestMoves.length) {
      const finalPct = evaluateBoard(nb);
      setCurrentPct(finalPct);
      setIsCorrect(true);
      setTotalAnswered(a=>a+1);
      setTotalCorrect(c=>c+1);
      // Full IQ credit if first try, half credit otherwise
      if (attempts === 0) {
        setStreak(s=>s+1);
        setIq(q=>Math.min(1200, q + iqDelta));
      } else {
        setIq(q=>Math.min(1200, q + Math.round(iqDelta/2)));
      }
      setTimeout(()=>{
        setResultTab("yours");
        setPopupOpen(true);
        setPhase("result");
      }, 900);
    }
  }

  function handleRetry(){
    // Reset the board to puzzle start, keep attempts counter
    const p = puzzle;
    const dice=p.dice[0]===p.dice[1]?[p.dice[0],p.dice[0],p.dice[0],p.dice[0]]:[...p.dice];
    setLiveBoard([...p.board]);
    setDiceLeft(dice);
    setSelected(null);
    setLegalDests([]);
    setMovesDone([]);
    setBorneOff(0);
    setPhase("playing");
    setCurrentPct(basePct);
    setPopupOpen(false);
  }

  function handleNextPuzzle(){
    if (!isCorrect) {
      // Mark as answered even if they gave up
      setTotalAnswered(a=>a+1);
      setStreak(0);
    }
    setPopupOpen(false);
    setTimeout(()=>setPuzzleIdx(i=>i+1), 200);
  }

  const yourBoard = movesDone.reduce((b,m)=>applyMove(b,m.from,m.to),[...puzzle.board]);
  const deltaPct  = currentPct - basePct;
  const diceUsedFlags = [
    diceLeft.length < (puzzle.dice[0]===puzzle.dice[1]?4:2) - (puzzle.dice[0]===puzzle.dice[1]?2:1),
    diceLeft.length < (puzzle.dice[0]===puzzle.dice[1]?2:0),
  ];

  // ── HOME SCREEN ────────────────────────────────────────────────────────────
  if(screen==="home") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},${C.bgDeep})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"Georgia,serif"}}>
      {showWelcome&&<WelcomeModal onClose={()=>setShowWelcome(false)}/>}
      <div style={{maxWidth:400,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:4}}>🎲</div>
          <div style={{fontSize:38,fontWeight:900,letterSpacing:4,color:C.gold,fontFamily:"Georgia,serif"}}>SHESH BESH</div>
          <div style={{color:"#B07010",fontSize:16,letterSpacing:6,marginTop:2}}>شش بش</div>
        </div>
        <div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:16,padding:"20px 24px",width:"100%",display:"flex",justifyContent:"space-around",alignItems:"center",boxShadow:"0 4px 20px rgba(44,26,10,0.12)"}}>
          <IQGauge iq={iq}/>
          <div style={{width:1,height:60,background:C.border}}/>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{textAlign:"center"}}>
              <div style={{color:C.gold,fontSize:22,fontWeight:800}}>{streak}🔥</div>
              <div style={{color:C.textSoft,fontSize:10,letterSpacing:1}}>STREAK</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:C.blue,fontSize:22,fontWeight:800}}>{accuracy}%</div>
              <div style={{color:C.textSoft,fontSize:10,letterSpacing:1}}>ACCURACY</div>
            </div>
          </div>
          <div style={{width:1,height:60,background:C.border}}/>
          <div style={{textAlign:"center"}}>
            <div style={{color:C.text,fontSize:22,fontWeight:800}}>{totalAnswered}</div>
            <div style={{color:C.textSoft,fontSize:10,letterSpacing:1}}>PUZZLES</div>
            <div style={{marginTop:8}}>
              <div style={{color:C.textMid,fontSize:14,fontWeight:700}}>#{Math.max(1,Math.round((1200-iq)*0.8)+1)}</div>
              <div style={{color:C.textSoft,fontSize:9,letterSpacing:1}}>GLOBAL RANK</div>
            </div>
          </div>
        </div>
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>setScreen("puzzle")} style={{width:"100%",padding:"16px",background:C.goldBtn,border:"none",borderRadius:12,cursor:"pointer",color:"#FDF6E3",fontSize:17,fontWeight:800,letterSpacing:3,boxShadow:"0 4px 16px rgba(184,134,11,0.3)",fontFamily:"Georgia,serif"}}>PLAY PUZZLES</button>
          <button onClick={()=>setScreen("learn")} style={{width:"100%",padding:"13px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:12,cursor:"pointer",color:C.textMid,fontSize:13,fontWeight:600,letterSpacing:2,fontFamily:"Georgia,serif"}}>DICE NAMES GUIDE 🎲</button>
        </div>
      </div>
    </div>
  );

  // ── LEARN SCREEN ────────────────────────────────────────────────────────────
  if(screen==="learn") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},${C.bgDeep})`,fontFamily:"Georgia,serif",paddingBottom:48}}>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`,background:C.card,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 8px rgba(44,26,10,0.08)"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:C.gold,fontSize:20,cursor:"pointer"}}>←</button>
          <div>
            <div style={{color:C.text,fontSize:17,fontWeight:700}}>Dice Roll Names</div>
            <div style={{color:"#B07010",fontSize:10,letterSpacing:2}}>THE TRADITIONAL LEXICON</div>
          </div>
        </div>
        <div style={{padding:"16px"}}>
          <p style={{color:C.textMid,fontSize:13,lineHeight:1.7,marginBottom:16,fontStyle:"italic"}}>In traditional Middle Eastern backgammon, every combination has a name rooted in Persian, Arabic, and Turkish — connecting players to centuries of shared history.</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {Object.entries(DICE_NAMES).map(([key,name])=>{
              const [d1,d2]=key.split("-").map(Number);
              return(
                <div key={key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <Die value={d1} size={32}/><Die value={d2} size={32}/>
                  <div style={{flex:1}}>
                    <div style={{color:C.gold,fontSize:15,fontWeight:700}}>{name}</div>
                    <div style={{color:C.textSoft,fontSize:11}}>{key.replace("-"," & ")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ── PUZZLE SCREEN (new edge-to-edge design) ────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:C.boardFelt,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column"}}>
      {showPasha&&<PashaAlert onClose={()=>setShowPasha(false)}/>}
      {showInfo &&<BoardInfoOverlay onClose={()=>setShowInfo(false)}/>}

      <div style={{maxWidth:520,margin:"0 auto",width:"100%",display:"flex",flexDirection:"column",minHeight:"100vh"}}>

        {/* ── Header ── */}
        <div style={{
          padding:"8px 12px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"rgba(44,20,4,0.95)",
          flexShrink:0,
          zIndex:10,
        }}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#E8C84A",fontSize:20,cursor:"pointer",padding:"4px 8px",borderRadius:6}}>←</button>
          <div style={{display:"flex",alignItems:"center",gap:0,background:"rgba(255,255,255,0.08)",borderRadius:20,border:"1px solid rgba(232,200,74,0.25)",overflow:"hidden"}}>
            {[{v:iq,l:"IQ",c:"#E8C84A"},{v:streak+"🔥",l:"STREAK",c:"#FDF6E3"},{v:accuracy+"%",l:"ACC",c:"#7EC8F0"}].map((x,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 14px",borderRight:i<2?"1px solid rgba(232,200,74,0.2)":"none"}}>
                <div style={{color:x.c,fontSize:13,fontWeight:800,lineHeight:1}}>{x.v}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:8,letterSpacing:1,marginTop:1}}>{x.l}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowInfo(true)} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(232,200,74,0.25)",color:"rgba(232,200,74,0.7)",fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontStyle:"italic",fontFamily:"Georgia,serif",flexShrink:0}}>ℹ</button>
        </div>

        {/* ── Eval bar ── */}
        <div style={{background:"rgba(44,20,4,0.95)",padding:"6px 0 10px",flexShrink:0}}>
          <EvalBar pct={currentPct} delta={deltaPct}/>
        </div>

        {/* ── Puzzle meta strip ── */}
        <div style={{padding:"10px 14px 6px",display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.05)"}}>
          <span style={{background:puzzle.diffColor+"22",color:puzzle.diffColor,fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:10,border:"1px solid "+puzzle.diffColor+"44",letterSpacing:0.5}}>{puzzle.difficulty.toUpperCase()}</span>
          <span style={{color:C.textMid,fontSize:11,fontWeight:600}}>{puzzle.concept}</span>
          <span style={{marginLeft:"auto",color:C.textSoft,fontSize:10}}>#{puzzleIdx+1}</span>
          <span style={{color:C.gold,fontSize:11,fontWeight:700,fontFamily:"Georgia,serif"}}>{label}</span>
        </div>

        {/* ── Board (edge-to-edge, numbered, with inline dice) ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",paddingBottom:8}}>
          {(phase==="playing") && (
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
          )}
          {phase==="result" && (
            resultTab==="yours"
              ? <FlatBoard
                  board={yourBoard}
                  selected={null}
                  legalDests={[]}
                  onPointClick={()=>{}}
                  borneOff={borneOff}
                  dice={[puzzle.dice[0], puzzle.dice[1]]}
                  diceUsed={[true,true]}
                />
              : <BestMoveReplay
                  startBoard={puzzle.board}
                  moves={puzzle.bestMoves}
                  dice={[puzzle.dice[0], puzzle.dice[1]]}
                />
          )}
        </div>

        {/* ── Hint strip at the bottom of puzzle screen (only during play) ── */}
        {phase==="playing" && (
          <div style={{padding:"8px 14px 14px",background:"rgba(44,20,4,0.08)",borderTop:"1px solid rgba(44,26,10,0.08)"}}>
            <p style={{margin:0,color:C.textMid,fontSize:12,lineHeight:1.5,fontStyle:"italic",textAlign:"center"}}>
              {puzzle.description}
            </p>
          </div>
        )}

      </div>{/* end max-width */}

      {/* ── Draggable Result Popup ── */}
      <ResultPopup open={popupOpen} onClose={()=>setPopupOpen(false)}>
        {/* Title + IQ change */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <span style={{fontSize:32}}>{isCorrect?"✅":"❌"}</span>
          <div style={{flex:1}}>
            <div style={{color:isCorrect?C.green:C.red,fontSize:20,fontWeight:800,fontFamily:"Georgia,serif"}}>
              {isCorrect ? (attempts===0 ? "Excellent move!" : "Solved!") : "Not the best play"}
            </div>
            <div style={{color:C.textSoft,fontSize:11,marginTop:2,letterSpacing:0.5}}>{puzzle.concept}</div>
          </div>
          {isCorrect && (
            <div style={{
              background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.4)",
              borderRadius:8, padding:"6px 12px", textAlign:"center",
            }}>
              <div style={{color:C.green,fontSize:16,fontWeight:800}}>+{attempts===0?iqDelta:Math.round(iqDelta/2)}</div>
              <div style={{color:C.textSoft,fontSize:9,letterSpacing:1}}>IQ</div>
            </div>
          )}
        </div>

        {/* Tabs — Your Move / Best Move */}
        <div style={{display:"flex",marginBottom:12,borderRadius:10,overflow:"hidden",border:`1.5px solid ${C.border}`}}>
          {["yours","best"].map(tab=>(
            <button key={tab} onClick={()=>setResultTab(tab)} style={{
              flex:1,padding:"10px",border:"none",cursor:"pointer",
              background: resultTab===tab
                ? (tab==="yours" ? (isCorrect?"rgba(46,125,50,0.1)":"rgba(183,28,28,0.08)") : "rgba(21,101,192,0.08)")
                : C.card,
              color: resultTab===tab
                ? (tab==="yours" ? (isCorrect?C.green:C.red) : C.blue)
                : C.textSoft,
              fontSize:12,fontWeight:700,letterSpacing:1,fontFamily:"Georgia,serif",transition:"all 0.25s",
              borderBottom: resultTab===tab
                ? `2.5px solid ${tab==="yours" ? (isCorrect?C.green:C.red) : C.blue}`
                : "2.5px solid transparent",
            }}>
              {tab==="yours"?(isCorrect?"✅ YOUR MOVE":"❌ YOUR MOVE"):"✨ BEST MOVE"}
            </button>
          ))}
        </div>

        {/* Win probability comparison */}
        <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
          <div style={{color:C.textMid,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>WIN PROBABILITY</div>
          <div style={{marginBottom:isCorrect?0:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{color:isCorrect?C.green:C.red,fontSize:12,fontWeight:700}}>{isCorrect?"✅":"❌"} Your move</span>
              <span style={{color:isCorrect?C.green:C.red,fontSize:16,fontWeight:800}}>{Math.round(currentPct)}%</span>
            </div>
            <div style={{height:12,background:C.bgDeep,borderRadius:6,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${currentPct}%`,background:isCorrect?"linear-gradient(90deg,#2E7D32,#66BB6A)":"linear-gradient(90deg,#B71C1C,#EF5350)",borderRadius:6,transition:"width 0.8s ease 0.1s"}}/>
            </div>
          </div>
          {!isCorrect && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{color:C.blue,fontSize:12,fontWeight:700}}>✨ Best move</span>
                <span style={{color:C.blue,fontSize:16,fontWeight:800}}>{Math.round(evaluateBoard(puzzle.bestMoves.reduce((b,m)=>applyMove(b,m.from,m.to),[...puzzle.board])))}%</span>
              </div>
              <div style={{height:12,background:C.bgDeep,borderRadius:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${evaluateBoard(puzzle.bestMoves.reduce((b,m)=>applyMove(b,m.from,m.to),[...puzzle.board]))}%`,background:"linear-gradient(90deg,#1565C0,#42A5F5)",borderRadius:6,transition:"width 0.8s ease 0.3s"}}/>
              </div>
            </div>
          )}
          {isCorrect && (
            <div style={{marginTop:8,padding:"7px 10px",background:"rgba(46,125,50,0.08)",borderRadius:6,border:"1px solid rgba(46,125,50,0.25)",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>🏆</span>
              <span style={{color:C.green,fontSize:12,fontWeight:700}}>You found the best move — win probability up {Math.round(Math.abs(deltaPct))}%</span>
            </div>
          )}
        </div>

        {/* Explanation */}
        <p style={{color:C.textMid,fontSize:13,lineHeight:1.7,margin:"0 0 16px",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
          "{isCorrect ? puzzle.bestExplanation : puzzle.yourExplanation+" "+puzzle.bestExplanation}"
        </p>

        <div style={{textAlign:"center",color:C.textSoft,fontSize:10,marginBottom:12,letterSpacing:1}}>
          ↕ DRAG HANDLE TO PEEK AT BOARD · TAP TABS TO COMPARE MOVES
        </div>

        {/* Actions */}
        {isCorrect ? (
          <button onClick={handleNextPuzzle} style={{
            width:"100%",padding:"15px",background:C.goldBtn,border:"none",borderRadius:12,
            cursor:"pointer",color:"#FDF6E3",fontSize:16,fontWeight:800,letterSpacing:3,
            fontFamily:"Georgia,serif",boxShadow:"0 4px 16px rgba(184,134,11,0.28)",
          }}>
            NEXT PUZZLE →
          </button>
        ) : (
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleNextPuzzle} style={{
              flex:1,padding:"14px",background:C.bgDeep,border:`1.5px solid ${C.border}`,
              borderRadius:12,cursor:"pointer",color:C.textMid,fontSize:13,fontWeight:700,
              letterSpacing:2,fontFamily:"Georgia,serif",
            }}>
              SKIP
            </button>
            <button onClick={handleRetry} style={{
              flex:2,padding:"14px",background:C.goldBtn,border:"none",borderRadius:12,
              cursor:"pointer",color:"#FDF6E3",fontSize:14,fontWeight:800,letterSpacing:2,
              fontFamily:"Georgia,serif",boxShadow:"0 4px 16px rgba(184,134,11,0.28)",
            }}>
              TRY AGAIN
            </button>
          </div>
        )}
      </ResultPopup>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
    </div>
  );
}