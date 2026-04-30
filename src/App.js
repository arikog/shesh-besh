import { useEffect, useRef, useState } from "react";
import { diceLabel } from "./constants/dice";
import { PUZZLES } from "./data/puzzles";
import { evaluatePosition } from "./engine/evaluator";
import { applyMove, getLegalDests } from "./game/moveEngine";
import HomeScreen from "./screens/HomeScreen";
import LearnScreen from "./screens/LearnScreen";
import PuzzleScreen from "./screens/PuzzleScreen";
import CategoryBrowserScreen from "./screens/CategoryBrowserScreen";
import IntroSplash from "./components/IntroSplash";
import {
  playAdvancePuzzle,
  playDiceRoll,
  playCheckerMove,
  syncSfxMutedState,
  getInitialSfxMuted,
  warmupSfx,
  tryResumeAudioContext,
} from "./audio/puzzleSfx";
import { recordPuzzleAttempt } from "./storage/progress";

export default function SheshBesh() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [screen,      setScreen     ] = useState("home");
  const [puzzleIdx,   setPuzzleIdx  ] = useState(0);
  const [iq,          setIq         ] = useState(1000);
  const [streak,      setStreak     ] = useState(0);
  const [accuracy,    setAccuracy   ] = useState(0);
  const [totalAnswered,setTotalAnswered]=useState(0);

  const [liveBoard,  setLiveBoard ] = useState(null);
  const [diceLeft,   setDiceLeft  ] = useState([]);
  const [selected,   setSelected  ] = useState(null);
  const [legalDests, setLegalDests] = useState([]);
  const [movesDone,  setMovesDone ] = useState([]);
  const [borneOff,   setBorneOff  ] = useState(0);
  const [phase,      setPhase     ] = useState("playing");
  const [isCorrect,  setIsCorrect ] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [attempts,   setAttempts  ] = useState(0);
  const [popupOpen,  setPopupOpen ] = useState(false);
  const [resultBoard, setResultBoard] = useState(null);
  const [resultIqDelta, setResultIqDelta] = useState(0);

  const [basePct,    setBasePct   ] = useState(50);
  const [currentPct, setCurrentPct] = useState(50);
  const [completedPuzzleIds, setCompletedPuzzleIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [sfxMuted, setSfxMuted] = useState(getInitialSfxMuted);
  const [showIntroSplash, setShowIntroSplash] = useState(true);

  const puzzle  = PUZZLES[puzzleIdx%PUZZLES.length];
  const label   = diceLabel(puzzle.dice[0],puzzle.dice[1]);
  const iqDelta = puzzle.difficulty==="Advanced"?18:puzzle.difficulty==="Intermediate"?12:8;

  /** Roll dice SFX whenever puzzle view gains focus or puzzle index advances */
  const puzzleNavRef = useRef({ screen: undefined, puzzleIdx: undefined });
  useEffect(() => {
    const wasPuzzle = puzzleNavRef.current.screen === "puzzle";
    const prevIdx = puzzleNavRef.current.puzzleIdx;
    const nowPuzzle = screen === "puzzle";
    if (nowPuzzle && (!wasPuzzle || puzzleIdx !== prevIdx)) {
      playDiceRoll();
    }
    puzzleNavRef.current = { screen, puzzleIdx };
  }, [screen, puzzleIdx]);

  function initPuzzle(p) {
    const dice=p.dice[0]===p.dice[1]?[p.dice[0],p.dice[0],p.dice[0],p.dice[0]]:[...p.dice];
    setLiveBoard([...p.board]);
    setDiceLeft(dice);
    setSelected(null);
    setLegalDests([]);
    setMovesDone([]);
    setBorneOff(0);
    setPhase("playing");
    setAttempts(0);
    setWrongFlash(null);
    setPopupOpen(false);
    setResultBoard(null);
    setResultIqDelta(0);
    const startPct = evaluatePosition(p.board, p.dice, "white").winPct;
    setBasePct(startPct);
    setCurrentPct(startPct);
  }
  useEffect(()=>{ initPuzzle(PUZZLES[puzzleIdx%PUZZLES.length]); },[puzzleIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    warmupSfx();
  }, []);

  useEffect(() => {
    syncSfxMutedState(sfxMuted);
  }, [sfxMuted]);

  function toggleSfxMuted() {
    setSfxMuted((m) => {
      const next = !m;
      if (!next) tryResumeAudioContext();
      return next;
    });
  }

  function withSplash(node) {
    return (
      <>
        {node}
        {showIntroSplash && (
          <IntroSplash onDone={() => setShowIntroSplash(false)} />
        )}
      </>
    );
  }

  function hydrateProgress(saved) {
    if (!saved) return;
    setIq(saved.iq);
    setStreak(saved.streak);
    setAccuracy(saved.accuracy);
    setCompletedPuzzleIds(saved.completedPuzzleIds);
    setHistory(saved.history);
    setTotalAnswered(saved.history.length);
  }

  function isMovePrefixValid(attemptedMoves, bestMoves) {
    if (attemptedMoves.length > bestMoves.length) return false;
    const remaining = bestMoves.map(m=>`${m.from}->${m.to}`);
    for (const m of attemptedMoves) {
      const key = `${m.from}->${m.to}`;
      const idx = remaining.indexOf(key);
      if (idx === -1) return false;
      remaining.splice(idx,1);
    }
    return true;
  }

  function handlePointClick(ptIdx) {
    if (phase!=="playing"||!liveBoard) return;
    const val=liveBoard[ptIdx];

    if (selected===null) {
      if (val>0) { setSelected(ptIdx); setLegalDests(getLegalDests(liveBoard,ptIdx,diceLeft)); }
      return;
    }
    if (ptIdx===selected) { setSelected(null); setLegalDests([]); return; }

    const hl=legalDests.find(d=>d.to===ptIdx);
    if (hl) { tryMove(selected, ptIdx, hl.die); return; }
    if (val>0) { setSelected(ptIdx); setLegalDests(getLegalDests(liveBoard,ptIdx,diceLeft)); return; }
    setSelected(null); setLegalDests([]);
  }

  function handleBearOff() {
    if (phase !== 'playing' || !liveBoard || selected === null) return;
    const hl = legalDests.find(d => d.to === -1);
    if (!hl) return;
    tryMove(selected, -1, hl.die);
  }

  function tryMove(from, to, die){
    const attempted = [...movesDone, {from, to}];
    const valid = isMovePrefixValid(attempted, puzzle.bestMoves);

    if (!valid) {
      setWrongFlash(to);
      setTimeout(()=>setWrongFlash(null), 500);
      setSelected(null); setLegalDests([]);
      setAttempts(n=>n+1);
      const hypBoard = applyMove(liveBoard, from, to);
      setResultBoard(hypBoard);
      const wrongPct = evaluatePosition(hypBoard, puzzle.dice, "white").winPct;
      setCurrentPct(wrongPct);
      const K = 12;
      const expected = 1 / (1 + Math.pow(10, (1400 - iq) / 400));
      const penalty = Math.max(-5, Math.round(K * (0 - expected)));
      setResultIqDelta(penalty);
      setTimeout(()=>{
        setIsCorrect(false);
        setPopupOpen(true);
        setPhase("result");
      }, 600);
      return;
    }

    const nb = applyMove(liveBoard, from, to);
    const nd = [...diceLeft]; nd.splice(nd.indexOf(die),1);
    setLiveBoard(nb); setDiceLeft(nd);
    setMovesDone(attempted);
    if (to===-1) setBorneOff(n=>n+1);
    playCheckerMove();
    setSelected(null); setLegalDests([]);

    if (attempted.length === puzzle.bestMoves.length) {
      const finalPct = evaluatePosition(nb, puzzle.dice, "white").winPct;
      const bestBoard = puzzle.bestMoves.reduce(
        (acc, move) => applyMove(acc, move.from, move.to),
        [...puzzle.board]
      );
      const bestEvalPct = evaluatePosition(bestBoard, puzzle.dice, "white").winPct;
      const fallbackBestPct = Number.isFinite(puzzle.bestWinPct) ? puzzle.bestWinPct : bestEvalPct;
      const trustedBestPct = Number.isFinite(bestEvalPct) && bestEvalPct >= 0 && bestEvalPct <= 100
        ? bestEvalPct
        : fallbackBestPct;
      // Correct solution should not display as worse than the puzzle's baseline.
      const resolvedCorrectPct = Math.max(basePct, trustedBestPct, finalPct);
      setResultBoard(nb);
      setCurrentPct(resolvedCorrectPct);
      setResultIqDelta(attempts === 0 ? iqDelta : Math.round(iqDelta / 2));
      setIsCorrect(true);
      setTimeout(()=>{
        setPopupOpen(true);
        setPhase("result");
      }, 900);
    }
  }

  function handleRetry(){
    const p = puzzle;
    const dice=p.dice[0]===p.dice[1]?[p.dice[0],p.dice[0],p.dice[0],p.dice[0]]:[...p.dice];
    setLiveBoard([...p.board]);
    setDiceLeft(dice);
    setSelected(null);
    setLegalDests([]);
    setMovesDone([]);
    setBorneOff(0);
    setPhase("playing");
    setCurrentPct(basePct);
    setPopupOpen(false);
    setResultBoard(null);
    setResultIqDelta(0);
    playDiceRoll();
  }

  function handleNextPuzzle(){
    playAdvancePuzzle();
    if (!isCorrect) {
      setTotalAnswered(a=>a+1);
      setStreak(0);
    }
    setPopupOpen(false);
    setTimeout(()=>setPuzzleIdx(i=>i+1), 200);
  }

  function handleHint(){
    setPopupOpen(true);
    setPhase("hint");
  }

  const deltaPct = currentPct - basePct;
  const diceUsedFlags = [
    diceLeft.length < (puzzle.dice[0]===puzzle.dice[1]?4:2) - (puzzle.dice[0]===puzzle.dice[1]?2:1),
    diceLeft.length < (puzzle.dice[0]===puzzle.dice[1]?2:0),
  ];
  // Bear-off pocket is tappable only when a white checker is currently selected
  // AND that checker can legally bear off with a remaining die
  const canBearOffFromState = selected!==null && legalDests.some(d=>d.to===-1);

  function handleRecordPuzzleAttempt({ puzzleId, wasCorrect, iqDelta }) {
    const next = recordPuzzleAttempt({
      puzzleId,
      wasCorrect,
      iqDelta,
    });
    setIq(next.iq);
    setStreak(next.streak);
    setAccuracy(next.accuracy);
    setCompletedPuzzleIds(next.completedPuzzleIds);
    setHistory(next.history);
    setTotalAnswered(next.history.length);
  }

  if (screen === "home") {
    return withSplash(
      <HomeScreen
        showWelcome={showWelcome}
        setShowWelcome={setShowWelcome}
        iq={iq}
        streak={streak}
        accuracy={accuracy}
        totalAnswered={totalAnswered}
        setScreen={setScreen}
        setPuzzleIdx={setPuzzleIdx}
        onHydrateProgress={hydrateProgress}
      />
    );
  }

  if (screen === "learn") {
    return withSplash(<LearnScreen setScreen={setScreen} />);
  }

  if (screen === "categories") {
    return withSplash(
      <CategoryBrowserScreen
        setScreen={setScreen}
        completedPuzzleIds={completedPuzzleIds}
        history={history}
      />
    );
  }

  return withSplash(
    <PuzzleScreen
      setScreen={setScreen}
      handleHint={handleHint}
      iq={iq}
      streak={streak}
      accuracy={accuracy}
      puzzleIdx={puzzleIdx}
      label={label}
      puzzle={puzzle}
      currentPct={currentPct}
      deltaPct={deltaPct}
      liveBoard={liveBoard}
      movesDone={movesDone}
      resultBoard={resultBoard}
      selected={selected}
      legalDests={legalDests}
      handlePointClick={handlePointClick}
      handleBearOff={handleBearOff}
      borneOff={borneOff}
      diceUsedFlags={diceUsedFlags}
      wrongFlash={wrongFlash}
      canBearOffFromState={canBearOffFromState}
      phase={phase}
      popupOpen={popupOpen}
      setPopupOpen={setPopupOpen}
      setPhase={setPhase}
      isCorrect={isCorrect}
      resultIqDelta={resultIqDelta}
      onRecordPuzzleAttempt={handleRecordPuzzleAttempt}
      handleNextPuzzle={handleNextPuzzle}
      handleRetry={handleRetry}
      attempts={attempts}
      iqDelta={iqDelta}
      sfxMuted={sfxMuted}
      toggleSfxMuted={toggleSfxMuted}
    />
  );
}
