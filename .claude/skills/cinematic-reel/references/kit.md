# Kit API (src/kit) — everything a scene can use

World size: **720 × 1280** (the engine scales to 1080 × 1920). Keep faces and action between y≈300 and y≈1150 (captions sit above y≈280, title + chip above y≈300).

## Scene skeleton (copy this)
```tsx
import { Embers, Smoke } from "../kit/fx";
import { Human, PALETTES, posePreset } from "../kit/Human";
import { Ground, Mountains, Tree, Water, Hut, Temple, CourtHall, Throne, Lotus, Rain, lightning } from "../kit/scenery";
import { Stage, Layer, Place, GroundShadow, LIGHTS, flash } from "../kit/stage";
import type { SceneDef } from "../scene";

export const CHIP = "SHIV PURAN";            // source tag shown 1-4.5 s (or "LOK KATHA")
export const SCENES: SceneDef[] = [
  {
    in: "black",                              // cut | flash | white | black | whip
    draw: ({ t, lt, dur, talk, wordAt }) => {
      const L = LIGHTS.dawn;                  // one dominant light per scene
      return (
        <Stage t={t} lt={lt} dur={dur} light={L} cam={[{ k: 0, z: 1.0, x: 360, y: 760 }, { k: 1, z: 1.25, x: 380, y: 800 }]}>
          <Layer d={0.25}><Mountains y={900} h={420} color="#8a7ab8" dark="#5a4a88" rim={L.rim} snow lit={-1} /></Layer>
          <Layer d={0.6}><Tree x={130} y={1010} s={1.1} kind="banyan" leaf="#4a8a5a" leafDark="#2a5a3a" rim={L.rim} t={t} /></Layer>
          <Layer d={1}>
            <Ground y={1040} top="#b89a6a" bottom="#6a4a2a" haze={L.haze} tufts="#5a6a2a" seed="s1" />
            <GroundShadow x={380} y={1060} w={330} lightX={L.key.x} />
          </Layer>
          <Layer d={1} html>
            <Place x={380} feetY={1060} w={330}>
              <Human id="rishi1" t={t} palette={PALETTES.rishi} build={0.2} headwear="jata" beard pose="bless" poseK={Math.min(1, lt / 0.6)} mouth={talk} rim={L.rim} />
            </Place>
          </Layer>
          <Layer d={1.6}><Tree x={680} y={1400} s={2.2} kind="round" leaf="#2a4a2a" leafDark="#1a2a1a" /></Layer>
        </Stage>
      );
    },
  },
];
```

## stage.tsx
| Export | Use |
|---|---|
| `<Stage t lt dur cam light focus? dof? rack? shake?>` | the camera. `cam` = keys `{k: 0..1 of scene, z: zoom, x, y: world point in focus, tx?, ty?: where it sits on screen}`. `light` draws sky + sun/moon + god rays + flare + particles. `shake` px (animate it). `dof` 0 off / 1 normal / 2 dreamy. |
| `<Layer d blur? html?>` | one depth plane. SVG children by default; `html` for `<Place>` character boxes. Blur is automatic from depth. |
| `<Place x feetY w flip?>` | character box: feet at (x, feetY), w = rig width (figure ≈ 0.8 w tall). 330 = full-body medium, 600 = hero, 120 = far. |
| `<GroundShadow x y w lightX>` | contact + cast shadow (same layer as the ground, before the character). |
| `LIGHTS.sunset dawn noon night fireNight divine storm cave underwater` | presets: `sky[]`, `key{x,y,r,kind}`, `rays`, `rim`, `haze`, `particles`, `flare`, `grade`. Make your own: `{ ...LIGHTS.night, key: { ...LIGHTS.night.key, x: 520 } }`. Use `L.rim` on every character. |
| `flash(lt, at)` | 0..1 white-hit opacity around time `at` (use with `wordAt("jal")`). |
| `fadeIn(lt)` | 1→0 over 0.4 s. |
| `useToScreen()` | world point → screen point for a depth (aim flares). |

## scenery.tsx (folk ink + toon shade; `lit` -1 = light from left)
`Ground({y, top, bottom, haze?, tufts?, seed})` · `Mountains({y, h, color, dark, rim?, snow?, lit?, seed?, n?})` · `Tree({x, y, s?, kind: banyan|round|palm|kadamb, leaf, leafDark, trunk?, rim?, t?, flowers?})` · `Water({y, top, bottom, glintX?, glint?, t, lines?})` · `Hut({x, y, s?, wall?, roof?, glow?, rim?})` · `Temple({x, y, s?, stone?, dark?, gold?, glow?, rim?, t?})` · `CourtHall({floorY, wall?, arch?, pillar?, gold?, t?})` · `Throne({x, y, s?, gold?, cushion?})` · `Lotus({x, y, s?, petal?, glow?})` · `<Rain t n? color? angle?/>` (HTML overlay, put inside Stage after layers) · `lightning(lt, at)` → 0..0.8 white opacity.

## world.tsx / lankaWorld.tsx
`Sun({cx, cy, r, glow?, id})` · `ToonCloud({x, y, s, fill, rim, outline?, shade?})` · `SkyCloud` · `FacetRock` (see file) · `Pillar({x, y, h, broken?, lit?, dark?})` · `Flag({x, y, t, s?})` · `Diya({x, y, s?, t, i})` · `Flock({t, x, y, n, s?, color?})` · `Lanka({color, glint?, t?})` · `Flame({x, y, s?, t, seed?, glow?})` · `Fire({x, y, w, s, t, seed, n?})` · `Palace({x, y, s?, burn?, t, seed?, c?, flip?})` · `BurningSkyline({burn, t, color?, glint?})` (draw inside `<g transform="translate(x,y) scale(s)">`) · `lankaSky(burn)`.

## fx.tsx
SVG: `Smoke({x, y, t, n?, scale?, color?, seed?})`, `StoneTexture`, `HeatFilter`. HTML overlays (put inside Stage, after layers): `Embers({t, n?, color?, speed?, seed?, size?, glow?})`, `GodRays({cx, cy, t, color?, opacity?})`, `LensFlare({x, y, intensity?, tint?})`, `SpeedLines({t, cx, cy, opacity, color?})`. The engine already adds `Vignette` + `Grain` to every frame.

## Characters
`Human` (realistic anatomy, see characters.md), `Hanuman` (wrapper), `Bird` (Sampati/Jatayu grammar). Every instance needs a unique `id`. Pass `mouth={talk}` to whoever is speaking in that line, `rim={L.rim}`. Save a story's characters in `src/characters/<name>.tsx` (a small wrapper like `kit/Hanuman.tsx`) and reuse them in later reels of the series.

## Hand-built shots (src/kit/shots) — patterns to learn from or re-time
`ShotRooftop, ShotBurn, ShotHero` (Lanka Dahan), `ShotDesert, ShotSea, ShotSky, ShotSunRise, ShotScorch, ShotShield` (Jatayu/Sampati). All take `speed` + `start` (frames): to play frames a→b over a scene use `fit(a, b, dur)` from `src/reels/example.tsx`. Each file's top comment lists its frame ranges.

## Rules that prevent broken frames
- `random(seed)` from remotion, never `Math.random()`.
- Unique ids for every `Human`/`Bird`/gradient in one frame.
- Characters standing on ground: GroundShadow + feet exactly on the ground line.
- Never leave a frame static: camera move + one subject move + particles/flicker.
- After `npm run preview` ALWAYS open `reels/<naam>/check.jpg` and look at every scene before reporting.
