// EXAMPLE reel: reels/example/script.txt (10 blocks = 10 scenes). Story: Hanuman ji ka Lanka Dahan.
// For a new story copy the PATTERN, not the content: new world, new characters, new camera for every scene.
// Scenes 1, 3-6, 10 re-time the hand-built shots in src/kit/shots (speed = natural frames / scene frames);
// scenes 2, 7, 8, 9 are built only from the kit (Stage + Layer + scenery + Human), which is how new stories are made.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Embers, Smoke } from "../kit/fx";
import { Hanuman } from "../kit/Hanuman";
import { Human, PALETTES, posePreset } from "../kit/Human";
import { BurningSkyline, Fire, Palace } from "../kit/lankaWorld";
import { CourtHall, Ground, Lotus, Temple, Water } from "../kit/scenery";
import { flash, GroundShadow, Layer, LIGHTS, Place, Stage } from "../kit/stage";
import { ShotBurn } from "../kit/shots/Burn";
import { ShotHero } from "../kit/shots/Hero";
import { ShotRooftop } from "../kit/shots/Rooftop";
import type { SceneDef } from "../scene";

export const CHIP = "VALMIKI RAMAYAN · SUNDAR KAND";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** play frames [a, b] of a hand-built shot across the whole scene */
const fit = (a: number, b: number, dur: number) => ({ start: a, speed: (b - a) / Math.max(1, dur * 30) });

