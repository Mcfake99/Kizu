import React from 'react';
import {RED, clamp01, lerp} from './core';

// The stick figure. Angles are degrees from straight down, positive toward the way the figure faces.
// Legs are [thigh, knee bend], arms are [upper arm, elbow bend]. `sw` is the sword's own angle.
export type Pose = {lean: number; head: number; aF: [number, number]; aB: [number, number]; lF: [number, number]; lB: [number, number]; sw: number};

const D = Math.PI / 180;
const dir = (deg: number): [number, number] => [Math.sin(deg * D), Math.cos(deg * D)];
const add = (p: [number, number], d: [number, number], l: number): [number, number] => [p[0] + d[0] * l, p[1] + d[1] * l];
const TORSO = 64;
const NECK = 22;
const UA = 34;
const FA = 32;
const TH = 46;
const SH = 46;
const LW = 15;

export const lerpPose = (a: Pose, b: Pose, k: number): Pose => ({
	lean: lerp(a.lean, b.lean, k),
	head: lerp(a.head, b.head, k),
	aF: [lerp(a.aF[0], b.aF[0], k), lerp(a.aF[1], b.aF[1], k)],
	aB: [lerp(a.aB[0], b.aB[0], k), lerp(a.aB[1], b.aB[1], k)],
	lF: [lerp(a.lF[0], b.lF[0], k), lerp(a.lF[1], b.lF[1], k)],
	lB: [lerp(a.lB[0], b.lB[0], k), lerp(a.lB[1], b.lB[1], k)],
	sw: lerp(a.sw, b.sw, k),
});

// ---- pose library ----
// ph counts steps: one step per unit
export const runPose = (ph: number): Pose => {
	const th = ph * Math.PI;
	const leg = (o: number): [number, number] => [52 * Math.sin(th + o) + 6, 18 + 88 * Math.max(0, Math.cos(th + o + 0.55))];
	return {lean: 26, head: -16, aF: [-48 * Math.sin(th) + 8, 84], aB: [48 * Math.sin(th) + 8, 84], lF: leg(0), lB: leg(Math.PI), sw: 110};
};
export const walkPose = (ph: number): Pose => {
	const th = ph * Math.PI;
	const leg = (o: number): [number, number] => [24 * Math.sin(th + o), 6 + 30 * Math.max(0, Math.cos(th + o + 0.4))];
	return {lean: 6, head: -4, aF: [-18 * Math.sin(th), 16], aB: [18 * Math.sin(th), 16], lF: leg(0), lB: leg(Math.PI), sw: 120};
};
export const P = {
	stand: {lean: 2, head: 0, aF: [8, 10], aB: [-8, 12], lF: [7, 2], lB: [-7, 2], sw: 150} as Pose,
	guard: {lean: 12, head: -6, aF: [62, 46], aB: [20, 70], lF: [34, 34], lB: [-26, 6], sw: 22} as Pose,
	wind: {lean: -10, head: 6, aF: [168, 62], aB: [40, 40], lF: [22, 30], lB: [-30, 14], sw: -150} as Pose,
	strike: {lean: 40, head: -22, aF: [52, 4], aB: [-62, 20], lF: [62, 52], lB: [-48, 4], sw: 78} as Pose,
	windLow: {lean: 24, head: -10, aF: [-64, 30], aB: [30, 60], lF: [40, 46], lB: [-30, 22], sw: -70} as Pose,
	strikeUp: {lean: 6, head: -18, aF: [150, 10], aB: [-40, 30], lF: [44, 20], lB: [-40, 2], sw: 176} as Pose,
	hit: {lean: -34, head: 22, aF: [-70, 30], aB: [-110, 20], lF: [30, 8], lB: [-20, 40], sw: -60} as Pose,
	kneel: {lean: 22, head: -26, aF: [26, 30], aB: [-10, 40], lF: [78, 96], lB: [-8, 96], sw: 150} as Pose,
	leap: {lean: 34, head: -22, aF: [80, 60], aB: [-70, 40], lF: [74, 96], lB: [-36, 70], sw: 96} as Pose,
	fall: {lean: -8, head: 10, aF: [120, 20], aB: [-120, 20], lF: [30, 40], lB: [-30, 50], sw: 150} as Pose,
	raise: {lean: 0, head: 12, aF: [10, 14], aB: [172, 8], lF: [8, 2], lB: [-8, 2], sw: 150} as Pose,
	sheath: {lean: 30, head: -24, aF: [-30, 60], aB: [-50, 30], lF: [70, 70], lB: [-50, 6], sw: -110} as Pose,
};

