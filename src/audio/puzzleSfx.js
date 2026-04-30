import { Howl, Howler } from "howler";

const STORAGE_KEY = "shesh-besh:sfxMuted";

/** ~45% ambience level */
const VOL_CHECKER = 0.46;
const VOL_BUTTON = 0.42;
/** Puzzle-load dice tumble — prominent scene cue, still under full-scale */
const VOL_DICE = 0.55;

const publicRoot = `${process.env.PUBLIC_URL ?? ""}`.replace(/\/$/, "");

const sfxSrc = (base) => `${publicRoot}/sounds/${base}.wav`;
const sfxDiceRollSrc = () => {
  const m4a = `${publicRoot}/sounds/dice-roll.m4a`;
  const wav = `${publicRoot}/sounds/dice-roll.wav`;
  return [m4a, wav];
};

let userMutedFlag = typeof window !== "undefined" && safeReadMuted();

function safeReadMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch (_) {
    return false;
  }
}

function persistMuted(muted) {
  try {
    if (muted) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}

const checkerHowl = new Howl({
  src: sfxSrc("checker-move"),
  volume: VOL_CHECKER,
  preload: true,
  html5: false,
});

const buttonHowl = new Howl({
  src: sfxSrc("button-click"),
  volume: VOL_BUTTON,
  preload: true,
  html5: false,
});

const diceRollHowl = new Howl({
  src: sfxDiceRollSrc(),
  volume: VOL_DICE,
  preload: true,
  html5: false,
});

const splashDiceHowl = new Howl({
  src: sfxSrc("splash-dice"),
  volume: 0.22,
  preload: true,
  html5: false,
});

export function syncSfxMutedState(muted) {
  userMutedFlag = muted;
  Howler.mute(muted);
  persistMuted(muted);
}

export function getInitialSfxMuted() {
  if (typeof window === "undefined") return false;
  return safeReadMuted();
}

/** Idempotent listeners so iOS/mobile unlock Web Audio after first gesture */
let unlockInstalled = false;
export function attachSfxUnlockListeners() {
  if (unlockInstalled || typeof window === "undefined") return;
  unlockInstalled = true;

  const tick = async () => {
    const ctx = Howler.ctx;
    if (!ctx || ctx.state === "running") return;
    try {
      await ctx.resume();
    } catch (_) {}
  };

  ["pointerdown", "keydown", "touchend"].forEach((evt) =>
    window.addEventListener(evt, tick, { capture: true, passive: true })
  );
}

export function playCheckerMove() {
  if (userMutedFlag) return;
  checkerHowl.play();
}

export function playAdvancePuzzle() {
  if (userMutedFlag) return;
  buttonHowl.play();
}

/** New puzzle dice on screen — double rAF so audio follows visible dice */
export function playDiceRoll() {
  if (userMutedFlag) return;
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => diceRollHowl.play());
    });
    return;
  }
  diceRollHowl.play();
}

/** Intro splash dice (~0.38s asset), quieter than gameplay dice roll. */
export function playSplashDice() {
  if (userMutedFlag) return;
  splashDiceHowl.play();
}

export function warmupSfx() {
  attachSfxUnlockListeners();
}

/** Call after user toggles sound on so playback works without another gesture */
export function tryResumeAudioContext() {
  attachSfxUnlockListeners();
  const ctx = Howler.ctx;
  if (ctx?.state !== "running") {
    ctx?.resume?.()?.catch(() => {});
  }
}
