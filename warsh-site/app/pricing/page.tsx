import type { Metadata } from 'next';
import Link from 'next/link';
import '../scrollcraft-theme.css';
import './pricing.css';
import { PricingMotion } from './PricingMotion';
import { PLAY_STORE_URL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'The Vocabulary Bank is free forever. Everything else is one subscription, about $1 a month or $10 a year, after seven full days of complete access.',
  alternates: { canonical: '/pricing' },
};

/**
 * Split stage (scrollcraft grammar 2.7). A third grammar, chosen because this
 * page carries a genuine two-sided fact rather than a single argument: the
 * Vocabulary Bank is free forever, and everything else is one subscription.
 * The comparison IS the honesty pitch, which is this grammar's exact brief.
 *
 * The grammar's rules, honoured: no fixed bar (the divider is the chrome), no
 * full-bleed anything before the resolve, no centred copy, no corner-anchored
 * hero, no symmetric close, and neither column is ever decorative. Its bans
 * hold too: no `pan`, no `spotlight`, no `magnet`, no `scrub`, and no `drift`,
 * because two grounds, one per side, is what a split stage has instead.
 *
 * One deliberate deviation from the grammar's close. A textbook collapse sends
 * the divider to one edge and lets a single column take the full width. Here it
 * stops at 14% and the free column's line stands up rather than vanishing. The
 * refusal is the argument.
 *
 * Every figure below comes from Docs/warsh-product-spec.md §11 and §12. Nothing
 * is invented, and there is no counter without a source.
 */

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

const questions = [
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
];

