import React from "react";
import { Flame } from "./lankaWorld";

/* Realistic-proportion human / vanara / rakshasa rig in the folk-ink style.
   - Same placement contract as every character: viewBox "-80 -10 360 310", feet on y = GROUND (298), body centred on x = 100,
     facing right (3/4 profile). Place with  width = W,  height = W / (360/310),  top = feetY - 298 * (W/360).
   - Anatomy (male): 7.5 heads tall (head = 38 units), shoulders = 2 heads wide, crotch at half height,
     upper arm 52 / forearm 46 / hand 18, thigh 72 / shin 66, fingertips reach mid-thigh, elbows at the waist.
     Female: shoulders narrower, waist narrower, hips wider, longer neck, softer limbs.
   - Limbs are tapered muscle shapes (deltoid, biceps, forearm, quads, calf), with a cel-shade strip on the side away
     from the light and a rim-light strip on the lit side, exactly like the rest of the series.
   - Joint angles are degrees; 0 = limb hanging straight down. Negative swings a limb FORWARD (toward +x, the facing
     direction): arm -90 = pointing ahead, -180 = straight up. Knees bend with positive shin angles.          */

export const GROUND = 298;
const INK = "#2a1b2b";
const GOLD = "#f2c12e", GOLD_D = "#c98a12", RUBY = "#d6262c", TEAL = "#2bb3a3";
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export type HumanPalette = {
  skin: string; skinDark: string; skinLight: string; face: string;   // face = muzzle/face-centre tone (vanara) or same as skin
  hair: string; cloth: string; clothDark: string; border: string; upper?: string; // upper = optional upper-body cloth (angavastra / blouse)
};
export const PALETTES = {
  hanuman: { skin: "#df6a2e", skinDark: "#9a3418", skinLight: "#f6a35e", face: "#fbd3a4", hair: "#8a2c1a", cloth: "#f2b627", clothDark: "#c47f16", border: RUBY },
  rishi: { skin: "#c98a5e", skinDark: "#8a5434", skinLight: "#e8b48a", face: "#c98a5e", hair: "#f1ede4", cloth: "#f08a24", clothDark: "#b55a12", border: "#fff3d0" },
  ram: { skin: "#4a7cc0", skinDark: "#2a4c88", skinLight: "#8ab4e8", face: "#4a7cc0", hair: "#1c1424", cloth: "#f2c12e", clothDark: "#c48a16", border: RUBY, upper: "#e2563a" },
  king: { skin: "#d9a074", skinDark: "#9a6440", skinLight: "#f3c9a0", face: "#d9a074", hair: "#1c1424", cloth: "#7a2a8a", clothDark: "#4e1858", border: GOLD, upper: "#d6262c" },
  ravan: { skin: "#7a4a7a", skinDark: "#4a2450", skinLight: "#a878a8", face: "#7a4a7a", hair: "#140c18", cloth: "#2a1a3a", clothDark: "#140c20", border: GOLD, upper: "#8a1a2a" },
  sita: { skin: "#e8b088", skinDark: "#b07a58", skinLight: "#fad4b4", face: "#e8b088", hair: "#1c1424", cloth: "#d6262c", clothDark: "#8a1420", border: GOLD, upper: "#f2b627" },
  villager: { skin: "#b97a50", skinDark: "#7a4a2a", skinLight: "#dca47a", face: "#b97a50", hair: "#1c1424", cloth: "#f3ead8", clothDark: "#c8b89a", border: "#2a6aa8" },
} satisfies Record<string, HumanPalette>;

/** Joint angles. f = front (near the viewer, drawn on top), b = back (behind the body, slightly darker). */
export type Pose = {
  root?: number; drop?: number; torso: number; head: number;
  fArm: [number, number]; bArm: [number, number]; fLeg: [number, number]; bLeg: [number, number];
  fHand?: "fist" | "open" | "namaste"; bHand?: "fist" | "open" | "namaste"; flatFeet?: boolean;
};
export type PoseName = "stand" | "leap" | "walk" | "run" | "namaste" | "sit" | "bow" | "point" | "bless" | "fly";

