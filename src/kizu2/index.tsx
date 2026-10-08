// Entry point with only this video in it, so stills and renders do not load every other project's fonts.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {KIZU2_FRAMES, Kizu2} from './Kizu2';

registerRoot(() => <Composition id="Kizu2" component={Kizu2} durationInFrames={KIZU2_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />);
