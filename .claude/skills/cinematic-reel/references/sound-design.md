# Sound design: background music + SFX for a reel

Every reel gets its own cue sheet `src/reels/<naam>.sound.json`. `npm run preview|reel` turns it into `public/score.wav` (step 4/5, `scripts/score.mjs`): everything is synthesized (no samples, no downloads, no copyright problems), deterministic, and **automatically ducked under the voice**. Without a cue sheet the reel gets a quiet tanpura + pad bed, which is acceptable but flat. Always write one.

## Anchoring cues to the story (so they stay in sync when the voice changes)
- `"scene": N` (1-based, = the Nth blank-line block of script.txt) makes `at` / `from` / `to` **seconds inside that scene**.
- `"at": "55%"` = 55% into the scene (for actions you animate at a fraction of the scene, e.g. a splash at p = 0.55).
- `"word": "jal"` puts the cue exactly on that spoken word (searched inside the scene when `scene` is given). Add `"at": 0.1` to shift it.
- `"to": "end"` = end of the scene (or of the reel, without `scene`).
- No `scene` = absolute seconds of the reel.
Every cue also takes `gain` and `pan` (-1 left … 1 right).

```json
{
  "key": "D",
  "duck": 0.5, "duckSfx": 0.2, "musicGain": 1, "sfxGain": 1,
  "music": [
    { "type": "tanpura", "from": 0, "to": "end", "gain": 0.045 },
    { "type": "dhol", "scene": 4, "from": 0, "to": "end", "bpm": 150, "pattern": "DttDttDt" }
  ],
  "sfx": [
    { "type": "whoomp", "scene": 1, "word": "aag" },
    { "type": "boom", "scene": 6, "word": "jal" },
    { "type": "splash", "scene": 8, "at": "55%" }
  ]
}
```
The example `src/reels/example.sound.json` is the full cue sheet of the Lanka Dahan reel; read it next to `src/reels/example.tsx`.

### Music cues (`music`, ducked under the voice)
| type | params | use |
|---|---|---|
| `tanpura` | from, to, gain≈0.045 | the bed under everything; instantly "Indian mythology" |
| `pad` | from, to, chord (`minor` `major` `sus` `power` `dark` `open`), root (semitones), gain≈0.1–0.15, cutoff [start,end] Hz | harmony; rising cutoff = tension opening up |
| `dhol` | from, to, bpm, pattern (`D` dha, `t` ta, `.` rest, one per 8th note), gain | action, journeys, battles, festivals |
| `dha` / `ta` | at or word, gain, pan | single drum hits on key words |
| `roll` | from, to, gain | tasha crescendo; always lands on a hit (`boom` or `dha`) |
| `bansuri` | notes `[[degree, start, len], ...]` (start obeys `scene`), scale (`bhairavi` `yaman` `bhupali` `minor` `major` `marwa`), octave, gain≈0.2 | Krishna, nature, longing, sadness, peaceful dawn |
| `shankh` | at or word, len, freq, gain≈0.5 | a god appears, battle begins, victory, "Jai …!" |
| `bell` | at or word, gain≈0.1, freq | temple, blessing, a smile, a realisation |
| `choir` | from, to, chord, root, gain≈0.12 | divine reveal, darshan, miracles |

### SFX cues (`sfx`)
| type | params | situation |
|---|---|---|
| `fire` | from, to, curve `[[t, 0..1], ...]` | anything burning; follow the visual intensity |
| `whoomp` | at/word, gain, pan | fire catching, a flare-up, magic burst |
| `whoosh` | at, len, gain, panFrom, panTo | leap, flight, weapon swing (len 0.3), whip transitions |
| `thud` | at, gain, pan | landing, footsteps (gain 0.2), a fall |
| `boom` | at/word, gain | the climax hit: explosion, divine strike, city bursting into flame |
| `riser` | from, to | tension build ending exactly on a hit |
| `wind` | from, to, gain | desert, mountain, sky, loneliness |
| `waves` | from, to, gain, period | sea, river, Ganga, Setu |
| `thunder` | at, gain | storms, Indra, anger of a god |
| `flap` | at, count, rate, gain | birds (Jatayu, Garuda), wings |
| `heartbeat` | from, to, bpm | fear, suspense, a choice |
| `clang` | at, gain | swords, gada hits, chakra |
| `arrow` | at, gain, pan | bow release |
| `shimmer` | at, len, gain | magic, boons, transformation, a deity's glow |
| `splash` | at, gain | diving, water hit |
| `crowd` | from, to, gain | court, army, market, village, laughing rakshasas |

## From story beat to sound
1. **Bed first:** `tanpura` for the whole reel plus a `pad` whose chord follows the mood (minor = tension/sorrow, major = triumph/devotion, `dark` = menace).
2. **Ambience for the place:** fire, wind, waves or crowd under the scenes set there.
3. **One SFX for every visible action**, on the scene + word/percentage where it happens: leap = whoosh (+ thud on landing), fire catching = whoomp, weapon = clang/arrow, flight = flap + wind.
4. **Rhythm for energy:** `dhol` when the action starts; a `roll` + `riser` into the climax; land the climax on `boom` + `dha` on the word that names it.
5. **Payoff:** change the harmony (`pad` to `major`), bring in `shankh`, `bell` or `choir` for the last line; `dha` on its stressed words ("Jai / Shri / Ram").
6. **Leave space:** fewer, well-timed sounds beat a wall of noise. The ducking keeps the voice clear.
7. **Levels:** the finished reel should measure about -14 LUFS: `ffmpeg -i reels/<naam>/preview.mp4 -af ebur128 -f null - 2>&1 | grep "I:"`. If the user says "music tez hai", lower `musicGain` (0.7); "effects dheeme" → `sfxGain`.
