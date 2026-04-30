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

/** Subtle tabletop tumble — short noise + softened micro-clicks, lower amplitude than checker. */
function genDiceRoll() {
  const dur = 0.19;
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const rel = i / Math.max(len - 1, 1);
    const shell = Math.sin(Math.PI * rel);
    const env = shell ** 1.05 * Math.exp(-5.8 * t);
    const grain = (deterministicNoise(9.331, i) * 2 - 1) * 0.1 * env;
    const scuff = Math.sin(2 * Math.PI * (580 + 160 * deterministicNoise(1.71, Math.floor(i / 42))) * t)
      * 0.065 * env;
    const tickBurst = Math.sin(2 * Math.PI * (1100 + 900 * deterministicNoise(3.91, Math.floor(i / 18))) * t)
      * 0.055 * env * shell;
    out[i] = grain + scuff + tickBurst;
    out[i] = Math.min(0.32, Math.max(-0.32, out[i]));
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

writeWav(wavChecker, genCheckerMove());
writeWav(wavButton, genButtonClick());
writeWav(wavDice, genDiceRoll());
writeWav(wavSplash, genSplashDice());

const mp3Checker = path.join(outDir, "checker-move.mp3");
const mp3Button = path.join(outDir, "button-click.mp3");
const mp3Dice = path.join(outDir, "dice-roll.mp3");
const mp3Splash = path.join(outDir, "splash-dice.mp3");

const ff = spawnSync("ffmpeg", [
  "-y",
  "-i",
  wavChecker,
  "-codec:a",
  "libmp3lame",
  "-b:a",
  "48k",
  mp3Checker,
], { encoding: "utf8" });

if (ff.status === 0) {
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
    ["-y", "-i", wavDice, "-codec:a", "libmp3lame", "-b:a", "48k", mp3Dice],
    { encoding: "utf8" }
  );
  spawnSync(
    "ffmpeg",
    ["-y", "-i", wavSplash, "-codec:a", "libmp3lame", "-b:a", "48k", mp3Splash],
    { encoding: "utf8" }
  );
  // eslint-disable-next-line no-console
  console.log("Wrote WAV + MP3 to public/sounds/");
} else {
  // eslint-disable-next-line no-console
  console.log("ffmpeg not available — kept WAV only in public/sounds/");
}
