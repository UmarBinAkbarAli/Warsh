import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow } from '../components/Section';
import { SITE_URL, SUPPORT_EMAIL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Editorial Guidelines',
  description:
    'How Warsh writes and reviews its Quranic Arabic lessons, what Ustaad Noor will and will not answer, what Warsh does not claim, and how to report an error.',
  alternates: { canonical: '/editorial-guidelines' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/editorial-guidelines#page`,
  url: `${SITE_URL}/editorial-guidelines`,
  name: 'Editorial Guidelines',
  description:
    'How Warsh writes and reviews its Quranic Arabic lessons, and the limits it holds itself to.',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function EditorialGuidelinesPage() {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Eyebrow>Editorial guidelines</Eyebrow>
      <h1 className="font-display text-4xl font-semibold text-navy sm:text-5xl">
        How Warsh&rsquo;s content is made.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-deep">
        Warsh teaches the Arabic of the Quran. That places an obligation on us to be exact about
        what we claim, careful about what we teach, and honest about the limits of both. This page
        sets out the standards we hold ourselves to.
      </p>

      <div className="mt-16 flex flex-col gap-14">
        <Rule heading="Who writes the lessons">
          <p>
            Warsh&rsquo;s curriculum is written by our own team and authored in Warsh Studio, our
            internal editing tool. It is not machine-generated, and it is not assembled from
            scraped material. Lessons are reviewed before they are published.
          </p>
          <p>
            The course is structured across 72 chapters and begins with Al-Fatiha, because that is
            the passage most readers already recite daily. What the course covers is set out on the{' '}
            <Link href="/features" className="font-semibold text-navy underline underline-offset-4">
              features page
            </Link>
            .
          </p>
        </Rule>

        <Rule heading="What Ustaad Noor will not do">
          <p>
            Ustaad Noor is an AI tutor built to teach Arabic grammar, vocabulary, and the Quranic
            context of a word. Its limits are enforced in the tutor itself, not left to chance:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-gold-deep">
            <li>
              It does not issue fatwas, sectarian judgments, or personal religious rulings. Asked
              for one, it says the question is outside its role and directs you to a qualified
              scholar.
            </li>
            <li>
              It does not present itself as a mufti, an alim, or a human scholar, and it does not
              fabricate Quranic text, hadith, or scholarly consensus.
            </li>
            <li>
              It may explain the Arabic meaning or grammar of a religious text. It will not turn
              that explanation into a ruling.
            </li>
          </ul>
          <p>
            An AI tutor is a useful way to answer a grammar question at the moment you have it. It
            is not a substitute for a teacher, and we do not present it as one.
          </p>
        </Rule>

        <Rule heading="What we do not claim">
          <p>
            Warsh is not a madrasah. It does not award certification, ijazah, or any credential. It
            is not a replacement for a qualified teacher, and finishing the course does not make
            anyone a scholar of Arabic or of the Quran.
          </p>
          <p>
            We do not describe our curriculum as endorsed, accredited, or approved by any
            institution that has not endorsed it. Where we say a feature is free, it is free
            &mdash; the Vocabulary Bank stays free permanently, including after a subscription
            ends.
          </p>
        </Rule>

        <Rule heading="Reporting an error">
          <p>
            If you find a mistake in an Arabic word, a harakat, a translation, or a grammatical
            explanation, tell us. Email{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-navy underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            with the chapter and lesson number and what you believe is correct.
          </p>
          <p>
            Corrections we confirm go out in a following content release, and we fix the word
            everywhere it appears rather than only in the lesson you found it in. Reporting an
            error in the Arabic of the Quran is a service to every other reader, and we treat it
            that way.
          </p>
        </Rule>

        <Rule heading="How this page is maintained">
          <p>
            These are standards, not a snapshot. If our process changes, this page changes with it.
            If you believe something on Warsh falls short of what is written here, write to us at
            the address above and say so plainly.
          </p>
        </Rule>
      </div>
    </Section>
  );
}

function Rule({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-14">
      <h2 className="font-display text-2xl font-semibold text-navy">{heading}</h2>
      <div className="max-w-prose space-y-4 text-base leading-relaxed text-deep">{children}</div>
    </div>
  );
}
