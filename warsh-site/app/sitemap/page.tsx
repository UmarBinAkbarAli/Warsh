import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow } from '../components/Section';
import { OFF_SITEMAP_LINKS, ROUTE_GROUPS, SITE_ROUTES } from '@/content/routes';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Every public page on warsh.app, in one list.',
  alternates: { canonical: '/sitemap' },
};

export default function SitemapPage() {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <Eyebrow>Sitemap</Eyebrow>
      <h1 className="font-display text-4xl font-semibold text-navy sm:text-5xl">
        Everything on this site.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-deep">
        Generated from the same route table that feeds{' '}
        <Link href="/sitemap.xml" className="font-semibold text-navy underline underline-offset-4">
          sitemap.xml
        </Link>
        , so the two can never disagree.
      </p>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {ROUTE_GROUPS.map((group) => {
          const internal = SITE_ROUTES.filter((route) => route.group === group);
          const external = OFF_SITEMAP_LINKS.filter((link) => link.group === group);

          return (
            <div key={group}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {group}
              </h2>
              <ul className="flex flex-col">
                {internal.map((route) => (
                  <li key={route.path} className="border-b border-navy/10 py-2.5">
                    <Link href={route.path} className="group block">
                      <span className="text-base text-navy group-hover:underline group-hover:underline-offset-4">
                        {route.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-subtle-brown">{route.blurb}</span>
                    </Link>
                  </li>
                ))}
                {external.map((link) => (
                  <li key={link.href} className="border-b border-navy/10 py-2.5">
                    <a
                      href={link.href}
                      className="group block"
                      // Same-origin feed stays in the tab; the web app is a
                      // different origin and follows the site's external-link rule.
                      {...(link.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <span className="text-base text-navy group-hover:underline group-hover:underline-offset-4">
                        {link.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-subtle-brown">{link.blurb}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
