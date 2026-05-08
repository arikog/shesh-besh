/** DOM hit-testing for checker drag/drop against the SVG board and bear-off tray. */

export function resolveBoardPoint(clientX, clientY) {
  if (typeof document === "undefined") return undefined;
  const stack = document.elementsFromPoint(clientX, clientY);
  for (let i = 0; i < stack.length; i++) {
    const cell = stack[i].closest?.("[data-board-point]");
    if (cell?.hasAttribute?.("data-board-point")) {
      const n = parseInt(cell.getAttribute("data-board-point"), 10);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

export function isPointerOverPlayerBearOff(clientX, clientY) {
  if (typeof document === "undefined") return false;
  const stack = document.elementsFromPoint(clientX, clientY);
  for (let i = 0; i < stack.length; i++) {
    if (stack[i].closest?.("[data-player-bear-off]")) return true;
  }
  return false;
}
