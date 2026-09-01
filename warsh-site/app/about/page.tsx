import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import '../scrollcraft-theme.css';
import './about.css';
import { AboutMotion } from './AboutMotion';
import { ADDRESS, PLAY_STORE_URL, SUPPORT_EMAIL } from '@/content/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Warsh exists, what it teaches, and the things it deliberately does not claim to be.',
  alternates: { canonical: '/about' },
};

/**
 * Typographic poster (scrollcraft grammar 2.5). A fourth grammar, distinct from
 * the homepage, the features page and the pricing page.
 *
 * Chosen because the asset here is a sentence. There is no photography to show,
 * and generating eight plausible forgettable frames would weaken the page
 * rather than support it, which is the exact case this grammar is for. So type
 * is the imagery and rhythm comes from scale: a word at 15vw, then a paragraph
 * at 16px, then silence.
 *
 * Its forbids hold: no photographic ground, no `scrub`, no scrims, no cards of
 * any kind, no decorative motion, no `tilt` and no `parallax` on text. It has no
 * persistent nav; the wordmark is set into the composition instead.
 *
 * The four skills, the lesson shape and the feature set live on the homepage
 * and the features page and are linked, not repeated.
 */

/**
 * The peak's sentence, one span per word.
 *
 * Each word carries where it starts (a scatter offset from where it belongs, in
 * viewport units so it holds at any width), how much larger it starts, and its
 * index, which staggers the gather. The interpolation itself is one calc() in
 * about.css driven off the act's `--sc-p`; nothing here runs per frame.
 *
 * The sentence is on screen for the entire act. Nothing is revealed and nothing
 * is hidden: only the setting changes, and understanding arrives purely from
 * the words closing on each other.
 */
type GatherWord = {
  t: string;
  x: string;
  y: string;
  r: string;
  s: number;
  accent?: boolean;
};

const sentence: GatherWord[] = [
  { t: 'You', x: '-19vw', y: '-24vh', r: '-7deg', s: 1.5 },
  { t: 'know', x: '18vw', y: '-27vh', r: '5deg', s: 1.1 },
  { t: 'how', x: '-9vw', y: '22vh', r: '8deg', s: 0.8 },
  { t: 'the', x: '21vw', y: '7vh', r: '-6deg', s: 0.5 },
  { t: 'words', x: '-22vw', y: '5vh', r: '4deg', s: 1.4 },
  { t: 'sound.', x: '8vw', y: '26vh', r: '-9deg', s: 1.2 },
  { t: 'Warsh', x: '20vw', y: '-11vh', r: '6deg', s: 1.3, accent: true },
  { t: 'is', x: '-16vw', y: '27vh', r: '-4deg', s: 0.6 },
  { t: 'about', x: '13vw', y: '-19vh', r: '7deg', s: 0.9 },
  { t: 'what', x: '-21vw', y: '14vh', r: '-8deg', s: 0.8 },
  { t: 'they', x: '3vw', y: '-28vh', r: '3deg', s: 0.7 },
  { t: 'mean.', x: '17vw', y: '21vh', r: '-5deg', s: 1.5, accent: true },
];

const boundaries = [
  { text: 'Not a memorisation app.', at: '0.10 0.34' },
  { text: 'Not a Quran translation reader.', at: '0.18 0.42' },
  { text: 'Not a madrasah, and not a certification.', at: '0.26 0.50' },
  { text: 'Not a replacement for a qualified teacher.', at: '0.34 0.58' },
];

