import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Hanuman } from "../Hanuman";
import { Embers, GodRays, H, INK, LensFlare, Smoke, W } from "../fx";
import { BurningSkyline, Fire, lankaSky } from "../lankaWorld";
import { Sun } from "../world";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* E 0-82  low angle: Hanuman on the shikhara top, moon as a halo behind his head, the city burning below.
           He raises the gada on "Jai", slow push-in, fade out.               "Jai Shri Ram!" */
const HW = 600, HS = HW / 360, HX = 360 - HW / 2, HY = 1100 - 298 * HS;

export const ShotHero: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = f / fps + 11.6;
  const z = interpolate(f, [0, 82], [1.0, 1.12], { ...cl, easing: Easing.bezier(0.45, 0, 0.55, 1) });
  const layer = (d: number, blur = 0): React.CSSProperties => {
    const s = 1 + (z - 1) * d;
    return {
      position: "absolute", inset: 0, transformOrigin: "360px 820px", transform: `scale(${s}) translateY(${(1 - d) * (z - 1) * 260}px)`,
      filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
    };
  };
  const arm = interpolate(f, [2, 16], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  const rack = interpolate(f, [0, 7], [7, 0], cl);
  const fade = interpolate(f, [68, 82], [0, 1], cl);
  const moonX = 372, moonY = 800;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={lankaSky(1)} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 35%, rgba(255,80,30,0.4) 80%)", mixBlendMode: "screen" }} />
      <div style={layer(0.1, 1)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Sun cx={moonX} cy={moonY} r={250} id="hmoon" />
        </svg>
      </div>
      <GodRays cx={moonX} cy={moonY} t={t} opacity={0.32} count={14} color="#ffe6cc" />

      {/* burning city below (low angle -> skyline sits low) + smoke columns */}
      <div style={layer(0.3, 3.5)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Smoke x={120} y={1060} t={t} n={9} scale={2.6} color="#2a1424" seed="h1" />
          <Smoke x={600} y={1040} t={t + 1} n={9} scale={2.6} color="#2a1424" seed="h2" />
          <rect x={-400} y={1150} width={1600} height={400} fill="#30102f" />
          <g transform="translate(360,1170) scale(0.75)"><BurningSkyline burn={1} t={t} /></g>
        </svg>
      </div>

      {/* shikhara top Hanuman stands on */}
      <div style={layer(1, rack)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <path d="M140,1300 L230,1110 L490,1110 L580,1300Z" fill="#7a3470" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d="M360,1110 L490,1110 L580,1300 L360,1300Z" fill="#4a1a4a" />
          <path d="M210,1100 L510,1100 L520,1120 L200,1120Z" fill="#e8a630" stroke={INK} strokeWidth={2.5} />
          <rect x={196} y={1120} width={328} height={12} fill="#da7315" stroke={INK} strokeWidth={1.5} />
          <path d="M200,1129 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7 l7,7 l7,-7" stroke="#ffd98a" strokeWidth={1.2} fill="none" />
          <path d="M230,1110 L210,1100 M140,1300 L230,1110" stroke="#ffb067" strokeWidth={3} opacity={0.8} />
          <ellipse cx={366} cy={1102} rx={80} ry={9} fill="#1a0820" opacity={0.6} style={{ filter: "blur(2px)" }} />
        </svg>
        <div style={{ position: "absolute", left: HX, top: HY, width: HW, height: HW / (360 / 310) }}>
          <Hanuman id="hHero" t={t} fire={1} arm={arm} smile={0.9} rim="#fff0d8" />
        </div>
      </div>

      {/* foreground flames, very soft */}
      <div style={layer(1.5, 9)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Fire x={40} y={1330} w={220} s={2.2} t={t} seed="fg1" n={4} />
          <Fire x={700} y={1340} w={220} s={2.0} t={t} seed="fg2" n={4} />
        </svg>
      </div>

      <Embers t={t} n={55} color="#ffb24a" glow size={1.5} speed={1.4} seed="he" />
      <LensFlare x={moonX} y={moonY} intensity={0.6} tint="255,225,200" />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(170,30,10,0.45) 100%)" }} />
      <AbsoluteFill style={{ background: "#0b0410", opacity: fade }} />
    </AbsoluteFill>
  );
};
