/**
 * DOM overlay flight for one white checker from point → point (board indices 0–23).
 * Resolves when the animation finishes; no-op if elements are missing or bear-off.
 */
export function animateCheckerFlightBetweenPoints(fromPt, toPt, { durationMs = 340 } = {}) {
  if (typeof document === "undefined") return Promise.resolve();
  if (typeof toPt !== "number" || toPt < 0) return Promise.resolve();

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
    `border-radius:50%`,
    `pointer-events:none`,
    `z-index:10050`,
    `box-sizing:border-box`,
    `background:radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4EBD6 35%, #D4C2A0 75%, #A09070 100%)`,
    `border:${Math.max(2, Math.round(sizePx * 0.065))}px solid #A08B60`,
    `box-shadow:0 ${Math.max(2, Math.round(sizePx * 0.06))}px ${Math.round(sizePx * 0.12)}px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.25)`,
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
