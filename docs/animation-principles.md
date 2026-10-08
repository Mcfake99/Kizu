# Storytelling and animation principles

These decide whether the video is a film or a moving wallpaper. Read them before the storyboard (step 5)
and check every section against them while building (step 6).

Generated animation fails in predictable ways: shots where nothing happens, everything moving at one
brisk speed, events stacked on top of each other, hard cuts everywhere, and both arms doing the same
thing. Each section below fixes one of those. The helpers named in `code` are in
`assets/template/src/motion.tsx`; anything not listed there is something to build into the rig.

## Contents

1. Something happens in every scene
2. Timing: model the viewer
3. Alive
4. Transitions always
5. One piece: a vision before any code
6. Animation principles
7. A worked example of timing
8. Checklist for every section

## 1. Something happens in every scene

- **Every shot needs an event:** something changes between its first frame and its last. The star wants
  something, finds something, tries, fails, reacts or gets it. "The star stands outside a shop rapping"
  is a backdrop, not a shot.
- **One focal action at a time.** Stage it with a clear silhouette and nothing competing for attention,
  so it reads at a glance.
- **Cause, then reaction.** When something happens, the character reacts to it: a take, an emotion
  change, a turn toward it. The reaction is often the funniest part, so give it time.
- **Pay it off.** Whatever a shot sets up (a door, a prop, a strange noise) gets resolved on screen, in
  that shot or a later one.

In a music video the performance shots still need this. A rapped line can be the event if something in
the frame answers it: the thing named in the lyric arrives, breaks, changes or gets taken.

## 2. Timing: model the viewer

Timing turns a set of drawings into a story, and it is where code-made animation fails most. You know
what happens because you wrote it. The viewer sees it once, at full speed, for the first time. For every
moment, ask what the viewer needs to understand and how long that takes them, and time it for that.

- **Write the reads.** For each shot, list in order what the viewer has to understand. Each item is a
  read. Every read needs time for the eye to find it, time to understand it, and a moment to register
  before the next thing starts. Small, distant, fast or subtle things take longer than big, central,
  obvious ones.
- **One read at a time.** Do not start a new read while the viewer is still taking in the last one. When
  two things happen at once, the viewer sees only one. Put a cause and its reaction in sequence, not on
  top of each other.
- **Fast actions, slow meanings.** A motion can be very quick if it is anticipated, but what it means
  needs held time. Anticipation tells the viewer where to look before the action; the hold after lets
  them understand it. Move quickly through what does not matter to the story and spend time on what does.
  That contrast between quick and held gives a film rhythm; one constant speed, fast or slow, is flat and
  hard to follow.
- **Lead the eye.** The viewer looks at whatever moves, is bright, is big or is being looked at. Before an
  important read, get their eye to the right place (a character looks at it, the camera moves to it, it
  moves or lights up first), and give the eye time to get there.
- **Let the reads set the length.** A shot is as long as its reads need. A shot with many reads cannot be
  short, and a shot whose reads have landed should not be padded. That includes the last shot: its final
  read needs time to land before the video ends, even if that means holding past the end of the song.

With music, the reads have to fit the bars. If a lyric line is 1.8 seconds, it holds about two reads, not
five. Cut gags rather than cramming them; spread a set-up and its pay-off across two lines.

## 3. Alive

- **Nothing is ever still.** Every character has an idle motion that suits their mood (`breathe`), cameras
  drift or push, scenery sways, lines boil. A frozen frame reads as a bug.
- **Faces act, they never snap.** A mood change goes through anticipation, a squint, a take and an
  overshoot (`take`). Do not swap eyes or mouth between two frames with nothing in between. Build mood as a
  rig prop that eases between states.
- **Move like a cartoon, not a machine.** Every move follows section 6.
- **The star is big.** In a medium shot the star fills roughly half the frame height or more; in a close-up
  the head fills it. Tiny figures are for wide establishing shots only, never the whole video.
- **Everything moves on a beat.** One clock drives every idle, bounce and dance, so the whole film shares
  one pulse. Put the hits on beats.

## 4. Transitions always

- **Every seam gets a transition:** into the first shot, between every pair of shots and out of the last
  one. Never start on a hard frame, and never just stop.
- **Pick one that belongs to the story,** and do not default to the same one every time:
  - a paper or brush wipe (`PaperWipe`)
  - an iris closing on the thing that matters (`Iris`)
  - a whip pan with a smear (`whip`)
  - a match cut: the same shape or motion across the cut
  - a cut on action: cut mid-move and finish the move in the next shot
  - a camera move that carries through into the next shot
  - a fade or push from paper or black (`Fade`)
