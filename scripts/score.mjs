// Background music + sound effects for a reel, generated (no samples, no downloads) and ducked under the voice.
//   node scripts/score.mjs <naam>      (npm run preview/reel call this by themselves)
// Reads  src/reels/<naam>.sound.json  (optional; without it a soft tanpura + pad bed is used)
//        src/generated/timing.json    (scene start times + subtitle words, for anchoring cues)
//        public/voice.wav             (for ducking)
// Writes public/score.wav (48 kHz 16-bit stereo).
// Cue times: "at"/"from"/"to" in seconds; with "scene": N (1-based) they are seconds inside that scene;
// "at": "55%" = 55% into the scene. "word": "jal" puts "at" on that spoken word (inside the scene if "scene" is given). "to": "end" = scene/reel end.
// Formats and the situation -> sound recipe: .claude/skills/cinematic-reel/references/sound-design.md
import fs from "node:fs";
const NAME = process.argv[2];
const TIMING = JSON.parse(fs.readFileSync("src/generated/timing.json", "utf8"));
const cueFile = NAME ? `src/reels/${NAME}.sound.json` : null;
const DEFAULT = { key: "D", music: [{ type: "tanpura", from: 0, to: "end", gain: 0.05 }, { type: "pad", from: 0, to: "end", chord: "minor", gain: 0.1, cutoff: [300, 700] }], sfx: [] };
const cues = cueFile && fs.existsSync(cueFile) ? JSON.parse(fs.readFileSync(cueFile, "utf8")) : DEFAULT;
if (!(cueFile && fs.existsSync(cueFile))) console.log(`(${cueFile ?? "no reel name"} nahi mila: default tanpura + pad bed)`);
const SR = 48000, DUR = TIMING.duration, N = Math.round(SR * DUR);
const SHOTS = TIMING.shots.map((s) => s.at);
const WORDS = TIMING.subtitle.flatMap((g) => g.w.map(([text, at]) => ({ text: String(text).toLowerCase().replace(/[^a-z0-9]/g, ""), at })));
const sceneStart = (n) => SHOTS[Math.min(SHOTS.length - 1, Math.max(0, n - 1))] ?? 0;
const sceneEnd = (n) => (n < SHOTS.length ? SHOTS[n] : DUR);
/** Turn scene/word-relative cue times into absolute seconds. */
function resolve(c) {
  const base = c.scene ? sceneStart(c.scene) : 0, endT = c.scene ? sceneEnd(c.scene) : DUR;
  const abs = (v) => (v === "end" ? endT : typeof v === "number" ? base + v : typeof v === "string" && v.endsWith("%") ? base + (endT - base) * parseFloat(v) / 100 : v);
  const out = { ...c };
  if (c.word) {
    const q = String(c.word).toLowerCase().replace(/[^a-z0-9]/g, "");
    const w = WORDS.find((x) => x.at >= base - 0.01 && x.text.includes(q)) ?? WORDS.find((x) => x.text.includes(q));
    if (!w) console.log(`WARNING: word "${c.word}" subtitles me nahi mila; cue ${c.type} scene start par laga.`);
    out.at = (w ? w.at : base) + (typeof c.at === "number" ? c.at : 0);
  } else if (c.at !== undefined) out.at = abs(c.at);
  for (const k of ["from", "to"]) if (c[k] !== undefined) out[k] = abs(c[k]);
  if (out.notes) out.notes = c.notes.map(([d, a, l]) => [d, abs(a), l]);
  if (out.curve) out.curve = c.curve.map(([a, v]) => [abs(a), v]);
  if (out.from !== undefined && out.to === undefined) out.to = endT;
  return out;
}
const TAU = Math.PI * 2;
// three buses: music (ducked under the voice), sfx (not ducked), reverb send
const M = [new Float32Array(N), new Float32Array(N)], X = [new Float32Array(N), new Float32Array(N)];
const busRev = new Float32Array(N);
let seed = cues.seed || 1234567;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const nz = () => rnd() * 2 - 1;
const S = (t) => Math.round(t * SR);
let BUS = X; // current bus while rendering a cue
const add = (i, v, pan = 0, rev = 0.2) => {
  if (i < 0 || i >= N) return;
  BUS[0][i] += v * Math.cos((pan + 1) * Math.PI / 4) * 1.41;
  BUS[1][i] += v * Math.sin((pan + 1) * Math.PI / 4) * 1.41;
  busRev[i] += v * rev;
};
const addLR = (i, l, r, rev = 0) => { if (i < 0 || i >= N) return; BUS[0][i] += l; BUS[1][i] += r; busRev[i] += (l + r) * rev; };
function biquad(type, f, q) {
  let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (f) => {
    const w = TAU * Math.min(Math.max(f, 10), SR * 0.45) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
    let nb0, nb1, nb2;
    if (type === "lp") { nb0 = (1 - c) / 2; nb1 = 1 - c; nb2 = (1 - c) / 2; }
    else if (type === "hp") { nb0 = (1 + c) / 2; nb1 = -(1 + c); nb2 = (1 + c) / 2; }
    else { nb0 = al; nb1 = 0; nb2 = -al; }
    b0 = nb0 / a0; b1 = nb1 / a0; b2 = nb2 / a0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
  };
  set(f);
  const fn = (x) => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
  fn.set = set; return fn;
}
const env = (t, a, d) => (t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / d));
/** piecewise-linear curve [[t, v], ...] */
const curve = (pts, t) => { if (!pts) return 1; if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + (vb - va) * (t - a) / (b - a); } return pts[pts.length - 1][1]; };

