import React from "react";
import { random } from "remotion";
import { INK, Smoke } from "./fx";
import { Lanka } from "./world";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Folk flame: ink-outlined red tongue, orange mid, pale core. Base at (x,y), grows upward. */
export const Flame: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number; outline?: boolean; glow?: number }> = ({ x, y, s = 1, t, seed = 0, outline = true, glow = 1 }) => {
  if (s <= 0.01) return null;
  const fl = 1 + 0.14 * Math.sin(t * 13 + seed) + 0.07 * Math.sin(t * 29 + seed * 2.3);
  const sw = Math.sin(t * 7 + seed * 1.7) * 6;
  const sw2 = Math.sin(t * 9 + seed) * 5;
  const shape = (k: number) =>
    `M${-22 * k},0 C${-28 * k},${-18 * k} ${(-18 + sw2) * k},${-30 * k} ${(-14 + sw2) * k},${-50 * k * fl} ` +
    `C${-6 * k},${-36 * k} ${-3 * k},${-40 * k} ${sw * k},${-74 * k * fl} ` +
    `C${6 * k},${-44 * k} ${10 * k},${-40 * k} ${(15 - sw2 * 0.6) * k},${-56 * k * fl} ` +
    `C${20 * k},${-34 * k} ${30 * k},${-20 * k} ${22 * k},0 C${12 * k},${8 * k} ${-12 * k},${8 * k} ${-22 * k},0Z`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {glow > 0 && <circle cx={0} cy={-26} r={62} fill="#ff7a2a" opacity={0.22 * fl * glow} />}
      <path d={shape(1)} fill="#f0401c" stroke={outline ? INK : "none"} strokeWidth={1.8} strokeLinejoin="round" />
      <path d={shape(0.72)} fill="#ff9a2a" />
      <path d={shape(0.42)} fill="#ffe08a" />
    </g>
  );
};

/** A row of flames along width w. */
export const Fire: React.FC<{ x: number; y: number; w: number; s: number; t: number; seed: string; n?: number }> = ({ x, y, w, s, t, seed, n = 4 }) => {
  if (s <= 0.01) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const k = n === 1 ? 0.5 : i / (n - 1);
        const r = random(seed + i);
        return <Flame key={i} x={x + (k - 0.5) * w} y={y + r * 4} s={s * (0.6 + r * 0.6) * (1 - Math.abs(k - 0.5) * 0.5)} t={t} seed={i * 3.1 + r * 10} glow={0.7} />;
      })}
    </g>
  );
};

export type PalaceColors = { top: string; mid: string; dark: string; gold: string; goldDark: string };
export const NIGHT_PALACE: PalaceColors = { top: "#b45a86", mid: "#7a3470", dark: "#4a1a4a", gold: "#e8a630", goldDark: "#a8661a" };

