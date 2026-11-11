import React from "react";

// Flat folk-art vulture (Sampati / Jatayu) with cel shading, rim light and scorch states.
// viewBox "-80 -10 360 310"; feet / tail at bottom centre (x=100).
export type BirdPalette = {
  key: string; body: string; bodyDark: string; wing: string; wingDark: string; wingLine: string; covert: string;
};
export const SAMPATI: BirdPalette = {
  key: "s", body: "#7f86a8", bodyDark: "#4e5478", wing: "#8d93b4", wingDark: "#4f5578", wingLine: "#dfe3f5", covert: "#a9aecb",
};
export const JATAYU: BirdPalette = {
  key: "j", body: "#b47c3c", bodyDark: "#6e4419", wing: "#c08a4c", wingDark: "#6b3f17", wingLine: "#f6ddb0", covert: "#d8a868",
};

const INK = "#2a1b2b";
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Props = {
  id: string; palette?: BirdPalette; mode: "burnt" | "fly"; t: number; flap?: number; tear?: number;
  eyes?: "open" | "sad" | "closed"; char?: number; rim?: string; legs?: boolean;
};

const Feather: React.FC<{ len: number; w: number; angle: number; fill: string; line: string; char: number; t: number; seed: number }> = ({ len, w, angle, fill, line, char, t, seed }) => {
  const d = `M0,0 C${w},${-len * 0.3} ${w * 0.75},${-len * 0.85} 0,${-len} C${-w * 0.75},${-len * 0.85} ${-w},${-len * 0.3} 0,0Z`;
  return (
    <g transform={`rotate(${angle})`}>
      <path d={d} fill={fill} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={`M${w * 0.15},-3 C${w * 0.5},${-len * 0.4} ${w * 0.4},${-len * 0.75} 0,${-len}`} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={w * 0.55} opacity={0.6} />
      <path d={`M0,-4 L0,${-len * 0.9}`} stroke={line} strokeWidth={1} strokeDasharray="5 3" opacity={0.9} />
      {char > 0.01 && (
        <g opacity={clamp01(char)}>
          <path d={d} fill="url(#charGrad)" stroke={INK} strokeWidth={1.5} />
          <path d={`M${-w * 0.6},${-len * 0.88} Q0,${-len * 1.04} ${w * 0.6},${-len * 0.88}`} stroke="#ff7a2a" strokeWidth={2.2} fill="none" opacity={0.6 + 0.4 * Math.sin(t * 9 + seed)} />
          <circle cx={0} cy={-len} r={2.6} fill="#ffb34a" opacity={0.5 + 0.5 * Math.sin(t * 11 + seed * 1.7)} />
        </g>
      )}
    </g>
  );
};

const Wing: React.FC<{ side: 1 | -1; flap: number; p: BirdPalette; char: number; t: number; id: string }> = ({ side, flap, p, char, t, id }) => {
  const n = 12;
  return (
    <g transform={`translate(${100 + side * 30},152) scale(${side},1) rotate(${-flap * 38})`}>
      {/* primaries */}
      {Array.from({ length: n }).map((_, i) => {
        const k = i / (n - 1);
        const x = 18 + k * 104;
        const ang = 182 - k * 92;
        const charK = clamp01(char * 1.7 - (1 - k) * 0.9);
        return (
          <g key={i} transform={`translate(${x},${6 + k * 6})`}>
            <Feather len={52 + k * 36 + Math.sin(k * Math.PI) * 14} w={11} angle={ang} fill={i % 2 ? `url(#${id}-fd)` : `url(#${id}-fl)`} line={p.wingLine} char={charK} t={t} seed={i} />
          </g>
        );
      })}
      {/* coverts row */}
      {Array.from({ length: 8 }).map((_, i) => {
        const k = i / 7;
        return (
          <g key={"c" + i} transform={`translate(${10 + k * 100},${12})`}>
            <Feather len={26 + k * 8} w={10} angle={175 - k * 40} fill={p.covert} line={p.wingLine} char={clamp01(char * 1.3 - (1 - k) * 0.6) * 0.7} t={t} seed={i + 20} />
          </g>
        );
      })}
      {/* arm */}
      <path d="M0,-7 L120,-3 L124,14 L0,17Z" fill={p.wing} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M0,-7 L120,-3 L121,2 L0,-1Z" fill="#ffffff" opacity={0.22} />
      <path d="M8,5 L114,7" stroke={p.wingLine} strokeWidth={1.2} strokeDasharray="6 4" />
      {[30, 60, 90].map((x) => <path key={x} d={`M${x},-3 l4,6 l-4,6 l-4,-6Z`} fill="#f2c12e" stroke={INK} strokeWidth={0.8} />)}
      <circle cx={120} cy={6} r={3.4} fill="#f2c12e" stroke={INK} strokeWidth={1} />
      {char > 0.01 && <path d="M0,-7 L120,-3 L124,14 L0,17Z" fill="#1d1012" opacity={char * 0.45} />}
    </g>
  );
};

