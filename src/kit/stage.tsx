import React, { createContext, useContext } from "react";
import { Easing, interpolate } from "remotion";
import { Embers, GodRays, H, LensFlare, W } from "./fx";
import { Sun } from "./world";

/* ============================================================================================
   STAGE = the 2.5D camera. Every scene is drawn in a 720 x 1280 world (the reel scales it to 1080 x 1920).
   Put each part of the world in a <Layer d={depth}>:
     d = 0.05-0.15  sky, sun/moon, far clouds        (moves least, very soft)
     d = 0.25-0.4   far city / mountains / sea horizon
     d = 0.5-0.7    mid buildings, trees
     d = 1          the subject: characters + the ground they stand on   (sharp)
     d = 1.4-1.8    foreground things passing close to the lens            (big + very blurred)
   Camera keys use k = 0..1 = fraction of the scene, so a scene keeps its move whatever the voice length:
     cam={[{ k: 0, z: 1, x: 360, y: 700 }, { k: 1, z: 1.25, x: 380, y: 760 }]}
     z = zoom on the subject layer, (x, y) = the world point that sits at the screen centre-ish target (tx, ty).
   Depth of field is automatic: layers far from `focus` (default 1) blur more as the camera zooms in, and every
   scene starts with a short rack focus (blur -> sharp in ~0.25 s).
   ============================================================================================ */

export type CamKey = { k: number; z: number; x: number; y: number; tx?: number; ty?: number };
type Cam = { z: number; x: number; y: number; tx: number; ty: number; sx: number; sy: number };
const CamCtx = createContext<{ cam: Cam; focus: number; dof: number; rack: number }>({
  cam: { z: 1, x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, sx: 0, sy: 0 }, focus: 1, dof: 1, rack: 0,
});
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.45, 0, 0.55, 1);

/** Camera at fraction p (0..1) of the scene. Zoom interpolates in log space (constant-feeling speed). */
export const camAt = (keys: CamKey[], p: number): Omit<Cam, "sx" | "sy"> => {
  const fill = (c: CamKey) => ({ z: c.z, x: c.x, y: c.y, tx: c.tx ?? W / 2, ty: c.ty ?? H * 0.56 });
  if (p <= keys[0].k) return fill(keys[0]);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (p <= b.k) {
      const e = EASE(Math.min(1, Math.max(0, (p - a.k) / Math.max(1e-3, b.k - a.k))));
      const A = fill(a), B = fill(b), m = (u: number, v: number) => u + (v - u) * e;
      return { z: Math.exp(m(Math.log(A.z), Math.log(B.z))), x: m(A.x, B.x), y: m(A.y, B.y), tx: m(A.tx, B.tx), ty: m(A.ty, B.ty) };
    }
  }
  return fill(keys[keys.length - 1]);
};

export type StageProps = {
  lt: number; dur: number; cam: CamKey[];
  t?: number;          // reel time (pass ctx.t) so particles and flicker do not restart at every cut
  focus?: number;      // which depth is sharp (default 1 = the characters)
  dof?: number;        // depth-of-field strength (0 = off, 1 = normal, 2 = dreamy)
  rack?: boolean;      // rack-focus at the start of the scene (default true)
  shake?: number;      // camera shake in px (impacts, earthquakes); animate it yourself
  light?: Light;       // draws sky + key light + god rays + flare + embers for you
  children: React.ReactNode;
};

export const Stage: React.FC<StageProps> = ({ lt, dur, cam, t, focus = 1, dof = 1, rack = true, shake = 0, light, children }) => {
  const tt = t ?? lt;
  const c = camAt(cam, Math.min(1, lt / Math.max(0.01, dur)));
  const r = rack ? interpolate(lt, [0, 0.28], [7, 0], { ...cl, easing: Easing.out(Easing.quad) }) : 0;
  const ctx = { cam: { ...c, sx: Math.sin(lt * 47) * shake, sy: Math.cos(lt * 39) * shake * 0.6 }, focus, dof, rack: r };
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden" }}>
      <CamCtx.Provider value={ctx}>
        {light && <SkyBack light={light} />}
        {light && <KeyLight light={light} t={tt} />}
        {children}
        {light && <LightFront light={light} t={tt} />}
      </CamCtx.Provider>
    </div>
  );
};