/** Mid-ground Lanka palace: arched block, upper tier, onion dome, chhatris. Base centre at (x,y). */
export const Palace: React.FC<{ x: number; y: number; s?: number; burn?: number; t: number; seed?: string; c?: PalaceColors; flip?: boolean }> = ({ x, y, s = 1, burn = 0, t, seed = "p", c = NIGHT_PALACE, flip }) => {
  const fireAt = (th: number) => clamp01((burn - th) * 3);
  const win = (i: number) => clamp01((burn - 0.1 - i * 0.08) * 4);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {/* block */}
      <path d="M-90,0 L-90,-90 L90,-90 L90,0Z" fill={c.mid} stroke={INK} strokeWidth={2} />
      <path d="M90,0 L90,-90 L118,-102 L118,-12Z" fill={c.dark} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M-90,-90 L-62,-102 L118,-102 L90,-90Z" fill={c.top} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <rect x={-90} y={-84} width={180} height={9} fill="#da7315" stroke={INK} strokeWidth={1.2} />
      <path d="M-88,-77 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5" stroke="#ffd98a" strokeWidth={1} fill="none" />
      <rect x={-90} y={-75} width={180} height={2.5} fill={c.gold} />
      {[-66, -22, 22, 66].map((ax, i) => (
        <g key={ax}>
          <path d={`M${ax - 13},-6 L${ax - 13},-48 Q${ax},-66 ${ax + 13},-48 L${ax + 13},-6Z`} fill="#24102c" stroke={INK} strokeWidth={1.6} />
          <path d={`M${ax - 13},-6 L${ax - 13},-48 Q${ax},-66 ${ax + 13},-48 L${ax + 13},-6Z`} fill="#ffb347" opacity={win(i)} />
          <path d={`M${ax - 9},-10 L${ax - 9},-46`} stroke="#ffe7a1" strokeWidth={2} opacity={win(i) * 0.8} />
        </g>
      ))}
      {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={-82 + i * 15} cy={-3} r={1.4} fill="#eecbe0" opacity={0.6} />)}
      {/* upper tier */}
      <path d="M-55,-96 L-55,-150 L55,-150 L55,-96Z" fill={c.mid} stroke={INK} strokeWidth={2} />
      <path d="M55,-96 L55,-150 L72,-158 L72,-104Z" fill={c.dark} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M-55,-150 L-38,-158 L72,-158 L55,-150Z" fill={c.top} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {[-30, 0, 30].map((ax) => <path key={ax} d={`M${ax - 8},-104 L${ax - 8},-128 Q${ax},-140 ${ax + 8},-128 L${ax + 8},-104Z`} fill="#24102c" stroke={INK} strokeWidth={1.3} />)}
      {[-30, 0, 30].map((ax, i) => <path key={"w" + ax} d={`M${ax - 8},-104 L${ax - 8},-128 Q${ax},-140 ${ax + 8},-128 L${ax + 8},-104Z`} fill="#ffb347" opacity={win(i + 1)} />)}
      {/* onion dome */}
      <path d="M-38,-158 C-46,-190 -16,-206 8,-234 C32,-206 62,-190 54,-158Z" fill={c.gold} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M8,-234 C32,-206 62,-190 54,-158 L8,-158Z" fill={c.goldDark} opacity={0.55} />
      <path d="M-28,-170 C-30,-190 -12,-202 2,-218" stroke="#fff4b0" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M-34,-166 Q8,-156 50,-166" stroke={INK} strokeWidth={1.2} fill="none" opacity={0.5} />
      <path d="M8,-234 L8,-258" stroke={INK} strokeWidth={2} />
      <circle cx={8} cy={-246} r={4} fill={c.gold} stroke={INK} strokeWidth={1.2} />
      <circle cx={8} cy={-260} r={2.6} fill={c.gold} stroke={INK} strokeWidth={1} />
      {/* chhatris */}
      {[[-74, -102], [102, -108]].map(([cx, cy], i) => (
        <g key={i}>
          <rect x={cx - 10} y={cy - 18} width={20} height={18} fill={c.mid} stroke={INK} strokeWidth={1.4} />
          <path d={`M${cx - 14},${cy - 18} Q${cx},${cy - 44} ${cx + 14},${cy - 18}Z`} fill={c.gold} stroke={INK} strokeWidth={1.4} />
          <path d={`M${cx},${cy - 36} l0,-8`} stroke={INK} strokeWidth={1.4} />
        </g>
      ))}
      {/* fire rim on edges facing the blaze */}
      {burn > 0.05 && <path d="M-90,-90 L-62,-102 L118,-102 M-55,-150 L-38,-158 L72,-158" stroke="#ffb067" strokeWidth={3} fill="none" opacity={clamp01(burn * 1.5) * 0.8} />}
      {/* smoke + flames */}
      {burn > 0.15 && <Smoke x={8} y={-250} t={t} n={7} scale={0.9 + burn * 0.8} color="#2a1424" seed={seed + "sm"} />}
      <Fire x={-74} y={-128} w={30} s={0.55 * fireAt(0.1)} t={t} seed={seed + "a"} n={2} />
      <Fire x={102} y={-134} w={30} s={0.55 * fireAt(0.22)} t={t} seed={seed + "b"} n={2} />
      <Fire x={8} y={-168} w={90} s={0.8 * fireAt(0.35)} t={t} seed={seed + "c"} n={4} />
      <Fire x={0} y={-100} w={160} s={0.7 * fireAt(0.5)} t={t} seed={seed + "d"} n={5} />
    </g>
  );
};

/** Far Lanka skyline (silhouette) with fires that spread with `burn`. Centred x=0, base y=0. */
const SKY_FIRES: [number, number, number][] = [
  [-300, -96, 0.0], [75, -128, 0.08], [-150, -182, 0.16], [235, -126, 0.24], [0, -250, 0.3],
  [-235, -126, 0.38], [300, -96, 0.46], [150, -182, 0.52], [-75, -128, 0.6], [-380, -30, 0.66], [380, -30, 0.72], [0, -60, 0.8],
];
export const BurningSkyline: React.FC<{ burn: number; t: number; color?: string; glint?: number }> = ({ burn, t, color = "#4a1846", glint = 0 }) => (
  <g>
    <Lanka color={color} glint={glint} t={t} />
    {burn > 0.1 && <path d="M-420,0 L-400,-30 L400,-30 L420,0Z" fill="#ff7a2a" opacity={clamp01(burn - 0.1) * 0.35} />}
    {SKY_FIRES.map(([x, y, th], i) => {
      const k = clamp01((burn - th) * 3.5);
      return k > 0.01 ? (
        <g key={i}>
          <Smoke x={x} y={y - 40} t={t + i * 0.37} n={6} scale={1.2 + k} color="#2a1424" seed={"ss" + i} />
          <Fire x={x} y={y} w={40} s={k * 0.75} t={t} seed={"sf" + i} n={3} />
        </g>
      ) : null;
    })}
  </g>
);

/** Night-dusk sky that reddens as Lanka burns. */
export const lankaSky = (burn: number): React.CSSProperties => ({
  position: "absolute", inset: 0,
  background: "linear-gradient(180deg,#1d1340 0%,#3a1a5a 18%,#7a2a64 40%,#c8445a 62%,#f27a3e 82%,#ffb257 100%)",
  boxShadow: `inset 0 -600px 400px -200px rgba(255,90,30,${0.45 * clamp01(burn)})`,
});
