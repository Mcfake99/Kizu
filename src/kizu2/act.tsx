import React from 'react';
import {BEAT, H, INK, Mode, RED, SNOW, W, backOut, beatTime, clamp01, ease, easeOut, flip, kick, lerp, mod, pal, prog, rnd} from './core';
import {Defs, Kind, P, Pose, Stick, lerpPose, runPose, walkPose} from './rig';
import {Backdrop, Foreground, Ground, GroundLayer, JP, Theme} from './world';

// One shot = the star moving through a scene with things happening to him on given beats.
// All beats inside a shot are counted from the shot's own start.
export type Ev = [number, string, number?, number?];
export type FoeSpec = {at: number; k?: Kind; gap?: number; enter?: 'run' | 'stand' | 'drop'; cut?: boolean; miss?: boolean; die?: number; big?: number};
export type Tr = 'cut' | 'slash' | 'ink' | 'whip' | 'fade';
export type Shot = {
	b: number;
	n: number;
	m: Mode;
	th: Theme;
	note: string;
	sec?: string;
	z?: number | [number, number];
	tilt?: number | [number, number];
	dir?: 1 | -1;
	ax?: number;
	focus?: 'feet' | 'body' | 'head' | 'wide';
	st?: 'run' | 'walk' | 'stand' | 'kneel' | 'none';
	ev?: Ev[];
	foes?: FoeSpec[];
	tr?: Tr;
	sun?: [number, number, number] | null;
	lan?: 0 | 1 | 2;
	ground?: Ground;
	route?: boolean;
	x?: string[];
	crowd?: number;
	kind?: 'act' | 'map' | 'top' | 'tunnel';
	cord?: boolean; // he carries her red cord on the lantern
	map?: {from: number; to: number; followers?: number; back?: boolean; title?: boolean; z?: [number, number]};
	top?: {foes?: number; allies?: number; girl?: boolean; steps?: 'fade' | 'small'; melee?: boolean};
	tun?: {foes?: number[]; allies?: number};
	split?: Partial<Shot>;
};

const RUN = 400; // px per beat at full speed: two 200 px steps
const STEP = 1 / 16;

type Sim = {x: number[]; v: number[]; dist: number[]; evs: Ev[]};
const sims = new WeakMap<object, Sim>();
const allEvents = (s: Shot): Ev[] => {
	const evs: Ev[] = [...(s.ev ?? [])];
	(s.foes ?? []).forEach((f, i) => {
		if (f.at > s.n + 4) return;
		if (f.cut) {
			if (!f.miss && f.at < s.n) evs.push([f.at, 'hit', 1.7]);
			if (f.die !== undefined) evs.push([f.die, 'slash', i % 2]);
		} else evs.push([f.at, 'slash', i % 2]);
	});
	return evs.sort((a, b) => a[0] - b[0]);
};
const simulate = (s: Shot): Sim => {
	const got = sims.get(s);
	if (got) return got;
	const evs = allEvents(s);
	const st = s.st ?? 'run';
	let v = st === 'run' ? 1 : st === 'walk' ? 0.3 : 0;
	let target = v;
	let x = 0;
	let dist = 0;
	const out: Sim = {x: [], v: [], dist: [], evs};
	const steps = Math.ceil((s.n + 3) / STEP);
	for (let i = 0; i <= steps; i++) {
		const lb = i * STEP;
		for (const e of evs) {
			if (e[0] > lb - STEP && e[0] <= lb) {
				if (e[1] === 'go') target = 1;
				if (e[1] === 'stop') target = 0;
				if (e[1] === 'walk') target = 0.3;
			}
		}
		const hit = evs.find((e) => e[1] === 'hit' && lb >= e[0] && lb < e[0] + (e[2] ?? 1.7) - 0.5);
		if (hit) v = 0;
		else v += Math.max(-2.4 * STEP, Math.min(1.7 * STEP, target - v));
		out.x.push(x);
		out.v.push(v);
		out.dist.push(dist);
		x -= v * RUN * STEP;
		dist += v * RUN * STEP;
	}
	sims.set(s, out);
	return out;
};
const sample = (arr: number[], lb: number) => {
	const f = Math.max(0, Math.min(arr.length - 1.001, lb / STEP));
	const i = Math.floor(f);
	return lerp(arr[i], arr[i + 1] ?? arr[i], f - i);
};

