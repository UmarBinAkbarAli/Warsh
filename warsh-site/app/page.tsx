import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './scrollcraft-theme.css';
import './home.css';
import { HomeMotion } from './components/HomeMotion';
import { SiteFooter } from './components/SiteFooter';
import { buildFaqJsonLd } from './components/faq-content';
import { HOME_FAQ_SECTIONS } from '@/content/faq';
import { PLAY_STORE_URL, SITE_URL } from '@/content/site';

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
  { id: 'questions', label: 'Questions', ground: 'paper' },
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

/**
 * FAQPage structured data for the questions chapter below. Built from
 * `HOME_FAQ_SECTIONS` rather than restated here, and the chapter renders every
 * answer as visible prose, so the markup describes text a reader can actually
 * read on the page — the condition Google attaches to FAQPage.
 */
const faqJsonLd = buildFaqJsonLd(HOME_FAQ_SECTIONS, `${SITE_URL}/#faq`);

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
                <a className="wh-link" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
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
                {/*
                 * Pre-sized to 2x the largest slot this plate ever occupies
                 * (21rem on desktop, 70vw on a phone) and served straight from
                 * /images rather than through the optimizer. Two reasons: the
                 * master PNG is 1.8 MB where 47 KB of WebP is indistinguishable
                 * here, and an optimizer URL carries its width in a query
                 * string that anything reading the raw HTML has to entity-decode
                 * first — crawlers that skip that step request a `w`-less URL
                 * and record the image as broken.
                 */}
                <Image
                  className="wh-plate__img"
                  src="/images/app-onboarding-672.webp"
                  alt="The Warsh app open on its welcome screen, showing a lesson card and a recitation waveform."
                  width={672}
                  height={1378}
                  priority
                  unoptimized
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
          Questions. The last chapter before the colophon answers what a reader
          who has come this far is still holding back on. Set as a document, not
          an accordion: every answer is visible prose under a hairline, in the
          ch4 idiom, which is also what lets the FAQPage markup above be honest.
          The questions arrive from the right, the page's signature move. */}
      <section
        id="faq"
        className="wh-ch wh-ch--paper-light"
        data-sc-act="flow"
        data-warsh-chapter="questions"
        data-warsh-ground="paper"
        aria-labelledby="faq-title"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="wh-spread">
          <div data-sc-in>
            <p className="wh-eyebrow">Before you start</p>
            <h2 id="faq-title" className="wh-h" style={{ maxWidth: '16ch' }}>
              The questions people ask first.
            </h2>
          </div>

          <div className="wh-faq">
            {HOME_FAQ_SECTIONS[0].items.map((item, i) => (
              <div
                className="wh-faq__item"
                key={item.q}
                data-warsh-rtl-item
                data-warsh-delay={i * 80}
              >
                <h3 className="wh-faq__q">{item.q}</h3>
                <p className="wh-faq__a">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="wh-actions">
            <Link className="wh-link" href="/help">
              Read the full help centre
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 7 --
          The colophon. Smallest type on the site, the ask set as a line of
          running text rather than a button island. It is the shared site
          footer, rendered here rather than from the layout so it sits inside
          the engine's root and still takes the chapter ground and the
          entrance. */}
      <SiteFooter reveal />
    </div>
  );
}
