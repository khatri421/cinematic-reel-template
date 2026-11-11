# Inspiration from another creator's reel (style, not copy)

The user saw a reel they love and wants "isi jaisa". Give them the FEEL: about 60-70% of the style DNA (mood, light, pacing, camera, structure) and 30-40% that is clearly their own. Never copy the creator's assets.

## The line
| May take (style) | Never take (content / assets) |
|---|---|
| colour mood and lighting (warm dusk, moonlit blue, golden divine) | their characters or designs, even "slightly changed" |
| camera grammar: push-ins, low angles, whip-pans, close-up rhythm | their drawings, frames, backgrounds, traced shapes |
| pacing: cuts per 10 s, scene length, when the climax hits | their voice, music, sound effects, or audio track |
| caption placement and rhythm (our caption look stays ours) | their script sentences, even with 2-4 words changed |
| hook formula, story structure, line length, dialogue share | their logo, watermark, channel or series name |
| transitions (flash, bloom, whip), particles, depth blur | remaking their reel scene by scene |

## Getting the reference into the repo
- **Phone:** screen-record the reel (Android: quick settings → Screen record; iPhone: Control Centre → Screen Recording). Trim to the best 15-20 s (GitHub's phone upload limit is 25 MB). Or take 5-8 screenshots: first frame, a caption frame, a close-up, a scene change, the last frame.
- Upload them into the reel folder `reels/<naam>/` on github.com (Add file → Upload files → Commit), next to script.txt. Any file name works. (A `ref/` subfolder also works.)
- **Laptop:** copy the files into `reels/<naam>/`.
- Do not download other people's reels with downloader websites: it breaks Instagram's terms and those sites are often unsafe. Screen recording for private study is the safe route.

## Video style → STYLE CARD
1. `npm run ref -- <naam>` (finds every video/screenshot in the reel folder except our preview/reel/check; makes `reels/<naam>/ref/analysis/`: 4-fps contact sheets, one key frame per second, cuts.txt, palette.txt, summary.txt).
2. Open the sheets and key frames (Read the images). Measure, do not guess:
   - cut rate (cuts per 10 s, average shot length) from cuts.txt;
   - palette: 4-6 hex colours per mood, from palette.txt;
   - light: where the key light is, rim light, god rays, glow, particles;
   - camera: what moves (push, pan, tilt, shake), how fast, how often close-ups come;
   - depth: blur on far layers? foreground passing the lens?
   - captions: position, words per line, highlight style;
   - transitions and the climax treatment.
3. Write `reels/<naam>/style.txt` with this card:
```
STYLE CARD (inspired by a reference, nothing copied)
Mood / palette:      <colours + where they appear>
Light:               <preset from LIGHTS or a custom Light object with these colours>
Pacing:              <avg shot s, cuts per 10 s, climax at ~% of reel>
Camera:              <moves per scene type>
Depth / effects:     <dof, particles, flares, grain>
Transitions:         <when flash / white / whip>
Captions:            <words per line; our gold-highlight look is kept>
Music feel:          <instruments, tempo, where it swells>
OUR 30-40% (different on purpose):
  1. <e.g. our own characters designed for this story>
  2. <e.g. a different key light / time of day for the climax>
  3. <e.g. a signature move of this channel: low-angle hero shot on the last line>
```
4. Show the card to the user in 6-8 short Hinglish lines before building. Then build the reel with the kit using the card: map palette to a custom `Light`, pacing to the scene split (you may add/move blank lines in script.txt; tell the user), camera to `cam` keys.

## Script style → new script with the same DNA
1. Rebuild the reference's words from the burnt-in captions on the contact sheets (4 frames per second is enough to read them). If there are no captions, the user can type what they remember.
2. Write its SCRIPT DNA, as numbers and formulas, not sentences:
   - hook type (virodhabhas / "main ___ hoon" / sawaal / seedha action) and how many words;
   - average words per line, lines per scene, speaking speed (words per second);
   - share of dialogue vs narration; where the question comes; where the twist comes (% of length);
   - ending formula ("aaj bhi...", cliffhanger, seekh, call to comment);
   - tone words (josh, rahasya, karuna...).
3. Write the user's story with that DNA. Then run the overlap check: no 4 or more consecutive words may match any line of the reference; change any line that does. Names of gods and places are allowed, of course.
4. Give both versions as usual (Devanagari for ElevenLabs, Hinglish for script.txt), with the DNA table on top so the user sees what was borrowed.

## Before rendering, ask yourself
"Would the original creator, seeing this next to theirs, say 'ye mera reel hai'?" If yes, change more: characters, light, camera, music. Inspiration should feel like the same genre, not the same reel.
