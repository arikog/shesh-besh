import { useEffect } from "react";
import { C } from "../constants/palette";
import WelcomeModal from "../components/WelcomeModal";
import IQGauge from "../components/IQGauge";
import { loadProgress } from "../storage/progress";

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

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},${C.bgDeep})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"Georgia,serif"}}>
      {showWelcome&&<WelcomeModal onClose={()=>setShowWelcome(false)}/>}
      <div style={{maxWidth:400,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:4}}>🎲</div>
          <div style={{fontSize:38,fontWeight:900,letterSpacing:4,color:C.gold,fontFamily:"Georgia,serif"}}>SHESH BESH</div>
          <div dir="rtl" lang="he" style={{color:"#B07010",fontSize:16,letterSpacing:6,marginTop:2,fontFamily:"'Noto Sans Hebrew','Segoe UI',Helvetica,Arial,sans-serif"}}>שש בש</div>
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
          <button
            onClick={() => {
              setPuzzleIdx((prev) => prev + 1);
              setScreen("puzzle");
            }}
            style={{width:"100%",padding:"16px",background:C.goldBtn,border:"none",borderRadius:12,cursor:"pointer",color:"#FDF6E3",fontSize:17,fontWeight:800,letterSpacing:3,boxShadow:"0 4px 16px rgba(184,134,11,0.3)",fontFamily:"Georgia,serif"}}
          >
            PLAY MIXED PUZZLES
          </button>
          <button onClick={()=>setScreen("categories")} style={{width:"100%",padding:"12px",background:"rgba(184,134,11,0.12)",border:`1.5px solid ${C.border}`,borderRadius:12,cursor:"pointer",color:C.textMid,fontSize:12,fontWeight:700,letterSpacing:2,fontFamily:"Georgia,serif"}}>CATEGORY PERFORMANCE</button>
          <button onClick={()=>setScreen("learn")} style={{width:"100%",padding:"13px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:12,cursor:"pointer",color:C.textMid,fontSize:13,fontWeight:600,letterSpacing:2,fontFamily:"Georgia,serif"}}>DICE NAMES GUIDE 🎲</button>
        </div>
      </div>
    </div>
  );
}
