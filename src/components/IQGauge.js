import { C } from "../constants/palette";

export default function IQGauge({ iq }) {
  const pct = Math.min(Math.max((iq - 800) / 400, 0), 1);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const col = iq >= 1150 ? "#C62828" : iq >= 1050 ? "#b45309" : iq >= 950 ? "#1565C0" : "#2E7D32";
  const lbl = iq >= 1150 ? "Expert" : iq >= 1050 ? "Advanced" : iq >= 950 ? "Intermediate" : "Beginner";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <svg width={72} height={72} viewBox="0 0 72 72">
          <circle
            cx={36}
            cy={36}
            r={r}
            fill="none"
            stroke="rgba(212,169,58,0.28)"
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
            transform="rotate(135 36 36)"
          />
          <circle
            cx={36}
            cy={36}
            r={r}
            fill="none"
            stroke={col}
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct * 0.75)}
            strokeLinecap="round"
            transform="rotate(135 36 36)"
            style={{ transition: "stroke-dashoffset 1s ease,stroke 0.5s" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <div style={{ color: C.text, fontSize: 17, fontWeight: 800, lineHeight: 1 }}>{iq}</div>
          <div style={{ color: C.textSoft, fontSize: 8, letterSpacing: 1 }}>IQ</div>
        </div>
      </div>
      <div style={{ color: col, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{lbl.toUpperCase()}</div>
    </div>
  );
}
