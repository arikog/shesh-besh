import { useState, useEffect } from "react";

// ── Palette ───────────────────────────────────────────────────────────────
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
  boardFrame:"#5C3010",
  triDark:   "#8B1A1A",
  triLight:  "#D4A030",
};

// ── Dice names ────────────────────────────────────────────────────────────
const DICE_NAMES = {
  "1-1":"Yak-Yak","2-1":"Yak-Du","2-2":"Dü-Dü","3-1":"Seh-Yek",
  "3-2":"Seh-Du","3-3":"Seh-Seh","4-1":"Char-Yek","4-2":"Char-Du",
  "4-3":"Char-Seh","4-4":"Dört-Dört","5-1":"Panj-Yek","5-2":"Panj-Du",
  "5-3":"Panj-Seh","5-4":"Panj-Char","5-5":"Hamsa","6-1":"Shesh-Yek",
  "6-2":"Shesh-Du","6-3":"Shesh-Seh","6-4":"Shesh-Char",
  "6-5":"Shesh-Besh","6-6":"Shesh-Shesh",
};
const diceLabel = (d1,d2) => DICE_NAMES[`${Math.max(d1,d2)}-${Math.min(d1,d2)}`]||`${d1}-${d2}`;

// ── Standard starting position ────────────────────────────────────────────
// Index 0 = point 1 (white home), index 23 = point 24 (black home)
// White (+) moves from high→low indices. Bears off below index 0.


// ── Puzzles ───────────────────────────────────────────────────────────────
const PUZZLES = [
  {
    id:1, difficulty:"Beginner", diffColor:C.green, concept:"Hitting a Blot",
    dice:[6,1],
    // white=15: 23×2,12×5,7×3,5×5 | black=15: 0×2,11×4,16×3,18×5,6×1(blot)
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
    description:"Your opponent left a blot on the 7-point. The dice are in your favour — what's the right play?",
  },
  {
    id:2, difficulty:"Intermediate", diffColor:"#E65100", concept:"Building a Prime",
    dice:[3,2],
    // white=15: 23×2,12×4,7×3,5×2,4×1,3×1,2×1,1×1 | black=15: 0×2,11×5,16×3,18×5
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
    description:"You're close to a 5-prime. Two opponent checkers are trapped. How do you seal the prison?",
  },
  {
    id:3, difficulty:"Advanced", diffColor:C.red, concept:"Back Game Timing",
    dice:[4,4],
    // white=15: 23×1,21×1,12×3,7×2,5×4,4×2,2×1,1×1 | black=15: 22×1,18×4,16×3,11×4,3×2,0×1
    board:(()=>{
      const b=new Array(24).fill(0);
      b[23]=1; b[21]=1; b[12]=3; b[7]=2; b[5]=4; b[4]=2; b[2]=1; b[1]=1;
      b[22]=-1; b[18]=-4; b[16]=-3; b[11]=-4; b[3]=-2; b[0]=-1;
      return b;
    })(),
    bestMoves:[{from:5,to:1},{from:4,to:0}],
    yourWinPct:38, bestWinPct:55,
    yourExplanation:"Running too early destroys your back game timing — you need to stay back to shoot.",
    bestExplanation:"Holding your anchors preserves a 78% shot chance as your opponent bears off, lifting win probability from 38% to 55%.",
    description:"You're playing a back game. Your timing is delicate — what move keeps your winning chances alive?",
  },
  {
    id:4, difficulty:"Beginner", diffColor:C.green, concept:"Bearing Off",
    dice:[5,3],
    // white=15 all home: 5×3,4×3,3×3,2×3,1×2,0×1 | black=15: 23×3,22×3,21×3,20×3,19×3
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
    description:"Pure race — no contact left. You lead on pips. What's the most efficient bearoff?",
  },
  {
    id:5, difficulty:"Intermediate", diffColor:"#E65100", concept:"Safe Point-Making",
    dice:[6,2],
    // white=15: 23×2,12×5,10×1,7×2,6×1,5×2,4×1,1×1 | black=15: 0×2,11×4,16×3,18×5,22×1
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
    description:"You can make the golden 5-point safely. Don't leave a blot — what's the clean play?",
  },
];

// ── Move engine ───────────────────────────────────────────────────────────
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

