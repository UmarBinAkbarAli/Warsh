import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './scrollcraft-theme.css';
import './home.css';
import { HomeMotion } from './components/HomeMotion';
import { SiteFooter } from './components/SiteFooter';
import { PLAY_STORE_URL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Understand the Arabic of the Quran',
  description:
    'A calm, structured path into Quranic Arabic. Guided lessons, vocabulary practice, Tadabbur, and Ustaad Noor, your AI tutor. Free to start on Google Play.',
  alternates: { canonical: '/' },
};

/**
 * Chaptered editorial (scrollcraft grammar 2.2). The page is a printed feature:
 * chapters are the unit, each lands on its own ground with a hard cut, and the
 * chrome is a folio in the margin rather than a fixed bar. The brief, the score
 * table and the fingerprint row live in scrollcraft/builds/warsh-home/BRIEF.md.
 */

const chapters = [
  { id: 'opening', label: 'Opening', ground: 'paper' },
  { id: 'the-gap', label: 'The gap', ground: 'paper' },
  { id: 'al-fatiha', label: 'Al-Fatiha', ground: 'ink' },
  { id: 'four-skills', label: 'Four skills', ground: 'paper' },
  { id: 'the-shape', label: 'The shape', ground: 'paper' },
  { id: 'colophon', label: 'Colophon', ground: 'ink' },
] as const;

// The Bismillah, word by word. Glosses are the plain lexical meaning, not
// tafsir: that narrower claim is the one Warsh is built to keep.
const bismillah = [
  { ar: 'بِسْمِ', gloss: 'In the name' },
  { ar: 'اللَّهِ', gloss: 'of Allah' },
  { ar: 'الرَّحْمَٰنِ', gloss: 'the Most Gracious' },
  { ar: 'الرَّحِيمِ', gloss: 'the Most Merciful' },
];

const skills = [
  {
    name: 'Read',
    ar: 'قِرَاءَة',
    body: 'Recognize the shape of Quranic Arabic on the page: root letters, word patterns, and the grammar that ties a sentence together.',
  },
  {
    name: 'Understand',
    ar: 'فَهْم',
    body: 'Know what a word or ayah means in context, without reaching for a translation first. Built word by word through guided lessons and the Vocabulary Bank.',
  },
  {
    name: 'Hear',
    ar: 'سَمْع',
    body: 'Recognize spoken Quranic Arabic at natural speed. Every word and ayah is paired with real recited audio, never a synthesized voice.',
  },
  {
    name: 'Speak',
    ar: 'نُطْق',
    body: 'Produce Quranic Arabic yourself, turning passive recognition into active recall through short guided practice.',
  },
];

const lessonShape = [
  { name: 'Hook', body: 'A short, real moment from the Quran or from daily life that sets up the lesson.' },
  { name: 'Discover', body: 'The new word, root, or pattern, introduced in the context you already recite it in.' },
  { name: 'Practice', body: 'Short, focused exercises that build recognition and then recall.' },
  { name: 'Reveal', body: 'Where this piece fits in the ayah or phrase you already know by heart.' },
  { name: 'Close', body: 'A brief review that locks in what you just learned before you leave.' },
];

