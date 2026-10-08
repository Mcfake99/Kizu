// 傷は地図になる, second version: a father crosses the cloud road to bring his daughter home.
// The whole video as a list of shots. Lengths are in beats (one bar = 4; the tempo creeps, see core.ts).
// S(length, black/white/paper, scene, what happens, options). Beats inside `ev` and `foes` count from the shot's start.
import type {FoeSpec, Shot} from './act';
import type {Mode} from './core';
import type {Theme} from './world';

const out: Shot[] = [];
let cur = 0;
let sec = '';
let cord = false; // from verse 2 on he carries her red cord on the lantern
const S = (n: number, m: Mode, th: Theme, note: string, o: Partial<Shot> = {}) => {
	out.push({b: cur, n, m, th, note, sec, lan: 2, cord, ...o});
	cur += n;
};
const at = (b: number, name: string) => {
	if (cur !== b) throw new Error(`kizu2 shots: "${name}" should start on beat ${b} but the shots before it end on ${cur}`);
	sec = name;
};
const line = (n: number, first = 500, step = 150, boss = 0): FoeSpec[] => [...Array(n)].map((_, i) => ({at: 99, enter: 'stand' as const, gap: first + i * step, ...(boss && i === n - 1 ? {k: 'oni' as const, big: boss} : {})}));
const three: FoeSpec[] = [
	{at: 1, enter: 'stand', gap: 200},
	{at: 1.12, enter: 'stand', gap: 380, k: 'ninja'},
	{at: 1.25, enter: 'stand', gap: 560},
];
const UP: [number, number, number] = [960, 150, 200];
const BIG: [number, number, number] = [420, 430, 260];
const INKSUN: [number, number, number] = [520, 390, 115];

at(0, 'Intro');
S(16, 'p', 'mount', 'Ink-wash paper. A father and his small daughter walk the cloud ridge, her red bow bobbing; the title brushes down the page.', {st: 'walk', z: [0.62, 0.9], sun: INKSUN, x: ['bloom', 'bloomin', 'title', 'calm', 'girl'], tr: 'fade'});
S(8, 'p', 'mount', 'Close on the two of them. He stops: something is coming along the road.', {st: 'walk', z: [1.25, 1.45], sun: INKSUN, ev: [[4, 'stop']], foes: [{at: 99, k: 'oni', enter: 'stand', gap: 900}], x: ['calm', 'girl']});
S(8, 'p', 'mount', 'The big one hits him before the sword is out, and carries her off down the road. First scar.', {st: 'stand', z: [1.1, 0.95], sun: INKSUN, foes: [{at: 2, k: 'oni', enter: 'run', cut: true, gap: 170}], x: ['calm', 'taken']});
S(8, 'k', 'sky', 'The page flips to black. He gets up off one knee and looks down the road she went.', {z: [1.5, 1.25], st: 'kneel', ev: [[3, 'walk'], [6, 'go']], tr: 'slash'});
S(4, 'k', 'sky', 'He runs. Red sun, cloud road.', {z: [0.8, 1.05]});
S(4, 'w', 'sky', 'Feet on the cloud tops.', {z: 2.3, focus: 'feet'});

at(48, 'Verse 1');
S(4, 'k', 'sky', 'The lantern wick shakes in the wind: close on the light in his hand.', {z: 2.1, focus: 'body', x: ['windy']});
S(4, 'w', 'bamboo', 'Wind through the bamboo.', {z: 1.2, x: ['windy', 'petals']});
S(8, 'k', 'bamboo', 'The road is narrow and has no name: wide, one small light moving through the stalks.', {z: [0.62, 0.7]});
S(4, 'w', 'village', 'The blade at his hip is still in its sheath: he runs past the first houses without drawing.', {z: 1.9, focus: 'body'});
S(4, 'k', 'village', 'White figures stand in the road ahead and only watch him come.', {z: [0.7, 0.62], foes: line(4, 700, 190)});
S(8, 'k', 'sky', 'From straight above: a straw hat on the cloud road, and one line of footprints melting into the night behind it.', {kind: 'top', top: {steps: 'fade'}});

