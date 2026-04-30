/**
 * Synth SFX → mono 16-bit WAV (royalty-free, no external samples).
 * Run: node scripts/generate-sfx.cjs
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SAMPLE_RATE = 44100;

function writeWav(filepath, floats) {
  const n = floats.length;
  const dataSize = n * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // pcm chunk size
  buffer.writeUInt16LE(1, 20); // audio format 1 = PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, floats[i]));
    buffer.writeInt16LE(Math.round(s * 32767), offset);
    offset += 2;
  }

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
}

function deterministicNoise(seed, i) {
  const x = Math.sin(seed + i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function genCheckerMove() {
  const dur = 0.075;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 92);
    const env2 = Math.exp(-t * 200);
    const body = Math.sin(2 * Math.PI * 310 * t) * 0.42 * env;
    const click = Math.sin(2 * Math.PI * 1280 * t) * 0.14 * env2;
    const n = (deterministicNoise(2.17, i) * 2 - 1) * 0.07 * env * env;
    out[i] = body + click + n;
  }
  return out;
}

function genButtonClick() {
  const dur = 0.038;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 160);
    const tone = Math.sin(2 * Math.PI * 1650 * t) * 0.16 * env;
    const soft = Math.sin(2 * Math.PI * 520 * t) * 0.06 * env;
    out[i] = tone + soft;
  }
  return out;
}

/**
 * Scene-setting tabletop dice (~0.75s): hand/shake tumble → wood-tone clacks → decay.
 * Synth only (license-free); replace public/sounds/dice-roll.{wav,mp3} with sourced Foley if desired.
 */
function genDiceRoll() {
  const dur = 0.78;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);

  /** Short wooden “clack” impulse */
  function addImpulse(i0, amplitude, decayHz, barkHz, seedOff) {
    const span = Math.min(len - i0, Math.floor(SAMPLE_RATE * 0.045));
    for (let k = 0; k < span; k++) {
      const i = i0 + k;
      if (i >= len) break;
      const tt = k / SAMPLE_RATE;
      const e = Math.exp(-decayHz * tt);
      const thump = Math.sin(2 * Math.PI * barkHz * tt + seedOff) * amplitude * e;
      const tic = Math.sin(2 * Math.PI * (barkHz * 4.7 + 80) * tt) * amplitude * 0.35 * e;
      const n = (deterministicNoise(40.22 + seedOff, i) * 2 - 1) * amplitude * 0.09 * e;
      out[i] += thump + tic + n;
    }
  }

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const rel = i / Math.max(len - 1, 1);
    const fadeIn = Math.min(1, t / 0.04);
    const shell = Math.sin(Math.PI * rel);
    const envShake = fadeIn * shell ** 0.92 * Math.exp(-2.95 * t);
    const shakeGr = (deterministicNoise(11.07, i) * 2 - 1) * 0.12 * envShake;
    const rattLo = Math.sin(2 * Math.PI * (240 + 90 * deterministicNoise(2.3, Math.floor(i / 55))) * t)
      * 0.05 * envShake;
    const rattHi = Math.sin(2 * Math.PI * (720 + 180 * deterministicNoise(5.1, Math.floor(i / 38))) * t)
      * 0.042 * envShake;
    out[i] = shakeGr + rattLo + rattHi;
  }

  const landingsSec = [0.08, 0.165, 0.255, 0.38, 0.485, 0.61, 0.705];
  for (let j = 0; j < landingsSec.length; j++) {
    const tHit = landingsSec[j];
    const iHit = Math.floor(tHit * SAMPLE_RATE);
    const amp = [0.19, 0.14, 0.21, 0.16, 0.22, 0.13, 0.09][j] ?? 0.12;
    const hz = [310, 280, 360, 300, 340, 270, 320][j] ?? 300;
    addImpulse(iHit, amp * 0.52, 78, hz, j * 1.7 + 2.1);
  }

  const rumbleDur = Math.floor(SAMPLE_RATE * 0.12);
  for (let j = 0; j < 18; j++) {
    const i0 = Math.floor((0.045 + j * 0.018) * SAMPLE_RATE);
    const a = [0.04, 0.055, 0.048][j % 3];
    addImpulse(i0, a, 115, 450 + j * 12, j * 0.9 + 11);
    if (i0 + rumbleDur < len)
      for (let k = 0; k < rumbleDur; k++) {
        const i = i0 + k;
        const tt = k / SAMPLE_RATE;
        const e = Math.exp(-48 * tt);
        out[i] += (deterministicNoise(99 + j, i) * 2 - 1) * 0.05 * e * a;
      }
  }

  for (let i = 0; i < len; i++) {
    out[i] = Math.min(0.92, Math.max(-0.92, out[i]));
  }
  return out;
}

