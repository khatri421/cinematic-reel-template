# Understand the story before directing it

A reel made only from the words of the narration looks generic and often gets details wrong (wrong weapon, wrong colour of a god, wrong order of events, a character in the wrong place). Before you write a single shot, find out what story the narration is telling and what the audience expects to see. This takes 2–5 minutes and decides whether the reel feels "right" to people who know the story.

## 1. Read the transcript as a story
From `transcript.txt` (and anything the user said), answer:
- **Which story / episode is this?** Name it precisely, e.g. "Sundar Kand: Lanka Dahan", "Samudra Manthan: Halahal", "Dadhichi gives his bones for the Vajra", "Panchatantra: the monkey and the crocodile".
- **Who is in it?** Every named or implied character, plus crowds and animals.
- **Where and when?** Place, time of day, season, weather; the light that implies (sunset, moonlit night, fire-lit, divine glow).
- **What happens, beat by beat?** The cause → action → consequence chain the narration implies, including what happens *between* sentences.
- **What is the feeling of each beat?** Wonder, humour, menace, grief, triumph, devotion.
- **What is the point?** The moral or the emotional payoff of the last line. The final shot has to land it.

If the transcript is Hindi in Devanagari, read it in Hindi; do not translate word by word. Whisper mishears names (e.g. "हनुमान" → "हनु मान", "Jatayu" → "Jata you"). Fix them from context.

## 2. Search for the canonical version
Use web search (standard mode first) for the episode, with 2–4 queries in one go, for example:
- `<episode name> story summary` (e.g. `Lanka Dahan Hanuman story Sundar Kand summary`)
- `<character> iconography` (e.g. `Hanuman iconography gada mukut colour`)
- `<episode> Valmiki Ramayana` or the primary text name, when it is a scripture story
- the Hindi name, e.g. `लंका दहन कथा`

Read 2–3 good sources (a scripture translation site, an encyclopedia, a reputable temple or culture site). Note, with the source:
- the **sequence of events** and who does what;
- **iconography**: skin colour, clothing, ornaments, weapon, vahana, posture, mudra; e.g. Ram is shyam/blue with a bow, Hanuman is vermilion with a gada and mukut, Shiv has jata, the moon, the Ganga, a trident and a blue throat;
- **setting**: Lanka is golden and on an island; Ayodhya is on the Sarayu; Kailash is snowy; an ashram is a forest hermitage with a hut and a sacred fire;
- **regional variants** worth knowing (Valmiki vs Tulsidas vs folk versions). Follow the narration's version when it differs, and do not "correct" the user's story.

If the story is the user's own or a folk tale you cannot find, say so and build the brief from the transcript alone.

## 3. Write `reels/<naam>/brief.md`
Keep it short (one screen). Template:

```markdown
# <Episode name>
Source(s): <links>
Logline: <one sentence>
Moral / payoff: <what the last shot must make the viewer feel>

## Characters
| Character | Look (realistic human proportions unless an animal) | Palette | Props | Rig settings |
| Hanuman | heroic build, vermilion, hanu muzzle, long tail | PALETTES.hanuman | gada, mukut | kind="vanara" build=1 |

## Setting and light
<place, time, key light, palette pair from style-bible.md>

## Beats (narration line -> what happens -> feeling)
1. "Poonch mein aag!" -> rakshasas set his tail on fire -> menace turning to defiance
...

## Things to get right / avoid
- <iconography that must be correct>
- <anything sensitive: depict deities with dignity; no comic humiliation of revered figures; no gore>
```

## 4. Use the brief
- Each beat in the brief becomes one or more shots in the shot list (`references/directing.md`).
- Each beat's feeling chooses the camera setup *and* the sound (`references/sound-design.md`).
- Each character row becomes a `<Human …/>` configuration (`references/characters.md`), or a new component if it is an animal or a creature.
- Show the user the logline, the character list and the beat list in 5–8 lines before you build. If anything is ambiguous (which version of the story, which ending), ask once, then go.

## Respect
These are sacred stories for many viewers. Deities are drawn with dignity: correct iconography, calm and powerful faces, no slapstick at their expense, no violence shown graphically (suggest it with light, shadow, smoke and sound). Demons can be menacing but not gory.
