# 傷は地図になる (Scars Become a Map)

A 3:48 music video in which every frame is code. No drawings, no video model, no editing timeline.
It was written by Claude (Opus 5.5, in Claude Code) and rendered with [Remotion](https://www.remotion.dev).

A father crosses the cloud road to bring his daughter home, armed with a lantern and a sword. In every
village he passes, more people pick up a light and follow him. Black on white, white on black, and red as
the only colour.

## The song is not included

The track is private, so there is no audio file in this repository. The picture is timed to that recording
beat by beat (the beat table is in `src/kizu2/env.json`), so it will not line up with a different song.

To look at the picture without sound, open the studio and set the `audio` prop to `false`, or render with
`--props='{"audio":false}'`. If you have the track, put it at `public/kizu2.mp3`.

## Run it

Needs Node 20+ and ffmpeg.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run render
```

The video is 6,848 frames at 1920x1080 and rendered in about four minutes on the machine it was made on.

## How it was made

1. A song (made with Suno), its vocal stem and the lyrics went into a folder, with a short brief:
   hyper-fast scenes, black and white pages, a stick man running through clouds, Japanese key words.
2. Claude measured the song with code first: the tempo, every beat, and where each lyric line starts.
3. It pitched story treatments and styles; the picks were a mix of ink silhouette, ink wash and manga strips.
4. It wrote the whole video as a list of shots, each one line, timed in beats rather than seconds.
5. Remotion rendered it.

The steps are the ones in [`skills/remotion7step/SKILL.md`](skills/remotion7step/SKILL.md), the Claude Code skill
this was made with. The standard every shot was checked against is
[`docs/animation-principles.md`](docs/animation-principles.md): something happens in every shot, timing is set
by what a first-time viewer has to read, nothing is ever still, and every seam gets a transition.

## Where things are

| File | What it holds |
|---|---|
| `src/kizu2/shots.ts` | The whole video: 97 shots, one line each (length in beats, black/white/paper page, scene, who gets cut on which beat) |
| `src/kizu2/words.tsx` | The key words on screen, by beat. Japanese rides on strips; English is big condensed capitals |
| `src/kizu2/act.tsx` | The engine that plays one side-on shot: running, strokes, enemies, the daughter, camera, impact frames |
| `src/kizu2/views.tsx` | The other angles: straight down on his straw hat, and from behind through a tunnel of torii gates |
| `src/kizu2/map.tsx` | The journey map, which returns four times with the road grown and more lanterns following |
| `src/kizu2/rig.tsx` | The stick figures and their poses |
| `src/kizu2/world.tsx` | Clouds, ground and backdrops (village, grass, fortress, station, city, roofs, torii, bamboo, rain, ink wash) |
| `src/kizu2/core.ts` | The beat clock, palette and easing. The song drifts from 147.6 to 149.9 BPM, so beats come from a measured table |
| `docs/kizu2-shot-list.md` | The shot list, printed from the code |
| `docs/animation-principles.md` | The storytelling and animation principles |
| `skills/remotion7step/` | The seven-step skill file |
| `lyrics.txt`, `subtitles/english.srt` | The lyrics and English subtitles |

To change a moment, find its line in `shots.ts`, edit it and render again. Contact sheets of any beats:

```bash
npm run stills -- 6 104 108 112 116 120 124
```

That writes `out/kizu2/sheet.png`.

## Notes

- Word timing comes from Whisper plus the song's phrase grid, so some key words sit a little off the vocal.
- `skills/remotion7step` refers to a second, larger skill (`remotion-music-video`) for its scripts and
  references. That one is not included here.

## Credits

Song and lyrics: musicsatire, generated with Suno. Code and animation: Claude Opus 5.5. Rendering: Remotion.
