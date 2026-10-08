import React from 'react';
import {ROUTE, Shot, routePath} from './act';
import {H, PAPER, RED, W, backOut, beatTime, clamp01, ease, lerp, prog, rnd} from './core';
import {Defs, Stick, runPose, walkPose} from './rig';
import {JP} from './world';

// The journey seen from above as an ink map. It comes back several times: each visit the red road has grown,
// more lanterns follow him, and the ones who took her are always a little further on. The last visit draws the way home.
const INKC = '#1C1A18';
const PLACES: [number, string][] = [
	[0, '家'],
	[3, '村'],
	[6, '町'],
	[9, '駅'],
	[12, '城'],
];
const NUM = '一二三四五六';

const at = (k: number): [number, number] => {
	const n = (ROUTE.length - 1) * clamp01(k);
	const i = Math.min(ROUTE.length - 2, Math.floor(n));
	return [lerp(ROUTE[i][0], ROUTE[i + 1][0], n - i), lerp(ROUTE[i][1], ROUTE[i + 1][1], n - i)];
};

const House: React.FC<{x: number; y: number; big?: boolean}> = ({x, y, big}) =>
	big ? (
		<g transform={`translate(${x} ${y})`} fill={INKC}>
			<path d="M-60 0 l14 -40 l92 0 l14 40 z" />
			<path d="M-52 -40 q30 -6 40 -26 l24 0 q10 20 40 26 z" />
			<path d="M-34 -66 q20 -4 26 -22 l16 0 q6 18 26 22 z" />
			<rect x={-3} y={-110} width={6} height={24} />
		</g>
	) : (
		<g transform={`translate(${x} ${y})`} fill={INKC}>
			{[-34, 6].map((dx, j) => (
				<g key={j} transform={`translate(${dx} ${j * 8})`}>
					<path d="M-6 -16 q16 -4 22 -22 l10 0 q6 18 22 22 z" />
					<rect x={2} y={-16} width={32} height={18} />
					<rect x={12} y={-10} width={10} height={12} fill={RED} />
				</g>
			))}
		</g>
	);