at(80, 'Pre-chorus 1');
S(4, 'w', 'sky', 'The name he will not call, kept deep in his chest: close under the brim.', {z: 2.4, focus: 'head', ev: [[1, 'eye']]});
S(4, 'k', 'sky', 'The red eye.', {z: 2.9, focus: 'head', ev: [[-3, 'eye']], x: ['focus']});
S(8, 'k', 'village', 'Light held low, just walking: he slows to a walk at the edge of the first village. They are waiting in the street.', {z: [0.9, 0.7], ev: [[1, 'walk']], foes: line(5, 560, 150)});
S(8, 'w', 'village', 'He stops walking. He runs at them, and jumps.', {z: [0.62, 1.25], st: 'walk', ev: [[1.5, 'go'], [6.6, 'leap', 2, 380]], foes: line(5, 520, 150)});

at(104, 'Chorus 1');
S(2, 'w', 'village', "Don't let go: he lands among them and the sword finally comes out. One.", {z: 1.3, ev: [[-1.4, 'leap', 2, 380]], foes: [{at: 0.9, enter: 'stand'}], tr: 'slash'});
S(2, 'k', 'village', 'Two, three.', {z: 1.45, foes: [{at: 0.6, enter: 'stand'}, {at: 1.5, enter: 'stand', gap: 150, k: 'ninja'}], x: ['armed']});
S(4, 'w', 'sky', 'Not over yet: one dash straight through the last three, and the sword goes back.', {z: [0.95, 1.05], ev: [[1, 'dash', 560], [1.8, 'sheath', 3.3]], foes: three, x: ['armed', 'focus']});
S(2, 'k', 'sky', "Don't let go: a blade from above.", {z: 1.3, foes: [{at: 2, enter: 'drop', k: 'ninja', cut: true}]});
S(6, 'w', 'sky', 'Scars become a map: the second cut draws on him, and a red line starts to run along the clouds under his feet.', {z: [1.8, 1.45], focus: 'body', st: 'stand', ev: [[0, 'hit', 2.2], [2.2, 'go']], route: true, x: ['laying', 'glow']});
S(4, 'k', 'roofs', 'Roof tiles ring: up onto the rooftops, tiles jumping at every step.', {z: 1.0});
S(4, 'w', 'roofs', 'In the middle of the village its keeper is waiting on the ridge: twice his size. Caught, then cut.', {z: [0.8, 0.95], ev: [[1.6, 'parry']], foes: [{at: 1.6, k: 'oni', enter: 'stand', cut: true, miss: true, die: 3.2}], x: ['armed']});
S(4, 'k', 'sky', 'We rise again: the world tips and he runs straight up the sky.', {z: 1.0, tilt: [40, 90], foes: [{at: 2.5, enter: 'drop'}], sun: UP});
S(4, 'w', 'village', 'Behind him, the first villagers pick up lanterns and follow.', {z: [0.9, 0.75], crowd: 3, x: ['gather']});
S(4, 'k', 'sky', 'Raise the light: he stops and lifts the lantern high.', {z: [1.2, 1.35], ev: [[0.6, 'stop'], [1.4, 'raise', 99], [2, 'flare']], crowd: 3});
S(4, 'w', 'sky', 'Walk on: three lights behind him now.', {z: [1.3, 1.0], st: 'stand', ev: [[-2, 'raise', 1.2], [0.4, 'walk'], [2, 'go']], crowd: 3, tr: 'ink'});

