import React from "react";
import { random } from "remotion";
import { INK } from "./fx";

export const Sun: React.FC<{ cx: number; cy: number; r: number; glow?: number; id?: string }> = ({ cx, cy, r, glow = 1, id = "sg" }) => (
  <g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0.42" stopColor="#fff4da" stopOpacity={0.9 * glow} />
        <stop offset="0.6" stopColor="#ffd2a8" stopOpacity={0.45 * glow} />
        <stop offset="1" stopColor="#ff9a8a" stopOpacity={0} />
      </radialGradient>
      <radialGradient id={id + "d"} cx="0.45" cy="0.42">
        <stop offset="0" stopColor="#fffdf4" />
        <stop offset="0.8" stopColor="#fdf1d6" />
        <stop offset="1" stopColor="#fbe2bd" />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r * 2.3} fill={`url(#${id})`} />
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id}d)`} />
  </g>
);

/** Toon cloud with lit rim + coloured outline (sunset palette). */
export const ToonCloud: React.FC<{ x: number; y: number; s: number; fill: string; rim: string; outline?: string; shade?: string }> = ({ x, y, s, fill, rim, outline, shade }) => {
  const puffs = [[-60, 0, 34], [-25, -22, 40], [18, -30, 44], [58, -8, 34], [0, 4, 38]];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {puffs.map(([px, py, r], i) => <circle key={"o" + i} cx={px} cy={py} r={r + 2.5} fill={outline ?? rim} />)}
      {puffs.map(([px, py, r], i) => <circle key={"r" + i} cx={px} cy={py} r={r} fill={rim} />)}
      {puffs.map(([px, py, r], i) => <circle key={"f" + i} cx={px + 4} cy={py + 6} r={r - 4} fill={fill} />)}
      {shade && <path d="M-92,14 Q0,44 92,14 L92,40 L-92,40Z" fill={shade} opacity={0.5} />}
    </g>
  );
};

export const Diya: React.FC<{ x: number; y: number; s?: number; t: number; i: number }> = ({ x, y, s = 1, t, i }) => {
  const fl = 1 + Math.sin(t * 13 + i * 2) * 0.12 + Math.sin(t * 29 + i) * 0.05;
  const sway = Math.sin(t * 5 + i) * 2;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx={0} cy={-14} r={34} fill="#ffb347" opacity={0.18 * fl} />
      <circle cx={0} cy={-16} r={16} fill="#ffd27a" opacity={0.35} />
      <path d={`M0,${-28 * fl} C${7 + sway},-14 5,-6 0,-5 C-5,-6 ${-7 + sway},-14 0,${-28 * fl}Z`} fill="#ffe7a1" />
      <path d={`M0,${-18 * fl} C3,-10 2,-7 0,-6 C-2,-7 -3,-10 0,${-18 * fl}Z`} fill="#fff8e0" />
      <path d="M-17,-6 L17,-6 C15,5 -15,5 -17,-6Z" fill="#c4372b" stroke={INK} strokeWidth={1.5} />
      <path d="M-12,-2 l4,3 l4,-3 l4,3 l4,-3 l4,3" stroke="#ffcf6a" strokeWidth={1} fill="none" />
    </g>
  );
};

export const Flock: React.FC<{ t: number; x: number; y: number; n: number; s?: number; color?: string }> = ({ t, x, y, n, s = 1, color = "#7a3a52" }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const bx = x + i * 26 * s + Math.sin(i * 3.1) * 10 + t * 20;
      const by = y + Math.cos(i * 2.3) * 12 * s + Math.sin(t * 2 + i) * 3;
      const f = Math.sin(t * 9 + i) * 4 * s;
      return <path key={i} d={`M${bx - 7 * s},${by - f} Q${bx - 3 * s},${by - 2} ${bx},${by} Q${bx + 3 * s},${by - 2} ${bx + 7 * s},${by - f}`} stroke={color} strokeWidth={1.6} fill="none" opacity={0.75} />;
    })}
  </g>
);

/** Lanka skyline: central shikhara + side spires, domes, walls, gold glints. Centred x=0, base y=0. */
export const Lanka: React.FC<{ color: string; glint?: number; t?: number }> = ({ color, glint = 0, t = 0 }) => (
  <g>
    <g fill={color}>
      <path d="M-420,0 L-400,-30 L400,-30 L420,0Z" />
      <rect x={-330} y={-60} width={660} height={32} />
      {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={-330 + i * 30} y={-70} width={16} height={12} />)}
      {/* central shikhara with tiers */}
      <path d="M-86,-58 L-74,-120 L-60,-160 L-44,-210 L-28,-250 L-14,-286 L0,-310 L14,-286 L28,-250 L44,-210 L60,-160 L74,-120 L86,-58Z" />
      {[-120, -160, -210, -250].map((y, i) => <rect key={i} x={-90 + i * 12} y={y - 4} width={180 - i * 24} height={6} />)}
      <circle cx={0} cy={-314} r={8} />
      <rect x={-1.5} y={-360} width={3} height={50} />
      {/* side spires */}
      {[-150, 150].map((cx, i) => (
        <g key={i}>
          <path d={`M${cx - 36},-58 L${cx - 26},-120 L${cx},-182 L${cx + 26},-120 L${cx + 36},-58Z`} />
          <circle cx={cx} cy={-186} r={5} />
          <rect x={cx - 1} y={-206} width={2} height={20} />
        </g>
      ))}
      {[-235, -75, 75, 235].map((cx, i) => (
        <g key={i}>
          <rect x={cx - 22} y={-100} width={44} height={44} />
          <ellipse cx={cx} cy={-102} rx={24} ry={28} />
          <rect x={cx - 1.5} y={-142} width={3} height={16} />
        </g>
      ))}
      {[-300, 300].map((cx, i) => <rect key={i} x={cx - 20} y={-96} width={40} height={40} rx={20} />)}
      {[-380, 380].map((cx, i) => <path key={i} d={`M${cx - 14},-30 L${cx - 10},-120 L${cx},-134 L${cx + 10},-120 L${cx + 14},-30Z`} />)}
    </g>
    {/* flag */}
    <path d={`M1.5,-360 Q14,${-356 + Math.sin(t * 6) * 3} 28,-352 Q14,${-346 + Math.sin(t * 6 + 1) * 3} 1.5,-342Z`} fill="#e8582a" />
    {glint > 0 && [[0, -314], [-150, -186], [150, -186], [-75, -130], [75, -130]].map(([x, y], i) => (
      <g key={i} opacity={glint * (0.5 + 0.5 * Math.sin(t * 4 + i * 1.3))}>
        <circle cx={x} cy={y} r={5} fill="#fff6c8" />
        <path d={`M${x - 14},${y} L${x + 14},${y} M${x},${y - 14} L${x},${y + 14}`} stroke="#fff6c8" strokeWidth={1.2} />
      </g>
    ))}
  </g>
);

/** Low-poly faceted rock: lit top, shadow side, texture overlay, cracks, carved spiral. */
export const FacetRock: React.FC<{
  outline: string; facets: { d: string; fill: string }[]; cracks?: string[]; textureId?: string; carving?: [number, number, number];
  rimPath?: string; rimColor?: string;
}> = ({ outline, facets, cracks = [], textureId, carving, rimPath, rimColor = "#ffb27a" }) => (
  <g>
    <path d={outline} fill={facets[0]?.fill ?? "#800"} />
    {facets.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={INK} strokeWidth={1.2} strokeOpacity={0.35} strokeLinejoin="round" />)}
    {textureId && <path d={outline} fill="#1a0820" opacity={0.28} filter={`url(#${textureId})`} />}
    {cracks.map((c, i) => (
      <g key={i}>
        <path d={c} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={2} fill="none" transform="translate(1.5,1.5)" />
        <path d={c} stroke="#3a0f33" strokeWidth={2} fill="none" strokeLinejoin="round" />
      </g>
    ))}
    {carving && (
      <g transform={`translate(${carving[0]},${carving[1]}) scale(${carving[2]})`} opacity={0.55}>
        <path d="M0,0 m-2,0 a2,2 0 1,1 4,0 a6,6 0 1,1 -12,0 a10,10 0 1,1 20,0 a14,14 0 1,1 -28,0 a18,18 0 1,1 36,0" stroke="#3a0f33" strokeWidth={2.2} fill="none" />
        <path d="M-30,30 l10,-10 l10,10 l10,-10 l10,10 l10,-10 l10,10" stroke="#3a0f33" strokeWidth={2} fill="none" />
      </g>
    )}
    {rimPath && <path d={rimPath} stroke={rimColor} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />}
    <path d={outline} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
  </g>
);

