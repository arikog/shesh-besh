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
  boardFelt: "#DFC796",      // light wheat cork
  triDark:   "#8B7355",      // muted warm brown (from reference)
  triLight:  "#C4AE87",      // subtle sandy tan (from reference)
  gapLine:   "rgba(80,55,30,0.22)",
  pointNum:  "rgba(70,50,25,0.45)",
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
// PUZZLES
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
    bestExplanation:"Hitting on the 7-point sends your opponent to the bar where they face a 67% chance of failing to re-enter. Win probability jumps sharply with this aggressive play.",
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
    bestExplanation:"Extending to a 5-prime traps both opponent checkers with no escape on 94% of rolls. Structural plays like this compound over the remaining game.",
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
    bestExplanation:"Holding your anchors preserves a 78% shot chance as your opponent bears off. Running the back checkers too early destroys your timing.",
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
    bestExplanation:"Bearing off two checkers extends your pip lead by 16. In a pure race, every checker off is worth about 1.5 pips.",
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
    bestExplanation:"Making the golden 5-point cleanly creates an anchor your opponent cannot attack. Leaving a blot here would be a 42% shot for disaster.",
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
// ═══════════════════════════════════════════════════════════════════════════
let _diceCache=null;
function diceCombos(){
  if(_diceCache) return _diceCache;
  const r=[]; for(let a=1;a<=6;a++) for(let b=1;b<=6;b++) r.push([a,b]);
  _diceCache=r; return r;
}
function estimateShotProb(board, blotIdx, attackerColor){
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
  let whitePips=0, darkPips=0;
  for(let i=0;i<24;i++){
    const v=board[i]||0;
    if(v>0) whitePips += v*(i+1);
    else if(v<0) darkPips += (-v)*(24-i);
  }
  let score = (darkPips - whitePips) * 0.008;
  for(let i=0;i<24;i++){
    const v=board[i]||0;
    if(v===1) score -= estimateShotProb(board, i, 'dark') * 0.25;
    else if(v===-1) score += estimateShotProb(board, i, 'white') * 0.25;
  }
  let whiteHome=0, darkHome=0;
  for(let i=0;i<=5;i++) if((board[i]||0)>=2) whiteHome++;
  for(let i=18;i<=23;i++) if((board[i]||0)<=-2) darkHome++;
  score += whiteHome*0.06 - darkHome*0.06;
  score += longestPrime(board,'white')*0.04;
  score -= longestPrime(board,'dark')*0.04;
  if((board[4]||0)>=2) score += 0.08;
  if((board[6]||0)>=2) score += 0.08;
  if((board[19]||0)<=-2) score -= 0.08;
  if((board[17]||0)<=-2) score -= 0.08;
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
// EVAL BAR
// ═══════════════════════════════════════════════════════════════════════════
function EvalBar({ pct, delta }){
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,width:"100%",padding:"0 14px"}}>
      <div style={{
        fontSize:13, fontWeight:800, fontFamily:"Georgia,serif",
        color: delta>0.5 ? C.green : delta<-0.5 ? C.red : C.text,
        background:"rgba(255,250,235,0.85)",
        padding:"2px 12px", borderRadius:12,
        border:"1px solid rgba(80,55,30,0.18)",
        transition:"color 0.3s",
        minWidth:52, textAlign:"center",
        backdropFilter:"blur(8px)",
      }}>
        {Math.round(pct)}%
      </div>
      <div style={{
        width:"100%", height:6, borderRadius:3,
        background:"rgba(80,55,30,0.3)", overflow:"hidden",
        boxShadow:"inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 1px rgba(255,255,255,0.4)",
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
          width:1, background:"rgba(80,55,30,0.25)",
        }}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FLAT BOARD — fills all available space via flex:1
