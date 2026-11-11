# Style bible

## 1. Palettes (sampled from the reference reel)

| Mood / location | Sky gradient (top → horizon) | Ground or sea | Accents |
|---|---|---|---|
| **Desert dusk** (sorrow, past) | `#9c4f95 → #c9659f → #dd7daf → #f78d96 → #ffb07a → #ff9a45` | pyramids: lit `#ffae55`, shadow `#f08a2c`; floor `#ff9d45 → #b9506a` | rock: top `#c75d84`, sides `#86304f`/`#94385a`, sun-facing `#f0904a` |
| **Sunset sea** (loneliness, distance) | `#8a5aa0 → #c06a9a → #f08f9a → #fdbf92 → #fdcb96` | sea `#d47a80 → #8a4a8e → #3f2c86 → #241a63`, glints `#fff3dc` | island rock `#5b1980`/`#8b3cb4`, rust side `#d9744e`; skyline `#f7996e` |
| **Day sky** (flashback, youth, joy) | `#7fade6 → #8db7eb → #b4daf4 → #e9eff9 → #fcedd2 → #f7e3c2` | clouds: lit `#fbf1e2`, shade `#c3b8d4`, outline `#8f84ad` | warm shift for tension: overlay `rgba(255,150,90,0.55)` |
| **Into the sun** (danger, hubris) | `#fde4c2 → #fbb985 → #f58a5c → #e45a3c → #c93d2c` | warm clouds `#ffe2c4`/`#e7a59a` | sun disc `#fffef8 → #fff2d6`, embers `#ffb24a` |

Shared: ink `#2a1b2b`; caption highlight `#f7c62f`; gold `#f2c12e`; ruby `#d6262c`; turquoise gem `#2bb3a3`; sun `#fdf3dc`.

**Colour logic.** Every scene sets a warm key light against a cool shadow mass. When the emotion turns dangerous, push the whole frame toward red-orange and add a red edge vignette `rgba(170,30,10,0.55)`. When it turns tender or protective, cool the protected character (brightness 0.72, saturation 0.8 under the shadow).

## 2. Lighting recipe (apply in every shot)
1. **Key light:** the sun, as a disc plus a glow at 2.3× its radius. Its position decides everything below.
2. **God rays** from the sun's screen position: `GodRays`, opacity 0.18–0.4, rotating slowly, blended with screen.
3. **Lens flare** along the sun→centre axis. Use intensity 0.3–1, stronger in wide shots.
4. **Rim light on characters**, on the sun side. Use the `rim` prop: warm `#ffd29a` at sunset, white `#ffffff` in day sky.
5. **Cel shade:** the radial gradient in `Bird` darkens the side away from the light. Rocks use separate facet fills (lit top, mid front, dark side, plus an orange sliver facing the sun).
6. **Shadows:**
   - contact ellipse `#2a0a2a` at 0.55, blur 2px;
   - cast-shadow polygon with a fading gradient, blur 5px;
   - a reflection of objects in water (flipped, blur 6px, opacity 0.28).
7. **Atmosphere:**
   - a horizon glow band (blurred rect, cream-orange);
   - haze over far layers;
   - heat haze through the `HeatFilter` displacement on hot scenes.
8. **Finish:** a `Vignette` and animated `Grain` (overlay blend, opacity 0.09) on every frame.

## 3. Depth layers (2.5D)
Give each layer a depth `d`: 0 is the sky and 1 is the hero plane; above 1 is foreground. For camera zoom `z`, the layer scale is `1 + (z-1)*d` and the pan offset is multiplied by `d` (see `layer()` in `shots/Desert.tsx`). Depth-of-field blur grows with the camera zoom and with the distance from the focus plane:

| Layer | Example contents | d | Blur at close-up |
|---|---|---|---|
| sky / sun / clouds | Sun, ToonCloud | 0.12 | ~0.55 × dof |
| distant mesas, flocks | silhouettes + HeatFilter | 0.22 | ~0.9 × dof |
| big landmarks (pyramids, skyline) | two-tone facets | 0.32 | dof |
| mid-ground floor, ruins, flag | Pillar, Flag | 0.45 | 0.75 × dof |
| secondary rock, diyas | FacetRock | 0.75 | small |
| hero plane | character + hero rock + shadows | 1.0 | 0 (rack focus on cut) |
| foreground chunk | dark rock edge | 1.6 | 9–20px |

## 4. World-building props (what makes the world feel lived-in)
- **Sacred and ancient:**
  - broken carved pillars;
  - a saffron flag (tattered, waving);
  - diyas with double flames and a glow;
  - spiral and zigzag carvings on rocks;
  - temple skylines (shikhara tiers, domes, flags, gold glints).
- **Nature:**
  - flocks of distant birds;
  - glittering water with swells, foam rings around rocks and distant islands;
  - mesas behind dunes;
  - lavender cloud seas with white highlight strokes.
- **Particles:** embers (warm scenes), dust motes (calm scenes), smoke wisps (from burnt things), falling charred feathers (damage).
- **Folk-art patterning** on every manufactured or living surface: wavy white lines, dot grids, orange zigzag bands, gold beads. Plain fills look cheap in this style.

## 5. Effects reference (`fx.tsx`)
| Component | When to use it | Typical settings |
|---|---|---|
| `GodRays` | any shot with the sun | opacity 0.2 wide shots, 0.35–0.4 close to the sun; count 11–16 |
| `LensFlare` | sun on screen or just off it | intensity 0.35–1 |
| `Embers` | warm or sad scenes, dust in calm scenes | `glow` + `#ffb24a` for fire, `#fff1c8` for dust |
| `Smoke` | burnt wings, diyas, scorching | scale 0.35–1.3, colour `#3a2430` |
| `HeatFilter` | far desert layers, the sun, scorch close-ups | scale 3–9 |
| `SpeedLines` | races, dives | opacity tied to the action ramp |
| `StoneTexture` | inside rock SVGs, as `<defs>` | — |
| `Grain` + `Vignette` | always, globally | — |
