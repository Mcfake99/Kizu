// Contact sheet for the second Kizu video: one bundle, many stills, tiled.
// usage: node scripts/kizu2-stills.mjs <cols> <beat> <beat> ...   (add "s" for seconds, e.g. 12.5s)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {mkdirSync, readFileSync, rmSync} from 'node:fs';
import path from 'node:path';

const [cols, ...marks] = process.argv.slice(2);
const T = JSON.parse(readFileSync('src/kizu2/env.json', 'utf8')).beats;
const beatTime = (b) => {
	const x = b + 1;
	const i = Math.max(0, Math.min(T.length - 2, Math.floor(x)));
	return T[i] + (x - i) * (T[i + 1] - T[i]);
};
const dir = 'out/kizu2/stills';
rmSync(dir, {recursive: true, force: true});
mkdirSync(dir, {recursive: true});
mkdirSync('out/kizu2', {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/kizu2/index.tsx')});
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'Kizu2'});
let i = 0;
for (const m of marks) {
	const t = m.endsWith('s') ? parseFloat(m) : beatTime(parseFloat(m));
	const frame = Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(t * 30)));
	await renderStill({composition, serveUrl, output: path.join(dir, `c${String(i++).padStart(3, '0')}.png`), frame, scale: 0.4, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 180000});
}
const c = +cols;
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '1', '-i', path.join(dir, 'c%03d.png'), '-vf', `tile=${c}x${Math.ceil(i / c)}:padding=4:color=red`, '-frames:v', '1', 'out/kizu2/sheet.png'], {stdio: 'inherit'});
console.log(r.status === 0 ? `sheet: out/kizu2/sheet.png (${i} frames)` : 'ffmpeg failed');
