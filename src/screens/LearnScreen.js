import { C } from "../constants/palette";
import { DICE_NAMES } from "../constants/dice";
import Die from "../components/Die";

export default function LearnScreen({ setScreen }) {
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},${C.bgDeep})`,fontFamily:"Georgia,serif",paddingBottom:48}}>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`,background:C.card,position:"sticky",top:0,zIndex:10,boxShadow:C.chromeShadow}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:C.gold,fontSize:20,cursor:"pointer"}}>←</button>
          <div>
            <div style={{color:C.text,fontSize:17,fontWeight:700}}>Dice Roll Names</div>
            <div style={{color:C.hebrewMuted,fontSize:10,letterSpacing:2}}>THE TRADITIONAL LEXICON</div>
          </div>
        </div>
        <div style={{padding:"16px"}}>
          <p style={{color:C.textBody,fontSize:13,lineHeight:1.7,marginBottom:16,fontStyle:"italic"}}>Across the Middle East and Caucasus, every dice combination has a name rooted in Persian, Arabic, and Turkish — connecting players to centuries of shared history.</p>
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
}
