/** Read resolved checker diameter in CSS pixels from the mounted board root. */
export function readCheckerSizePxFromBoard() {
  if (typeof document === "undefined") return 44;
  const root = document.querySelector("[data-flat-board-root], [data-flat-board-portrait-root]");
  if (!root) return 44;
  const v = getComputedStyle(root).getPropertyValue("--checker-size").trim();
  const m = v.match(/^([\d.]+)px/);
  if (m) return Math.round(parseFloat(m[1]));
  return 44;
}

function checkerFlightStyle(sizePx) {
  const b = Math.max(2, Math.round(sizePx * 0.065));
  return [
    `border-radius:50%`,
    `pointer-events:none`,
    `z-index:10050`,
    `box-sizing:border-box`,
    `background:radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4EBD6 35%, #D4C2A0 75%, #A09070 100%)`,
    `border:${b}px solid #A08B60`,
    `box-shadow:0 ${Math.max(2, Math.round(sizePx * 0.06))}px ${Math.round(sizePx * 0.12)}px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.25)`,
  ].join(";");
}

/** Live drag ghost (React `style` object), matches in-board checker look. */
export function checkerDragGhostStylePx(sizePx, isWhite, isSelected = false) {
  const sz = Math.max(18, Math.round(sizePx));
  const thinW = Math.max(1.5, Math.round(sz * 0.028));
  const thickSel = Math.max(2, Math.round(sz * 0.04));
  const bDark = Math.max(1, Math.round(sz * 0.02));
  return {
    boxSizing: "border-box",
    borderRadius: "50%",
    flexShrink: 0,
    background: isWhite
      ? "radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4EBD6 35%, #D4C2A0 75%, #A09070 100%)"
      : "radial-gradient(circle at 38% 30%, #6B4020 0%, #3D1E08 45%, #1A0A02 85%, #0A0402 100%)",
    border: isWhite
      ? `${isSelected ? thickSel : thinW}px solid ${isSelected ? "#D4A017" : "#A08B60"}`
      : `${bDark}px solid #0A0402`,
    boxShadow: isWhite
      ? isSelected
        ? `0 0 0 ${Math.round(sz * 0.05)}px rgba(212,160,23,0.75), 0 ${Math.round(sz * 0.05)}px ${Math.round(sz * 0.15)}px rgba(0,0,0,0.4)`
        : `0 ${Math.round(sz * 0.04)}px ${Math.round(sz * 0.12)}px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.25)`
      : `0 ${Math.round(sz * 0.04)}px ${Math.round(sz * 0.12)}px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.25)`,
  };
}

/**
 * Finger released on illegal drop: chip returns to source stack.
 */
export function animateCheckerDragRejectReturn({
  fromPt,
  clientX,
  clientY,
  sizePx = 44,
  durationMs = 300,
} = {}) {
  if (typeof document === "undefined") return Promise.resolve();
  const fromEl = document.querySelector(`[data-board-point="${fromPt}"]`);
  if (!fromEl) return Promise.resolve();

  const r0 = fromEl.getBoundingClientRect();
  const isTop = fromPt >= 12;
  const x1 = r0.left + r0.width * 0.5;
  const y1 = r0.top + r0.height * (isTop ? 0.76 : 0.24);
  const dx = x1 - clientX;
  const dy = y1 - clientY;

  const fly = document.createElement("div");
  fly.setAttribute("data-checker-flight", "");
  fly.style.cssText =
    [
      `position:fixed`,
      `left:${clientX - sizePx / 2}px`,
      `top:${clientY - sizePx / 2}px`,
      `width:${sizePx}px`,
      `height:${sizePx}px`,
      checkerFlightStyle(sizePx),
    ].join(";");

  document.body.appendChild(fly);

  if (typeof fly.animate !== "function") {
    fly.remove();
    return Promise.resolve();
  }

  const anim = fly.animate(
    [
      { transform: "translate3d(0,0,0) scale(1.08)", opacity: 1 },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(1)`, opacity: 1 },
    ],
    { duration: durationMs, easing: "cubic-bezier(0.38, 1.15, 0.54, 1)" }
  );

  return anim.finished
    .then(() => {
      fly.remove();
    })
    .catch(() => {
      fly.remove();
    });
}

/**
 * DOM overlay flight for one white checker from point → point (board indices 0–23).
 * Resolves when the animation finishes; no-op if elements are missing or bear-off.
 */
export function animateCheckerFlightBetweenPoints(fromPt, toPt, { durationMs = 340 } = {}) {
  const fromEl = document.querySelector(`[data-board-point="${fromPt}"]`);
  const toEl = document.querySelector(`[data-board-point="${toPt}"]`);
  if (!fromEl || !toEl) return Promise.resolve();

  const r0 = fromEl.getBoundingClientRect();
  const r1 = toEl.getBoundingClientRect();

  const isTopHemisphere = (pt) => pt >= 12;

  /** Stack sits toward bar (center): top points ~lower in rect, bottom points ~upper in rect */
  const stackYFrac = isTopHemisphere(fromPt) ? 0.76 : 0.24;

  const x0 = r0.left + r0.width * 0.5;
  const y0 = r0.top + r0.height * stackYFrac;
  const x1 = r1.left + r1.width * 0.5;
  const y1 = r1.top + r1.height * (isTopHemisphere(toPt) ? 0.76 : 0.24);

  const dx = x1 - x0;
  const dy = y1 - y0;
  const sizePx = Math.round(Math.min(r0.width * 0.68, Math.max(r0.width, r1.width) * 0.72));

  const fly = document.createElement("div");
  fly.setAttribute("data-checker-flight", "");
  fly.style.cssText = [
    `position:fixed`,
    `left:${x0 - sizePx / 2}px`,
    `top:${y0 - sizePx / 2}px`,
    `width:${sizePx}px`,
    `height:${sizePx}px`,
    checkerFlightStyle(sizePx),
  ].join(";");

  document.body.appendChild(fly);

  if (typeof fly.animate !== "function") {
    fly.remove();
    return Promise.resolve();
  }

  const anim = fly.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(1.02)`, opacity: 1 },
    ],
    { duration: durationMs, easing: "cubic-bezier(0.33, 1.05, 0.5, 1)" }
  );

  return anim.finished
    .then(() => {
      fly.remove();
    })
    .catch(() => {
      fly.remove();
    });
}
