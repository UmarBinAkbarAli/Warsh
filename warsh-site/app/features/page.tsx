import type { Metadata } from 'next';
import Link from 'next/link';
import '../scrollcraft-theme.css';
import './features.css';
import { FeaturesMotion } from './FeaturesMotion';
import { PLAY_STORE_URL, WEB_APP_URL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Features — How Warsh Teaches Quranic Arabic',
  description:
    'A 72-chapter curriculum, speaking practice, a free-forever Vocabulary Bank with spaced review, Ustaad Noor, Tadabbur, and a full Urdu interface. What Warsh actually gives you.',
  alternates: { canonical: '/features' },
};

/**
 * Gallery / catalog (scrollcraft grammar 2.6), deliberately a different grammar
 * from the homepage: two pages in one grammar feel related no matter how far
 * apart their palettes are, and that is the re-skin this avoids.
 *
 * The visitor's real question on this page is "what do I actually get", not
 * "should I believe you", which is the question the homepage answers. So the
 * page is a collection of objects rather than an argument, `pan` is its spine
 * rather than one act among many, and every object carries the SAME label
 * schema. Labels state fact, never pitch.
 *
 * Every claim below is drawn from Docs/warsh-product-spec.md. The `not` row is
 * as load-bearing as the rest: it is the product's own honesty principle, and
 * it keeps the schema from drifting into a feature list.
 */

type CatalogObject = {
  name: string;
  ar: string;
  what: string;
  access: string;
  where: string;
  detail: string;
  not: string;
};

const objects: CatalogObject[] = [
  {
    name: 'Curriculum',
    ar: 'مَنْهَج',
    what: 'Seventy-two chapters in order, each one built on the chapter before it.',
    access: 'Subscription',
    where: 'Learn tab',
    detail: 'Begins with Al-Fatiha and the final surahs of Juz Amma',
    not: 'Not a dialect course.',
  },
  {
    name: 'Speaking practice',
    ar: 'نُطْق',
    what: 'Listen to a recitation, record yourself, compare the two, and try again.',
    access: 'Subscription',
    where: 'Inside lessons',
    detail: 'Recordings stay on your device and are never uploaded',
    not: 'No automated pronunciation scoring.',
  },
  {
    name: 'Vocabulary Bank',
    ar: 'مُفْرَدَات',
    what: 'A searchable library of Quranic words, each with audio and a clear meaning.',
    access: 'Free forever',
    where: 'Vocabulary tab',
    detail: 'Arabic, transliteration, English and Urdu, root, and a Quranic example',
    not: 'No image-only flashcards.',
  },
  {
    name: 'Spaced review',
    ar: 'مُرَاجَعَة',
    what: 'Saved words come back for review shortly before you would have forgotten them.',
    access: 'Free forever',
    where: 'Vocabulary tab',
    detail: 'An SM-2 review model with Hard, Good and Easy',
    not: 'Hidden words stay out of the queue.',
  },
  {
    name: 'Ustaad Noor',
    ar: 'أُسْتَاذ نُور',
    what: 'An AI tutor that answers questions about a word, a root, or why a sentence is built the way it is.',
    access: 'Five messages a day, free',
    where: 'Noor tab',
    detail: 'Packs of twenty further messages are available',
    not: 'No rulings on Islamic law, and no memory between sessions.',
  },
  {
    name: 'Tadabbur',
    ar: 'تَدَبُّر',
    what: 'A guided path to recognizing every word and structure in a surah you already recite.',
    access: 'Subscription',
    where: 'Learn tab',
    detail: 'Unlocks follow the vocabulary and grammar you have learned',
    not: 'Not a tafsir authority.',
  },
  {
    name: 'Streaks',
    ar: 'مُثَابَرَة',
    what: 'A daily goal, and milestones that mark progress you actually made.',
    access: 'Included',
    where: 'You tab',
    detail: 'Missed days restart gently, and freezes are explained plainly',
    not: 'No leaderboards, and no public profiles.',
  },
  {
    name: 'Urdu interface',
    ar: 'اُردُو',
    what: 'The entire app in Urdu or in English, switchable whenever you like.',
    access: 'Included',
    where: 'Settings',
    detail: 'The Arabic learning content is identical in both',
    not: 'Not a translation of the Quran.',
  },
];