/* ---------------- musical constants ---------------- */
const NOTE = { C: 65.41, "C#": 69.30, D: 73.42, "D#": 77.78, E: 82.41, F: 87.31, "F#": 92.50, G: 98.0, "G#": 103.83, A: 110.0, "A#": 116.54, B: 123.47 };
const SA = NOTE[cues.key || "D"] || 73.42;
// raga-ish scales as semitone offsets from Sa
const SCALES = { bhairavi: [0, 1, 3, 5, 7, 8, 10], yaman: [0, 2, 4, 6, 7, 9, 11], bhupali: [0, 2, 4, 7, 9], minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], marwa: [0, 1, 4, 6, 9, 11] };
const CHORDS = { minor: [0, 3, 7], major: [0, 4, 7], sus: [0, 5, 7], power: [0, 7, 12], dark: [0, 1, 7], open: [0, 7, 12, 19] };
const semi = (n) => Math.pow(2, n / 12);

/* ---------------- MUSIC ---------------- */
const music = {
  tanpura({ from, to, gain = 0.045 }) {
    const notes = [SA * 1.5, SA * 2, SA * 2, SA];
    for (let k = 0, t = from; t < to; k++, t += 0.62) {
      const f0 = notes[k % 4], i0 = S(t), pan = [-0.4, 0.2, 0.4, -0.1][k % 4];
      for (let j = 0; j < S(3.2); j++) {
        const tt = j / SR; let v = 0;
        for (let h = 1; h <= 14; h++) v += Math.sin(TAU * f0 * h * tt * (1 + 0.0007 * h)) * (1 / h) * (0.6 + 0.4 * Math.sin(tt * (1.3 + h * 0.4)));
        add(i0 + j, v * env(tt, 0.01, 1.4) * gain * Math.min(1, Math.max(0, (to + 0.4 - t - tt) / 0.4)), pan, 0.35);
      }
    }
  },
  pad({ from, to, chord = "minor", root = 0, gain = 0.1, cutoff = [300, 600] }) {
    const freqs = (CHORDS[chord] || CHORDS.minor).map((s) => SA * semi(s + root));
    const lp = [biquad("lp", cutoff[0], 0.8), biquad("lp", cutoff[0], 0.8)], det = [-0.006, 0, 0.007];
    const ph = freqs.flatMap(() => [rnd(), rnd(), rnd()]);
    for (let i = S(from); i < S(to) && i < N; i++) {
      const tt = (i - S(from)) / SR, k = tt / (to - from);
      if ((i & 63) === 0) { const c = cutoff[0] + (cutoff[1] - cutoff[0]) * k; lp[0].set(c); lp[1].set(c); }
      let vl = 0, vr = 0;
      for (let a = 0; a < freqs.length; a++) for (let b = 0; b < 3; b++) {
        const s = 2 * ((freqs[a] * (1 + det[b]) * tt + ph[a * 3 + b]) % 1) - 1;
        if (b === 0) vl += s; else if (b === 2) vr += s; else { vl += s * 0.5; vr += s * 0.5; }
      }
      const g = gain * Math.min(1, tt / 0.6) * Math.min(1, (to - from - tt) / 0.25) / freqs.length;
      addLR(i, lp[0](vl) * g, lp[1](vr) * g, 0.25);
    }
  },
  /** dhol groove: pattern of "D" (dha, bass), "t" (ta, slap), "." (rest), one char per 8th note */
  dhol({ from, to, bpm = 140, pattern = "D.tDt.tt", gain = 0.8 }) {
    const step = 30 / bpm;
    for (let k = 0; from + k * step < to; k++) {
      const c = pattern[k % pattern.length], t = from + k * step;
      if (c === "D") music.dha({ at: t, gain: gain * (k % pattern.length === 0 ? 1.1 : 0.85) });
      else if (c === "t") music.ta({ at: t, gain: gain * 0.9, pan: k % 2 ? 0.3 : -0.3 });
    }
  },
  dha({ at, gain = 1 }) {
    const i0 = S(at), lp = biquad("lp", 900, 0.7);
    for (let j = 0; j < S(0.6); j++) {
      const tt = j / SR, ph = TAU * (52 * tt + 75 * 0.045 * (1 - Math.exp(-tt / 0.045)));
      add(i0 + j, (Math.sin(ph) * env(tt, 0.002, 0.22) + lp(nz()) * env(tt, 0.001, 0.02) * 0.6) * gain * 0.9, -0.05, 0.15);
    }
  },
  ta({ at, gain = 1, pan = 0.25 }) {
    const i0 = S(at), bp = biquad("bp", 2600, 1.2);
    for (let j = 0; j < S(0.25); j++) {
      const tt = j / SR;
      add(i0 + j, (bp(nz()) * env(tt, 0.001, 0.035) * 1.6 + Math.sin(TAU * 420 * tt) * env(tt, 0.001, 0.05) * 0.5) * gain * 0.5, pan, 0.2);
    }
  },
  /** tasha roll: crescendo + accelerando into a hit */
  roll({ from, to, gain = 0.75 }) {
    for (let t = from, k = 0; t < to; k++) { const p = (t - from) / (to - from); music.ta({ at: t, gain: gain * (0.25 + 0.75 * p * p) * (k % 2 ? 0.8 : 1), pan: k % 2 ? 0.35 : -0.35 }); t += 0.085 - 0.04 * p; }
  },
  /** bansuri melody: notes = scale degrees (0 = Sa, 7 = upper Sa for 7-note scales), each [degree, startSec, lenSec] */
  bansuri({ notes, scale = "bhairavi", octave = 2, gain = 0.22, pan = 0.15 }) {
    const sc = SCALES[scale] || SCALES.bhairavi;
    const lp = biquad("lp", 3200, 0.7), br = biquad("bp", 2500, 1.5);
    let ph = 0, prevF = null;
    for (const [deg, at, len] of notes) {
      const o = Math.floor(deg / sc.length), f = SA * Math.pow(2, octave + o) * semi(sc[((deg % sc.length) + sc.length) % sc.length]);
      const i0 = S(at), from = prevF || f; prevF = f;
      for (let j = 0; j < S(len + 0.15); j++) {
        const tt = j / SR, glide = from + (f - from) * Math.min(1, tt / 0.06);
        const vib = 1 + 0.006 * Math.sin(TAU * 5.5 * tt) * Math.min(1, tt / 0.35);
        ph += glide * vib / SR;
        const e = Math.min(1, tt / 0.05) * Math.max(0, Math.min(1, (len + 0.15 - tt) / 0.15));
        const v = Math.sin(TAU * ph) + 0.25 * Math.sin(TAU * ph * 2) + 0.08 * Math.sin(TAU * ph * 3);
        add(i0 + j, (lp(v) * 0.5 + br(nz()) * 0.05) * e * gain, pan, 0.5);
      }
    }
  },
  /** shankh (conch): reedy tone with bend-up, vibrato, breath */
  shankh({ at, len = 2, freq = 233.1, gain = 0.55 }) {
    const i0 = S(at), lp = biquad("lp", 2400, 0.9), br = biquad("bp", 1800, 0.8), amps = [1, 0.8, 0.55, 0.5, 0.3, 0.22, 0.15, 0.1, 0.07, 0.05];
    let ph = 0;
    for (let j = 0; j < S(len); j++) {
      const tt = j / SR, bend = 0.93 + 0.07 * (1 - Math.exp(-tt / 0.25)), vib = 1 + 0.008 * Math.sin(TAU * 5.2 * tt) * Math.min(1, tt / 0.6);
      ph += freq * bend * vib / SR;
      let v = 0; for (let h = 1; h <= 10; h++) v += Math.sin(TAU * ph * h) * amps[h - 1];
      const e = Math.min(1, tt / 0.18) * Math.max(0, Math.min(1, (len - tt) / 0.5)) * (0.85 + 0.15 * Math.sin(tt * 2.1));
      add(i0 + j, (lp(v) * 0.35 + br(nz()) * 0.06) * e * gain, 0, 0.45);
    }
  },
  /** temple bell / ghanti */
  bell({ at, gain = 0.12, freq = 1180, pan = 0.3 }) {
    const i0 = S(at), parts = [[1, 1, 1.4], [2.76, 0.5, 0.7], [5.4, 0.3, 0.35], [8.9, 0.15, 0.2]];
    for (let j = 0; j < S(2.5); j++) { const tt = j / SR; let v = 0; for (const [m, a, d] of parts) v += Math.sin(TAU * freq * m * tt) * a * Math.exp(-tt / d); add(i0 + j, v * gain * Math.min(1, tt / 0.002), pan, 0.5); }
  },
  /** choir "aah" pad for divine moments (formant-filtered saws) */
  choir({ from, to, chord = "major", root = 0, gain = 0.12 }) {
    const freqs = (CHORDS[chord] || CHORDS.major).map((s) => SA * 2 * semi(s + root));
    const f1 = [biquad("bp", 700, 4), biquad("bp", 700, 4)], f2 = [biquad("bp", 1150, 5), biquad("bp", 1150, 5)];
    for (let i = S(from); i < S(to) && i < N; i++) {
      const tt = (i - S(from)) / SR; let vl = 0, vr = 0;
      freqs.forEach((f, a) => { const vib = 1 + 0.004 * Math.sin(TAU * (4.7 + a * 0.3) * tt + a); vl += 2 * ((f * vib * tt * 1.003) % 1) - 1; vr += 2 * ((f * vib * tt * 0.997 + 0.3) % 1) - 1; });
      const g = gain * Math.min(1, tt / 0.8) * Math.min(1, (to - from - tt) / 0.6) / freqs.length;
      addLR(i, (f1[0](vl) + f2[0](vl) * 0.5) * g, (f1[1](vr) + f2[1](vr) * 0.5) * g, 0.6);
    }
  },
};

