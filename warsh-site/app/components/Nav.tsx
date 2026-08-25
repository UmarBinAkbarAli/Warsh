'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, PLAY_STORE_URL } from '@/content/site';
import { Button } from './Button';

/**
 * Routes whose scrollcraft grammar forbids a fixed bar, each for its own
 * reason: the homepage is chaptered editorial and its chrome is the folio rail
 * in the margin; pricing is a split stage and its chrome is the divider;
 * about is a typographic poster and has no persistent nav at all, with the
 * wordmark set into the composition instead.
 *
 * The bar still renders on all three for navigation and for the skip path. It
 * scrolls away with the first screen rather than pinning over the page.
 */
const UNPINNED_ROUTES = new Set(['/', '/pricing', '/about']);

export function Nav() {
  const [open, setOpen] = useState(false);
  const unpinned = UNPINNED_ROUTES.has(usePathname());

  return (
    <header
      className={
        unpinned
          ? 'relative z-50 bg-[#faf6e9]'
          : 'sticky top-0 z-50 border-b border-navy/10 bg-cream-bg/95 backdrop-blur'
      }
    >
      <div className="mx-auto flex w-full max-w-container items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Warsh home">
          <Image src="/images/warsh-logo.png" alt="Warsh" width={44} height={30} priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/80 transition-colors duration-fast hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href={PLAY_STORE_URL} variant="primary" external>
            Download on Google Play
          </Button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-navy/15 p-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          <div className="flex h-4 w-5 flex-col justify-between">
            <span className={`h-0.5 w-full bg-navy transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`h-0.5 w-full bg-navy transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-full bg-navy transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-navy/10 bg-cream-bg px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-base font-medium text-ink"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button href={PLAY_STORE_URL} variant="primary" external className="w-full">
                Download on Google Play
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
