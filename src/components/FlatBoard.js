import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "../constants/palette";
import Die from "./Die";
import { getLegalDests } from "../game/moveEngine";
import { isPointerOverPlayerBearOff, resolveBoardPoint } from "../game/boardHitTest";
import {
  animateCheckerDragRejectReturn,
  checkerDragGhostStylePx,
  readCheckerSizePxFromBoard,
} from "../game/checkerFlight";

const DRAG_THRESHOLD = 6;

const boardVarsCss = `
  [data-flat-board-root]{
    height:100%;
    min-height:0;
    --board-bar: clamp(2px, 0.32cqw, 5px);
    --label-strip-h: clamp(16px, 3.65cqh, 32px);
    --dice-strip-h: clamp(52px, 7.25cqw, 96px);
    --half-h: calc((100cqh - var(--dice-strip-h)) / 2);
    --point-play-h: calc(var(--half-h) - var(--label-strip-h));
    --checker-size: min(calc(100cqw / 13), calc(var(--point-play-h) / 5.35));
    --dice-face: min(calc(var(--checker-size) * 1.05), clamp(52px, 12cqw, 96px));
  }
`;

export default function FlatBoard({
  board,
  selected,
  legalDests,
  onPointClick,
  dice = [],
  diceUsed = [],
  wrongFlashPoint = null,
  /** Tap-to-move still works; optional drag checker from point → point when set.
   *  Called as (from, to, { clientX, clientY }) so flight animations can start
   *  at the finger drop position instead of snapping back to the source stack. */
  onCheckerDragComplete,
  interactionLocked = false,
  /** Remaining dice pips — used while dragging for legal-target highlights */
  remainingDice = [],
  diceIntroRolling = false,
  /** While a flight is in progress, the host sets this to the source point so we
   *  keep showing count-1 there until the destination checker is committed. */
  pendingFlightFrom = null,
}) {
  const boardRef = useRef(board);
  const diceRemainRef = useRef(remainingDice);
  useEffect(() => {
    boardRef.current = board;
    diceRemainRef.current = remainingDice;
  }, [board, remainingDice]);

  const [fingerDrag, setFingerDrag] = useState(null);
  const [suppressDicePointer, setSuppressDicePointer] = useState(false);
  const gestureRef = useRef(null);
  const rafDrag = useRef(0);

  const dragLegals = useMemo(() => {
    if (!fingerDrag?.showGhost || fingerDrag.from === undefined) return [];
    try {
      return getLegalDests(board, fingerDrag.from, remainingDice ?? []);
    } catch (_) {
      return [];
    }
  }, [board, fingerDrag?.from, fingerDrag?.showGhost, remainingDice]);

  const handlePtDown = useCallback(
    (e, ptIdx) => {
      if (interactionLocked || e.button !== 0) return;
      if (gestureRef.current) return;

      const downVal = board[ptIdx] || 0;
      const canDragFrom = typeof onCheckerDragComplete === "function" && downVal > 0;

      const ctx = { downPt: ptIdx, sx: e.clientX, sy: e.clientY, canDragFrom, checkerPx: 0, dragging: false };

      const scheduleDragPos = (cx, cy, showGhost) => {
        const hoverBearOff = isPointerOverPlayerBearOff(cx, cy);
        const hover = hoverBearOff ? undefined : resolveBoardPoint(cx, cy);
        let next = null;
        if (showGhost) {
          const sz = ctx.checkerPx || readCheckerSizePxFromBoard();
          ctx.checkerPx = sz;
          next = {
            from: ctx.downPt,
            x: cx,
            y: cy,
            hoverPt: hover,
            hoverBearOff,
            showGhost: true,
            sizePx: sz,
          };
        }
        if (rafDrag.current) cancelAnimationFrame(rafDrag.current);
        rafDrag.current = requestAnimationFrame(() => {
          rafDrag.current = 0;
          setFingerDrag(next);
        });
      };

      const onMoveReal = (ev) => {
        if (!gestureRef.current || gestureRef.current !== ctx) return;
        const d = Math.hypot(ev.clientX - ctx.sx, ev.clientY - ctx.sy);
        if (!ctx.dragging) {
          if (d < DRAG_THRESHOLD) {
            setFingerDrag(null);
            return;
          }
          ctx.dragging = true;
        }
        setSuppressDicePointer(true);
        scheduleDragPos(ev.clientX, ev.clientY, true);
      };

      const onUp = (ev) => {
        if (gestureRef.current !== ctx) return;
        window.removeEventListener("pointermove", onMoveReal);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        gestureRef.current = null;
        if (rafDrag.current) cancelAnimationFrame(rafDrag.current);
        rafDrag.current = 0;
        setFingerDrag(null);
        setSuppressDicePointer(false);

        const pointUnder = resolveBoardPoint(ev.clientX, ev.clientY);
        const moved =
          ctx.dragging || Math.hypot(ev.clientX - ctx.sx, ev.clientY - ctx.sy) >= DRAG_THRESHOLD;

        if (!moved) {
          const tapPt = pointUnder !== undefined ? pointUnder : ctx.downPt;
          if (tapPt !== undefined) onPointClick(tapPt);
          return;
        }

        const overBO = isPointerOverPlayerBearOff(ev.clientX, ev.clientY);
        const under = overBO ? -1 : pointUnder;
        if (!ctx.canDragFrom || typeof onCheckerDragComplete !== "function") return;

        const b = boardRef.current;
        const dice = diceRemainRef.current ?? [];
        const legals = getLegalDests(b, ctx.downPt, dice);
        const ok =
          under !== undefined &&
          legals.some((d) => d.to === under) &&
          (under === -1 || under !== ctx.downPt);

        if (ok) {
          // Pass the drop position so the host can hand the drag ghost off to a
          // flight that starts at the finger — no visual snap back to source.
          onCheckerDragComplete(ctx.downPt, under, {
            clientX: ev.clientX,
            clientY: ev.clientY,
          });
        } else {
          const sz = ctx.checkerPx || readCheckerSizePxFromBoard();
          const raw = boardRef.current?.[ctx.downPt] || 0;
          animateCheckerDragRejectReturn({
            fromPt: ctx.downPt,
            clientX: ev.clientX,
            clientY: ev.clientY,
            sizePx: sz,
            isWhite: raw > 0,
          });
        }
      };

      gestureRef.current = ctx;

      window.addEventListener("pointermove", onMoveReal, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [board, interactionLocked, onCheckerDragComplete, onPointClick]
  );
  const topRow = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12];
  const botRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const isHL = (idx) => legalDests.some((d) => d.to === idx) || dragLegals.some((d) => d.to === idx);
  const isHit = (idx) => isHL(idx) && board[idx] === -1;
  const isDragHoverPick = (idx) =>
    Boolean(
      fingerDrag?.showGhost &&
        fingerDrag.hoverPt === idx &&
        dragLegals.some((d) => d.to === idx)
    );

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
          fontSize: "clamp(9px, 1.95cqw, 14px)",
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
    const dp = isDragHoverPick(ptIdx);

    // Hide the topmost source checker while it's mid-drag OR mid-flight.
    // Keeps the visual continuous from finger drop → flight landing.
    const hideOneFromSource =
      (fingerDrag?.showGhost && fingerDrag.from === ptIdx && val > 0) ||
      (pendingFlightFrom === ptIdx && val > 0);
    const stackCount = hideOneFromSource ? Math.max(0, count - 1) : count;

    const shown = Math.min(stackCount, MAX_SHOW);

    const triFill = dark ? C.triDark : C.triLight;
    const hlFill = hit ? "rgba(220,40,40,0.45)" : "rgba(74,143,63,0.35)";
    const hlStroke = hit ? "#c94a3d" : "#4a8f3f";

    const checkerGap = "calc(var(--checker-size) * 0.035)";

    return (
      <div
        key={ptIdx}
        data-board-point={String(ptIdx)}
        onPointerDown={(e) => handlePtDown(e, ptIdx)}
        style={{
          flex: 1,
          position: "relative",
          height: "100%",
          cursor: val > 0 || hl ? "pointer" : "default",
          minWidth: 0,
          overflow: "hidden",
          touchAction: "manipulation",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 40 160"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0 }}
        >
          {isTop ? (
            <polygon points="20,150 1,2 39,2" fill={triFill} opacity={0.78} />
          ) : (
            <polygon points="20,10  1,158 39,158" fill={triFill} opacity={0.78} />
          )}
          {hl && isTop && (
            <>
              <polygon points="20,150 1,2 39,2" fill={hlFill} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
              <polygon points="20,150 1,2 39,2" fill="none" stroke={hlStroke} strokeWidth={2} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
            </>
          )}
          {hl && !isTop && (
            <>
              <polygon points="20,10 1,158 39,158" fill={hlFill} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
              <polygon points="20,10 1,158 39,158" fill="none" stroke={hlStroke} strokeWidth={2} style={{ animation: "triPulse 1.3s ease-in-out infinite" }} />
            </>
          )}
          {dp && isTop && (
            <>
              <polygon points="20,150 1,2 39,2" fill="rgba(45,119,62,0.38)" />
              <polygon points="20,150 1,2 39,2" fill="none" stroke="#1f5f2a" strokeWidth={3} />
            </>
          )}
          {dp && !isTop && (
            <>
              <polygon points="20,10  1,158 39,158" fill="rgba(45,119,62,0.38)" />
              <polygon points="20,10  1,158 39,158" fill="none" stroke="#1f5f2a" strokeWidth={3} />
            </>
          )}
          {wrongFlash && (
            <rect x="0" y="0" width="40" height="160" fill="#c94a3d" opacity="0.5" style={{ animation: "wrongFlash 0.5s ease-out forwards" }} />
          )}
        </svg>

        {stackCount > 0 && (
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
            {stackCount > MAX_SHOW && (
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
                +{stackCount - MAX_SHOW}
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
      <div style={{ width: "var(--board-bar)", flexShrink: 0, background: C.gapLine }} />
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
      <div style={{ width: "var(--board-bar)", flexShrink: 0, background: C.gapLine }} />
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
        containerName: "flatboard",
        background: feltTexture,
        userSelect: "none",
      }}
    >
      <style>{`${boardVarsCss}
        @keyframes triPulse{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes trayPulse{0%,100%{border-color:rgba(212,160,23,0.5)}50%{border-color:rgba(212,160,23,0.95)}}
        @keyframes wrongFlash{0%{opacity:0.5}100%{opacity:0}}
      `}</style>
      <div
        data-flat-board-root
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Top hemisphere: reserved number strip · points */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {stripTop}
          {pointRowTop}
        </div>

        {/* Middle — dice */}
        <div
          role="presentation"
          data-board-dice-strip
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
            pointerEvents: suppressDicePointer ? "none" : "auto",
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
                top: "50%",
                left: "50%",
                right: "auto",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                gap: "calc(var(--dice-face) * 0.22)",
              }}
            >
              <div style={{ width: "var(--dice-face)", height: "var(--dice-face)" }}>
                <Die value={dice[0]} size="100%" used={diceUsed[0]} rolling={diceIntroRolling} slotIndex={0} />
              </div>
              <div style={{ width: "var(--dice-face)", height: "var(--dice-face)" }}>
                <Die value={dice[1]} size="100%" used={diceUsed[1]} rolling={diceIntroRolling} slotIndex={1} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom hemisphere: points · reserved number strip */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {pointRowBot}
          {stripBot}
        </div>
      </div>
      {fingerDrag?.showGhost &&
        typeof document !== "undefined" &&
        createPortal(
          (() => {
            const sz = Math.round(fingerDrag.sizePx || readCheckerSizePxFromBoard());
            const raw = board[fingerDrag.from] || 0;
            const isW = raw > 0;
            return (
              <div
                data-checker-drag-ghost=""
                style={{
                  position: "fixed",
                  left: 0,
                  top: 0,
                  pointerEvents: "none",
                  touchAction: "none",
                  zIndex: 10050,
                  transform: `translate3d(${fingerDrag.x - sz / 2}px, ${fingerDrag.y - sz / 2}px, 0)`,
                  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
                  ...checkerDragGhostStylePx(sz, isW, selected === fingerDrag.from),
                }}
              />
            );
          })(),
          document.body
        )}
    </div>
  );
}