export type Kind = 'hero' | 'ronin' | 'ninja' | 'oni' | 'girl' | 'villager';
// where the scars sit: [part, how far along it, angle of the cut]
const SCARS: [string, number, number][] = [
	['torso', 0.42, 58],
	['thF', 0.5, -40],
	['uaF', 0.55, 50],
	['torso', 0.76, -52],
	['shB', 0.4, 40],
	['torso', 0.14, 30],
	['uaB', 0.5, -45],
	['thB', 0.5, 50],
];

export type StickProps = {
	pose: Pose;
	x: number;
	y: number;
	s?: number;
	face?: 1 | -1;
	fill: string;
	rim: string;
	blade?: string;
	kind?: Kind;
	sword?: 'hand' | 'back' | 'none';
	lantern?: number; // undefined = none, 0 = carried unlit, up to 1 = lit
	scars?: number; // how many cuts; the fraction is the newest one drawing on
	glow?: number; // scars shine
	wind?: number; // 0 scarf hangs, 1 streams out behind
	t?: number;
	lift?: number;
	rot?: number;
	sx?: number;
	sy?: number;
	opacity?: number;
	eye?: number;
	smear?: number; // speed streaks behind the body
	smearColor?: string;
	cord?: number; // the red hair cord tied to the lantern (0..1 as it is tied on)
	bow?: number; // the girl's red bow (0..1)
};

