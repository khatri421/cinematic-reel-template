// npm run ref -- <naam>
// Turns reference material into things Claude can study to write a STYLE CARD. Reference = any of these, any name:
//   - a screen recording (.mp4/.mov/.webm/.mkv) and/or screenshots (.jpg/.png/.webp)
//   placed directly in reels/<naam>/ (easiest on a phone) or in reels/<naam>/ref/.
//   Our own outputs (preview.mp4, reel.mp4, check.jpg) are ignored.
// Writes reels/<naam>/ref/analysis/:
//   sheet_01.jpg ...  contact sheets, 4 frames per second, 20 tiles = 5 s each (pacing, captions, camera)
//   key_000.jpg ...   one 540 px frame per second (lighting, colours, drawing style)
//   cuts.txt          every scene cut (time) + average shot length
//   palette.txt       the 6 main colours of each key frame
//   summary.txt       duration, cuts per 10 s, caption position guess
// Only for studying STYLE. Never trace, copy or re-use the reference's characters, art, audio, logo or script lines.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const name = (process.argv[2] ?? "").trim();
const fail = (m) => { console.error(`\nERROR: ${m}`); process.exit(1); };
if (!name) fail("Reel ka naam do, jaise: npm run ref -- karna-kavach");
const reelDir = path.join("reels", name);
if (!existsSync(reelDir)) fail(`reels/${name}/ folder nahi mila.`);
const dir = path.join(reelDir, "ref");
const OURS = new Set(["preview.mp4", "reel.mp4", "check.jpg", "analysis", "ref"]);
const list = (d) => (existsSync(d) ? readdirSync(d).filter((f) => !OURS.has(f)).map((f) => path.join(d, f)) : []);
const files = [...list(dir), ...list(reelDir)];
const out = path.join(dir, "analysis");
mkdirSync(out, { recursive: true });
const videos = files.filter((f) => /\.(mp4|mov|webm|mkv|m4v)$/i.test(f));
const images = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (!videos.length && !images.length) fail(`reels/${name}/ me koi reference video ya screenshot nahi mila. Screen recording / screenshots isi folder me upload karo.`);
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: ["ignore", "ignore", "inherit"] });
const summary = [];

/** 6 dominant colours of an image: quantize to a 64-colour palette, count, merge. */
function palette(img) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", img, "-vf", "scale=48:85", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 24 });
  const bins = new Map();
  for (let i = 0; i < raw.length; i += 3) {
    const k = ((raw[i] >> 5) << 6) | ((raw[i + 1] >> 5) << 3) | (raw[i + 2] >> 5);
    const b = bins.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    b.n++; b.r += raw[i]; b.g += raw[i + 1]; b.b += raw[i + 2]; bins.set(k, b);
  }
  return [...bins.values()].sort((a, b) => b.n - a.n).slice(0, 6)
    .map((b) => "#" + [b.r / b.n, b.g / b.n, b.b / b.n].map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""));
}

for (const [vi, v] of videos.entries()) {
  const src = v, tag = videos.length > 1 ? `v${vi + 1}_` : "";
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).toString().trim());
  ff("-i", src, "-vf", "fps=4,scale=200:-1,tile=10x2:padding=2", "-q:v", "4", path.join(out, `${tag}sheet_%02d.jpg`));
  const keys = [];
  for (let s = 0; s < Math.floor(dur); s++) {
    const k = path.join(out, `${tag}key_${String(s).padStart(3, "0")}.jpg`);
    ff("-ss", String(s + 0.5), "-i", src, "-frames:v", "1", "-vf", "scale=540:-1", "-q:v", "3", k);
    keys.push(k);
  }
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", src, "-vf", "select='gt(scene,0.28)',showinfo", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
  const cuts = [...log.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
  const shots = [0, ...cuts, dur].map((t, i, a) => (i ? t - a[i - 1] : 0)).slice(1);
  writeFileSync(path.join(out, `${tag}cuts.txt`), cuts.map((t) => `cut at ${t.toFixed(2)} s`).join("\n") + `\n\n${cuts.length} cuts in ${dur.toFixed(1)} s, average shot ${(dur / (cuts.length + 1)).toFixed(2)} s (shortest ${Math.min(...shots).toFixed(2)} s, longest ${Math.max(...shots).toFixed(2)} s)\n`);
  writeFileSync(path.join(out, `${tag}palette.txt`), keys.map((k) => `${path.basename(k)}  ${palette(k).join(" ")}`).join("\n") + "\n");
  summary.push(`${path.basename(v)}: ${dur.toFixed(1)} s, ${cuts.length} cuts (${((cuts.length / dur) * 10).toFixed(1)} per 10 s), ${keys.length} key frames, ${Math.ceil(dur / 5)} contact sheets`);
}
if (images.length) {
  const pal = images.map((f) => `${path.basename(f)}  ${palette(f).join(" ")}`);
  writeFileSync(path.join(out, "screenshots_palette.txt"), pal.join("\n") + "\n");
  summary.push(`${images.length} screenshots: ${images.map((f) => path.basename(f)).join(", ")}`);
}
writeFileSync(path.join(out, "summary.txt"), summary.join("\n") + "\n");
console.log(`\nDONE: reels/${name}/ref/analysis/\n` + summary.join("\n"));
console.log("Ab Claude in files ko dekh kar STYLE CARD likhega (reels/<naam>/style.txt).");
