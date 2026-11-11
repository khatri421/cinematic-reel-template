import type React from "react";

/** What every scene's draw() receives.
 *  t     = seconds since the reel started (use for idle life: flicker, breathing, particles)
 *  lt    = seconds since THIS scene started (use for the scene's own animation)
 *  dur   = this scene's length in seconds (Stage camera keys use k = lt / dur automatically)
 *  talk  = 0..1 loudness of the voice right now; pass it as `mouth` to whoever is speaking
 *  words = the subtitle words spoken in this scene with their scene-local start time
 *  wordAt(text) = scene-local start time of the first word containing `text`, e.g. wordAt("jal") */
export type Ctx = {
  t: number; lt: number; dur: number; talk: number;
  words: { text: string; at: number }[];
  wordAt: (text: string) => number | undefined;
};

/** One scene = one block of script.txt (lines separated by a blank line).
 *  in = how the scene enters: "cut" (default), "flash" (white hit: shock, impact),
 *       "white" (bloom from white: flashback, divine), "black" (fade from black: new chapter),
 *       "whip" (blurred whip-pan: energy). */
export type SceneDef = {
  in?: "cut" | "flash" | "white" | "black" | "whip";
  draw: (c: Ctx) => React.ReactNode;
};
