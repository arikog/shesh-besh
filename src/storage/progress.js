const STORAGE_KEY = "sheshBesh.progress.v1";

const DEFAULT_PROGRESS = {
  iq: 1000,
  streak: 0,
  accuracy: 0,
  completedPuzzleIds: [],
  history: [],
};

let inMemoryProgress = { ...DEFAULT_PROGRESS };

function sanitizeProgress(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROGRESS };

  const history = Array.isArray(raw.history) ? raw.history : [];
  const completedPuzzleIds = Array.isArray(raw.completedPuzzleIds)
    ? raw.completedPuzzleIds.filter((x) => Number.isInteger(x))
    : [];
  const iq = Number.isFinite(raw.iq) ? raw.iq : DEFAULT_PROGRESS.iq;
  const streak = Number.isFinite(raw.streak) ? raw.streak : DEFAULT_PROGRESS.streak;
  const accuracy = Number.isFinite(raw.accuracy) ? raw.accuracy : DEFAULT_PROGRESS.accuracy;

  return { iq, streak, accuracy, completedPuzzleIds, history };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...inMemoryProgress };
    const parsed = JSON.parse(raw);
    const safe = sanitizeProgress(parsed);
    inMemoryProgress = { ...safe };
    return safe;
  } catch (error) {
    console.warn("[progress] Failed to load localStorage progress, using memory fallback.", error);
    return { ...inMemoryProgress };
  }
}

export function saveProgress(progress) {
  const safe = sanitizeProgress(progress);
  inMemoryProgress = { ...safe };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch (error) {
    console.warn("[progress] Failed to save localStorage progress, keeping memory fallback.", error);
  }
}

export function recordPuzzleAttempt({ puzzleId, wasCorrect, iqDelta }) {
  const current = loadProgress();
  const safeDelta = Number.isFinite(iqDelta) ? iqDelta : 0;

  const nextIq = Math.max(800, Math.min(1200, current.iq + safeDelta));
  const nextStreak = wasCorrect ? current.streak + 1 : 0;
  const nextCompleted = wasCorrect
    ? (current.completedPuzzleIds.includes(puzzleId)
      ? current.completedPuzzleIds
      : [...current.completedPuzzleIds, puzzleId])
    : current.completedPuzzleIds;

  const nextHistory = [
    ...current.history,
    {
      puzzleId,
      wasCorrect: !!wasCorrect,
      iqDelta: safeDelta,
      ts: Date.now(),
    },
  ];

  const correctCount = nextHistory.filter((h) => h.wasCorrect).length;
  const nextAccuracy = nextHistory.length > 0 ? Math.round((correctCount / nextHistory.length) * 100) : 0;

  const next = {
    iq: nextIq,
    streak: nextStreak,
    accuracy: nextAccuracy,
    completedPuzzleIds: nextCompleted,
    history: nextHistory,
  };

  saveProgress(next);
  return next;
}

export function resetProgress() {
  inMemoryProgress = { ...DEFAULT_PROGRESS };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[progress] Failed to reset localStorage progress, memory fallback reset only.", error);
  }
}
