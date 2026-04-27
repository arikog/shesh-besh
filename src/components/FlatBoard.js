import { C } from "../constants/palette";
import Die from "./Die";

export default function FlatBoard({
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