export default function HomePage() {
  return (
    <div id="warsh-home">
      <HomeMotion />

      {/* The folio. Chaptered editorial takes no fixed bar: this names the
          chapter the reader is in, in the running-head idiom of a printed
          feature, and it is decorative chrome rather than navigation. */}
      <div className="wh-folio-rail" data-warsh-rail aria-hidden="true">
        {chapters.map((chapter) => (
          <span key={chapter.id} className="wh-folio" data-warsh-folio={chapter.id}>
            {chapter.label}
            <span className="wh-folio__mark" />
          </span>
        ))}
      </div>

      {/* ---------------------------------------------------------------- 1 --
          Opening. A title page: type on the paper ground, wide margins, and the
          app plate in its own column with a caption. Nothing moves but the
          entrance stagger. */}
      <section
        className="wh-ch wh-ch--paper"
        data-sc-act="flow"
        data-warsh-chapter="opening"
        data-warsh-ground="paper"
        aria-labelledby="opening-title"
      >
        <div className="wh-spread">
          <div className="wh-cols wh-cols--title">
            <div data-sc-in data-sc-stagger="70">
              <p className="wh-eyebrow">Quranic Arabic, taught with care</p>
              <h1 id="opening-title" className="wh-title">
                Where Arabic is crafted.
              </h1>
              <p className="wh-ar" style={{ fontSize: 'clamp(1.4rem, 1rem + 1.6vw, 2.2rem)', color: '#a88648', margin: '1.25rem 0 0' }}>
                حَيْثُ تُصْنَعُ الْعَرَبِيَّة
              </p>
              <p className="wh-lede" style={{ marginTop: '1.75rem' }}>
                Learn the Arabic of the Quran through structured lessons, a carefully designed
                72-chapter curriculum, and Ustaad Noor, your AI tutor, ready whenever you have a
                question.
              </p>

              <div className="wh-actions">
                <a className="wh-link" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                  Download on Google Play
                </a>
                <Link className="wh-link" href="/features">
                  See how it works
                </Link>
              </div>

              <hr className="wh-rule" style={{ margin: '2.5rem 0 1.25rem' }} />

              <ul className="wh-meta">
                <li>Free to start</li>
                <li>No ads, ever</li>
                <li>Vocabulary Bank free forever</li>
              </ul>
            </div>

            {/* Media sits in its own column with a caption and does not bleed,
                and no type is laid over it. */}
            <figure className="wh-plate" data-sc-in>
              <div className="wh-plate__frame">
                <span className="wh-plate__glow" aria-hidden="true" />
                <Image
                  className="wh-plate__img"
                  src="/images/app-onboarding.png"
                  alt="The Warsh app open on its welcome screen, showing a lesson card and a recitation waveform."
                  width={1158}
                  height={2374}
                  priority
                  sizes="(min-width: 62rem) 21rem, 70vw"
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 2 --
          The gap. The tension chapter. A real count on the left, and the column
          that should hold the meaning stays empty. The emptiness is the
          argument, so it is authored rather than accidental. */}
      <section
        className="wh-ch wh-ch--paper-deep"
        data-sc-act="flow"
        data-warsh-chapter="the-gap"
        data-warsh-ground="paper"
        aria-labelledby="gap-title"
      >
        <div className="wh-spread">
          <div className="wh-cols wh-cols--offset">
            <div data-sc-in>
              <p className="wh-ar" style={{ fontSize: 'clamp(1.5rem, 1.1rem + 1.8vw, 2.4rem)', color: '#a88648', margin: 0 }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>

            <div data-sc-in data-sc-stagger="60">
              <h2 id="gap-title" className="wh-h">
                You recite it every day. Do you understand it?
              </h2>
              <p className="wh-p" style={{ marginTop: '1.5rem' }}>
                <span className="wh-drop">O</span>ver a billion Muslims recite the Quran in Salah.
                Most of them, including most in Pakistan, South Asia, and the global diaspora, do
                not understand what they are saying, word for word. The repetition builds fluency
                in sound but not in meaning. The words become familiar the way a song&rsquo;s chorus
                becomes familiar: you can produce it perfectly and still not know what it says.
              </p>

              <div className="wh-ledger" style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
                <div className="wh-ledger__row">
                  <p className="wh-ledger__n">
                    <span data-sc-count="0 17" data-sc-count-at="0.08 0.42">
                      17
                    </span>
                  </p>
                  <p className="wh-ledger__label">
                    times you recite Al-Fatiha in the five daily prayers.
                  </p>
                  <p className="wh-ledger__blank">Meaning understood, word for word: not yet.</p>
                </div>
                <div className="wh-ledger__row">
                  <p className="wh-ledger__n">7</p>
                  <p className="wh-ledger__label">
                    ayat that open every single rakah you have ever prayed.
                  </p>
                  <p className="wh-ledger__blank">Words you could translate on your own: not yet.</p>
                </div>
              </div>

              <p className="wh-p" style={{ marginTop: '2rem' }}>
                Warsh is a structured, honest path across that gap. It does not teach tafsir and it
                is not a substitute for scholars. It teaches the Arabic itself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 3 --
          THE PEAK. Al-Fatiha decoding itself. The pinned stage holds while
          meaning arrives, word by word, right to left, under the reader's own
          hand. Largest span on the page by a visible margin, and the only dark
          chapter before the colophon, so it is also the strongest thing on the
          page when you squint at it. */}
      <section
        className="wh-ch wh-ch--ink"
        data-sc-act="pin"
        data-sc-span="3"
        data-warsh-chapter="al-fatiha"
        data-warsh-ground="ink"
        data-warsh-rtl
        aria-labelledby="fatiha-title"
      >
        <div data-sc-stage className="wh-peak" data-warsh-peak>
          <div className="wh-peak__inner">
            <span className="wh-peak__light" aria-hidden="true" />
            {/* The signature move's readout: this rail fills right to left,
                against the page's own scroll, because that is the direction
                the language is read. */}
            <p className="wh-axis" aria-hidden="true">
              <span className="wh-axis__track">
                <span className="wh-axis__fill" />
              </span>
              Read right to left
            </p>

            <h2 id="fatiha-title" className="sr-only">
              The Bismillah, word by word
            </h2>

            {/* Ground: the Arabic is present from p = 0, so the pinned stage is
                never an empty screen while it slides into view. */}
            <p className="wh-peak__line">
              {bismillah.map((word) => (
                <span key={word.ar} className="wh-word" data-warsh-word data-lit="false">
                  <span className="wh-word__ar">{word.ar}</span>
                  <span className="wh-word__gloss">
                    <span>{word.gloss}</span>
                  </span>
                </span>
              ))}
            </p>

            <span className="wh-peak__underline" aria-hidden="true" />

            <p className="wh-peak__whole" data-warsh-whole data-lit="false">
              In the name of Allah, the Most Gracious, the Most Merciful.
            </p>

            <p className="wh-peak__note">Chapter 1, ayah 1. The line every rakah opens with.</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 4 --
          Four skills. The chapter that reads like a document, which is exactly
          where it belongs. Not four equal cards: the entries are set under
          hairlines in an asymmetric spread. */}
      <section
        className="wh-ch wh-ch--paper-light"
        data-sc-act="flow"
        data-warsh-chapter="four-skills"
        data-warsh-ground="paper"
        aria-labelledby="skills-title"
      >
        <div className="wh-spread">
          <div data-sc-in>
            <h2 id="skills-title" className="wh-h" style={{ maxWidth: '18ch' }}>
              Four skills, and most methods train only one.
            </h2>
            <p className="wh-p" style={{ marginTop: '1.5rem' }}>
              Reading a translation, memorizing vocabulary lists, listening to recitation without
              decoding it: each is useful alone, and none of them alone gets you to the point where
              the Arabic makes sense as you hear it in Salah. Warsh&rsquo;s curriculum is organized
              around four skills that reinforce each other.
            </p>
          </div>

          <div className="wh-skills">
            {skills.map((skill, i) => (
              <div
                className="wh-skill"
                key={skill.name}
                data-warsh-rtl-item
                data-warsh-delay={i * 90}
              >
                <h3 className="wh-skill__name">
                  {skill.name}{' '}
                  <span className="wh-skill__ar">{skill.ar}</span>
                </h3>
                <p className="wh-p" style={{ margin: 0 }}>
                  {skill.body}
                </p>
              </div>
            ))}
          </div>

          <div className="wh-actions">
            <Link className="wh-link" href="/features">
              Explore the full curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 5 --
          The shape. How a lesson is built and what the curriculum actually
          costs, in running prose with real figures. A parallax layer inside the
          media column gives the spread depth without moving the text the reader
          is trying to read. */}
      <section
        className="wh-ch wh-ch--paper"
        data-sc-act="flow"
        data-warsh-chapter="the-shape"
        data-warsh-ground="paper"
        aria-labelledby="shape-title"
      >
        <div className="wh-spread">
          <div className="wh-cols wh-cols--argument">
            <div data-sc-in>
              <h2 id="shape-title" className="wh-h" style={{ maxWidth: '16ch' }}>
                Every lesson follows the same honest shape.
              </h2>
              <ol className="wh-shape">
                {lessonShape.map((step) => (
                  <li className="wh-step" key={step.name}>
                    <p className="wh-step__name">{step.name}</p>
                    <p className="wh-step__body">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="wh-parallax-col" data-sc-in>
              <div data-sc-parallax="0.9">
                <h3 className="wh-h wh-h--sm" style={{ maxWidth: '16ch' }}>
                  Less than a cup of chai.
                </h3>
                <p className="wh-p" style={{ marginTop: '1.25rem' }}>
                  One subscription, with a 7-day free trial of everything. The Vocabulary Bank stays
                  free forever, whether you subscribe or not.
                </p>

                <div className="wh-figures">
                  <div>
                    <p className="wh-figure__n">72</p>
                    <p className="wh-figure__label">chapters in the curriculum, built in order.</p>
                  </div>
                  <div>
                    <p className="wh-figure__n">~$1</p>
                    <p className="wh-figure__label">a month, or about $10 for a year.</p>
                  </div>
                </div>

                <div className="wh-actions">
                  <Link className="wh-link" href="/pricing">
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 6 --
          The colophon. Smallest type on the site, the ask set as a line of
          running text rather than a button island. It is the shared site
          footer, rendered here rather than from the layout so it sits inside
          the engine's root and still takes the chapter ground and the
          entrance. */}
      <SiteFooter reveal />
    </div>
  );
}
