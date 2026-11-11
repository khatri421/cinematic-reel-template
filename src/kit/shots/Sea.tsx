import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Bird } from "../Bird";
import { Embers, GodRays, H, INK, LensFlare, StoneTexture, W } from "../fx";
import { FacetRock, Flock, Lanka, Sun, ToonCloud } from "../world";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);

const SeaSurface: React.FC<{ t: number; pan: number; horizon: number; sunX: number }> = ({ t, pan, horizon, sunX }) => (
  <g>
    <defs>
      <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d47a80" />
        <stop offset="0.08" stopColor="#8a4a8e" />
        <stop offset="0.4" stopColor="#3f2c86" />
        <stop offset="1" stopColor="#241a63" />
      </linearGradient>
      <linearGradient id="glitter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffd9b0" stopOpacity={0.7} />
        <stop offset="1" stopColor="#ffd9b0" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect x={0} y={horizon} width={W} height={H - horizon} fill="url(#seaG)" />
    {/* broad sun-glitter column */}
    <path d={`M${sunX - 30},${horizon} L${sunX + 30},${horizon} L${sunX + 260},${H} L${sunX - 260},${H}Z`} fill="url(#glitter)" opacity={0.35} style={{ filter: "blur(14px)" }} />
    {/* swell bands */}
    {Array.from({ length: 14 }).map((_, i) => {
      const k = (i + 1) / 15;
      const y = horizon + Math.pow(k, 1.7) * (H - horizon);
      const amp = 2 + k * 10;
      const off = (t * 30 * (0.3 + k) - pan * k * 0.4) % 200;
      let d = `M${-200 + off},${y}`;
      for (let x = -200; x < W + 200; x += 100) d += ` q25,${-amp} 50,0 t50,0`;
      return <path key={i} d={d} stroke="#1b1352" strokeWidth={1 + k * 3} fill="none" opacity={0.35} />;
    })}
    {Array.from({ length: 380 }).map((_, i) => {
      const dd = random("sd" + i);
      const y = horizon + 6 + Math.pow(dd, 1.6) * (H - horizon);
      const near = (y - horizon) / (H - horizon);
      const r0 = random("sx" + i) - 0.5;
      const around = i % 3 === 0 ? r0 : r0 * r0 * Math.sign(r0) * 1.4;
      const x = sunX + around * (120 + near * 900) - pan * near * 0.4 + Math.sin(t * 2 + i) * 4;
      const xx = (((x + 340) % 1400) + 1400) % 1400 - 340;
      const len = 8 + near * 70 * (0.5 + random("sl" + i));
      const nearSun = 1 - Math.min(1, Math.abs(around) * 2.2);
      const op = (0.25 + nearSun * 0.65) * (0.5 + 0.5 * Math.sin(t * 5 + i * 1.7));
      return <rect key={i} x={xx} y={y} width={len} height={1.5 + near * 3} rx={2} fill={nearSun > 0.6 ? "#fff3dc" : "#ffcfb0"} opacity={op} />;
    })}
  </g>
);

/* D 0-55   wide: Sampati alone on his island, lateral dolly   "Aur usi bina pankhon wale pakshi"
   E 55-110 pan continues, tilt to Lanka, rack-focus sea, flock passes close, bloom-out  "ne... Sita Maa ko dhoondh nikaala." */
