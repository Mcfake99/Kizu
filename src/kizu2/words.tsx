import React from 'react';
import {H, INK, Mode, RED, SNOW, W, backOut, beatTime, clamp01, ease, easeOut, prog, FPS} from './core';
import {EN, JP} from './world';

// Key words. Japanese rides on strips (down, across or slanted) that wipe on along their length.
// English is handled differently: huge condensed capitals that invert whatever is under them.
// Every time is a beat. To move a word, change its first number.
type Strip = {b: number; text: string; o: 'v' | 'h' | 'd' | 'u'; p: number; size?: number; sc?: 'red' | 'auto'; d?: number};
const J = (b: number, text: string, o: Strip['o'], p: number, size?: number, sc?: Strip['sc'], d?: number): Strip => ({b, text, o, p, size, sc, d});

// places: v = x of a column, h = y of a band, d/u = which corner (0 top-left, 1 bottom-right, 2 top-right, 3 bottom-left)
const VX = [150, 300, 1770, 1650];
const HY = [120, 950];

const chorus = (c: number, v: number, last = false): Strip[] => [
	J(c + 2.5, 'まだ終わらない', 'h', v % 2 ? 0 : 1, 120, 'auto', 4.5),
	J(c + 10, '傷', 'v', v % 2 ? 2 : 0, 250, 'red', 5.5),
	J(c + 11.5, '地図', 'v', v % 2 ? 0 : 2, 220, 'red', 4),
	J(c + 16, '瓦', 'v', v % 2 ? 1 : 3, 170, 'auto', 3),
	J(c + 17.5, '鳴る', 'd', v % 2 ? 2 : 0, 130, 'auto', 2.5),
	J(c + 20, last ? '胸の真ん中' : '街の真ん中', 'h', v % 2 ? 1 : 0, 120, 'auto', 3.5),
	J(c + 32, '灯', 'v', v % 2 ? 0 : 2, 250, 'red', 5),
	J(c + 33.5, '掲げて', 'v', v % 2 ? 1 : 3, 130, 'auto', 3),
	J(c + 36.5, '歩き出せ', 'u', v % 2 ? 3 : 1, 170, 'red', 4),
];