at(144, 'Chorus 1 (again)');
S(8, 'p', 'mount', 'The map, from above: the red road leaves home and reaches the first village. Three lanterns trail him. The ones who took her are already further on.', {kind: 'map', map: {from: 0, to: 0.27, followers: 3, z: [2.5, 1.9]}, tr: 'fade'});
S(2, 'k', 'torii', "Don't let go: red gates strobe past.", {z: 1.1, crowd: 3});
S(2, 'w', 'torii', 'One between the gates.', {z: 1.3, foes: [{at: 1}]});
S(4, 'k', 'torii', 'From behind him: straight down a tunnel of gates, two waiting inside it.', {kind: 'tunnel', tun: {foes: [1.5, 3], allies: 2}});
S(4, 'w', 'bamboo', 'Bamboo: two.', {z: 1.2, foes: [{at: 1}, {at: 2.6, k: 'ninja'}], crowd: 3});
S(4, 'k', 'roofs', 'Left to right across the tiles, cutting as he goes.', {z: 1.0, dir: 1, foes: [{at: 1.2}, {at: 3}], crowd: 3});
S(4, 'w', 'sky', 'The drums thin out. He stops on a high cloud and raises the lantern.', {z: [1.0, 1.2], ev: [[0.3, 'stop'], [1.6, 'raise', 99], [2, 'flare']], x: ['calm']});
S(4, 'k', 'sky', 'Far off, other lights answer.', {z: [0.62, 0.55], st: 'stand', ev: [[-1, 'raise', 99]], x: ['answer', 'calm'], crowd: 3});
S(4, 'w', 'sky', 'From above: him and three lanterns on the road, and white figures closing in from both sides.', {kind: 'top', top: {foes: 3, allies: 3}, route: true});
S(6, 'k', 'void', 'Raise the light, walk on: the second keeper is faster than the first.', {z: [0.9, 1.2], ev: [[4.6, 'parry'], [4.2, 'stop']], foes: [{at: 6, k: 'oni', enter: 'run', cut: true, big: 1.15}], sun: BIG, x: ['armed']});
S(6, 'w', 'void', 'Third scar. He is down on one knee, and the three who follow him stop with him.', {z: [1.6, 1.3], st: 'stand', focus: 'body', ev: [[0, 'hit', 9]], x: ['calm'], crowd: 3});

at(192, 'Verse 2');
S(8, 'k', 'grass', 'He gets up. In the grass ahead something small and red is lying where it fell.', {z: [1.2, 1.0], st: 'kneel', ev: [[1.5, 'walk'], [5.5, 'stop']], x: ['cord', 'calm']});
S(8, 'w', 'grass', 'A red hair cord, too small for his hand. He kneels, and ties it to the lantern.', {z: [2.0, 2.3], focus: 'feet', st: 'stand', ev: [[0.5, 'kneel', 99]], x: ['cordtake', 'calm'], cord: true});
(() => {
	cord = true;
})();
S(4, 'k', 'grass', 'He must not ask whose it is: close under the brim.', {z: 2.5, focus: 'head', st: 'kneel', ev: [[1, 'eye']], x: ['calm']});
S(4, 'w', 'grass', 'He knows whose it is.', {z: 3.0, focus: 'head', st: 'stand', ev: [[-3, 'eye']], x: ['calm', 'focus']});
S(8, 'k', 'grass', 'Only the weight of the blade is an answer: he stands, hand on the hilt, and the three behind him draw too.', {z: [1.3, 1.1], st: 'kneel', ev: [[1, 'rise'], [3, 'sheath', 7]], crowd: 3, x: ['calm', 'windy']});

at(224, 'Pre-chorus 2');
S(4, 'w', 'grass', 'The name is not for the wind: he runs, the red cord streaming from the lantern.', {z: 1.3, st: 'stand', ev: [[0, 'go']], x: ['petals', 'windy']});
S(4, 'k', 'sky', 'Close on the lantern and the cord.', {z: 2.2, focus: 'body', x: ['windy']});
S(8, 'p', 'mount', 'The map: the road runs on to the town. Six lanterns now. She is still ahead.', {kind: 'map', map: {from: 0.27, to: 0.5, followers: 6, z: [2.2, 1.7]}, tr: 'fade'});
S(8, 'k', 'village', 'The town gate, and the whole street lined with them. He does not slow down.', {z: [0.55, 1.2], foes: line(7, 520, 150, 1.2), ev: [[6.4, 'leap', 2, 400]], crowd: 6, tr: 'slash'});