/** Ruined carved pillar for world-building. */
export const Pillar: React.FC<{ x: number; y: number; h: number; s?: number; broken?: boolean; lit?: string; dark?: string }> = ({ x, y, h, s = 1, broken, lit = "#e98c5a", dark = "#b3584a" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-26} y={-12} width={52} height={12} fill={dark} stroke={INK} strokeWidth={1.5} />
    <path d={`M-18,-12 L-18,${-h} ${broken ? `L-6,${-h - 14} L4,${-h + 6} L18,${-h - 6}` : `L18,${-h}`} L18,-12Z`} fill={lit} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    <rect x={-18} y={-h + 4} width={12} height={h - 16} fill={dark} opacity={0.6} />
    {Array.from({ length: Math.floor(h / 26) }).map((_, i) => <path key={i} d={`M-18,${-20 - i * 26} L18,${-20 - i * 26}`} stroke={INK} strokeWidth={1} opacity={0.5} />)}
    <path d={`M-8,${-h * 0.55} a6,6 0 1,1 12,0 a6,6 0 1,1 -12,0`} stroke={INK} strokeWidth={1.2} fill="none" opacity={0.6} />
    {!broken && <rect x={-26} y={-h - 10} width={52} height={10} fill={dark} stroke={INK} strokeWidth={1.5} />}
  </g>
);

