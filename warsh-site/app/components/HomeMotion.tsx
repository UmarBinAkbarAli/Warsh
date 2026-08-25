'use client';

import { useScrollCraft } from './useScrollCraft';

/**
 * The homepage's bespoke behaviour. Engine loading, the Warsh token override
 * and teardown all live in useScrollCraft, which every engine-mounting page
 * shares; everything here is specific to the chaptered-editorial homepage.
 *
 * Two jobs:
 *   1. The peak (chapter 3): light each word of the Bismillah, then its gloss,
 *      right to left, as the pinned act advances.
 *   2. The RTL axis (the signature move) and the folio rail.
 */
export function HomeMotion() {
  useScrollCraft('warsh-home', (root) => {
    const cleanups: Array<() => void> = [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // -- 2 · the peak --------------------------------------------------------
    // Words light in document order, which under `direction: rtl` is right to
    // left on screen: the order Arabic is actually read.
    const peak = root.querySelector<HTMLElement>('[data-warsh-peak]');
    // The engine publishes --sc-p on the ACT element, not on the stage inside
    // it. Reading it off the stage returns an empty string, which parks the
    // whole peak on frame one: the Bismillah never resolves and the act reads
    // as a third of a page of dead scroll.
    const peakAct = peak?.closest<HTMLElement>('[data-sc-act]') ?? null;
    if (peak && peakAct && !reduced) {
      const words = Array.from(peak.querySelectorAll<HTMLElement>('[data-warsh-word]'));
      const whole = peak.querySelector<HTMLElement>('[data-warsh-whole]');

      // Authored silence sits between the Bismillah landing and the first
      // gloss (roughly p 0.28 to 0.42). It is deliberate, and BRIEF.md records
      // it so a verification pass does not read it as dead scroll.
      // Retuned after the first verification round. The original 0.42 start
      // left a third of the act with nothing resolving, which is longer than
      // the silence the brief authored and read as the page having stalled.
      const firstAt = 0.16;
      const lastAt = 0.76;
      const wholeAt = 0.9;

      let raf = 0;
      let visible = false;
      let lastP = -1;

      const paint = () => {
        raf = 0;
        const raw = peakAct.style.getPropertyValue('--sc-p');
        const p = raw ? parseFloat(raw) : 0;
        if (Number.isNaN(p) || p === lastP) {
          if (visible) raf = requestAnimationFrame(paint);
          return;
        }
        lastP = p;

        const step = words.length > 1 ? (lastAt - firstAt) / (words.length - 1) : 0;
        words.forEach((word, i) => {
          const lit = p >= firstAt + step * i;
          if ((word.dataset.lit === 'true') !== lit) {
            word.dataset.lit = String(lit);
          }
        });

        if (whole) {
          const lit = p >= wholeAt;
          if ((whole.dataset.lit === 'true') !== lit) whole.dataset.lit = String(lit);
        }

        if (visible) raf = requestAnimationFrame(paint);
      };

      const io = new IntersectionObserver(
        (entries) => {
          visible = entries.some((e) => e.isIntersecting);
          if (visible && !raf) raf = requestAnimationFrame(paint);
        },
        { rootMargin: '20% 0px' },
      );
      io.observe(peak);
      cleanups.push(() => {
        io.disconnect();
        if (raf) cancelAnimationFrame(raf);
      });
    }

    // -- 3 · the signature move: content arrives from the right --------------
    const rtlItems = Array.from(root.querySelectorAll<HTMLElement>('[data-warsh-rtl-item]'));
    if (rtlItems.length) {
      if (reduced) {
        rtlItems.forEach((el) => el.classList.add('wh-arrived'));
      } else {
        const io = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target as HTMLElement;
              const delay = Number(el.dataset.warshDelay ?? 0);
              window.setTimeout(() => el.classList.add('wh-arrived'), delay);
              obs.unobserve(el);
            });
          },
          { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
        );
        rtlItems.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      }
    }

    // -- the folio ------------------------------------------------------------
    // The grammar's chrome. It names the chapter the reader is in and takes its
    // colour from that chapter's ground, since it sits over both paper and ink.
    const rail = document.querySelector<HTMLElement>('[data-warsh-rail]');
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-warsh-chapter]'));

    if (rail && chapters.length) {
      const folios = Array.from(rail.querySelectorAll<HTMLElement>('[data-warsh-folio]'));

      const sync = () => {
        const mid = window.innerHeight / 2;
        let activeId = chapters[0].dataset.warshChapter;
        let activeGround = chapters[0].dataset.warshGround ?? 'paper';

        for (const chapter of chapters) {
          const rect = chapter.getBoundingClientRect();
          if (rect.top <= mid && rect.bottom > mid) {
            activeId = chapter.dataset.warshChapter;
            activeGround = chapter.dataset.warshGround ?? 'paper';
            break;
          }
        }

        rail.dataset.ground = activeGround;
        folios.forEach((folio) => {
          folio.dataset.active = String(folio.dataset.warshFolio === activeId);
        });
      };

      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          sync();
          ticking = false;
        });
      };

      sync();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  });

  return null;
}