/** One depth layer of the world. Children are SVG unless `html` (then plain divs, e.g. a character box). */
export const Layer: React.FC<{ d: number; blur?: number; html?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, blur, html, children, style }) => {
  const { cam, focus, dof, rack } = useContext(CamCtx);
  const s = 1 + (cam.z - 1) * d;
  const tx = cam.x + (cam.tx - cam.x) * d, ty = cam.y + (cam.ty - cam.y) * d;
  const auto = dof * Math.abs(d - focus) * (1.4 + (cam.z - 1) * 3.2) * (d > focus ? 3.2 : 1);
  const b = (blur ?? auto) + (Math.abs(d - focus) < 0.05 ? rack : rack * 0.4);
  const st: React.CSSProperties = {
    position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
    transform: `translate(${tx - cam.x * s + cam.sx * d}px, ${ty - cam.y * s + cam.sy * d}px) scale(${s})`,
    filter: b > 0.15 ? `blur(${b.toFixed(2)}px)` : undefined, ...style,
  };
  return <div style={st}>{html ? children : <svg width={W} height={H} style={{ overflow: "visible", position: "absolute", left: 0, top: 0 }}>{children}</svg>}</div>;
};

/** Where a world point on depth d lands on screen (to aim god rays, flares, captions-safe checks). */
export const useToScreen = () => {
  const { cam } = useContext(CamCtx);
  return (x: number, y: number, d: number): [number, number] => {
    const s = 1 + (cam.z - 1) * d;
    return [cam.x + (cam.tx - cam.x) * d + (x - cam.x) * s, cam.y + (cam.ty - cam.y) * d + (y - cam.y) * s];
  };
};

/** Character box on a layer: feet at (x, feetY), width w (realistic figure is ~0.3 w wide, ~0.8 w tall). */
export const Place: React.FC<{ x: number; feetY: number; w: number; flip?: boolean; children: React.ReactNode }> = ({ x, feetY, w, flip, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: feetY - 298 * (w / 360), width: w, height: w / (360 / 310), transform: flip ? "scaleX(-1)" : undefined }}>{children}</div>
);

/** Contact shadow + soft cast shadow away from the light (put it on the same layer, before the character). */
export const GroundShadow: React.FC<{ x: number; y: number; w: number; lightX?: number }> = ({ x, y, w, lightX = 0 }) => {
  const dir = lightX < x ? 1 : -1, rx = w * 0.18;
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={rx} ry={rx * 0.14} fill="#140818" opacity={0.6} style={{ filter: "blur(2px)" }} />
      <path d={`M${x - rx * 0.6},${y + 1} L${x + rx * 0.6},${y + 1} L${x + dir * rx * 3.4},${y + rx * 0.5} L${x + dir * rx * 1.8},${y + rx * 0.55}Z`} fill="#140818" opacity={0.3} style={{ filter: "blur(5px)" }} />
    </g>
  );
};

/* ============================================================================================
   LIGHT PRESETS. One dominant light per scene; it sets sky, sun/moon, rays, rim colour, embers.
   Use the rim colour on every character: <Human rim={L.rim} .../>.
   ============================================================================================ */