export default function PricingPage() {
  return (
    <div id="warsh-pricing">
      <PricingMotion />

      {/* This grammar takes no bar. The divider is the chrome: it names both
          sides and reports how far the argument has got. */}
      <div className="wp-divider" aria-hidden="true">
        <span className="wp-divider__fill" />
        <span className="wp-divider__side wp-divider__side--free">Free forever</span>
        <span className="wp-divider__side wp-divider__side--paid">Subscription</span>
      </div>

      {/* 1 · CLARITY. The hero establishes the split at 50/50 with both
          headlines readable at once, and the two sides travel in from their own
          outer edges to form the divider, so the format is understood before it
          is ever asked to tip. */}
      <section
        className="wp-act wp-act--pin wp-act--even"
        data-sc-act="pin"
        data-sc-span="1.6"
        aria-labelledby="pricing-title"
      >
        <div data-sc-stage className="wp-stage">
          <div className="wp-side wp-side--free">
            <div className="wp-converge">
              <p className="wp-kicker">Warsh pricing</p>
              <h1 id="pricing-title" className="wp-h1">
                Free forever.
              </h1>
              <p className="wp-lede">
                The Vocabulary Bank costs nothing. Not a trial of it, and not a sample of it.
                All of it, for as long as Warsh exists.
              </p>
            </div>
          </div>

          <div className="wp-side wp-side--paid">
            <div className="wp-converge">
              <p className="wp-kicker">One tier</p>
              <h2 className="wp-h2">About a dollar.</h2>
              <p className="wp-lede">
                Everything else sits behind a single subscription. There is no level above it
                to be upgraded to later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · CONFIDENCE. A wipe per side keeps the two columns arguing
          separately, and the numbers are real ones with a source. The reveal
          sits on the wrapper: clip-path is relative to the border box, and
          display figures set tight have a box shorter than their own ink. */}
      <section
        className="wp-act wp-act--flow wp-act--even wp-act--after-pin"
        data-sc-act="flow"
        aria-label="The figures on each side"
      >
        <div className="wp-stage">
          <div className="wp-side wp-side--free">
            <div className="wp-figures" data-sc-reveal="left" data-sc-reveal-at="0.12 0.5">
              <div className="wp-figure">
                <p className="wp-figure__n">0</p>
                <p className="wp-figure__t">
                  <strong>What the Vocabulary Bank costs</strong>
                  Today, after the trial ends, and if you never subscribe at all.
                </p>
              </div>
              <div className="wp-figure">
                <p className="wp-figure__n">
                  <span data-sc-count="0 5" data-sc-count-at="0.2 0.56">
                    5
                  </span>
                </p>
                <p className="wp-figure__t">
                  <strong>Ustaad Noor messages a day, free</strong>
                  On every account. A consumable pack of 20 more is there if you want them in
                  one day.
                </p>
              </div>
            </div>
          </div>

          <div className="wp-side wp-side--paid">
            <div className="wp-figures" data-sc-reveal="right" data-sc-reveal-at="0.2 0.58">
              <div className="wp-figure">
                <p className="wp-figure__n">
                  <span data-sc-count="0 72" data-sc-count-at="0.26 0.62">
                    72
                  </span>
                </p>
                <p className="wp-figure__t">
                  <strong>Chapters, in order</strong>
                  Each one built on the chapter before it.
                </p>
              </div>
              <div className="wp-figure">
                <p className="wp-figure__n">
                  <span data-sc-count="0 7" data-sc-count-at="0.34 0.7">
                    7
                  </span>
                </p>
                <p className="wp-figure__t">
                  <strong>Full days of complete access</strong>
                  From the day you create your account. Getting through the curriculum quickly
                  never ends the trial early.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · CURIOSITY. What each side actually holds. Hairline rows, not
          cards, and deliberately the quietest act on the page: the peak needs
          something to arrive from. */}
      <section
        className="wp-act wp-act--flow wp-act--even"
        data-sc-act="flow"
        aria-label="What each side holds"
      >
        <div className="wp-stage">
          <div className="wp-side wp-side--free">
            <p className="wp-label">What free means</p>
            <ul className="wp-list" data-sc-in data-sc-stagger="60">
              {freeThings.map((thing) => (
                <li key={thing}>{thing}</li>
              ))}
            </ul>
            <p className="wp-note">
              Your saved words and your review queue are part of this, so a lapsed
              subscription never takes your own progress with it.
            </p>
          </div>

          <div className="wp-side wp-side--paid">
            <p className="wp-label">What the subscription adds</p>
            <ul className="wp-list" data-sc-in data-sc-stagger="60">
              {paidThings.map((thing) => (
                <li key={thing}>{thing}</li>
              ))}
            </ul>
            <p className="wp-note">
              How the chapters and the four skills are actually built is set out on the{' '}
              <Link href="/features">features page</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* 4 · THE PEAK. The squeeze, refused.

          The divider tips from 50% toward the free side and stops at 14%. The
          free column's line does not fade and is not swapped out: it rotates
          upright on the same value that narrows the column, so the words
          physically stand up rather than disappear.

          The first 18% of this act is authored silence. The divider holds while
          the opening line lands, so the squeeze has something to be a change
          from. It is not dead scroll. */}
      <section
        className="wp-act wp-act--pin wp-act--peak"
        data-sc-act="pin"
        data-sc-span="3.4"
        data-warsh-peak
        aria-label="What the subscription costs"
      >
        <div data-sc-stage className="wp-stage">
          <div className="wp-side wp-side--free">
            <p className="wp-stamp">
              Vocabulary Bank
              <span className="wp-stamp__dot">·</span>
              free forever
            </p>
          </div>

          <div className="wp-side wp-side--paid">
            <div className="wp-turn">
              <p data-sc-cue="0 0.34 0">Now the part that costs money.</p>
              <p data-sc-cue="0.28 0.64">
                One subscription. About <em>$1</em> a month, or about <em>$10</em> a year, at
                whatever Google Play charges in your country.
              </p>
              <p data-sc-cue="0.58 0.92">
                Seven full days of all of it first, from the day you make an account.
              </p>
              <p data-sc-cue="0.86 1 0.14 0">And the left hand column is still there.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · REASSURANCE. Administrative content, so it is compressed: a flow
          section at short stagger rather than a pinned act with dwell. The
          divider stays where the peak left it. */}
      <section
        className="wp-act wp-act--flow wp-act--held wp-act--after-pin"
        data-sc-act="flow"
        aria-label="Questions about the subscription"
      >
        <div className="wp-stage">
          <div className="wp-side wp-side--free">
            <p className="wp-stamp">Still free</p>
          </div>

          <div className="wp-side wp-side--paid">
            <p className="wp-label">Questions</p>
            <dl className="wp-faq" data-sc-in data-sc-stagger="50">
              {questions.map((item) => (
                <div className="wp-q" key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 6 · RESOLVE. The collapse: the divider has travelled, the paid column
          holds the dominant width, and the CTA lives in it. The free column is
          still on screen, standing on its end.

          The shared site footer follows this act and carries the site links
          and small print, so the close only has to land the offer. Cues use the
          greet-and-hold form, so the last screen still has something on it. */}
      <section
        className="wp-act wp-act--pin wp-act--held"
        data-sc-act="pin"
        data-sc-span="1.2"
        aria-label="Start"
      >
        <div data-sc-stage className="wp-stage">
          <div className="wp-side wp-side--free">
            <p className="wp-stamp">
              Free
              <span className="wp-stamp__dot">·</span>
              forever
            </p>
          </div>

          <div className="wp-side wp-side--paid">
            <div data-sc-cue="0 1 0 0">
              <h2 className="wp-h2">Seven days, then about a dollar.</h2>
              <p className="wp-close__price">
                Warsh is free to download and publicly available on Google Play. The trial
                starts when your account does, and the Vocabulary Bank never stops being free.
              </p>
              <a className="wp-cta" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                Download on Google Play
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
