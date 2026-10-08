import React from 'react';
import type {Shot} from './act';
import {H, INK, Mode, RED, SNOW, W, beatTime, clamp01, ease, easeOut, flip, kick, lerp, mod, pal, prog, rnd} from './core';
import {Defs} from './rig';

// Two angles that are not the side view:
//  TopShot    - straight down. He is a straw-hat disc on the cloud road; everyone else is a head and shoulders.
//  TunnelShot - from behind him, running into a tunnel of torii gates that fly past the camera.

const RUN = 400;

// a person seen from directly above
const Head: React.FC<{x: number; y: number; r: number; fill: string; rim: string; ph: number; hat?: boolean; lantern?: boolean; bow?: boolean; blade?: string; ang?: number}> = ({x, y, r, fill, rim, ph, hat, lantern, bow, blade, ang = 180}) => {
	const sw = Math.sin(ph * Math.PI);
	return (
		<g transform={`translate(${x} ${y}) rotate(${ang})`}>
			{/* feet and hands swing either side of the body as it runs toward +x */}
			<g fill={fill} stroke={rim} strokeWidth={5}>
				<ellipse cx={sw * r * 0.9} cy={-r * 0.42} rx={r * 0.42} ry={r * 0.2} />
				<ellipse cx={-sw * r * 0.9} cy={r * 0.42} rx={r * 0.42} ry={r * 0.2} />
				<circle cx={-sw * r * 0.6} cy={-r * 0.95} r={r * 0.2} />
				<circle cx={sw * r * 0.6} cy={r * 0.95} r={r * 0.2} />
				<ellipse cx={0} cy={0} rx={r * 0.5} ry={r * 0.95} />
			</g>
			{blade ? <line x1={-r * 0.2} y1={r * 0.8} x2={-r * 2.3} y2={r * 1.25} stroke={blade} strokeWidth={6} strokeLinecap="round" /> : null}
			{lantern ? (
				<>
					<circle cx={sw * r * 0.6} cy={-r * 1.25} r={r * 1.5} fill="url(#kzGlow)" />
					<circle cx={sw * r * 0.6} cy={-r * 1.25} r={r * 0.3} fill={RED} stroke={fill} strokeWidth={4} />
				</>
			) : null}
			{hat ? (
				<>
					<path d={`M${-r * 0.5} 0 q${-r * 0.9} ${-14 + Math.sin(ph * 2) * 10} ${-r * 2.4} ${Math.sin(ph * 3) * 14}`} fill="none" stroke={RED} strokeWidth={r * 0.2} strokeLinecap="round" />
					<circle r={r * 1.02} fill={fill} stroke={rim} strokeWidth={7} />
					<circle r={r * 0.62} fill="none" stroke={rim} strokeWidth={2.5} opacity={0.6} />
					<circle r={r * 0.2} fill="none" stroke={rim} strokeWidth={2.5} opacity={0.6} />
				</>
			) : (
				<circle r={r * 0.56} fill={fill} stroke={rim} strokeWidth={5} />
			)}
			{bow ? (
				<g fill={RED}>
					<polygon points={`0,0 ${-r * 0.5},${-r * 0.36} ${-r * 0.5},${r * 0.36}`} />
					<polygon points={`0,0 ${r * 0.5},${-r * 0.36} ${r * 0.5},${r * 0.36}`} />
				</g>
			) : null}
		</g>
	);
};

