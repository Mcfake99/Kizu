import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Act, Shot, Tr, actEvents} from './act';
import {FPS, FRAMES, H, INK, RED, W, beatAt, beatTime, clamp01, easeIn, easeOut} from './core';
import {MapShot} from './map';
import {SHOTS} from './shots';
import {TopShot, TunnelShot} from './views';
import {Words} from './words';

// 傷は地図になる, second version. The shots are in shots.ts, the key words in words.tsx.
export const KIZU2_FRAMES = FRAMES;

// scars carried into each shot = cuts taken in all the shots before it
const SCAR_BASE: number[] = [];
SHOTS.reduce((n, s, i) => {
	SCAR_BASE[i] = n;
	return n + (s.kind && s.kind !== 'act' ? 0 : actEvents(s).filter((e) => e[1] === 'hit').length);
}, 0);

const TR_FRAMES: Record<Tr, number> = {cut: 0, slash: 4, ink: 7, whip: 5, fade: 14};
const trOf = (i: number): Tr => SHOTS[i].tr ?? (i > 0 && SHOTS[i - 1].m !== SHOTS[i].m && SHOTS[i].n > 1 ? 'slash' : 'cut');

const Scene: React.FC<{i: number; beat: number; clip?: string}> = ({i, beat, clip}) => {
	const s: Shot = SHOTS[i];
	if (s.kind === 'map') return <MapShot shot={s} beat={beat} clip={clip} />;
	if (s.kind === 'top') return <TopShot shot={s} beat={beat} clip={clip} />;
	if (s.kind === 'tunnel') return <TunnelShot shot={s} beat={beat} clip={clip} />;
	return <Act shot={s} beat={beat} scarBase={SCAR_BASE[i]} clip={clip} />;
};

export const shotAt = (beat: number) => {
	let i = 0;
	while (i < SHOTS.length - 1 && SHOTS[i + 1].b <= beat + 1e-6) i++;
	return i;
};

export const Kizu2: React.FC<{audio?: boolean}> = ({audio = true}) => {
	const f = useCurrentFrame();
	return (
		<>
			<Kizu2Picture f={f} />
			{audio ? <Audio src={staticFile('kizu2.mp3')} /> : null}
		</>
	);
};

// the picture at any frame of the song
export const Kizu2Picture: React.FC<{f: number; words?: boolean}> = ({f, words = true}) => {
	const beat = beatAt(f / FPS);
	const i = shotAt(beat);
	const s = SHOTS[i];
	const tr = trOf(i);
	const f0 = Math.round(beatTime(s.b) * FPS);
	const k = TR_FRAMES[tr] ? clamp01((f - f0 + 1) / TR_FRAMES[tr]) : 1;
	const under = k < 1 && i > 0;
	let clip: string | undefined;
	let edge: React.ReactNode = null;
	let style: React.CSSProperties = {};
	if (under) {
		if (tr === 'slash') {
			// the cut that flips the page: a slanted edge sweeps across the way he is running
			const e = W + 500 - easeOut(k) * (W + 1000);
			clip = `polygon(${e}px 0, ${W + 600}px 0, ${W + 600}px ${H}px, ${e - 380}px ${H}px)`;
			edge = (
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<line x1={e} y1={0} x2={e - 380} y2={H} stroke={RED} strokeWidth={16} />
				</svg>
			);
		} else if (tr === 'ink') clip = `circle(${easeIn(k) * 1300 + 20}px at 56% 46%)`;
		else if (tr === 'fade') style = {opacity: k};
	}
	// fade from paper at the start and to black at the very end
	const cover = Math.max(1 - clamp01(f / 20), clamp01((f - (FRAMES - 45)) / 40));
	return (
		<AbsoluteFill style={{backgroundColor: INK}}>
			{under ? (
				<AbsoluteFill>
					<Scene i={i - 1} beat={beat} />
				</AbsoluteFill>
			) : null}
			<AbsoluteFill style={style}>
				<Scene i={i} beat={beat} clip={clip} />
			</AbsoluteFill>
			{edge}
			{words && s.kind !== 'map' ? <Words beat={beat} mode={s.m} /> : null}
			{cover > 0 ? <AbsoluteFill style={{backgroundColor: i === 0 ? '#F0E9DA' : INK, opacity: cover}} /> : null}
		</AbsoluteFill>
	);
};