at(248, 'Chorus 2');
S(2, 'k', 'village', "Don't let go: down among them.", {z: 1.3, ev: [[-1.6, 'leap', 2, 400]], foes: [{at: 0.9, enter: 'stand'}]});
S(2, 'w', 'village', 'Two.', {z: 1.5, foes: [{at: 0.6, enter: 'stand'}, {at: 1.5, enter: 'stand', gap: 150, k: 'ninja'}], x: ['armed']});
S(4, 'k', 'sky', 'Not over: the dash, through three.', {z: [0.9, 1.0], ev: [[1, 'dash', 560], [1.8, 'sheath', 3.3]], foes: three, x: ['armed', 'focus']});
S(2, 'w', 'sky', "Don't let go: the cloud gives way and he dives straight down.", {z: 1.0, tilt: -90, foes: [{at: 1.2, enter: 'stand'}], sun: null});
S(2, 'k', 'sky', 'Falling, one more in the way.', {z: 1.2, tilt: -90, foes: [{at: 1}], sun: null});
S(4, 'w', 'sky', 'Scars become a map: from above, the red road under him and six lanterns strung out behind.', {kind: 'top', top: {foes: 2, allies: 6}, route: true});
S(4, 'k', 'roofs', 'Tiles ring.', {z: 1.05, foes: [{at: 1}, {at: 2.6, k: 'ninja'}], crowd: 4});
S(4, 'w', 'roofs', 'Through the middle of the town, left to right.', {z: [0.75, 0.65], dir: 1, foes: [{at: 2}], crowd: 6});
S(4, 'k', 'sky', 'We rise again: up.', {z: 1.0, tilt: 90, foes: [{at: 1, enter: 'drop'}, {at: 3, enter: 'drop', k: 'ninja'}], sun: UP, crowd: 4});
S(4, 'w', 'sky', 'And off the top.', {z: [1.0, 0.8], tilt: [90, 30], ev: [[1, 'leap', 2.5, 420]], crowd: 5});
S(4, 'k', 'void', 'Raise the light: face to face with the keeper of the town, he lifts the lantern into its eyes.', {z: 1.1, ev: [[-1.5, 'leap', 2, 300], [0.5, 'stop'], [1.2, 'raise', 3.7], [2, 'flare']], foes: [{at: 99, k: 'oni', enter: 'stand', gap: 300, big: 1.15}], sun: BIG});
S(4, 'w', 'void', 'Walk on: one stroke, and the scar it gave him is paid for.', {z: [1.2, 0.95], st: 'stand', ev: [[0.4, 'go']], foes: [{at: 1.3, k: 'oni', enter: 'stand', big: 1.15}], tr: 'ink', sun: BIG});

at(288, 'Chorus 2 (again)');
S(8, 'k', 'village', 'The town comes out of its doors with lanterns and falls in behind him.', {z: [0.8, 0.65], crowd: 9, x: ['gather', 'lanterns']});
S(6, 'w', 'torii', 'From behind: the tunnel of gates again, but he is not alone in it.', {kind: 'tunnel', tun: {foes: [1.5, 3, 4.5], allies: 4}, route: true});
S(6, 'k', 'roofs', 'Over the roofs with all of them.', {z: 0.9, foes: [{at: 1.5}, {at: 3.5, k: 'ninja'}], crowd: 8});
S(8, 'w', 'sky', 'We rise again: every one of them, straight up the sky.', {z: 0.9, tilt: [30, 90], crowd: 9, sun: UP, route: true});
S(11, 'k', 'sky', 'Wide: one red road, a long line of lanterns on it. The drums fall away and he slows at the edge.', {z: [0.55, 0.5], ev: [[5, 'walk'], [8.5, 'stop']], crowd: 12, route: true, x: ['lanterns', 'full', 'calm']});

at(327, 'Break');
S(25, 'p', 'mount', 'The map, held this time: village, town, and the road on past the station to the fortress, where the ones who took her have stopped. Nine lanterns behind him.', {kind: 'map', map: {from: 0.5, to: 0.76, followers: 9, z: [2.4, 1.15]}, tr: 'fade'});

