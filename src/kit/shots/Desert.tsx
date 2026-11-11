import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bird } from "../Bird";
import { Embers, GodRays, H, HeatFilter, INK, LensFlare, Smoke, StoneTexture, W } from "../fx";
import { Diya, FacetRock, Flag, Flock, Pillar, Sun, ToonCloud } from "../world";

const ease = Easing.bezier(0.45, 0, 0.55, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Cam = { z: number; fx: number; fy: number; tx: number; ty: number };
const lerpCam = (f: number, a: number, b: number, c0: Cam, c1: Cam): Cam => {
  const k = interpolate(f, [a, b], [0, 1], { ...cl, easing: ease });
  const m = (x: number, y: number) => x + (y - x) * k;
  return { z: m(c0.z, c1.z), fx: m(c0.fx, c1.fx), fy: m(c0.fy, c1.fy), tx: m(c0.tx, c1.tx), ty: m(c0.ty, c1.ty) };
};

/* Three camera setups on ONE set:
   A 0-54   wide establishing tilt-down + push    "Jatayu ka ek bhai tha..."
   B 54-90  extreme close-up insert: burnt wing   "jiske pankh suraj"
   C 90-114 close-up: face, tear falls            "ne jala diye."           */
const camera = (f: number): Cam => {
  if (f < 54) return lerpCam(f, 0, 54, { z: 1.0, fx: 360, fy: 700, tx: 360, ty: 1010 }, { z: 1.55, fx: 360, fy: 820, tx: 360, ty: 790 });
  if (f < 90) return lerpCam(f, 54, 90, { z: 4.3, fx: 300, fy: 826, tx: 440, ty: 700 }, { z: 4.75, fx: 306, fy: 830, tx: 420, ty: 690 });
  return lerpCam(f, 90, 114, { z: 3.5, fx: 362, fy: 760, tx: 360, ty: 720 }, { z: 4.05, fx: 364, fy: 752, tx: 360, ty: 690 });
};

export const ShotDesert: React.FC<{ speed?: number; start?: number }> = ({ speed = 1, start = 0 }) => {
  const f = useCurrentFrame() * speed + start;
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cam = camera(f);
  const shotB = f >= 54 && f < 90, shotC = f >= 90;
  const shake = shotB ? Math.sin(f * 1.7) * 1.2 : 0;
  const layer = (d: number, blur = 0, extra = ""): React.CSSProperties => {
    const s = 1 + (cam.z - 1) * d;
    const tx = cam.fx + (cam.tx - cam.fx) * d, ty = cam.fy + (cam.ty - cam.fy) * d;
    return {
      position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
      transform: `translate(${tx - cam.fx * s + shake}px, ${ty - cam.fy * s}px) scale(${s})`,
      filter: blur > 0.15 || extra ? `${extra} blur(${blur}px)` : undefined,
    };
  };
  const toScreen = (x: number, y: number, d: number) => {
    const s = 1 + (cam.z - 1) * d;
    return [cam.fx + (cam.tx - cam.fx) * d + (x - cam.fx) * s, cam.fy + (cam.ty - cam.fy) * d + (y - cam.fy) * s];
  };
  const dof = 1.2 + (cam.z - 1) * 2.4;
  const rack = shotB ? interpolate(f, [54, 62], [9, 0], cl) : shotC ? interpolate(f, [90, 95], [5, 0], cl) : 0;
  const tear = interpolate(f, [93, 114], [0, 1], cl);
  const fadeIn = interpolate(f, [0, 20], [1, 0], cl);
  const [sx, sy] = toScreen(440, 470, 0.12);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <HeatFilter frame={f} scale={5} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#9c4f95 0%,#c9659f 10%,#dd7daf 22%,#f78d96 40%,#ffb07a 58%,#ff9a45 78%)" }} />

      {/* far: sun + clouds */}
      <div style={layer(0.12, dof * 0.55)}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <Sun cx={440} cy={470} r={235} id="dsun" />
          <ToonCloud x={110 + t * 3} y={400} s={1.5} fill="#ffd2ad" rim="#ffeacf" outline="#f0a3b8" shade="#f2a59a" />
          <ToonCloud x={300 + t * 2} y={455} s={0.9} fill="#ffcfa6" rim="#ffe4c6" outline="#f0a3b8" />
          <ToonCloud x={690 - t * 2} y={330} s={0.7} fill="#ffcfa6" rim="#ffe4c6" outline="#f0a3b8" />
        </svg>
      </div>
      <GodRays cx={sx} cy={sy} t={t} opacity={0.2} />

      {/* distant mesas + flocks */}
      <div style={layer(0.22, dof * 0.9, "url(#heat)")}>
        <svg width={W} height={H}>
          <path d="M-40,760 L60,700 L140,705 L170,740 L260,735 L300,770 L-40,800Z" fill="#f59d62" opacity={0.75} />
          <path d="M480,760 L540,690 L560,640 L575,690 L640,720 L760,730 L760,800 L480,800Z" fill="#f7a467" opacity={0.7} />
          <Flock t={t} x={10} y={560} n={3} />
          <Flock t={t} x={250} y={600} n={2} s={0.8} />
        </svg>
      </div>

      {/* pyramids: two-tone lit/shadow with block courses */}
      <div style={layer(0.32, dof, "url(#heat)")}>
        <svg width={W} height={H}>
          <path d="M-60,980 L170,440 L300,980Z" fill="#f08a2c" />
          <path d="M170,440 L760,700 L760,980 L300,980Z" fill="#ffae55" />
          {Array.from({ length: 12 }).map((_, i) => {
            const k = (i + 1) / 13;
            const lx = 170 + (-60 - 170) * k, ly = 440 + (980 - 440) * k;
            const mx = 170 + (300 - 170) * k, my = ly;
            const rx = 170 + (760 - 170) * k, ry = 440 + (700 - 440) * k;
            return <path key={i} d={`M${lx},${ly} L${mx},${my} L${rx},${ry}`} stroke="#d9701f" strokeWidth={1.4} fill="none" opacity={0.35} />;
          })}
          <path d="M170,440 L300,980" stroke="#fff0c8" strokeWidth={3} opacity={0.55} />
          <path d="M-80,1000 L40,640 L120,1000Z" fill="#e47a22" />
          <path d="M40,640 L330,880 L330,1000 L120,1000Z" fill="#fc9a35" />
          <path d="M40,640 L120,1000" stroke="#ffe0a8" strokeWidth={2.5} opacity={0.5} />
        </svg>
      </div>

      {/* desert floor, horizon glow, ruins, flag */}
      <div style={layer(0.45, dof * 0.75)}>
        <svg width={W} height={H}>
          <defs>
            <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff9d45" /><stop offset="0.12" stopColor="#ee8656" /><stop offset="1" stopColor="#b9506a" />
            </linearGradient>
          </defs>
          <rect x={-300} y={872} width={1300} height={600} fill="url(#floorG)" />
          <rect x={-300} y={866} width={1300} height={14} fill="#ffd28a" opacity={0.8} style={{ filter: "blur(4px)" }} />
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M-100,${905 + i * 22} Q200,${895 + i * 22} 400,${908 + i * 22} T900,${902 + i * 22}`} stroke="#ffb38a" strokeWidth={1.4} fill="none" opacity={0.35} />
          ))}
          <Pillar x={590} y={890} h={120} s={0.55} lit="#e98c5a" dark="#b3584a" />
          <Pillar x={640} y={893} h={90} s={0.55} broken />
          <Pillar x={690} y={890} h={130} s={0.55} />
          <path d="M575,826 L705,826 L705,836 L575,836Z" fill="#b3584a" stroke={INK} strokeWidth={1} />
          <Flag x={520} y={780} t={t} s={0.6} />
        </svg>
      </div>

      {/* right rock + diyas */}
      <div style={layer(0.75, Math.max(0, dof - 2.2) * 0.8)}>
        <svg width={W} height={H}>
          <defs><StoneTexture id="tex2" /></defs>
          <FacetRock textureId="tex2"
            outline="M560,1300 L590,1060 L680,1000 L790,1020 L800,1300Z"
            facets={[{ d: "M560,1300 L590,1060 L680,1000 L790,1020 L800,1300Z", fill: "#9c3a5c" }, { d: "M590,1060 L680,1000 L790,1020 L700,1080Z", fill: "#c8608a" }]}
            cracks={["M620,1080 l20,40 l-10,40", "M700,1090 l-15,50 l20,30"]}
            rimPath="M590,1060 L680,1000 L790,1020" />
          <Diya x={640} y={1004} s={0.85} t={t} i={1} />
          <Diya x={722} y={990} s={0.85} t={t} i={2} />
        </svg>
      </div>

      {/* hero rock + Sampati */}
      <div style={layer(1, rack)}>
        <svg width={W} height={H}>
          <defs>
            <StoneTexture id="tex1" />
            <linearGradient id="castSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0a2a" stopOpacity={0.55} /><stop offset="1" stopColor="#2a0a2a" stopOpacity={0} /></linearGradient>
          </defs>
          <FacetRock textureId="tex1"
            outline="M-40,1300 L20,1010 L110,950 L300,905 L430,912 L560,1010 L620,1300Z"
            facets={[
              { d: "M-40,1300 L20,1010 L110,950 L200,1010 L150,1300Z", fill: "#86304f" },
              { d: "M110,950 L300,905 L430,912 L380,990 L200,1010Z", fill: "#c75d84" },
              { d: "M200,1010 L380,990 L450,1300 L150,1300Z", fill: "#a6436b" },
              { d: "M380,990 L430,912 L560,1010 L620,1300 L450,1300Z", fill: "#94385a" },
              { d: "M430,912 L560,1010 L590,1090 L470,962Z", fill: "#f0904a" },
            ]}
            cracks={["M200,930 l8,40 l-10,45 l14,55 l-6,60", "M262,945 l-8,40 l10,45 l-14,55", "M330,940 l8,40 l-10,45 l14,55 l-6,60 M338,980 l22,30", "M120,985 l-8,40 l10,45 l-14,55", "M420,960 l8,40 l-10,45 l14,55"]}
            carving={[262, 1150, 1.3]}
            rimPath="M300,905 L430,912 L560,1010" rimColor="#ffc58a" />
          {/* contact + cast shadow of Sampati */}
          <ellipse cx={356} cy={914} rx={58} ry={8} fill="#2a0a2a" opacity={0.55} style={{ filter: "blur(2px)" }} />
          <path d="M310,912 L400,912 L330,1010 L230,1010Z" fill="url(#castSh)" opacity={0.6} style={{ filter: "blur(5px)" }} />
          <Diya x={110} y={1252} s={1} t={t} i={0} />
        </svg>
        <div style={{ position: "absolute", left: 360 - 135, top: 912 - 222, width: 270, height: 233 }}>
          <Bird id="sDesert" mode="burnt" t={t} tear={tear} eyes={shotC ? "sad" : "open"} rim="#ffd29a" />
        </div>
        {/* smoke from scorched wing stubs */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <Smoke x={292} y={835} t={t} n={9} scale={0.45} color="#3a2430" seed="wl" />
          <Smoke x={428} y={835} t={t + 0.7} n={9} scale={0.45} color="#3a2430" seed="wr" />
        </svg>
      </div>

      {/* foreground framing chunk (very near, very soft) */}
      <div style={layer(1.6, 9 + cam.z * 2)}>
        <svg width={W} height={H}>
          <path d="M-120,1420 L-80,1170 L40,1200 L120,1300 L150,1420Z" fill="#3e1236" />
        </svg>
      </div>

      <Embers t={t} n={shotB ? 40 : 26} color={shotB ? "#ffb35a" : "#fff1c8"} glow={shotB} size={shotB ? 1.6 : 1} seed={shotB ? "eb" : "e"} />
      <LensFlare x={sx} y={sy} intensity={shotA(f) ? 0.8 : 0.35} />
      {shotB && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 55%, rgba(255,120,40,0.18), transparent 60%)", mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "#0b0410", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};
const shotA = (f: number) => f < 54;