/** Pose presets. `k` = 0..1 blend for raise-type poses, `t` = time for cycles. */
export const posePreset = (name: PoseName, t: number, k = 0): Pose => {
  const s = Math.sin(t * 7.5), c = Math.cos(t * 7.5);
  switch (name) {
    case "leap": return { root: 14, torso: 10, head: -12, fArm: [-150, -14], bArm: [48, -36], fLeg: [-78, 96], bLeg: [34, 46], fHand: "fist" };
    case "fly": return { root: 62, torso: 6, head: -40, fArm: [-168, -4], bArm: [-160, -8], fLeg: [8, 18], bLeg: [22, 30], fHand: "fist" };
    case "walk": return { torso: 3, head: -2, fArm: [-22 * s, -14 - 8 * Math.max(0, s)], bArm: [22 * s, -14 - 8 * Math.max(0, -s)], fLeg: [24 * s, 10 + 22 * Math.max(0, -c)], bLeg: [-24 * s, 10 + 22 * Math.max(0, c)], flatFeet: true, drop: -2 * Math.abs(c) };
    case "run": return { root: 8, torso: 6, head: -6, fArm: [-50 * s, -80], bArm: [50 * s, -80], fLeg: [-55 * s - 10, 30 + 50 * Math.max(0, -c)], bLeg: [55 * s - 10, 30 + 50 * Math.max(0, c)], fHand: "fist", bHand: "fist", drop: 6 - 4 * Math.abs(c) };
    case "namaste": return { torso: 0, head: 6, fArm: [10, -160], bArm: [18, -164], fLeg: [-4, 2], bLeg: [4, 2], fHand: "namaste", bHand: "namaste", flatFeet: true };
    case "sit": return { drop: 112, torso: 0, head: 4, fArm: [-12, -58], bArm: [-4, -62], fLeg: [-88, 152], bLeg: [-82, 160], fHand: "open", bHand: "open" };
    case "bow": return { torso: lerp(0, 38, k), head: lerp(0, 22, k), fArm: [lerp(10, -20, k), lerp(-160, -130, k)], bArm: [lerp(18, -12, k), lerp(-164, -134, k)], fLeg: [-4, 2], bLeg: [4, 2], fHand: "namaste", bHand: "namaste", flatFeet: true };
    case "point": return { torso: -2, head: -4, fArm: [lerp(-18, -96, k), lerp(-20, -4, k)], bArm: [12, -10], fLeg: [-8, 4], bLeg: [8, 2], fHand: "open", flatFeet: true };
    case "bless": return { torso: 0, head: 4, fArm: [lerp(-16, -40, k), lerp(-20, -108, k)], bArm: [10, -14], fLeg: [-4, 2], bLeg: [4, 2], fHand: "open", flatFeet: true };
    case "stand":
    default: return { torso: 0, head: 0, fArm: [lerp(-26, -168, k), lerp(-56, -18, k)], bArm: [12, -16], fLeg: [-6, 4], bLeg: [7, 3], fHand: "fist", flatFeet: true };
  }
};

/** Tapered muscle segment along +y. a = top width, b = belly width, c = bottom width; fb/bb push the belly out on the
 *  front (+x) or back (-x) side; at = where the belly sits (0..1). */
const segD = (len: number, a: number, b: number, c: number, at = 0.38, fb = 0, bb = 0) => {
  const y1 = len * at * 0.55, y2 = len * Math.min(0.95, at * 1.5);
  return `M${-a / 2},0 C${-b / 2 - bb},${y1} ${-b / 2 - bb},${y2} ${-c / 2},${len} ` +
    `C${-c / 2},${len + c * 0.55} ${c / 2},${len + c * 0.55} ${c / 2},${len} ` +
    `C${b / 2 + fb},${y2} ${b / 2 + fb},${y1} ${a / 2},0 C${a / 2},${-a * 0.5} ${-a / 2},${-a * 0.5} ${-a / 2},0Z`;
};

const Seg: React.FC<{ len: number; a: number; b: number; c: number; at?: number; fb?: number; bb?: number; fill: string; dark: string; rim?: string; muscle?: string }> =
  ({ len, a, b, c, at, fb = 0, bb = 0, fill, dark, rim, muscle }) => {
    const d = segD(len, a, b, c, at, fb, bb);
    return (
      <g>
        <path d={d} fill={fill} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        {/* cel-shade strip on the back side + rim on the front side */}
        <path d={segD(len, a * 0.42, b * 0.42, c * 0.42, at, 0, bb * 0.5)} transform={`translate(${-a * 0.27},0)`} fill={dark} opacity={0.45} />
        {muscle && <path d={muscle} stroke={dark} strokeWidth={1.1} fill="none" opacity={0.7} strokeLinecap="round" />}
        {rim && <path d={`M${a / 2 - 1.5},${len * 0.1} C${b / 2 + fb - 1.5},${len * 0.35} ${b / 2 + fb - 1.5},${len * 0.6} ${c / 2 - 1.2},${len * 0.92}`} stroke={rim} strokeWidth={1.8} fill="none" opacity={0.65} strokeLinecap="round" />}
      </g>
    );
  };

const Band: React.FC<{ y: number; w: number; gem?: boolean }> = ({ y, w, gem }) => (
  <g>
    <rect x={-w / 2 - 0.5} y={y} width={w + 1} height={3.6} rx={1.2} fill={GOLD} stroke={INK} strokeWidth={0.8} />
    {gem && <circle cx={0.5} cy={y + 1.8} r={1.6} fill={RUBY} stroke={INK} strokeWidth={0.4} />}
  </g>
);

const Hand: React.FC<{ kind: "fist" | "open" | "namaste"; skin: string; dark: string }> = ({ kind, skin, dark }) => {
  if (kind === "fist") return (
    <g>
      <path d="M-6,-1 C-7,6 -6,13 -1,15 C4,16 8,13 8,8 C8,3 6,-1 3,-2Z" fill={skin} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M2,4 L8,4 M2,8 L8,8 M2,12 L7,12" stroke={dark} strokeWidth={0.9} />
      <path d="M-5,3 C-1,4 2,6 3,9" stroke={INK} strokeWidth={1} fill="none" />
    </g>
  );
  if (kind === "namaste") return (
    <g>
      <path d="M-4,-1 C-6,7 -3,17 3,22 C6,16 6,6 4,-1Z" fill={skin} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M0,4 L2,19" stroke={dark} strokeWidth={0.8} />
    </g>
  );
  return ( // open palm, fingers together, thumb out
    <g>
      <path d="M-5,-1 C-6,6 -5,14 -2,19 C0,21 3,20 4,17 C6,12 6,5 4,-1Z" fill={skin} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M4,3 C8,4 10,7 9,9 C7,9 5,8 4,7" fill={skin} stroke={INK} strokeWidth={1.1} />
      <path d="M-2,9 L-1,18 M1,9 L2,18" stroke={dark} strokeWidth={0.7} />
    </g>
  );
};

