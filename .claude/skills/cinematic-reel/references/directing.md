# Directing: narration → shots

Treat each caption line as a beat. For every beat, decide what the audience should *feel* and pick the camera setup that produces that feeling. A reel that only illustrates the words is flat. A reel that adds one visual idea the words don't say (a tear, a shadow, a name tag, burnt feathers falling) is engaging.

## Camera grammar
| Purpose | Setup | How to do it in this codebase |
|---|---|---|
| Establish a place or character | Wide shot, slow tilt-down plus push-in from the sky | `camera()` keyframes: start `ty` high (the world pushed down), end on the character; z 1.0→1.5 |
| Point at a detail the narration names ("pankh", "aankh") | **Insert**: extreme close-up, z ≈ 4.3–4.8 | Same set, focus point on the detail; rack focus (blur 9→0 over 8 frames); extra embers or smoke |
| Emotion | Close-up on the face, a slow push | z ≈ 3.5–4; `eyes="sad"` or `closed`; a tear that slides |
| Loneliness, scale | Extreme wide, character tiny, lateral dolly | the `Sea.tsx` pattern; character at about 1/8 frame height |
| Reveal (a city, a god, an enemy) | Pan that continues past the character, tilt to the horizon, rack-focus the foreground | the `Sea.tsx` second half; gold glints that fade in |
| Flashback, memory | Whiteout or bloom into a bright, high-key palette | bloom overlay rising over the last 10–14 frames; fade from cream over 12 frames |
| Introduce a cast | Name tags on a stem below each character, popping in on their spoken name | `NameTag` in `Sky.tsx` |
| Energy, race, ascent | Clouds rush past, the camera climbs, flap rate up, speed lines, whip-pan out | the `race` ramp in `Sky.tsx` (ease-in cubic) |
| Danger | Silhouettes against a huge light, heat haze, the camera pushes in | `ShotSunRise` |
| Pain | Close-up with eyes closed, damage spreading, shake that grows, red pulse vignette, debris | `ShotScorch` (`char` 0→0.9 with ease-in) |
| Sacrifice, protection | The protector enters from out of frame (big, blurred, fast), settles between the danger and the victim, spreads his wings; his shadow falls over the victim | `ShotShield` |

## Pacing rules
- **Cut on caption-line boundaries.** The voice breathes there, so the cut feels motivated.
- **Shot length** is 1–3 s. Close-ups can be shorter (1 s); establishing shots and reveals run longer (2.5–4.5 s).
- **Something always moves**, even in "static" shots: breathing, flicker, particles, a 1.0→1.08 push.
- **Every shot needs one camera move** plus one subject move. Never use two big camera moves at once.
- **Transitions:**
  - plain cut by default;
  - a 2–3 frame white-hot flash for shock or pain;
  - whiteout or bloom for a time jump;
  - whip with blur for energy.
- **Ease everything:** `Easing.bezier(0.45,0,0.55,1)` for camera moves, ease-in for things accelerating toward a climax, ease-out for entrances.
- **Captions sit at top:172.** Keep faces and important action between y≈280 and y≈1150.

## Worked example: the 25 s Jatayu reel (24 fps)
| Frames | Narration | Shot | The extra visual idea |
|---|---|---|---|
| 0–54 | "Jatayu ka ek bhai tha..." | A: wide tilt-down from the sun to Sampati on his rock, pyramids, ruins, flag | the burnt wing stubs smoke quietly |
| 54–90 | "jiske pankh suraj" | B: insert on the burnt wing, rack focus, sparks | ember-red glow on the stubs |
| 90–114 | "ne jala diye." | C: close-up, sad eyelid, the tear slides down | the tear |
| 114–169 | "Aur usi bina pankhon wale pakshi" | D: extreme wide, a lonely island in the indigo sea, dolly right | reflection + foam, his smallness |
| 169–224 | "ne... Sita Maa ko dhoondh nikaala." | E: the pan reveals Lanka against the sun, glints, a flock passes the lens, bloom to white | gold glints = Lanka found |
| 224–360 | "Ek baar, jawani ke josh mein, dono bhai, Sampati aur Jatayu," | F: flashback flight over the cloud sea | name tags "SAMPATI · bade bhai", "JATAYU · chhote bhai"; shadows on the clouds |
| 360–401 | "hod lagakar suraj ki or ude." | G: race, the camera climbs, speed lines, whip out | Jatayu surges ahead |
| 401–474 | "Upar... aur upar." | H: silhouettes shrink into a plasma sun, heat haze | Jatayu pulls ahead on "aur upar" |
| 474–522 | "Jatayu ke pankh jhulasne lage." | I: close-up, eyes shut, wings char from the tips, falling feathers, shake | charred feathers falling |
| 522–600 | "Tab bade bhai Sampati ne apne pankh phailakar," | J: Sampati dives in and spreads his wings; his shadow covers Jatayu | the shadow as protection |

To continue a story past an existing reel, keep the same characters, palette logic and caption style. Escalate the visual ideas: each new beat should show something the previous beats didn't.
