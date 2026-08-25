'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './SiteFooter';

/**
 * Every route closes on the same colophon plate. The homepage is the one
 * exception to rendering it from the layout: there the plate is the last
 * chapter of the scroll composition and has to sit inside the engine's root so
 * it takes the ground change and the entrance, so the page renders it itself
 * and the layout stays out of the way.
 */
const SELF_RENDERING_ROUTES = new Set(['/']);

export function FooterGate() {
  const pathname = usePathname();
  if (SELF_RENDERING_ROUTES.has(pathname)) return null;
  return <SiteFooter />;
}