// ── Die face ──────────────────────────────────────────────────────────────
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

// ── Board ─────────────────────────────────────────────────────────────────
// Responsive: fills container width, points sized to fit
function WoodBoard({ board, selected, legalDests, onPointClick }) {
  // Top row: points 24→13 displayed left to right = indices 23→12
  // Bot row: points  1→12 displayed left to right = indices 0→11
  const topRow = [23,22,21,20,19,18, 17,16,15,14,13,12];
  const botRow = [0,  1, 2, 3, 4, 5,  6, 7, 8, 9,10,11];

  const isHL = (idx) => legalDests.some(d=>d.to===idx);
  const isHit= (idx) => isHL(idx) && board[idx]===-1;

  // Each half has 6 points + bar. We use flex with equal widths.
  const renderPoint = (ptIdx, colIdx, isTop) => {
    const val   = board[ptIdx]||0;
    const count = Math.abs(val);
    const isW   = val>0;
    const isSel = selected===ptIdx;
    const hl    = isHL(ptIdx);
    const hit   = isHit(ptIdx);
    const dark  = colIdx%2===0;

    // Triangle fill
    const triFill = dark ? "#8B1A1A" : "#D4A030";
    const hlFill  = hit  ? "rgba(220,40,40,0.55)" : "rgba(255,210,0,0.6)";
    const hlStroke= hit  ? "#FF3333" : "#FFD700";

    // Checker stacking: from base of triangle toward center
    // isTop → stack from top downward; !isTop → stack from bottom upward
    const MAX_SHOW = 5;
    const shown    = Math.min(count,MAX_SHOW);

    return (
      <div
        key={ptIdx}
        onClick={()=>onPointClick(ptIdx)}
        style={{
          flex:1,
          position:"relative",
          height:"100%",
          cursor:(val>0||hl)?"pointer":"default",
          minWidth:0,
        }}
      >
        {/* Triangle SVG — fills entire cell */}
        <svg width="100%" height="100%" viewBox="0 0 40 140" preserveAspectRatio="none"
          style={{position:"absolute",inset:0}}>
          {isTop
            ? <polygon points="20,130 1,2 39,2"  fill={triFill} opacity={0.85}/>
            : <polygon points="20,10  1,138 39,138" fill={triFill} opacity={0.85}/>
          }
          {hl && isTop  && <polygon points="20,130 1,2 39,2"    fill={hlFill} style={{animation:"triPulse 1s ease-in-out infinite"}}/>}
          {hl && !isTop && <polygon points="20,10  1,138 39,138" fill={hlFill} style={{animation:"triPulse 1s ease-in-out infinite"}}/>}
          {hl && isTop  && <polygon points="20,130 1,2 39,2"    fill="none" stroke={hlStroke} strokeWidth={2.5} style={{animation:"triPulse 1s ease-in-out infinite"}}/>}
          {hl && !isTop && <polygon points="20,10  1,138 39,138" fill="none" stroke={hlStroke} strokeWidth={2.5} style={{animation:"triPulse 1s ease-in-out infinite"}}/>}
        </svg>

        {/* Checkers */}
        {count>0 && (
          <div style={{
            position:"absolute",
            top:    isTop ? 3 : "auto",
            bottom: isTop ? "auto" : 3,
            left:0, right:0,
            display:"flex",
            flexDirection: isTop ? "column" : "column-reverse",
            alignItems:"center",
            gap:1,
            zIndex:3,
            pointerEvents:"none",
          }}>
            {Array.from({length:shown}).map((_,i)=>{
              return (
                <div key={i} style={{
                  width:"82%",
                  aspectRatio:"1 / 1",
                  borderRadius:"50%",
                  flexShrink:0,
                  background: isW
                    ? "radial-gradient(circle at 38% 30%, #FFFFFF 0%, #E8E8D8 35%, #B8B0A0 75%, #908880 100%)"
                    : "radial-gradient(circle at 38% 30%, #6B4020 0%, #3D1E08 45%, #1A0A02 85%, #0A0402 100%)",
                  border: isW
                    ? (isSel ? "2px solid #D4A017" : "1.5px solid #909080")
                    : "1.5px solid #0A0402",
                  boxShadow: isSel&&isW
                    ? "0 0 0 2.5px rgba(212,160,23,0.75), 0 2px 8px rgba(0,0,0,0.4)"
                    : "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.25)",
                }}/>
              );
            })}
            {count>MAX_SHOW && (
              <div style={{
                color: isW?"#2C1A0A":"#FDF6E3",
                fontSize:10,fontWeight:800,
                textShadow:"0 1px 2px rgba(0,0,0,0.6)",
                lineHeight:1,
              }}>+{count-MAX_SHOW}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Wood grain texture
  const woodGrain = `
    repeating-linear-gradient(88deg,
      rgba(0,0,0,0) 0px, rgba(0,0,0,0) 22px,
      rgba(0,0,0,0.018) 22px, rgba(0,0,0,0.018) 24px),
    linear-gradient(180deg,#C87030 0%,#B86020 35%,#A85020 60%,#B86828 100%)
  `;

  return (
    <div style={{
      background:C.boardFrame,
      borderRadius:12,
      padding:6,
      boxShadow:"0 8px 32px rgba(0,0,0,0.4),inset 0 2px 0 rgba(255,255,255,0.1)",
      border:"3px solid #3A1A08",
      userSelect:"none",
      width:"100%",
      boxSizing:"border-box",
    }}>
      {/* Quadrant labels TOP */}
      <div style={{display:"flex",marginBottom:3,paddingLeft:2,paddingRight:2}}>
        <div style={{flex:1,textAlign:"center",color:"#C84040",fontSize:7.5,fontWeight:800,letterSpacing:1.5}}>THEIR HOME</div>
        <div style={{width:20,flexShrink:0}}/>
        <div style={{flex:1,textAlign:"center",color:"#A07010",fontSize:7.5,fontWeight:800,letterSpacing:1.5}}>THEIR OUTER</div>
      </div>

      {/* Board surface */}
      <div style={{
        background:woodGrain,
        borderRadius:7,
        border:"2px solid #3A1A08",
        overflow:"hidden",
        display:"flex",
        flexDirection:"column",
      }}>

        {/* ── TOP ROW ── */}
        <div style={{display:"flex",height:140,flexShrink:0}}>
          {/* Left 6 points: indices 23-18 */}
          <div style={{flex:1,display:"flex",height:"100%",minWidth:0}}>
            {topRow.slice(0,6).map((ptIdx,ci)=>renderPoint(ptIdx,ci,true))}
          </div>
          {/* Bar */}
          <div style={{
            width:20,flexShrink:0,
            background:"linear-gradient(180deg,#7A3A10,#4A1A06,#7A3A10)",
            borderLeft:"2px solid #3A1A08",borderRight:"2px solid #3A1A08",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <div style={{width:3,height:"35%",background:"rgba(0,0,0,0.3)",borderRadius:2}}/>
          </div>
          {/* Right 6 points: indices 17-12 */}
          <div style={{flex:1,display:"flex",height:"100%",minWidth:0}}>
            {topRow.slice(6).map((ptIdx,ci)=>renderPoint(ptIdx,ci+6,true))}
          </div>
        </div>

        {/* ── MIDDLE RAIL ── */}
        <div style={{
          height:22,flexShrink:0,
          background:"linear-gradient(90deg,#6A2808,#4A1806,#6A2808)",
          borderTop:"2px solid #3A1A08",borderBottom:"2px solid #3A1A08",
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          <span style={{color:"#C89020",fontSize:11,fontWeight:800,letterSpacing:5,fontFamily:"Georgia,serif",opacity:0.8}}>شش بش</span>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{display:"flex",height:140,flexShrink:0}}>
          {/* Left 6 points: indices 0-5 */}
          <div style={{flex:1,display:"flex",height:"100%",minWidth:0}}>
            {botRow.slice(0,6).map((ptIdx,ci)=>renderPoint(ptIdx,ci,false))}
          </div>
          {/* Bar */}
          <div style={{
            width:20,flexShrink:0,
            background:"linear-gradient(180deg,#7A3A10,#4A1A06,#7A3A10)",
            borderLeft:"2px solid #3A1A08",borderRight:"2px solid #3A1A08",
          }}/>
          {/* Right 6 points: indices 6-11 */}
          <div style={{flex:1,display:"flex",height:"100%",minWidth:0}}>
            {botRow.slice(6).map((ptIdx,ci)=>renderPoint(ptIdx,ci+6,false))}
          </div>
        </div>

      </div>

      {/* Quadrant labels BOTTOM */}
      <div style={{display:"flex",marginTop:3,paddingLeft:2,paddingRight:2}}>
        <div style={{flex:1,textAlign:"center",color:"#208040",fontSize:7.5,fontWeight:800,letterSpacing:1.5}}>YOUR HOME</div>
        <div style={{width:20,flexShrink:0}}/>
        <div style={{flex:1,textAlign:"center",color:"#1060B0",fontSize:7.5,fontWeight:800,letterSpacing:1.5}}>YOUR OUTER</div>
      </div>

      <style>{`@keyframes triPulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
    </div>
  );
}

// ── Animated best-move replay ─────────────────────────────────────────────
function BestMoveReplay({ startBoard, moves }) {
  const [display,setDisplay]=useState([...startBoard]);
  const [step,setStep]=useState(0);
  const [flashDests,setFlashDests]=useState([]);

  useEffect(()=>{setDisplay([...startBoard]);setStep(0);setFlashDests([]);},[startBoard,moves]);

  useEffect(()=>{
    if(step>=moves.length) return;
    setFlashDests([{to:moves[step].to}]);
    const t=setTimeout(()=>{
      setDisplay(b=>applyMove(b,moves[step].from,moves[step].to));
      setFlashDests([]);
      setStep(s=>s+1);
    },700);
    return()=>clearTimeout(t);
  },[step, moves]); // eslint-disable-line react-hooks/exhaustive-deps

  return <WoodBoard board={display} selected={null} legalDests={flashDests} onPointClick={()=>{}}/>;
}

// ── Board Info Overlay ────────────────────────────────────────────────────
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

// ── Welcome Modal ─────────────────────────────────────────────────────────
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

// ── Pasha Alert ───────────────────────────────────────────────────────────
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

// ── IQ Gauge ──────────────────────────────────────────────────────────────
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

// ── Main App ──────────────────────────────────────────────────────────────
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
  const [phase,      setPhase     ] = useState("playing");
  const [resultTab,  setResultTab ] = useState("yours");
  const [isCorrect,  setIsCorrect ] = useState(false);

  const puzzle      = PUZZLES[puzzleIdx%PUZZLES.length];
  const accuracy    = totalAnswered>0?Math.round((totalCorrect/totalAnswered)*100):0;
  const label       = diceLabel(puzzle.dice[0],puzzle.dice[1]);
  const movesNeeded = puzzle.dice[0]===puzzle.dice[1]?4:2;
  const movesLeft   = movesNeeded-movesDone.length;
  const allUsed     = movesLeft<=0;
  const iqDelta     = puzzle.difficulty==="Advanced"?18:puzzle.difficulty==="Intermediate"?12:8;

  function initPuzzle(p) {
    const dice=p.dice[0]===p.dice[1]?[p.dice[0],p.dice[0],p.dice[0],p.dice[0]]:[...p.dice];
    setLiveBoard([...p.board]);
    setDiceLeft(dice);
    setSelected(null);
    setLegalDests([]);
    setMovesDone([]);
    setPhase("playing");
    setResultTab("yours");
  }
  useEffect(()=>{ initPuzzle(PUZZLES[puzzleIdx%PUZZLES.length]); },[puzzleIdx]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const nb=applyMove(liveBoard,selected,ptIdx);
      const nd=[...diceLeft]; nd.splice(nd.indexOf(hl.die),1);
      setLiveBoard(nb); setDiceLeft(nd);
      setMovesDone(m=>[...m,{from:selected,to:ptIdx}]);
      setSelected(null); setLegalDests([]);
      return;
    }
    if (val>0) { setSelected(ptIdx); setLegalDests(getLegalDests(liveBoard,ptIdx,diceLeft)); return; }
    setSelected(null); setLegalDests([]);
  }

  function handleGo() {
    if (movesDone.length===0) { setShowPasha(true); return; }
    setPhase("analysing");
    setTimeout(()=>{
      const best=puzzle.bestMoves;
      const pF=movesDone.map(m=>m.from).sort().join(",");
      const bF=best.map(m=>m.from).sort().join(",");
      const pT=movesDone.map(m=>m.to).sort().join(",");
      const bT=best.map(m=>m.to).sort().join(",");
      const correct=pF===bF&&pT===bT;
      setIsCorrect(correct);
      setTotalAnswered(a=>a+1);
      if(correct){ setTotalCorrect(c=>c+1); setStreak(s=>s+1); setIq(q=>Math.min(1200,q+iqDelta)); }
      else { setStreak(0); setIq(q=>Math.max(800,q-iqDelta)); }
      setPhase("result");
    },900);
  }

  const yourBoard=movesDone.reduce((b,m)=>applyMove(b,m.from,m.to),[...puzzle.board]);

  // ── HOME ─────────────────────────────────────────────────────────────────
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

  // ── PUZZLE ───────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},${C.bgDeep})`,fontFamily:"Georgia,serif",paddingBottom:48}}>
      {showPasha&&<PashaAlert onClose={()=>setShowPasha(false)}/>}
      {showInfo &&<BoardInfoOverlay onClose={()=>setShowInfo(false)}/>}
      <div style={{maxWidth:480,margin:"0 auto"}}>

        {/* Header */}
        <div style={{padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.card,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 8px rgba(44,26,10,0.08)"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:C.gold,fontSize:18,cursor:"pointer",padding:4}}>←</button>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            {[{v:iq,l:"BG IQ",c:C.gold},{v:`${streak}🔥`,l:"STREAK",c:C.text},{v:`${accuracy}%`,l:"ACC",c:C.blue}].map((x,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14}}>
                {i>0&&<div style={{width:1,height:22,background:C.border}}/>}
                <div style={{textAlign:"center"}}>
                  <div style={{color:x.c,fontSize:15,fontWeight:800}}>{x.v}</div>
                  <div style={{color:C.textSoft,fontSize:8,letterSpacing:1}}>{x.l}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowInfo(true)} style={{width:30,height:30,borderRadius:"50%",background:C.bgDeep,border:`1px solid ${C.border}`,color:C.textMid,fontSize:14,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontStyle:"italic",fontFamily:"Georgia,serif",flexShrink:0}}>ℹ</button>
        </div>

        {/* Meta */}
        <div style={{padding:"10px 14px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{background:`${puzzle.diffColor}18`,color:puzzle.diffColor,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,letterSpacing:1,border:`1px solid ${puzzle.diffColor}44`}}>{puzzle.difficulty.toUpperCase()}</span>
            <span style={{color:C.textSoft,fontSize:12}}>{puzzle.concept}</span>
          </div>
          <span style={{color:C.textSoft,fontSize:12}}>#{puzzleIdx+1}</span>
        </div>

        {/* Description */}
        <div style={{padding:"2px 14px 8px"}}>
          <p style={{color:C.textMid,fontSize:13,lineHeight:1.55,margin:0}}>{puzzle.description}</p>
        </div>

        {/* Dice row */}
        <div style={{padding:"0 14px 8px"}}>
          <div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 2px 8px rgba(44,26,10,0.07)"}}>
            {[puzzle.dice[0],puzzle.dice[1]].map((d,i)=>(
              <Die key={i} value={d} size={44} used={i<movesDone.length&&puzzle.dice[0]!==puzzle.dice[1]}/>
            ))}
            <div style={{flex:1,paddingLeft:6}}>
              <div style={{color:C.gold,fontSize:19,fontWeight:800}}>{label}</div>
              <div style={{color:C.textSoft,fontSize:11,marginTop:1,fontStyle:"italic"}}>
                {phase==="playing"
                  ? diceLeft.length>0?`${diceLeft.length} move${diceLeft.length!==1?"s":""} remaining`:"All moves used"
                  : phase==="analysing"?"Analysing...":""}
              </div>
            </div>
          </div>
        </div>

        {/* Turn / status indicator */}
        {phase==="playing" && (
          <div style={{padding:"0 14px 8px"}}>
            <div style={{
              background:"rgba(32,128,64,0.08)",
              border:"1px solid rgba(32,128,64,0.28)",
              borderRadius:10,padding:"8px 14px",
              display:"flex",alignItems:"center",gap:10,
            }}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#208040",boxShadow:"0 0 7px #208040",animation:"blink 1.5s ease-in-out infinite",flexShrink:0}}/>
              <span style={{color:"#208040",fontSize:12,fontWeight:700,letterSpacing:1}}>
                {allUsed ? "READY — PRESS GO" : `WHITE TO PLAY · ${movesLeft} MOVE${movesLeft!==1?"S":""} LEFT`}
              </span>
              {/* White checker icon */}
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"radial-gradient(circle at 38% 30%,#FFF,#C0B090)",border:"1.5px solid #A09070",flexShrink:0}}/>
                <span style={{color:C.textSoft,fontSize:11,fontWeight:700}}>WHITE</span>
              </div>
            </div>
          </div>
        )}
        {phase==="analysing" && (
          <div style={{padding:"0 14px 8px"}}>
            <div style={{background:"rgba(184,134,11,0.08)",border:"1px solid rgba(184,134,11,0.28)",borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:C.gold,boxShadow:`0 0 7px ${C.gold}`,animation:"blink 0.6s ease-in-out infinite",flexShrink:0}}/>
              <span style={{color:C.gold,fontSize:12,fontWeight:700,letterSpacing:2}}>ANALYSING...</span>
            </div>
          </div>
        )}

        {/* Board */}
        <div style={{padding:"0 14px 10px"}}>
          {(phase==="playing"||phase==="analysing") && (
            <WoodBoard board={liveBoard||puzzle.board} selected={selected} legalDests={legalDests} onPointClick={handlePointClick}/>
          )}
          {phase==="result" && (
            <>
              <div style={{display:"flex",marginBottom:8,borderRadius:10,overflow:"hidden",border:`1.5px solid ${C.border}`}}>
                {["yours","best"].map(tab=>(
                  <button key={tab} onClick={()=>setResultTab(tab)} style={{
                    flex:1,padding:"10px",border:"none",cursor:"pointer",
                    background:resultTab===tab?(tab==="yours"?(isCorrect?"rgba(46,125,50,0.1)":"rgba(183,28,28,0.08)"):"rgba(21,101,192,0.08)"):C.card,
                    color:resultTab===tab?(tab==="yours"?(isCorrect?C.green:C.red):C.blue):C.textSoft,
                    fontSize:12,fontWeight:700,letterSpacing:1,fontFamily:"Georgia,serif",transition:"all 0.25s",
                    borderBottom:resultTab===tab?`2.5px solid ${tab==="yours"?(isCorrect?C.green:C.red):C.blue}`:"2.5px solid transparent",
                  }}>
                    {tab==="yours"?(isCorrect?"✅ YOUR MOVE":"❌ YOUR MOVE"):"✨ BEST MOVE"}
                  </button>
                ))}
              </div>
              {resultTab==="yours"
                ?<WoodBoard board={yourBoard} selected={null} legalDests={[]} onPointClick={()=>{}}/>
                :<BestMoveReplay startBoard={puzzle.board} moves={puzzle.bestMoves}/>
              }
            </>
          )}
        </div>

        {/* GO button */}
        {phase==="playing" && (
          <div style={{padding:"0 14px 12px"}}>
            <button onClick={handleGo} style={{
              width:"100%",padding:"15px",borderRadius:12,border:"none",cursor:"pointer",
              background:allUsed?C.goldBtn:C.bgDeep,
              color:allUsed?"#FDF6E3":C.textSoft,
              fontSize:16,fontWeight:800,letterSpacing:3,fontFamily:"Georgia,serif",
              outline:allUsed?"none":`1px solid ${C.border}`,
              boxShadow:allUsed?"0 4px 16px rgba(184,134,11,0.28)":"none",
              transition:"all 0.3s",
            }}>
              {movesDone.length===0?"MOVE YOUR PIECES FIRST":allUsed?"GO →":`USE ALL ${movesLeft} DICE`}
            </button>
          </div>
        )}

        {/* Result panel */}
        {phase==="result" && (
          <div style={{padding:"0 14px",animation:"fadeIn 0.4s ease"}}>
            <div style={{
              background:isCorrect?"rgba(46,125,50,0.07)":"rgba(183,28,28,0.06)",
              border:`1.5px solid ${isCorrect?"rgba(46,125,50,0.35)":"rgba(183,28,28,0.3)"}`,
              borderRadius:14,padding:"16px",marginBottom:12,
            }}>
              {/* Verdict */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span style={{fontSize:28}}>{isCorrect?"✅":"❌"}</span>
                <div style={{flex:1}}>
                  <div style={{color:isCorrect?C.green:C.red,fontSize:16,fontWeight:800}}>{isCorrect?"Excellent move!":"Not the best play"}</div>
                  <div style={{color:C.textSoft,fontSize:11,marginTop:2}}>{puzzle.concept}</div>
                </div>
                <div style={{background:isCorrect?"rgba(46,125,50,0.1)":"rgba(183,28,28,0.1)",border:`1px solid ${isCorrect?"rgba(46,125,50,0.4)":"rgba(183,28,28,0.35)"}`,borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                  <div style={{color:isCorrect?C.green:C.red,fontSize:16,fontWeight:800}}>{isCorrect?"+":"-"}{iqDelta}</div>
                  <div style={{color:C.textSoft,fontSize:9,letterSpacing:1}}>IQ</div>
                </div>
              </div>

              {/* Win probability comparison */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
                <div style={{color:C.textMid,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>WIN PROBABILITY</div>
                {/* Your move */}
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{color:isCorrect?C.green:C.red,fontSize:12,fontWeight:700}}>{isCorrect?"✅":"❌"} Your move</span>
                    <span style={{color:isCorrect?C.green:C.red,fontSize:16,fontWeight:800}}>{isCorrect?puzzle.bestWinPct:puzzle.yourWinPct}%</span>
                  </div>
                  <div style={{height:12,background:C.bgDeep,borderRadius:6,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${isCorrect?puzzle.bestWinPct:puzzle.yourWinPct}%`,background:isCorrect?"linear-gradient(90deg,#2E7D32,#66BB6A)":"linear-gradient(90deg,#B71C1C,#EF5350)",borderRadius:6,transition:"width 0.8s ease 0.1s"}}/>
                  </div>
                </div>
                {!isCorrect && (<div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{color:C.blue,fontSize:12,fontWeight:700}}>✨ Best move</span>
                    <span style={{color:C.blue,fontSize:16,fontWeight:800}}>{puzzle.bestWinPct}%</span>
                  </div>
                  <div style={{height:12,background:C.bgDeep,borderRadius:6,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${puzzle.bestWinPct}%`,background:"linear-gradient(90deg,#1565C0,#42A5F5)",borderRadius:6,transition:"width 0.8s ease 0.3s"}}/>
                  </div>
                  <div style={{marginTop:10,padding:"6px 10px",background:"rgba(183,28,28,0.07)",borderRadius:6,border:"1px solid rgba(183,28,28,0.2)"}}>
                    <span style={{color:C.red,fontSize:12,fontWeight:700}}>This move cost you {puzzle.bestWinPct-puzzle.yourWinPct}% win probability</span>
                  </div>
                </div>)}
                {isCorrect && (
                  <div style={{marginTop:8,padding:"7px 10px",background:"rgba(46,125,50,0.08)",borderRadius:6,border:"1px solid rgba(46,125,50,0.25)",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14}}>🏆</span>
                    <span style={{color:C.green,fontSize:12,fontWeight:700}}>You found the best move — no better play exists in this position</span>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <p style={{color:C.textMid,fontSize:13,lineHeight:1.7,margin:0,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                "{isCorrect ? puzzle.bestExplanation : puzzle.yourExplanation+" "+puzzle.bestExplanation}"
              </p>
            </div>

            <div style={{textAlign:"center",color:C.textSoft,fontSize:11,marginBottom:10,letterSpacing:1}}>
              ↑ TAP TABS ABOVE TO COMPARE MOVES ON THE BOARD
            </div>

            <button onClick={()=>setPuzzleIdx(i=>i+1)} style={{
              width:"100%",padding:"15px",background:C.goldBtn,border:"none",borderRadius:12,
              cursor:"pointer",color:"#FDF6E3",fontSize:16,fontWeight:800,letterSpacing:3,
              fontFamily:"Georgia,serif",boxShadow:"0 4px 16px rgba(184,134,11,0.28)",
            }}>
              NEXT PUZZLE →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
    </div>
  );
}