/** Gada with grip at (0,0), head up the -y axis (sized for a 7.5-head figure). */
export const Gada: React.FC = () => (
  <g>
    <rect x={-2.6} y={-74} width={5.2} height={94} rx={2.4} fill="#a8661a" stroke={INK} strokeWidth={1.3} />
    {[-10, 8].map((y) => <rect key={y} x={-3.8} y={y} width={7.6} height={3} fill={GOLD} stroke={INK} strokeWidth={0.6} />)}
    <ellipse cx={0} cy={-93} rx={17} ry={20} fill={GOLD} stroke={INK} strokeWidth={1.6} />
    <path d="M0,-113 C10,-107 17,-100 17,-93 C17,-83 10,-76 0,-73Z" fill={GOLD_D} opacity={0.45} />
    {[-102, -93, -84].map((y) => <path key={y} d={`M-16,${y} Q0,${y + 4} 16,${y}`} stroke="#a8661a" strokeWidth={1.1} fill="none" />)}
    <path d="M-6,-106 Q-10,-96 -6,-83" stroke="#fff4b0" strokeWidth={2} fill="none" opacity={0.8} strokeLinecap="round" />
    <path d="M-4,-112 L0,-123 L4,-112Z" fill={GOLD} stroke={INK} strokeWidth={1} />
    <circle cx={0} cy={-93} r={3} fill={RUBY} stroke={INK} strokeWidth={0.8} />
  </g>
);

export type HumanProps = {
  id: string; t: number;
  kind?: "human" | "vanara" | "rakshasa";
  body?: "male" | "female";
  build?: number;              // 0 slim .. 1 heroic (shoulder width, muscle mass)
  palette?: HumanPalette;
  pose?: PoseName | Pose; poseK?: number;
  headwear?: "mukut" | "jata" | "long" | "short" | "bun" | "none";
  beard?: boolean; moustache?: boolean;
  weapon?: "gada" | "bow" | "none";
  tail?: boolean; fire?: number;
  eyes?: "open" | "sad" | "closed" | "angry"; smile?: number; tear?: number;
  heads?: number;              // Ravan = 10 (draws the extra heads fanned behind the main one)
  mouth?: number;              // 0..1 lip-sync: pass ctx.talk while this character speaks
  blink?: boolean;             // automatic blinking (default true)
  rim?: string; light?: number; // light = rim opacity multiplier
};

/** Tail tip (stand pose) in viewBox coords — for camera inserts / smoke. */
export const TAIL_TIP: [number, number] = [38, 22];
/** Head centre (stand pose) in viewBox coords — for close-up framing. */
export const HEAD_C: [number, number] = [106, 30];