export const TopShot: React.FC<{shot: Shot; beat: number; clip?: string}> = ({shot: s, beat, clip}) => {
	const lb = beat - s.b;
	const t = beatTime(beat);
	const o = s.top ?? {};
	const nF = o.foes ?? 0;
	const kills = [...Array(nF)].map((_, i) => 1 + (i * (s.n - 1.6)) / Math.max(1, nF));
	const impact = kills.some((k) => lb >= k && lb < k + 0.17);
	const m: Mode = impact ? flip(s.m) : s.m;
	const c = pal(m);
	const rim = m === 'k' ? SNOW : c.bg;
	const z = lerp(1.55, 1.8, ease(prog(lb, 0, s.n))) * (1 + 0.02 * kick(t));
	const scroll = lb * RUN; // the road slides right as he runs left
	const hx = 1040;
	const hy = 540;
	const shake = kills.reduce((a, k) => (lb >= k ? a + Math.exp(-(lb - k) * 5) : a), 0);
	const dirS = s.dir ?? -1;
	return (
		<div style={{position: 'absolute', inset: 0, clipPath: clip, overflow: 'hidden'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<rect width={W} height={H} fill={c.bg} />
				<g transform={`translate(${960 + Math.sin(beat * 47) * 14 * shake} ${540 + Math.cos(beat * 61) * 10 * shake}) rotate(${-7 + lb * 0.8}) scale(${z * (dirS === 1 ? -1 : 1)} ${z}) translate(-960 -540)`}>
					{/* far below: drifting cloud shadows */}
					{[...Array(9)].map((_, i) => (
						<ellipse key={i} cx={mod(rnd(i, 91) * 2600 + scroll * 0.25, 2800) - 400} cy={rnd(i, 92) * 1080} rx={160 + rnd(i, 93) * 180} ry={50 + rnd(i, 94) * 50} fill={c.faint} />
					))}
					{/* the cloud road from above: two scalloped edges */}
					<g fill={c.cloud} stroke={m === 'k' ? 'none' : c.line} strokeWidth={9}>
						{[...Array(26)].map((_, i) => {
							const x = mod(i * 130 + scroll, 26 * 130) - 600;
							return (
								<g key={i}>
									<circle cx={x} cy={hy - 215 + rnd(i, 95) * 26} r={86} />
									<circle cx={x + 60} cy={hy + 215 - rnd(i, 96) * 26} r={86} />
								</g>
							);
						})}
					</g>
					<rect x={-700} y={hy - 220} width={3400} height={440} fill={c.cloud} />
					{[...Array(14)].map((_, i) => {
						const x = mod(i * 250 + scroll, 14 * 250) - 600;
						return <path key={i} d={`M${x} ${hy - 150 + rnd(i, 97) * 300} a34 34 0 1 1 30 26`} fill="none" stroke={c.shade} strokeWidth={6} strokeLinecap="round" />;
					})}
					{s.route ? <line x1={hx} y1={hy} x2={2700} y2={hy} stroke={RED} strokeWidth={15} strokeLinecap="round" /> : null}
					{/* his footprints, melting behind him; hers, small and red, leading on */}
					{[...Array(16)].map((_, i) => {
						const sb = (Math.floor(lb * 2) - i) / 2;
						const age = lb - sb;
						if (sb < -8 || o.steps === 'small') return null;
						return <ellipse key={`f${sb}`} cx={hx + age * RUN} cy={hy + (Math.round(sb * 2) % 2 ? 20 : -20)} rx={26} ry={11} fill={c.ink} opacity={o.steps === 'fade' ? clamp01(1 - age / 5) * 0.9 : 0.35} />;
					})}
					{o.steps === 'small'
						? [...Array(26)].map((_, i) => {
								const x = mod(i * 110 + scroll, 26 * 110) - 700;
								return x < hx - 70 ? <ellipse key={i} cx={x} cy={hy + (i % 2 ? 12 : -12)} rx={15} ry={7} fill={RED} /> : null;
							})
						: null}
					{/* those who walk with him */}
					{[...Array(o.allies ?? 0)].map((_, i) => {
						const row = Math.floor(i / 2) + 1;
						const a = clamp01(lb * 1.5 - i * 0.25);
						return <Head key={`a${i}`} x={hx + 118 * row + rnd(i, 98) * 40 + (1 - ease(a)) * 900} y={hy + (i % 2 ? 1 : -1) * (60 + row * 16) + Math.sin(lb * 2 + i) * 8} r={30} fill={c.ink} rim={rim} ph={lb * 2 + rnd(i, 99) * 2} lantern />;
					})}
					{o.girl ? <Head x={hx - 10} y={hy + 118} r={36} fill={c.ink} rim={rim} ph={lb * 3} bow /> : null}
					{/* those in the way: they close in, and each one goes on its beat */}
					{kills.map((k, i) => {
						const side = i % 2 ? 1 : -1;
						const yy = o.melee ? (rnd(i, 100) - 0.5) * 520 : side * (70 + rnd(i, 101) * 110);
						const a = lb - k;
						const x0 = hx - 200 - Math.max(0, k - lb) * (o.melee ? RUN : 520);
						if (a > 1.2) return null;
						if (a >= 0) {
							const d = easeOut(a / 1.2);
							return (
								<g key={`k${i}`}>
									<Head x={hx - 200 - d * 260} y={hy + yy + side * d * 220} r={30 * (1 - a * 0.5)} fill={SNOW} rim={INK} ph={0} blade={m === 'k' ? SNOW : INK} ang={a * 500} />
									<path d={`M${hx - 60} ${hy - 150} A190 190 0 0 0 ${hx - 60} ${hy + 150}`} fill="none" stroke={c.fg} strokeWidth={34 * (1 - a / 1.2)} strokeLinecap="round" opacity={1 - a / 0.8} transform={`rotate(${side * 20} ${hx} ${hy})`} />
									{[...Array(8)].map((__, j) => (
										<circle key={j} cx={hx - 200 + Math.cos(j * 0.9 + i) * 300 * d} cy={hy + yy + Math.sin(j * 0.9 + i) * 300 * d} r={13 * (1 - d)} fill={c.fg} />
									))}
								</g>
							);
						}
						return <Head key={`k${i}`} x={x0} y={hy + yy * (1 + Math.max(0, k - lb) * 0.35)} r={30} fill={SNOW} rim={INK} ph={lb * 2 + i} blade={m === 'k' ? SNOW : INK} ang={0} />;
					})}
					<Head x={hx} y={hy} r={64} fill={c.ink} rim={rim} ph={lb * 2} hat lantern={!!s.lan} blade={m === 'k' ? SNOW : c.ink} />
				</g>
				{/* wind */}
				<g stroke={c.fg} strokeLinecap="round" opacity={0.2}>
					{[...Array(10)].map((_, i) => {
						const x = mod(rnd(i, 102) * 2600 + lb * 2600, 2800) - 400;
						return <line key={i} x1={x} y1={rnd(i + Math.floor(lb / 2), 103) * 1080} x2={x + 300} y2={rnd(i + Math.floor(lb / 2), 103) * 1080 - 36} strokeWidth={4} />;
					})}
				</g>
			</svg>
		</div>
	);
};

export const TunnelShot: React.FC<{shot: Shot; beat: number; clip?: string}> = ({shot: s, beat, clip}) => {
	const lb = beat - s.b;
	const t = beatTime(beat);
	const kills = s.tun?.foes ?? [];
	const impact = kills.some((k) => lb >= k && lb < k + 0.17);
	const m: Mode = impact ? flip(s.m) : s.m;
	const c = pal(m);
	const rim = m === 'k' ? SNOW : c.bg;
	const vx = 960 + Math.sin(lb * 0.8) * 30;
	const vy = 430;
	const step = Math.sin(lb * 2 * Math.PI);
	const bob = Math.abs(step) * 16;
	// gates: depth runs from far (small) to past the camera (huge)
	const gates = [...Array(9)].map((_, i) => {
		const d = mod(i - lb * 1.5, 9); // 0 = just passed the camera, 9 = far
		return Math.pow(0.62, d - 1.2) * 1.6;
	});
	gates.sort((a, b) => a - b);
	const back = (x: number, y: number, sc: number, hero: boolean, ph: number, key?: string) => {
		const st = Math.sin(ph * Math.PI);
		return (
			<g key={key} transform={`translate(${x} ${y}) scale(${sc})`}>
				{hero ? <path d={`M0 -250 q${40 + Math.sin(t * 11) * 14} -40 ${70 + Math.sin(t * 9) * 20} -150 M0 -250 q${-20 + Math.sin(t * 12) * 14} -50 ${20 + Math.sin(t * 8) * 18} -120`} fill="none" stroke={RED} strokeWidth={18} strokeLinecap="round" /> : null}
				<g stroke={rim} strokeWidth={42} strokeLinecap="round" fill="none">
					<path d={`M0 -240 L0 -110 M0 -110 L-34 ${-10 - st * 46} M0 -110 L34 ${-10 + st * 46} M0 -230 L-70 ${-150 + st * 40} M0 -230 L70 ${-150 - st * 40}`} />
				</g>
				<g stroke={c.ink} strokeWidth={30} strokeLinecap="round" fill="none">
					<path d={`M0 -240 L0 -110 M0 -110 L-34 ${-10 - st * 46} M0 -110 L34 ${-10 + st * 46} M0 -230 L-70 ${-150 + st * 40} M0 -230 L70 ${-150 - st * 40}`} />
				</g>
				{hero ? <line x1={-60} y1={-80} x2={70} y2={-260} stroke={m === 'k' ? SNOW : c.ink} strokeWidth={9} strokeLinecap="round" /> : null}
				<circle cx={0} cy={-275} r={34} fill={c.ink} stroke={rim} strokeWidth={8} />
				{hero ? <polygon points="-104,-268 104,-268 0,-348" fill={c.ink} stroke={rim} strokeWidth={10} strokeLinejoin="round" /> : null}
				<circle cx={-76} cy={-110 + st * 40} r={110} fill="url(#kzGlow)" />
				<rect x={-96} y={-146 + st * 40} width={40} height={60} rx={16} fill={RED} stroke={c.ink} strokeWidth={6} />
			</g>
		);
	};
	return (
		<div style={{position: 'absolute', inset: 0, clipPath: clip, overflow: 'hidden'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<rect width={W} height={H} fill={c.bg} />
				<circle cx={vx} cy={vy - 20} r={150 * (1 + 0.04 * kick(t))} fill={RED} />
				{/* the road running to the vanishing point */}
				<polygon points={`${vx - 26},${vy + 20} ${vx + 26},${vy + 20} ${W + 500},${H + 60} -500,${H + 60}`} fill={c.cloud} stroke={m === 'k' ? 'none' : c.line} strokeWidth={8} />
				{[...Array(7)].map((_, i) => {
					const k = Math.pow(0.6, mod(i - lb * 1.5, 7));
					const y = vy + 20 + 640 * k;
					return <line key={i} x1={vx - 1400 * k} x2={vx + 1400 * k} y1={y} y2={y} stroke={c.shade} strokeWidth={3 + 16 * k} />;
				})}
				{s.route ? <polygon points={`${vx - 3},${vy + 20} ${vx + 3},${vy + 20} ${vx + 90},${H + 60} ${vx - 90},${H + 60}`} fill={RED} /> : null}
				{gates.map((k, i) => (
					<g key={i} fill={RED} opacity={clamp01(k * 9)}>
						<rect x={vx - 330 * k - 22 * k} y={vy - 300 * k} width={44 * k} height={600 * k} />
						<rect x={vx + 330 * k - 22 * k} y={vy - 300 * k} width={44 * k} height={600 * k} />
						<path d={`M${vx - 440 * k} ${vy - 330 * k} q${440 * k} ${40 * k} ${880 * k} 0 l${-10 * k} ${64 * k} q${-430 * k} ${32 * k} ${-860 * k} 0 z`} />
						<rect x={vx - 370 * k} y={vy - 210 * k} width={740 * k} height={34 * k} />
					</g>
				))}
				{/* the ones waiting in the tunnel rush up to him and are gone on the beat */}
				{kills.map((k, i) => {
					const a = lb - k;
					if (a > 0.9) return null;
					const sc = a < 0 ? Math.pow(0.5, Math.min(6, (k - lb) * 2.2)) : 1 + a * 2;
					const x = vx + (i % 2 ? 1 : -1) * 150 * sc + (a > 0 ? (i % 2 ? 1 : -1) * a * 900 : 0);
					return (
						<g key={i} transform={`translate(${x} ${vy + 30 + 420 * sc}) scale(${sc}) rotate(${a > 0 ? (i % 2 ? 1 : -1) * a * 160 : 0} 0 -150)`} opacity={a > 0 ? 1 - a / 0.9 : 1}>
							<path d="M0 -240 L0 -110 M0 -110 L-36 -4 M0 -110 L36 -4 M0 -225 L-80 -250 M0 -225 L70 -140" stroke={INK} strokeWidth={42} strokeLinecap="round" fill="none" />
							<path d="M0 -240 L0 -110 M0 -110 L-36 -4 M0 -110 L36 -4 M0 -225 L-80 -250 M0 -225 L70 -140" stroke={SNOW} strokeWidth={28} strokeLinecap="round" fill="none" />
							<circle cx={0} cy={-275} r={34} fill={SNOW} stroke={INK} strokeWidth={8} />
							<line x1={-80} y1={-250} x2={-150} y2={-420} stroke={m === 'k' ? SNOW : INK} strokeWidth={9} strokeLinecap="round" />
						</g>
					);
				})}
				{kills.map((k, i) => {
					const a = (lb - k) / 0.7;
					return a > 0 && a < 1 ? <path key={i} d={`M${vx - 520} ${vy + 380} Q${vx} ${vy - 140 - a * 200} ${vx + 520} ${vy + 380} Q${vx} ${vy + 60 - a * 200} ${vx - 520} ${vy + 380} Z`} fill={c.fg} opacity={1 - a} /> : null;
				})}
				{[...Array(s.tun?.allies ?? 0)].map((_, i) => back(vx + (i % 2 ? 1 : -1) * (400 + Math.floor(i / 2) * 260), 960 + Math.floor(i / 2) * 60 - Math.abs(Math.sin((lb * 2 + i * 0.3) * Math.PI)) * 12, 0.8 + Math.floor(i / 2) * 0.1, false, lb * 2 + i * 0.37, `a${i}`))}
				{back(vx, 1075 - bob, 1.45, true, lb * 2)}
				{/* everything streams outward from the vanishing point */}
				<g stroke={c.fg} strokeLinecap="round" opacity={0.28}>
					{[...Array(22)].map((_, i) => {
						const a = rnd(i, 111) * Math.PI * 2;
						const r0 = 260 + mod(rnd(i, 112) * 900 + lb * 1500, 900);
						return <line key={i} x1={vx + Math.cos(a) * r0} y1={vy + Math.sin(a) * r0} x2={vx + Math.cos(a) * (r0 + 170)} y2={vy + Math.sin(a) * (r0 + 170)} strokeWidth={5} />;
					})}
				</g>
			</svg>
		</div>
	);
};
