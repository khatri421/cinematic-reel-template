import React from "react";
import { AbsoluteFill, random } from "remotion";

export const W = 720, H = 1280;
export const INK = "#2a1b2b";

/** Animated film grain (seeded per frame). */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.09 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
    <filter id="grainF">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter="url(#grainF)" />
  </svg>
);

export const Vignette: React.FC<{ color?: string; strength?: number }> = ({ color = "30,8,30", strength = 0.38 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 65% at 50% 48%, transparent 55%, rgba(${color},${strength}) 100%)`, pointerEvents: "none" }} />
);

/** Soft volumetric light shafts from a point. */
export const GodRays: React.FC<{ cx: number; cy: number; t: number; color?: string; opacity?: number; count?: number; len?: number }> = ({ cx, cy, t, color = "#fff1d0", opacity = 0.22, count = 11, len = 1500 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", filter: "blur(10px)", pointerEvents: "none", overflow: "visible" }}>
    <defs>
      <radialGradient id={`rayG${cx | 0}`} cx={cx} cy={cy} r={len} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={color} stopOpacity={1} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <g opacity={opacity}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + t * 0.05 + random("ra" + i) * 0.3;
        const wdt = 0.035 + random("rw" + i) * 0.06;
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.8 + i * 1.9);
        const x1 = cx + Math.cos(a - wdt) * len, y1 = cy + Math.sin(a - wdt) * len;
        const x2 = cx + Math.cos(a + wdt) * len, y2 = cy + Math.sin(a + wdt) * len;
        return <path key={i} d={`M${cx},${cy} L${x1},${y1} L${x2},${y2}Z`} fill={`url(#rayG${cx | 0})`} opacity={pulse} />;
      })}
    </g>
  </svg>
);

/** Floating embers / dust motes. */
export const Embers: React.FC<{ t: number; n?: number; color?: string; speed?: number; seed?: string; size?: number; glow?: boolean }> = ({ t, n = 26, color = "#fff1c8", speed = 1, seed = "e", size = 1, glow = false }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({ length: n }).map((_, i) => {
      const x0 = random(seed + "x" + i) * W, sp = (12 + random(seed + "s" + i) * 30) * speed;
      const y = H * 1.1 - ((t * sp + random(seed + "y" + i) * H) % (H * 1.1));
      const x = x0 + Math.sin(t * 0.8 + i) * 16;
      const r = (1.4 + random(seed + "r" + i) * 3) * size;
      const op = 0.35 + 0.45 * Math.abs(Math.sin(t * 1.7 + i));
      return (
        <g key={i}>
          {glow && <circle cx={x} cy={y} r={r * 3.2} fill={color} opacity={op * 0.25} />}
          <circle cx={x} cy={y} r={r} fill={color} opacity={op} />
        </g>
      );
    })}
  </svg>
);

/** Rising smoke wisps from a point (in the caller's SVG coords). */
export const Smoke: React.FC<{ x: number; y: number; t: number; n?: number; scale?: number; color?: string; seed?: string }> = ({ x, y, t, n = 6, scale = 1, color = "#3b2a33", seed = "sm" }) => (
  <g style={{ filter: `blur(${4 * scale}px)` }}>
    {Array.from({ length: n }).map((_, i) => {
      const life = 2.4;
      const ph = ((t + random(seed + i) * life) % life) / life;
      const px = x + Math.sin(ph * 5 + i) * 14 * scale + ph * 20 * scale;
      const py = y - ph * 140 * scale;
      const r = (8 + ph * 26) * scale;
      return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={(1 - ph) * 0.5 * Math.min(1, ph * 6)} />;
    })}
  </g>
);

/** Anamorphic lens flare + ghosts along the axis from light source through centre. */
export const LensFlare: React.FC<{ x: number; y: number; intensity?: number; tint?: string }> = ({ x, y, intensity = 1, tint = "255,220,170" }) => {
  const cx = W / 2, cy = H / 2;
  const ghosts = [0.35, 0.7, 1.15, 1.5];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none" }}>
      <ellipse cx={x} cy={y} rx={420} ry={6} fill={`rgba(${tint},${0.35 * intensity})`} style={{ filter: "blur(3px)" }} />
      <circle cx={x} cy={y} r={60} fill={`rgba(${tint},${0.25 * intensity})`} style={{ filter: "blur(18px)" }} />
      {ghosts.map((k, i) => {
        const gx = x + (cx - x) * k * 1.6, gy = y + (cy - y) * k * 1.6;
        return <circle key={i} cx={gx} cy={gy} r={[18, 34, 12, 46][i]} fill={["rgba(255,180,120,", "rgba(160,200,255,", "rgba(255,240,200,", "rgba(255,140,170,"][i] + 0.12 * intensity + ")"} />;
      })}
    </svg>
  );
};

/** Radial speed lines for the race / dive moments. */
export const SpeedLines: React.FC<{ t: number; cx: number; cy: number; opacity: number; color?: string }> = ({ t, cx, cy, opacity, color = "#ffffff" }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
    {Array.from({ length: 40 }).map((_, i) => {
      const a = random("sl" + i) * Math.PI * 2;
      const ph = (t * 2.2 + random("sp" + i)) % 1;
      const r1 = 200 + ph * 700, r2 = r1 + 80 + random("sL" + i) * 160;
      return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={color} strokeWidth={1.5 + random("sw" + i) * 2} opacity={(1 - ph) * 0.7} strokeLinecap="round" />;
    })}
  </svg>
);

/** Wavy heat-haze displacement filter definition (use filter="url(#heat)"). */
export const HeatFilter: React.FC<{ frame: number; scale?: number; id?: string }> = ({ frame, scale = 6, id = "heat" }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="turbulence" baseFrequency="0.012 0.05" numOctaves={2} seed={Math.floor(frame / 2) % 50} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

/** Painterly stone texture filter, applied inside an SVG. */
export const StoneTexture: React.FC<{ id: string; tint?: string }> = ({ id }) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018 0.045" numOctaves={4} seed={7} result="n" />
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.15" result="a" />
    <feComposite in="SourceGraphic" in2="a" operator="in" />
  </filter>
);