export const SCENES: SceneDef[] = [
  // 1. "Ravan ne ... poonch mein aag lagwa di." INSERT: the tail tip, fire catches. (shot frames 6-53)
  { draw: ({ dur }) => <ShotRooftop {...fit(6, 53, dur)} /> },

  // 2. "Rakshas hans rahe the." MEDIUM: two rakshasas laugh and point, Hanuman calm between them, Lanka behind.
  {
    draw: ({ t, lt, dur }) => {
      const L = LIGHTS.fireNight;
      const laugh = 0.45 + 0.45 * Math.sin(t * 17);
      return (
        <Stage t={t} lt={lt} dur={dur} light={L} cam={[{ k: 0, z: 1.08, x: 360, y: 920 }, { k: 1, z: 1.24, x: 360, y: 900 }]}>
          <Layer d={0.3}><g transform="translate(360,860) scale(0.8)"><BurningSkyline burn={0.15} t={t} glint={0.5} /></g></Layer>
          <Layer d={0.6}>
            <Palace x={90} y={1000} s={0.8} t={t} seed="ex2a" />
            <Palace x={640} y={990} s={0.72} t={t} seed="ex2b" flip />
          </Layer>
          <Layer d={1}>
            <Ground y={1040} top="#6a2a5e" bottom="#24081f" haze={L.haze} seed="ex2" />
            <GroundShadow x={360} y={1060} w={320} lightX={240} />
            <GroundShadow x={130} y={1090} w={360} lightX={240} />
            <GroundShadow x={600} y={1090} w={360} lightX={240} />
          </Layer>
          <Layer d={1} html>
            <Place x={360} feetY={1060} w={320}><Hanuman id="ex2h" t={t} fire={1} smile={0.5} rim={L.rim} /></Place>
            <Place x={130} feetY={1090} w={360}><Human id="ex2r1" t={t} kind="rakshasa" build={0.9} headwear="short" pose="point" poseK={0.8} eyes="angry" smile={0.9} mouth={laugh} rim={L.rim} /></Place>
            <Place x={600} feetY={1090} w={360} flip><Human id="ex2r2" t={t + 0.3} kind="rakshasa" build={0.7} headwear="bun" pose="point" poseK={0.6} smile={0.9} mouth={1 - laugh} rim={L.rim} /></Place>
          </Layer>
          <Layer d={1.6}><Fire x={620} y={1330} w={240} s={1.8} t={t} seed="ex2f" n={4} /></Layer>
        </Stage>
      );
    },
  },

  // 3. "Par Hanuman ji muskuraye." CLOSE-UP on the face: the smile. (shot frames 82-130)
  { draw: ({ dur }) => <ShotRooftop {...fit(82, 130, dur)} /> },

  // 4. "Ek chhalaang..." WIDE: the first leap over the rooftops. (frames 0-50)
  { in: "whip", draw: ({ dur }) => <ShotBurn {...fit(0, 50, dur)} /> },

  // 5. "aur ghar ghar mein aag!" WIDE: second leap, roofs igniting one after another. (frames 50-86)
  { draw: ({ dur }) => <ShotBurn {...fit(50, 86, dur)} /> },

  // 6. "Sone ki Lanka jal uthi." EXTREME WIDE: the whole skyline burns, flash + shake built in. (frames 86-148)
  { draw: ({ dur }) => <ShotBurn {...fit(86, 148, dur)} /> },

  // 7. "Ravan ka ghamand bhi jal gaya." Ravan in his court, fire through the arches, his anger. Enters on a flash.
  {
    in: "flash",
    draw: ({ t, lt, dur, wordAt }) => {
      const L = { ...LIGHTS.fireNight, key: { ...LIGHTS.fireNight.key, kind: "none" as const } };
      const hit = wordAt("jal") ?? dur * 0.6;
      return (
        <Stage t={t} lt={lt} dur={dur} light={L} shake={interpolate(lt, [hit, hit + 0.1, hit + 0.6], [0, 6, 0], cl)} cam={[{ k: 0, z: 1.15, x: 360, y: 760 }, { k: 1, z: 1.55, x: 372, y: 720 }]}>
          <Layer d={0.5}>
            <CourtHall floorY={1080} t={t} />
            {[40, 240, 440, 640].map((x, i) => <Fire key={i} x={x + 100} y={1000} w={120} s={1.1} t={t + i} seed={`ex7f${i}`} n={3} />)}
          </Layer>
          <Layer d={1}>
            <Ground y={1080} top="#4a1a3a" bottom="#1a0614" seed="ex7" />
            <GroundShadow x={360} y={1090} w={420} lightX={600} />
          </Layer>
          <Layer d={1} html>
            <Place x={360} feetY={1090} w={420}><Human id="ex7rv" t={t} kind="rakshasa" build={0.9} heads={10} headwear="mukut" pose="point" poseK={interpolate(lt, [0, 0.5], [0.2, 1], cl)} eyes="angry" smile={0} rim="#ffb067" /></Place>
          </Layer>
          <AbsoluteFill style={{ background: "#fff2d0", opacity: flash(lt, hit) * 0.6, mixBlendMode: "screen" }} />
        </Stage>
      );
    },
  },

  // 8. "Hanuman ji ne samudra mein poonch bujhayi." The dive into the sea, burning Lanka on the horizon, splash + steam.
  {
    draw: ({ t, lt, dur }) => {
      const L = LIGHTS.night;
      const p = lt / dur, hitP = 0.55;
      const k = Math.min(1, p / hitP);
      const pose = { ...posePreset("fly", t), root: 70 + 60 * k };
      const hx = 160 + 260 * k, hy = 520 + 330 * k * k;
      const after = Math.max(0, (p - hitP) / (1 - hitP));
      return (
        <Stage t={t} lt={lt} dur={dur} light={L} cam={[{ k: 0, z: 1.0, x: 360, y: 760 }, { k: 1, z: 1.12, x: 420, y: 820 }]}>
          <Layer d={0.3}>
            <g transform="translate(150,770) scale(0.45)"><BurningSkyline burn={1} t={t} /></g>
            <Smoke x={150} y={700} t={t} n={7} scale={1.6} color="#3a1a30" seed="ex8s" />
          </Layer>
          <Layer d={0.6}><Water y={770} top="#2a1650" bottom="#0a0626" glintX={240} glint="#ffe6d0" t={t} seed="ex8" /></Layer>
          {p < hitP && (
            <Layer d={1} html>
              <Place x={hx} feetY={hy} w={300}><Hanuman id="ex8h" t={t} pose={pose} fire={1} rim={L.rim} /></Place>
            </Layer>
          )}
          {p >= hitP && (
            <Layer d={1}>
              {[0, 1, 2].map((i) => { const r = 30 + (after * 1.4 + i * 0.25) * 160; return <ellipse key={i} cx={430} cy={860} rx={r} ry={r * 0.22} fill="none" stroke="#e8dcff" strokeWidth={3 - i} opacity={Math.max(0, 0.8 - after * 0.8 - i * 0.15)} />; })}
              {Array.from({ length: 14 }).map((_, i) => { const a = -Math.PI * (0.15 + 0.7 * (i / 13)), v = 160 + (i % 4) * 40, tt = Math.min(1, after * 2.2); return <circle key={i} cx={430 + Math.cos(a) * v * tt} cy={860 + Math.sin(a) * v * tt + 300 * tt * tt} r={5 - (i % 3)} fill="#dfe8ff" opacity={1 - tt} />; })}
              <Smoke x={430} y={840} t={t} n={9} scale={1.2} color="#d8d4e8" seed="ex8st" />
            </Layer>
          )}
        </Stage>
      );
    },
  },

  // 9. "Aur Ram naam goonj utha." Divine light: Hanuman in namaste, eyes closed, temple and lotus. Enters from white.
  {
    in: "white",
    draw: ({ t, lt, dur }) => {
      const L = LIGHTS.divine;
      return (
        <Stage t={t} lt={lt} dur={dur} light={L} cam={[{ k: 0, z: 1.1, x: 360, y: 820 }, { k: 1, z: 1.32, x: 360, y: 780 }]}>
          <Layer d={0.35}><Temple x={360} y={1000} s={0.9} rim={L.rim} t={t} stone="#e9b88a" dark="#b07a5a" /></Layer>
          <Layer d={1}>
            <Ground y={1040} top="#f2d39a" bottom="#c9955a" haze={L.haze} seed="ex9" />
            <GroundShadow x={360} y={1060} w={340} lightX={360} />
          </Layer>
          <Layer d={1} html>
            <Place x={360} feetY={1060} w={340}><Hanuman id="ex9h" t={t} pose="namaste" eyes="closed" smile={0.6} rim={L.rim} /></Place>
          </Layer>
          <Layer d={1.5}><Lotus x={120} y={1300} s={1.6} glow={1} /><Lotus x={640} y={1320} s={1.4} glow={1} /></Layer>
          <Embers t={t} n={30} color="#fff6c8" glow speed={0.5} seed="ex9e" />
        </Stage>
      );
    },
  },

  // 10. "Jai Shri Ram!" LOW-ANGLE HERO: gada raised on "Jai", moon halo, city burning below. (frames 0-82)
  { draw: ({ dur }) => <ShotHero {...fit(0, 70, dur)} /> },
];
