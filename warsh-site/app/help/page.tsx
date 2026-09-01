import type { Metadata } from 'next';
import { Section } from '../components/Section';
import { Faq } from '../components/Faq';
import { faqPlainAnswer } from '../components/faq-content';
import { FAQ_SECTIONS } from '@/content/faq';
import { SiteSearch } from '../components/SiteSearch';
import { buildSearchIndex } from '@/content/search';
import { SITE_URL, SUPPORT_EMAIL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description: 'Answers to common questions about subscriptions, accounts, and learning on Warsh.',
  alternates: { canonical: '/help' },
};


/**
 * FAQPage structured data, built from the same `sections` the page renders so the
 * two can never disagree — Google penalises markup that describes answers a
 * reader cannot actually see on the page.
 */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/help#faq`,
  mainEntity: FAQ_SECTIONS.flatMap((section) =>
    section.items.flatMap((item) => {
      const answer = faqPlainAnswer(item);
      if (!answer) return [];
      return [
        {
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        },
      ];
    }),
  ),
};

export default async function HelpPage() {
  const searchIndex = await buildSearchIndex();

  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">Help &amp; FAQ</h1>
        <p className="mt-3 text-base leading-relaxed text-deep">
          Find answers to common questions about Warsh below. Can&rsquo;t find what you need?
          Reach out to us directly.
        </p>

        <div className="mt-8">
          <SiteSearch items={searchIndex} />
        </div>

        <div className="mt-10">
          <Faq sections={FAQ_SECTIONS} />
        </div>

        <div className="mt-10 rounded-lg border border-navy/10 bg-parchment-bg p-8 text-center">
          <h2 className="font-display text-lg font-semibold text-navy">Still need help?</h2>
          <p className="mt-2 text-sm leading-relaxed text-deep">
            Email us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>{' '}
            and we will get back to you as soon as possible, in sha Allah.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-block rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-cream-bg"
          >
            Email support
          </a>
        </div>
      </div>
    </Section>
  );
}