type Hero = {x: number; v: number; pose: Pose; lift: number; face: 1 | -1; sx: number; sy: number; armed: boolean; lit: number | undefined; eye: number; smear: number; newScars: number};
const hero = (s: Shot, lb: number): Hero => {
	const sim = simulate(s);
	const evs = sim.evs;
	const l = Math.max(0, lb);
	let x = sample(sim.x, l);
	const v = sample(sim.v, l);
	const dist = sample(sim.dist, l);
	const st = s.st ?? 'run';
	// base: stand -> walk -> run by speed
	const idle: Pose = {...P.stand, lean: P.stand.lean + Math.sin(lb * 1.6) * 1.5, aF: [P.stand.aF[0] + Math.sin(lb * 1.6) * 3, 10]};
	let pose = v < 0.3 ? lerpPose(idle, walkPose(dist / 120), ease(v / 0.3)) : lerpPose(walkPose(dist / 120), runPose(dist / 200), ease((v - 0.3) / 0.5));
	let lift = v > 0.6 ? Math.abs(Math.sin((dist / 200) * Math.PI)) * 14 : 0;
	let sy = 1;
	let armed = (s.x ?? []).includes('armed');
	let face: 1 | -1 = -1;
	let sx = 1;
	let eye = 0;
	let smear = clamp01((v - 0.7) * 3) * 0.7;
	let newScars = 0;
	let lit: number | undefined = s.lan ? (s.lan === 2 ? 1 : 0) : undefined;
	const firstGo = evs.find((e) => e[1] === 'go' || e[1] === 'walk' || e[1] === 'rise');
	if (st === 'kneel') {
		const k = firstGo ? 1 - ease(prog(lb, firstGo[0] - 0.2, firstGo[0] + 0.8)) : 1;
		pose = lerpPose(pose, P.kneel, k);
	}
	for (const e of evs) {
		const [b, kind, a, c] = e;
		if (kind === 'kneel') pose = lerpPose(pose, P.kneel, ease(prog(lb, b, b + 0.6)) * (1 - ease(prog(lb, (a ?? 99) - 0.2, (a ?? 99) + 0.7))));
		if (kind === 'raise') {
			const k = backOut(prog(lb, b, b + 0.7), 1.4) * (1 - ease(prog(lb, (a ?? 99) - 0.3, (a ?? 99) + 0.4)));
			pose = {...pose, aB: [lerp(pose.aB[0], P.raise.aB[0], k), lerp(pose.aB[1], P.raise.aB[1], k)], head: lerp(pose.head, pose.head + 14, k)};
		}
		if (kind === 'sheath') pose = lerpPose(pose, P.sheath, ease(prog(lb, b, b + 0.3)) * (1 - ease(prog(lb, (a ?? 99) - 0.2, (a ?? 99) + 0.5))));
		if (kind === 'leap') {
			const dur = a ?? 2;
			const k = (lb - b) / dur;
			if (k > -0.25 && k < 0) sy = 1 - 0.18 * Math.sin((k + 0.25) * 4 * Math.PI);
			if (k >= 0 && k <= 1) {
				lift += (c ?? 260) * Math.sin(Math.PI * k);
				pose = lerpPose(pose, P.leap, Math.pow(Math.sin(Math.PI * k), 0.4));
				sy = 1 + 0.1 * Math.abs(Math.cos(Math.PI * k));
			}
			if (k > 1 && k < 1.2) sy = 1 - 0.2 * Math.sin((k - 1) * 5 * Math.PI);
		}
		if (kind === 'dash') {
			x -= (a ?? 500) * easeOut(prog(lb, b - 0.05, b + 0.22));
			if (lb > b - 0.1 && lb < b + 0.5) smear = 1.6;
		}
		if (kind === 'slash') {
			if (lb > b - 0.8 && lb < b + 1.1) armed = true;
			const [wp, sp] = a ? [P.windLow, P.strikeUp] : [P.wind, P.strike];
			if (lb >= b - 0.62 && lb < b - 0.07) {
				// the arms wind up while the legs keep running
				const legs = pose;
				pose = lerpPose(pose, wp, ease(prog(lb, b - 0.62, b - 0.22)));
				if (v > 0.5) pose = {...pose, lF: legs.lF, lB: legs.lB};
			}
			else if (lb >= b - 0.07 && lb < b + 0.55) pose = lerpPose(wp, sp, easeOut(prog(lb, b - 0.07, b + 0.07)));
			else if (lb >= b + 0.55 && lb < b + 1.0) pose = lerpPose(sp, pose, ease(prog(lb, b + 0.55, b + 1.0)));
			if (lb > b - 0.07 && lb < b + 0.3) smear = 1.3;
		}
		if (kind === 'parry') {
			if (lb > b - 0.8 && lb < b + 1.1) armed = true;
			pose = lerpPose(pose, P.guard, ease(prog(lb, b - 0.4, b - 0.05)) * (1 - ease(prog(lb, b + 0.5, b + 0.9))));
		}
		if (kind === 'hit') {
			const dur = a ?? 1.7;
			const k = easeOut(prog(lb, b, b + 0.12)) * (1 - ease(prog(lb, b + dur - 0.7, b + dur)));
			pose = lerpPose(pose, lerpPose(P.hit, P.kneel, ease(prog(lb, b + 0.5, b + 1.0))), k);
			x += 230 * easeOut(prog(lb, b, b + 0.7));
			newScars += lb >= b ? prog(lb, b + 0.25, b + 1.6) * 0.999 + 0.001 : 0;
		}
		if (kind === 'turn') {
			if (lb >= b) face = a === -1 ? -1 : 1;
			sx = Math.max(0.12, Math.abs(1 - 2 * prog(lb, b - 0.25, b + 0.25)));
		}
		if (kind === 'eye') eye = Math.max(eye, backOut(prog(lb, b, b + 0.5)));
		if (kind === 'light' && lit !== undefined) lit = Math.max(lit, backOut(prog(lb, b, b + 0.4), 2.5));
		if (kind === 'out' && lit !== undefined) lit = lit * (1 - easeOut(prog(lb, b, b + 0.3)));
	}
	return {x, v, pose, lift, face, sx, sy, armed, lit, eye, smear, newScars};
};

