'use client';

import { useScrollCraft } from '../components/useScrollCraft';

/**
 * The about page mounts the engine and nothing else.
 *
 * Its signature move, the gather, is authored entirely in CSS against the act's
 * published `--sc-p` and a per-word index, offset and scale written onto each
 * span. There is no per-frame JavaScript to run: every word's transform is one
 * `calc()` the compositor already knows how to interpolate, so the whole move
 * costs a single custom-property write per frame from the engine itself.
 *
 * That is deliberate rather than lazy. Driving twelve transforms from a rAF
 * loop would produce the same picture and would recompute, on the main thread,
 * something the style engine resolves for free.
 */
export function AboutMotion() {
  useScrollCraft('warsh-about');
  return null;
}
