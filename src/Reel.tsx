import { loadFont } from "@remotion/google-fonts/Nunito";
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "./kit/fx";
import env from "./generated/env.json";
import { CHIP, SCENES } from "./generated/current";
import timing from "./generated/timing.json";
import type { Ctx } from "./scene";

/* The reel engine (do not edit per story): 720x1280 2.5D world scaled to 1080x1920, scene switching on the
   script's blank-line blocks, karaoke captions, title + source chip, transitions, voice + score.
   A story's scenes live in src/reels/<naam>.tsx (picked by `npm run preview|reel -- <naam>`). */
type Timing = { duration: number; title: string; shots: { at: number }[]; subtitle: { end: number; w: [string, number][] }[] };
const T = timing as unknown as Timing;
const ENV = env as number[];
const S = 1.5; // 720 -> 1080
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const { fontFamily: NUNITO } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });
const ALL_WORDS = T.subtitle.flatMap((g) => g.w.map(([text, at]) => ({ text, at })));

/** Caption line near the top: 2-6 words, the spoken word turns gold, pops and glows. */
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const line = T.subtitle.find((l) => t >= l.w[0][1] - 0.05 && t < l.end + 0.15);
  if (!line) return null;
  const pop = interpolate(t - line.w[0][1], [0, 0.08, 0.16], [0.82, 1.06, 1], cl);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 258, textAlign: "center", fontFamily: NUNITO, fontWeight: 900, fontSize: 60, lineHeight: 1.2, letterSpacing: -0.5, transform: `scale(${pop})` }}>
      {line.w.map(([w, at], i) => {
        const active = t >= at && (i === line.w.length - 1 || t < line.w[i + 1][1]);
        const wp = active ? interpolate(t - at, [0, 0.07, 0.14], [1, 1.12, 1.04], cl) : 1;
        return (
          <span key={i} style={{
            display: "inline-block", margin: "0 9px", transform: `scale(${wp}) translateY(${active ? -2 : 0}px)`,
            color: active ? "#f7c62f" : "#ffffff", WebkitTextStroke: "11px #141014", paintOrder: "stroke fill",
            textShadow: active ? "0 4px 0 #141014, 0 0 26px rgba(255,190,60,0.6)" : "0 4px 0 #141014, 0 6px 14px rgba(0,0,0,0.35)",
          }}>{w}</span>
        );
      })}
    </div>
  );
};

/** Small title (script.txt first line "# ...") and the source chip (CHIP), both gold-on-ink. */
const TitleAndChip: React.FC<{ t: number }> = ({ t }) => {
  const chipK = interpolate(t, [1.0, 1.3, 4.4, 4.7], [0, 1, 1, 0], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  return (
    <>
      {T.title && <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", fontFamily: NUNITO, fontWeight: 900, fontSize: 30, letterSpacing: 5, color: "#f7c62f", WebkitTextStroke: "7px #141014", paintOrder: "stroke fill" }}>{T.title}</div>}
      {CHIP && chipK > 0.01 && (
        <div style={{ position: "absolute", top: 420, left: 540, translate: "-50% 0", scale: String(chipK), fontFamily: NUNITO, fontWeight: 900, fontSize: 28, letterSpacing: 3, color: "#fff4d8", background: "rgba(20,12,24,0.78)", border: "3px solid #f7c62f", borderRadius: 40, padding: "6px 28px", whiteSpace: "nowrap", boxShadow: "0 0 24px rgba(247,198,47,0.35)" }}>{CHIP}</div>
      )}
    </>
  );
};

const SceneView: React.FC<{ idx: number; sceneIdx: number; at: number; dur: number }> = ({ idx, sceneIdx, at, dur }) => {
  const frame = useCurrentFrame(); // local to this scene (inside a Sequence)
  const { fps } = useVideoConfig();
  const lt = frame / fps;
  const t = at + lt;
  const scene = SCENES[sceneIdx];
  const words = ALL_WORDS.filter((w) => w.at >= at - 0.01 && w.at < at + dur).map((w) => ({ text: w.text, at: w.at - at }));
  const ctx: Ctx = {
    t, lt, dur, talk: Math.min(1, (ENV[Math.round(t * fps)] ?? 0) * 1.1), words,
    wordAt: (q) => words.find((w) => w.text.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q.toLowerCase().replace(/[^a-z0-9]/g, "")))?.at,
  };
  const kind = scene.in ?? "cut";
  const flash = kind === "flash" ? interpolate(lt, [0, 0.03, 0.12], [0.9, 0.9, 0], cl) : 0;
  const white = kind === "white" ? interpolate(lt, [0, 0.45], [1, 0], { ...cl, easing: Easing.out(Easing.quad) }) : 0;
  const black = kind === "black" || idx === 0 ? interpolate(lt, [0, idx === 0 ? 0.35 : 0.4], [1, 0], cl) : 0;
  const whip = kind === "whip" ? interpolate(lt, [0, 0.2], [1, 0], { ...cl, easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: 720, height: 1280, transform: `scale(${S}) translateX(${whip * -160}px)`, transformOrigin: "0 0", overflow: "hidden", filter: whip > 0.05 ? `blur(${whip * 14}px)` : undefined }}>
        {scene.draw(ctx)}
        <Vignette />
        <Grain frame={Math.round(t * fps)} />
      </div>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff6e0", opacity: flash }} />}
      {white > 0 && <AbsoluteFill style={{ background: "#fffaf0", opacity: white }} />}
      {black > 0 && <AbsoluteFill style={{ background: "#0b0410", opacity: black }} />}
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const shots = T.shots.length ? T.shots : [{ at: 0 }];
  const n = shots.length, m = SCENES.length;
  const end = T.duration;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shots.map((s, idx) => {
        const from = Math.round(s.at * fps);
        const to = idx + 1 < n ? Math.round(shots[idx + 1].at * fps) : durationInFrames;
        if (to <= from) return null;
        // Scene k draws block k. If the reel file has fewer scenes than blocks, spread them evenly.
        const sceneIdx = n <= m ? idx : n === 1 ? 0 : Math.round((idx * (m - 1)) / (n - 1));
        return (
          <Sequence key={idx} from={from} durationInFrames={to - from} layout="none">
            <SceneView idx={idx} sceneIdx={sceneIdx} at={s.at} dur={(to - from) / fps} />
          </Sequence>
        );
      })}
      <TitleAndChip t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: "#0b0410", opacity: interpolate(t, [end - 0.45, end], [0, 1], cl), pointerEvents: "none" }} />
      {/* voice.wav is mono; Remotion plays it on both channels (+3 dB), so 0.75 keeps the mix near -14 LUFS */}
      <Audio src={staticFile("voice.wav")} volume={(f) => 0.75 * (1 - interpolate(f / fps, [end - 0.3, end], [0, 1], cl))} />
      <Audio src={staticFile("score.wav")} />
    </AbsoluteFill>
  );
};
