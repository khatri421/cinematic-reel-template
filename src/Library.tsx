import React from "react";
import { AbsoluteFill } from "remotion";
import { Human, HumanProps, PALETTES } from "./kit/Human";
import { LIGHTS } from "./kit/stage";

/* docs/library.png (npm run library): what the kit can draw. Characters are EXAMPLES of the rig, not a fixed cast:
   every story designs its own characters (see .claude/skills/cinematic-reel/references/characters.md). */
export const LIB_W = 1080, LIB_H = 1920;
const CELLS: (Omit<HumanProps, "id" | "t"> & { label: string })[] = [
  { label: "Hanuman (vanara)", kind: "vanara", build: 1, weapon: "gada", fire: 1, smile: 0.7 },
  { label: "Shri Ram", palette: PALETTES.ram, build: 0.7, weapon: "bow", headwear: "mukut" },
  { label: "Sita Mata", body: "female", palette: PALETTES.sita, headwear: "mukut", pose: "namaste" },
  { label: "Rishi (dhyan)", palette: PALETTES.rishi, build: 0.2, headwear: "jata", beard: true, pose: "sit", eyes: "closed" },
  { label: "Ravan (10 sir)", kind: "rakshasa", build: 0.9, headwear: "mukut", heads: 10, pose: "point", poseK: 1, eyes: "angry" },
  { label: "Raja", palette: PALETTES.king, build: 0.6, headwear: "mukut", moustache: true, pose: "bless", poseK: 1 },
  { label: "Gaon wala · walk", palette: PALETTES.villager, build: 0.4, headwear: "short", pose: "walk" },
  { label: "Hanuman · leap", kind: "vanara", build: 1, pose: "leap", fire: 1, weapon: "gada" },
  { label: "Rishi · namaste", palette: PALETTES.rishi, build: 0.2, headwear: "jata", beard: true, pose: "namaste", eyes: "closed" },
];

export const Library: React.FC = () => {
  const cw = LIB_W / 3, ch = 470;
  return (
    <AbsoluteFill style={{ background: "#efe2cc", fontFamily: "sans-serif" }}>
      <div style={{ position: "absolute", top: 26, width: "100%", textAlign: "center", font: "900 40px sans-serif", color: "#3a1a30" }}>Character rig · examples</div>
      <div style={{ position: "absolute", top: 76, width: "100%", textAlign: "center", font: "600 22px sans-serif", color: "#6a4a50" }}>Har kahani ke characters naye bante hain. Ye sirf namoone hain.</div>
      {CELLS.map(({ label, ...c }, i) => {
        const x = (i % 3) * cw, y = 120 + Math.floor(i / 3) * ch;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: cw, height: ch }}>
            <div style={{ position: "absolute", left: -cw * 0.125, top: 412 - 298 * (cw * 1.25 / 360), width: cw * 1.25, height: cw * 1.25 / (360 / 310) }}>
              <Human id={`lib${i}`} t={0.6} {...c} />
            </div>
            <div style={{ position: "absolute", left: 20, right: 20, top: 412, height: 2, background: "#b8a488" }} />
            <div style={{ position: "absolute", top: 424, width: cw, textAlign: "center", font: "800 22px sans-serif", color: "#4a3040" }}>{label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", font: "900 34px sans-serif", color: "#3a1a30" }}>Light presets (LIGHTS)</div>
      {Object.values(LIGHTS).map((L, i) => (
        <div key={L.name} style={{ position: "absolute", left: 30 + (i % 5) * 208, top: 1620 + Math.floor(i / 5) * 140, width: 190, height: 120, borderRadius: 14, border: "3px solid #2a1b2b", overflow: "hidden", background: `linear-gradient(180deg, ${L.sky.join(", ")})` }}>
          {L.key.kind !== "none" && <div style={{ position: "absolute", left: 120, top: 16, width: 44, height: 44, borderRadius: 50, background: L.key.kind === "moon" ? "#fdf1d6" : "#fff4da", boxShadow: `0 0 30px ${L.rays}` }} />}
          <div style={{ position: "absolute", bottom: 6, left: 8, font: "800 20px sans-serif", color: "#fff", textShadow: "0 2px 3px #000" }}>{L.name}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