export const MapShot: React.FC<{shot: Shot; beat: number; clip?: string}> = ({shot: s, beat, clip}) => {
	const lb = beat - s.b;
	const t = beatTime(beat);
	const o = s.map ?? {from: 0, to: 1};
	const k = lerp(o.from, o.to, ease(prog(lb, 0.8, s.n - (o.back ? 24 : 1.2))));
	const segs = (ROUTE.length - 1) * k;
	const head = at(k);
	const zr = o.z ?? [2.3, 1.7];
	const z = lerp(zr[0], zr[1], ease(prog(lb, 0, s.n * (o.back ? 0.35 : 1))));
	const pull = clamp01((z - 1) / 1.1);
	const cx = lerp(W / 2, head[0], pull);
	const cy = lerp(H / 2, head[1], pull);
	const ahead = at(Math.min(1, k + 0.15));
	const near = at(Math.min(1, k + 0.01));
	const left = near[0] <= head[0];
	// the way home: drawn back along the road once he has her
	const home = o.back ? ease(prog(lb, 3, s.n - 12)) : 0;
	const hk = 1 - home;
	const hp = at(hk);
	const N = o.followers ?? 0;
	return (
		<div style={{position: 'absolute', inset: 0, clipPath: clip}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<rect width={W} height={H} fill={PAPER} />
				<g transform={`translate(${W / 2} ${H / 2}) rotate(${(1 - ease(prog(lb, 0, s.n))) * -3}) scale(${z}) translate(${-cx} ${-cy})`}>
					<g filter="url(#kzInk)">
						{[...Array(9)].map((_, j) => (
							<ellipse key={j} cx={200 + rnd(j, 71) * 1500} cy={160 + rnd(j, 72) * 760} rx={150 + rnd(j, 73) * 200} ry={50 + rnd(j, 74) * 60} fill={INKC} opacity={0.08 + rnd(j, 75) * 0.08} />
						))}
						<path d="M60 1000 L260 900 L420 960 L640 880 L900 990 L1200 900 L1500 980 L1860 910 L1860 1080 L60 1080 Z" fill={INKC} opacity={0.16} />
						<path d="M900 120 L1010 30 L1100 100 L1210 10 L1330 130 Z" fill={INKC} opacity={0.14} />
					</g>
					{ROUTE.map((p, j) => (
						<path key={j} d={`M${p[0] - 70} ${p[1] + 34} q20 -34 50 -14 q24 -30 52 -4 q30 -8 36 18 z`} fill={PAPER} stroke={INKC} strokeWidth={3.5} opacity={0.5} />
					))}
					<path d={routePath(1)} fill="none" stroke={INKC} strokeWidth={3} strokeDasharray="4 14" opacity={0.35} />
					<path d={routePath(k)} fill="none" stroke={RED} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
					{PLACES.map(([j, name]) => {
						const p = ROUTE[j];
						const reached = segs >= j - 0.05;
						return (
							<g key={j} opacity={reached ? 1 : 0.55}>
								<House x={p[0]} y={p[1] - 22} big={j === 12} />
								<text x={p[0] + (j === 12 ? -96 : 62)} y={p[1] - 30} textAnchor="middle" fontFamily={JP} fontWeight={800} fontSize={54} fill={reached && j > 0 ? RED : INKC}>
									{name}
								</text>
							</g>
						);
					})}
					{ROUTE.map((p, j) => {
						const scar = [1, 4, 8].indexOf(j);
						const a = backOut(prog(segs, j - 0.1, j + 0.25), 2.4);
						if (scar < 0 || a <= 0) return null;
						return (
							<g key={j} transform={`translate(${p[0]} ${p[1]})`}>
								<line x1={-24 * a} y1={-20 * a} x2={24 * a} y2={20 * a} stroke={RED} strokeWidth={9} strokeLinecap="round" />
								<text x={30} y={48} fontFamily={JP} fontWeight={800} fontSize={36} fill={RED} opacity={clamp01(a)}>
									{NUM[scar]}
								</text>
							</g>
						);
					})}
					{/* the ones who took her, always a little further down the road, until the fortress */}
					{!o.back ? (
						<g transform={`translate(${ahead[0]} ${ahead[1] - 30 + Math.sin(t * 6) * 4})`}>
							<circle r={26} fill={PAPER} stroke={INKC} strokeWidth={5} />
							<polygon points="-14,-20 -22,-44 -4,-24" fill={PAPER} stroke={INKC} strokeWidth={4} />
							<polygon points="6,-24 20,-44 14,-18" fill={PAPER} stroke={INKC} strokeWidth={4} />
							<g transform="translate(34 -30)" fill={RED}>
								<polygon points="0,0 -18,-11 -18,10" />
								<polygon points="0,0 18,-11 18,10" />
							</g>
						</g>
					) : null}
					{/* lanterns that follow him */}
					{[...Array(N)].map((_, j) => {
						const kk = (o.back ? hk + 0.03 * (j + 2) : k - 0.028 * (j + 1)) + 0;
						if (kk < 0 || kk > 1) return null;
						const p = at(kk);
						return (
							<g key={j} transform={`translate(${p[0] + (rnd(j, 76) - 0.5) * 22} ${p[1] + (rnd(j, 77) - 0.5) * 22})`}>
								<circle r={20} fill="url(#kzGlow)" />
								<circle r={7} fill={INKC} />
								<circle cx={8} cy={-6} r={4.5} fill={RED} />
							</g>
						);
					})}
					{o.back ? (
						<>
							<path d={`M${ROUTE[12][0]} ${ROUTE[12][1] - 18} ` + [...Array(41)].map((_, j) => at(1 - (home * j) / 40)).map((p) => `L${p[0].toFixed(1)} ${(p[1] - 18).toFixed(1)}`).join(' ')} fill="none" stroke={INKC} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
							{home < 1 ? (
								<>
									<Stick x={hp[0]} y={hp[1] - 14} s={0.42} face={at(Math.max(0, hk - 0.01))[0] <= hp[0] ? -1 : 1} pose={walkPose(lb * 2)} fill={INKC} rim={PAPER} sword="back" lantern={1} t={t} wind={0.6} />
									<Stick x={hp[0] + 26} y={hp[1] - 14} s={0.34} kind="girl" bow={1} face={at(Math.max(0, hk - 0.01))[0] <= hp[0] ? -1 : 1} pose={walkPose(lb * 3)} fill={INKC} rim={PAPER} sword="none" t={t} />
								</>
							) : null}
						</>
					) : (
						<Stick x={head[0]} y={head[1] + 6} s={0.42} face={left ? -1 : 1} pose={runPose(lb * 2)} fill={INKC} rim={PAPER} sword="back" lantern={1} t={t} wind={1} />
					)}
					{o.title ? (
						<>
							<g fontFamily={JP} fontWeight={800}>
								{'傷は地図になる'.split('').map((ch, j) => {
									const a = backOut(prog(lb, s.n - 11 + j * 0.5, s.n - 10.4 + j * 0.5), 1.3);
									return (
										<text key={j} x={1800} y={420 + j * 80} fontSize={74} textAnchor="middle" fill={'傷地図'.includes(ch) ? RED : INKC} opacity={clamp01(a)} transform={`translate(0 ${(1 - a) * -20})`}>
											{ch}
										</text>
									);
								})}
							</g>
							<g transform={`translate(1800 1000) scale(${backOut(prog(lb, s.n - 6, s.n - 5.3), 2.5)})`}>
								<rect x={-34} y={-34} width={68} height={68} rx={8} fill={RED} />
								<text x={0} y={18} textAnchor="middle" fontFamily={JP} fontWeight={800} fontSize={48} fill={PAPER}>
									娘
								</text>
							</g>
						</>
					) : null}
				</g>
			</svg>
		</div>
	);
};
