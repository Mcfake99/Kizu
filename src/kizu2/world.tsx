import React from 'react';
import {loadFont as loadJP} from '@remotion/google-fonts/ShipporiMinchoB1';
import {loadFont as loadEN} from '@remotion/google-fonts/Anton';
import {H, Pal, RED, W, mod, rnd} from './core';

export const JP = loadJP('normal', {weights: ['800'], ignoreTooManyRequestsWarning: true}).fontFamily;
export const EN = loadEN('normal', {weights: ['400'], subsets: ['latin'], ignoreTooManyRequestsWarning: true}).fontFamily;

export type Theme = 'sky' | 'station' | 'city' | 'roofs' | 'torii' | 'bamboo' | 'rain' | 'kanji' | 'mount' | 'pcity' | 'void' | 'village' | 'grass' | 'fort';
export type Ground = 'cloud' | 'slab' | 'tiles' | 'none';

// ---------- the cloud path (world space, top surface at y = 0) ----------
const SP = 430;
export const Cloud: React.FC<{i: number; c: Pal; outline: boolean}> = ({i, c, outline}) => {
	const x = i * SP + (rnd(i, 1) - 0.5) * 60;
	const w = 420 + rnd(i, 2) * 130;
	const n = 5;
	const bumps = [...Array(n)].map((_, j) => {
		const r = 48 + rnd(i * 7 + j, 3) * 26;
		return {cx: x - w / 2 + 50 + (j * (w - 100)) / (n - 1), cy: r + 3 + rnd(i * 7 + j, 4) * 13, r};
	});
	const shapes = (
		<>
			{bumps.map((b, j) => (
				<circle key={j} cx={b.cx} cy={b.cy} r={b.r} />
			))}
			<rect x={x - w / 2} y={50} width={w} height={74} rx={37} />
		</>
	);
	return (
		<g>
			{outline ? (
				<g fill={c.line} stroke={c.line} strokeWidth={11}>
					{shapes}
				</g>
			) : null}
			<g fill={c.cloud}>{shapes}</g>
			<rect x={x - w / 2 + 16} y={98} width={w - 32} height={26} rx={13} fill={c.shade} />
			{bumps.slice(1, 4).map((b, j) => (
				<path key={j} d={`M${b.cx - b.r * 0.45} ${b.cy + 6} a${b.r * 0.42} ${b.r * 0.42} 0 1 1 ${b.r * 0.5} ${b.r * 0.36}`} fill="none" stroke={outline ? c.line : c.shade} strokeWidth={outline ? 4 : 6} strokeLinecap="round" opacity={0.8} />
			))}
		</g>
	);
};

export const GroundLayer: React.FC<{kind: Ground; x0: number; x1: number; c: Pal; outline: boolean; gaps?: [number, number][]}> = ({kind, x0, x1, c, outline, gaps = []}) => {
	if (kind === 'none') return null;
	if (kind === 'cloud') {
		const out: React.ReactNode[] = [];
		for (let i = Math.floor(x0 / SP) - 1; i <= Math.ceil(x1 / SP) + 1; i++) {
			if (gaps.some(([a, b]) => i * SP > a && i * SP < b)) continue;
			out.push(<Cloud key={i} i={i} c={c} outline={outline} />);
		}
		return <g>{out}</g>;
	}
	if (kind === 'slab') {
		const out: React.ReactNode[] = [];
		for (let i = Math.floor(x0 / 240) - 1; i <= Math.ceil(x1 / 240) + 1; i++) out.push(<path key={i} d={`M${i * 240} 30 l60 80 M${i * 240 + 120} 30 l-60 80`} stroke={c.fg} strokeWidth={8} fill="none" />);
		return (
			<g>
				{out}
				<rect x={x0 - 400} y={0} width={x1 - x0 + 800} height={30} fill={c.fg} />
				<rect x={x0 - 400} y={104} width={x1 - x0 + 800} height={10} fill={c.fg} />
			</g>
		);
	}
	// tiles: a roof ridge seen side on
	const out: React.ReactNode[] = [];
	for (let i = Math.floor(x0 / 78) - 1; i <= Math.ceil(x1 / 78) + 1; i++) out.push(<path key={i} d={`M${i * 78} 6 q39 -34 78 0 l0 30 l-78 0 z`} fill={c.fg} stroke={c.bg} strokeWidth={5} />);
	return (
		<g>
			<path d={`M${x0 - 400} 30 L${x1 + 400} 30 L${x1 + 400} 460 L${x0 - 400} 460 Z`} fill={c.fg} />
			{[...Array(8)].map((_, r) => (
				<line key={r} x1={x0 - 400} x2={x1 + 400} y1={70 + r * 50} y2={70 + r * 50} stroke={c.bg} strokeWidth={4} opacity={0.5} />
			))}
			{out}
		</g>
	);
};