/* ---------------- SFX ---------------- */
const sfx = {
  /** fire bed: roar + crackles; intensity follows "curve" [[t, 0..1], ...] */
  fire({ from = 0, to = DUR, curve: c = [[0, 0.5]], gain = 1 }) {
    const lp1 = biquad("lp", 300, 0.7), lp2 = biquad("lp", 300, 0.7), hp = biquad("hp", 1500, 0.7);
    let crack = 0, cp = 0;
    for (let i = S(from); i < S(to) && i < N; i++) {
      const t = i / SR, I = curve(c, t);
      if ((i & 127) === 0) { lp1.set(180 + 900 * I); lp2.set(160 + 800 * I); }
      const roar = (lp1(nz()) * 0.7 + lp2(nz()) * 0.3) * (0.15 + 0.6 * I) * (1 + 0.35 * Math.sin(t * 7.3 + Math.sin(t * 3.1) * 2));
      if (rnd() < 0.0004 + 0.004 * I) { crack = 0.3 + rnd() * 0.9; cp = nz() * 0.8; }
      const k = hp(nz()) * crack; crack *= 0.993;
      const e = Math.min(1, (t - from) / 0.3) * Math.min(1, (to - t) / 0.3) * gain;
      addLR(i, (roar * 0.9 + k * 0.21 * (1 - cp)) * e, (roar * 0.9 + k * 0.21 * (1 + cp)) * e, 0.03);
    }
  },
  /** ignition / magic flare-up */
  whoomp({ at, gain = 0.8, pan = 0 }) {
    const i0 = S(at), lp = biquad("lp", 200, 1.1);
    for (let j = 0; j < S(1.2); j++) {
      const tt = j / SR; if ((j & 63) === 0) lp.set(150 + 3200 * Math.exp(-Math.pow((tt - 0.12) / 0.15, 2)) + 400 * Math.exp(-tt / 0.5));
      add(i0 + j, (lp(nz()) * env(tt, 0.06, 0.35) * 1.4 + Math.sin(TAU * (60 + 40 * Math.exp(-tt / 0.1)) * tt) * env(tt, 0.01, 0.2) * 0.5) * gain, pan, 0.25);
    }
  },
  /** fast movement: leap, flight pass, weapon swing (short len), whip-pan */
  whoosh({ at, len = 1, gain = 0.5, panFrom = -0.6, panTo = 0.6 }) {
    const i0 = S(at), bp = biquad("bp", 400, 1.6), bp2 = biquad("bp", 800, 2);
    for (let j = 0; j < S(len); j++) {
      const k = j / S(len); if ((j & 63) === 0) { bp.set(300 + 2200 * Math.sin(Math.PI * k)); bp2.set(600 + 3000 * Math.sin(Math.PI * k)); }
      add(i0 + j, (bp(nz()) * 1.6 + bp2(nz()) * 0.8) * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.15)), 1.6) * gain, panFrom + (panTo - panFrom) * k, 0.2);
    }
  },
  /** landing, footstep (low gain), body hitting ground */
  thud({ at, gain = 0.7, pan = 0 }) {
    const i0 = S(at), lp = biquad("lp", 400, 0.7);
    for (let j = 0; j < S(0.5); j++) { const tt = j / SR; add(i0 + j, (Math.sin(TAU * (45 + 50 * Math.exp(-tt / 0.03)) * tt) * env(tt, 0.002, 0.12) + lp(nz()) * env(tt, 0.001, 0.05) * 0.8) * gain, pan, 0.15); }
  },
  /** big impact / explosion / divine strike: sub boom + crash */
  boom({ at, gain = 1 }) {
    const i0 = S(at), lp = biquad("lp", 250, 0.7), hp = [biquad("hp", 4000, 0.7), biquad("hp", 3000, 0.7)];
    for (let j = 0; j < S(2.9) && i0 + j < N; j++) {
      const tt = j / SR;
      add(i0 + j, (Math.sin(TAU * (34 * tt + 60 * 0.08 * (1 - Math.exp(-tt / 0.08)))) * env(tt, 0.003, 0.7) * 1.1 + lp(nz()) * env(tt, 0.004, 0.45) * 2) * gain, 0, 0.3);
      addLR(i0 + j, hp[0](nz()) * env(tt, 0.002, 0.9) * 0.45 * gain, hp[1](nz()) * env(tt, 0.002, 0.95) * 0.45 * gain, 0.2);
    }
  },
  /** tension swell into a hit (end it exactly on the hit) */
  riser({ from, to, gain = 0.35 }) {
    const bp = biquad("bp", 500, 0.9);
    for (let i = S(from); i < S(to) && i < N; i++) { const k = (i - S(from)) / (S(to) - S(from)); if ((i & 63) === 0) bp.set(300 + 5000 * k * k); const v = bp(nz()) * Math.pow(k, 2.5) * gain; addLR(i, v, v, 0.3); }
  },
  /** wind / desert / mountain ambience */
  wind({ from = 0, to = DUR, gain = 0.3, curve: c }) {
    const bp = [biquad("bp", 400, 2), biquad("bp", 400, 2)];
    for (let i = S(from); i < S(to) && i < N; i++) {
      const t = i / SR; if ((i & 127) === 0) { bp[0].set(300 + 500 * (0.5 + 0.5 * Math.sin(t * 0.7))); bp[1].set(320 + 520 * (0.5 + 0.5 * Math.sin(t * 0.83 + 1))); }
      const g = gain * curve(c, t) * (0.6 + 0.4 * Math.sin(t * 1.3 + Math.sin(t * 0.4) * 3)) * Math.min(1, (t - from) / 0.5) * Math.min(1, (to - t) / 0.5);
      addLR(i, bp[0](nz()) * g * 1.5, bp[1](nz()) * g * 1.5, 0.05);
    }
  },
  /** sea / river: slow swells of filtered noise (period in s) */
  waves({ from = 0, to = DUR, gain = 0.35, period = 4.5 }) {
    const lp = [biquad("lp", 600, 0.7), biquad("lp", 600, 0.7)];
    for (let i = S(from); i < S(to) && i < N; i++) {
      const t = i / SR, sw = Math.pow(0.5 + 0.5 * Math.sin(TAU * t / period), 2);
      if ((i & 127) === 0) { lp[0].set(300 + 2500 * sw); lp[1].set(300 + 2400 * Math.pow(0.5 + 0.5 * Math.sin(TAU * t / period + 0.6), 2)); }
      const g = gain * (0.25 + 0.75 * sw) * Math.min(1, (t - from) / 0.5) * Math.min(1, (to - t) / 0.5);
      addLR(i, lp[0](nz()) * g, lp[1](nz()) * g, 0.05);
    }
  },
  /** thunder: crack then long rumble */
  thunder({ at, gain = 0.9 }) {
    const i0 = S(at), hp = biquad("hp", 1200, 0.7), lp = biquad("lp", 160, 0.7);
    for (let j = 0; j < S(4) && i0 + j < N; j++) {
      const tt = j / SR, rumble = lp(nz()) * env(tt - 0.08, 0.3, 1.2) * (1 + 0.6 * Math.sin(tt * 11) * Math.sin(tt * 3.3)) * 3;
      add(i0 + j, (hp(nz()) * env(tt, 0.002, 0.08) * 0.8 + rumble) * gain, 0, 0.4);
    }
  },
  /** wing flaps: count flaps every "rate" seconds */
  flap({ at, count = 3, rate = 0.32, gain = 0.5, pan = 0 }) {
    for (let k = 0; k < count; k++) {
      const i0 = S(at + k * rate), bp = biquad("bp", 500, 0.8);
      for (let j = 0; j < S(0.22); j++) { const tt = j / SR; add(i0 + j, bp(nz()) * env(tt, 0.03, 0.06) * 2 * gain, pan, 0.1); }
    }
  },
  /** heartbeat (lub-dub) for fear / suspense */
  heartbeat({ from, to, bpm = 70, gain = 0.8 }) {
    for (let t = from; t < to; t += 60 / bpm) { sfx.thud({ at: t, gain }); sfx.thud({ at: t + 0.16, gain: gain * 0.7 }); }
  },
  /** metal: sword clash, arrow hitting armour, chakra */
  clang({ at, gain = 0.5, pan = 0 }) {
    const i0 = S(at), parts = [[1, 1, 0.5], [2.41, 0.7, 0.3], [3.9, 0.5, 0.2], [5.3, 0.4, 0.15], [7.1, 0.3, 0.1]], hp = biquad("hp", 3000, 0.7);
    for (let j = 0; j < S(1.6); j++) { const tt = j / SR; let v = 0; for (const [m, a, d] of parts) v += Math.sin(TAU * 620 * m * tt) * a * Math.exp(-tt / d); add(i0 + j, (v * 0.5 + hp(nz()) * env(tt, 0.001, 0.02)) * gain, pan, 0.35); }
  },
  /** arrow release / twang */
  arrow({ at, gain = 0.5, pan = 0 }) {
    const i0 = S(at);
    for (let j = 0; j < S(0.5); j++) { const tt = j / SR; add(i0 + j, Math.sin(TAU * (180 - 60 * tt) * tt) * env(tt, 0.001, 0.12) * gain, pan, 0.2); }
    sfx.whoosh({ at: at + 0.03, len: 0.45, gain: gain * 0.7, panFrom: pan, panTo: pan + 0.8 });
  },
  /** magic / divine appearance / blessing sparkle */
  shimmer({ at, len = 1.5, gain = 0.25 }) {
    for (let k = 0; k < len * 22; k++) {
      const t = at + rnd() * len, f = 2000 + rnd() * 4000, i0 = S(t), pan = nz() * 0.8;
      for (let j = 0; j < S(0.5); j++) { const tt = j / SR; add(i0 + j, Math.sin(TAU * f * tt) * env(tt, 0.002, 0.12) * gain * 0.3, pan, 0.6); }
    }
  },
  /** water splash / dive */
  splash({ at, gain = 0.6, pan = 0 }) {
    const i0 = S(at), bp = biquad("bp", 1200, 0.6);
    for (let j = 0; j < S(1.2); j++) { const tt = j / SR; if ((j & 63) === 0) bp.set(600 + 2600 * Math.exp(-tt / 0.3)); add(i0 + j, bp(nz()) * env(tt, 0.005, 0.25) * 2 * gain, pan, 0.3); }
  },
  /** crowd murmur / army (density 0..1) */
  crowd({ from = 0, to = DUR, gain = 0.25 }) {
    const bp = [biquad("bp", 500, 1.2), biquad("bp", 520, 1.2)];
    for (let i = S(from); i < S(to) && i < N; i++) {
      const t = i / SR; if ((i & 255) === 0) { bp[0].set(380 + 300 * rnd()); bp[1].set(380 + 300 * rnd()); }
      const g = gain * (0.6 + 0.4 * Math.sin(t * 2.7) * Math.sin(t * 1.1)) * Math.min(1, (t - from) / 0.5) * Math.min(1, (to - t) / 0.5);
      addLR(i, bp[0](nz()) * g * 2, bp[1](nz()) * g * 2, 0.1);
    }
  },
};

