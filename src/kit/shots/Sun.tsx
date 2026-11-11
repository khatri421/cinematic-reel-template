import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Bird, JATAYU, SAMPATI } from "../Bird";
import { Embers, GodRays, H, HeatFilter, LensFlare, Smoke, W } from "../fx";
import { SkyCloud } from "../world";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);
const BR = 360 / 310; // bird aspect (w/h)

const BigSun: React.FC<{ cx: number; cy: number; r: number; t: number; frame: number }> = ({ cx, cy, r, t, frame }) => (
  <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
    <defs>
      <radialGradient id="bsGlow">
        <stop offset="0.45" stopColor="#fff6e0" stopOpacity={0.95} />
        <stop offset="0.62" stopColor="#ffd3a0" stopOpacity={0.5} />
        <stop offset="1" stopColor="#ff8a5a" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="bsDisc" cx="0.5" cy="0.5">
        <stop offset="0" stopColor="#fffef8" /><stop offset="0.85" stopColor="#fff2d6" /><stop offset="1" stopColor="#ffe0b0" />
      </radialGradient>
      <filter id="plasma" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={Math.floor(frame / 3) % 40} />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.75  0 0 0 0 0.45  0 0 0 -1.4 1" />
      </filter>
      <clipPath id="sunClip"><circle cx={cx} cy={cy} r={r} /></clipPath>
    </defs>
    <circle cx={cx} cy={cy} r={r * (1.85 + Math.sin(t * 3) * 0.03)} fill="url(#bsGlow)" />
    <circle cx={cx} cy={cy} r={r} fill="url(#bsDisc)" />
    <g clipPath="url(#sunClip)" opacity={0.22}><rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} filter="url(#plasma)" /></g>
    {[1.06, 1.14].map((k, i) => <circle key={i} cx={cx} cy={cy} r={r * (k + 0.02 * Math.sin(t * 4 + i))} fill="none" stroke="#fff3d6" strokeWidth={3 - i} opacity={0.35 - i * 0.12} />)}
  </svg>
);

/* H 0-73  two silhouettes climb into the sun   "ude. Upar... aur upar." */
export const ShotSunRise: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = 16.708 + f / fps;
  const push = interpolate(f, [0, 73], [1, 1.12], { ...cl, easing: ease });
  const r = 300;
  const k = interpolate(f, [0, 73], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });
  const jLead = interpolate(f, [31, 73], [0, 1], { ...cl, easing: ease });
  const jK = Math.min(1, k + jLead * 0.25), sK = k * 0.92;
  const birdAt = (kk: number, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number) => ({ x: x0 + (x1 - x0) * kk, y: y0 + (y1 - y0) * kk, w: w0 + (w1 - w0) * kk });
  const J = birdAt(jK, 230, 900, 330, 520, 220, 52);
  const S = birdAt(sK, 480, 860, 400, 540, 230, 60);
  const flash = interpolate(f, [0, 8], [0.9, 0], cl);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <HeatFilter frame={f} scale={7} id="heatH" />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "50% 30%" }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#fde4c2 0%,#fbb985 30%,#f58a5c 55%,#e45a3c 80%,#c93d2c 100%)" }} />
        <GodRays cx={360} cy={330} t={t} opacity={0.35} color="#fff4dc" count={14} />
        <BigSun cx={360} cy={330} r={r} t={t} frame={f} />
        <svg width={W} height={H} style={{ position: "absolute", filter: "blur(5px)" }}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${[90, 560, 300][i] + Math.sin(t + i) * 10},${[1050, 1120, 1240][i] + f * (1.5 + i)}) scale(${[0.9, 1.1, 1.4][i]})`} opacity={0.75}>
              <SkyCloud seed={40 + i} warm={1} />
            </g>
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, filter: "url(#heatH)" }}>
          {[{ p: J, pal: JATAYU, id: "jH", ph: 1.8 }, { p: S, pal: SAMPATI, id: "sH", ph: 0 }].map(({ p, pal, id, ph }) => (
            <div key={id} style={{
              position: "absolute", left: p.x - p.w / 2, top: p.y - p.w / BR / 2, width: p.w, height: p.w / BR,
              filter: `brightness(${0.85 - k * 0.5}) saturate(1.2) drop-shadow(0 0 ${6 + k * 6}px rgba(255,190,120,0.9))`,
            }}>
              <Bird id={id} mode="fly" palette={pal} t={t} flap={Math.sin(t * Math.PI * 2 * 1.6 + ph)} rim="#fff0c0" />
            </div>
          ))}
        </div>
        <Embers t={t} n={30} color="#fff0c8" speed={1.6} glow seed="eh" />
      </div>
      <LensFlare x={360} y={330} intensity={0.9} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(120,10,20,0.35), transparent 60%)" }} />
      <AbsoluteFill style={{ background: "#ffe2b0", opacity: flash }} />
    </AbsoluteFill>
  );
};

const FallingFeathers: React.FC<{ t: number; n: number; seed: string; from: number }> = ({ t, n, seed, from }) => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    {Array.from({ length: n }).map((_, i) => {
      const t0 = from + random(seed + i) * 1.2;
      const lt = t - t0;
      if (lt < 0) return null;
      const x = 80 + random(seed + "x" + i) * 560 + Math.sin(lt * 3 + i) * 30;
      const y = 520 + lt * 160;
      const rot = Math.sin(lt * 4 + i) * 50 + 90;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot}) scale(1.2)`}>
          <path d="M0,0 C6,-8 5,-22 0,-30 C-5,-22 -6,-8 0,0Z" fill="#2a1612" stroke="#120807" strokeWidth={1} />
          <path d="M0,-30 l0,-3" stroke="#ff7a2a" strokeWidth={2} />
        </g>
      );
    })}
  </svg>
);

