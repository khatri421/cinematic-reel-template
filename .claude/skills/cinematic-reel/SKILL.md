---
name: cinematic-reel
description: Make a cinematic 2.5D mythology reel (Hanuman Lanka Dahan style) in this repo from reels/<naam>/ (one voice file + script.txt). Covers understanding and researching the story, designing new characters with realistic human anatomy, directing camera, light and depth shot by shot, writing the music + sound-effect cue sheet, the 15 s preview, changes, the full reel, and copying the STYLE (not content) of a reference reel or script. Use it for every request in this repo about making, changing or rendering a reel, adding a character, a style card, or a reference reel, e.g. "karna-kavach ka reel banao", "preview banao", "full reel banao", "ye style jaisa banao", even when the user does not name the skill.
---

# Cinematic 2.5D reel (this repo)

The user is a beginner, often on a phone. Talk in short, simple Hinglish, one step at a time. CLAUDE.md has the repo rules (folders, git, environment); this skill is HOW to make the reel look and sound right.

## The look (never change these)
- 2.5D: flat folk-ink art (outline `#2a1b2b`) in layered worlds with depth (`Stage` + `Layer`), automatic depth blur, rack focus on cuts.
- One dominant light per scene (`LIGHTS`): sky gradient, sun/moon, god rays, lens flare, rim light on every character, particles.
- People have realistic human anatomy (`src/kit/Human.tsx`); only the surface is folk art.
- Every frame moves: a camera move + a subject move + flicker/particles. Cut on the script's blank lines.
- Captions, title, source chip, vignette, grain, voice + ducked music: handled by the engine (`src/Reel.tsx`). Do not edit the engine for one story.

## Workflow for a new reel `reels/<naam>/`
1. **Read** `reels/<naam>/script.txt` (and `style.txt` if there is one).
2. **Understand the story** (`references/research.md`): which episode, characters, setting, beats, feeling, payoff. Use web search if available to check the canonical version and iconography; otherwise your knowledge. Write `reels/<naam>/brief.md` (short). Respect: deities with dignity, no gore.
3. **Plan the shots** (`references/directing.md`): one scene per blank-line block; for each: shot type, camera move, light preset, the extra visual idea. Show the user a numbered Hinglish list (scene → kya dikhega), max 1 line each. Then build without waiting, unless they asked to approve first.
4. **Characters** (`references/characters.md`): reuse `src/characters/*` if this story's character already exists (series consistency). Otherwise design new ones on the `Human` rig: palette, build, headwear, beard, weapon, heads, kind (human / vanara / rakshasa), female body. Save each in `src/characters/<name>.tsx`. Animals/birds: `Bird.tsx` grammar.
5. **Build** `src/reels/<naam>.tsx` with `CHIP` + `SCENES` (see `references/kit.md` skeleton and `src/reels/example.tsx`). New world for this story; never paste the example's scenes into another story.
6. **Sound** (`references/sound-design.md`): write `src/reels/<naam>.sound.json`: bed + ambience + one SFX per visible action, anchored with `scene` + `word` / `%`.
7. `npx tsc -p .` must pass.
8. `npm run preview -- <naam>` → **open `reels/<naam>/check.jpg`** (one frame per scene) and check: subject clear and inside frame, nothing under the captions, light source visible, bodies anatomically right (no broken limbs, feet on the ground), the climax on its word, and **nothing can be mistaken for something else** (see the self-check below). Fix and re-run until it is right, THEN commit + push and tell the user where the preview is.
9. Changes: do all the user's points in one go, re-run the preview, check again.
10. On "OK": `npm run reel -- <naam>`, check `check.jpg` again, commit + push, tell the path.

## Self-check: "could a viewer misread anything?"
Before showing any preview, look at every frame of check.jpg like a viewer who does not know the story, and ask for each object: what does this look like at first glance? If it could be mistaken for something else, fix it, then re-render. Typical traps:
- mountains that read as pyramids, hills that read as heaps or tents;
- a crown that reads as a hat or a pot, a gada that reads as a lollipop, a bow that reads as a stick;
- the wrong era or place: skyscrapers, modern clothes, cars, Egyptian or Greek buildings in a Bharat story;
- a deity with the wrong iconography (colour, weapon, vahana) or an undignified pose;
- a character facing away from the one they speak to, floating above the ground, or cut by the frame edge;
- text, logos or letters that appear inside the art by accident.
This rule covers every scene and every story, so the user never has to point these out one by one.

## Style from a reference reel / script
Follow `references/style-inspiration.md`: `npm run ref -- <naam>`, write `reels/<naam>/style.txt` (STYLE CARD with ~60-70% of the reference's style DNA and a stated 30-40% of our own), then build with it. For scripts: SCRIPT DNA table + a new script, overlap check (no 4+ consecutive words from the reference).

## Speed and usage
Rendering is heavy (2.5D blur + light). Preview first, always. One render at a time. If the reel is long (> 80 s), warn that the full render can take 15-30 minutes on the phone/cloud and that the phone can be closed meanwhile.

## References
- `references/kit.md` — every component and prop (read before writing scenes).
- `references/research.md` — understand the story first.
- `references/directing.md` — narration → shots, camera grammar, pacing.
- `references/characters.md` — realistic human rig, new characters.
- `references/style-bible.md` — palettes, lighting recipe, effects.
- `references/sound-design.md` — music + SFX cue sheet.
- `references/style-inspiration.md` — reference reels and scripts, style not copy.
