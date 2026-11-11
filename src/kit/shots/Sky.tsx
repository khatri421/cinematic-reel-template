import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";
import { Bird, JATAYU, SAMPATI } from "../Bird";
import { GodRays, H, LensFlare, SpeedLines, W } from "../fx";
import { SkyCloud } from "../world";

const { fontFamily } = loadFont("normal", { weights: ["900"] });
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const NameTag: React.FC<{ name: string; sub: string; x: number; y: number; k: number; color: string }> = ({ name, sub, x, y, k, color }) => (
  <div style={{
    position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${0.6 + 0.4 * k})`, opacity: k,
    fontFamily, textAlign: "center", pointerEvents: "none",
  }}>
    <div style={{ width: 2, height: 26, background: "rgba(42,27,43,0.6)", margin: "0 auto" }} />
    <div style={{
      background: "#fff6e4", border: "2.5px solid #2a1b2b", borderRadius: 10, padding: "4px 12px 3px",
      boxShadow: `0 4px 0 #2a1b2b, inset 0 -4px 0 ${color}`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#2a1b2b", letterSpacing: 2 }}>{name}</div>
      <div style={{ fontSize: 13, fontWeight: 900, color, marginTop: -2 }}>{sub}</div>
    </div>
  </div>
);

/* F 0-136   flashback flight: through the cloud sea, name tags   "Ek baar, jawani ke josh mein, dono bhai, Sampati aur Jatayu,"
   G 136-177 the race: camera tilts up, clouds rush down, speed lines   "hod lagakar suraj ki or ude." */
export const ShotSky: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = f / fps;
  const race = interpolate(f, [130, 177], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const camZ = t * 260 + race * 500;
  const rise = race * 900; // clouds fall away as camera climbs
  const fFocal = 820;
  const horizonY = 470 + rise * 0.6;
  const push = interpolate(f, [76, 136], [1, 1.06], { ...cl, easing: Easing.inOut(Easing.quad) });
  const clouds = Array.from({ length: 60 }).map((_, i) => {
    const x = (random("cx" + i) - 0.5) * 1900;
    const y = 110 + random("cy" + i) * 190;
    const z0 = 300 + random("cz" + i) * 2600;
    const span = 2600;
    const z = ((z0 - camZ - 300) % span + span) % span + 300 - 120;
    return { i, x, y, z };
  }).sort((a, b) => b.z - a.z);
  const fadeIn = interpolate(f, [0, 12], [1, 0], cl);
  const flapRate = 1.15 + race * 1.2;
  const flapS = Math.sin(t * Math.PI * 2 * flapRate);
  const flapJ = Math.sin(t * Math.PI * 2 * flapRate + 1.8);
  const tagS = interpolate(f, [88, 96, 160, 170], [0, 1, 1, 0], cl);
  const tagJ = interpolate(f, [118, 126, 160, 170], [0, 1, 1, 0], cl);
  const sX = 300 + Math.sin(t * 0.7) * 26 - race * 40;
  const sY = 300 + Math.sin(t * 2.3) * 16 + interpolate(f, [0, 136], [-60, 0], cl) - race * 260;
  const jX = 200 + Math.sin(t * 0.9) * 30 - t * 4 + race * 120;
  const jY = 650 + Math.sin(t * 2.3 + 1) * 14 + interpolate(f, [0, 136], [-140, 0], cl) - race * 520;
  const whip = interpolate(f, [168, 177], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const warm = race;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push}) translateY(${-whip * 160}px)`, transformOrigin: "50% 40%", filter: whip > 0.05 ? `blur(${whip * 10}px)` : undefined }}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg,#7fade6 0%,#8db7eb ${12 - warm * 8}%,#b4daf4 ${30 - warm * 10}%,#e9eff9 ${36 - warm * 10}%,#fcedd2 ${42 - warm * 10}%,#f7e3c2 100%)` }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,110,0.0), rgba(255,150,90,0.55))", opacity: warm }} />
        <GodRays cx={640} cy={-60} t={t} opacity={0.22} color="#ffffff" />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <g transform={`translate(${170 - t * 6},${230 + rise * 0.5}) scale(0.55)`}><SkyCloud seed={99} /></g>
          <g transform={`translate(${600 - t * 4},${120 + rise * 0.4}) scale(0.35)`} opacity={0.8}><SkyCloud seed={98} /></g>
          {clouds.map(({ i, x, y, z }) => {
            const s = fFocal / z;
            const sx = W / 2 + x * s, sy = horizonY + y * s + rise * (s * 0.6);
            if (sx < -500 || sx > W + 500 || sy > H + 400) return null;
            const near = interpolate(z, [180, 420], [6, 0], cl);
            const appear = interpolate(z, [2500, 2780], [1, 0], cl);
            return (
              <g key={i} opacity={appear} style={{ filter: near > 0.2 ? `blur(${near}px)` : undefined }}>
                <g transform={`translate(${sx},${sy}) scale(${s})`}><SkyCloud seed={i} /></g>
              </g>
            );
          })}
          <rect x={0} y={horizonY - 40} width={W} height={120} fill="#fcf2de" opacity={0.55} style={{ filter: "blur(18px)" }} />
          {/* soft bird shadows cast on the cloud deck */}
          <ellipse cx={sX + 150} cy={sY + 360} rx={110} ry={14} fill="#6f5f99" opacity={0.18 * (1 - race)} style={{ filter: "blur(8px)" }} />
          <ellipse cx={jX + 115} cy={jY + 260} rx={80} ry={10} fill="#6f5f99" opacity={0.2 * (1 - race)} style={{ filter: "blur(8px)" }} />
        </svg>
        <div style={{ position: "absolute", width: 230, height: 200, filter: `blur(${0.8 * (1 - race)}px)`, opacity: 0.94, left: jX, top: jY, transform: `rotate(${-race * 10}deg)` }}>
          <Bird id="jSky" mode="fly" palette={JATAYU} t={t} flap={flapJ} rim="#fff2d0" />
        </div>
        <div style={{ position: "absolute", width: 300, height: 260, left: sX, top: sY, transform: `rotate(${-race * 6}deg)` }}>
          <Bird id="sSky" mode="fly" palette={SAMPATI} t={t} flap={flapS} rim="#ffffff" />
        </div>
        <NameTag name="SAMPATI" sub="bade bhai" x={sX + 150} y={sY + 245} k={tagS} color="#5d6aa8" />
        <NameTag name="JATAYU" sub="chhote bhai" x={jX + 115} y={jY + 190} k={tagJ} color="#b06a24" />
        <SpeedLines t={t} cx={W / 2} cy={300} opacity={race * 0.8} />
      </div>
      <LensFlare x={640} y={-40} intensity={0.45} tint="255,250,235" />
      <AbsoluteFill style={{ background: "#fbf3dc", opacity: fadeIn }} />
      <AbsoluteFill style={{ background: "#ffd7a0", opacity: whip * 0.85 }} />
    </AbsoluteFill>
  );
};
