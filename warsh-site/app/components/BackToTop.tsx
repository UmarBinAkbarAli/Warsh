'use client';

import { useEffect, useState } from 'react';

/** How much of the footer has to be showing before the button gets out of its way. */
const FOOTER_CLEARANCE = 0.9;

/**
 * Scroll-to-top control, bottom-right.
 *
 * Appears after one viewport of scrolling — a button present at the top of the
 * page has nothing to do and only competes with the first screen — and retires
 * once the footer comes up, because the footer already carries every route the
 * button would help you get back to, and the disc reads as clutter over the
 * colophon. Worse than clutter, in fact: the disc is navy on a navy footer, so
 * all that remains is a bare floating arrow.
 *
 * The footer's own `data-warsh-footer-in-view` attribute looked like the natural
 * signal here and is deliberately not used: it did not reliably reach this
 * component, and the button was still sitting on the colophon at full scroll.
 * Measuring the footer directly is one `getBoundingClientRect` on a scroll frame
 * that is already doing work, and it cannot silently disagree with what is on
 * screen.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      // Re-queried rather than cached: the footer unmounts and remounts across
      // routes (the homepage renders its own inside the scroll engine), so a
      // captured reference goes stale on navigation.
      const footer = document.querySelector<HTMLElement>('footer[role="contentinfo"]');
      const footerTop = footer ? footer.getBoundingClientRect().top : Number.POSITIVE_INFINITY;

      const scrolledEnough = window.scrollY > window.innerHeight;
      const footerShowing = footerTop < window.innerHeight * FOOTER_CLEARANCE;

      setVisible(scrolledEnough && !footerShowing);
    };

    // Scroll fires far more often than the layout actually changes; coalescing
    // to one measurement per frame keeps this off the scrolling critical path.
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  const scrollToTop = () => {
    // 'instant', never 'auto'. `behavior: 'auto'` does not mean "jump" — it
    // means "defer to CSS", and globals.css sets `scroll-behavior: smooth` on
    // html, so 'auto' resolves right back to a smooth scroll.
    const jump = () => window.scrollTo({ top: 0, behavior: 'instant' });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      jump();
      return;
    }

    const startedAt = window.scrollY;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Where the browser has smooth scrolling turned off — a Chrome flag, some
    // OS accessibility settings — a smooth scrollTo is not slow, it is a silent
    // no-op, and the button is simply dead. Verified against a browser in that
    // state while building this. If nothing has moved yet, jump instead.
    window.setTimeout(() => {
      if (window.scrollY >= startedAt) jump();
    }, 120);
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      // Kept mounted and faded rather than unmounted, so the transition has
      // something to animate and the button never pops in mid-fade.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-cream-bg shadow-lifted transition-opacity duration-normal ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