export const ShotSea: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = (f + 114) / fps;
  const pan = interpolate(f, [0, 110], [0, 1300], { ...cl, easing: Easing.bezier(0.55, 0, 0.6, 1) });
  const tilt = interpolate(f, [55, 100], [0, 130], { ...cl, easing: ease });
  const push = interpolate(f, [55, 110], [1, 1.08], { ...cl, easing: ease });
  const horizon = 560 + tilt;
  const sunX = 815 - pan * 0.35;
  const sunY = 390 + tilt * 1.35;
  const seaBlur = interpolate(f, [60, 100], [0, 7], cl);
  const bloom = interpolate(f, [96, 110], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const rockX = 230 - pan * 0.5 - f * 0.4;
  const glint = interpolate(f, [60, 90], [0, 1], cl);
  const fore = interpolate(f, [70, 96], [-300, 1000], cl);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#8a5aa0 0%,#c06a9a 14%,#f08f9a 34%,#fdbf92 50%,#fdcb96 60%)" }} />
        <svg width={W} height={H} style={{ position: "absolute", filter: "blur(1px)" }}>
          <Sun cx={sunX} cy={sunY} r={210} id="ssun" glow={1 + bloom} />
          <ToonCloud x={60 - pan * 0.25} y={320} s={1.3} fill="#fdd39b" rim="#ffe8c8" outline="#e7a0c8" shade="#f0a28e" />
          <ToonCloud x={290 - pan * 0.25} y={410} s={1.0} fill="#fdd39b" rim="#ffe8c8" outline="#e7a0c8" shade="#f0a28e" />
          <ToonCloud x={1150 - pan * 0.25} y={300} s={1.1} fill="#fdd39b" rim="#ffe8c8" outline="#e7a0c8" />
          <ToonCloud x={1420 - pan * 0.25} y={440} s={0.8} fill="#fdd39b" rim="#ffe8c8" outline="#e7a0c8" />
          {/* distant islands */}
          <path d={`M${-80 - pan * 0.3},${horizon} q60,-30 120,-8 q40,-16 90,8Z`} fill="#c2647a" opacity={0.8} />
          <path d={`M${1500 - pan * 0.3},${horizon} q40,-22 90,-4 q30,-10 60,4Z`} fill="#c2647a" opacity={0.8} />
          <g transform={`translate(${sunX},${horizon - 4}) scale(0.9)`}><Lanka color="#f7996e" glint={glint} t={t} /></g>
          <rect x={0} y={horizon - 12} width={W} height={24} fill="#ffd0a0" opacity={0.75} style={{ filter: "blur(6px)" }} />
          <Flock t={t} x={60 - pan * 0.1} y={250 + tilt * 0.3} n={7} s={0.9} />
        </svg>
        <GodRays cx={sunX} cy={sunY} t={t} opacity={0.18 + bloom * 0.3} />
        <svg width={W} height={H} style={{ position: "absolute", filter: `blur(${seaBlur}px)` }}>
          <SeaSurface t={t} pan={pan} horizon={horizon} sunX={sunX} />
          <rect x={((300 - f * 9) % 900) + 200} y={1215} width={260} height={4} rx={2} fill="#ffe7c4" opacity={0.85} />
        </svg>

        {/* Sampati's island */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <defs><StoneTexture id="tex3" /></defs>
          <g transform={`translate(${rockX},${tilt})`}>
            {/* reflection */}
            <g transform="translate(0,2120) scale(1,-1)" opacity={0.28} style={{ filter: "blur(6px)" }}>
              <path d="M-200,1060 L-120,790 L-20,725 L60,715 L150,790 L230,960 L220,1000 L-40,1070Z" fill="#5a1d7a" />
            </g>
            <FacetRock textureId="tex3"
              outline="M-200,1060 L-120,790 L-20,725 L60,715 L150,790 L230,960 L220,1000 L-40,1070Z"
              facets={[
                { d: "M-200,1060 L-120,790 L-20,725 L-10,860 L-60,1066Z", fill: "#5b1980" },
                { d: "M-20,725 L60,715 L100,770 L-10,860Z", fill: "#8b3cb4" },
                { d: "M-10,860 L100,770 L150,790 L170,1020 L-60,1066Z", fill: "#6a2393" },
                { d: "M60,715 L150,790 L230,960 L220,1000 L170,900 L100,770Z", fill: "#d9744e" },
                { d: "M170,900 L220,1000 L170,1020Z", fill: "#8b3227" },
              ]}
              cracks={["M-100,820 l30,40 l-20,70", "M-30,760 l10,60 l40,50", "M40,800 l-20,60 l14,70"]}
              carving={[-70, 950, 0.9]}
              rimPath="M60,715 L150,790 L230,960" rimColor="#ffc890" />
            {/* foam ring */}
            {[0, 1, 2].map((k) => {
              const ph = ((t * 0.6 + k / 3) % 1);
              return <path key={k} d={`M${-210 - ph * 30},${1062 + ph * 14} Q0,${1090 + ph * 22} ${236 + ph * 30},${1000 + ph * 10}`} stroke="#d9c8ff" strokeWidth={3 - ph * 2} fill="none" opacity={(1 - ph) * 0.7} />;
            })}
            <ellipse cx={30} cy={718} rx={34} ry={5} fill="#1a0630" opacity={0.6} />
            <g transform="translate(-63,567)">
              <foreignObject x={0} y={0} width={190} height={170}>
                <div style={{ width: 190, height: 164 }}><Bird id="sSea" mode="burnt" t={t} eyes="sad" rim="#ffcf98" /></div>
              </foreignObject>
            </g>
          </g>
        </svg>
        <Embers t={t} n={14} />
        {/* a flock sweeps close past the lens: foreground depth */}
        <svg width={W} height={H} style={{ position: "absolute", filter: "blur(5px)" }}>
          {[0, 1, 2].map((i) => {
            const x = fore - i * 140, y = 420 + i * 70 + Math.sin(t * 3 + i) * 10;
            const fl = Math.sin(t * 10 + i) * 18;
            return <path key={i} d={`M${x - 60},${y - fl} Q${x - 25},${y - 14} ${x},${y} Q${x + 25},${y - 14} ${x + 60},${y - fl}`} stroke="#3a1a40" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />;
          })}
        </svg>
      </div>
      <LensFlare x={sunX} y={sunY} intensity={0.5 + bloom} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #fffaf0 0%, #fbf3dc 60%, #f6dfb8 100%)", opacity: bloom }} />
    </AbsoluteFill>
  );
};
void INK;
