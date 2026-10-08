// 傷は地図になる, second version (the father and the daughter): clock, palette and small maths for src/kizu2.
import env from './env.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// The new recording creeps from 147.6 to 149.9 BPM, so beats come from a measured table, not a fixed grid.
// Beat 0 is the table's second entry (the first bar line); lyric lines then start on multiples of 8.
const T = env.beats as number[];
export const BEAT = 60 / 148.4; // average, for things that only need a rough beat length
export const beatTime = (b: number) => {
	const x = b + 1;
	if (x <= 0) return T[0] + x * (T[1] - T[0]);
	if (x >= T.length - 1) return T[T.length - 1] + (x - (T.length - 1)) * (T[T.length - 1] - T[T.length - 2]);
	const i = Math.floor(x);
	return T[i] + (x - i) * (T[i + 1] - T[i]);
};
export const beatAt = (t: number) => {
	if (t <= T[0]) return (t - T[0]) / (T[1] - T[0]) - 1;
	const n = T.length - 1;
	if (t >= T[n]) return n - 1 + (t - T[n]) / (T[n] - T[n - 1]);
	let lo = 0;
	let hi = n;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (T[mid] <= t) lo = mid;
		else hi = mid;
	}
	return lo - 1 + (t - T[lo]) / (T[lo + 1] - T[lo]);
};
export const END_BEAT = 562;
export const FRAMES = Math.round(beatTime(END_BEAT) * FPS);

export const INK = '#0B0B0D';
export const SNOW = '#F6F6F4';
export const PAPER = '#F0E9DA';
export const RED = '#D81E2C';

export type Mode = 'k' | 'w' | 'p';
export type Pal = {bg: string; fg: string; cloud: string; shade: string; line: string; far: string; faint: string; ink: string};
export const pal = (m: Mode): Pal =>
	m === 'k'
		? {bg: INK, fg: SNOW, cloud: SNOW, shade: '#B9B9C2', line: INK, far: '#2B2B33', faint: '#1A1A20', ink: INK}
		: m === 'w'
			? {bg: SNOW, fg: INK, cloud: SNOW, shade: '#D4D4DA', line: INK, far: '#C9C9D0', faint: '#E6E6E8', ink: INK}
			: {bg: PAPER, fg: '#1C1A18', cloud: PAPER, shade: '#CFC6B4', line: '#1C1A18', far: '#B9B0A0', faint: '#DDD4C2', ink: '#1C1A18'};
export const flip = (m: Mode): Mode => (m === 'k' ? 'w' : 'k');

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (x: number) => {
	const c = clamp01(x);
	return c * c * (3 - 2 * c);
};
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const backOut = (x: number, over = 1.7) => {
	const c = clamp01(x) - 1;
	return 1 + c * c * ((over + 1) * c + over);
};
// seeded 0..1
export const rnd = (i: number, salt = 0) => {
	const v = Math.sin(i * 127.1 + salt * 311.7 + 0.5) * 43758.5453;
	return v - Math.floor(v);
};
export const mod = (a: number, n: number) => ((a % n) + n) % n;

// drum envelopes (0..1) at a song time
const at = (arr: number[], t: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.round(t * env.hz)))] ?? 0;
export const kick = (t: number) => at(env.low as number[], t);
export const snap = (t: number) => at(env.hi as number[], t);