export const Human: React.FC<HumanProps> = ({
  id, t, kind = "human", body = "male", build = 0.6, palette, pose = "stand", poseK = 0,
  headwear = "mukut", beard = false, moustache, weapon = "none", tail, fire = 0,
  eyes: eyesIn = "open", smile = 0.3, tear = 0, rim = "#ffd0a0", light = 1, mouth = 0, blink = true, heads = 1,
}) => {
  const p: HumanPalette = palette ?? (kind === "vanara" ? PALETTES.hanuman : kind === "rakshasa" ? PALETTES.ravan : PALETTES.king);
  const P: Pose = typeof pose === "string" ? posePreset(pose, t, poseK) : pose;
  const fem = body === "female";
  const hasTail = tail ?? kind === "vanara";
  const breathe = Math.sin(t * 2.2) * 0.8;
  const B = fem ? 0 : build;
  // proportions
  const shW = fem ? 30 : lerp(32, 40, B);      // half shoulder width (3/4 view compresses the far side)
  const waist = fem ? 15 : lerp(18, 20, B);
  const hipW = fem ? 25 : lerp(19, 21, B);
  const armT = fem ? 0.82 : lerp(0.9, 1.15, B);  // limb thickness factor
  const legT = fem ? 0.9 : lerp(0.95, 1.12, B);
  const pelvisY = 146 + (P.drop ?? 0);
  const rimO = 0.65 * light;
  const shade = `${id}-shade`, clipT = `${id}-torso`;

  // torso outline in pelvis space (up = -y), 3/4 view: back on the left, chest on the right
  const torsoD = fem
    ? `M${-hipW},0 C${-hipW - 2},-14 ${-waist - 2},-30 ${-waist},-42 C${-waist + 1},-58 ${-shW + 2},-70 ${-shW + 4},-82 C${-shW + 10},-88 -12,-90 -6,-92 L6,-92 C14,-90 ${shW - 8},-88 ${shW - 2},-82 C${shW + 1},-76 ${shW + 2},-68 ${waist + 8},-60 C${waist + 4},-54 ${waist},-48 ${waist},-42 C${waist + 1},-30 ${hipW + 4},-14 ${hipW + 2},0Z`
    : `M${-hipW},0 C${-hipW - 2},-16 ${-waist},-32 ${-waist - 6},-52 C${-shW + 2},-66 ${-shW - 2},-76 ${-shW + 2},-84 C${-shW + 12},-90 -14,-90 -8,-92 L8,-92 C16,-90 ${shW - 10},-90 ${shW - 2},-84 C${shW + 3},-78 ${shW + 1},-68 ${waist + 10},-60 C${waist + 4},-50 ${waist},-38 ${waist + 1},-26 C${waist + 2},-14 ${hipW + 3},-6 ${hipW + 2},0Z`;
  const fSh: [number, number] = [shW - 8, -82], bSh: [number, number] = [-shW + 8, -83];
  const fHip: [number, number] = [hipW - 9, -2], bHip: [number, number] = [-hipW + 9, -4];

  const skin = p.skin, dark = p.skinDark;
  const upperArm = (rimC?: string, tone = skin) => (
    <Seg len={50} a={13 * armT} b={15.5 * armT} c={10 * armT} at={0.36} fb={2 * armT} fill={tone} dark={dark} rim={rimC}
      muscle={`M${3 * armT},10 C${6 * armT},20 ${6 * armT},30 ${3 * armT},40`} />
  );
  const foreArm = (rimC?: string, tone = skin) => (
    <Seg len={44} a={10.5 * armT} b={11.5 * armT} c={7 * armT} at={0.25} bb={1.2 * armT} fill={tone} dark={dark} rim={rimC} />
  );

  const Arm = ({ front }: { front: boolean }) => {
    const [a1, a2] = front ? P.fArm : P.bArm;
    const sh = front ? fSh : bSh;
    const tone = front ? skin : dark;
    const hand = (front ? P.fHand : P.bHand) ?? "open";
    const holdsGada = front && weapon === "gada";
    const holdsBow = front && weapon === "bow";
    return (
      <g transform={`translate(${sh[0]},${sh[1]}) rotate(${a1})`}>
        {upperArm(front ? rim : undefined, tone)}
        {!fem && <Band y={14} w={14 * armT} gem />}
        <g transform={`translate(0,50) rotate(${a2})`}>
          {foreArm(front ? rim : undefined, tone)}
          <Band y={38} w={8.5 * armT} />
          <g transform="translate(0,45)">
            {holdsGada && <g transform={`translate(1,6) rotate(${-(a1 + a2 + (P.torso ?? 0)) + lerp(-6, 12, poseK) + (P.root ?? 0) * -1})`}><Gada /></g>}
            {holdsBow && (
              <g transform={`translate(1,6) rotate(${-(a1 + a2)})`}>
                <path d="M0,-70 C22,-40 22,40 0,70" stroke="#8a4a1a" strokeWidth={3.2} fill="none" strokeLinecap="round" />
                <path d="M0,-70 C22,-40 22,40 0,70" stroke={INK} strokeWidth={0.8} fill="none" opacity={0.6} />
                <path d="M0,-70 L0,70" stroke="#f3ead8" strokeWidth={0.8} />
              </g>
            )}
            <Hand kind={holdsGada || holdsBow ? "fist" : hand} skin={tone} dark={dark} />
          </g>
        </g>
      </g>
    );
  };

  const Leg = ({ front }: { front: boolean }) => {
    const [a1, a2] = front ? P.fLeg : P.bLeg;
    const hip = front ? fHip : bHip;
    const tone = front ? skin : dark;
    const footRot = P.flatFeet ? -(a1 + a2) - (P.root ?? 0) : 18;
    const cloth = front ? p.cloth : p.clothDark;
    return (
      <g transform={`translate(${hip[0]},${hip[1]}) rotate(${a1})`}>
        <Seg len={70} a={19 * legT} b={19.5 * legT} c={11.5 * legT} at={0.3} fb={3 * legT} fill={tone} dark={dark} rim={front ? rim : undefined}
          muscle={`M${4 * legT},18 C${7 * legT},34 ${6 * legT},50 ${2 * legT},62`} />
        {/* dhoti leg: loose cloth from hip to just below the knee (men); women wear the long skirt instead */}
        {!fem && (
          <g>
            <path d={`M${-12.5 * legT},-6 C${-14 * legT},30 ${-12 * legT},60 ${-10 * legT},78 C-2,82 6,82 ${11 * legT},77 C${14 * legT},58 ${15 * legT},30 ${13 * legT},-6Z`}
              fill={cloth} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
            <path d={`M${-4 * legT},4 C${-6 * legT},30 ${-4 * legT},56 ${-3 * legT},76 M${5 * legT},2 C${4 * legT},26 ${6 * legT},50 ${6 * legT},74`} stroke={p.clothDark} strokeWidth={1.1} fill="none" opacity={0.8} />
            <path d={`M${-10 * legT},74 C-2,79 6,79 ${11 * legT},73 L${11 * legT},77 C6,82 -2,82 ${-10 * legT},78Z`} fill={p.border} stroke={INK} strokeWidth={0.8} />
          </g>
        )}
        <g transform={`translate(0,70) rotate(${a2})`}>
          <Seg len={62} a={12 * legT} b={14 * legT} c={7 * legT} at={0.32} bb={3.2 * legT} fill={tone} dark={dark} rim={front ? rim : undefined} />
          <Band y={56} w={7.5 * legT} />
          {/* foot: heel back, toes forward */}
          <g transform={`translate(0,64) rotate(${footRot})`}>
            <path d="M-5,-4 C-7,2 -6,6 -3,7 L14,8 C18,8 19,5 16,3 C11,1 6,-1 4,-5Z" fill={tone} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M12,5 L12,8 M15,4 L15,7" stroke={dark} strokeWidth={0.7} />
          </g>
        </g>
      </g>
    );
  };

  /* ---------- head (local origin = top of the neck, up = -y, face to the right) ---------- */
  const vanara = kind === "vanara";
  // automatic blink: ~every 3.4 s, offset per character id, 0.12 s long
  const idHash = [...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7) / 997;
  const eyes = blink && eyesIn !== "closed" && ((t + idHash * 3.4) % 3.4) < 0.12 ? "closed" : eyesIn;
  const mo = Math.max(0, Math.min(1, mouth));
  const Head = () => {
    const eyeY = -21, eyeX = 8;
    return (
      <g>
        {/* hair behind the head */}
        {headwear === "long" && <path d="M-12,-34 C-24,-22 -22,2 -14,20 C-10,10 -6,0 -4,-8Z" fill={p.hair} stroke={INK} strokeWidth={1.4} />}
        {fem && headwear !== "jata" && <path d="M-12,-30 C-22,-16 -22,8 -18,30 C-12,26 -8,12 -6,-6Z" fill={p.hair} stroke={INK} strokeWidth={1.4} />}
        {/* ear */}
        {vanara
          ? <g><circle cx={-4} cy={-19} r={6.5} fill={p.hair} stroke={INK} strokeWidth={1.3} /><circle cx={-3.5} cy={-19} r={3.2} fill={p.face} /></g>
          : <path d="M-6,-24 C-11,-24 -11,-14 -6,-13Z" fill={skin} stroke={INK} strokeWidth={1.2} />}
        {/* skull + face profile: forehead, brow, nose, lips, chin, jaw */}
        <path
          d={vanara
            ? "M-12,-34 C-4,-41 9,-39 14,-30 C16,-26 16,-23 15,-21 C21,-21 27,-15 27,-9 C27,-1 20,4 11,3 C4,2 -2,-2 -6,-6 C-11,-10 -15,-18 -15,-25 C-15,-29 -14,-32 -12,-34Z"
            : fem
              ? "M-12,-34 C-4,-40 8,-38 12,-30 C14,-27 14,-24 14,-22 C14,-20 15,-18 17.5,-14.5 C16.5,-13 15,-13 14.2,-12.8 C15,-11.5 15,-10 14.4,-9 C15,-8 15,-7 14,-6 C13.5,-3 12,0 9,1 C5,1.5 0,-1 -4,-5 C-9,-9 -14,-16 -14,-24 C-14,-28 -13.5,-31 -12,-34Z"
              : "M-12,-34 C-4,-41 9,-39 13,-30 C15,-27 15,-24 15,-22 C15,-20 16,-18 19,-14 C18,-12 16,-12 15,-12 C16,-11 16,-9 15.4,-8 C16,-7 16,-6 15,-5 C15,-2 15,0 13,1.5 C10,3 3,2 -2,-3 C-7,-7 -11,-9 -14,-15 C-16,-22 -15,-30 -12,-34Z"}
          fill={skin} stroke={INK} strokeWidth={1.7} strokeLinejoin="round" />
        {/* cheek / jaw shading on the side away from the light */}
        <path d="M-2,-12 C2,-4 8,-1 12,0 C6,-3 2,-8 1,-14Z" fill={dark} opacity={0.35} />
        {vanara && (
          <g>
            {/* fur frame + the swollen hanu (jaw) muzzle that is Hanuman's signature */}
            <path d="M-12,-34 C-4,-41 9,-39 14,-30 C10,-32 2,-33 -4,-30 C-9,-26 -10,-16 -6,-6 C-11,-10 -15,-18 -15,-25 C-15,-29 -14,-32 -12,-34Z" fill={p.hair} opacity={0.85} />
            <path d="M4,-26 C9,-30 15,-28 16,-22 C22,-22 27,-15 27,-9 C27,-1 20,4 11,3 C5,2 1,-3 1,-10 C1,-16 1,-22 4,-26Z" fill={p.face} stroke={INK} strokeWidth={1.4} />
            <path d={`M12,-3 Q19,${-3 + smile * 4} 25,${-6 - smile * 1.5}`} stroke={INK} strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <circle cx={23.5} cy={-13} r={1.1} fill={INK} /><circle cx={20.5} cy={-12.5} r={1} fill={INK} />
            <path d="M8,-1 C14,4 22,3 26,-3" stroke="#e39a72" strokeWidth={2} fill="none" opacity={0.7} />
          </g>
        )}
        {!vanara && (
          <g>
            {/* lips + mouth corner (smile lifts the corner) */}
            <path d={`M12.5,-9 Q14,${-9.4 + smile * 0.3} 15.4,-9.2`} stroke={INK} strokeWidth={0.9} fill="none" />
            <path d={`M10,${-9 - smile * 1.6} Q11.5,-8.6 12.5,-9`} stroke={INK} strokeWidth={0.9} fill="none" />
            <path d="M14.4,-12.6 C15.6,-12 15.8,-10.2 15.2,-9.6" fill="#b4504a" opacity={0.35} />
            {/* nostril */}
            <path d="M15.5,-14 Q14.5,-13.2 15.2,-12.6" stroke={INK} strokeWidth={0.8} fill="none" />
          </g>
        )}
        {/* eye (almond, profile) */}
        {eyes === "closed" ? (
          <g>
            <path d={`M${eyeX - 4},${eyeY} Q${eyeX},${eyeY + 2.6} ${eyeX + 4},${eyeY - 0.4}`} stroke={INK} strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <path d={`M${eyeX - 5},${eyeY - 4.5} Q${eyeX},${eyeY - 3.6} ${eyeX + 5},${eyeY - 5.2}`} stroke={INK} strokeWidth={1.2} fill="none" />
          </g>
        ) : (
          <g>
            <path d={`M${eyeX - 4},${eyeY} Q${eyeX},${eyeY - 3.6} ${eyeX + 4.2},${eyeY - 0.2} Q${eyeX},${eyeY + 2.2} ${eyeX - 4},${eyeY}Z`} fill="#fff" stroke={INK} strokeWidth={1} />
            <circle cx={eyeX + 1.2} cy={eyeY - 0.4} r={1.7} fill={INK} />
            <circle cx={eyeX + 1.8} cy={eyeY - 1} r={0.55} fill="#fff" />
            {fem && <path d={`M${eyeX - 4.5},${eyeY - 0.3} Q${eyeX},${eyeY - 4.2} ${eyeX + 5.2},${eyeY - 0.6}`} stroke={INK} strokeWidth={1.4} fill="none" />}
            {eyes === "sad" && <path d={`M${eyeX - 4.3},${eyeY - 0.2} Q${eyeX},${eyeY - 4} ${eyeX + 4.4},${eyeY - 0.4} L${eyeX + 4.4},${eyeY - 1.6} Q${eyeX},${eyeY - 5} ${eyeX - 4.3},${eyeY - 1.4}Z`} fill={dark} stroke={INK} strokeWidth={0.7} />}
            <path d={eyes === "angry" ? `M${eyeX - 5},${eyeY - 6.5} L${eyeX + 5},${eyeY - 3.2}` : eyes === "sad" ? `M${eyeX - 5},${eyeY - 4.2} Q${eyeX},${eyeY - 5.2} ${eyeX + 5},${eyeY - 6.2}` : `M${eyeX - 5},${eyeY - 4.6} Q${eyeX},${eyeY - 7.2} ${eyeX + 5.4},${eyeY - 4.8}`}
              stroke={vanara ? INK : p.hair === "#f1ede4" ? "#9a9488" : INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </g>
        )}
        {tear > 0 && (
          <g opacity={Math.min(1, tear * 3)}>
            <path d={`M${eyeX - 1},${eyeY + 2} L${eyeX - 1.5},${eyeY + 2 + tear * 12}`} stroke="#bfe6ff" strokeWidth={0.9} opacity={0.6} />
            <path d={`M${eyeX - 1.5},${eyeY + 1 + tear * 12} q-1.6,2.6 0,3.4 q1.6,-0.8 0,-3.4Z`} fill="#dff4ff" stroke={INK} strokeWidth={0.5} />
          </g>
        )}
        {/* tilak */}
        <path d="M11,-33 L11,-28" stroke={vanara ? RUBY : "#e8e0d0"} strokeWidth={1.6} strokeLinecap="round" />
        {!vanara && <path d="M11,-31 L11,-28.5" stroke={RUBY} strokeWidth={0.9} strokeLinecap="round" />}
        {/* moustache + beard */}
        {(moustache ?? (beard || kind === "rakshasa")) && !vanara && <path d="M9,-11.5 C12,-12.5 15,-12 16.5,-10.5 C14,-10 11,-10 8,-9Z" fill={p.hair} stroke={INK} strokeWidth={0.7} />}
        {beard && !vanara && <path d="M-4,-6 C0,-2 8,-2 15,-6 C17,4 13,18 4,28 C2,18 -2,8 -6,0Z" fill={p.hair} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />}
        {beard && !vanara && <path d="M4,0 C6,8 6,16 4,24 M9,-2 C10,6 9,12 8,18" stroke={INK} strokeWidth={0.6} opacity={0.4} fill="none" />}
        {/* kundal */}
        <circle cx={-5} cy={-10} r={2.6} fill="none" stroke={GOLD} strokeWidth={1.4} />
        {fem && <circle cx={14.6} cy={-15} r={0.9} fill={GOLD} />}
        {/* headwear */}
        {headwear === "mukut" && (
          <g>
            <path d="M-13,-33 L-10,-50 L-4,-44 L2,-62 L8,-44 L13,-50 L15,-33Z" fill={GOLD} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M2,-62 L8,-44 L13,-50 L15,-33 L4,-33Z" fill={GOLD_D} opacity={0.4} />
            <rect x={-14} y={-35.5} width={30} height={4.6} rx={1.5} fill="#e3a91f" stroke={INK} strokeWidth={1.1} />
            <circle cx={2} cy={-45} r={2.4} fill={RUBY} stroke={INK} strokeWidth={0.7} />
            <circle cx={-7} cy={-33} r={1.3} fill={TEAL} /><circle cx={10} cy={-33} r={1.3} fill={TEAL} />
            <circle cx={2} cy={-64} r={1.8} fill={GOLD} stroke={INK} strokeWidth={0.7} />
          </g>
        )}
        {headwear === "jata" && (
          <g>
            <path d="M-14,-28 C-16,-40 -4,-44 6,-40 C12,-38 14,-34 13,-30 C6,-34 -4,-34 -14,-28Z" fill={p.hair} stroke={INK} strokeWidth={1.3} />
            <path d="M-8,-38 C-12,-52 0,-60 8,-52 C12,-48 10,-42 4,-40Z" fill={p.hair} stroke={INK} strokeWidth={1.3} />
            <path d="M-6,-44 C-2,-48 2,-48 6,-46 M-4,-50 C0,-54 4,-52 6,-50" stroke={INK} strokeWidth={0.6} opacity={0.5} fill="none" />
            <path d="M-9,-40 L7,-42" stroke="#d9b36a" strokeWidth={1.6} />
          </g>
        )}
        {(headwear === "short" || headwear === "long" || headwear === "bun") && (
          <path d="M-14,-24 C-17,-36 -4,-44 8,-40 C12,-38 14,-34 13,-30 C4,-34 -6,-32 -10,-20Z" fill={p.hair} stroke={INK} strokeWidth={1.3} />
        )}
        {headwear === "bun" && <circle cx={-12} cy={-32} r={6.5} fill={p.hair} stroke={INK} strokeWidth={1.3} />}
        {fem && headwear === "mukut" && <path d="M-14,-24 C-17,-34 -8,-38 -2,-36" stroke={p.hair} strokeWidth={4} fill="none" />}
        {/* lip-sync mouth */}
        {mo > 0.04 && (vanara
          ? <g><ellipse cx={19} cy={-2.6} rx={4.2} ry={0.6 + 3.4 * mo} fill="#3a1414" stroke={INK} strokeWidth={0.9} /><path d={`M16,${-2.6 - 0.4 * mo} L22,${-2.6 - 0.4 * mo}`} stroke="#fff" strokeWidth={0.9} opacity={mo > 0.35 ? 0.85 : 0} /></g>
          : <g><ellipse cx={13.4} cy={-8.4} rx={fem ? 1.7 : 2} ry={0.3 + 2.1 * mo} fill="#3a1414" stroke={INK} strokeWidth={0.7} /><path d={`M12,${-8.6 - mo * 0.6} L14.8,${-8.6 - mo * 0.6}`} stroke="#fff" strokeWidth={0.6} opacity={mo > 0.4 ? 0.8 : 0} /></g>)}
        {/* rim on the face */}
        <path d={vanara ? "M18,-20 C24,-18 26,-12 25,-8" : "M13,-29 C15,-25 15,-22 15,-21"} stroke={rim} strokeWidth={1.4} fill="none" opacity={rimO * 0.8} />
      </g>
    );
  };

  /* ---------- tail (vanara): S-curve from the sacrum, flame on the tip ---------- */
  const tailSway = Math.sin(t * 2.4) * 2.5;
  const tip: [number, number] = [TAIL_TIP[0] - 100 + tailSway, TAIL_TIP[1] - 146];
  const tailD = `M-14,-10 C-52,0 -74,-34 -66,-70 C-60,-96 ${-50 + tailSway},-104 ${-58 + tailSway},-118 C${-62 + tailSway},-124 ${tip[0] - 4},${tip[1] + 4} ${tip[0]},${tip[1]}`;

  return (
    <svg viewBox="-80 -10 360 310" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={shade} cx="0.78" cy="0.25" r="1">
          <stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#120a24" stopOpacity={0.55} />
        </radialGradient>
        <clipPath id={clipT}><path d={torsoD} /></clipPath>
      </defs>
      <g transform={`translate(100,${pelvisY}) rotate(${P.root ?? 0})`}>
        {/* tail behind everything */}
        {hasTail && (
          <g>
            <path d={tailD} stroke={INK} strokeWidth={8.5} fill="none" strokeLinecap="round" />
            <path d={tailD} stroke={skin} strokeWidth={5.6} fill="none" strokeLinecap="round" />
            <path d={tailD} stroke={dark} strokeWidth={5.6} fill="none" strokeDasharray="2 8" />
            {fire > 0.05 && <path d={tailD} stroke="#2a120c" strokeWidth={5.6} fill="none" strokeDasharray="26 400" strokeDashoffset={-205} opacity={0.6 * fire} />}
          </g>
        )}
        {/* back arm + back leg (darker, behind) */}
        <g transform={`rotate(${P.torso})`}><Arm front={false} /></g>
        <Leg front={false} />
        {fem && (
          // long skirt (lehenga / saree) covering both legs, swaying with the walk
          <path d={`M${-hipW - 2},-6 C${-hipW - 10},50 ${-hipW - 18 + P.bLeg[0] * 0.3},110 ${-hipW - 20 + P.bLeg[0] * 0.4},142 C-10,148 20,148 ${hipW + 22 + P.fLeg[0] * -0.4},140 C${hipW + 16},100 ${hipW + 10},50 ${hipW + 2},-6Z`}
            fill={p.cloth} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        )}
        {fem && <path d={`M${-hipW - 19},136 C-10,142 20,142 ${hipW + 21},134 L${hipW + 22},140 C20,148 -10,148 ${-hipW - 20},142Z`} fill={p.border} stroke={INK} strokeWidth={0.9} />}
        {fem && [-12, 0, 12].map((x) => <path key={x} d={`M${x},4 C${x - 2},50 ${x - 4},100 ${x - 5},138`} stroke={p.clothDark} strokeWidth={1.1} fill="none" opacity={0.8} />)}
        <Leg front />

        {/* torso */}
        <g transform={`rotate(${P.torso}) translate(0,${breathe * 0.4})`}>
          <path d={torsoD} fill={skin} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
          <g clipPath={`url(#${clipT})`}>
            {!fem && (
              <g stroke={dark} fill="none" strokeLinecap="round" opacity={0.75}>
                {/* clavicles, pecs, sternum, abs, obliques, navel */}
                <path d="M-2,-86 C8,-82 18,-84 26,-82" strokeWidth={1.1} />
                <path d={`M2,-76 C6,-64 ${lerp(16, 22, B)},-60 ${shW - 6},-66`} strokeWidth={1.5} />
                <path d="M3,-84 L5,-64" strokeWidth={0.9} />
                <path d="M6,-52 C10,-50 14,-50 17,-52 M6,-42 C10,-40 14,-40 17,-42 M6,-32 C10,-30 14,-30 16,-32" strokeWidth={0.9} />
                <path d="M5,-56 L6,-22" strokeWidth={0.8} />
                <path d={`M${waist + 4},-50 C${waist},-38 ${waist - 2},-26 ${waist - 4},-14`} strokeWidth={1} />
              </g>
            )}
            {fem && <path d={`M4,-76 C10,-64 ${shW - 2},-60 ${waist + 8},-62`} stroke={dark} strokeWidth={1.2} fill="none" opacity={0.6} />}
            <circle cx={10} cy={-22} r={1} fill={dark} />
            {/* cloth on the upper body: angavastra sash (men) / choli (women) */}
            {p.upper && !fem && <path d={`M${-shW + 4},-86 C-6,-70 10,-40 ${waist + 6},-18 L${waist + 8},-26 C14,-46 0,-72 ${-shW + 14},-90Z`} fill={p.upper} stroke={INK} strokeWidth={1.2} opacity={0.95} />}
            {fem && <path d={`M${-shW},-90 L${shW + 4},-90 L${shW + 4},-54 C10,-50 -10,-52 ${-shW},-56Z`} fill={p.upper ?? p.cloth} stroke={INK} strokeWidth={1.2} />}
            {fem && <path d={`M${-shW + 6},-92 C-4,-70 10,-40 ${waist + 6},-4 L${waist + 14},-8 C16,-44 4,-72 ${-shW + 16},-94Z`} fill={p.cloth} stroke={INK} strokeWidth={1.2} />}
            {/* janeu (sacred thread) */}
            {!fem && <path d={`M${-shW + 10},-86 C-4,-60 10,-34 ${waist + 2},-10`} stroke="#fff3d0" strokeWidth={1.4} fill="none" />}
            <path d={torsoD} fill={`url(#${shade})`} />
            <path d={`M${shW - 2},-84 C${shW + 3},-76 ${shW + 1},-66 ${waist + 10},-60 C${waist + 4},-50 ${waist},-38 ${waist + 1},-26`} stroke={rim} strokeWidth={2.6} fill="none" opacity={rimO} />
          </g>
          {/* waist wrap (kamarbandh) + front pleat */}
          <path d={`M${-hipW - 1},-8 C-6,-4 8,-4 ${hipW + 3},-9 L${hipW + 3},2 C8,6 -6,6 ${-hipW - 1},2Z`} fill={fem ? p.border : p.cloth} stroke={INK} strokeWidth={1.4} />
          <path d={`M${-hipW},-4 C-6,0 8,0 ${hipW + 2},-5`} stroke={fem ? INK : p.border} strokeWidth={1.6} fill="none" opacity={0.9} />
          {!fem && <path d="M6,-2 C9,12 10,26 7,40 L1,38 C4,26 3,12 0,0Z" fill={p.border} stroke={INK} strokeWidth={1.1} />}
          {/* necklace */}
          <path d={`M-8,-88 Q4,${fem ? -74 : -70} ${shW - 14},-86`} stroke={GOLD} strokeWidth={1.8} fill="none" />
          <path d={`M3,${fem ? -75 : -71} l2.4,3.4 l-2.4,4 l-2.4,-4Z`} fill={RUBY} stroke={INK} strokeWidth={0.7} />
          {/* neck + head */}
          <path d={`M-6,-90 L${fem ? -5 : -7},-${fem ? 104 : 101} L${fem ? 6 : 8},-${fem ? 104 : 101} L${fem ? 7 : 9},-90Z`} fill={skin} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M-6,-90 L-6,-100" stroke={dark} strokeWidth={2.4} opacity={0.4} />
          {Array.from({ length: Math.max(0, heads - 1) }).map((_, i) => { const side = i % 2 ? 1 : -1, r = Math.floor(i / 2) + 1; return <g key={`xh${i}`} opacity={0.97} transform={`translate(${2 + side * r * 13},${-99 + r * 3}) rotate(${P.head + side * r * 4}) scale(${1 - r * 0.05})`}><g style={{ filter: "brightness(0.78)" }}><Head /></g></g>; })}
          <g transform={`translate(${fem ? 1 : 2},${fem ? -102 : -99}) rotate(${P.head + Math.sin(t * 1.3) * 1.2})`}><Head /></g>
          {/* front arm on top */}
          <Arm front />
        </g>

        {/* flame on the tail tip (kept upright) */}
        {hasTail && fire > 0.01 && (
          <g transform={`rotate(${-(P.root ?? 0)},${tip[0]},${tip[1]})`}>
            <Flame x={tip[0]} y={tip[1] + 4} s={fire * 0.5} t={t} seed={7} glow={0.45} />
          </g>
        )}
      </g>
    </svg>
  );
};
