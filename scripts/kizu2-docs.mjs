// Prints docs/kizu2-shot-list.md and out/kizu2/kizu2-daughter.en.srt from the second Kizu video's own data.
// usage: node scripts/kizu2-docs.mjs
import ts from 'typescript';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const T = JSON.parse(readFileSync('src/kizu2/env.json', 'utf8')).beats;
const beatTime = (b) => {
	const x = b + 1;
	const i = Math.max(0, Math.min(T.length - 2, Math.floor(x)));
	return T[i] + (x - i) * (T[i + 1] - T[i]);
};
mkdirSync('out/kizu2', {recursive: true});
const js = ts.transpileModule(readFileSync('src/kizu2/shots.ts', 'utf8'), {compilerOptions: {module: 'ESNext', target: 'ES2022'}}).outputText;
const tmp = path.resolve('out/kizu2/shots.tmp.mjs');
writeFileSync(tmp, js);
const {SHOTS} = await import(pathToFileURL(tmp).href);
const clock = (b) => {
	const t = beatTime(b);
	return `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
};
const MODE = {k: 'black', w: 'white', p: 'ink wash'};
const VIEW = {map: 'map from above', top: "bird's-eye", tunnel: 'from behind, through the gates'};
const cam = (s) => {
	if (s.kind && VIEW[s.kind]) return VIEW[s.kind];
	const z = Array.isArray(s.z) ? (s.z[0] < s.z[1] ? 'push in' : 'pull out') : (s.z ?? 1.1) >= 2 ? 'close' : (s.z ?? 1.1) < 0.9 ? 'wide' : 'medium';
	const tilt = s.tilt ? (Array.isArray(s.tilt) ? ', world tipping' : s.tilt > 0 ? ', running upward' : ', diving') : '';
	return `${z}${tilt}${s.dir === 1 ? ', left to right' : ''}`;
};
const TR = {slash: 'sword-stroke wipe that flips the page', ink: 'ink blot opens from the lantern', fade: 'fade through paper', cut: 'cut on the action'};
let md = '# 傷は地図になる (the father and the daughter): shot list\n\nPrinted from `src/kizu2/shots.ts` (edit there, then run `node scripts/kizu2-docs.mjs`).\n';
let sec = '';
SHOTS.forEach((s, i) => {
	if (s.sec !== sec) {
		sec = s.sec;
		md += `\n## ${sec} (${clock(s.b)})\n\n| Time | Beats | Page | Scene | What happens | Camera | Into this shot |\n|---|---|---|---|---|---|---|\n`;
	}
	const tr = s.tr ?? (i > 0 && SHOTS[i - 1].m !== s.m && s.n > 1 ? 'slash' : 'cut');
	md += `| ${clock(s.b)} | ${s.n} | ${MODE[s.m]} | ${s.kind && s.kind !== 'act' ? s.kind : s.th} | ${s.note} | ${cam(s)} | ${TR[tr]} |\n`;
});
writeFileSync('docs/kizu2-shot-list.md', md);

// English subtitles: [start beat, end beat, line]
const chorus = (c, last) => [
	[c, c + 7.5, "Don't let go, it isn't over yet"],
	[c + 8, c + 15.5, "Don't let go, scars become a map"],
	[c + 16, c + 23.5, `Roof tiles ring in the middle of ${last ? 'my chest' : 'the city'}`],
	[c + 24, c + 31.5, 'We rise again, we rise again'],
	[c + 32, c + 39.5, 'Raise the light and walk on'],
];
const L = [
	[48, 55.5, 'The lantern wick trembles in the wind'],
	[56, 63.5, 'The road is narrow and has no name'],
	[64, 71.5, 'The blade at my hip is still in its sheath'],
	[72, 79.5, 'A single footprint melts into the night'],
	[80, 87.5, 'I keep the name I will not call deep in my chest'],
	[88, 102, 'Holding the light low, I just keep walking'],
	...chorus(104),
	[144, 151.5, "Don't let go, we rise again"],
	[152, 159.5, "Don't let go, scars become a map"],
	[160, 167.5, 'Roof tiles ring in the middle of the city'],
	[168, 179.5, 'We rise again, we rise again'],
	[180, 191, 'Raise the light and walk on'],
	[192, 199.5, 'In the grass, a single red cord'],
	[200, 207.5, 'So small it is lost in my palm'],
	[208, 215.5, 'I must not ask whose it is'],
	[216, 223.5, 'Only the weight of the blade is an answer'],
	[224, 231.5, 'I will not give the unspoken name to the wind'],
	[232, 246, 'Holding the light low, I will not let it go out'],
	...chorus(248),
	[288, 295.5, "Don't let go, we rise again"],
	[296, 301.5, "Don't let go, scars become a map"],
	[302, 307.5, 'Roof tiles ring in the middle of the city'],
	[308, 326, 'We rise again, we rise again'],
	[352, 359.5, 'The station lights laugh at my lantern'],
	[360, 367.5, 'An old shadow stretches down a modern road'],
	[368, 375.5, "I measure my daughter's stride with my own feet"],
	[376, 383.5, 'And break the distance I cannot reach into single steps'],
	[384, 391.5, 'Love remains, it only changes shape'],
	[392, 399.5, 'Loss is the weight of the next step'],
	[400, 407.5, 'Wear the tragedy and walk the present day'],
	[408, 411.8, 'Turn the pain, turn the pain'],
	[412, 419.5, 'into a beat you can stand on'],
	...chorus(420, true),
	[460, 470, "Don't let go, we rise again"],
	[474, 486, 'Walk on, walk on'],
	[487, 511, 'We rise again'],
	[519, 524, 'We rise again'],
].sort((a, b) => a[0] - b[0]);
const stamp = (b) => {
	const t = beatTime(b);
	const ms = Math.round((t % 1) * 1000) % 1000;
	return `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};
writeFileSync('out/kizu2/kizu2-daughter.en.srt', L.map(([a, b, text], i) => `${i + 1}\n${stamp(a)} --> ${stamp(b)}\n${text}\n`).join('\n'));
console.log(`docs/kizu2-shot-list.md: ${SHOTS.length} shots; out/kizu2/kizu2-daughter.en.srt: ${L.length} captions`);
