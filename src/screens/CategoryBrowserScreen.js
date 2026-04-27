import { useMemo, useState } from "react";
import { CATEGORIES, PUZZLES } from "../data/puzzles";
import { C } from "../constants/palette";

export default function CategoryBrowserScreen({ setScreen, completedPuzzleIds = [], history = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const completedSet = useMemo(() => new Set(completedPuzzleIds), [completedPuzzleIds]);
  const statsByCategory = useMemo(() => {
    const byId = {};
    for (const category of CATEGORIES) {
      byId[category.id] = { attempts: 0, correct: 0 };
    }
    for (const item of history) {
      const puzzle = PUZZLES.find((p) => p.id === item.puzzleId);
      if (!puzzle) continue;
      const bucket = byId[puzzle.category];
      if (!bucket) continue;
      bucket.attempts += 1;
      if (item.wasCorrect) bucket.correct += 1;
    }
    return byId;
  }, [history]);

  const selectedCategoryStats = selectedCategory
    ? statsByCategory[selectedCategory] || { attempts: 0, correct: 0 }
    : { attempts: 0, correct: 0 };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg,${C.bg},${C.bgDeep})`,
        fontFamily: "Georgia,serif",
        paddingBottom: 24,
      }}
    >
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: `1px solid ${C.border}`,
            background: C.card,
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(44,26,10,0.08)",
          }}
        >
          <button
            onClick={() => (selectedCategory ? setSelectedCategory(null) : setScreen("home"))}
            style={{ background: "none", border: "none", color: C.gold, fontSize: 20, cursor: "pointer" }}
          >
            ←
          </button>
          <div>
            <div style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>
              {selectedCategory
                ? CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Category"
                : "Puzzle Categories"}
            </div>
            <div style={{ color: "#B07010", fontSize: 10, letterSpacing: 2 }}>
              {selectedCategory ? "PERFORMANCE DETAILS" : "HOW YOU DO BY PUZZLE TYPE"}
            </div>
          </div>
        </div>

        {!selectedCategory ? (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const pool = PUZZLES.filter((p) => p.category === cat.id);
              const solved = pool.filter((p) => completedSet.has(p.id)).length;
              const perf = statsByCategory[cat.id] || { attempts: 0, correct: 0 };
              const catAccuracy = perf.attempts > 0 ? Math.round((perf.correct / perf.attempts) * 100) : 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    textAlign: "left",
                    background: C.card,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "14px 14px 12px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(44,26,10,0.08)",
                  }}
                >
                  <div style={{ color: C.gold, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ color: C.textMid, fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{cat.description}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ color: C.textSoft, fontSize: 11 }}>{solved} / {pool.length} solved</div>
                    <div style={{ color: C.blue, fontSize: 11, fontWeight: 700 }}>{catAccuracy}% acc</div>
                    <div style={{ color: C.textSoft, fontSize: 10, letterSpacing: 1 }}>OPEN →</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ color: C.textSoft, fontSize: 11, letterSpacing: 1 }}>ATTEMPTS</div>
              <div style={{ color: C.text, fontSize: 24, fontWeight: 800 }}>{selectedCategoryStats.attempts}</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ color: C.textSoft, fontSize: 11, letterSpacing: 1 }}>CORRECT</div>
              <div style={{ color: C.green, fontSize: 24, fontWeight: 800 }}>{selectedCategoryStats.correct}</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ color: C.textSoft, fontSize: 11, letterSpacing: 1 }}>ACCURACY</div>
              <div style={{ color: C.blue, fontSize: 24, fontWeight: 800 }}>
                {selectedCategoryStats.attempts > 0 ? Math.round((selectedCategoryStats.correct / selectedCategoryStats.attempts) * 100) : 0}%
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ color: C.textSoft, fontSize: 11, letterSpacing: 1 }}>SOLVED PUZZLES</div>
              <div style={{ color: C.text, fontSize: 24, fontWeight: 800 }}>
                {PUZZLES.filter((p) => p.category === selectedCategory && completedSet.has(p.id)).length} / {PUZZLES.filter((p) => p.category === selectedCategory).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