/** Intro splash — longer, very soft dice tumble (~0.38s). */
function genSplashDice() {
  const dur = 0.38;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const rel = i / Math.max(len - 1, 1);
    const shell = Math.sin(Math.PI * rel);
    const env = shell ** 0.9 * Math.exp(-4.2 * t);
    const grain = (deterministicNoise(13.7, i) * 2 - 1) * 0.055 * env;
    const roll = Math.sin(2 * Math.PI * (420 + 90 * deterministicNoise(2.2, Math.floor(i / 60))) * t)
      * 0.045 * env;
    const tick = Math.sin(2 * Math.PI * (900 + 500 * deterministicNoise(4.9, Math.floor(i / 24))) * t)
      * 0.035 * env * shell;
    out[i] = Math.min(0.18, Math.max(-0.18, grain + roll + tick));
  }
  return out;
}

const outDir = path.join(__dirname, "..", "public", "sounds");
const wavChecker = path.join(outDir, "checker-move.wav");
const wavButton = path.join(outDir, "button-click.wav");
const wavDice = path.join(outDir, "dice-roll.wav");
const wavSplash = path.join(outDir, "splash-dice.wav");
const compressedDice = path.join(outDir, "dice-roll.m4a");

writeWav(wavChecker, genCheckerMove());
writeWav(wavButton, genButtonClick());
writeWav(wavDice, genDiceRoll());
writeWav(wavSplash, genSplashDice());

const mp3Checker = path.join(outDir, "checker-move.mp3");
const mp3Button = path.join(outDir, "button-click.mp3");
const mp3Dice = path.join(outDir, "dice-roll.mp3");
const mp3Splash = path.join(outDir, "splash-dice.mp3");

let ffOk = spawnSync("ffmpeg", [
  "-y",
  "-i",
  wavChecker,
  "-codec:a",
  "libmp3lame",
  "-b:a",
  "48k",
  mp3Checker,
], { encoding: "utf8" }).status === 0;

/** AAC in MP4 (.m4a) — small preload when ffmpeg lacks MP3; Howler loads it cleanly. */
const afDice = spawnSync("afconvert", [wavDice, compressedDice, "-f", "m4af", "-d", "aac"], {
  encoding: "utf8",
});
const afDiceOk = afDice.status === 0;

if (ffOk) {
  spawnSync("ffmpeg", [
    "-y",
    "-i",
    wavButton,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "48k",
    mp3Button,
  ], { encoding: "utf8" });
  spawnSync(
    "ffmpeg",
    ["-y", "-i", wavDice, "-codec:a", "libmp3lame", "-b:a", "96k", mp3Dice],
    { encoding: "utf8" }
  );
  spawnSync(
    "ffmpeg",
    ["-y", "-i", wavSplash, "-codec:a", "libmp3lame", "-b:a", "48k", mp3Splash],
    { encoding: "utf8" }
  );
}
if (afDiceOk) {
  // dice-roll.m4a emitted by afconvert
}

if (ffOk || afDiceOk) {
  // eslint-disable-next-line no-console
  console.log(
    ffOk ? "Wrote WAV + dice-roll.mp3 (+ other MP3 helper files) in public/sounds/"
      : "Wrote WAV + dice-roll.m4a (AAC) — install ffmpeg for full MP3 set",
  );
} else {
  // eslint-disable-next-line no-console
  console.log("ffmpeg + afconvert missing — WAV only written to public/sounds/");
}
