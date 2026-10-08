---
name: remotion7step
description: The user's own seven-step workflow for making a music video in Remotion from a Suno song (MP3 + vocal stem + lyrics text file) - study and report BPM, pitch six treatments, show six styles, confirm lyric and style-mix choices against their animation principles, visual bible, shot list, build, render. Use whenever the user says "Remotion7step", "7 step", "the seven step", or drops a new song and asks for a video the usual way.
---

# Remotion7step

The user's standing brief for a new music video, recalled with `/remotion7step`. Follow these steps in this order and **stop after each
step** so they can weigh in. They make the final creative calls; you bring the best ideas and do the
building.

Use the `remotion-music-video` skill for the how (its scripts, template, `references/building.md`,
`references/styles.md`, `references/principles.md`). Where that skill and this one differ (six options
instead of three, the extra questions, the render warning), this one wins.

## What the user provides

In the project folder, dropped in from Suno:

- the song (MP3),
- the vocal-only stem (MP3), for lip sync,
- the lyrics in a text file, with section labels.

Never ask the user for timestamps. If the files are not in the folder yet, say so and wait.

## What they want

- It has to look stunning, tell a real story from start to finish, and keep the character looking the
  same in every shot.
- No fixed genre, star or look: those come from the song and from the user's picks in steps 1 and 2.

## The steps

### 1. Study the song, then pitch six treatments

- Analyse the MP3 with code: tempo, beats, loud and quiet parts, where the vocals come in.
- **Report the BPM** back to the user (and whether it drifts).
- Run Whisper on the vocal stem and correct it against the user's lyrics, for lip sync and lyric timing.
- Use the lyrics for meaning.
- Pitch **six very different treatments**. Say which one you would make and why. The user picks.

### 2. Styles: show six

Show **six styles** the video could be made in. The six must include **Animation**, **Vox** (voxel) and
**WebGL**. Each one is shown as a picture **with the main character in the shot**, unless that style is a
lyric video or a visualiser. Recommend one. The user picks.

### 3. Rules and two questions

- Read and analyse the user's animation principles in the project's `docs` folder (the
  animation-principles file) and state how they will apply to this video.
- Ask the user to confirm: **all lyrics on screen, or just key words?**
- Ask: **would they like to mix styles** across the song (for example visualiser + lyric video +
  animation)?

### 4. Visual bible

Create one, or reuse an existing one if it fits: the character, locations, colour palette, lighting,
camera style and recurring symbols. This is what keeps everything consistent.

### 5. Shot list

The whole song mapped to timestamps: what we see, how the camera moves, and why it fits that moment.

### 6. Build

Before starting, ask: **build one section at a time with a review after each, do the entire lot in one
go, or do X scenes at a time?**

Whichever they choose, check your own frames in the preview and critique them before showing anything.

### 7. Render

Before starting the final render, **warn the user how long it will take**: 30 to 60 minutes, or a better
estimate based on how long previous renders in this project actually took. Then render and verify the
file.