/** Tattered waving saffron flag on a pole. */
export const Flag: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const pts = Array.from({ length: 7 }).map((_, i) => {
    const k = i / 6;
    return [k * 70, Math.sin(t * 5 - k * 4) * 6 * k];
  });
  const top = pts.map(([px, py]) => `${px},${py}`).join(" L");
  const bot = [...pts].reverse().map(([px, py], i) => `${px},${py + 34 - (i % 2) * 6}`).join(" L");
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-2} y={0} width={4} height={150} fill="#4a2a20" stroke={INK} strokeWidth={1} />
      <path d={`M${top} L${bot}Z`} transform="translate(2,4)" fill="#ff8a1f" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d={`M10,22 l6,-8 l6,8`} transform="translate(2,4)" stroke="#ffe28a" strokeWidth={1.4} fill="none" />
    </g>
  );
};

/** Lavender sky-cloud cluster (flight shots). Seeded puffs. */
export const SkyCloud: React.FC<{ seed: number; warm?: number }> = ({ seed, warm = 0 }) => {
  const puffs = Array.from({ length: 5 + Math.floor(random("cp" + seed) * 4) }).map((_, i) => {
    const a = random(`a${seed}-${i}`), b = random(`b${seed}-${i}`), c = random(`c${seed}-${i}`);
    return [(a - 0.5) * 240, (b - 0.5) * 50 - (1 - Math.abs(a - 0.5) * 2) * 30, 45 + c * 45];
  });
  const lit = warm ? "#ffe2c4" : "#fbf1e2";
  const shade = warm ? "#e7a59a" : "#c3b8d4";
  const line = warm ? "#c27a7a" : "#8f84ad";
  return (
    <g>
      {puffs.map(([x, y, r], i) => <circle key={"o" + i} cx={x} cy={y} r={r + 2.5} fill={line} />)}
      {puffs.map(([x, y, r], i) => <circle key={"l" + i} cx={x} cy={y} r={r} fill={lit} />)}
      {puffs.map(([x, y, r], i) => <circle key={"s" + i} cx={x + r * 0.08} cy={y + r * 0.28} r={r * 0.9} fill={shade} />)}
      {puffs.map(([x, y, r], i) => <circle key={"d" + i} cx={x + r * 0.15} cy={y + r * 0.5} r={r * 0.62} fill="#7f73a3" opacity={0.18} />)}
      {puffs.map(([x, y, r], i) => <path key={"e" + i} d={`M${x - r * 0.6},${y + r * 0.5} q${r * 0.6},${r * 0.35} ${r * 1.2},0`} stroke={line} strokeWidth={1.5} fill="none" opacity={0.5} />)}
      {puffs.map(([x, y, r], i) => <path key={"h" + i} d={`M${x - r * 0.55},${y - r * 0.55} q${r * 0.4},${-r * 0.35} ${r * 0.9},${-r * 0.1}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />)}
    </g>
  );
};