// ---------- backdrops (screen space, scrolled by the camera with parallax) ----------
// calls draw(i, screenX) for every tile of a repeating layer that is on screen
const tile = (cam: number, f: number, period: number, draw: (i: number, x: number) => React.ReactNode, margin = 500) => {
	const out: React.ReactNode[] = [];
	const s = cam * f;
	for (let i = Math.floor((s - margin) / period); i <= Math.ceil((s + W + margin) / period); i++) out.push(<React.Fragment key={i}>{draw(i, i * period - s)}</React.Fragment>);
	return out;
};

const Pagoda: React.FC<{x: number; y: number; s: number; fill: string}> = ({x, y, s, fill}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
		{[0, 1, 2, 3, 4].map((j) => {
			const w = 150 - j * 22;
			const yy = -j * 62;
			return (
				<g key={j}>
					<path d={`M${-w} ${yy} q${w * 0.5} -6 ${w * 0.6} -30 l${w * 0.8} 0 q${w * 0.1} 24 ${w * 0.6} 30 z`} />
					<rect x={-w * 0.42} y={yy - 62} width={w * 0.84} height={36} />
				</g>
			);
		})}
		<rect x={-4} y={-380} width={8} height={90} />
	</g>
);
const Pine: React.FC<{x: number; y: number; s: number; fill: string}> = ({x, y, s, fill}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
		<path d="M-6 0 q-14 -90 16 -170 l12 4 q-26 80 -8 166 z" />
		<ellipse cx={-40} cy={-150} rx={70} ry={20} />
		<ellipse cx={46} cy={-190} rx={64} ry={18} />
		<ellipse cx={0} cy={-232} rx={52} ry={16} />
	</g>
);
const Branch: React.FC<{c: Pal; t: number}> = ({c, t}) => (
	<g transform={`translate(1500 150) rotate(${Math.sin(t * 1.3) * 1.5})`}>
		<path d="M440 -40 Q260 20 120 10 Q20 0 -120 60 M120 10 Q60 -40 -20 -50 M250 12 Q230 70 150 96 M0 28 Q-40 70 -90 120" fill="none" stroke={c.fg} strokeWidth={9} strokeLinecap="round" />
		{[...Array(16)].map((_, i) => (
			<circle key={i} cx={-110 + rnd(i, 5) * 480} cy={-50 + rnd(i, 6) * 150} r={7 + rnd(i, 7) * 6} fill={i % 3 ? c.fg : RED} />
		))}
	</g>
);