at(352, 'Verse 3');
S(4, 'k', 'station', 'Station lights laugh at a paper lantern: he runs the platform as a lit train tears past.', {z: [0.75, 0.85], x: ['train'], crowd: 5, tr: 'slash'});
S(4, 'w', 'station', 'One drops from the wires.', {z: 1.3, foes: [{at: 2.5, enter: 'drop', k: 'ninja'}]});
S(4, 'k', 'city', 'An old shadow on a modern road: phone screens hang in the dark, and two step out of the glow.', {z: 1.0, foes: [{at: 1.5, enter: 'stand'}, {at: 3, enter: 'stand', k: 'ninja'}], crowd: 4});
S(4, 'w', 'city', 'Wide: the whole lantern line under the towers.', {z: [0.6, 0.55], crowd: 10, x: ['lanterns', 'full']});
S(8, 'k', 'sky', 'He measures his daughter\'s stride with his own feet: small red footprints on the cloud, and his coming down beside them.', {z: [2.0, 2.3], focus: 'feet', x: ['smallsteps']});
S(8, 'w', 'sky', 'From above: the small red prints lead on down the road, and he divides the distance one step at a time. Everyone follows.', {kind: 'top', top: {allies: 8, steps: 'small'}});

at(384, 'Bridge');
S(8, 'p', 'mount', 'Love remains, in another shape: the paper again, and the two of them walking as they were at the start.', {st: 'walk', z: [0.9, 1.15], sun: INKSUN, x: ['bloom', 'calm', 'girl'], tr: 'fade', cord: false});
S(4, 'k', 'sky', 'Loss is the weight of the next step: his feet.', {z: 2.5, focus: 'feet', tr: 'slash'});
S(4, 'w', 'sky', 'Many feet, the same weight.', {z: 2.0, focus: 'feet', crowd: 8});
S(8, 'k', 'fort', 'Wear the tragedy and walk: the fortress. Its keeper is three times his size, an army in front of it, and high behind it a cage with a small light inside.', {z: [0.5, 0.6], ev: [[2, 'walk'], [5, 'stop']], foes: line(8, 620, 150, 1.5), crowd: 10, sun: BIG, x: ['calm']});
S(4, 'w', 'fort', 'Turn the pain: the red eye, the hand on the hilt.', {z: 2.4, focus: 'head', st: 'stand', ev: [[0.5, 'eye']], x: ['focus']});
S(8, 'k', 'fort', 'Into a beat you can stand on: he runs, and every lantern behind him runs too.', {z: [0.6, 1.2], st: 'stand', ev: [[0.3, 'go'], [6.5, 'leap', 2, 460]], foes: line(8, 620, 150, 1.5), crowd: 12, sun: BIG});