export const STRIPS: Strip[] = [
	// verse 1
	J(48, '提灯', 'v', 0, 170, 'auto', 3.5),
	J(52, '風', 'v', 2, 230, 'red', 3.5),
	J(56, '道', 'v', 0, 250, 'red', 4),
	J(60, '名', 'v', 2, 210, 'auto', 3.5),
	J(65.5, '刃', 'v', 0, 230, 'auto', 3),
	J(69.5, '鞘', 'v', 2, 210, 'auto', 2.5),
	J(72, '足跡', 'v', 0, 190, 'auto', 4),
	J(76, '夜に溶ける', 'h', 1, 120, 'auto', 3.5),
	// pre-chorus 1
	J(80, '呼ばない名', 'h', 0, 120, 'auto', 3.5),
	J(84, '胸', 'v', 0, 230, 'red', 3.5),
	J(88, '光', 'v', 2, 230, 'red', 4),
	J(92, '歩いていく', 'u', 3, 140, 'auto', 4),
	...chorus(104, 0),
	// chorus 1 again
	J(154, '傷', 'v', 2, 250, 'red', 5),
	J(155.5, '地図', 'v', 0, 220, 'red', 4),
	J(160, '瓦', 'v', 3, 170, 'auto', 3),
	J(163, '街の真ん中', 'h', 1, 120, 'auto', 3.5),
	J(180, '灯', 'v', 0, 250, 'red', 5),
	J(181.5, '掲げて', 'v', 1, 130, 'auto', 3),
	J(185, '歩き出せ', 'u', 3, 170, 'red', 4),
	// verse 2
	J(192, '草', 'v', 0, 230, 'auto', 3),
	J(195.5, '赤い紐', 'v', 2, 190, 'red', 4.5),
	J(200, '小さすぎて', 'h', 0, 120, 'auto', 3.5),
	J(204, '手のひら', 'v', 2, 170, 'auto', 3.5),
	J(208, '誰のもの', 'v', 0, 170, 'auto', 3.5),
	J(212, '問うな', 'v', 2, 190, 'red', 3.5),
	J(216, '刃', 'v', 0, 250, 'auto', 3),
	J(218.5, '重さ', 'v', 2, 200, 'auto', 3),
	J(221.5, '答え', 'h', 1, 140, 'red', 2.5),
	// pre-chorus 2
	J(224, '呼ばない名', 'h', 0, 120, 'auto', 3.5),
	J(228, '風', 'v', 0, 250, 'auto', 3.5),
	J(229.5, '預けない', 'v', 2, 170, 'red', 2.5),
	J(240, '光', 'v', 0, 250, 'red', 3.5),
	J(243.5, 'まだ消さない', 'h', 1, 120, 'auto', 4),
	...chorus(248, 1),
	// chorus 2 again
	J(298, '傷', 'v', 0, 250, 'red', 3.5),
	J(299.5, '地図', 'v', 2, 220, 'red', 3),
	J(302, '瓦が鳴る', 'h', 0, 130, 'auto', 4),
	// verse 3
	J(352, '駅', 'v', 0, 250, 'auto', 3.5),
	J(356.5, '提灯', 'v', 2, 190, 'red', 3.5),
	J(360, '現代', 'v', 0, 200, 'auto', 3.5),
	J(364.5, '影', 'v', 2, 250, 'auto', 3.5),
	J(368, '娘', 'v', 0, 270, 'red', 7.5),
	J(370.5, '歩幅', 'v', 2, 200, 'auto', 4),
	J(376, '届かない', 'h', 0, 130, 'auto', 4),
	J(381, '一歩', 'v', 0, 250, 'red', 3),
	// bridge
	J(384, '愛', 'v', 2, 270, 'red', 7.5),
	J(392, '喪失', 'v', 0, 210, 'auto', 3.5),
	J(395.5, '一歩の重さ', 'h', 1, 120, 'auto', 4),
	J(400, '悲劇', 'v', 2, 210, 'auto', 3.5),
	J(404, '歩け', 'v', 0, 230, 'red', 3.5),
	...chorus(420, 0, true),
	// outro
	J(474, '歩き出せ', 'u', 2, 170, 'red', 5),
	J(480, '歩き出せ', 'd', 0, 170, 'auto', 5),
];
const BRIDGE: {b: number; text: string; x: number; d: number; red?: string}[] = [];

// English: the beats each phrase lands on
const DLG = [104, 112, 152, 248, 256, 288, 296, 420, 428, 460];
const WRA = [128, 132, 168, 172, 272, 276, 308, 316, 444, 448, 487, 495, 503, 519];

