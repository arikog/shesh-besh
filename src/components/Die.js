export default function Die({ value, size = 46, used = false }) {
  const dots = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
  };
  const fillParent = typeof size === "string" && String(size).trim().endsWith("%");
  const n = typeof size === "number" ? size : 46;

  const wrap = fillParent ? { width: "100%", height: "100%" } : { width: n, height: n };

  let borderRadius;
  if (fillParent) {
    borderRadius = "14.5%"; // proportional when die fills CQ-sized box
  } else {
    borderRadius = `${n * 0.14}px`;
  }

  return (
    <div
      style={{
        ...wrap,
        position: "relative",
        flexShrink: 0,
        background: used ? "#C8B080" : "linear-gradient(145deg,#FFFEF0,#F0E8D0)",
        borderRadius,
        border: `2px solid ${used ? "#A09060" : "#8B6010"}`,
        boxShadow: used
          ? "none"
          : "0 3px 8px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.9)",
        opacity: used ? 0.4 : 1,
        transition: "opacity 0.35s",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, display: "block" }}>
        {(dots[value] || []).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={9} fill={used ? "#807050" : "#2C1A0A"} />
        ))}
      </svg>
    </div>
  );
}
