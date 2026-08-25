import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '../components/Section';
import { Faq, type FaqSection } from '../components/Faq';
import { PLAY_STORE_URL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'The Vocabulary Bank is free forever. Everything else is one subscription, about $1 a month or $10 a year, after seven full days of complete access.',
  alternates: { canonical: '/pricing' },
};

const freeThings = [
  'Browse the Vocabulary Bank by topic, and search it',
  'Word of the Day',
  'Arabic, transliteration, English and Urdu, root, and a Quranic example',
  'Audio playback on every word',
  'Saved words, and SM-2 review with Hard, Good and Easy',
  'Five Ustaad Noor messages a day',
];

const paidThings = [
  'All 72 curriculum chapters, in order',
  'Ustaad Noor beyond the daily five',
  'Tadabbur, starting at Al-Fatiha',
  'Speaking practice inside lessons',
  'Paid lesson media',
];

const faqSections: FaqSection[] = [
  {
    label: 'Questions',
    items: [
      {
        q: 'What happens after the seven days?',
        a: 'Paid lessons, Ustaad Noor beyond the daily five, and Tadabbur are gated. The Vocabulary Bank carries on working exactly as it did, including your saved words and your review queue.',
      },
      {
        q: 'Is the price the same everywhere?',
        a: 'No. Google Play sets and localizes it for your region. About $1 a month and about $10 a year are the reference prices, and the price you see at checkout is the real one.',
      },
      {
        q: 'Can I cancel?',
        a: 'Yes, through Google Play, whenever you like. Restoring a purchase is built in, and there is no retention screen standing between you and the cancel button.',
      },
      {
        q: 'Is there a tier above this one?',
        a: 'No. There is one subscription. The only other thing you can buy is a consumable pack of 20 extra Ustaad Noor messages, if you want more than five in a single day.',
      },
    ],
  },
];

export default function PricingPage() {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
          Simple, honest pricing.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-deep">
          The Vocabulary Bank is free forever. Everything else is one subscription, after
          seven full days of complete access.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-navy/10 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Vocabulary Bank
          </p>
          <p className="mt-4 font-display text-3xl font-semibold text-navy">Free forever</p>
          <p className="mt-2 text-sm leading-relaxed text-deep">
            Not a trial of it, and not a sample of it. All of it, for as long as Warsh exists.
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-deep">
            {freeThings.map((thing) => (
              <li key={thing} className="flex gap-2">
                <span className="text-gold-deep" aria-hidden>
                  ✓
                </span>
                <span>{thing}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-deep/70">
            Your saved words and your review queue are part of this, so a lapsed subscription
            never takes your own progress with it.
          </p>
        </div>

        <div className="flex flex-col rounded-lg border border-navy bg-navy p-8 text-cream-bg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">One tier</p>
          <p className="mt-4 font-display text-3xl font-semibold">
            About $1<span className="text-lg font-normal text-cream-bg/70"> / month</span>
          </p>
          <p className="mt-1 text-sm text-cream-bg/70">or about $10 / year</p>
          <p className="mt-3 text-sm leading-relaxed text-cream-bg/80">
            Seven full days of complete access first, from the day you create your account.
            There is no level above it to be upgraded to later.
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-cream-bg/90">
            {paidThings.map((thing) => (
              <li key={thing} className="flex gap-2">
                <span className="text-gold" aria-hidden>
                  ✓
                </span>
                <span>{thing}</span>
              </li>
            ))}
          </ul>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors duration-fast hover:bg-gold-deep"
          >
            Download on Google Play
          </a>
          <p className="mt-3 text-xs leading-relaxed text-cream-bg/60">
            Prices are Google Play&rsquo;s reference prices and vary by region; the price you
            see at checkout is the real one. See the{' '}
            <Link href="/features" className="underline underline-offset-4">
              features page
            </Link>{' '}
            for how the chapters and the four skills are built.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <Faq sections={faqSections} />
      </div>
    </Section>
  );
}
