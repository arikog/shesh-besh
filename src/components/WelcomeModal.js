import { C } from "../constants/palette";

const hb = {
  fontFamily: "'Noto Sans Hebrew','Segoe UI',Helvetica,Arial,sans-serif",
  fontWeight: 700,
  color: C.gold,
  fontStyle: "normal",
};

export default function WelcomeModal({ onClose }) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(44,26,10,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{maxWidth:360,width:"100%",background:`linear-gradient(160deg,${C.card},${C.bg})`,border:`2px solid ${C.border}`,borderRadius:20,padding:"32px 24px",boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"slideUp2 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:50,marginBottom:6}}>🎲</div>
          <div style={{fontSize:34,fontWeight:900,letterSpacing:4,color:C.gold,fontFamily:"Georgia,serif",marginBottom:2}}>SHESH BESH</div>
          <div dir="rtl" lang="he" style={{color:"#B07010",fontSize:20,letterSpacing:6,fontFamily:"'Noto Sans Hebrew','Segoe UI',Helvetica,Arial,sans-serif"}}>שש בש</div>
          <div style={{width:70,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto"}}/>
        </div>
        <div style={{color:C.textMid,fontSize:14,lineHeight:1.85,textAlign:"center",marginBottom:18,fontFamily:"Georgia,serif"}}>
          For over two thousand years, this game outlasted the Roman and Byzantine empires, flourished across the{" "}
          <span style={{color:C.gold,fontWeight:700}}>Ottoman</span>{" "}
          world, reached France by the 11th century, and echoed through the coffeehouses of{" "}
          <span style={{color:C.gold,fontWeight:700}}>Istanbul</span>,{" "}
          <span style={{color:C.gold,fontWeight:700}}>Tehran</span>,{" "}
          <span style={{color:C.gold,fontWeight:700}}>Tel Aviv</span>,{" "}
          <span style={{color:C.gold,fontWeight:700}}>Beirut</span>, and beyond.
        </div>
        <div style={{background:"rgba(184,134,11,0.08)",border:"1px solid rgba(184,134,11,0.2)",borderRadius:12,padding:"16px",marginBottom:18}}>
          <p style={{color:C.textMid,fontSize:13,lineHeight:1.85,margin:0,fontFamily:"Georgia,serif",fontStyle:"italic",textAlign:"center"}}>
            The names tell the story — <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Shesh</span> is Six in Persian,{" "}
            <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Besh</span> is Five in Turkish, and Israelis have played{" "}
            <span dir="rtl" lang="he" style={hb}>שש בש</span> in cafés from{" "}
            <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Jaffa</span> to{" "}
            <span style={{color:C.gold,fontStyle:"normal",fontWeight:700}}>Jerusalem</span>. A game born at the crossroads of empires, carried west to medieval France, belonging to everyone who played it.
          </p>
        </div>
        <div style={{color:C.textSoft,fontSize:12,lineHeight:1.7,textAlign:"center",marginBottom:22,fontFamily:"Georgia,serif"}}>
          Every dice roll has a name.<br/>Every position has a lesson.<br/>Master the ancient game — one puzzle at a time.
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"15px",background:C.goldBtn,border:"none",borderRadius:12,cursor:"pointer",color:"#FDF6E3",fontSize:16,fontWeight:800,letterSpacing:3,fontFamily:"Georgia,serif",boxShadow:"0 4px 20px rgba(184,134,11,0.3)"}}>
          YALLA — LET'S PLAY
        </button>
        <div dir="rtl" lang="he" style={{color:"#C8A060",fontSize:11,textAlign:"center",marginTop:12,letterSpacing:3,fontFamily:"'Noto Sans Hebrew','Segoe UI',Helvetica,Arial,sans-serif"}}>בהצלחה</div>
      </div>
      <style>{`@keyframes slideUp2{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
