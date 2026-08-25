'use client';

import { useScrollCraft } from '../components/useScrollCraft';

/**
 * The pricing page's bespoke behaviour: one number, hoisted.
 *
 * Split stage needs every part of the page to agree about where the divider
 * is, but the engine publishes `--sc-p` on the act element and nothing else can
 * see it: the fixed chrome and the five other acts are all outside that
 * subtree. So this reads the peak act's progress and republishes it on the page
 * root as `--wp-tip`, which is the single value the divider, the column tracks
 * and the standing line all resolve against.
 *
 * The travel is deliberately clamped short of the edge. A textbook split-stage
 * close collapses one column to nothing; here the collapse stops at 14% and the
 * free column's line rotates upright instead of disappearing. That refusal is
 * the argument the page is making, so it is the page's own code rather than a
 * parameter handed to a kit device. The engine is untouched.
 */

/** Progress inside the peak act at which the squeeze starts and finishes. */
const TIP_FROM = 0.18;
const TIP_TO = 0.8;

export function PricingMotion() {
  useScrollCraft('warsh-pricing', (root) => {
    const peak = root.querySelector<HTMLElement>('[data-warsh-peak]');
    if (!peak) return;

    let ticking = false;
    let lastTip = -1;
    let lastDoc = -1;

    const sync = () => {
      ticking = false;

      // Read from the act's published custom property rather than from
      // getBoundingClientRect, so this costs no layout per frame. It has to come
      // off the act element itself: the stage inside it has no `--sc-p`, and
      // reading the wrong node returns an empty string and freezes the whole
      // move at zero.
      const raw = peak.style.getPropertyValue('--sc-p');
      const p = raw ? parseFloat(raw) : 0;

      if (!Number.isNaN(p)) {
        // Authored silence: nothing tips for the first 18% of the peak. The
        // divider holds at 50/50 while the first line lands, so the squeeze has
        // something to be a change from.
        const tip = Math.min(Math.max((p - TIP_FROM) / (TIP_TO - TIP_FROM), 0), 1);
        const rounded = Math.round(tip * 1000) / 1000;
        if (rounded !== lastTip) {
          lastTip = rounded;
          root.style.setProperty('--wp-tip', String(rounded));
        }
      }

      // The divider reports how far the argument has got, which is the other
      // half of what this grammar's chrome is for.
      const scrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const doc = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      const roundedDoc = Math.round(doc * 500) / 500;
      if (roundedDoc !== lastDoc) {
        lastDoc = roundedDoc;
        root.style.setProperty('--wp-doc', String(roundedDoc));
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sync);
    };

    // Under reduced motion the tip is not driven at all. The stylesheet freezes
    // it at 0 for the acts that argue at 50/50 and at 1 for the acts that are
    // meant to be resolved, so the reader still arrives at the same page state
    // without the divider ever moving under them.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });

  return null;
}
