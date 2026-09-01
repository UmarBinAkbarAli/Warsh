import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow } from '../components/Section';
import { ADDRESS, SITE_URL, SOCIAL_LINKS, SUPPORT_EMAIL, TEAM } from '@/content/site';

export const metadata: Metadata = {
  title: 'Team',
  description:
    'Who builds Warsh, and how a one-person company handles the Arabic it teaches.',
  alternates: { canonical: '/team' },
};

/**
 * `ProfilePage` rather than a bare `WebPage`, because that is the type Google
 * uses for "who is behind this site" — the question this page exists to answer.
 * The Person is linked to the Organization by `worksFor`, so the graph on the
 * homepage and this page describe one entity rather than two.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/team#page`,
  url: `${SITE_URL}/team`,
  name: 'Team',
  mainEntity: TEAM.map((member) => ({
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    worksFor: { '@id': `${SITE_URL}/#organization` },
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.locality,
      addressCountry: ADDRESS.countryCode,
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  })),
};

export default function TeamPage() {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Eyebrow>Team</Eyebrow>
      <h1 className="font-display text-4xl font-semibold text-navy sm:text-5xl">
        Who builds Warsh.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-deep">
        Warsh is one person. We would rather tell you that plainly than list a
        page of invented colleagues.
      </p>

      <div className="mt-14 flex flex-col gap-5">
        {TEAM.map((member) => (
          <article
            key={member.name}
            className="rounded-xl border border-navy/10 bg-parchment-bg p-8 md:p-10"
          >
            <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              {member.name}
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
              {member.role}
            </p>
            <p className="mt-5 max-w-prose text-base leading-relaxed text-deep">{member.bio}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-14">
        <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
          What that means for the Arabic
        </h2>
        <div className="max-w-prose space-y-4 text-base leading-relaxed text-deep">
          <p>
            A one-person company should be honest about the limits that come with it. Warsh does
            not claim a faculty, and it does not present its founder as a scholar of Arabic or of
            the Quran.
          </p>
          <p>
            What it does instead is keep its scope narrow and its claims checkable: the course
            teaches the Arabic itself, Ustaad Noor refers every question of fiqh to a qualified
            scholar rather than answering it, and Warsh awards no certification of any kind. How
            lessons are written, and what happens when someone reports an error, is set out in the{' '}
            <Link
              href="/editorial-guidelines"
              className="font-semibold text-navy underline underline-offset-4"
            >
              editorial guidelines
            </Link>
            .
          </p>
          <p>
            If you find a mistake in an Arabic word, a harakat, or a translation, it reaches the
            person who can fix it. Write to{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-navy underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            &mdash; or see the{' '}
            <Link href="/contact" className="font-semibold text-navy underline underline-offset-4">
              contact page
            </Link>{' '}
            for the rest.
          </p>
        </div>
      </div>
    </Section>
  );
}
