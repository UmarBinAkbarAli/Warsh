import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import '../scrollcraft-theme.css';
import './about.css';
import { AboutMotion } from './AboutMotion';
import {
  ADDRESS,
  PHONE,
  PLAY_STORE_URL,
  SITE_URL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  TEAM,
} from '@/content/site';

export const metadata: Metadata = {
  title: 'About Warsh — Why We Teach Fusha Through the Quran',
  description:
    'Warsh begins with a familiar gap—reciting the Quran without understanding—and turns that beginning into a wider journey through Fusha Arabic.',
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
  { t: 'Understand', x: '20vw', y: '-11vh', r: '6deg', s: 1.3, accent: true },
  { t: 'them,', x: '-16vw', y: '27vh', r: '-4deg', s: 0.6 },
  { t: 'then', x: '13vw', y: '-19vh', r: '7deg', s: 0.9 },
  { t: 'carry', x: '-21vw', y: '14vh', r: '-8deg', s: 0.8 },
  { t: 'the', x: '3vw', y: '-28vh', r: '3deg', s: 0.7 },
  { t: 'language', x: '17vw', y: '21vh', r: '-5deg', s: 1.5, accent: true },
  { t: 'further.', x: '-8vw', y: '18vh', r: '4deg', s: 1.1, accent: true },
];

const boundaries = [
  { text: 'Not a memorisation or recitation course.', at: '0.10 0.34' },
  { text: 'Not a Quran translation reader.', at: '0.18 0.42' },
  { text: 'Not a regional dialect course.', at: '0.26 0.50' },
  { text: 'Not a madrasah, certification, or replacement for a qualified teacher.', at: '0.34 0.58' },
];

/**
 * `AboutPage`, tied by `@id` to the Organization declared once in the root
 * layout rather than restating it — one entity described in two places is how a
 * crawler ends up believing in two entities. The `sameAs` array repeats here on
 * purpose: this is the page a reader (or an answer engine) lands on asking who
 * is behind Warsh, and the profiles that answer it should be machine-readable
 * from this URL and not only from the homepage.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/about#page`,
  url: `${SITE_URL}/about`,
  name: 'About Warsh',
  description:
    'Why Warsh teaches Quran-first Fusha, who builds it, and the things it deliberately does not claim to be.',
  mainEntity: {
    '@id': `${SITE_URL}/#organization`,
    '@type': 'Organization',
    name: 'Warsh',
    founder: TEAM.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
    })),
    email: SUPPORT_EMAIL,
    telephone: PHONE.tel,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.countryCode,
    },
    sameAs: [PLAY_STORE_URL, ...SOCIAL_LINKS.map((link) => link.href)],
  },
};

export default function AboutPage() {
  return (
    <div id="warsh-about">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
              The Quran is the beginning.
            </h1>

            <p className="wa-hero__body" data-sc-cue="0 1 0 0.08">
              Warsh began with a familiar experience: Muslims recite Arabic every day, yet many
              cannot understand the words directly. Closing that gap is our first responsibility.
              Building a wider foundation in Fusha is where the journey continues.
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
            <h2 className="wa-line wa-line--soft">A Quran app that stops at translation.</h2>
          </div>

          <div className="wa-trail">
            <p className="wa-line wa-line--soft">
              Or an Arabic course that ignores the language you already know.
            </p>
          </div>

          <p className="wa-small">
            Warsh takes a different path. It begins with familiar Quranic Arabic, teaches the
            vocabulary and grammar underneath it, and develops those foundations toward wider
            Fusha understanding and expression.
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
            It teaches Fusha from its strongest foundation.
          </h2>

          <p className="wa-small">
            Warsh begins with Al-Fatiha because it is already part of the learner&rsquo;s life. From
            there, 72 chapters develop vocabulary, roots, sentence structures, listening, and
            speaking. The Quran gives the journey its foundation; wider Fusha gives that foundation
            room to grow. Ustaad Noor supports Arabic learning and redirects questions of fiqh to
            qualified scholars. See how the chapters and four skills work on the{' '}
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
                Warsh began with a simple observation: many Muslims have spent years reciting Arabic
                without being given an accessible path into understanding it. The answer was not
                another translation reader or a collection of disconnected videos, but a structured
                language journey beginning with words learners already recognize.
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
                We teach Quran-first Fusha through a 72-chapter course beginning with Al-Fatiha.
                The current curriculum is strongest in Quranic and Classical Arabic foundations,
                supported by a Vocabulary Bank, spaced review, Tadabbur, speaking practice, and
                Ustaad Noor. Contemporary formal Arabic requires additional vocabulary and exposure,
                and we do not claim otherwise.
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

          {/* The trust statement, stated as such and in one place.

              A reader deciding whether to believe an app that teaches the
              Arabic of the Quran is not served by an adjective; they are served
              by facts they can go and check, and by the claims we refuse to
              make. So every sentence here is either verifiable off-site (a
              named person, a published listing, a working address) or is a
              limit we hold ourselves to. Nothing here asserts authority. */}
          <div className="wa-trust">
            <h3>Why you can trust Warsh</h3>
            <p>
              Every claim on this page is checkable, and we would rather you checked. Warsh is
              published by a named person &mdash; {TEAM[0].name}, {TEAM[0].role}, working from{' '}
              {ADDRESS.display} &mdash; not an anonymous storefront, and both{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and{' '}
              <a href={`tel:${PHONE.tel}`}>{PHONE.display}</a> reach him. The app is listed
              publicly on{' '}
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                Google Play
              </a>{' '}
              as com.warsh.app, where its rating, its reviews and its update history are published
              by Google rather than by us.
            </p>
            <p>
              What we decline to claim matters as much. Warsh awards no certification, is not
              backed by or affiliated with any institution, and does not present its founder as a
              scholar of Arabic or of the Quran; Ustaad Noor refers every question of fiqh to a
              qualified scholar instead of answering it. How lessons are written, reviewed and
              corrected is written down in our{' '}
              <Link href="/editorial-guidelines">editorial guidelines</Link>, what we do with your
              data is in the <Link href="/privacy">privacy policy</Link>, and the person behind all
              of it is named on the <Link href="/team">team page</Link>. If a lesson is wrong, tell
              us and it reaches him directly.
            </p>
          </div>

          {/* Where else Warsh exists.

              A trust claim a reader cannot leave the page to verify is worth
              little, so this is the exit: the store listing and every profile
              Warsh actually runs, each one live and confirmed. The list is
              generated from SOCIAL_LINKS so it can never drift from the footer
              or from the `sameAs` array above it. */}
          <div className="wa-elsewhere">
            <h3>Warsh elsewhere on the web</h3>
            <p>
              These are the official Warsh presences, and the fastest way to see what we publish
              and how we answer people. Anything using our name that is not linked here is not
              ours.
            </p>
            <ul>
              <li>
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                  Warsh on Google Play
                </a>
              </li>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    Warsh on {link.label}
                  </a>
                </li>
              ))}
            </ul>
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
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              on Google Play
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