export const Backdrop: React.FC<{th: Theme; cam: number; c: Pal; t: number; sun?: [number, number, number] | null; grow?: number}> = ({th, cam, c, t, sun, grow = 1}) => {
	const sunEl = sun ? <circle cx={sun[0]} cy={sun[1]} r={sun[2]} fill={RED} /> : null;
	const farClouds = tile(cam, 0.1, 620, (i, x) => (
		<g transform={`translate(${x} ${180 + rnd(i, 8) * 420}) scale(${0.5 + rnd(i, 9) * 0.5})`} fill={c.faint}>
			<circle cx={0} cy={0} r={40} />
			<circle cx={50} cy={-16} r={52} />
			<circle cx={110} cy={0} r={38} />
			<rect x={-40} y={0} width={190} height={40} rx={20} />
		</g>
	));
	if (th === 'void') return <g>{sunEl}</g>;
	if (th === 'sky')
		return (
			<g>
				{sunEl}
				{farClouds}
				{tile(cam, 0.2, 2300, (i, x) => (
					<g>
						<Pagoda x={x + 300} y={1090} s={0.9} fill={c.far} />
						<Pine x={x + 760} y={1090} s={1.3} fill={c.far} />
						<Pine x={x + 1500} y={1100} s={0.9} fill={c.far} />
					</g>
				))}
				<g transform={`translate(${-mod(cam * 0.03, 300)} 0)`}>
					<Branch c={c} t={t} />
				</g>
			</g>
		);
	if (th === 'station')
		return (
			<g>
				{sunEl}
				{tile(cam, 0.14, 420, (i, x) => (
					<g>
						<rect x={x} y={1080 - 260 - rnd(i, 10) * 360} width={300} height={700} fill={c.faint} />
						{[...Array(10)].map((_, j) => (rnd(i * 13 + j, 11) > 0.45 ? <rect key={j} x={x + 30 + (j % 4) * 66} y={1080 - 230 - rnd(i, 10) * 360 + Math.floor(j / 4) * 80} width={36} height={46} fill={c.far} /> : null))}
					</g>
				))}
				<path d={`M-100 250 Q960 ${290 + Math.sin(t * 2) * 4} 2020 250 M-100 300 Q960 ${346 + Math.sin(t * 2 + 1) * 4} 2020 300`} fill="none" stroke={c.fg} strokeWidth={4} opacity={0.8} />
				{tile(cam, 0.7, 820, (i, x) => (
					<g>
						<rect x={x} y={200} width={18} height={900} fill={c.fg} />
						<rect x={x - 90} y={236} width={200} height={12} fill={c.fg} />
						<path d={`M${x + 9} 330 l-80 -84`} stroke={c.fg} strokeWidth={8} />
						{i % 2 ? <circle cx={x + 9} cy={420} r={18} fill={RED} /> : null}
					</g>
				))}
			</g>
		);
	if (th === 'city')
		return (
			<g>
				{sunEl}
				{tile(cam, 0.16, 280, (i, x) => {
					const h = 240 + rnd(i, 12) * 520;
					return (
						<g>
							<rect x={x} y={1080 - h} width={230} height={h} fill={c.faint} />
							{[...Array(12)].map((_, j) => (rnd(i * 17 + j, 13) > 0.5 ? <rect key={j} x={x + 26 + (j % 3) * 66} y={1100 - h + Math.floor(j / 3) * 86} width={40} height={50} fill={c.far} /> : null))}
						</g>
					);
				})}
				{tile(cam, 0.5, 560, (i, x) => (
					<g transform={`translate(${x + rnd(i, 14) * 200} ${240 + rnd(i, 15) * 330 + Math.sin(t * 2 + i) * 10}) rotate(${(rnd(i, 16) - 0.5) * 18})`}>
						<rect x={-80} y={-140} width={160} height={280} rx={22} fill={c.bg} stroke={c.fg} strokeWidth={7} />
						{[0, 1, 2].map((j) => (
							<rect key={j} x={-52} y={-90 + j * 54} width={60 + rnd(i * 3 + j, 17) * 44} height={22} rx={11} fill={c.far} />
						))}
						<circle cx={74} cy={-134} r={20} fill={RED} />
					</g>
				))}
			</g>
		);
	if (th === 'roofs')
		return (
			<g>
				{sunEl}
				{farClouds}
				{tile(cam, 0.28, 640, (i, x) => {
					const y = 760 + rnd(i, 18) * 200;
					return (
						<g fill={c.far}>
							<path d={`M${x - 60} ${y} q150 -20 220 -120 l260 0 q70 100 220 120 z`} />
							<rect x={x + 60} y={y} width={520} height={400} />
						</g>
					);
				})}
			</g>
		);
	if (th === 'torii')
		return (
			<g>
				{sunEl}
				{tile(cam, 0.55, 520, (i, x) => (
					<g fill={RED}>
						<rect x={x} y={250} width={34} height={900} />
						<rect x={x + 330} y={250} width={34} height={900} />
						<path d={`M${x - 70} 190 q252 46 504 0 l-8 52 q-244 36 -488 0 z`} />
						<rect x={x - 30} y={300} width={424} height={28} />
					</g>
				))}
			</g>
		);
	if (th === 'bamboo')
		return (
			<g>
				{sunEl}
				{tile(cam, 0.4, 150, (i, x) => {
					const w = 12 + rnd(i, 19) * 16;
					return (
						<g>
							<rect x={x + rnd(i, 20) * 80} y={-20} width={w} height={1120} fill={c.far} />
							{[...Array(5)].map((_, j) => (
								<rect key={j} x={x + rnd(i, 20) * 80 - 3} y={80 + j * 220 + rnd(i, 21) * 90} width={w + 6} height={6} fill={c.bg} />
							))}
						</g>
					);
				})}
			</g>
		);
	if (th === 'rain')
		return (
			<g>
				{farClouds}
				{[...Array(70)].map((_, i) => {
					const x = mod(rnd(i, 22) * 2400 - t * 500 - cam * 0.3, 2400) - 200;
					const y = mod(rnd(i, 23) * 1300 + t * (1700 + rnd(i, 24) * 600), 1300) - 110;
					return <line key={i} x1={x} y1={y} x2={x - 26} y2={y + 96} stroke={c.fg} strokeWidth={3} opacity={0.35 + rnd(i, 25) * 0.4} />;
				})}
			</g>
		);
	if (th === 'kanji')
		return (
			<g>
				{sunEl}
				{tile(cam, 0.5, 1150, (i, x) => (
					<text x={x} y={930} fontFamily={JP} fontWeight={800} fontSize={1000} fill={c.far}>
						{'傷地図道灯'[mod(i, 5)]}
					</text>
				))}
			</g>
		);
	if (th === 'village')
		return (
			<g>
				{sunEl}
				{farClouds}
				{tile(cam, 0.3, 600, (i, x) => {
					const w = 300 + rnd(i, 80) * 120;
					const y = 1080 - 150 - rnd(i, 81) * 110;
					return (
						<g>
							<path d={`M${x - 50} ${y} q${w * 0.3} -30 ${w * 0.42} -150 l${w * 0.26} 0 q${w * 0.1} 120 ${w * 0.42} 150 z`} fill={c.far} />
							<rect x={x} y={y} width={w} height={400} fill={c.far} />
							<rect x={x + 50} y={y + 40} width={56} height={70} fill={RED} opacity={0.9} />
							{i % 2 ? <rect x={x + w - 110} y={y + 40} width={56} height={70} fill={RED} opacity={0.6} /> : null}
							<circle cx={x + w + 40} cy={y - 10 + Math.sin(t * 2 + i) * 6} r={16} fill={RED} />
							<line x1={x + w + 40} y1={y - 80} x2={x + w + 40} y2={y - 26} stroke={c.far} strokeWidth={4} />
						</g>
					);
				})}
			</g>
		);
	if (th === 'grass')
		return (
			<g>
				{sunEl}
				{farClouds}
				{tile(cam, 0.45, 130, (i, x) => (
					<path d={`M${x} 1090 q${-10 + rnd(i, 82) * 30} -${90 + rnd(i, 83) * 150} ${-30 + rnd(i, 84) * 70 + Math.sin(t * 2 + i) * 14} -${170 + rnd(i, 85) * 190} q${10} ${90} ${34} ${360} z`} fill={c.far} />
				))}
			</g>
		);
	if (th === 'fort')
		return (
			<g>
				{sunEl}
				{farClouds}
				{tile(cam, 0.1, 2600, (i, x) => (
					<g>
						<path d={`M${x + 420} 1090 l90 -330 l760 0 l90 330 z`} fill={c.far} />
						<Pagoda x={x + 890} y={770} s={1.9} fill={c.far} />
						<circle cx={x + 1210} cy={470} r={90 + Math.sin(t * 5) * 10} fill="url(#kzGlow)" />
						<line x1={x + 1210} y1={300} x2={x + 1210} y2={440} stroke={c.far} strokeWidth={6} />
						<rect x={x + 1186} y={440} width={48} height={66} rx={14} fill={RED} stroke={c.far} strokeWidth={6} />
						{[0, 1, 2].map((j) => (
							<g key={j}>
								<rect x={x + 520 + j * 330} y={560} width={8} height={220} fill={c.far} />
								<rect x={x + 528 + j * 330} y={566} width={46} height={130} fill={RED} />
							</g>
						))}
					</g>
				))}
			</g>
		);
	// ink wash on paper: 'mount' and 'pcity'
	const m = (i: number, x: number, y: number, s: number) => `M${x - 420 * s} ${y} L${x - 200 * s} ${y - 260 * s * (0.7 + rnd(i, 26) * 0.5)} L${x - 60 * s} ${y - 140 * s} L${x + 90 * s} ${y - 380 * s * (0.7 + rnd(i, 27) * 0.5)} L${x + 260 * s} ${y - 170 * s} L${x + 460 * s} ${y} Z`;
	return (
		<g>
			{sun ? <circle cx={sun[0]} cy={sun[1]} r={sun[2] * grow} fill={RED} opacity={0.85} filter="url(#kzSoft)" /> : null}
			{sun ? <circle cx={sun[0]} cy={sun[1]} r={sun[2] * 0.8 * grow} fill={RED} opacity={0.9} /> : null}
			<g filter="url(#kzInk)">
				{tile(cam, 0.05, 1250, (i, x) => <path d={m(i, x + 300, 760, 1.5)} fill={c.ink} opacity={0.1 * grow} />, 900)}
				{tile(cam, 0.1, 1500, (i, x) => <path d={m(i + 40, x + 800, 900, 1.2)} fill={c.ink} opacity={0.2 * grow} />, 900)}
				{th === 'pcity' ? tile(cam, 0.14, 210, (i, x) => <rect x={x} y={1000 - 150 - rnd(i, 28) * 420} width={150} height={700} fill={c.ink} opacity={0.2} />, 300) : null}
				{tile(cam, 0.2, 1900, (i, x) => <ellipse cx={x + 500} cy={1010} rx={620} ry={70} fill={c.ink} opacity={0.26 * grow} />, 900)}
			</g>
			{tile(cam, 0.08, 900, (i, x) => (
				<ellipse cx={x + 200} cy={300 + rnd(i, 29) * 300} rx={260} ry={34} fill={c.ink} opacity={0.07 * grow} filter="url(#kzSoft)" />
			))}
			{th === 'mount' ? tile(cam, 0.16, 2500, (i, x) => <Pine x={x + 1300} y={1010} s={1.5} fill={c.far} />) : null}
		</g>
	);
};

