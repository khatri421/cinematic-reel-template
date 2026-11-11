# Characters

## Rule: people have realistic human bodies
Every human or humanoid character uses the **realistic-proportion rig in `src/kit/Human.tsx`**: gods in human form, rishis, kings, queens, villagers, rakshasas, and vanaras like Hanuman. Do not draw chibi, egg-shaped or big-head bodies for people. Only the *style* is folk art (ink outline, flat colour, patterns, cel shade, rim light). The *anatomy* is real:

| Measure | Male | Female |
|---|---|---|
| Height | 7.5 heads (head = 38 units, feet on y = 298) | 7.5 heads, longer neck |
| Shoulders | 2 heads wide (`build` 0 → 1 widens them) | ~1.6 heads |
| Waist / hips | narrow waist, hips narrower than shoulders | narrow waist, hips wider than shoulders |
| Arms | upper arm 50, forearm 44, hand 18; elbow at the waist, fingertips at mid-thigh | thinner (0.82×) |
| Legs | crotch at half height; thigh 70, shin 62, foot 22 | covered by a long skirt; feet show |
| Muscles | deltoid, biceps, pecs, abs, obliques, quads, calves drawn as shape + 1px lines | soft curves, no muscle lines |

### Using the rig
```tsx
import { Human, PALETTES } from "../kit/Human";
<div style={{ position: "absolute", left: x - w / 2, top: feetY - 298 * (w / 360), width: w, height: w / (360 / 310) }}>
  <Human id="ram1" t={t} palette={PALETTES.ram} build={0.7} headwear="mukut" weapon="bow" pose="stand" />
</div>
```
| Prop | Values |
|---|---|
| `kind` | `human` · `vanara` (fur frame, hanu muzzle, round ears, tail) · `rakshasa` (moustache, darker palette) |
| `body` | `male` · `female` (lehenga/saree skirt + choli + pallu, long hair) |
| `build` | 0 slim (rishi, youth) … 1 heroic (Hanuman, Bhim) |
| `palette` | `PALETTES.hanuman` `ram` `rishi` `king` `ravan` `sita` `villager`, or your own `HumanPalette` |
| `headwear` | `mukut` (crown) · `jata` (matted bun: rishis, Shiv) · `long` · `short` · `bun` · `none` |
| `beard`, `moustache` | rishis, kings, elders |
| `weapon` | `gada` · `bow` · `none` |
| `tail`, `fire` | vanara tail and its flame (0..1) |
| `pose` | preset: `stand` `leap` `fly` `walk` `run` `namaste` `sit` `bow` `point` `bless`; or a custom `Pose` object of joint angles |
| `poseK` | 0..1 blend for `stand` (raise the weapon), `bow`, `point`, `bless` |
| `eyes` | `open` `sad` `closed` `angry`; `smile` 0..1; `tear` 0..1 |
| `rim` | rim-light colour matching the key light of the scene |
| `id` | unique per instance in a frame (gradient / clip ids) |

`src/kit/Hanuman.tsx` is a ready wrapper: `<Hanuman id t pose fire arm smile eyes rim />`.

Landmarks for cameras: `HEAD_C` (head centre) and `TAIL_TIP`, in viewBox coordinates. Convert them with the placement of the shot (see `vb()` in `src/kit/shots/Rooftop.tsx`). A face close-up needs z ≈ 3.5–7 on the character layer, because a realistic head is only 1/7.5 of the body.

**Custom poses.** Angles are degrees, 0 = limb hanging down. Negative swings a limb forward, the way the character faces: arm -90 points ahead, -180 points up. Positive shin angles bend the knee. `f` = near limb, `b` = far limb. `root` tilts the whole body (leaps, flight), `drop` lowers the pelvis (sitting, crouching), `flatFeet` keeps the feet on the ground. Animate by interpolating two Pose objects per frame.

**Check every new character** on the model sheet. Add it to `CELLS` in `src/Library.tsx`, run `npm run library`, and open `docs/library.png`. It must read at 60 px (tiny in a wide shot), at 300 px and in a close-up.

**Facing left:** wrap the character in `transform: scaleX(-1)`, or use `<Place flip>`.