const StripEl: React.FC<{s: Strip; beat: number; mode: Mode}> = ({s, beat, mode}) => {
	const d = s.d ?? 3;
	const a = beat - s.b;
	if (a < -0.02 || a > d + 0.4) return null;
	const size = s.size ?? 150;
	const thick = size * 1.42;
	const on = easeOut(prog(a, 0, 0.3));
	const off = ease(prog(a, d, d + 0.35));
	const scheme = s.sc === 'red' ? 'red' : mode === 'k' ? 'paper' : 'ink';
	const bg = scheme === 'red' ? RED : scheme === 'paper' ? SNOW : INK;
	const fg = scheme === 'ink' ? SNOW : scheme === 'paper' ? INK : SNOW;
	const edge = scheme === 'red' ? (mode === 'k' ? SNOW : INK) : RED;
	const vertical = s.o === 'v';
	const ang = vertical || s.o === 'h' ? 0 : [-14, -14, 14, 14][s.p]; // slanted bands always lean away from the middle, where he is
	const cx = vertical ? VX[s.p] : s.o === 'h' ? W / 2 : [430, 1500, 1500, 430][s.p];
	const cy = vertical ? H / 2 : s.o === 'h' ? HY[s.p] : [250, 880, 250, 880][s.p];
	const tx = vertical ? cx : s.o === 'h' ? (s.p ? 420 : 1480) : cx;
	// the band wipes on from one end and leaves through the other
	const clip = vertical ? `inset(${off * 100}% 0 ${(1 - on) * 100}% 0)` : `inset(0 ${(1 - on) * 100}% 0 ${off * 100}%)`;
	const punch = 1 + 0.25 * Math.exp(-a * 5);
	return (
		<div style={{position: 'absolute', left: cx, top: cy, width: 0, height: 0, transform: `rotate(${ang}deg)`}}>
			<div style={{position: 'absolute', left: vertical ? -thick / 2 : -1500, top: vertical ? -900 : -thick / 2, width: vertical ? thick : 3000, height: vertical ? 1800 : thick, backgroundColor: bg, clipPath: clip, boxShadow: `${vertical ? 14 : 0}px ${vertical ? 0 : 14}px 0 ${edge}`}} />
			<div style={{position: 'absolute', left: vertical ? thick / 2 + 22 : -1500, top: vertical ? -900 : thick / 2 + 22, width: vertical ? 8 : 3000, height: vertical ? 1800 : 8, backgroundColor: edge, clipPath: clip}} />
			<div
				lang="ja"
				style={{
					position: 'absolute',
					left: tx - cx,
					top: 0,
					transform: `translate(-50%, -50%) scale(${punch})`,
					writingMode: vertical ? 'vertical-rl' : 'horizontal-tb',
					fontFamily: JP,
					fontWeight: 800,
					fontSize: size,
					lineHeight: 1,
					letterSpacing: '0.06em',
					whiteSpace: 'nowrap',
					color: fg,
					opacity: clamp01(a / 0.12) * (1 - off),
				}}
			>
				{s.text}
			</div>
		</div>
	);
};

const big: React.CSSProperties = {position: 'absolute', fontFamily: EN, lineHeight: 0.86, whiteSpace: 'nowrap', textTransform: 'uppercase', paintOrder: 'stroke fill'};