export type Light = {
  name: string;
  sky: string[];                 // top -> horizon gradient stops
  key: { x: number; y: number; r: number; kind: "sun" | "moon" | "none" };
  rays: string; rayOpacity: number;
  rim: string;                   // rim light on characters
  haze: string;                  // horizon haze colour
  particles?: { color: string; n: number; glow?: boolean; speed?: number };
  flare: string;                 // "r,g,b"
  grade?: string;                // css colour laid over everything with mix-blend "soft-light"
  stars?: boolean;
};
export const LIGHTS = {
  sunset: { name: "sunset", sky: ["#3a1a5c", "#a23b72", "#f0794a", "#ffd39a"], key: { x: 520, y: 560, r: 150, kind: "sun" }, rays: "#ffe2b8", rayOpacity: 0.26, rim: "#ffc48a", haze: "#ffb27a", particles: { color: "#ffe2b0", n: 22 }, flare: "255,214,170" },
  dawn: { name: "dawn", sky: ["#5a7bc8", "#a6b8e8", "#f6c9b8", "#fff0d6"], key: { x: 200, y: 640, r: 120, kind: "sun" }, rays: "#fff4dc", rayOpacity: 0.2, rim: "#fff0d0", haze: "#ffe6cf", particles: { color: "#ffffff", n: 14 }, flare: "255,240,215" },
  noon: { name: "noon", sky: ["#3f7fd0", "#7fb6ec", "#cfe6f7", "#fbf2dc"], key: { x: 560, y: 260, r: 110, kind: "sun" }, rays: "#fffbe8", rayOpacity: 0.16, rim: "#fff6dc", haze: "#f6ecd6", flare: "255,248,225" },
  night: { name: "night", sky: ["#0d0a2e", "#2a1650", "#5a2a6a", "#a84a6a"], key: { x: 240, y: 470, r: 170, kind: "moon" }, rays: "#ffe6d0", rayOpacity: 0.2, rim: "#ffd8c0", haze: "#8a3a6a", particles: { color: "#ffd9a8", n: 16 }, flare: "255,225,205", stars: true },
  fireNight: { name: "fireNight", sky: ["#1a0a26", "#4a1440", "#a8322e", "#ff8a3a"], key: { x: 240, y: 470, r: 170, kind: "moon" }, rays: "#ffd6b0", rayOpacity: 0.18, rim: "#ffb067", haze: "#ff6a2a", particles: { color: "#ffb24a", n: 48, glow: true, speed: 1.6 }, flare: "255,205,170", grade: "rgba(255,90,30,0.18)" },
  divine: { name: "divine", sky: ["#f7c76a", "#ffe3a0", "#fff4d6", "#ffffff"], key: { x: 360, y: 420, r: 190, kind: "sun" }, rays: "#fff6d8", rayOpacity: 0.42, rim: "#fff2c0", haze: "#fff0c8", particles: { color: "#fff3c4", n: 40, glow: true, speed: 0.6 }, flare: "255,240,200" },
  storm: { name: "storm", sky: ["#14182a", "#2a3150", "#4a5470", "#6c7088"], key: { x: 520, y: 300, r: 0, kind: "none" }, rays: "#cfd8ff", rayOpacity: 0, rim: "#b8c6ff", haze: "#5a6280", particles: { color: "#cfd8ff", n: 10 }, flare: "200,215,255", grade: "rgba(40,60,120,0.25)" },
  cave: { name: "cave", sky: ["#0c0810", "#1c1420", "#2c2028", "#3c2a2a"], key: { x: 520, y: 380, r: 0, kind: "none" }, rays: "#ffb46a", rayOpacity: 0, rim: "#ffa860", haze: "#3a2418", particles: { color: "#ffb46a", n: 12, glow: true }, flare: "255,180,110" },
  underwater: { name: "underwater", sky: ["#04263a", "#0a4a5e", "#16707a", "#3aa8a0"], key: { x: 380, y: 120, r: 0, kind: "none" }, rays: "#c8fff4", rayOpacity: 0.3, rim: "#a8fff0", haze: "#2a8a8a", particles: { color: "#d8fff8", n: 30, speed: 0.4 }, flare: "200,255,240" },
} satisfies Record<string, Light>;

const SkyBack: React.FC<{ light: Light }> = ({ light }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${light.sky.map((c, i) => `${c} ${Math.round((i / (light.sky.length - 1)) * 70)}%`).join(", ")})` }} />
);

const KeyLight: React.FC<{ light: Light; t: number }> = ({ light, t }) => {
  const to = useToScreen();
  if (light.key.kind === "none") return null;
  return (
    <>
      <Layer d={0.08} blur={1.2}>
        {light.stars && Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 137.5) % W, y = (i * 71.3) % 620, tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
          return <circle key={i} cx={x} cy={y} r={0.8 + (i % 3) * 0.5} fill="#fff6e8" opacity={0.25 + 0.5 * tw} />;
        })}
        <Sun cx={light.key.x} cy={light.key.y} r={light.key.r} id={`key-${light.name}`} />
      </Layer>
      {(() => { const [sx, sy] = to(light.key.x, light.key.y, 0.08); return <GodRays cx={sx} cy={sy} t={t} opacity={light.rayOpacity} color={light.rays} />; })()}
    </>
  );
};

const LightFront: React.FC<{ light: Light; t: number }> = ({ light, t }) => {
  const to = useToScreen();
  const [sx, sy] = to(light.key.x, light.key.y, 0.08);
  return (
    <>
      {light.particles && <Embers t={t} n={light.particles.n} color={light.particles.color} glow={light.particles.glow} speed={light.particles.speed ?? 1} seed={`p-${light.name}`} />}
      {light.key.kind !== "none" && <LensFlare x={sx} y={sy} intensity={0.45} tint={light.flare} />}
      {light.grade && <div style={{ position: "absolute", inset: 0, background: light.grade, mixBlendMode: "soft-light" }} />}
    </>
  );
};

/** Flash for shock / impact on a word: put {flash(lt, at)} as opacity of a white AbsoluteFill. */
export const flash = (lt: number, at: number) => interpolate(lt, [at - 0.04, at + 0.03, at + 0.18], [0, 0.85, 0], cl);
/** Fade in from black at the start of the reel / fade to black at the end. */
export const fadeIn = (lt: number, len = 0.4) => interpolate(lt, [0, len], [1, 0], cl);
