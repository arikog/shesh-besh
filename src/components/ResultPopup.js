import { useEffect, useRef, useState } from "react";
import { C } from "../constants/palette";

export default function ResultPopup({ open, children, onClose }) {
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
        background: open ? C.overlayBackdrop : "rgba(74,10,10,0)",
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
          boxShadow:`0 -8px 32px rgba(0,0,0,0.35), inset 0 2px 0 rgba(212,169,58,0.12)`,
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
          <div style={{ width: 44, height: 5, borderRadius: 3, background: "rgba(212,169,58,0.35)" }}/>
        </div>

        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          width:32, height:32, borderRadius:"50%",
          background: C.accentWashBold, border: "none",
          color:C.textMid, fontSize:14, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>

        <div style={{padding:"0 22px 28px"}}>{children}</div>
      </div>
    </div>
  );
}