export const Words: React.FC<{beat: number; mode: Mode}> = ({beat, mode}) => {
	const t = beatTime(beat);
	// English takes the scene's own two colours: solid in one, edged in the other, so it reads on black and on white
	const fg = mode === 'k' ? SNOW : INK;
	const bg = mode === 'k' ? INK : SNOW;
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
			{STRIPS.map((s, i) => (
				<StripEl key={i} s={s} beat={beat} mode={mode} />
			))}
			{BRIDGE.map((l, i) => {
				const a = beat - l.b;
				if (a < 0 || a > l.d + 0.6) return null;
				return (
					<div key={i} lang="ja" style={{position: 'absolute', left: l.x, top: 150, writingMode: 'vertical-rl', fontFamily: JP, fontWeight: 800, fontSize: 92, letterSpacing: '0.1em', color: '#1C1A18', opacity: 1 - ease(prog(a, l.d, l.d + 0.6))}}>
						{l.text.split('').map((ch, j) => (
							<span key={j} style={{opacity: ease(prog(a, j * 0.35, j * 0.35 + 0.8)), color: '愛喪失悲劇'.includes(ch) ? RED : undefined, filter: `blur(${(1 - ease(prog(a, j * 0.35, j * 0.35 + 0.8))) * 10}px)`}}>
								{ch}
							</span>
						))}
					</div>
				);
			})}
			{/* DON'T LET GO: three slabs across the frame, one per half beat, outline then solid */}
			{DLG.map((b, i) => {
				const a = beat - b;
				if (a < 0 || a > 2.6) return null;
				const out = easeOut(prog(a, 2.1, 2.6));
				return (
					<div key={i} style={{...big, left: 0, top: i % 2 ? 24 : 786, width: W, textAlign: 'center', fontSize: 280, letterSpacing: '0.02em', transform: `translateX(${-out * 2400}px) skewX(${-10 - out * 20}deg)`}}>
						{["DON'T", 'LET', 'GO'].map((w, j) => {
							const k = prog(a, j * 0.5, j * 0.5 + 0.18);
							return (
								<span key={j} style={{display: 'inline-block', margin: '0 44px', opacity: k > 0 ? 1 : 0, transform: `scale(${1 + 0.6 * (1 - backOut(k))})`, color: j === 2 ? RED : bg, WebkitTextStroke: `${j === 2 ? 16 : 14}px ${fg}`}}>
									{w}
								</span>
							);
						})}
					</div>
				);
			})}
			{/* WE RISE AGAIN: a stack climbing from the bottom edge, with echoes rising off it */}
			{WRA.map((b, i) => {
				const a = beat - b;
				const d = b === 519 ? 6 : 3.4;
				if (a < 0 || a > d + 0.5) return null;
				const out = ease(prog(a, d, d + 0.5));
				const left = true;
				return (
					<div key={i} style={{...big, color: fg, WebkitTextStroke: `14px ${bg}`, [left ? 'left' : 'right']: 70, bottom: 40, textAlign: left ? 'left' : 'right', fontSize: 250, transform: `translateY(${-out * 1300}px)`}}>
						{['WE', 'RISE', 'AGAIN'].map((w, j) => {
							const k = easeOut(prog(a, j * 0.5, j * 0.5 + 0.35));
							return (
								<div key={j} style={{position: 'relative', transform: `translateY(${(1 - k) * 700}px)`, opacity: k > 0 ? 1 : 0}}>
									{[3, 2, 1].map((e) => (
										<div key={e} style={{position: 'absolute', [left ? 'left' : 'right']: 0, top: 0, transform: `translateY(${-e * 34 * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + e)))}px)`, color: 'transparent', WebkitTextStroke: `3px ${fg}`, opacity: 0.6 / e}}>
											{w}
										</div>
									))}
									<div>{w}</div>
								</div>
							);
						})}
					</div>
				);
			})}
			{/* bridge English: small, wide-spaced, and the last line is literally the ground he stands on */}
			{(() => {
				const a = beat - 408;
				if (a < 0 || a > 12) return null;
				const out = 1 - ease(prog(a, 11.2, 12));
				const sp: React.CSSProperties = {position: 'absolute', left: 0, width: W, textAlign: 'center', fontFamily: EN, textTransform: 'uppercase', color: fg, whiteSpace: 'nowrap', paintOrder: 'stroke fill', WebkitTextStroke: `14px ${bg}`};
				return (
					<>
						{[0, 2].map((o, j) => (
							<div key={j} style={{...sp, top: 40 + j * 150, fontSize: 150, letterSpacing: `${0.5 - 0.2 * ease(prog(a, o, o + 2))}em`, opacity: ease(prog(a, o, o + 0.5)) * (1 - ease(prog(a, 3.6, 4.2)))}}>
								Turn the <span style={{color: RED}}>pain</span>
							</div>
						))}
						<div style={{...sp, top: 930, fontSize: 84, letterSpacing: '0.12em', opacity: out}}>
							{'into a beat you can stand on'.split(' ').map((w, j) => (
								<span key={j} style={{opacity: ease(prog(a, 4 + j * 0.55, 4.4 + j * 0.55)), marginRight: '0.5em', color: w === 'beat' ? RED : undefined}}>
									{w}
								</span>
							))}
						</div>
						<div style={{position: 'absolute', left: 960 - 800 * ease(prog(a, 4, 8)), top: 916, width: 1600 * ease(prog(a, 4, 8)), height: 10, backgroundColor: RED, opacity: out}} />
					</>
				);
			})()}
		</div>
	);
};

export const WORDS_FPS = FPS;
