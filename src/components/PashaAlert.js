export default function PashaAlert({ isCorrect, onClick }) {
  return (
    <button
      onClick={onClick}
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
  );
}