export const Stick: React.FC<StickProps> = (p) => {
	const {pose, s = 2, face = 1, fill, rim, kind = 'hero', sword = 'hand', t = 0, wind = 1} = p;
	const big = kind === 'oni' ? 1.35 : 1;
	const q = kind === 'girl' ? 0.66 : 1; // a child: same head, shorter everything else
	// joints, hip at the origin
	const hip: [number, number] = [0, 0];
	const kF = add(hip, dir(pose.lF[0]), TH * q);
	const fF = add(kF, dir(pose.lF[0] - pose.lF[1]), SH * q);
	const kB = add(hip, dir(pose.lB[0]), TH * q);
	const fB = add(kB, dir(pose.lB[0] - pose.lB[1]), SH * q);
	const up = dir(180 - pose.lean);
	const sh: [number, number] = [hip[0] + up[0] * TORSO * q, hip[1] + up[1] * TORSO * q];
	const hd = dir(180 - pose.lean - pose.head);
	const head: [number, number] = [sh[0] + hd[0] * NECK * q, sh[1] + hd[1] * NECK * q];
	const eF = add(sh, dir(pose.aF[0]), UA * q);
	const hF = add(eF, dir(pose.aF[0] + pose.aF[1]), FA * q);
	const eB = add(sh, dir(pose.aB[0]), UA * q);
	const hB = add(eB, dir(pose.aB[0] + pose.aB[1]), FA * q);
	const gy = Math.max(fF[1], fB[1]);
	const seg: Record<string, [[number, number], [number, number]]> = {torso: [sh, hip], thF: [hip, kF], shF: [kF, fF], thB: [hip, kB], shB: [kB, fB], uaF: [sh, eF], faF: [eF, hF], uaB: [sh, eB], faB: [eB, hB]};
	const limbs = (
		<>
			<path d={`M${hip} L${kB} L${fB} M${sh} L${eB} L${hB} M${sh} L${hip} L${kF} L${fF} M${sh} L${eF} L${hF}`} fill="none" />
		</>
	);
	const tilt = -(pose.lean + pose.head) * 0.6;
	const hat = kind === 'hero' ? <polygon points="-50,-2 50,-2 4,-36" strokeLinejoin="round" /> : null;
	const horns =
		kind === 'oni' ? (
			<>
				<polygon points="-14,-12 -22,-36 -4,-16" />
				<polygon points="6,-16 20,-38 16,-10" />
			</>
		) : null;
	const bladeC = p.blade ?? fill;
	const sd = dir(pose.sw);
	const tip = add(hF, sd, 128 * big);
	// scarf: two tails streaming out behind the neck
	const scarf = (len: number, ph: number, w: number) => {
		const pts: string[] = [];
		for (let i = 0; i <= 8; i++) {
			const k = i / 8;
			const x = sh[0] - k * len * (0.25 + 0.75 * wind);
			const y = sh[1] + 4 + Math.sin(t * 13 - i * 0.9 + ph) * 9 * k * (0.4 + wind) + (1 - wind) * k * k * len * 0.75;
			pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
		}
		return <polyline points={pts.join(' ')} fill="none" stroke={RED} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
	};
	const n = p.scars ?? 0;
	const lit = p.lantern;
	return (
		<g transform={`translate(${p.x} ${p.y - (p.lift ?? 0)}) scale(${s * big * face * (p.sx ?? 1)} ${s * big * (p.sy ?? 1)}) rotate(${p.rot ?? 0} 0 -90) translate(0 ${-gy})`} opacity={p.opacity ?? 1}>
			{p.smear ? (
				<g fill={p.smearColor ?? rim} opacity={0.5 * p.smear}>
					<polygon points={`${sh[0] - 14},${sh[1] - 8} ${sh[0] - 150 * p.smear},${sh[1] - 2} ${sh[0] - 14},${sh[1] + 6}`} />
					<polygon points={`${-12},${-22} ${-190 * p.smear},${-14} ${-12},${-6}`} />
					<polygon points={`${kB[0] - 8},${kB[1] - 6} ${kB[0] - 120 * p.smear},${kB[1]} ${kB[0] - 8},${kB[1] + 6}`} />
				</g>
			) : null}
			{sword === 'back' ? <line x1={16} y1={-12} x2={-104} y2={22} stroke={bladeC} strokeWidth={6} strokeLinecap="round" /> : null}
			{kind === 'hero' ? scarf(120, 1.3, 9) : null}
			{kind === 'girl' ? <polygon points={`${sh[0] * 0.5},${sh[1] * 0.55} ${-26},${20} ${26},${20}`} fill={fill} stroke={rim} strokeWidth={6} strokeLinejoin="round" /> : null}
			{kind === 'ninja' ? <path d={`M${head} l-34 -6 M${head} l-30 8`} stroke={fill} strokeWidth={6} strokeLinecap="round" /> : null}
			<g stroke={rim} strokeWidth={LW + 9} strokeLinecap="round" strokeLinejoin="round" fill={rim}>
				{limbs}
				<circle cx={head[0]} cy={head[1]} r={17} />
				<g transform={`translate(${head[0]} ${head[1]}) rotate(${tilt})`}>
					{hat}
					{horns}
				</g>
			</g>
			<g stroke={fill} strokeWidth={LW} strokeLinecap="round" strokeLinejoin="round" fill={fill}>
				{limbs}
				<circle cx={head[0]} cy={head[1]} r={17} strokeWidth={1} />
				<g transform={`translate(${head[0]} ${head[1]}) rotate(${tilt})`} strokeWidth={5}>
					{hat}
					{horns}
					{kind === 'ronin' ? <line x1={-6} y1={-14} x2={-20} y2={-30} strokeWidth={8} /> : null}
				</g>
			</g>
			{kind === 'girl' ? (
				<g transform={`translate(${head[0]} ${head[1]})`}>
					<circle cx={-17} cy={4} r={8} fill={fill} stroke={rim} strokeWidth={3} />
					<circle cx={15} cy={6} r={8} fill={fill} stroke={rim} strokeWidth={3} />
					{p.bow ? (
						<g transform={`translate(0 -17) scale(${p.bow})`}>
							<polygon points="0,0 -20,-12 -20,10" fill={RED} />
							<polygon points="0,0 20,-12 20,10" fill={RED} />
							<circle r={5} fill={RED} />
						</g>
					) : null}
				</g>
			) : null}
			{p.eye ? (
				<g transform={`translate(${head[0]} ${head[1]}) rotate(${tilt})`}>
					<ellipse cx={9} cy={5} rx={10} ry={5.5 * p.eye} fill={RED} />
				</g>
			) : null}
			{kind === 'hero' ? scarf(86, 0, 9) : null}
			{SCARS.slice(0, Math.ceil(n)).map(([part, f, ang], i) => {
				const [a, b] = seg[part];
				const c: [number, number] = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
				const k = i === Math.ceil(n) - 1 ? clamp01(n - i) : 1;
				const d = dir(ang);
				const g = p.glow ?? 0;
				return <line key={i} x1={c[0] - d[0] * 16} y1={c[1] - d[1] * 16} x2={c[0] - d[0] * 16 + d[0] * 32 * k} y2={c[1] - d[1] * 16 + d[1] * 32 * k} stroke={g > 0.5 ? '#FF4B55' : RED} strokeWidth={5.5 + g * 3} strokeLinecap="round" />;
			})}
			{sword === 'hand' ? (
				<>
					<line x1={hF[0] - sd[0] * 12} y1={hF[1] - sd[1] * 12} x2={tip[0]} y2={tip[1]} stroke={rim} strokeWidth={9} strokeLinecap="round" />
					<line x1={hF[0] - sd[0] * 12} y1={hF[1] - sd[1] * 12} x2={tip[0]} y2={tip[1]} stroke={bladeC} strokeWidth={4.5} strokeLinecap="round" />
					<line x1={hF[0] - sd[1] * 9} y1={hF[1] + sd[0] * 9} x2={hF[0] + sd[1] * 9} y2={hF[1] - sd[0] * 9} stroke={bladeC} strokeWidth={5} strokeLinecap="round" />
				</>
			) : null}
			{lit !== undefined ? (
				<g transform={`translate(${hB[0]} ${hB[1]}) scale(${face} 1)`}>
					{lit > 0 ? <circle cx={0} cy={36} r={70 + 20 * Math.sin(t * 9)} fill="url(#kzGlow)" opacity={lit} /> : null}
					<line x1={0} y1={0} x2={0} y2={18} stroke={fill} strokeWidth={3} />
					<rect x={-13} y={18} width={26} height={36} rx={11} fill={lit > 0.05 ? RED : rim} stroke={fill} strokeWidth={3.5} />
					<rect x={-9} y={15} width={18} height={6} fill={fill} />
					<rect x={-9} y={51} width={18} height={6} fill={fill} />
					{p.cord ? (
						<g transform={`translate(0 12) scale(${p.cord})`}>
							<polygon points="0,0 -16,-9 -16,8" fill={RED} />
							<polygon points="0,0 16,-9 16,8" fill={RED} />
							<path d={`M0 0 q${-10 - Math.sin(t * 9) * 6} 22 ${-22 - wind * 26} ${26 + Math.sin(t * 11) * 5} M0 0 q${-6 - Math.sin(t * 8) * 6} 30 ${-12 - wind * 30} ${40 + Math.sin(t * 10) * 5}`} fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" />
						</g>
					) : null}
				</g>
			) : null}
		</g>
	);
};

// shared gradient for lantern light; put once inside the <svg>
export const Defs: React.FC = () => (
	<defs>
		<radialGradient id="kzGlow">
			<stop offset="0" stopColor={RED} stopOpacity={0.75} />
			<stop offset="0.45" stopColor={RED} stopOpacity={0.28} />
			<stop offset="1" stopColor={RED} stopOpacity={0} />
		</radialGradient>
		<filter id="kzInk" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={7} />
			<feDisplacementMap in="SourceGraphic" scale={60} />
			<feGaussianBlur stdDeviation={5} />
		</filter>
		<filter id="kzSoft" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation={16} />
		</filter>
	</defs>
);
