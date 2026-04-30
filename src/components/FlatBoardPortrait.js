import { C } from "../constants/palette";
import Die from "./Die";

/** Portrait phone: same indices as FlatBoard; vertical bar, tall triangles (not a rotated board). */
const portraitBoardVarsCss = `
  [data-flat-board-portrait-root]{
    height:100%;
    min-height:0;
    --board-bar: clamp(3px, 0.5cqw, 8px);
    --label-strip-h: clamp(14px, 3.35cqh, 30px);
    --dice-strip-h: clamp(44px, 6.85cqw, 88px);
    --half-h: calc((100cqh - var(--dice-strip-h)) / 2);
    --point-play-h: calc(var(--half-h) - var(--label-strip-h));
    --checker-size: min(calc((100cqw - var(--board-bar)) / 14), calc(var(--point-play-h) / 5.35));
    --dice-face: min(calc(var(--checker-size) * 1.05), clamp(44px, 11cqw, 88px));
  }
`;

export default function FlatBoardPortrait({
  board,
  selected,
  legalDests,
  onPointClick,
  dice = [],
  diceUsed = [],
  wrongFlashPoint = null,
}) {
  const topRow = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12];
  const botRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const isHL = (idx) => legalDests.some((d) => d.to === idx);
  const isHit = (idx) => isHL(idx) && board[idx] === -1;

  const MAX_SHOW = 5;

  const renderNumberCell = (ptIdx) => {
    const pointNumber = ptIdx + 1;
    return (
      <div
        key={`n-${ptIdx}`}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(8px, 1.95cqw, 13px)",
          fontWeight: 600,
          color: C.pointNum,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: 0.5,
          pointerEvents: "none",
          position: "relative",
          zIndex: 40,
          userSelect: "none",
        }}
      >
        {pointNumber}
      </div>
    );
  };

  const stripTop = (
    <div
      role="presentation"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        flexShrink: 0,
        height: "var(--label-strip-h)",
        minHeight: "var(--label-strip-h)",
        borderBottom: `1px solid rgba(60,42,22,0.12)`,
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0 }}>
        {topRow.slice(0, 6).map((ptIdx) => renderNumberCell(ptIdx))}
      </div>
      <div style={{ width: "var(--board-bar)", flexShrink: 0, background: C.gapLine }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0 }}>
        {topRow.slice(6).map((ptIdx) => renderNumberCell(ptIdx))}
      </div>
    </div>
  );

  const stripBot = (
    <div
      role="presentation"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        flexShrink: 0,
        height: "var(--label-strip-h)",
        minHeight: "var(--label-strip-h)",
        borderTop: `1px solid rgba(60,42,22,0.12)`,
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0 }}>
        {botRow.slice(0, 6).map((ptIdx) => renderNumberCell(ptIdx))}
      </div>
      <div style={{ width: "var(--board-bar)", flexShrink: 0, background: C.gapLine }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0 }}>
        {botRow.slice(6).map((ptIdx) => renderNumberCell(ptIdx))}
      </div>
    </div>
  );

  const renderPoint = (ptIdx, colIdx, isTop) => {
    const val = board[ptIdx] || 0;
    const count = Math.abs(val);
    const isW = val > 0;
    const isSel = selected === ptIdx;
    const hl = isHL(ptIdx);
    const hit = isHit(ptIdx);
    const dark = colIdx % 2 === 0;
    const wrongFlash = wrongFlashPoint === ptIdx;

    const triFill = dark ? C.triDark : C.triLight;
    const hlFill = hit ? "rgba(220,40,40,0.45)" : "rgba(74,143,63,0.35)";
    const hlStroke = hit ? "#c94a3d" : "#4a8f3f";

    const shown = Math.min(count, MAX_SHOW);

    const checkerGap = "calc(var(--checker-size) * 0.035)";

    return (
      <div
        key={ptIdx}
        onClick={() => onPointClick(ptIdx)}
        style={{
          flex: 1,
          position: "relative",
          height: "100%",
          cursor: val > 0 || hl ? "pointer" : "default",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 50 250"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0 }}
        >
          {isTop ? (
            <polygon points="25,237 3,6 47,6" fill={triFill} opacity={0.78} />
          ) : (
            <polygon points="25,13 3,244 47,244" fill={triFill} opacity={0.78} />
          )}
          {hl && isTop && (
            <>
              <polygon points="25,237 3,6 47,6" fill={hlFill} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
              <polygon points="25,237 3,6 47,6" fill="none" stroke={hlStroke} strokeWidth={2} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
            </>
          )}
          {hl && !isTop && (
            <>
              <polygon points="25,13 3,244 47,244" fill={hlFill} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
              <polygon points="25,13 3,244 47,244" fill="none" stroke={hlStroke} strokeWidth={2} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
            </>
          )}
          {wrongFlash && (
            <rect x="0" y="0" width="50" height="250" fill="#c94a3d" opacity="0.5" style={{ animation: "wrongFlash 0.5s ease-out forwards" }} />
          )}
        </svg>

        {count > 0 && (
          <div
            style={{
              position: "absolute",
              top: isTop ? "1%" : "auto",
              bottom: isTop ? "auto" : "1%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxHeight: "calc(100% - 2%)",
              display: "flex",
              flexDirection: isTop ? "column" : "column-reverse",
              alignItems: "center",
              justifyContent: isTop ? "flex-start" : "flex-start",
              gap: checkerGap,
              zIndex: 12,
              pointerEvents: "none",
              paddingTop: isTop ? 2 : 0,
              paddingBottom: isTop ? 0 : 2,
              boxSizing: "border-box",
            }}
          >
            {Array.from({ length: shown }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "var(--checker-size)",
                  aspectRatio: "1 / 1",
                  flexShrink: 0,
                  maxWidth: "92%",
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  background: isW
                    ? "radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4EBD6 35%, #D4C2A0 75%, #A09070 100%)"
                    : "radial-gradient(circle at 38% 30%, #6B4020 0%, #3D1E08 45%, #1A0A02 85%, #0A0402 100%)",
                  border: isW
                    ? isSel
                      ? "max(2px, calc(var(--checker-size) * 0.04)) solid #D4A017"
                      : "max(1.5px, calc(var(--checker-size) * 0.028)) solid #A08B60"
                    : "max(1px, calc(var(--checker-size) * 0.02)) solid #0A0402",
                  boxShadow:
                    isSel && isW
                      ? "0 0 0 calc(var(--checker-size)*0.05) rgba(212,160,23,0.75), 0 calc(var(--checker-size)*0.05) calc(var(--checker-size)*0.15) rgba(0,0,0,0.4)"
                      : "0 calc(var(--checker-size)*0.04) calc(var(--checker-size)*0.12) rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.25)",
                }}
              />
            ))}
            {count > MAX_SHOW && (
              <div
                style={{
                  color: isW ? "#2C1A0A" : "#FDF6E3",
                  fontSize: "max(10px, calc(var(--checker-size) * 0.24))",
                  fontWeight: 800,
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                +{count - MAX_SHOW}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const pointRowTop = (
    <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "row", alignItems: "stretch" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, minHeight: 0 }}>
        {topRow.slice(0, 6).map((ptIdx, ci) => renderPoint(ptIdx, ci, true))}
      </div>
      <div style={{ width: "var(--board-bar)", flexShrink: 0, background: C.gapLine }} aria-hidden />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, minHeight: 0 }}>
        {topRow.slice(6).map((ptIdx, ci) => renderPoint(ptIdx, ci + 6, true))}
      </div>
    </div>
  );

  const pointRowBot = (
    <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "row", alignItems: "stretch" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, minHeight: 0 }}>
        {botRow.slice(0, 6).map((ptIdx, ci) => renderPoint(ptIdx, ci, false))}
      </div>
      <div style={{ width: "var(--board-bar)", flexShrink: 0, background: C.gapLine }} aria-hidden />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, minHeight: 0 }}>
        {botRow.slice(6).map((ptIdx, ci) => renderPoint(ptIdx, ci + 6, false))}
      </div>
    </div>
  );

  const feltTexture = `
    radial-gradient(circle at 15% 20%, rgba(255,250,235,0.12), transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(100,70,30,0.08), transparent 45%),
    repeating-linear-gradient(0deg, rgba(130,95,55,0.04) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(130,95,55,0.035) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(45deg, rgba(80,55,25,0.025) 0 2px, transparent 2px 5px),
    ${C.boardFelt}
  `;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        containerType: "size",
        containerName: "flatboardportrait",
        background: feltTexture,
        userSelect: "none",
      }}
    >
      <style>{`${portraitBoardVarsCss}
        @keyframes triPulse{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes trayPulse{0%,100%{border-color:rgba(212,160,23,0.5)}50%{border-color:rgba(212,160,23,0.95)}}
        @keyframes wrongFlash{0%{opacity:0.5}100%{opacity:0}}
      `}</style>
      <div
        data-flat-board-portrait-root
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {stripTop}
          {pointRowTop}
        </div>

        <div
          role="presentation"
          style={{
            height: "var(--dice-strip-h)",
            minHeight: "var(--dice-strip-h)",
            flexShrink: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "1px solid rgba(42,26,14,0.15)",
            borderBottom: "1px solid rgba(42,26,14,0.15)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "var(--board-bar)",
              transform: "translateX(-50%)",
              background: C.gapLine,
            }}
          />
          {dice.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: "20%",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "calc(var(--dice-face) * 0.22)",
              }}
            >
              <div style={{ width: "var(--dice-face)", height: "var(--dice-face)" }}>
                <Die value={dice[0]} size="100%" used={diceUsed[0]} />
              </div>
              <div style={{ width: "var(--dice-face)", height: "var(--dice-face)" }}>
                <Die value={dice[1]} size="100%" used={diceUsed[1]} />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {pointRowBot}
          {stripBot}
        </div>
      </div>
    </div>
  );
}
