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

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Should we honor prefers-reduced-motion? */
function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (_) {
    return false;
  }
}

/** Inline style string for a flight chip. Shadow is applied via filter so it can
 *  be animated smoothly in keyframes (drop-shadow swell at the arc apex). */
function checkerFlightStyle(sizePx, isWhite = true) {
  const b = Math.max(2, Math.round(sizePx * 0.065));
  const bg = isWhite
    ? "radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4EBD6 35%, #D4C2A0 75%, #A09070 100%)"
    : "radial-gradient(circle at 38% 30%, #6B4020 0%, #3D1E08 45%, #1A0A02 85%, #0A0402 100%)";
  const borderColor = isWhite ? "#A08B60" : "#0A0402";
  return [
    `border-radius:50%`,
    `pointer-events:none`,
    `z-index:10050`,
    `box-sizing:border-box`,
    `background:${bg}`,
    `border:${b}px solid ${borderColor}`,
    // Base inset highlight; outer shadow is driven by filter in the keyframes.
    `box-shadow:inset 0 1px 2px rgba(255,255,255,0.25)`,
    `will-change:transform, filter`,
    `transform:translate3d(0,0,0)`,
    `backface-visibility:hidden`,
  ].join(";");
}

/** Build a `filter: drop-shadow(...)` string that scales with the chip size. */
function shadowFilter(sizePx, intensity) {
  // intensity in [0..1]: 0 = resting on surface, 1 = full apex lift / mid-flight swell
  const y = Math.max(1, Math.round(sizePx * (0.045 + intensity * 0.10)));
  const blur = Math.max(2, Math.round(sizePx * (0.07 + intensity * 0.18)));
  const alpha = 0.28 + intensity * 0.22;
  return `drop-shadow(0 ${y}px ${blur}px rgba(0,0,0,${alpha.toFixed(2)}))`;
}

/** Timeline fraction where the ballistic arc reaches the slot (before overshoot/settle). */
const FLIGHT_ARC_PORTION = 0.74;

/**
 * Ballistic arc in board space: linear drift (dx,dy)·u minus a symmetric lift
 * 4·arcH·u(1−u), dense samples + linear easing so the path is a smooth parabola,
 * then landing overshoot and settle in the tail of the timeline.
 */