## Animals and creatures
Birds, deer, snakes, Garuda, Jatayu and other non-human characters use the construction grammar below (from `Bird.tsx`). Keep their anatomy believable too: correct leg joints, wing structure and head-to-body ratio for the species.

## Construction grammar (animals and creatures)

All characters are hand-built SVG in one shared grammar (see `src/Bird.tsx`). A new character should look like it belongs to the same family. Reuse the structure and the shading; change only the silhouette and the attributes.

## The grammar
1. **viewBox `-80 -10 360 310`**, with the character centred on x=100 and the feet or tail at the bottom. This keeps the placement math (`width / (360/310)`) identical across characters.
2. **Ink outline** `#2a1b2b`: 2.5px on the main body, 2px on the head, 1.2–1.6px on details. Use `strokeLinejoin="round"`.
3. **A simple geometric body** (egg, bell, rounded trapezoid) that is clipped and filled with **folk patterns**:
   - 2–3 rows of wavy white lines (`q6,-4 12,0 t12,0…`);
   - a dot grid (r 1.3, white at 0.8);
   - an orange band `#da7315` with a pale zigzag, plus a thin gold band below it.
4. **Cel shading:** inside the body clip, add a radial gradient overlay from transparent to `#120a24` at 0.55, centred toward the light. Add a **rim-light stroke** (the `rim` colour, 4px, opacity 0.55) on the lit edge.
5. **Collar or adornment** where body meets neck: a jagged fur or cloth shape, a gold necklace curve, a ruby pendant with a small highlight.
6. **Neck:** stacked rings in two alternating tones. Each ring gets a dark strip on its left and a rim strip on its right.
7. **Head:**
   - an ellipse in skin tone `#f4b083` with a darker cheek crescent;
   - **one almond eye in profile**: white, a dark pupil with a white catch-light, and a brow stroke;
   - a crown or headgear in gold `#f2c12e` with a darker shaded half, a ruby centre and turquoise side gems.
8. **Signature feature** in a strong accent colour (here the yellow hooked beak `#e8af3f`), with a highlight stroke and a nostril dot.
9. **Limbs or wings** built from repeated elements (feathers, petals, fingers):
   - each element gets a gradient fill, a darker inner half-stroke for volume and a dashed centre line;
   - alternate light and dark elements;
   - make them rotatable from a pivot so they can animate (`flap`).

## Expression and state props (keep this API for every character)
| Prop | Effect |
|---|---|
| `eyes`: `open`, `sad` or `closed` | sad = a lowered lid plus a tilted brow; closed = a squeezed curve with lashes and a pinched brow (pain or prayer) |
| `tear` 0→1 | a drop that forms under the eye and slides 16 units, leaving a wet trail |
| `char` 0→1 | damage spreading from the extremities inward: `clamp(char*1.7 - (1-k)*0.9)` per element; a dark char gradient, a glowing ember edge and tip sparks |
| `rim` | rim-light colour to match the scene's key light |
| `flap` -1…1 | a pose or animation driver (wings, arms) |
| `t` | idle life: breathing (body ±1.2px), head sway (±2°), flicker |
| `id` | a unique prefix for gradients and clipPaths, required for every instance in a frame |

## Making a new character, step by step
1. Copy `Bird.tsx` to `<Name>.tsx`. Keep the defs, the shading, the collar, the head and the eye code.
2. Swap the signature feature: a beak for a bird, antlers for a deer, a hood for a naga, a long neck for a swan. (People never use this path. They use `Human.tsx`.)
3. Pick a palette entry like `SAMPATI` or `JATAYU`: a body colour, a dark variant, a limb colour, a line colour and a covert colour. Siblings or pairs should differ mostly in **hue** (Sampati slate-blue, Jatayu brown-gold) so they read apart instantly, even as silhouettes.
4. Add a damaged or transformed variant (`mode`), as `burnt` does for Sampati: jagged black stubs with glowing tips.
5. Test it at three scales (tiny 60px silhouette, mid 300px, close-up 800px). It must read at all three. Use a half-res still render and look at it.
