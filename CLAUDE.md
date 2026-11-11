# Cinematic Mythology Reel Studio — master rules for Claude

The user is a beginner. Often they work ONLY from a phone (Claude app Code tab + github.com in the phone browser); sometimes from a laptop (Claude Desktop, folder like C:\reels). They send short messages like "karna-kavach ka preview banao". They do not know coding or git: you do everything.

**For HOW to make the reel (story research, characters, camera, light, sound, style inspiration) always use the `cinematic-reel` skill in `.claude/skills/cinematic-reel/`.** This file is the repo rules.

## 0. Never touch the environment
- NEVER change environment settings, network settings or the setup script, and NEVER ask the user to approve environment permissions (a phone cannot approve them).
- If anything is missing (ffmpeg, node_modules), run `bash setup.sh` inside the repo (Linux/cloud). `npm run preview/reel` already do this by themselves. On Windows: `npm ci`; ffmpeg via `winget install Gyan.FFmpeg`.

## 1. Talk style
- Simple Hinglish, short sentences, ONE step at a time. No jargon. Tell the user exactly what to tap/open.
- After each step say what happened and what comes next. Never paste long code or logs to the user.
- If the user seems lost, stop and explain in 2-3 lines. Never make them feel stupid.

## 2. Folder layout (do not rename)
- One folder per reel: `reels/<naam>/` with ONE audio file of ANY name (`.mp3 .m4a .wav .aac .ogg .opus`; never ask to rename) and `script.txt`.
  Several audio files → ask which one to use; delete (git rm) the others only after they say so.
- `<naam>`: lowercase English, numbers, `-` or `_`. Spaces/capitals → fix it yourself with `git mv` (the commands print the exact line), commit, tell the user the new name.
- Optional: `reels/<naam>/style.txt` (style card) and reference material: a screen recording / screenshots uploaded in `reels/<naam>/` (any name) or `reels/<naam>/ref/`. These are NOT audio: the one-audio rule ignores .mp4/.mov/.jpg/.png.
- You write: `reels/<naam>/brief.md`, `src/reels/<naam>.tsx`, `src/reels/<naam>.sound.json`, new characters in `src/characters/`.
- Outputs: `reels/<naam>/preview.mp4` (first 15 s), `reels/<naam>/reel.mp4` (full), `reels/<naam>/check.jpg` (your check sheet, not committed).
- `reels/example/` + `src/reels/example.tsx` is the demo (placeholder hum voice). Never delete it; never reuse its scenes for another story.

## 3. script.txt
- Hinglish in Roman letters, ONE spoken phrase per line. **Blank line = next scene** (1-2 lines per scene, ~2-3 s). No blank lines at all → every line is a scene. A `#` first line = small title at the top.
- The voice was usually made in ElevenLabs from a Devanagari version of the same lines. Subtitles ALWAYS come from `script.txt` (never transcribe the audio, never convert the script to Devanagari).
- Do not change the user's words. You MAY add/move blank lines for pacing; tell the user if you did.
- If the timing step prints that line count ≠ voice phrases and subtitles drift, split/join lines so each line is one breath of the voice, and tell the user.

## 4. Making a reel (do all of this without being asked) — details in the skill
1. Read script.txt (+ style.txt). Understand/research the story; write `reels/<naam>/brief.md`.
2. Tell the user the scene plan as a short numbered Hinglish list (scene → kya dikhega).
3. Design characters (realistic human rig), build `src/reels/<naam>.tsx` (`CHIP` + one `SCENES` entry per block), write `src/reels/<naam>.sound.json`.
4. `npx tsc -p .` must pass.

## 5. Render order (always)
1. `npm run preview -- <naam>` → open `reels/<naam>/check.jpg`, check every scene, fix problems and re-render. Then commit `reels/<naam>/preview.mp4` + your source files and push.
   Tell the user the exact path: github.com → repo → `reels/<naam>/preview.mp4` → download. Ask: "Preview theek hai? OK bolo to full reel banaun."
2. ONLY after the user says OK: `npm run reel -- <naam>` → check `check.jpg` → commit `reel.mp4`, push, give the path again.
- One render at a time. Render prints progress; that is normal. Long reels take 15-30 min in the cloud: tell the user they can close the app.
- A single command may time out after ~10 minutes. ALWAYS start `npm run reel` (and any preview that may exceed ~8 min) as a **background** command, then wait for it to finish and read its last lines (`DONE: ...` / `CHECK: ...`). Never start it twice; if unsure whether it is still running, check before starting again.

## 6. Git
- Commit and push to `main` when possible (`git push origin HEAD:main`). If not allowed, push your branch and ALWAYS tell the user which branch and how to switch to it on github.com (branch button at the top of the repo).
- Every video under 95 MB (GitHub limit 100 MB). If bigger, raise crf in `remotion.config.ts` or split the story into parts.
- If the repo gets big (`git count-objects -vH`, size-pack > 800 MB), offer to delete old `preview.mp4` files (only with the user's OK).
- Never commit `public/voice.wav`, `public/score.wav`, `check.jpg`, `ref/analysis/`.

## 7. Content rules
- Only the user's own voice and script, and art drawn in this repo. Never another creator's audio, script lines, characters, art, logo or watermark (style inspiration only: see the skill).
- Respect: correct iconography, deities with dignity, no mockery, no gore (suggest violence with light, smoke, sound). Source chip always (`CHIP`: e.g. `VALMIKI RAMAYAN`, `SHIV PURAN`, `LOK KATHA`).
- The cinematic 2.5D look is this channel's identity: do not switch to flat 2D, photo-real or another style unless the user explicitly asks.

## Tech notes
- Pipeline (`scripts/reel.mjs`): tighten pauses to 0.20 s → mouth envelope → subtitle timing (silence detection + script.txt, no Whisper) → score (`scripts/score.mjs`) → Remotion render 1080×1920 30 fps → check sheet.
- `remotion.config.ts` uses `CHROME_PATH` (cloud Chrome for Testing) when set; concurrency `REEL_CONCURRENCY` (default 2).