/* I 0-48  close-up: Jatayu's wings scorch from the tips inward   "Jatayu ke pankh jhulasne lage." */
export const ShotScorch: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = 19.75 + f / fps;
  const char = interpolate(f, [3, 44], [0.05, 0.92], { ...cl, easing: Easing.in(Easing.quad) });
  const shakeA = 1 + char * 5;
  const sx = Math.sin(f * 2.1) * shakeA, sy = Math.cos(f * 1.7) * shakeA * 0.7;
  const flap = Math.sin(t * Math.PI * 2 * 0.9) * 0.45 + 0.1;
  const bw = 800, bh = bw / BR;
  const push = interpolate(f, [0, 48], [1, 1.08], cl);
  const flash = interpolate(f, [0, 3], [1, 0], cl);
  const tipY = 300 + bh * (162 / 310) - flap * 160;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <HeatFilter frame={f} scale={3 + char * 6} id="heatI" />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px,${sy}px) scale(${push})`, transformOrigin: "50% 45%" }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 70% at 70% -10%, #fffaf0 0%, #fff0d4 35%, #fbc58c 65%, #f39a62 100%)" }} />
        <GodRays cx={560} cy={-80} t={t} opacity={0.4} color="#fff6e0" count={12} />
        <svg width={W} height={H} style={{ position: "absolute", filter: "blur(7px)" }}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${[110, 620][i] - f * (i ? 2 : 1.5)},${[1050, 980][i]}) scale(${[1.6, 1.2][i]})`} opacity={0.85}><SkyCloud seed={60 + i} warm={1} /></g>
          ))}
        </svg>
        <div style={{ position: "absolute", left: (W - bw) / 2, top: 300, width: bw, height: bh, filter: "url(#heatI)" }}>
          <Bird id="jScorch" mode="fly" palette={JATAYU} t={t} flap={flap} char={char} eyes="closed" rim="#fff3d0" />
        </div>
        <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
          <Smoke x={30} y={tipY + 120} t={t} n={8} scale={1.1 * char + 0.2} color="#3a2622" seed="sl" />
          <Smoke x={690} y={tipY + 120} t={t + 0.5} n={8} scale={1.1 * char + 0.2} color="#3a2622" seed="sr" />
        </svg>
        <FallingFeathers t={t} n={6} seed="ff" from={20.4} />
        <Embers t={t} n={46} color="#ffb24a" speed={2.2} glow size={1.4} seed="ei" />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(170,30,10,0.55) 100%)", opacity: char * (0.6 + 0.4 * Math.sin(f * 0.6)) }} />
      <AbsoluteFill style={{ background: "#fff8e8", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* J 0-78  Sampati dives in and spreads his wings over Jatayu; his shadow falls over his brother
   "Tab bade bhai Sampati ne apne pankh phailakar," */
export const ShotShield: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = 21.75 + f / fps;
  const enter = interpolate(f, [26, 60], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const spread = interpolate(f, [60, 72], [0, 1], { ...cl, easing: ease });
  const shield = interpolate(f, [48, 70], [0, 1], cl);
  const jw = 320;
  const jx = 360 + Math.sin(t * 1.3) * 12, jy = 800 +interpolate(f, [0, 78], [0, 40], cl) + Math.sin(t * 5) * 6;
  const jFlap = Math.sin(t * Math.PI * 2 * 1.1) * (0.55 - shield * 0.2) + Math.sin(t * 17) * 0.08;
  const sw = 760 - enter * 240;
  const sx = 820 - enter * 460, sy = -120 + enter * 600;
  const sFlap = (1 - spread) * Math.sin(t * Math.PI * 2 * 1.8) * 0.8 + spread * 0.12;
  const push = interpolate(f, [0, 78], [1, 1.1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "50% 50%" }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#fde4c2 0%,#fbbd8a 30%,#f69468 55%,#ef7a55 80%,#e2603f 100%)" }} />
        <GodRays cx={360} cy={240} t={t} opacity={0.4} color="#fff4dc" count={16} />
        <BigSun cx={360} cy={240} r={330} t={t} frame={f} />
        {/* Jatayu, struggling */}
        <div style={{
          position: "absolute", left: jx - jw / 2, top: jy - jw / BR / 2, width: jw, height: jw / BR,
          filter: `brightness(${1 - shield * 0.28}) saturate(${1 - shield * 0.2})`,
        }}>
          <Bird id="jShield" mode="fly" palette={JATAYU} t={t} flap={jFlap} char={0.9 - shield * 0.25} eyes="closed" rim="#fff0c8" />
        </div>
        <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
          <Smoke x={jx - 140} y={jy} t={t} n={6} scale={0.5 * (1 - shield * 0.7)} color="#3a2622" seed="j1" />
          <Smoke x={jx + 140} y={jy} t={t + 0.4} n={6} scale={0.5 * (1 - shield * 0.7)} color="#3a2622" seed="j2" />
        </svg>
        {/* Sampati's shadow falling across Jatayu */}
        <div style={{
          position: "absolute", left: jx - 260, top: jy - 170, width: 520, height: 300, opacity: shield,
          background: "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(60,24,70,0.5), rgba(60,24,70,0) 100%)", mixBlendMode: "multiply",
        }} />
        {/* Sampati, backlit, wings spread as a canopy */}
        {enter > 0 && (
          <div style={{
            position: "absolute", left: sx - sw / 2, top: sy - sw / BR / 2, width: sw, height: sw / BR,
            filter: `blur(${(1 - enter) * 8}px) brightness(${0.78 - spread * 0.08}) drop-shadow(0 0 ${10 + spread * 14}px rgba(255,200,120,0.95))`,
          }}>
            <Bird id="sShield" mode="fly" palette={SAMPATI} t={t} flap={sFlap} rim="#fff6d8" />
          </div>
        )}
        <Embers t={t} n={24} color="#ffc070" speed={1.5} glow seed="ej" />
      </div>
      <LensFlare x={360} y={240} intensity={0.7 - shield * 0.3} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(120,20,40,0.3), transparent 60%)" }} />
    </AbsoluteFill>
  );
};
