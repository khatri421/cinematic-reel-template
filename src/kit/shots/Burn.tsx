import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Hanuman } from "../Hanuman";
import { Embers, GodRays, H, INK, LensFlare, SpeedLines, W } from "../fx";
import { BurningSkyline, Fire, Flame, lankaSky, Palace } from "../lankaWorld";
import { Sun, ToonCloud } from "../world";

const ease = Easing.bezier(0.45, 0, 0.55, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Cam = { z: number; fx: number; fy: number; tx: number; ty: number };
const lerpCam = (f: number, a: number, b: number, c0: Cam, c1: Cam): Cam => {
  const k = interpolate(f, [a, b], [0, 1], { ...cl, easing: ease });
  const m = (x: number, y: number) => x + (y - x) * k;
  return { z: m(c0.z, c1.z), fx: m(c0.fx, c1.fx), fy: m(c0.fy, c1.fy), tx: m(c0.tx, c1.tx), ty: m(c0.ty, c1.ty) };
};

/* C 0-86   wide over the rooftops: Hanuman leaps palace to palace, each roof catches   "Ek chhalaang... / aur ghar ghar / mein aag!"
   D 86-148 tilt up, extreme wide: the whole skyline burns, smash flash on "jal"         "Sone ki Lanka / jal uthi!"  */
const camera = (f: number): Cam => {
  if (f < 86) return lerpCam(f, 0, 86, { z: 1.12, fx: 360, fy: 860, tx: 360, ty: 720 }, { z: 1.24, fx: 380, fy: 860, tx: 360, ty: 720 });
  return lerpCam(f, 86, 148, { z: 1.0, fx: 360, fy: 700, tx: 360, ty: 820 }, { z: 1.14, fx: 380, fy: 640, tx: 360, ty: 760 });
};

type Hop = { f0: number; f1: number; a: [number, number, number]; b: [number, number, number]; h: number };
const HOPS: Hop[] = [
  { f0: 0, f1: 50, a: [90, 1380, 420], b: [577, 883, 120], h: 420 },
  { f0: 60, f1: 84, a: [577, 883, 120], b: [342, 837, 86], h: 170 },
];
/** Hanuman feet position + width in the mid layer (d=0.55). */
const hanumanAt = (f: number) => {
  for (let i = 0; i < HOPS.length; i++) {
    const hp = HOPS[i];
    if (f < hp.f0) return { x: HOPS[i - 1].b[0], y: HOPS[i - 1].b[1], w: HOPS[i - 1].b[2], air: false, dir: i === 1 ? 1 : -1 };
    if (f <= hp.f1) {
      const k = (f - hp.f0) / (hp.f1 - hp.f0);
      const ke = Easing.inOut(Easing.sin)(k);
      return {
        x: hp.a[0] + (hp.b[0] - hp.a[0]) * ke,
        y: hp.a[1] + (hp.b[1] - hp.a[1]) * k - 4 * hp.h * k * (1 - k),
        w: hp.a[2] + (hp.b[2] - hp.a[2]) * Math.pow(k, 0.7),
        air: k < 0.96, dir: hp.b[0] >= hp.a[0] ? 1 : -1,
      };
    }
  }
  const last = HOPS[HOPS.length - 1].b;
  return { x: last[0], y: last[1], w: last[2], air: false, dir: -1 };
};

const PALACES = [
  { x: 120, y: 1090, s: 1.0, ig: 18, seed: "b1" },
  { x: 560, y: 1010, s: 0.85, ig: 48, seed: "b2" },
  { x: 330, y: 930, s: 0.62, ig: 80, seed: "b3", flip: true },
  { x: 650, y: 880, s: 0.5, ig: 92, seed: "b4" },
  { x: 30, y: 890, s: 0.55, ig: 100, seed: "b5", flip: true },
];

export const ShotBurn: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = f / fps + 5.4;
  const shotD = f >= 86;
  const flashF = 117; // "jal"
  const shake = f >= flashF ? Math.sin(f * 2.1) * interpolate(f, [flashF, flashF + 4, 148], [0, 7, 3], cl) : 0;
  const cam = camera(f);
  const layer = (d: number, blur = 0): React.CSSProperties => {
    const s = 1 + (cam.z - 1) * d;
    const tx = cam.fx + (cam.tx - cam.fx) * d, ty = cam.fy + (cam.ty - cam.fy) * d;
    return {
      position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
      transform: `translate(${tx - cam.fx * s + shake}px, ${ty - cam.fy * s + shake * 0.6}px) scale(${s})`,
      filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
    };
  };
  const toScreen = (x: number, y: number, d: number) => {
    const s = 1 + (cam.z - 1) * d;
    return [cam.fx + (cam.tx - cam.fx) * d + (x - cam.fx) * s, cam.fy + (cam.ty - cam.fy) * d + (y - cam.fy) * s];
  };
  const burnCity = interpolate(f, [86, 140], [0.05, 1], cl);
  const skyBurn = interpolate(f, [0, 148], [0.25, 1], cl);
  const rack = shotD ? interpolate(f, [86, 93], [7, 0], cl) : 0;
  const hn = hanumanAt(f);
  const hh = hn.w / (360 / 310);
  const flash = interpolate(f, [flashF - 1, flashF + 1, flashF + 4], [0, 0.85, 0], cl);
  const [mx, my] = toScreen(240, 470, 0.1);

  // tiny Hanuman hopping across the skyline in D (skyline layer coords)
  const sk = interpolate(f, [92, 122], [0, 1], cl);
  const skX = 253 + (380 - 253) * Easing.inOut(Easing.sin)(sk);
  const skY = 645 + (536 - 645) * sk - 4 * 60 * sk * (1 - sk);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={lankaSky(skyBurn)} />
      <div style={layer(0.1, 1.5)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Sun cx={240} cy={470} r={200} id="bmoon" glow={1 - skyBurn * 0.3} />
          <ToonCloud x={540 + t * 3} y={360} s={1.1} fill="#b8587e" rim="#f0a0b8" outline="#6a2a62" shade="#7a2a62" />
        </svg>
      </div>
      <GodRays cx={mx} cy={my} t={t} opacity={0.18} color="#ffe0c8" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 30%, rgba(255,80,30,0.35) 75%)", opacity: skyBurn, mixBlendMode: "screen" }} />

      {/* skyline */}
      <div style={layer(0.3, shotD ? rack * 0.5 : 2.2)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <rect x={-400} y={790} width={1600} height={700} fill="#30102f" />
          <g transform="translate(380,800) scale(0.85)"><BurningSkyline burn={burnCity} t={t} glint={0.6} /></g>
          {shotD && <ellipse cx={skX} cy={skY + 1} rx={8} ry={2} fill="#1a0820" opacity={0.6} />}
        </svg>
        {shotD && (
          <div style={{ position: "absolute", left: skX - 30, top: skY - 298 * (60 / 360), width: 60, height: 60 / (360 / 310) }}>
            <Hanuman id="hSky" t={t} pose={sk > 0 && sk < 1 ? "leap" : "stand"} fire={1} arm={sk >= 1 ? 1 : 0} />
          </div>
        )}
      </div>

      {/* mid palaces + Hanuman (C) */}
      <div style={layer(0.55, shotD ? 1.5 : 0)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          {[...PALACES].sort((a, b) => a.y - b.y).map((p) => (
            <Palace key={p.seed} x={p.x} y={p.y} s={p.s} t={t} seed={p.seed} flip={p.flip}
              burn={interpolate(f, [p.ig, p.ig + 45], [0, 1], cl)} />
          ))}
          {/* fiery trail from the tail */}
          {!shotD && Array.from({ length: 9 }).map((_, i) => {
            const pf = f - (i + 1) * 2;
            if (pf < 0) return null;
            const q = hanumanAt(pf);
            if (!q.air) return null;
            return <Flame key={i} x={q.x - q.dir * q.w * 0.25} y={q.y - q.w * 0.62} s={(q.w / 360) * 1.4 * (1 - i / 10)} t={t + i} seed={i * 2} outline={false} />;
          })}
        </svg>
        {!shotD && (
          <div style={{ position: "absolute", left: hn.x - hn.w / 2, top: hn.y - 298 * (hn.w / 360), width: hn.w, height: hh, transform: `scaleX(${hn.dir})` }}>
            <Hanuman id="hBurn" t={t} pose={hn.air ? "leap" : "stand"} fire={1} smile={0.8} />
          </div>
        )}
      </div>

      {/* near rooftops framing the bottom */}
      <div style={layer(1, 3)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <path d="M-60,1300 L-60,1150 L160,1130 L200,1300Z" fill="#2a0c2a" stroke={INK} strokeWidth={3} />
          <path d="M540,1300 L560,1170 L820,1150 L820,1300Z" fill="#2a0c2a" stroke={INK} strokeWidth={3} />
          <Fire x={680} y={1162} w={180} s={interpolate(f, [70, 110], [0, 1.1], cl)} t={t} seed="nr" n={5} />
        </svg>
      </div>

      <SpeedLines t={t} cx={W / 2} cy={H / 2} opacity={!shotD ? interpolate(f, [0, 8, 30, 46], [0.5, 0.35, 0.2, 0], cl) : 0} color="#ffd29a" />
      <Embers t={t} n={shotD ? 60 : 36} color="#ffb24a" glow size={1.4} speed={1.6} seed="be" />
      <LensFlare x={mx} y={my} intensity={0.4} tint="255,215,190" />
      {f >= flashF && <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(170,30,10,0.55) 100%)" }} />}
      <AbsoluteFill style={{ background: "#fff4d8", opacity: flash }} />
    </AbsoluteFill>
  );
};