const Crescent: React.FC<{x: number; y: number; k: number; color: string; flipY?: boolean; s?: number}> = ({x, y, k, color, flipY, s = 1}) =>
	k <= 0 || k >= 1 ? null : (
		<g transform={`translate(${x} ${y}) scale(${(0.7 + easeOut(k) * 0.9) * s} ${(flipY ? -1 : 1) * (0.7 + easeOut(k) * 0.9) * s}) rotate(-28)`} opacity={1 - k * k}>
			<path d="M-250 -150 Q40 -250 250 60 Q10 -120 -250 -150 Z" fill={color} />
		</g>
	);
const Burst: React.FC<{x: number; y: number; age: number; color: string; seed: number; n?: number}> = ({x, y, age, color, seed, n = 14}) =>
	age <= 0 || age > 1.6 ? null : (
		<g fill={color}>
			{[...Array(n)].map((_, i) => {
				const a = rnd(seed + i, 31) * Math.PI * 2;
				const sp = 260 + rnd(seed + i, 32) * 520;
				const d = sp * (1 - Math.exp(-age * 2.4));
				return <circle key={i} cx={x + Math.cos(a) * d - 120 * age} cy={y + Math.sin(a) * d * 0.8 + 330 * age * age} r={(7 + rnd(seed + i, 33) * 15) * (1 - age / 1.7)} />;
			})}
		</g>
	);

// the red route the scars become; shared by the bridge, the final chorus and the map
export const ROUTE: [number, number][] = [
	[1730, 250],
	[1560, 330],
	[1600, 470],
	[1380, 520],
	[1240, 400],
	[1050, 440],
	[1090, 600],
	[860, 690],
	[700, 560],
	[520, 620],
	[560, 780],
	[330, 840],
	[190, 720],
];
export const routePath = (k: number) => {
	const n = (ROUTE.length - 1) * clamp01(k);
	let d = `M${ROUTE[0][0]} ${ROUTE[0][1]}`;
	for (let i = 1; i <= Math.ceil(n); i++) {
		const f = Math.min(1, n - (i - 1));
		d += ` L${lerp(ROUTE[i - 1][0], ROUTE[i][0], f).toFixed(1)} ${lerp(ROUTE[i - 1][1], ROUTE[i][1], f).toFixed(1)}`;
	}
	return d;
};

