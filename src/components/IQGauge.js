import { C } from "../constants/palette";

export default function IQGauge({ iq, variant = "default" }) {
  const compact = variant === "compact";
  const box = compact ? 64 : 72;
  const r = compact ? 27 : 30;
  const pct = Math.min(Math.max((iq - 800) / 400, 0), 1);
  const circ = 2 * Math.PI * r;
  const col = iq >= 1150 ? "#C62828" : iq >= 1050 ? "#b45309" : iq >= 950 ? "#1565C0" : "#2E7D32";
  const lbl = iq >= 1150 ? "Expert" : iq >= 1050 ? "Advanced" : iq >= 950 ? "Intermediate" : "Beginner";
  const cx = compact ? 32 : 36;
  const fsIq = compact ? 15 : 17;
  const fsLblBand = compact ? 7.5 : 8;
  const fsTier = compact ? 8 : 9;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 2 : 3 }}>
      <div style={{ position: "relative", width: box, height: box }}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="rgba(212,169,58,0.28)"
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
            transform={`rotate(135 ${cx} ${cx})`}
          />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={col}
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct * 0.75)}
            strokeLinecap="round"
            transform={`rotate(135 ${cx} ${cx})`}
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
            marginTop: compact ? 3 : 4,
          }}
        >
          <div style={{ color: C.text, fontSize: fsIq, fontWeight: 800, lineHeight: 1 }}>{iq}</div>
          <div style={{ color: C.textSoft, fontSize: fsLblBand, letterSpacing: 1 }}>IQ</div>
        </div>
      </div>
      <div style={{ color: col, fontSize: fsTier, fontWeight: 700, letterSpacing: 1 }}>{lbl.toUpperCase()}</div>
    </div>
  );
}
