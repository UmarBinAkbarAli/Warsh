'use client';

import { useScrollCraft } from '../components/useScrollCraft';

/**
 * The features page's bespoke behaviour: an index of objects that JUMPS.
 *
 * The gallery grammar requires the nav to be an index you can move around in,
 * "because a collection you cannot skip around in is a video". The catch is
 * that this page's objects live in LATERAL space: they are laid out along a
 * rail that a pinned act pans sideways as you scroll down. An anchor link
 * cannot reach them, because their horizontal position is a function of
 * vertical scroll.
 *
 * So the jump resolves the other way round. Given an object, work out the pan
 * progress at which it sits centred in the viewport, then convert that
 * progress back into the document scroll position that produces it, and go
 * there. That inversion is the move, and it is written entirely against the
 * engine's published geometry rather than by modifying the engine.
 */
export function FeaturesMotion() {
  useScrollCraft('warsh-features', (root) => {
    const rail = root.querySelector<HTMLElement>('[data-warsh-rail]');
    const act = rail?.closest<HTMLElement>('[data-sc-act]') ?? null;
    if (!rail || !act) return;

    const items = Array.from(rail.querySelectorAll<HTMLElement>('[data-warsh-object]'));
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-warsh-jump]'));
    const cleanups: Array<() => void> = [];

    // The engine travels exactly `scrollWidth - viewport`. A rail narrower than
    // the viewport travels ZERO, which turns this act into a pinned stage
    // holding one motionless screen for its whole span. It is width-dependent,
    // so it can be correct on a phone and dead on a desktop at the same time.
    const railTravel = () => Math.max(rail.scrollWidth - window.innerWidth, 0);

    // A pinned act's progress runs over `height - viewport`, starting at its top.
    const actTop = () => act.getBoundingClientRect().top + window.scrollY;
    const actTravel = () => Math.max(act.offsetHeight - window.innerHeight, 1);

    /** Pan progress at which `item` sits centred in the viewport. */
    const progressFor = (item: HTMLElement) => {
      const travel = railTravel();
      if (!travel) return 0;
      const centre = item.offsetLeft + item.offsetWidth / 2;
      return Math.min(Math.max((centre - window.innerWidth / 2) / travel, 0), 1);
    };

    const jumpTo = (index: number) => {
      const item = items[index];
      if (!item) return;
      const target = actTop() + progressFor(item) * actTravel();
      window.scrollTo({
        top: target,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    };

    buttons.forEach((button) => {
      const onClick = () => jumpTo(Number(button.dataset.warshJump));
      button.addEventListener('click', onClick);
      cleanups.push(() => button.removeEventListener('click', onClick));
    });

    // Highlight whichever object is currently nearest the centre. Read from the
    // act's published --sc-p rather than from getBoundingClientRect on every
    // item, which would force layout each frame.
    let current = -1;
    let ticking = false;

    const sync = () => {
      ticking = false;
      const raw = act.style.getPropertyValue('--sc-p');
      const p = raw ? parseFloat(raw) : 0;
      if (Number.isNaN(p)) return;

      let nearest = 0;
      let best = Infinity;
      items.forEach((item, i) => {
        const distance = Math.abs(progressFor(item) - p);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      });

      if (nearest === current) return;
      current = nearest;
      buttons.forEach((button) => {
        button.setAttribute('aria-current', String(Number(button.dataset.warshJump) === nearest));
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });

    // The overflow is width-dependent and the harness does not catch a dead
    // rail, so report it here where it is cheap to notice in development.
    if (process.env.NODE_ENV !== 'production' && railTravel() < window.innerHeight * 0.5) {
      // eslint-disable-next-line no-console
      console.warn(
        `[warsh-features] rail overflow is only ${railTravel()}px against a ` +
          `${window.innerWidth}px viewport. Below about half a viewport the pan ` +
          `reads as a still frame held for the whole act.`,
      );
    }

    return () => cleanups.forEach((fn) => fn());
  });

  return null;
}