- **A plain cut is fine only** when it is on action or a deliberate smash cut (a drop, a punchline).
- **Changes inside a shot are transitions too.** Emotions go through a take, turns are animated, and props
  arrive and leave on arcs (`arcPt`); they never pop in.

Transitions take time from the shots either side, so plan them in the storyboard. On fast songs keep them
to a few frames and land them on the bar line.

## 5. One piece: a vision before any code

- **Storyboard first, in writing,** before any scene code. Show it to the user and let them react before
  building.
- **One world.** A palette and a setting that carry through, with a colour arc across the video (for
  example cold night to warm dawn as the star's mood lifts).
- **One thread.** A beginning, a middle and an end, with the star's emotional arc following it. Plan the
  emotions across the whole video, not per shot.
- **Rhyme the ending with the opening:** the same place, pose or motif, changed. It makes the film feel
  whole.
- **Link scenes.** Motion continues across cuts, and screen direction stays consistent (if the star
  travels right, keep travelling right). Props and characters carry over.

## 6. Animation principles

The classic principles of character animation, as they apply to code. Most fix one problem: motion written
as code comes out mechanical, because code moves every part at once, on the same curve, by the same amount.

- **Anticipation.** Before a big move, a small move the opposite way: a crouch before a jump, a wind-up
  before a throw, a squint before a take. It tells the viewer something is coming and where to look
  (`anticipate`, `jump`, `take`).
- **Squash and stretch.** Bodies squash on impact and stretch when they move fast, keeping their volume
  (`sq`).
- **Slow in, slow out.** Almost nothing moves at constant speed. A plain linear blend over time looks
  mechanical, so run progress through an easing (`ease`, `easeIn`, `easeOut`, `backOut`).
- **Weight.** How something starts and stops says what it weighs. Heavy things take longer to get going
  and to stop, and land with little bounce. Light things snap into motion, bounce and flutter to rest
  (`jump` has a `heavy` setting).
- **Arcs.** Living things move on arcs, not straight lines: thrown props, hops, arm swings, head turns
  (`arcPt`).
- **Overlapping action and follow-through.** Do not move every part at once. The eyes lead, the body
  follows, and arms, hats, hair, props and tails drag behind, overshoot and settle last. Offset each
  part's timing from the one it hangs off (`delayed`, `spring`, `backOut`).
- **Avoid twinning.** Code copies values, so both arms end at the same angle, both eyes blink together and
  a crowd bounces in unison. Give one arm the action and the other something smaller, and offset timings
  and phases between characters. (A crowd moving as one is right only when "they are all the same" is the
  joke.)
- **Exaggeration.** Push poses, takes, squash and leans further than feels natural. In a short cartoon,
  subtle reads as nothing. If it looks like too much on the contact sheet, pull it back.
- **Strong key poses.** Each shot's storytelling poses should read as stills, with a clear silhouette and
  the body leaning into what it is doing, before any motion goes between them. If the key poses do not
  read, motion will not fix it.
- **Show the thought.** A character notices, thinks, then acts, and the eyes move first. The viewer
  understands a choice when they see it being made.
- **Secondary action.** Small actions that support the main one (a hat bobbing, a prop swinging, grass
  stirring) add life, but never compete with it.

## 7. A worked example of timing

The gag: the star tips a shop clerk into a bin. Written as code-first, it is one event in 0.6 seconds and
nobody sees it. Written as reads, across about four seconds (two lyric lines):

| Time | Read | How the eye gets there |
|---|---|---|
| 0.0 to 0.6 | A bin is here | It rolls in and stops with a wobble; nothing else moves |
| 0.6 to 1.4 | The clerk wants to stop him | The clerk walks in, reaches for his arm; the star's eyes go to the hand first |
| 1.4 to 1.7 | He has an idea | A squint, a look at the bin, a grin (the thought) |
| 1.7 to 2.1 | The tip | Wind-up the other way, then a fast arc into the bin, on the beat |
| 2.1 to 3.2 | The clerk is in the bin | Hold: legs sticking out, a settle wobble, dust. Nothing new starts |
| 3.2 to 4.0 | The star is pleased | He looks at the bin, then to camera; small shrug |

The tip itself takes 0.4 seconds. The set-up and the hold take the rest, and they are what make it funny.

## 8. Checklist for every section

Before showing a section, answer these from the contact sheet and the timing:

- What changes in each shot between its first and last frame?
- What are the reads, in order, and does each one have time to land before the next starts?
- Where is the viewer looking at each read, and what put their eye there?
- Does every big move have anticipation, and every landing a settle?
- Is anything perfectly still, perfectly symmetrical, or moving in perfect unison by accident?
- How does this section begin and end: which transition, and why that one?
- Is the star big enough in frame?
- Does the last read of the video have time to land?