export default function AboutPage() {
  return (
    <div id="warsh-about">
      <AboutMotion />

      {/* 1 · RECOGNITION. The hero is one line at extreme scale filling the
          viewport, with the smallest thing on the screen sitting directly under
          the largest. The wordmark is part of the composition rather than a bar
          item, because this grammar has no persistent nav. */}
      <section
        className="wa-act wa-act--pin"
        data-sc-act="pin"
        data-sc-span="1.8"
        aria-labelledby="about-title"
      >
        <div data-sc-stage className="wa-stage">
          <div className="wa-wrap">
            <p className="wa-mark">
              <span className="wa-mark__ar">وَرْش</span>
            </p>

            <h1 id="about-title" className="wa-h1" data-sc-cue="0 1 0 0.08" data-sc-kinetic="lines">
              One gap.
            </h1>

            <p className="wa-hero__body" data-sc-cue="0 1 0 0.08">
              Over a billion Muslims recite the Quran in Salah. Most do not understand, word for
              word, what they are saying. Warsh exists to close that specific gap. Nothing more,
              and nothing less.
            </p>
          </div>
        </div>
      </section>

      {/* 2 · DOUBT. The two things that already exist, wiping in from opposite
          edges. A wipe running edge to edge across a full line is a transition;
          a wipe on a small element is a fidget, so these are set big. Each one
          sits on a wrapper, never on the type itself. */}
      <section className="wa-act" data-sc-act="flow" aria-label="What already exists">
        <div className="wa-wrap">
          <div>
            <h2 className="wa-line wa-line--soft">A course that asks you for years.</h2>
          </div>

          <div className="wa-trail">
            <p className="wa-line wa-line--soft">
              Or an app that teaches words and never reaches an ayah.
            </p>
          </div>

          <p className="wa-small">
            Those are the two things on offer, and neither matches how most people actually have
            time to learn: a few focused minutes a day, building steadily toward one specific and
            honest goal.
          </p>
        </div>
      </section>

      {/* 3 · THE PEAK. The measure closes.

          The words are scattered at poster scale, so the reader has all the
          parts and no sentence, which is the experience the product exists to
          end. Scroll pulls each one back to where it belongs and down to
          reading size until the line locks. The first 12% of the act is
          authored silence before anything moves, and the last quarter holds the
          settled sentence so it can be read. Neither is dead scroll.

          This act carries the only near-white ground on the page. */}
      <section
        className="wa-act wa-act--pin wa-act--peak"
        data-sc-act="pin"
        data-sc-span="4.4"
        aria-label="What Warsh is about"
      >
        <div data-sc-stage className="wa-stage">
          <div className="wa-wrap">
            <p className="wa-gather">
              {sentence.map((word, i) => (
                // The separator is a text node BETWEEN the spans, never inside
                // one. Each word is an inline-block so it can be transformed,
                // and a trailing space inside an inline-block is trimmed, which
                // set the gathered sentence as one unbroken run of letters.
                <Fragment key={word.t + i}>
                  <span
                    className="wa-w"
                    style={
                      {
                        '--wa-i': i,
                        '--wa-x': word.x,
                        '--wa-y': word.y,
                        '--wa-r': word.r,
                        '--wa-s': word.s,
                      } as CSSProperties
                    }
                  >
                    {word.accent ? <em>{word.t}</em> : word.t}
                  </span>
                  {i < sentence.length - 1 ? ' ' : ''}
                </Fragment>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* 4 · TRUST. The boundaries. Being honest about scope is part of the
          product, so the negations get the same typographic weight as the
          claims, and the affirmative is the last thing standing. */}
      <section className="wa-act" data-sc-act="flow" aria-label="What Warsh is not">
        <div className="wa-wrap">
          <ul className="wa-nots">
            {boundaries.map((item) => (
              <li key={item.text}>
                <p className="wa-not">{item.text}</p>
              </li>
            ))}
          </ul>

          <h2 className="wa-line" style={{ marginTop: 'clamp(2rem, 4vw, 3.5rem)' }}>
            It teaches the Arabic itself.
          </h2>

          <p className="wa-small">
            One word and one pattern at a time, across 72 chapters, and the first thing it teaches
            you to understand is Al-Fatiha, because that is the passage you already recite every
            day. Ustaad Noor is built to teach Arabic and not to issue religious rulings, so
            questions of fiqh are redirected to qualified scholars every time. How the chapters
            and the four skills are put together is set out on the{' '}
            <Link href="/features">features page</Link>, and what any of it costs is on the{' '}
            <Link href="/pricing">pricing page</Link>.
          </p>
        </div>
      </section>

      {/* 4b · THE RECORD. Plain prose, deliberately unstyled next to the poster
          above it, because this is the part a reader checks rather than reads:
          who we are, what we do, where we are, and what is actually true about
          the product. The acts above make the argument; this section is the
          evidence, and mixing the two would weaken both. */}
      <section className="wa-act" data-sc-act="flow" aria-labelledby="about-record">
        <div className="wa-wrap">
          <h2 id="about-record" className="wa-line" style={{ marginBottom: '0.6em' }}>
            The record.
          </h2>

          <div className="wa-record">
            <div>
              <h3>Our story</h3>
              <p>
                Warsh began with one gap: a billion people recite the Quran in Salah, and most
                cannot say, word for word, what they are saying. Existing options asked for years
                of study or taught vocabulary that never reached an ayah. Warsh was built to close
                that specific gap in a few focused minutes a day.
              </p>
            </div>

            <div>
              <h3>Who we are</h3>
              <p>
                A small independent team based in {ADDRESS.display}, building for Pakistan and the
                wider South Asian and global Muslim diaspora first &mdash; communities where Salah
                is daily practice and formal Arabic education is often out of reach. Warsh is not
                backed by, endorsed by, or affiliated with any institution.
              </p>
            </div>

            <div>
              <h3>What we do</h3>
              <p>
                We teach the Arabic of the Quran across a 72-chapter course, beginning with
                Al-Fatiha. Alongside the lessons: a Vocabulary Bank of 600+ words with audio and
                spaced repetition, Tadabbur for reading real ayat word by word, and Ustaad Noor, an
                AI tutor that answers Arabic questions and refers religious rulings to qualified
                scholars.
              </p>
            </div>

            <div>
              <h3>What you can rely on</h3>
              <p>
                The Vocabulary Bank is free permanently, including after a subscription ends. Every
                account starts with 7 days of full access. Warsh runs on Android 8 and later, and
                is publicly available on Google Play. How our lessons are written and reviewed, and
                the limits we hold ourselves to, are set out in our{' '}
                <Link href="/editorial-guidelines">editorial guidelines</Link>.
              </p>
            </div>
          </div>

          <p className="wa-small" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            Questions, corrections, or press: see the <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </section>

      {/* 5 · RESOLVE. The page inverts. The smallest type on the site, one
          continuous line of running text, the ask as a plain underlined link
          rather than a button island. The shared site footer follows it and
          carries the site links, so the line itself stays editorial. */}
      <section className="wa-act wa-act--close" data-sc-act="flow" aria-label="Contact">
        <div className="wa-wrap">
          <p className="wa-close" data-sc-in>
            <strong>Warsh</strong> is made in Pakistan, with Pakistan and the wider South Asian and
            global Muslim diaspora in mind first: communities where Salah is daily practice and
            formal Arabic education is often out of reach. Curriculum review is an ongoing process
            rather than a one-time claim, and Warsh is careful not to overstate what a lesson or a
            tutor can certify. If something in a lesson felt wrong, write to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>; we read every email. The app is
            free to download,{' '}
            <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
              on Google Play
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