function sampleParabolicFlightKeyframes(dx, dy, arcH, sizePx, dist) {
  const arcPortion = FLIGHT_ARC_PORTION;
  const overshootAt = 0.87;
  const minSamples = 10;
  const maxSamples = 24;
  const nArc = clamp(Math.round(dist / 26), minSamples, maxSamples);
  const baseShadow = 0.30;
  const apexShadow = 0.96;

  const keyframes = [];
  for (let i = 0; i <= nArc; i++) {
    const u = i / nArc;
    const offset = u * arcPortion;
    const lift = arcH * 4 * u * (1 - u);
    const x = dx * u;
    const y = dy * u - lift;
    const apexMix = Math.sin(Math.PI * u);
    const shadowI = baseShadow + (apexShadow - baseShadow) * apexMix;
    const scale = 1 + 0.058 * apexMix;
    keyframes.push({
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale.toFixed(4)})`,
      filter: shadowFilter(sizePx, shadowI),
      offset,
      easing: "linear",
    });
  }

  const bump = Math.max(2, Math.round(sizePx * 0.044));
  keyframes.push({
    transform: `translate3d(${dx}px, ${dy + bump}px, 0) scale(1.034)`,
    filter: shadowFilter(sizePx, 0.42),
    offset: overshootAt,
    easing: "cubic-bezier(0.22, 0.92, 0.28, 1)",
  });
  keyframes.push({
    transform: `translate3d(${dx}px, ${dy}px, 0) scale(1)`,
    filter: shadowFilter(sizePx, baseShadow),
    offset: 1,
    easing: "linear",
  });
  return keyframes;
}

/** Smaller sampled arc for drag-reject return-to-stack. */
function sampleRejectArcKeyframes(dx, dy, arcH, sizePx, dist) {
  const n = clamp(Math.round(dist / 34), 6, 14);
  const keyframes = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const lift = arcH * 4 * u * (1 - u);
    const x = dx * u;
    const y = dy * u - lift;
    const apexMix = Math.sin(Math.PI * u);
    const shadowI = 0.38 + 0.52 * apexMix;
    keyframes.push({
      transform: `translate3d(${x}px, ${y}px, 0) scale(${1 + 0.045 * apexMix})`,
      filter: shadowFilter(sizePx, shadowI),
      offset: u,
      easing: "linear",
    });
  }
  return keyframes;
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

/** Resolve the on-board "stack-top" coordinate for a board point index. */
function stackTopForPoint(pt) {
  if (typeof document === "undefined") return null;
  const el = document.querySelector(`[data-board-point="${pt}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const isTop = pt >= 12;
  return {
    x: r.left + r.width * 0.5,
    y: r.top + r.height * (isTop ? 0.76 : 0.24),
    width: r.width,
    height: r.height,
  };
}

/**
 * Finger released on illegal drop: chip arcs softly back to the source stack.
 */
export function animateCheckerDragRejectReturn({
  fromPt,
  clientX,
  clientY,
  sizePx = 44,
  isWhite = true,
  durationMs,
} = {}) {
  if (typeof document === "undefined") return Promise.resolve();
  const target = stackTopForPoint(fromPt);
  if (!target) return Promise.resolve();

  const dx = target.x - clientX;
  const dy = target.y - clientY;
  const dist = Math.hypot(dx, dy);

  // Adaptive duration: short hops are quick, longer reaches feel weighty.
  const dur = clamp(
    Math.round(durationMs ?? (200 + dist * 0.40)),
    220,
    420
  );
  // Subtle vertical arc — lift in the direction opposite to gravity bias.
  const arcH = clamp(Math.round(dist * 0.16) + Math.round(sizePx * 0.20), 14, 56);

  const fly = document.createElement("div");
  fly.setAttribute("data-checker-flight", "");
  fly.style.cssText = [
    `position:fixed`,
    `left:${clientX - sizePx / 2}px`,
    `top:${clientY - sizePx / 2}px`,
    `width:${sizePx}px`,
    `height:${sizePx}px`,
    `filter:${shadowFilter(sizePx, 0.55)}`,
    checkerFlightStyle(sizePx, isWhite),
  ].join(";");

  document.body.appendChild(fly);

  if (typeof fly.animate !== "function" || prefersReducedMotion()) {
    fly.remove();
    return Promise.resolve();
  }

  const keyframes = sampleRejectArcKeyframes(dx, dy, arcH, sizePx, dist);

  const anim = fly.animate(keyframes, {
    duration: dur,
    easing: "linear",
    fill: "forwards",
  });

  return anim.finished
    .then(() => fly.remove())
    .catch(() => fly.remove());
}

/**
 * DOM overlay flight for one checker from point → point (board indices 0–23).
 *
 * Options:
 *  - durationMs: override auto-duration
 *  - startClientX/startClientY: optional start position (e.g. finger drop point),
 *    used so a drag hand-off doesn't visually snap back to the source stack
 *  - onLand: callback invoked AT landing, BEFORE the ghost is removed, so the
 *    real destination checker can pop in on the same frame (no visual gap)
 *  - isWhite: which colour palette to use
 *
 * Resolves when the ghost has been removed.
 */
export function animateCheckerFlightBetweenPoints(
  fromPt,
  toPt,
  {
    durationMs,
    startClientX,
    startClientY,
    onLand,
    isWhite = true,
  } = {}
) {
  if (typeof document === "undefined") {
    if (onLand) onLand();
    return Promise.resolve();
  }

  const fromRect = stackTopForPoint(fromPt);
  const toRect = stackTopForPoint(toPt);
  if (!fromRect || !toRect) {
    if (onLand) onLand();
    return Promise.resolve();
  }

  const x0 = Number.isFinite(startClientX) ? startClientX : fromRect.x;
  const y0 = Number.isFinite(startClientY) ? startClientY : fromRect.y;
  const x1 = toRect.x;
  const y1 = toRect.y;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);

  const sizePx = Math.round(
    Math.min(fromRect.width * 0.68, Math.max(fromRect.width, toRect.width) * 0.72)
  );

  // Build the chip
  const fly = document.createElement("div");
  fly.setAttribute("data-checker-flight", "");
  fly.style.cssText = [
    `position:fixed`,
    `left:${x0 - sizePx / 2}px`,
    `top:${y0 - sizePx / 2}px`,
    `width:${sizePx}px`,
    `height:${sizePx}px`,
    `filter:${shadowFilter(sizePx, 0.30)}`,
    checkerFlightStyle(sizePx, isWhite),
  ].join(";");

  document.body.appendChild(fly);

  const callLand = () => {
    if (onLand) {
      try {
        onLand();
      } catch (_) {}
    }
  };

  if (typeof fly.animate !== "function" || prefersReducedMotion()) {
    callLand();
    // Give React a frame to mount the real destination checker, then drop.
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        fly.remove();
        resolve();
      });
    });
  }

  // Adaptive duration: short hops are snappy, long flights feel weighty.
  const dur = clamp(
    Math.round(durationMs ?? (220 + dist * 0.44)),
    280,
    620
  );

  // Arc height grows with distance and chip size, but is capped.
  const arcH = clamp(Math.round(dist * 0.17) + Math.round(sizePx * 0.19), 16, 72);

  const keyframes = sampleParabolicFlightKeyframes(dx, dy, arcH, sizePx, dist);

  const anim = fly.animate(keyframes, {
    duration: dur,
    easing: "linear",
    fill: "forwards",
  });

  return new Promise((resolve) => {
    let settled = false;
    let landCommitted = false;
    const commitLandOnce = () => {
      if (landCommitted) return;
      landCommitted = true;
      callLand();
    };

    // Commit board state when the arc hits the destination — before overshoot/settle —
    // so the real checker paints under the ghost for the rest of the motion.
    const landMs = Math.max(0, Math.round(dur * FLIGHT_ARC_PORTION));
    const landTimer = window.setTimeout(commitLandOnce, landMs);

    const cleanup = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(landTimer);
      commitLandOnce();
      // On the NEXT frame, fade-and-remove the ghost. The real checker is
      // already painted underneath from commitLandOnce (at arc end).
      requestAnimationFrame(() => {
        // Quick fade so the hand-off is imperceptible.
        try {
          fly.animate(
            [
              { opacity: 1 },
              { opacity: 0 },
            ],
            { duration: 90, easing: "linear", fill: "forwards" }
          ).finished.finally(() => {
            fly.remove();
            resolve();
          });
        } catch (_) {
          fly.remove();
          resolve();
        }
      });
    };
    anim.finished.then(cleanup).catch(cleanup);
  });
}