/* ---------------- render the cue sheet ---------------- */
BUS = M; for (const c of cues.music || []) { if (!music[c.type]) throw new Error("unknown music cue " + c.type); music[c.type](resolve(c)); }
BUS = X; for (const c of cues.sfx || []) { const fn = sfx[c.type] || music[c.type]; if (!fn) throw new Error("unknown sfx cue " + c.type); fn(resolve(c)); }

/* ---------------- reverb (Schroeder) -> sfx bus ---------------- */
function comb(buf, d, fb, damp) { const out = new Float32Array(N), line = new Float32Array(d); let p = 0, lp = 0; for (let i = 0; i < N; i++) { const y = line[p]; lp = y * (1 - damp) + lp * damp; line[p] = buf[i] + lp * fb; p = (p + 1) % d; out[i] = y; } return out; }
function allpass(buf, d, g) { const out = new Float32Array(N), line = new Float32Array(d); let p = 0; for (let i = 0; i < N; i++) { const b = line[p], y = -buf[i] * g + b; line[p] = buf[i] + b * g; p = (p + 1) % d; out[i] = y; } return out; }
[0, 1].forEach((ch) => {
  const off = ch * 23, sum = new Float32Array(N);
  for (const d of [1557, 1617, 1491, 1422, 1277, 1356]) { const c = comb(busRev, Math.round((d + off) * SR / 44100), 0.83, 0.3); for (let i = 0; i < N; i++) sum[i] += c[i]; }
  const o = allpass(allpass(sum, 556 + off, 0.5), 441 + off, 0.5);
  for (let i = 0; i < N; i++) X[ch][i] += o[i] * 0.06;
});