// Top-left = point 24 (idx 23). Bottom-right = point 1 (idx 0).
// ═══════════════════════════════════════════════════════════════════════════
function FlatBoard({
  board, selected, legalDests, onPointClick, onBearOff, borneOff=0,
  dice=[], diceUsed=[], wrongFlashPoint=null
}){
  const topRow = [23,22,21,20,19,18, 17,16,15,14,13,12];
  const botRow = [0, 1, 2, 3, 4, 5,  6, 7, 8, 9, 10,11];
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
        <svg width="100%" height="100%" viewBox="0 0 40 160" preserveAspectRatio="none"
          style={{position:"absolute",inset:0}}>
          {isTop
            ? <polygon points="20,150 1,2 39,2"  fill={triFill} opacity={0.78}/>
            : <polygon points="20,10  1,158 39,158" fill={triFill} opacity={0.78}/>
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

        <div style={{
          position:"absolute",
          [isTop?"top":"bottom"]: 3,
          left:"50%", transform:"translateX(-50%)",
          fontSize:9, fontWeight:600, color:C.pointNum,
          fontFamily:"system-ui, -apple-system, sans-serif",
          letterSpacing:0.5, pointerEvents:"none", zIndex:2,
        }}>{pointNumber}</div>

        {count>0 && (
          <div style={{
            position:"absolute",
            top:    isTop ? 8 : "auto",
            bottom: isTop ? "auto" : 8,
            left:0, right:0,
            display:"flex",
            flexDirection: isTop ? "column" : "column-reverse",
            alignItems:"center", gap:0, zIndex:3, pointerEvents:"none",
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

  const feltTexture = `
    radial-gradient(circle at 15% 20%, rgba(255,250,235,0.12), transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(100,70,30,0.08), transparent 45%),
    repeating-linear-gradient(0deg, rgba(130,95,55,0.04) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(130,95,55,0.035) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(45deg, rgba(80,55,25,0.025) 0 2px, transparent 2px 5px),
    ${C.boardFelt}
  `;

  return (
    <div style={{
      position:"relative", width:"100%", flex:1,
      background:feltTexture, userSelect:"none",
      display:"flex", flexDirection:"column", minHeight:0,
    }}>
      {/* TOP row — fills half the board */}
      <div style={{display:"flex", flex:1, minHeight:0, position:"relative"}}>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {topRow.slice(0,6).map((ptIdx,ci)=>renderPoint(ptIdx,ci,true))}
        </div>
        <div style={{width:2, background:C.gapLine, flexShrink:0}}/>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {topRow.slice(6).map((ptIdx,ci)=>renderPoint(ptIdx,ci+6,true))}
        </div>
      </div>

      {/* MIDDLE strip with dice */}
      <div style={{
        height:60, flexShrink:0, position:"relative",
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
            <Die value={dice[0]} size={40} used={diceUsed[0]}/>
            <Die value={dice[1]} size={40} used={diceUsed[1]}/>
          </div>
        )}
      </div>

      {/* BOTTOM row — fills half the board */}
      <div style={{display:"flex", flex:1, minHeight:0, position:"relative"}}>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {botRow.slice(0,6).map((ptIdx,ci)=>renderPoint(ptIdx,ci,false))}
        </div>
        <div style={{width:2, background:C.gapLine, flexShrink:0}}/>
        <div style={{flex:1, display:"flex", minWidth:0}}>
          {botRow.slice(6).map((ptIdx,ci)=>renderPoint(ptIdx,ci+6,false))}
        </div>
      </div>

      <style>{`
        @keyframes triPulse{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes trayPulse{0%,100%{border-color:rgba(212,160,23,0.5)}50%{border-color:rgba(212,160,23,0.95)}}
        @keyframes wrongFlash{0%{opacity:0.5}100%{opacity:0}}
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME MODAL
// ═══════════════════════════════════════════════════════════════════════════
function WelcomeModal({ onClose }) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(44,26,10,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{maxWidth:360,width:"100%",background:`linear-gradient(160deg,${C.card},${C.bg})`,border:`2px solid ${C.border}`,borderRadius:20,padding:"32px 24px",boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"slideUp2 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:50,marginBottom:6}}>🎲</div>
          <div style={{fontSize:34,fontWeight:900,letterSpacing:4,color:C.gold,fontFamily:"Georgia,serif",marginBottom:2}}>SHESH BESH</div>
          <div style={{color:"#B07010",fontSize:20,letterSpacing:6,fontFamily:"Georgia,serif"}}>Նարդի</div>
          <div style={{width:70,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto"}}/>
        </div>
        <div style={{color:C.textMid,fontSize:14,lineHeight:1.85,textAlign:"center",marginBottom:18,fontFamily:"Georgia,serif"}}>
          For over a thousand years, this game echoed through the coffeehouses of{" "}
          <span style={{color:C.gold,fontWeight:700}}>Istanbul</span>,{" "}
          <span style={{color:C.gold,fontWeight:700}}>Tehran</span>,{" "}
          <span style={{color:C.gold,fontWeight:700}}>Yerevan</span>, and{" "}
          <span style={{color:C.gold,fontWeight:700}}>Beirut</span>.
        </div>
        <div style={{background:"rgba(184,134,11,0.08)",border:"1px solid rgba(184,134,11,0.2)",borderRadius:12,padding:"16px",marginBottom:18}}>
          <p style={{color:C.textMid,fontSize:13,lineHeight:1.85,margin:0,fontFamily:"Georgia,serif",fontStyle:"italic",textAlign:"center"}}>
            The names tell the story — <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Shesh</span> is Six in Persian,{" "}
            <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Besh</span> is Five in Turkish, and Armenians have played{" "}
            <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Նարդի</span> in town squares for generations. A game born at the crossroads of empires, belonging to everyone who played it.
          </p>
        </div>
        <div style={{color:C.textSoft,fontSize:12,lineHeight:1.7,textAlign:"center",marginBottom:22,fontFamily:"Georgia,serif"}}>
          Every dice roll has a name.<br/>Every position has a lesson.<br/>Master the ancient game — one puzzle at a time.
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"15px",background:C.goldBtn,border:"none",borderRadius:12,cursor:"pointer",color:"#FDF6E3",fontSize:16,fontWeight:800,letterSpacing:3,fontFamily:"Georgia,serif",boxShadow:"0 4px 20px rgba(184,134,11,0.3)"}}>
          YALLA — LET'S PLAY
        </button>
        <div style={{color:"#C8A060",fontSize:11,textAlign:"center",marginTop:12,letterSpacing:3}}>Բարի խաղ</div>
      </div>
      <style>{`@keyframes slideUp2{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// IQ GAUGE
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
// DRAGGABLE MINIMAL POPUP
// ═══════════════════════════════════════════════════════════════════════════
function ResultPopup({ open, children, onClose }) {
  const popupRef = useRef(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const heightRef = useRef(0);

  useEffect(() => { if (!open) setDrag(0); }, [open]);

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
          transform: open ? `translateY(${drag}px)` : "translateY(100%)",
          transition: dragging ? "none" : "transform 0.35s cubic-bezier(.2,.9,.3,1)",
          boxShadow:"0 -8px 32px rgba(0,0,0,0.25)",
          maxHeight:"82vh",
          overflowY:"auto",
          position:"relative",
        }}
      >
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
          <div style={{width:44, height:5, borderRadius:3, background:"rgba(60,40,20,0.25)"}}/>
        </div>

        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          width:32, height:32, borderRadius:"50%",
          background:"rgba(60,40,20,0.08)", border:"none",
          color:C.textMid, fontSize:14, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>

        <div style={{padding:"0 22px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function SheshBesh() {
  const [showWelcome, setShowWelcome] = useState(true);
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
  const [phase,      setPhase     ] = useState("playing");
  const [isCorrect,  setIsCorrect ] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [attempts,   setAttempts  ] = useState(0);
  const [popupOpen,  setPopupOpen ] = useState(false);

  const [basePct,    setBasePct   ] = useState(50);
  const [currentPct, setCurrentPct] = useState(50);

  const puzzle  = PUZZLES[puzzleIdx%PUZZLES.length];
  const accuracy= totalAnswered>0?Math.round((totalCorrect/totalAnswered)*100):0;
  const label   = diceLabel(puzzle.dice[0],puzzle.dice[1]);
  const iqDelta = puzzle.difficulty==="Advanced"?18:puzzle.difficulty==="Intermediate"?12:8;

  function initPuzzle(p) {
    const dice=p.dice[0]===p.dice[1]?[p.dice[0],p.dice[0],p.dice[0],p.dice[0]]:[...p.dice];
    setLiveBoard([...p.board]);
    setDiceLeft(dice);
    setSelected(null);
    setLegalDests([]);
    setMovesDone([]);
    setBorneOff(0);
    setPhase("playing");
    setAttempts(0);
    setWrongFlash(null);
    setPopupOpen(false);
    const startPct = evaluateBoard(p.board);
    setBasePct(startPct);
    setCurrentPct(startPct);
  }
  useEffect(()=>{ initPuzzle(PUZZLES[puzzleIdx%PUZZLES.length]); },[puzzleIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  function isMovePrefixValid(attemptedMoves, bestMoves) {
    if (attemptedMoves.length > bestMoves.length) return false;
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
    if (hl) { tryMove(selected, ptIdx, hl.die); return; }
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
    const attempted = [...movesDone, {from, to}];
    const valid = isMovePrefixValid(attempted, puzzle.bestMoves);

    if (!valid) {
      setWrongFlash(to);
      setTimeout(()=>setWrongFlash(null), 500);
      setSelected(null); setLegalDests([]);
      setAttempts(n=>n+1);
      const hypBoard = applyMove(liveBoard, from, to);
      const wrongPct = evaluateBoard(hypBoard);
      setCurrentPct(wrongPct);
      const K = 12;
      const expected = 1 / (1 + Math.pow(10, (1400 - iq) / 400));
      const penalty = Math.max(-5, Math.round(K * (0 - expected)));
      setIq(q=>Math.max(800, q + penalty));
      setTimeout(()=>{
        setIsCorrect(false);
        setPopupOpen(true);
        setPhase("result");
      }, 600);
      return;
    }

    const nb = applyMove(liveBoard, from, to);
    const nd = [...diceLeft]; nd.splice(nd.indexOf(die),1);
    setLiveBoard(nb); setDiceLeft(nd);
    setMovesDone(attempted);
    if (to===-1) setBorneOff(n=>n+1);
    setSelected(null); setLegalDests([]);

    if (attempted.length === puzzle.bestMoves.length) {
      const finalPct = evaluateBoard(nb);
      setCurrentPct(finalPct);
      setIsCorrect(true);
      setTotalAnswered(a=>a+1);
      setTotalCorrect(c=>c+1);
      if (attempts === 0) {
        setStreak(s=>s+1);
        setIq(q=>Math.min(1200, q + iqDelta));
      } else {
        setIq(q=>Math.min(1200, q + Math.round(iqDelta/2)));
      }
      setTimeout(()=>{
        setPopupOpen(true);
        setPhase("result");
      }, 900);
    }
  }

  function handleRetry(){
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
      setTotalAnswered(a=>a+1);
      setStreak(0);
    }
    setPopupOpen(false);
    setTimeout(()=>setPuzzleIdx(i=>i+1), 200);
  }

  function handleHint(){
    setPopupOpen(true);
    setPhase("hint");
  }

  const deltaPct = currentPct - basePct;
  const diceUsedFlags = [
    diceLeft.length < (puzzle.dice[0]===puzzle.dice[1]?4:2) - (puzzle.dice[0]===puzzle.dice[1]?2:1),
    diceLeft.length < (puzzle.dice[0]===puzzle.dice[1]?2:0),
  ];
  // Bear-off pocket is tappable only when a white checker is currently selected
  // AND that checker can legally bear off with a remaining die
  const canBearOffFromState = selected!==null && legalDests.some(d=>d.to===-1);

  // ── HOME ─────────────────────────────────────────────────────────────────
  if(screen==="home") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},${C.bgDeep})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"Georgia,serif"}}>
      {showWelcome&&<WelcomeModal onClose={()=>setShowWelcome(false)}/>}
      <div style={{maxWidth:400,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:4}}>🎲</div>
          <div style={{fontSize:38,fontWeight:900,letterSpacing:4,color:C.gold,fontFamily:"Georgia,serif"}}>SHESH BESH</div>
          <div style={{color:"#B07010",fontSize:16,letterSpacing:6,marginTop:2}}>Նարդի</div>
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

  // ── LEARN ────────────────────────────────────────────────────────────────
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
          <p style={{color:C.textMid,fontSize:13,lineHeight:1.7,marginBottom:16,fontStyle:"italic"}}>Across the Middle East and Caucasus, every dice combination has a name rooted in Persian, Arabic, and Turkish — connecting players to centuries of shared history.</p>
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

  // ── PUZZLE SCREEN ────────────────────────────────────────────────────────
  return(
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
        <button
          onClick={()=>setPopupOpen(true)}
          style={{
            position:"fixed",
            bottom:"calc(env(safe-area-inset-bottom, 0) + 20px)",
            left:"50%",
            transform:"translateX(-50%)",
            padding:"12px 24px",
            background: isCorrect ? "#4a8f3f" : "#c94a3d",
            color:"#FDF6E3",
            border:"none",
            borderRadius:24,
            fontSize:14, fontWeight:800, letterSpacing:2,
            fontFamily:"Georgia,serif",
            cursor:"pointer",
            boxShadow:"0 6px 20px rgba(0,0,0,0.28), 0 2px 4px rgba(0,0,0,0.12)",
            zIndex:850,
            animation:"fabSlideUp 0.3s ease",
            display:"flex", alignItems:"center", gap:8,
          }}
        >
          <span style={{fontSize:16}}>{isCorrect ? "✅" : "❌"}</span>
          {isCorrect ? "SEE NEXT PUZZLE" : "TRY AGAIN"}
        </button>
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
                <div style={{color:C.textSoft,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>WIN PROBABILITY</div>
                <div style={{color:C.green,fontSize:22,fontWeight:800}}>{Math.round(currentPct)}%</div>
              </div>
              <div style={{
                color:C.green, fontSize:15, fontWeight:800,
                background:"rgba(46,125,50,0.15)", padding:"6px 12px", borderRadius:8,
              }}>
                +{Math.round(Math.abs(deltaPct))}%
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
