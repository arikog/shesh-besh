import { C } from "../constants/palette";

export default function EvalBar({ pct, delta }){
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