/* ---------------- ducking under the voiceover ---------------- */
// Music drops by `duck` (0..1, default 0.5 = -6 dB) while the voice speaks; SFX by duckSfx (default 0.2).
function readWav(p) {
  const b = fs.readFileSync(p); let o = 12, fmt, data;
  while (o < b.length - 8) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) }; if (id === "data") data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz & 1); }
  if (!fmt || fmt.bits !== 16) throw new Error("voice wav must be 16-bit PCM (transcribe.mjs writes public/voiceover.wav)");
  const n = data.length / 2 / fmt.ch, mono = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let c = 0; c < fmt.ch; c++) s += data.readInt16LE((i * fmt.ch + c) * 2); mono[i] = s / fmt.ch / 32768; }
  return { sr: fmt.sr, x: mono };
}
const voicePath = cues.voice === null ? null : fs.existsSync("public/voice.wav") ? "public/voice.wav" : null;
const duckM = new Float32Array(N).fill(1), duckX = new Float32Array(N).fill(1);
if (voicePath) {
  const { sr, x } = readWav(voicePath), depth = cues.duck ?? 0.5, depthX = cues.duckSfx ?? 0.2;
  // voice activity per 20 ms frame, band-limited to speech, adaptive threshold (works when the voiceover has its own
  // music bed, where a fixed level gate would stay open all the time)
  const hop = Math.round(sr / 50), nf = Math.floor(x.length / hop), db = new Float64Array(nf);
  let hp = 0, prev = 0, lp = 0;
  for (let f = 0; f < nf; f++) {
    let e = 0;
    for (let i = 0; i < hop; i++) { const v = x[f * hop + i]; hp = 0.89 * (hp + v - prev); prev = v; lp += 0.6 * (hp - lp); e += lp * lp; }
    db[f] = 10 * Math.log10(e / hop + 1e-10);
  }
  const sorted = [...db].sort((a, b) => a - b), pct = (q) => sorted[Math.floor(q * (nf - 1))];
  const thr = pct(0.15) + 0.4 * (pct(0.95) - pct(0.15));
  const act = (f) => f >= 0 && f < nf && (db[f] + db[Math.max(0, f - 1)] + db[Math.min(nf - 1, f + 1)]) / 3 > thr;
  let g = 0;
  for (let i = 0; i < N; i++) {
    const target = act(Math.floor(i / SR * 50)) ? 1 : 0;
    g += (target - g) * (target > g ? 0.002 : 0.00008);                    // fast attack (~10 ms), slow release (~0.25 s)
    duckM[i] = 1 - depth * g; duckX[i] = 1 - depthX * g;
  }
  console.log(`ducking under ${voicePath} (voice active ${((nf ? [...Array(nf).keys()].filter(act).length / nf : 0) * 100).toFixed(0)}% of the time)`);
}

/* ---------------- master ---------------- */
const mg = cues.master ?? 0.5, mus = cues.musicGain ?? 1, fx = cues.sfxGain ?? 1;
const out = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, g = Math.min(1, t / 0.3) * Math.min(1, (DUR - t) / 0.5);
  for (let ch = 0; ch < 2; ch++) { out[ch][i] = Math.tanh((M[ch][i] * mus * duckM[i] + X[ch][i] * fx * duckX[i]) * g * mg); peak = Math.max(peak, Math.abs(out[ch][i])); }
}
// with a voice, leave headroom for it; without, -1 dBFS
const norm = (voicePath ? 0.45 : 0.89) / (peak || 1);
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(out[0][i] * norm * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(out[1][i] * norm * 32767), 46 + i * 4); }
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/score.wav", buf);
console.log(`public/score.wav  ${DUR}s  ${(cues.music || []).length} music + ${(cues.sfx || []).length} sfx cues`);
