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

/** Short wood-on-wood knock: low modes + brief grain, minimal “hollow” highs */
function genCheckerMove() {
  const dur = 0.095;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-46 * t) * (1 - Math.exp(-900 * t));
    const f0 = 158;
    const body =
      Math.sin(2 * Math.PI * f0 * t) * 0.44 * env +
      Math.sin(2 * Math.PI * f0 * 2.05 * t) * 0.16 * env +
      Math.sin(2 * Math.PI * 268 * t) * 0.08 * env;
    const grain = ((deterministicNoise(2.17, i) * 2 - 1) * 0.07 * env * env);
    out[i] = body + grain;
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
 * Dice on wooden board: sparse low-mid “clacks” + soft skitter, no long filtered-noise “air” bed.
 */
function genDiceRoll() {
  const dur = 0.58;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);

  function addWoodClack(i0, amp, f0, seed) {
    const span = Math.min(len - i0, Math.floor(SAMPLE_RATE * 0.042));
    for (let k = 0; k < span; k++) {
      const i = i0 + k;
      if (i >= len) break;
      const tt = k / SAMPLE_RATE;
      const e = Math.exp(-88 * tt);
      const w =
        amp *
        e *
        (Math.sin(2 * Math.PI * f0 * tt + seed) * 0.52 +
          Math.sin(2 * Math.PI * f0 * 2.05 * tt + seed * 1.3) * 0.22 +
          Math.sin(2 * Math.PI * f0 * 3.6 * tt + seed * 2.1) * 0.1);
      const grain = ((deterministicNoise(40.2 + seed, i) * 2 - 1) * amp * 0.045 * e);
      out[i] += w + grain;
    }
  }

  /** Irregular board contacts (ms, relative amplitude) */
  const hits = [
    [0.032, 0.2],
    [0.078, 0.14],
    [0.118, 0.18],
    [0.168, 0.12],
    [0.212, 0.2],
    [0.258, 0.11],
    [0.302, 0.17],
    [0.352, 0.13],
    [0.398, 0.16],
    [0.448, 0.1],
    [0.498, 0.14],
  ];
  const freqs = [188, 215, 172, 228, 198, 205, 182, 222, 194, 208, 176];
  for (let j = 0; j < hits.length; j++) {
    const [tSec, a] = hits[j];
    const i0 = Math.floor(tSec * SAMPLE_RATE);
    addWoodClack(i0, a * 0.62, freqs[j % freqs.length], 2.4 + j * 0.85);
  }

  /** Brief low skitter between hits (board texture, not air hiss) */
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-5.2 * t) * Math.min(1, t / 0.02);
    const sk = (deterministicNoise(11.07, i) * 2 - 1) * 0.028 * env;
    const lo = Math.sin(2 * Math.PI * 120 * t) * 0.018 * env * Math.sin(Math.PI * t * 12);
    out[i] += sk + lo;
  }

  for (let i = 0; i < len; i++) {
    out[i] = Math.min(0.9, Math.max(-0.9, out[i]));
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
