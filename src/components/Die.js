import { useEffect, useState } from "react";

const USED_SHIFT_PX = 7;

export default function Die({
  value,
  size = 46,
  used = false,
  rolling = false,
  /** 0 = first die, 1 = second — when used, slide apart horizontally */
  slotIndex = 0,
}) {
  const dots = {
    1: [[50, 50]],
    2: [
      [28, 28],
      [72, 72],
    ],
    3: [
      [28, 28],
      [50, 50],
      [72, 72],
    ],
    4: [
      [28, 28],
      [72, 28],
      [28, 72],
      [72, 72],
    ],
    5: [
      [28, 28],
      [72, 28],
      [50, 50],
      [28, 72],
      [72, 72],
    ],
    6: [
      [28, 22],
      [72, 22],
      [28, 50],
      [72, 50],
      [28, 78],
      [72, 78],
    ],
  };
  const fillParent = typeof size === "string" && String(size).trim().endsWith("%");
  const n = typeof size === "number" ? size : 46;

  const wrap = fillParent ? { width: "100%", height: "100%" } : { width: n, height: n };

  let borderRadius;
  if (fillParent) {
    borderRadius = "14.5%";
  } else {
    borderRadius = `${n * 0.14}px`;
  }

  const [showFace, setShowFace] = useState(() => Math.min(6, Math.max(1, value || 1)));

  useEffect(() => {
    if (rolling) {
      const tick = window.setInterval(() => {
        setShowFace(1 + Math.floor(Math.random() * 6));
      }, 72);
      return () => window.clearInterval(tick);
    }
    setShowFace(Math.min(6, Math.max(1, value || 1)));
    return undefined;
  }, [rolling, value]);

  const v = rolling ? showFace : Math.min(6, Math.max(1, value || 1));

  const usedShift = used ? (slotIndex === 0 ? -USED_SHIFT_PX : USED_SHIFT_PX) : 0;

  return (
    <div
      style={{
        ...wrap,
        position: "relative",
        flexShrink: 0,
        transform: used ? `translate(${usedShift}px, 5px) scale(0.92)` : "translate(0,0) scale(1)",
        opacity: used && !rolling ? 0.45 : 1,
        transition: "transform 0.42s cubic-bezier(0.24, 0.82, 0.28, 1), opacity 0.35s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          background: used ? "#C8B080" : "linear-gradient(145deg,#FFFEF0,#F0E8D0)",
          borderRadius,
          border: `2px solid ${used ? "#A09060" : "#8B6010"}`,
          boxShadow: used ? "none" : "0 3px 8px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.9)",
          animation: rolling ? "dieRolling 620ms linear infinite" : "none",
        }}
      >
        {rolling && (
          <style>{`
            @keyframes dieRolling {
              0% { transform: rotate(-8deg) scale(1.02); }
              50% { transform: rotate(8deg) scale(1.08); }
              100% { transform: rotate(-8deg) scale(1.02); }
            }
          `}</style>
        )}
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, display: "block" }}>
          {(dots[v] || []).map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={9} fill={used ? "#807050" : "#2C1A0A"} />
          ))}
        </svg>
      </div>
    </div>
  );
}