export const Act: React.FC<{shot: Shot; beat: number; scarBase: number; clip?: string}> = ({shot: s, beat, scarBase, clip}) => {
	const lb = beat - s.b;
	const t = beatTime(beat);
	const sim = simulate(s);
	const evs = sim.evs;
	const X = s.x ?? [];
	const h = hero(s, lb);
	// impact frames: the picture flips to its negative for two frames on every cut that lands
	const strikes = evs.filter((e) => e[1] === 'slash' || e[1] === 'hit');
	const impact = strikes.some((e) => lb >= e[0] && lb < e[0] + 0.17);
	const m: Mode = impact && s.m !== 'p' ? flip(s.m) : s.m;
	const c = pal(m);
	const k = prog(lb, 0, s.n);
	const zr = s.z ?? 1.1;
	const z0 = (typeof zr === 'number' ? zr : lerp(zr[0], zr[1], ease(k))) * (1 + 0.02 * kick(t));
	const tr = s.tilt ?? 0;
	const tilt = typeof tr === 'number' ? tr : lerp(tr[0], tr[1], ease(k));
	const focus = s.focus ?? (z0 < 0.9 ? 'wide' : 'body');
	const fy = {feet: -40, body: -210, head: -330, wide: -40}[focus];
	const ay = focus === 'wide' ? 0.7 : focus === 'feet' ? 0.62 : 0.52;
	const ax = s.ax ?? 0.56;
	const dirS = s.dir ?? -1;
	const fx = dirS === 1 ? -1 : 1; // mirror the whole world for left-to-right shots
	const shake = strikes.reduce((acc, e) => (lb >= e[0] ? acc + Math.exp(-(lb - e[0]) * 5) : acc), 0);
	const shx = Math.sin(beat * 47) * 16 * shake;
	const shy = Math.cos(beat * 61) * 12 * shake;
	const camX = h.x - (0.12 * W * (1 - k)) / z0 + 40;
	const world = `translate(${(fx === 1 ? ax : 1 - ax) * W + shx} ${ay * H + shy}) rotate(${tilt * fx}) scale(${z0 * fx} ${z0}) translate(${-camX} ${-fy})`;
	const zb = 1 + (z0 - 1) * 0.25;
	const back = `translate(960 540) rotate(${tilt * fx}) scale(${zb * fx} ${zb}) translate(-960 -540)`;
	const half = (W / z0) * (Math.abs(tilt) > 20 ? 1.1 : 0.62) + 200;
	const sun = s.sun === undefined ? (s.th === 'sky' ? ([1140, 400, 215] as [number, number, number]) : null) : s.sun;
	const st = s.st ?? 'run';
	const grow = X.includes('bloomin') ? ease(prog(lb, 0, s.n * 0.7)) : 1;

	// foes
	const foes = (s.foes ?? []).map((f, i) => {
		const gap = f.gap ?? 235;
		const meet = sample(sim.x, Math.min(f.at, s.n + 3)) - gap * (f.k === 'oni' ? 1.25 : 1) * (f.big ?? 1);
		const enter = f.enter ?? 'run';
		const dieAt = f.cut ? f.die : f.at;
		let x = meet;
		let pose: Pose = P.guard;
		let lift = 0;
		let rot = 0;
		let op = 1;
		let sy = 1;
		const ph = i * 0.37;
		if (enter === 'run' && lb < f.at) {
			x = meet - 240 * Math.max(0, f.at - 0.5 - lb);
			pose = runPose((lb + ph) * 2);
		}
		if (enter === 'stand') pose = {...P.guard, lean: 12 + Math.sin(lb * 2 + i) * 3, sw: 22 + Math.sin(lb * 2.3 + i * 2) * 6};
		if (enter === 'drop') {
			const fall = Math.max(0, f.at - 1.1 - lb);
			lift = fall * fall * 900 + fall * 500;
			pose = fall > 0 ? P.fall : P.guard;
			const la = lb - (f.at - 1.1);
			if (la > 0 && la < 0.4) sy = 1 - 0.25 * Math.sin((la / 0.4) * Math.PI);
		}
		// its own swing
		if (lb > f.at - 0.6 && lb <= f.at - 0.06) pose = lerpPose(pose, P.wind, ease(prog(lb, f.at - 0.6, f.at - 0.25)));
		if (f.cut && lb > f.at - 0.06) pose = lerpPose(P.strike, P.guard, ease(prog(lb, f.at + 0.6, f.at + 1.1)));
		if (f.cut && dieAt === undefined && lb > f.at + 1) {
			x -= 420 * (lb - f.at - 1);
			pose = runPose(lb * 2);
		}
		let burst = -1;
		if (dieAt !== undefined && lb >= dieAt) {
			const a = lb - dieAt;
			x = (f.cut ? meet : x) - 420 * (1 - Math.exp(-a * 1.8));
			lift = 300 * Math.sin(Math.min(1, a / 1.5) * Math.PI);
			rot = -a * 210;
			op = 1 - prog(a, 0.45, 1.2);
			pose = P.hit;
			burst = a;
		}
		return {f, x, pose, lift, rot, op, sy, burst, meet, i, face: (f.cut && dieAt === undefined && lb > f.at + 1 ? -1 : 1) as 1 | -1};
	});

	// ---- the daughter and the things around her ----
	const heroRim = m === 'k' ? SNOW : c.bg;
	const dist = sample(sim.dist, Math.max(0, lb));
	let girl: React.ReactNode = null;
	const G = (gx: number, o: {face?: 1 | -1; pose?: Pose; lift?: number; rot?: number; bow?: number; lantern?: number; op?: number}) => (
		<Stick x={gx} y={0} s={1.5} kind="girl" sword="none" face={o.face ?? h.face} pose={o.pose ?? (h.v > 0.5 ? runPose(dist / 120) : h.v > 0.05 ? walkPose(dist / 70) : P.stand)} fill={c.ink} rim={heroRim} lift={o.lift ?? (h.v > 0.5 ? Math.abs(Math.sin((dist / 120) * Math.PI)) * 10 : 0)} rot={o.rot} bow={o.bow ?? 1} lantern={o.lantern} opacity={o.op} t={t} />
	);
	if (X.includes('taken')) {
		const f0 = foes[0];
		const k = ease(prog(lb, 2.4, 3.2));
		girl = G(lerp(h.x - 115, f0 ? f0.x - 30 : h.x, k), {lift: k * 200, rot: k * 80, pose: k > 0.1 ? P.fall : undefined});
	} else if (X.includes('reunion')) {
		const k = easeOut(prog(lb, 0.5, 4));
		const jump = Math.sin(prog(lb, 3.4, 4.4) * Math.PI) * 70;
		girl = G(h.x - 700 + 560 * k, {face: 1, pose: k < 1 ? runPose(lb * 3) : lerpPose(P.stand, P.raise, 0.5), lift: jump, bow: 0});
	} else if (X.includes('tie')) girl = G(h.x - 140, {face: 1, pose: lb > 5 ? P.raise : P.stand, bow: backOut(prog(lb, 3.5, 4.2), 2.5), lantern: lb > 5 ? 1 : undefined});
	else if (X.includes('girl')) girl = G(h.x - 115, {lantern: X.includes('girllantern') ? 1 : undefined});
	const cageOpen = evs.find((e) => e[1] === 'slash');
	const cageX = sample(sim.x, s.n) - 330;
	const cordX = sample(sim.x, s.n + 3) - 170;
	const scars = scarBase + h.newScars;
	const glow = X.includes('glow') ? 1 : 0;
	const followers = s.crowd
		? [...Array(s.crowd)].map((_, i) => {
				const appear = X.includes('gather') ? (i / s.crowd!) * s.n * 0.8 : -1;
				const a = prog(lb, appear, appear + 1);
				const fxw = h.x + 250 + i * 150 + rnd(i, 41) * 70 + (1 - ease(a)) * 500;
				return a <= 0 ? null : (
					<Stick key={i} x={fxw} y={0} s={1.5 + rnd(i, 42) * 0.4} face={-1} pose={h.v > 0.5 ? runPose(sample(sim.dist, lb) / 200 + rnd(i, 43) * 2) : h.v > 0.05 ? walkPose(sample(sim.dist, lb) / 120 + rnd(i, 43) * 2) : lerpPose(P.stand, P.raise, 0.8)} fill={c.ink} rim={c.bg === INK ? SNOW : c.bg} kind={(['ronin', 'ninja', 'ronin'] as Kind[])[i % 3]} sword="none" lantern={1} t={t + i} opacity={a} lift={h.v > 0.5 ? Math.abs(Math.sin(lb * 2 * Math.PI + i)) * 10 : 0} />
				);
			})
		: null;
	const flares = evs.filter((e) => e[1] === 'flare' || e[1] === 'light');

	const body = (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
			<Defs />
			<rect width={W} height={H} fill={c.bg} />
			<g transform={back}>
				<Backdrop th={s.th} cam={camX} c={c} t={t} sun={sun} grow={grow} />
				{X.includes('train') ? (
					<g>
						{[...Array(9)].map((_, i) => {
							const x = mod(i * 330 + lb * 2600, 2970) - 500;
							return <rect key={i} x={x} y={612} width={250} height={84} rx={12} fill={c.fg} opacity={0.9} />;
						})}
					</g>
				) : null}
				{X.includes('lanterns') || X.includes('answer')
					? [...Array(X.includes('answer') ? 9 : 44)].map((_, i) => {
							const born = X.includes('answer') ? 1 + i * 0.7 : (i / 44) * s.n * 0.6 - (X.includes('full') ? 99 : 0);
							const a = prog(lb, born, born + 0.6);
							const x = mod(rnd(i, 44) * 2100 - camX * 0.08, 2100) - 90;
							const y = 760 - rnd(i, 45) * 640 - Math.max(0, lb - born) * 14;
							const r = 9 + rnd(i, 46) * 13;
							return a <= 0 ? null : (
								<g key={i} opacity={a}>
									<circle cx={x} cy={y} r={r * 4} fill="url(#kzGlow)" />
									<rect x={x - r * 0.6} y={y - r} width={r * 1.2} height={r * 2} rx={r * 0.5} fill={RED} />
								</g>
							);
						})
					: null}
			</g>
			<g transform={world}>
				<GroundLayer kind={s.ground ?? (s.th === 'station' ? 'slab' : s.th === 'roofs' ? 'tiles' : 'cloud')} x0={camX - half} x1={camX + half} c={c} outline={m !== 'k'} />
				{s.route ? <path d={`M${camX + half} 20 L${X.includes('laying') ? h.x + 30 : camX - half} 20`} stroke={RED} strokeWidth={13} strokeLinecap="round" /> : null}
				{X.includes('bloom')
					? [...Array(7)].map((_, i) => {
							const sb = Math.floor(lb / 2) * 2 - i * 2;
							const age = lb - sb;
							return sb < 0 ? null : <ellipse key={sb} cx={sample(sim.x, sb) - 20} cy={40} rx={60 + 150 * easeOut(age / 6)} ry={18 + 34 * easeOut(age / 6)} fill={c.ink} opacity={0.3 * (1 - age / 14)} filter="url(#kzSoft)" />;
						})
					: null}
				{s.th === 'roofs' && h.v > 0.5
					? [...Array(7)].map((_, i) => {
							const sb = (Math.floor(lb * 2) - i) / 2;
							const age = lb - sb;
							return sb < 0 ? null : <rect key={sb} x={sample(sim.x, sb) + 30 + age * 150} y={-20 - 210 * Math.sin(Math.min(1, age / 2.4) * Math.PI) - 30} width={54} height={20} rx={8} fill={c.fg} stroke={c.bg} strokeWidth={4} transform={`rotate(${age * 260 + sb * 77} ${sample(sim.x, sb) + 57 + age * 150} ${-40 - 210 * Math.sin(Math.min(1, age / 2.4) * Math.PI)})`} opacity={1 - prog(age, 2, 3)} />;
						})
					: null}
				{X.includes('smallsteps')
					? [...Array(40)].map((_, i) => {
							const x = (Math.floor(h.x / 130) - i) * 130;
							return <ellipse key={x} cx={x} cy={8} rx={30} ry={12} fill={RED} transform={`rotate(${i % 2 ? 12 : -12} ${x} 8)`} opacity={clamp01((h.x - 60 - x) / 80)} />;
						})
					: null}
				{X.includes('cage')
					? (() => {
							const a = cageOpen ? lb - cageOpen[0] : -1;
							return (
								<g>
									<circle cx={cageX} cy={-170} r={230} fill="url(#kzGlow)" />
									{G(cageX, {face: 1, pose: a > 0.6 ? runPose(lb * 3) : P.stand, bow: 0, lift: 0})}
									{a < 0 ? (
										<g stroke={c.fg} strokeWidth={10} fill="none" strokeLinecap="round">
											<line x1={cageX} y1={-1400} x2={cageX} y2={-330} />
											<rect x={cageX - 105} y={-330} width={210} height={340} rx={40} />
											{[-52, 0, 52].map((dx) => (
												<line key={dx} x1={cageX + dx} y1={-326} x2={cageX + dx} y2={6} />
											))}
										</g>
									) : (
										<Burst x={cageX} y={-170} age={a} color={c.fg} seed={777} n={18} />
									)}
								</g>
							);
						})()
					: null}
				{followers}
				{foes.map((f) =>
					f.op <= 0 ? null : <Stick key={f.i} x={f.x} y={0} pose={f.pose} face={f.face} fill={m === 'p' ? c.bg : SNOW} rim={INK} blade={m === 'k' ? SNOW : INK} kind={f.f.k ?? (f.i % 2 ? 'ninja' : 'ronin')} s={2 * (f.f.big ?? 1)} lift={f.lift} rot={f.rot} opacity={f.op} sy={f.sy} t={t} />,
				)}
				{st === 'none' ? null : (
					<Stick x={h.x} y={0} pose={h.pose} face={h.face} sx={h.sx} sy={h.sy} fill={c.ink} rim={m === 'k' ? SNOW : c.bg} blade={m === 'k' ? SNOW : c.ink} sword={h.armed ? 'hand' : 'back'} lantern={h.lit} cord={s.cord ? (X.includes('cordtake') ? ease(prog(lb, 4, 5)) : 1) : 0} scars={scars} glow={glow} wind={clamp01(h.v * 1.4 + (X.includes('windy') ? 0.8 : 0))} t={t} lift={h.lift} eye={h.eye} smear={h.smear} smearColor={c.fg} />
				)}
				{X.includes('cord') || X.includes('cordtake')
					? (() => {
							const k = X.includes('cordtake') ? ease(prog(lb, 3, 4.6)) : 0;
							if (k >= 1) return null;
							const x = X.includes('cordtake') ? lerp(h.x - 140, h.x + 60, k) : cordX;
							const y = X.includes('cordtake') ? -6 - Math.sin(k * Math.PI) * 120 - k * 150 : -6;
							return (
								<g transform={`translate(${x} ${y}) scale(1.9)`}>
									<circle r={70 + Math.sin(t * 7) * 14} fill="url(#kzGlow)" />
									<polygon points="0,0 -26,-14 -26,12" fill={RED} />
									<polygon points="0,0 26,-14 26,12" fill={RED} />
									<path d="M0 0 q-16 14 -40 12 M0 0 q10 18 34 16" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" />
								</g>
							);
						})()
					: null}
				{X.includes('cage') ? null : girl}
				{foes.map((f) => (f.burst >= 0 ? <Burst key={f.i} x={f.meet} y={-230} age={f.burst} color={c.fg} seed={f.i * 20 + s.b} /> : null))}
				{strikes.map((e, i) => {
					const hx = sample(sim.x, e[0]);
					return <Crescent key={i} x={hx - (e[1] === 'hit' ? -40 : 130)} y={-230} k={(lb - e[0]) / 0.75 + 0.02} color={e[1] === 'hit' ? RED : c.fg} flipY={!!e[2] && e[1] === 'slash'} s={e[1] === 'hit' ? -1 : 1} />;
				})}
				{evs.map((e, i) => (e[1] === 'parry' ? <Burst key={i} x={sample(sim.x, e[0]) - 120} y={-250} age={(lb - e[0]) * 1.4} color={RED} seed={i + 90} n={9} /> : null))}
				{evs.map((e, i) => (e[1] === 'stop' || e[1] === 'land' ? <Burst key={i} x={sample(sim.x, e[0] + 0.5) - 60} y={-10} age={(lb - e[0]) * 0.9} color={c.shade} seed={i + 60} n={7} /> : null))}
				{flares.map((e, i) => {
					const a = (lb - e[0]) / 1.6;
					return a <= 0 || a >= 1 ? null : <circle key={i} cx={h.x + 20} cy={-330} r={60 + easeOut(a) * 1500} fill="none" stroke={RED} strokeWidth={50 * (1 - a)} opacity={1 - a} />;
				})}
				{X.includes('splash')
					? [...Array(12)].map((_, i) => {
							const sb = (Math.floor(lb * 2) - (i % 4)) / 2;
							const age = lb - sb;
							const a = -0.4 - rnd(i, 51) * 2.3;
							return sb < 0 ? null : <circle key={i} cx={sample(sim.x, sb) + Math.cos(a) * 240 * age + 120 * age} cy={Math.sin(a) * 230 * age + 200 * age * age} r={12 * (1 - age / 2)} fill={c.fg} opacity={age < 2 ? 0.8 : 0} />;
						})
					: null}
			</g>
			<g transform={back}>
				<Foreground th={s.th} cam={camX} c={c} />
			</g>
			{h.v > 0.7 && z0 > 0.7 && !X.includes('calm') ? (
				<g transform={`translate(960 540) rotate(${tilt}) translate(-960 -540)`} stroke={c.fg} strokeLinecap="round">
					{[...Array(12)].map((_, i) => {
						const x = mod(rnd(i, 52) * 2600 + dirS * -lb * (2600 + rnd(i, 53) * 1800), 2800) - 400;
						const y = rnd(i + Math.floor(lb / 2) * 3, 54) * 1080;
						return <line key={i} x1={x} y1={y} x2={x + 220 + rnd(i, 55) * 320} y2={y} strokeWidth={3 + rnd(i, 56) * 5} opacity={0.22} />;
					})}
				</g>
			) : null}
			{X.includes('petals')
				? [...Array(34)].map((_, i) => {
						const x = mod(rnd(i, 57) * 2200 + t * (260 + rnd(i, 58) * 420), 2200) - 140;
						const y = mod(rnd(i, 59) * 1200 + t * (70 + rnd(i, 60) * 90) + Math.sin(t * 3 + i) * 30, 1200) - 60;
						return <ellipse key={i} cx={x} cy={y} rx={13} ry={7} fill={i % 4 ? RED : c.fg} transform={`rotate(${t * 200 + i * 40} ${x} ${y})`} opacity={0.9} />;
					})
				: null}
			{X.includes('focus') ? (
				<g fill={c.fg}>
					{[...Array(34)].map((_, i) => {
						const a = (i / 34) * Math.PI * 2 + rnd(i + Math.floor(lb * 4), 61) * 0.15;
						const r0 = 520 + rnd(i + Math.floor(lb * 4), 62) * 240;
						const w = 0.012 + rnd(i, 63) * 0.02;
						return <polygon key={i} points={`${960 + Math.cos(a) * r0},${540 + Math.sin(a) * r0 * 0.62} ${960 + Math.cos(a - w) * 1500},${540 + Math.sin(a - w) * 1500} ${960 + Math.cos(a + w) * 1500},${540 + Math.sin(a + w) * 1500}`} />;
					})}
				</g>
			) : null}
			{X.includes('release')
				? (() => {
						const a = prog(lb, 2, s.n + 2);
						return a <= 0 ? null : <path d={`M${1010 + a * 900} ${420 - a * 300 + Math.sin(a * 14) * 40} q40 -30 80 0 q40 30 80 0`} fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" />;
					})()
				: null}
			{X.includes('lift') || X.includes('mapair')
				? (() => {
						const a = X.includes('mapair') ? 1 : ease(prog(lb, 1, s.n));
						return (
							<g opacity={0.95}>
								<path d={routePath(a)} fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${X.includes('mapair') ? Math.sin(t) * 6 : 0} ${-70 + Math.sin(t * 1.3) * 5})`} />
							</g>
						);
					})()
				: null}
			{X.includes('title') ? (
				<g fontFamily={JP} fontWeight={800} fill={c.fg}>
					{'傷は地図になる'.split('').map((ch, i) => {
						const a = backOut(prog(lb, 5 + i * 0.75, 5.6 + i * 0.75), 1.2) * (1 - ease(prog(lb, s.n - 1.2, s.n - 0.2)));
						return (
							<text key={i} x={s.th === "sky" ? 1760 : 1490} y={250 + i * 112} fontSize={104} textAnchor="middle" opacity={clamp01(a)} fill={ch === '傷' || ch === '地' || ch === '図' ? RED : c.fg} transform={`translate(0 ${(1 - a) * -26})`}>
								{ch}
							</text>
						);
					})}
				</g>
			) : null}
		</svg>
	);
	return <div style={{position: 'absolute', inset: 0, clipPath: clip, overflow: 'hidden'}}>{body}</div>;
};

export const actEvents = allEvents;
export const BEATLEN = BEAT;

// where the star is across the frame, for crops that follow him (the vertical shorts)
export const heroScreenX = (s: Shot, beat: number) => {
	if (s.kind === 'map' || s.split) return W / 2;
	const k = prog(beat - s.b, 0, s.n);
	const zr = s.z ?? 1.1;
	const z0 = typeof zr === 'number' ? zr : lerp(zr[0], zr[1], ease(k));
	const x = (s.ax ?? 0.56) * W + 0.12 * W * (1 - k) - 40 * z0;
	return (s.dir ?? -1) === 1 ? W - x + 90 : x - 90;
};
