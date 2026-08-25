'use client';

import { useEffect } from 'react';

type ScrollCraftApi = { layout: () => void };
type ScrollCraftGlobal = { mount: (el: Element) => ScrollCraftApi };

declare global {
  interface Window {
    ScrollCraft?: ScrollCraftGlobal;
  }
}

/**
 * Loads the scrollcraft engine and mounts it on `rootId`.
 *
 * The engine (public/scrollcraft.js) is the mechanism and is never edited: it
 * reads data-sc-* off the markup and publishes --sc-p on each act. Pages layer
 * their own bespoke behaviour on top of that published value.
 *
 * `onMounted` runs once the engine is live, and anything it returns is torn
 * down with the rest. Use it for page-specific scroll logic that needs the
 * engine already running.
 */
export function useScrollCraft(rootId: string, onMounted?: (root: HTMLElement) => (() => void) | void) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const cleanups: Array<() => void> = [];

    // Both the stylesheet and the class carrying the Warsh token override are
    // removed on the way out, so a client-side navigation to a route that does
    // not mount the engine cannot inherit its near-black ground or lime accent.
    document.documentElement.classList.add('warsh-sc-active');
    if (!document.getElementById('warsh-sc-css')) {
      const link = document.createElement('link');
      link.id = 'warsh-sc-css';
      link.rel = 'stylesheet';
      link.href = '/scrollcraft.css';
      document.head.appendChild(link);
    }
    cleanups.push(() => {
      document.documentElement.classList.remove('warsh-sc-active');
      document.getElementById('warsh-sc-css')?.remove();
    });

    let mounted = false;
    const mountEngine = () => {
      if (mounted || !window.ScrollCraft) return;
      mounted = true;
      window.ScrollCraft.mount(root);
      const teardown = onMounted?.(root);
      if (teardown) cleanups.push(teardown);
    };

    if (window.ScrollCraft) {
      mountEngine();
    } else {
      let script = document.getElementById('warsh-sc-js') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'warsh-sc-js';
        script.src = '/scrollcraft.js';
        document.body.appendChild(script);
      }
      script.addEventListener('load', mountEngine);
      cleanups.push(() => script?.removeEventListener('load', mountEngine));
    }

    return () => cleanups.forEach((fn) => fn());
    // onMounted is intentionally not a dependency: these pages mount once, and
    // re-running would double-mount the engine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId]);
}
