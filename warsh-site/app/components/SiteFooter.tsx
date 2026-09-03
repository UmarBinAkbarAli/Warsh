'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import './site-footer.css';
import {
  ADDRESS,
  FOOTER_LINKS,
  PHONE,
  PLAY_STORE_URL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  WEB_APP_URL,
} from '@/content/site';

/**
 * The one footer the whole site closes on: the homepage's colophon plate,
 * lifted out so every route ends the same way. Smallest type on the site, the
 * ask set as a line of running text rather than a button island.
 *
 * `reveal` opts into the scrollcraft entrance (data-sc-in / data-sc-stagger)
 * and is only passed on routes that mount the engine; without the engine those
 * attributes would leave the plate hidden, so they are off by default.
 */
export function SiteFooter({ reveal = false }: { reveal?: boolean }) {
  const revealProps = reveal ? { 'data-sc-in': '', 'data-sc-stagger': '70' } : {};
  const ref = useRef<HTMLElement>(null);

  // Pages with fixed chrome (the pricing divider, the features index) have to
  // retire it before it rules through the colophon. The footer is the only
  // thing that knows when it has arrived, and it is the one node those pages
  // cannot observe reliably from the outside, so it publishes the fact itself
  // on the document element and their stylesheets key off it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.toggleAttribute(
          'data-warsh-footer-in-view',
          entry.isIntersecting,
        );
      },
      { rootMargin: '0px 0px -25% 0px' },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.removeAttribute('data-warsh-footer-in-view');
    };
  }, []);

  return (
    <footer
      ref={ref}
      role="contentinfo"
      className="wsf"
      data-warsh-chapter="colophon"
      data-warsh-ground="ink"
    >
      <div className="wsf__spread">
        <div className="wsf__grid" {...revealProps}>
          <div>
            <h2 className="wsf__eyebrow">Start today</h2>
            <p className="wsf__ask">
              Warsh is free to download and publicly available on Google Play. Begin with the
              seven ayat you already recite:{' '}
              <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                download on Google Play
              </a>
              , or{' '}
              <a href={WEB_APP_URL} target="_blank" rel="noreferrer">
                open Warsh on the web
              </a>
              .
            </p>

            <SocialRow />
          </div>

          <nav className="wsf__cols" aria-label="Site">
            <FooterColumn title="Product" links={FOOTER_LINKS.product} />
            <FooterColumn title="Company" links={FOOTER_LINKS.company} />
            <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
          </nav>
        </div>

        <div className="wsf__imprint">
          <span>
            &copy; {new Date().getFullYear()} Warsh. All rights reserved.{' '}
            {/*
              Marked up as an hCard adr so the locality is machine-readable next
              to the Organization schema's PostalAddress, rather than being just
              two more words in the copyright line.
            */}
            <span className="adr">
              <span className="locality">{ADDRESS.locality}</span>,{' '}
              <span className="region">{ADDRESS.region}</span>,{' '}
              <span className="country-name">{ADDRESS.country}</span>
            </span>
            .{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{' '}
            <a href={`tel:${PHONE.tel}`}>{PHONE.display}</a>
          </span>
          <span className="wsf__ar" style={{ letterSpacing: 0 }}>
            حَيْثُ تُصْنَعُ الْعَرَبِيَّة
          </span>
        </div>
      </div>
    </footer>
  );
}

/**
 * Rendered only when a profile is actually listed, so an empty SOCIAL_LINKS
 * leaves no orphan row of nothing behind it.
 */
function SocialRow() {
  if (SOCIAL_LINKS.length === 0) return null;

  return (
    <ul className="wsf__social" aria-label="Warsh on social media">
      {SOCIAL_LINKS.map((social) => (
        <li key={social.href}>
          <a href={social.href} target="_blank" rel="noreferrer me">
            {social.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  const isExternal = (href: string) => href.startsWith('http');

  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            {isExternal(link.href) ? (
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ) : (
              <Link href={link.href}>{link.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
