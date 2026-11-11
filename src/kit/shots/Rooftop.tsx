import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HEAD_C, Hanuman, TAIL_TIP } from "../Hanuman";
import { Embers, GodRays, H, INK, LensFlare, Smoke, StoneTexture, W } from "../fx";
import { BurningSkyline, Flame, lankaSky, Palace } from "../lankaWorld";
import { Diya, Flag, Sun, ToonCloud } from "../world";

const ease = Easing.bezier(0.45, 0, 0.55, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Cam = { z: number; fx: number; fy: number; tx: number; ty: number };
const lerpCam = (f: number, a: number, b: number, c0: Cam, c1: Cam): Cam => {
  const k = interpolate(f, [a, b], [0, 1], { ...cl, easing: ease });
  const m = (x: number, y: number) => x + (y - x) * k;
  return { z: m(c0.z, c1.z), fx: m(c0.fx, c1.fx), fy: m(c0.fy, c1.fy), tx: m(c0.tx, c1.tx), ty: m(c0.ty, c1.ty) };
};

// Hanuman placement on the hero roof (d=1): width 320, feet on the parapet at y=1000.
const HW = 320, HH = HW / (360 / 310), HS = HW / 360, HX = 360 - HW / 2, HY = 1000 - 298 * HS;
const vb = (x: number, y: number) => [HX + (x + 80) * HS, HY + (y + 10) * HS];
const [tailX, tailY] = vb(TAIL_TIP[0], TAIL_TIP[1]);
const [headX, headY] = vb(HEAD_C[0], HEAD_C[1]);

/* One set, three setups:
   A 0-53   insert: tail tip, the fire catches on "aag"     "Ravan ne / poonch mein aag"
   M 53-82  medium: Hanuman with the burning tail            "laga di..."
   B 82-130 close-up: he smiles                              "Hanuman ji / muskuraye."   */
const camera = (f: number): Cam => {
  if (f < 53) return lerpCam(f, 0, 53, { z: 3.6, fx: tailX, fy: tailY - 20, tx: 380, ty: 760 }, { z: 4.1, fx: tailX, fy: tailY - 20, tx: 380, ty: 740 });
  if (f < 82) return lerpCam(f, 53, 82, { z: 1.45, fx: 340, fy: 860, tx: 360, ty: 790 }, { z: 1.65, fx: 340, fy: 860, tx: 360, ty: 770 });
  return lerpCam(f, 82, 130, { z: 3.2, fx: headX, fy: headY, tx: 320, ty: 720 }, { z: 3.65, fx: headX, fy: headY, tx: 320, ty: 705 });
};

export const ShotRooftop: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cam = camera(f);
  const shotA = f < 53, shotB = f >= 82;
  const layer = (d: number, blur = 0): React.CSSProperties => {
    const s = 1 + (cam.z - 1) * d;
    const tx = cam.fx + (cam.tx - cam.fx) * d, ty = cam.fy + (cam.ty - cam.fy) * d;
    return {
      position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
      transform: `translate(${tx - cam.fx * s}px, ${ty - cam.fy * s}px) scale(${s})`,
      filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
    };
  };
  const toScreen = (x: number, y: number, d: number) => {
    const s = 1 + (cam.z - 1) * d;
    return [cam.fx + (cam.tx - cam.fx) * d + (x - cam.fx) * s, cam.fy + (cam.ty - cam.fy) * d + (y - cam.fy) * s];
  };
  const dof = 1.2 + (cam.z - 1) * 2.4;
  const rack = shotA ? interpolate(f, [0, 8], [8, 0], cl) : shotB ? interpolate(f, [82, 88], [6, 0], cl) : interpolate(f, [53, 59], [5, 0], cl);
  // fire catches on "aag" (≈1.55 s = f37)
  const fire = interpolate(f, [30, 44], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const flash = interpolate(f, [36, 38, 42], [0, 0.55, 0], cl);
  const smile = shotB ? interpolate(f, [92, 108], [0.2, 1], cl) : 0.25;
  const [mx, my] = toScreen(240, 470, 0.12);
  const fadeIn = interpolate(f, [0, 12], [1, 0], cl);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={lankaSky(0)} />
      {/* moon + clouds (key light) */}
      <div style={layer(0.12, dof * 0.55)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Sun cx={240} cy={470} r={200} id="rmoon" />
          <ToonCloud x={520 + t * 3} y={380} s={1.2} fill="#c26a92" rim="#f0a0b8" outline="#7a3a72" shade="#8a3a72" />
          <ToonCloud x={90 - t * 2} y={620} s={0.8} fill="#d0789a" rim="#f6b0c0" outline="#7a3a72" />
        </svg>
      </div>
      <GodRays cx={mx} cy={my} t={t} opacity={0.22} color="#ffe6d0" />

      {/* far Lanka skyline */}
      <div style={layer(0.3, dof)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <rect x={-400} y={880} width={1600} height={600} fill="#3a1440" />
          <g transform="translate(380,890) scale(0.9)"><BurningSkyline burn={0} t={t} glint={0.8} /></g>
        </svg>
      </div>

      {/* mid palaces */}
      <div style={layer(0.55, dof * 0.8)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Palace x={90} y={1010} s={0.8} t={t} seed="r1" />
          <Palace x={640} y={990} s={0.7} t={t} seed="r2" flip />
          <Flag x={600} y={760} t={t} s={0.6} />
        </svg>
      </div>

      {/* hero roof terrace + Hanuman */}
      <div style={layer(1, rack)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <defs>
            <StoneTexture id="rtex" />
            <linearGradient id="rCast" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1a0820" stopOpacity={0.55} /><stop offset="1" stopColor="#1a0820" stopOpacity={0} /></linearGradient>
          </defs>
          <path d="M-200,1000 L920,1000 L920,1500 L-200,1500Z" fill="#6a2a5e" />
          <path d="M-200,1000 L920,1000 L920,1030 L-200,1030Z" fill="#b45a86" stroke={INK} strokeWidth={2.5} />
          <rect x={-200} y={1030} width={1120} height={12} fill="#da7315" stroke={INK} strokeWidth={1.5} />
          <path d="M-200,1040 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8" stroke="#ffd98a" strokeWidth={1.2} fill="none" />
          {[-60, 60, 180, 300, 420, 540, 660, 780].map((x) => (
            <g key={x}>
              <path d={`M${x},1060 a26,26 0 1,1 52,0 a26,26 0 1,1 -52,0`} stroke="#3e1236" strokeWidth={2} fill="none" opacity={0.6} />
              <path d={`M${x + 10},1060 a16,16 0 1,1 32,0`} stroke="#3e1236" strokeWidth={2} fill="none" opacity={0.6} />
            </g>
          ))}
          <path d="M-200,1000 L920,1500" fill="none" />
          <path d="M-200,1000 L-200,1500 L920,1500 L920,1000Z" fill="#1a0820" opacity={0.25} filter="url(#rtex)" />
          {/* contact + cast shadow (moon is upper-left -> shadow to the right) */}
          <ellipse cx={366} cy={1003} rx={62} ry={8} fill="#1a0820" opacity={0.6} style={{ filter: "blur(2px)" }} />
          <path d="M330,1002 L420,1002 L560,1024 L460,1026Z" fill="url(#rCast)" style={{ filter: "blur(5px)" }} />
          <Diya x={110} y={1004} t={t} i={0} />
          <Diya x={620} y={1004} t={t} i={1} />
        </svg>
        <div style={{ position: "absolute", left: HX, top: HY, width: HW, height: HH }}>
          <Hanuman id="hRoof" t={t} fire={fire} smile={smile} rim="#ffd0a0" />
        </div>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {fire > 0.3 && <Smoke x={tailX} y={tailY - 50} t={t} n={8} scale={0.5} color="#2a1424" seed="tail" />}
        </svg>
      </div>

      {/* foreground torch, very soft */}
      <div style={layer(1.6, 10 + cam.z * 2)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <path d="M600,1420 L640,1180 L760,1160 L800,1420Z" fill="#2a0c2a" />
          <Flame x={690} y={1170} s={1.4} t={t} seed={3} />
        </svg>
      </div>

      <Embers t={t} n={fire > 0.5 ? 34 : 18} color="#ffb35a" glow size={shotA ? 1.6 : 1} seed="re" />
      <LensFlare x={mx} y={my} intensity={shotA ? 0.25 : 0.55} tint="255,225,200" />
      {shotA && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(255,120,40,0.25), transparent 60%)", mixBlendMode: "screen", opacity: fire }} />}
      <AbsoluteFill style={{ background: "#fff2d0", opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#0b0410", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};