const BurntWing: React.FC<{ side: 1 | -1; t: number }> = ({ side, t }) => {
  const spikes = 9;
  return (
    <g transform={`translate(${100 + side * 28},150) scale(${side},1) rotate(${Math.sin(t * 2) * 2})`}>
      <path d="M0,-10 L48,-18 L70,4 L60,10 L8,24Z" fill="#2a1d22" stroke={INK} strokeWidth={2} />
      <path d="M4,-8 L46,-15 L52,-8 L8,0Z" fill="#5a3a3a" opacity={0.6} />
      {Array.from({ length: spikes }).map((_, i) => {
        const a = (i / (spikes - 1)) * 75 + 8;
        const r = 50 + (i % 2) * 12 + (i % 3) * 3;
        const rad = (a * Math.PI) / 180;
        const x = 14 + Math.cos(rad) * r, y = 4 + Math.sin(rad) * r;
        const glow = 0.55 + 0.45 * Math.sin(t * 6 + i * 1.3);
        return (
          <g key={i}>
            <path d={`M${14 + Math.cos(rad - 0.13) * 18},${4 + Math.sin(rad - 0.13) * 18} L${x},${y} L${14 + Math.cos(rad + 0.13) * 18},${4 + Math.sin(rad + 0.13) * 18}Z`}
              fill={i % 2 ? "#3a2a2c" : "#1f1518"} stroke={INK} strokeWidth={1.4} />
            <path d={`M${14 + Math.cos(rad) * (r - 14)},${4 + Math.sin(rad) * (r - 14)} L${x},${y}`} stroke="#ff5a1f" strokeWidth={2} opacity={glow * 0.8} />
            <circle cx={x} cy={y} r={3.2} fill="#ffb347" opacity={glow} />
            <circle cx={x} cy={y} r={7} fill="#ff6a2a" opacity={glow * 0.25} />
          </g>
        );
      })}
    </g>
  );
};

