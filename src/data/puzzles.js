import { C } from "../constants/palette";

export const CATEGORIES = [
  {
    id: "opening",
    label: "Opening Rolls",
    description: "Early-game first-move decisions and foundational point-making.",
  },
  {
    id: "hitting",
    label: "Hitting & Covering",
    description: "When to hit, cover, and balance tactical volatility.",
  },
  {
    id: "running",
    label: "Running Game",
    description: "Pure race choices, pip-count pressure, and tempo decisions.",
  },
  {
    id: "holding",
    label: "Holding Games",
    description: "Anchor timing, breaking points, and containment strategy.",
  },
  {
    id: "back-game",
    label: "Back Games",
    description: "Deep-anchor timing and counterplay from behind.",
  },
  {
    id: "bear-off",
    label: "Bear-Off Accuracy",
    description: "Wastage minimization and efficient checker clearance.",
  },
  {
    id: "cube",
    label: "Cube Decisions",
    description: "When to double, take, or pass under match pressure.",
  },
];

export const PUZZLES = [
  {
    id: 1,
    category: "hitting",
    difficulty: "Beginner",
    diffColor: C.green,
    concept: "Hitting a Blot",
    dice: [6, 1],
    board: (() => {
      const b = new Array(24).fill(0);
      b[23] = 2;
      b[12] = 5;
      b[7] = 3;
      b[5] = 5;
      b[0] = -2;
      b[11] = -4;
      b[16] = -3;
      b[18] = -5;
      b[6] = -1;
      return b;
    })(),
    bestMoves: [{ from: 12, to: 6 }, { from: 7, to: 6 }],
    // Deprecated: fallback only if evaluator output is invalid.
    yourWinPct: 44,
    // Deprecated: fallback only if evaluator output is invalid.
    bestWinPct: 67,
    bestExplanation:
      "Hitting on the 7-point sends your opponent to the bar where they face a 67% chance of failing to re-enter. Win probability jumps sharply with this aggressive play.",
    description: "Opponent blot on the 7-point — do you hit?",
  },
  {
    id: 2,
    category: "opening",
    difficulty: "Intermediate",
    diffColor: "#E65100",
    concept: "Making the 4-point",
    dice: [4, 2],
    board: (() => {
      const b = new Array(24).fill(0);
      b[23] = 2;
      b[12] = 5;
      b[7] = 3;
      b[5] = 5;
      b[0] = -2;
      b[11] = -5;
      b[16] = -3;
      b[18] = -5;
      return b;
    })(),
    bestMoves: [{ from: 7, to: 3 }, { from: 5, to: 3 }],
    // Deprecated: fallback only if evaluator output is invalid.
    yourWinPct: 48,
    // Deprecated: fallback only if evaluator output is invalid.
    bestWinPct: 63,
    bestExplanation:
      "Making the 4-point is the textbook play for a 4-2 opening. It builds inner-board structure and creates a second home-board point behind the 6-point, severely restricting your opponent's back checkers.",
    description: "Opening 4-2 — make the best inner-board point.",
  },
  {
    id: 3,
    category: "opening",
    difficulty: "Beginner",
    diffColor: C.green,
    concept: "Making the Golden Point",
    dice: [3, 1],
    board: (() => {
      const b = new Array(24).fill(0);
      b[23] = 2;
      b[12] = 5;
      b[7] = 3;
      b[5] = 5;
      b[0] = -2;
      b[11] = -5;
      b[16] = -3;
      b[18] = -5;
      return b;
    })(),
    bestMoves: [{ from: 7, to: 4 }, { from: 5, to: 4 }],
    // Deprecated: fallback only if evaluator output is invalid.
    yourWinPct: 50,
    // Deprecated: fallback only if evaluator output is invalid.
    bestWinPct: 66,
    bestExplanation:
      "Making the 5-point (the 'golden point') on an opening 3-1 is the strongest play in backgammon. Every world-class engine, from TD-Gammon to XG, agrees. You gain an inner-board point that blocks escape and sets up priming plays.",
    description: "Opening 3-1 — make the golden point.",
  },
  {
    id: 4,
    category: "bear-off",
    difficulty: "Beginner",
    diffColor: C.green,
    concept: "Bearing Off",
    dice: [5, 3],
    board: (() => {
      const b = new Array(24).fill(0);
      b[5] = 3;
      b[4] = 3;
      b[3] = 3;
      b[2] = 3;
      b[1] = 2;
      b[0] = 1;
      b[23] = -3;
      b[22] = -3;
      b[21] = -3;
      b[20] = -3;
      b[19] = -3;
      return b;
    })(),
    bestMoves: [{ from: 4, to: -1 }, { from: 2, to: -1 }],
    // Deprecated: fallback only if evaluator output is invalid.
    yourWinPct: 57,
    // Deprecated: fallback only if evaluator output is invalid.
    bestWinPct: 72,
    bestExplanation:
      "Bearing off two checkers extends your pip lead by 16. In a pure race, every checker off is worth about 1.5 pips.",
    description: "Pure race, you're ahead — bear off efficiently.",
  },
  {
    id: 5,
    category: "hitting",
    difficulty: "Intermediate",
    diffColor: "#E65100",
    concept: "Safe Point-Making",
    dice: [6, 2],
    board: (() => {
      const b = new Array(24).fill(0);
      b[23] = 2;
      b[12] = 5;
      b[10] = 1;
      b[7] = 2;
      b[6] = 1;
      b[5] = 2;
      b[4] = 1;
      b[1] = 1;
      b[0] = -2;
      b[11] = -4;
      b[16] = -3;
      b[18] = -5;
      b[22] = -1;
      return b;
    })(),
    bestMoves: [{ from: 10, to: 4 }, { from: 6, to: 4 }],
    // Deprecated: fallback only if evaluator output is invalid.
    yourWinPct: 46,
    // Deprecated: fallback only if evaluator output is invalid.
    bestWinPct: 61,
    bestExplanation:
      "Making the golden 5-point cleanly creates an anchor your opponent cannot attack. Leaving a blot here would be a 42% shot for disaster.",
    description: "Make the golden 5-point without leaving a blot.",
  },
];