// things that pass in front of the action
export const Foreground: React.FC<{th: Theme; cam: number; c: Pal}> = ({th, cam, c}) => {
	if (th === 'bamboo')
		return (
			<g>
				{tile(cam, 1.9, 1100, (i, x) => (
					<g>
						<rect x={x} y={-20} width={64} height={1120} fill={c.fg} />
						{[0, 1, 2, 3].map((j) => (
							<rect key={j} x={x - 6} y={120 + j * 260} width={76} height={9} fill={c.bg} />
						))}
					</g>
				))}
			</g>
		);
	if (th === 'grass')
		return (
			<g>
				{tile(cam, 1.7, 420, (i, x) => (
					<path d={`M${x} 1100 q-20 -160 ${-60 + rnd(i, 86) * 120} -${260 + rnd(i, 87) * 160} q20 130 70 420 z`} fill={c.fg} />
				))}
			</g>
		);
	if (th === 'torii') return <g>{tile(cam, 1.8, 1300, (i, x) => <rect x={x} y={-20} width={90} height={1120} fill={RED} />)}</g>;
	if (th === 'station') return <g>{tile(cam, 1.9, 1700, (i, x) => <rect x={x} y={-20} width={46} height={1120} fill={c.fg} />)}</g>;
	return null;
};

export const SCREEN = {W, H};