export const Bird: React.FC<Props> = ({ id, palette = SAMPATI, mode, t, flap = 0, tear = 0, eyes = "open", char = 0, rim = "#ffd8a0", legs = true }) => {
  const p = palette;
  const breathe = Math.sin(t * 2.2) * 1.2;
  const bodyClip = `${id}-bc`;
  return (
    <svg viewBox="-80 -10 360 310" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-fl`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={p.wing} /><stop offset="1" stopColor={p.wingDark} /></linearGradient>
        <linearGradient id={`${id}-fd`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={p.wingDark} /><stop offset="1" stopColor="#2b2340" stopOpacity={0.9} /></linearGradient>
        <linearGradient id="charGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3a2420" stopOpacity={0.2} /><stop offset="0.45" stopColor="#24130f" /><stop offset="0.9" stopColor="#120807" /><stop offset="1" stopColor="#ff6a1f" />
        </linearGradient>
        <radialGradient id={`${id}-shade`} cx="0.72" cy="0.22" r="0.95">
          <stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#120a24" stopOpacity={0.55} />
        </radialGradient>
        <clipPath id={bodyClip}><ellipse cx={100} cy={196} rx={44} ry={52} /></clipPath>
      </defs>

      {mode === "fly" && <Wing side={-1} flap={flap} p={p} char={char} t={t} id={id} />}
      {mode === "fly" && <Wing side={1} flap={flap} p={p} char={char} t={t} id={id} />}
      {mode === "burnt" && <BurntWing side={-1} t={t} />}
      {mode === "burnt" && <BurntWing side={1} t={t} />}

      {legs && mode === "burnt" && (
        <g>
          <path d="M88,235 L86,284 M112,235 L114,284" stroke="#d7a62a" strokeWidth={5} strokeLinecap="round" />
          <path d="M80,282 L92,286 M108,286 L120,282 M86,284 l-8,6 M114,284 l8,6" stroke="#d7a62a" strokeWidth={3} strokeLinecap="round" />
          <path d="M92,232 C100,250 104,262 96,280 C106,272 110,252 108,232Z" fill="#3d5a9e" stroke={INK} strokeWidth={1.6} />
          <path d="M96,246 L104,262" stroke="#8fb0e6" strokeWidth={1.2} />
        </g>
      )}
      {mode === "fly" && (
        <g>
          {[-2, -1, 0, 1, 2].map((k) => (
            <g key={k} transform={`translate(100,236) rotate(${k * 13 + Math.sin(t * 3) * 3})`}>
              <path d="M0,0 C8,14 7,30 0,40 C-7,30 -8,14 0,0Z" fill={k % 2 ? p.wingDark : p.wing} stroke={INK} strokeWidth={1.4} />
              <path d="M0,4 L0,36" stroke={p.wingLine} strokeWidth={0.9} strokeDasharray="4 3" />
            </g>
          ))}
          <rect x={89} y={240} width={8} height={7} rx={2} fill="#e3b02c" stroke={INK} strokeWidth={1} />
          <rect x={103} y={240} width={8} height={7} rx={2} fill="#e3b02c" stroke={INK} strokeWidth={1} />
        </g>
      )}

      <g transform={`translate(0,${breathe})`}>
        {/* body */}
        <ellipse cx={100} cy={196} rx={44} ry={52} fill={p.body} stroke={INK} strokeWidth={2.5} />
        <g clipPath={`url(#${bodyClip})`}>
          {[166, 176, 186].map((y, i) => (
            <path key={y} d={`M54,${y} q6,-4 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0`} stroke="#eef0ff" strokeWidth={i === 1 ? 1.6 : 1.1} fill="none" opacity={0.85} />
          ))}
          {Array.from({ length: 36 }).map((_, i) => (
            <circle key={i} cx={60 + (i % 7) * 13 + (Math.floor(i / 7) % 2) * 6} cy={196 + Math.floor(i / 7) * 8} r={1.3} fill="#eef0ff" opacity={0.8} />
          ))}
          <rect x={50} y={218} width={100} height={14} fill="#da7315" stroke={INK} strokeWidth={1.5} />
          <path d="M52,229 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8" stroke="#ffd98a" strokeWidth={1.3} fill="none" />
          <rect x={50} y={232} width={100} height={3} fill="#f2c12e" />
          {/* cel shade + rim */}
          <ellipse cx={100} cy={196} rx={44} ry={52} fill={`url(#${id}-shade)`} />
          <path d="M126,152 C150,170 150,220 128,244" stroke={rim} strokeWidth={4} fill="none" opacity={0.55} />
          {char > 0.01 && <ellipse cx={100} cy={196} rx={44} ry={52} fill="#2a120c" opacity={char * 0.3} />}
        </g>
        <circle cx={100} cy={240} r={2} fill="#eef0ff" />

        {/* neck rings (behind collar) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <rect x={93} y={92 + i * 10} width={14} height={10} fill={i % 2 ? "#c8826a" : "#e8a57c"} stroke={INK} strokeWidth={1.4} />
            <rect x={93} y={92 + i * 10} width={4} height={10} fill="#000" opacity={0.15} />
            <rect x={104} y={93 + i * 10} width={2} height={8} fill={rim} opacity={0.6} />
          </g>
        ))}

        {/* fur collar */}
        <path d="M56,160 l6,-12 l5,8 l6,-13 l6,9 l6,-13 l6,10 l7,-13 l6,10 l6,-13 l6,10 l7,-12 l5,9 l6,-11 l5,12 l5,-2 l-4,11 C130,174 70,174 56,160Z"
          fill="#f1d6ad" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d="M62,162 C80,172 120,172 140,160 L140,166 C120,178 80,178 62,168Z" fill="#c9a77c" opacity={0.6} />
        {[70, 84, 98, 112, 126].map((x) => <path key={x} d={`M${x},152 l3,8`} stroke="#c9a77c" strokeWidth={1.2} />)}
        <path d="M70,160 Q100,180 130,160" stroke="#f2c12e" strokeWidth={2.6} fill="none" />
        {[78, 90, 110, 122].map((x, i) => <circle key={x} cx={x} cy={165 + (i === 1 || i === 2 ? 3 : 0)} r={1.8} fill="#f2c12e" stroke={INK} strokeWidth={0.6} />)}
        <path d="M100,169 l5,7 l-5,9 l-5,-9Z" fill="#d6262c" stroke={INK} strokeWidth={1.2} />
        <path d="M100,171 l2,4 l-2,2Z" fill="#ff9a9a" />

        {/* head */}
        <g transform={`rotate(${Math.sin(t * 1.3) * 2},100,80)`}>
          <ellipse cx={100} cy={72} rx={20} ry={24} fill="#f4b083" stroke={INK} strokeWidth={2.2} />
          <path d="M82,64 C80,86 92,96 104,95 C92,92 84,82 86,62Z" fill="#c8735a" opacity={0.35} />
          <path d="M114,58 C121,68 120,82 114,90" stroke={rim} strokeWidth={2.4} fill="none" opacity={0.6} />
          {/* eye */}
          {eyes === "closed" ? (
            <g>
              <path d="M87,69 Q98,75 109,67" stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
              <path d="M90,71 l-2,4 M96,73 l-1,4 M102,72 l0,4" stroke={INK} strokeWidth={1.2} />
              <path d="M85,59 Q96,63 110,57" stroke={INK} strokeWidth={2} fill="none" />
            </g>
          ) : (
            <g>
              <path d="M88,68 Q98,60 108,68 Q98,74 88,68Z" fill="#fff" stroke={INK} strokeWidth={1.6} />
              <circle cx={99} cy={67.5} r={3.4} fill="#2a1b2b" />
              <circle cx={100.2} cy={66.3} r={1} fill="#fff" />
              {eyes === "sad" && <path d="M87,67 Q98,59 109,67 L109,64 Q98,57 87,64Z" fill="#e39a72" stroke={INK} strokeWidth={1.2} />}
              <path d={eyes === "sad" ? "M86,60 Q96,58 110,63" : "M86,62 Q98,56 110,62"} stroke={INK} strokeWidth={1.8} fill="none" />
            </g>
          )}
          <circle cx={92} cy={82} r={2.5} fill="#e8af3f" stroke={INK} strokeWidth={0.8} />
          {tear > 0 && (
            <g opacity={Math.min(1, tear * 4)}>
              <path d={`M98,${73 + tear * 16} q-4.5,7 0,9 q4.5,-2 0,-9Z`} fill="#5cb4f0" stroke="#1d4f86" strokeWidth={1} />
              <circle cx={96.8} cy={78 + tear * 16} r={1} fill="#fff" />
              <path d={`M98,73 L98,${73 + tear * 16}`} stroke="#8fd0ff" strokeWidth={1.4} opacity={0.6} />
            </g>
          )}
          {/* beak */}
          <path d="M112,62 C134,58 146,72 140,92 C136,84 128,80 118,82 C114,80 110,72 112,62Z" fill="#e8af3f" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M116,64 C130,62 138,70 139,80" stroke="#fff3c0" strokeWidth={2} fill="none" opacity={0.7} />
          <path d="M118,82 C126,80 132,84 134,90" stroke={INK} strokeWidth={1.4} fill="none" />
          <circle cx={121} cy={68} r={1.4} fill={INK} />
          {/* crown */}
          <path d="M82,52 L84,38 L91,44 L100,30 L109,44 L116,38 L118,52Z" fill="#f2c12e" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M100,30 L109,44 L116,38 L118,52 L104,52Z" fill="#c98a12" opacity={0.35} />
          <rect x={82} y={50} width={36} height={6} rx={2} fill="#e3a91f" stroke={INK} strokeWidth={1.4} />
          <circle cx={100} cy={42} r={3.2} fill="#d6262c" stroke={INK} strokeWidth={1} />
          <circle cx={99} cy={41} r={1} fill="#fff" opacity={0.8} />
          <circle cx={89} cy={53} r={1.8} fill="#2bb3a3" />
          <circle cx={111} cy={53} r={1.8} fill="#2bb3a3" />
          <circle cx={100} cy={27} r={2.4} fill="#f2c12e" stroke={INK} strokeWidth={1} />
          <path d="M86,40 l1,-6 M114,40 l-1,-6" stroke="#fff4b0" strokeWidth={1} opacity={0.7} />
        </g>
      </g>
    </svg>
  );
};