export default function FeaturesPage() {
  return (
    <div id="warsh-features">
      <FeaturesMotion />

      {/* The nav for this grammar: an index of objects that jumps. It resolves
          into lateral space, which is what makes it this page's signature move
          rather than a list of anchors. */}
      <nav aria-label="Index of features">
        <ul className="wf-index">
          {objects.map((object, i) => (
            <li key={object.name}>
              <button type="button" className="wf-index__btn" data-warsh-jump={i + 1}>
                <span className="wf-index__n">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {object.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="wf-act" data-sc-act="pan" data-sc-span="10" aria-labelledby="catalog-title">
        <div data-sc-stage className="wf-stage">
          {/* data-sc-pan is what marks this element as the pan target: the
              engine does `querySelector('[data-sc-pan]')` inside the act, and
              without it the rail never translates and the act holds one still
              frame for its whole span. 0 overshoot, so the closing plate lands
              flush at the right edge rather than drifting past it. */}
          <div className="wf-rail" data-warsh-rail data-sc-pan="0">
            {/* The opening plate is the first object in the rail rather than a
                title stage above it: this grammar starts the collection at the
                top of the page. It also gives the rail the width its travel
                needs. */}
            <div
              className="wf-item wf-item--plate"
              data-warsh-object
              style={{ ['--wf-i' as string]: 0 }}
            >
              <div>
                <h1 id="catalog-title" className="wf-plate__title">
                  What Warsh actually gives you.
                </h1>
                <p className="wf-plate__body">
                  Eight things, each listed with what it costs, where it lives, and what it does
                  not do. The four skills the curriculum is built around are set out{' '}
                  <Link className="wf-link" href="/">
                    on the home page
                  </Link>
                  .
                </p>
              </div>
            </div>

            {objects.map((object, i) => (
              <article
                className="wf-item"
                key={object.name}
                data-warsh-object
                style={{ ['--wf-i' as string]: i + 1 }}
              >
                <div className="wf-label">
                  <p className="wf-label__cat">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="wf-label__name">
                    {object.name}{' '}
                    <span className="wf-label__ar">{object.ar}</span>
                  </h2>
                  <p className="wf-label__what">{object.what}</p>

                  <dl className="wf-specs">
                    <dt>Access</dt>
                    <dd>{object.access}</dd>
                    <dt>Where</dt>
                    <dd>{object.where}</dd>
                    <dt>Detail</dt>
                    <dd>{object.detail}</dd>
                    <dt className="wf-not">Not</dt>
                    <dd className="wf-not">{object.not}</dd>
                  </dl>
                </div>
              </article>
            ))}

            {/* The close is an inquiry plate typeset exactly like a label, so
                the ask reads as part of the collection rather than as an advert
                bolted onto the end. */}
            <div
              className="wf-item wf-item--plate wf-item--close"
              data-warsh-object
              style={{ ['--wf-i' as string]: objects.length + 1 }}
            >
              <div className="wf-label">
                <p className="wf-label__cat">Warsh</p>
                <h2 className="wf-label__name">
                  All eight, in one app.{' '}
                  <span className="wf-label__ar">وَرْش</span>
                </h2>
                <p className="wf-label__what">
                  Free to download, and publicly available on Google Play.
                </p>

                <dl className="wf-specs">
                  <dt>Access</dt>
                  <dd>A 7-day free trial of everything</dd>
                  <dt>Price</dt>
                  <dd>About $1 a month, or about $10 a year</dd>
                  <dt>Where</dt>
                  <dd>Google Play, and the web</dd>
                  <dt className="wf-not">Not</dt>
                  <dd className="wf-not">No ads, ever.</dd>
                </dl>

                <div className="wf-label__foot">
                  <a className="wf-link" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                    Download on Google Play
                  </a>
                </div>
                <div className="wf-label__foot" style={{ paddingTop: '0.75rem' }}>
                  <a className="wf-link" href={WEB_APP_URL} target="_blank" rel="noreferrer">
                    Open Warsh on the web
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