at(420, 'Final chorus');
S(2, 'w', 'fort', "Don't let go: he comes down on them.", {z: 1.3, ev: [[-1.5, 'leap', 2, 460]], foes: [{at: 0.9, enter: 'stand'}], route: true});
S(2, 'k', 'fort', 'Two.', {z: 1.5, foes: [{at: 0.6, enter: 'stand'}, {at: 1.5, enter: 'stand', gap: 150}], x: ['armed'], route: true});
S(4, 'w', 'fort', 'Not over: four in one line.', {z: [0.85, 1.0], ev: [[1, 'dash', 720], [1.9, 'sheath', 3.3]], foes: [...three, {at: 1.38, enter: 'stand', gap: 740, k: 'ninja'}], x: ['armed', 'focus'], route: true});
S(2, 'k', 'torii', "Don't let go.", {z: 1.2, foes: [{at: 1}], route: true, crowd: 4});
S(2, 'w', 'torii', 'The blade that used to scar him is caught this time. Sparks.', {z: 1.4, ev: [[1, 'parry']], foes: [{at: 1, cut: true, miss: true, die: 1.8, k: 'ninja'}], x: ['armed']});
S(4, 'k', 'fort', 'Scars become a map: from above, the whole fight. His people against theirs, and him cutting the red road straight through the middle.', {kind: 'top', top: {foes: 9, allies: 8, melee: true}, route: true});
S(4, 'w', 'roofs', 'Tiles ring: three, across the fortress roofs.', {z: 1.05, foes: [{at: 1}, {at: 2, k: 'ninja'}, {at: 3}], x: ['armed'], crowd: 5});
S(4, 'k', 'fort', 'In the middle of his chest: the keeper of the fortress brings its blade down, and he holds it.', {z: [1.0, 1.15], ev: [[0.4, 'stop'], [2, 'parry']], foes: [{at: 2, k: 'oni', enter: 'stand', cut: true, miss: true, big: 1.5, gap: 190}], x: ['armed'], sun: BIG});
S(4, 'w', 'sky', 'We rise again: up.', {z: 1.0, tilt: 90, foes: [{at: 1, enter: 'drop'}, {at: 3, enter: 'drop'}], route: true, sun: UP, crowd: 5});
S(4, 'k', 'sky', 'All of them.', {z: [0.9, 0.75], tilt: [90, 0], route: true, crowd: 10, x: ['lanterns', 'full']});
S(4, 'w', 'fort', 'Raise the light: he lifts the lantern, the red cord flying from it, into the keeper\'s face.', {z: 1.05, st: 'stand', ev: [[0.6, 'raise', 3.7], [1.6, 'flare']], foes: [{at: 99, k: 'oni', enter: 'stand', gap: 250, big: 1.5}], sun: BIG});
S(4, 'k', 'fort', 'Walk on: one stroke. The keeper comes apart into ink.', {z: [1.1, 0.85], st: 'stand', ev: [[0.3, 'go'], [2.6, 'stop']], foes: [{at: 1.3, k: 'oni', enter: 'stand', big: 1.5}], x: ['focus'], sun: BIG, tr: 'ink'});

at(460, 'After');
S(11, 'w', 'fort', "Don't let go: the cage. He runs to it and cuts it open. She is standing there.", {z: [0.8, 1.25], ev: [[6.5, 'stop'], [7.5, 'slash']], x: ['cage', 'calm'], sun: BIG});

at(471, 'Outro');
S(8, 'k', 'sky', 'She runs to him. He goes down on one knee and catches her.', {z: [1.3, 1.9], focus: 'body', st: 'stand', ev: [[2.6, 'kneel', 99], [4, 'flare']], x: ['reunion', 'calm']});
S(8, 'w', 'sky', 'He unties the red cord from the lantern and ties it back in her hair. She takes the lantern and holds it up.', {z: [1.7, 1.5], focus: 'body', st: 'stand', ev: [[-9, 'kneel', 5]], lan: 0, cord: false, x: ['tie', 'calm']});
S(8, 'k', 'sky', 'We rise again: the two of them walk back the way he came, left to right, and everyone walks with them.', {z: [1.2, 0.9], st: 'walk', dir: 1, lan: 0, cord: false, crowd: 8, x: ['girl', 'girllantern', 'calm', 'lanterns', 'full']});
S(8, 'w', 'village', 'Wide: the lantern line going home through the village.', {z: [0.6, 0.55], st: 'walk', dir: 1, lan: 0, cord: false, crowd: 12, x: ['girl', 'girllantern', 'calm']});
S(8, 'k', 'sky', 'From above: a straw hat and a small red bow side by side on the road, and all the lanterns behind.', {kind: 'top', dir: 1, lan: 0, top: {allies: 8, girl: true}, route: true});

at(511, 'Run-out');
S(37, 'p', 'mount', 'The map, complete: the red road from home to the fortress, a mark at every scar. Then a second line draws itself back along it, two small figures on its tip, all the way home.', {kind: 'map', map: {from: 1, to: 1, followers: 9, back: true, title: true, z: [1.7, 1.0]}, tr: 'fade'});

at(548, 'Ending');
S(14, 'k', 'sky', 'The opening frame again: two figures, red sun, cloud road. But the road is red now, and she is the one holding the light.', {z: [1.15, 0.9], st: 'stand', lan: 0, cord: false, route: true, tr: 'ink', x: ['calm', 'answer', 'girl', 'girllantern']});
at(562, 'end');

export const SHOTS = out;
