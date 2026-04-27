/*
  Heuristic evaluator features and rough weights (white-positive score space):

  Included:
  - Pip count race edge:                  ~0.008 per pip differential
  - Blot exposure / direct-shot risk:     up to ~0.25 per exposed blot (scaled by hit probability)
  - Home board point count (made points): ~0.06 per made home-board point differential
  - Prime structure length:               ~0.04 per longest-prime point differential
  - Key-point ownership:
      - White 5pt / 7pt made:             +0.08 each
      - Black 20pt / 18pt made:           -0.08 each
  - Back-checker pressure (light):        ~0.02 per extra deep back checker
  - Dice volatility hint (small):         ~0.01 from immediate dice quality
  - Side-to-move initiative (small):      ~0.015 bonus to side to play

  Explicitly NOT modeled yet:
  - Cube / match score / gammon risk
  - Full contact-vs-race classifier (only approximated via blot/contact pressure)
  - Anchor quality beyond specific key-point checks
  - Bar/off slots as dedicated state (expects 24-point board only)
*/

let _diceCache = null;

function diceCombos() {
  if (_diceCache) return _diceCache;
  const combos = [];
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) combos.push([a, b]);
  }
  _diceCache = combos;
  return combos;
}

function estimateShotProb(board, blotIdx, attackerColor) {
  const dists = [];
  for (let i = 0; i < 24; i++) {
    const v = board[i] || 0;
    if (attackerColor === "dark" && v < 0) {
      const d = blotIdx - i;
      if (d > 0 && d <= 24) dists.push(d);
    } else if (attackerColor === "white" && v > 0) {
      const d = i - blotIdx;
      if (d > 0 && d <= 24) dists.push(d);
    }
  }
  if (dists.length === 0) return 0;

  let hits = 0;
  for (const [d1, d2] of diceCombos()) {
    const possible = new Set([d1, d2, d1 + d2]);
    if (d1 === d2) {
      possible.add(d1 * 3);
      possible.add(d1 * 4);
    }
    for (const dist of dists) {
      if (possible.has(dist)) {
        hits++;
        break;
      }
    }
  }
  return hits / 36;
}

function longestPrime(board, color) {
  let best = 0;
  let cur = 0;
  for (let i = 0; i < 24; i++) {
    const v = board[i] || 0;
    const made = color === "white" ? v >= 2 : v <= -2;
    if (made) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
}

function toWinPct(score) {
  const frac = 1 / (1 + Math.exp(-score * 1.9));
  return Math.max(5, Math.min(95, frac * 100));
}

function sumBoard(board) {
  return board.reduce((acc, v) => acc + v, 0);
}

export function evaluatePosition(board, dice = [], playerToMove = "white") {
  const safeBoard = Array.isArray(board) ? board : [];

  let whitePips = 0;
  let blackPips = 0;
  let whiteBlotRisk = 0;
  let blackBlotRisk = 0;
  let whiteHome = 0;
  let blackHome = 0;

  for (let i = 0; i < 24; i++) {
    const v = safeBoard[i] || 0;
    if (v > 0) {
      whitePips += v * (i + 1);
      if (v === 1) whiteBlotRisk += estimateShotProb(safeBoard, i, "dark");
      if (i <= 5 && v >= 2) whiteHome++;
    } else if (v < 0) {
      blackPips += -v * (24 - i);
      if (v === -1) blackBlotRisk += estimateShotProb(safeBoard, i, "white");
      if (i >= 18 && v <= -2) blackHome++;
    }
  }

  const whitePrime = longestPrime(safeBoard, "white");
  const blackPrime = longestPrime(safeBoard, "dark");

  const whiteKeyPoint = ((safeBoard[4] || 0) >= 2 ? 1 : 0) + ((safeBoard[6] || 0) >= 2 ? 1 : 0);
  const blackKeyPoint = ((safeBoard[19] || 0) <= -2 ? 1 : 0) + ((safeBoard[17] || 0) <= -2 ? 1 : 0);

  const whiteBackPressure = (safeBoard[23] || 0) >= 2 ? 0.02 * (safeBoard[23] || 0) : 0;
  const blackBackPressure = (safeBoard[0] || 0) <= -2 ? 0.02 * -(safeBoard[0] || 0) : 0;

  const pipCount = (blackPips - whitePips) * 0.008;
  const blotExposure = blackBlotRisk * 0.25 - whiteBlotRisk * 0.25;
  const homeBoard = (whiteHome - blackHome) * 0.06;
  const primeStructure = (whitePrime - blackPrime) * 0.04;
  const keyPoints = (whiteKeyPoint - blackKeyPoint) * 0.08;
  const anchorPresence = blackBackPressure - whiteBackPressure;

  const [d1 = 0, d2 = 0] = Array.isArray(dice) ? dice : [];
  const diceTempo = (Math.max(d1, d2) + (d1 === d2 ? d1 : 0)) * 0.002;
  const sideToMove = playerToMove === "white" ? 0.015 : -0.015;

  const absPipDiff = Math.abs(blackPips - whitePips);
  const contactApprox = safeBoard.some((v, i) => v > 0 && safeBoard.slice(0, i).some((u) => u < 0));
  const raceVsContact = !contactApprox ? absPipDiff * 0.0008 : -absPipDiff * 0.00015;

  const rawScore =
    pipCount +
    blotExposure +
    homeBoard +
    primeStructure +
    keyPoints +
    anchorPresence +
    diceTempo +
    sideToMove +
    raceVsContact;

  const perspectiveAdjusted = playerToMove === "white" ? rawScore : -rawScore;
  const winPct = toWinPct(perspectiveAdjusted);

  return {
    winPct,
    breakdown: {
      pipCount,
      blotExposure,
      homeBoard,
      primeStructure,
      keyPoints,
      anchorPresence,
      raceVsContact,
      diceTempo,
      sideToMove,
      rawScore,
      perspectiveAdjusted,
      boardChecksum: sumBoard(safeBoard),
    },
  };
}

export function evaluateBoard(board) {
  return evaluatePosition(board, [0, 0], "white").winPct;
}
