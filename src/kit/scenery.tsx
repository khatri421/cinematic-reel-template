import React from "react";
import { random } from "remotion";
import { H, INK, W } from "./fx";

/* World building blocks in the series style: flat folk colour + ink outline + toon shade + rim on the lit side.
   All take plain SVG coordinates (720 x 1280 world). Put them inside <Layer d=...> of a <Stage>.
   `lit` = which side the key light comes from (-1 left, 1 right) so shading matches the scene's light.
   Combine them freely: a story's world should be designed for that story, not copied from another reel. */

/** Ground plane from y to the bottom: gradient + soft texture strokes + horizon haze. */
export const Ground: React.FC<{ y: number; top: string; bottom: string; haze?: string; seed?: string; tufts?: string }> = ({ y, top, bottom, haze, seed = "g", tufts }) => {
  const id = `gr-${seed}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
      <rect x={-600} y={y} width={W + 1200} height={H - y + 800} fill={`url(#${id})`} />
      {haze && <rect x={-600} y={y - 14} width={W + 1200} height={30} fill={haze} opacity={0.55} style={{ filter: "blur(8px)" }} />}
      {Array.from({ length: 26 }).map((_, i) => {
        const yy = y + 20 + Math.pow(random(`${seed}y${i}`), 1.5) * (H - y + 300);
        const x = -300 + random(`${seed}x${i}`) * (W + 600), len = 20 + random(`${seed}l${i}`) * 70 * (1 + (yy - y) / 600);
        return <path key={i} d={`M${x},${yy} q${len / 2},-3 ${len},0`} stroke={INK} strokeWidth={1 + (yy - y) / 500} opacity={0.12} fill="none" />;
      })}
      {tufts && Array.from({ length: 18 }).map((_, i) => {
        const yy = y + 30 + random(`${seed}ty${i}`) * (H - y), x = -100 + random(`${seed}tx${i}`) * (W + 200), s = 0.6 + (yy - y) / 500;
        return <path key={`t${i}`} d={`M${x},${yy} l${-4 * s},${-14 * s} M${x},${yy} l0,${-18 * s} M${x},${yy} l${5 * s},${-13 * s}`} stroke={tufts} strokeWidth={1.6 * s} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Faceted mountain range (toon-shaded, lit side + dark side). snow = white caps (Kailash, Himalaya). */
export const Mountains: React.FC<{ y: number; h: number; color: string; dark: string; rim?: string; snow?: boolean; lit?: number; seed?: string; n?: number }> = ({ y, h, color, dark, rim, snow, lit = -1, seed = "m", n = 5 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const cx = -120 + (i + 0.5) * ((W + 240) / n) + (random(`${seed}${i}`) - 0.5) * 80;
      const ph = h * (0.6 + random(`${seed}h${i}`) * 0.55), hw = ph * (0.75 + random(`${seed}w${i}`) * 0.4);
      const px = cx + (random(`${seed}p${i}`) - 0.5) * hw * 0.3, top = y - ph;
      const litX = lit < 0 ? cx - hw : cx + hw;
      return (
        <g key={i}>
          <path d={`M${cx - hw},${y} L${px},${top} L${cx + hw},${y}Z`} fill={color} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d={`M${px},${top} L${lit < 0 ? cx + hw : cx - hw},${y} L${px + (lit < 0 ? 8 : -8)},${y}Z`} fill={dark} opacity={0.8} />
          <path d={`M${px},${top} L${px - 14},${top + ph * 0.35} L${px + 6},${top + ph * 0.55} L${px - 4},${y}`} stroke={dark} strokeWidth={1.4} fill="none" opacity={0.6} />
          {snow && <path d={`M${px},${top} L${px - hw * 0.22},${top + ph * 0.22} l${hw * 0.08},-6 l${hw * 0.07},10 l${hw * 0.08},-8 l${hw * 0.1},${6} L${px + hw * 0.24},${top + ph * 0.24}Z`} fill="#f6f2ff" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />}
          {rim && <path d={`M${px},${top} L${litX},${y}`} stroke={rim} strokeWidth={2.4} opacity={0.65} />}
        </g>
      );
    })}
  </g>
);

/** Folk tree: trunk + clustered canopy with pattern dots. kind: "banyan" (wide), "round", "palm", "kadamb". */
export const Tree: React.FC<{ x: number; y: number; s?: number; kind?: "banyan" | "round" | "palm" | "kadamb"; leaf: string; leafDark: string; trunk?: string; rim?: string; t?: number; seed?: string; flowers?: string }> = ({ x, y, s = 1, kind = "round", leaf, leafDark, trunk = "#6a3a2a", rim, t = 0, seed = "tr", flowers }) => {
  const sway = Math.sin(t * 1.3 + x) * 1.5;
  if (kind === "palm") return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-6,0 C-2,-60 6,-120 14,-178 L22,-176 C14,-118 8,-60 6,0Z" fill={trunk} stroke={INK} strokeWidth={2} />
      {[-150, -110, -60, -20, 20, 60].map((a, i) => (
        <path key={i} transform={`translate(18,-178) rotate(${a + sway})`} d="M0,0 C20,-6 50,-4 78,14 C50,8 22,10 0,4Z" fill={i % 2 ? leaf : leafDark} stroke={INK} strokeWidth={1.6} />
      ))}
    </g>
  );
  const blobs = kind === "banyan" ? [[-90, -120, 60], [-30, -160, 70], [50, -150, 66], [100, -110, 54], [0, -110, 64]]
    : kind === "kadamb" ? [[-40, -150, 48], [30, -170, 52], [0, -210, 46], [55, -130, 44], [-55, -110, 42]]
    : [[-40, -130, 52], [20, -160, 58], [55, -120, 48], [0, -105, 50]];
  const tw = kind === "banyan" ? 26 : 14;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d={`M${-tw},0 C${-tw * 0.6},-50 ${-tw * 0.5},-80 ${-tw * 0.7},-110 L${tw * 0.7},-110 C${tw * 0.5},-80 ${tw * 0.6},-50 ${tw},0Z`} fill={trunk} stroke={INK} strokeWidth={2.2} />
      {kind === "banyan" && [-70, -40, 60, 90].map((rx, i) => <path key={i} d={`M${rx},-120 C${rx + 4},-70 ${rx - 3},-30 ${rx + 2},0`} stroke={trunk} strokeWidth={3} fill="none" />)}
      <g transform={`rotate(${sway * 0.4},0,-60)`}>
        {blobs.map(([bx, by, r], i) => <circle key={`o${i}`} cx={bx} cy={by} r={r + 2.5} fill={INK} />)}
        {blobs.map(([bx, by, r], i) => <circle key={`d${i}`} cx={bx} cy={by} r={r} fill={leafDark} />)}
        {blobs.map(([bx, by, r], i) => <circle key={`l${i}`} cx={bx - 8} cy={by - 8} r={r * 0.78} fill={leaf} />)}
        {Array.from({ length: 30 }).map((_, i) => {
          const b = blobs[i % blobs.length], a = random(`${seed}a${i}`) * 6.28, rr = random(`${seed}r${i}`) * b[2] * 0.75;
          return <circle key={`p${i}`} cx={b[0] + Math.cos(a) * rr} cy={b[1] + Math.sin(a) * rr} r={flowers ? 3 : 1.6} fill={flowers ?? "#fff6d8"} opacity={flowers ? 0.95 : 0.55} />;
        })}
        {rim && blobs.map(([bx, by, r], i) => <path key={`rm${i}`} d={`M${bx - r * 0.7},${by - r * 0.7} A${r},${r} 0 0 1 ${bx + r * 0.2},${by - r * 0.98}`} stroke={rim} strokeWidth={3} fill="none" opacity={0.6} />)}
      </g>
    </g>
  );
};

/** Sea / river / lake surface from the horizon down: gradient, swells, glints under the key light, reflection band. */
export const Water: React.FC<{ y: number; top: string; bottom: string; glintX?: number; glint?: string; t: number; seed?: string; lines?: string }> = ({ y, top, bottom, glintX = 360, glint = "#fff1d8", t, seed = "w", lines = "#1b1352" }) => {
  const id = `wa-${seed}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
      <rect x={-600} y={y} width={W + 1200} height={H - y + 800} fill={`url(#${id})`} />
      <path d={`M${glintX - 30},${y} L${glintX + 30},${y} L${glintX + 300},${H + 200} L${glintX - 300},${H + 200}Z`} fill={glint} opacity={0.22} style={{ filter: "blur(16px)" }} />
      {Array.from({ length: 14 }).map((_, i) => {
        const k = (i + 1) / 14, yy = y + Math.pow(k, 1.7) * (H - y + 200), amp = 2 + k * 9, off = (t * 28 * (0.3 + k)) % 200;
        let d = `M${-300 - off},${yy}`;
        for (let x = -300; x < W + 400; x += 100) d += ` q25,${-amp} 50,0 t50,0`;
        return <path key={i} d={d} stroke={lines} strokeWidth={1 + k * 2.6} fill="none" opacity={0.3} />;
      })}
      {Array.from({ length: 60 }).map((_, i) => {
        const yy = y + 4 + Math.pow(random(`${seed}gy${i}`), 1.6) * (H - y), near = (yy - y) / (H - y);
        const r0 = random(`${seed}gx${i}`) - 0.5, x = glintX + r0 * (90 + near * 800) + Math.sin(t * 2 + i) * 4;
        const op = (0.3 + (1 - Math.min(1, Math.abs(r0) * 2.4)) * 0.6) * (0.5 + 0.5 * Math.sin(t * 5 + i * 1.7));
        return <rect key={i} x={x} y={yy} width={8 + near * 60 * (0.5 + random(`${seed}gl${i}`))} height={1.4 + near * 3} rx={2} fill={glint} opacity={op} />;
      })}
    </g>
  );
};

/** Ashram hut (kutir): thatched roof, mud walls, door glow. */
export const Hut: React.FC<{ x: number; y: number; s?: number; wall?: string; roof?: string; glow?: number; rim?: string }> = ({ x, y, s = 1, wall = "#c98a5a", roof = "#b8873a", glow = 0, rim }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,0 L-70,-70 L70,-70 L70,0Z" fill={wall} stroke={INK} strokeWidth={2.2} />
    <path d="M10,-70 L70,-70 L70,0 L10,0Z" fill="#000" opacity={0.18} />
    <path d="M-20,0 L-20,-44 Q0,-58 20,-44 L20,0Z" fill={glow > 0 ? "#ffcf7a" : "#3a2018"} stroke={INK} strokeWidth={1.8} />
    {glow > 0 && <ellipse cx={0} cy={-10} rx={60} ry={30} fill="#ffb347" opacity={0.25 * glow} style={{ filter: "blur(10px)" }} />}
    <path d="M-96,-62 L0,-140 L96,-62 C60,-56 -60,-56 -96,-62Z" fill={roof} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
    {[-60, -36, -12, 12, 36, 60].map((rx, i) => <path key={i} d={`M${rx * 0.2},${-132 + Math.abs(rx) * 0.2} L${rx * 1.3},-62`} stroke="#7a5420" strokeWidth={1.4} opacity={0.7} />)}
    <path d="M0,-140 L96,-62 C80,-60 60,-58 40,-58Z" fill="#000" opacity={0.15} />
    {rim && <path d="M-96,-62 L0,-140" stroke={rim} strokeWidth={3} opacity={0.6} />}
    {[-50, 50].map((px) => <path key={px} d={`M${px - 6},-4 l6,-8 l6,8`} stroke="#fff3d0" strokeWidth={1.2} fill="none" opacity={0.6} />)}
  </g>
);

/** Shikhara temple: plinth, sanctum with door glow, curved tower, kalash + flag. */
export const Temple: React.FC<{ x: number; y: number; s?: number; stone?: string; dark?: string; gold?: string; glow?: number; rim?: string; t?: number }> = ({ x, y, s = 1, stone = "#d9a07a", dark = "#9a5a4a", gold = "#f2c12e", glow = 0.6, rim, t = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-110} y={-20} width={220} height={20} fill={dark} stroke={INK} strokeWidth={2} />
    <rect x={-90} y={-110} width={180} height={90} fill={stone} stroke={INK} strokeWidth={2.2} />
    <path d="M-24,-20 L-24,-70 Q0,-92 24,-70 L24,-20Z" fill="#ffcf7a" stroke={INK} strokeWidth={1.8} />
    <ellipse cx={0} cy={-45} rx={50} ry={34} fill="#ffb347" opacity={0.3 * glow} style={{ filter: "blur(8px)" }} />
    <path d="M-76,-110 C-80,-200 -40,-280 0,-310 C40,-280 80,-200 76,-110Z" fill={stone} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M0,-310 C40,-280 80,-200 76,-110 L20,-110 C30,-200 20,-270 0,-310Z" fill={dark} opacity={0.45} />
    {[-140, -170, -200, -230, -260].map((yy, i) => <path key={i} d={`M${-70 + i * 9},${yy} Q0,${yy - 8} ${70 - i * 9},${yy}`} stroke={dark} strokeWidth={1.6} fill="none" />)}
    <ellipse cx={0} cy={-314} rx={16} ry={8} fill={gold} stroke={INK} strokeWidth={1.4} />
    <path d="M-8,-320 Q0,-344 8,-320Z" fill={gold} stroke={INK} strokeWidth={1.2} />
    <path d="M0,-340 L0,-380" stroke={INK} strokeWidth={2} />
    <path d={`M0,-380 Q${18 + Math.sin(t * 6) * 4},${-374 + Math.sin(t * 5) * 3} 34,-366 L0,-358Z`} fill="#e8541e" stroke={INK} strokeWidth={1.2} />
    {rim && <path d="M-76,-110 C-80,-200 -40,-280 0,-310" stroke={rim} strokeWidth={3} fill="none" opacity={0.6} />}
  </g>
);

/** Palace interior back wall: arches on pillars, hanging lamps, a raised floor line. For durbar / court scenes. */
export const CourtHall: React.FC<{ floorY: number; wall?: string; arch?: string; pillar?: string; gold?: string; t?: number }> = ({ floorY, wall = "#5a1d4a", arch = "#2a0c26", pillar = "#c4707a", gold = "#f2c12e", t = 0 }) => (
  <g>
    <rect x={-400} y={-200} width={W + 800} height={floorY + 200} fill={wall} />
    {[-260, -60, 140, 340, 540, 740, 940].map((px, i) => (
      <g key={i}>
        <path d={`M${px + 20},${floorY - 80} L${px + 20},${floorY - 420} Q${px + 100},${floorY - 560} ${px + 180},${floorY - 420} L${px + 180},${floorY - 80}Z`} fill={arch} stroke={INK} strokeWidth={2} />
        <rect x={px - 10} y={floorY - 520} width={34} height={440} fill={pillar} stroke={INK} strokeWidth={2.2} />
        <rect x={px + 12} y={floorY - 520} width={12} height={440} fill="#000" opacity={0.2} />
        <rect x={px - 18} y={floorY - 540} width={50} height={22} fill={gold} stroke={INK} strokeWidth={1.6} />
        <rect x={px - 18} y={floorY - 100} width={50} height={20} fill={gold} stroke={INK} strokeWidth={1.6} />
        <path d={`M${px + 100},${floorY - 560} L${px + 100},${floorY - 470}`} stroke={gold} strokeWidth={1.4} />
        <circle cx={px + 100} cy={floorY - 462} r={8} fill="#ffd27a" stroke={INK} strokeWidth={1.2} />
        <circle cx={px + 100} cy={floorY - 462} r={28 + Math.sin(t * 9 + i) * 2} fill="#ffb347" opacity={0.18} />
      </g>
    ))}
    <rect x={-400} y={floorY - 80} width={W + 800} height={14} fill={gold} stroke={INK} strokeWidth={1.6} />
  </g>
);

/** Throne (singhasan) seen 3/4 from the front, seat height ~ 120 * s. */
export const Throne: React.FC<{ x: number; y: number; s?: number; gold?: string; cushion?: string }> = ({ x, y, s = 1, gold = "#f2c12e", cushion = "#c4372b" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-80,0 L-80,-120 L80,-120 L80,0Z" fill={gold} stroke={INK} strokeWidth={2.2} />
    <path d="M-70,-120 C-80,-220 -40,-280 0,-290 C40,-280 80,-220 70,-120Z" fill={gold} stroke={INK} strokeWidth={2.2} />
    <path d="M-50,-130 C-56,-200 -30,-250 0,-258 C30,-250 56,-200 50,-130Z" fill={cushion} stroke={INK} strokeWidth={1.6} />
    <rect x={-74} y={-138} width={148} height={22} rx={6} fill={cushion} stroke={INK} strokeWidth={1.6} />
    <circle cx={0} cy={-272} r={8} fill="#d6262c" stroke={INK} strokeWidth={1.2} />
    <path d="M0,-290 C40,-280 80,-220 70,-120 L80,0 L30,0 L30,-120 C40,-200 30,-260 0,-290Z" fill="#000" opacity={0.18} />
  </g>
);

/** Rain streaks (storm) and a lightning flash helper. */
export const Rain: React.FC<{ t: number; n?: number; color?: string; angle?: number }> = ({ t, n = 90, color = "#cfd8ff", angle = 12 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }).map((_, i) => {
      const x = (random(`rx${i}`) * (W + 300) + t * 60) % (W + 300) - 150, y = ((random(`ry${i}`) * H + t * 1400 * (0.8 + random(`rs${i}`) * 0.5)) % (H + 100)) - 50;
      const len = 30 + random(`rl${i}`) * 40;
      return <path key={i} d={`M${x},${y} l${-len * Math.tan((angle * Math.PI) / 180)},${len}`} stroke={color} strokeWidth={1.2} opacity={0.35} />;
    })}
  </svg>
);
export const lightning = (lt: number, at: number) => (lt > at && lt < at + 0.08) || (lt > at + 0.14 && lt < at + 0.2) ? 0.8 : 0;

/** Lotus (pond, divine seat). */
export const Lotus: React.FC<{ x: number; y: number; s?: number; petal?: string; glow?: number }> = ({ x, y, s = 1, petal = "#f49ab8", glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-20} r={70} fill="#ffe6a8" opacity={0.3 * glow} style={{ filter: "blur(10px)" }} />}
    <ellipse cx={0} cy={4} rx={60} ry={10} fill="#3f8a5a" stroke={INK} strokeWidth={1.6} />
    {[-60, -35, -12, 12, 35, 60].map((a, i) => (
      <path key={i} transform={`rotate(${a})`} d="M0,0 C-14,-20 -12,-44 0,-58 C12,-44 14,-20 0,0Z" fill={i % 2 ? petal : "#fbc6d6"} stroke={INK} strokeWidth={1.5} />
    ))}
    <path d="M0,0 C-12,-18 -10,-40 0,-52 C10,-40 12,-18 0,0Z" fill="#fde2ea" stroke={INK} strokeWidth={1.5} />
  </g>
);
