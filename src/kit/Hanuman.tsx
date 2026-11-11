import React from "react";
import { HEAD_C as H_HEAD, Human, PALETTES, Pose, TAIL_TIP as H_TAIL } from "./Human";

/* Hanuman ji on the realistic-proportion rig (Human.tsx, kind="vanara"): heroic build, vermilion body, gold mukut,
   hanu (jaw) muzzle, gada, long tail with a flame tip. Same placement contract as every character
   (viewBox "-80 -10 360 310", feet on y = 298). Kept as a thin wrapper so shots keep their simple API.          */
export const HANUMAN = PALETTES.hanuman;
export const TAIL_TIP = H_TAIL;
export const HEAD_C = H_HEAD;

type Props = {
  id: string; t: number; pose?: "stand" | "leap" | "fly" | "namaste" | "bow" | Pose; fire?: number;
  eyes?: "open" | "sad" | "closed" | "angry"; smile?: number; rim?: string; arm?: number; mouth?: number;
};

export const Hanuman: React.FC<Props> = ({ id, t, pose = "stand", fire = 0, eyes = "open", smile = 0.4, rim = "#ffb067", arm = 0, mouth = 0 }) => (
  <Human id={id} t={t} kind="vanara" build={1} palette={HANUMAN} pose={pose} poseK={arm}
    weapon={pose === "namaste" || pose === "bow" ? "none" : "gada"} headwear="mukut" tail fire={fire} eyes={eyes} smile={smile} rim={rim} mouth={mouth} />
);
