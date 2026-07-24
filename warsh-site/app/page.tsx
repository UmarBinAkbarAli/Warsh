import styles from './page.module.css';

const pillars = [
  {
    number: '01',
    title: 'Learn in context',
    text: 'Lessons begin with meaning and use. Grammar arrives as a tool for understanding patterns you have already met.',
    detail: '72 chapters · 391 lessons',
  },
  {
    number: '02',
    title: 'Build real recall',
    text: 'A focused vocabulary bank combines Arabic script, audio, meaning, and spaced review without punitive hearts or public rankings.',
    detail: '585 vocabulary entries',
  },
  {
    number: '03',
    title: 'See the Quran connect',
    text: 'Tadabbur highlights vocabulary as it becomes familiar, helping learned words become visible inside selected surahs.',
    detail: 'Word-by-word progress',
  },
  {
    number: '04',
    title: 'Ask with confidence',
    text: 'Ustaad Noor answers focused Arabic-learning questions and redirects religious rulings to qualified scholars.',
    detail: 'Focused AI tutor',
  },
] as const;

const lessonSteps = [
  ['Listen', 'Meet the ayah and hear its rhythm before analysis.'],
  ['Discover', 'Unpack the words, meanings, and useful patterns.'],
  ['Practise', 'Use recall, matching, writing, and listening exercises.'],
  ['Recognise', 'Return to Quranic language and notice what has changed.'],
  ['Continue', 'Keep progress without shame, pressure, or noisy rewards.'],
] as const;

const faqs = [
  {
    question: 'Is Warsh publicly available on Google Play?',
    answer:
      'Warsh is currently in closed Android testing. Public Play Store access will follow only after Google grants production access and the release is ready.',
  },
  {
    question: 'Does Warsh replace a teacher or scholar?',
    answer:
      'No. Warsh supports structured Arabic learning. Ustaad Noor is not a religious authority and redirects questions about rulings to a qualified scholar.',
  },
  {
    question: 'What happens to speaking-practice recordings?',
    answer:
      'Shadow-speaking recordings remain on the learner’s device for playback and comparison. They are not uploaded for pronunciation scoring.',
  },
  {
    question: 'Which languages does the interface support?',
    answer:
      'The app supports English and Urdu interfaces. Arabic learning content remains in Arabic script in both modes.',
  },
] as const;

function StarMark({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? styles.starSmall : styles.star}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path d="M32 2 39.5 20.5 58 13l-7.5 18.5L62 40 42 42l2 20-12-16-12 16 2-20-20-2 11.5-8.5L6 13l18.5 7.5L32 2Z" />
      <circle cx="32" cy="32" r="8" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Warsh home">
          <span className={styles.brandMark}><StarMark small /></span>
          <span>Warsh</span>
          <span className={styles.brandArabic} lang="ar" dir="rtl">وَرْش</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#method">Method</a>
          <a href="#noor">Noor</a>
          <a href="#questions">Questions</a>
        </nav>

        <a className={styles.headerCta} href="https://app.warsh.app">
          Open web app
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main role="main">
      <section className={styles.hero} id="top">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroPattern} aria-hidden="true" />

        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            Closed Android beta underway
          </div>
          <p className={styles.kicker}>Quranic Arabic, taught with warmth</p>
          <h1>
            Understand what
            <span>you recite.</span>
          </h1>
          <p className={styles.heroText}>
            A calm, structured path through Quranic vocabulary, grammar, listening,
            and reflection—designed for learners who want meaning, not gamified noise.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href="https://app.warsh.app">
              Continue on the web
              <span aria-hidden="true">↗</span>
            </a>
            <a
              className={styles.secondaryCta}
              href="mailto:support@warsh.app?subject=Join%20the%20Warsh%20closed%20beta"
            >
              Request beta access
            </a>
          </div>
          <ul className={styles.trustList} aria-label="Warsh principles">
            <li>No advertising</li>
            <li>No data selling</li>
            <li>English and Urdu</li>
          </ul>
        </div>

        <div className={styles.heroVisual} aria-label="A preview of a Warsh Arabic lesson">
          <div className={styles.orbitOne} aria-hidden="true" />
          <div className={styles.orbitTwo} aria-hidden="true" />
          <div className={styles.lessonCard}>
            <div className={styles.lessonTopline}>
              <span>Lesson 03</span>
              <span>Discover</span>
            </div>
            <div className={styles.progressTrack}><span /></div>
            <p className={styles.surahLabel}>Al-Ikhlas · 112:1</p>
            <p className={styles.ayah} lang="ar" dir="rtl">
              قُلْ هُوَ ٱللَّهُ أَحَدٌ
            </p>
            <div className={styles.wordFocus}>
              <span className={styles.wordArabic} lang="ar" dir="rtl">أَحَدٌ</span>
              <span className={styles.transliteration}>aḥad</span>
              <strong>One · Unique</strong>
            </div>
            <div className={styles.audioRow}>
              <span className={styles.playButton} aria-hidden="true">▶</span>
              <span className={styles.waveform} aria-hidden="true">
                {[8, 18, 12, 27, 16, 32, 21, 11, 24, 15, 29, 10].map((height, index) => (
                  <i key={index} style={{ height }} />
                ))}
              </span>
              <span>0:04</span>
            </div>
          </div>
          <div className={styles.floatingNote}>
            <span className={styles.noteIcon}>ن</span>
            <span><strong>Noor is ready</strong><small>Ask about this lesson</small></span>
          </div>
          <div className={styles.floatingStreak}>
            <span aria-hidden="true">✦</span>
            <strong>Gentle progress</strong>
          </div>
        </div>
      </section>

      <section className={styles.promiseStrip} aria-label="Warsh approach">
        <p>Reader first</p><span>✦</span>
        <p>Grammar in context</p><span>✦</span>
        <p>Quran connection</p><span>✦</span>
        <p>Warm feedback</p>
      </section>

      <section className={styles.productSection} id="product">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>The learning system</p>
          <h2>Four ways to make Arabic familiar.</h2>
          <p>
            Warsh connects structured lessons, vocabulary, Quranic recognition, and
            focused help in one patient learning journey.
          </p>
        </div>

        <div className={styles.pillarGrid}>
          {pillars.map((pillar) => (
            <article className={styles.pillarCard} key={pillar.number}>
              <div className={styles.pillarNumber}>{pillar.number}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <span>{pillar.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.methodSection} id="method">
        <div className={styles.methodHeader}>
          <div>
            <p className={styles.sectionLabelLight}>One lesson, five movements</p>
            <h2>Meaning leads.<br />Grammar serves.</h2>
          </div>
          <p>
            Each lesson moves from listening to recognition. The aim is not to
            collect terminology—it is to notice more every time you return to Arabic.
          </p>
        </div>

        <ol className={styles.steps}>
          {lessonSteps.map(([title, text], index) => (
            <li key={title}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.noorSection} id="noor">
        <div className={styles.noorDemo}>
          <div className={styles.noorHeader}>
            <span className={styles.noorAvatar}>ن</span>
            <div><strong>Ustaad Noor</strong><small>Arabic learning assistant</small></div>
            <span className={styles.online}>Focused</span>
          </div>
          <div className={styles.chatBody}>
            <p className={styles.noorMessage}>
              <span>ن</span>
              <span>In <b lang="ar" dir="rtl">إِيَّاكَ نَعْبُدُ</b>, bringing “You alone” first creates emphasis.</span>
            </p>
            <p className={styles.userMessage}>Can you show me where I met this pattern?</p>
            <p className={styles.noorMessage}>
              <span>ن</span>
              <span>Yes. Let’s return to the example from your current lesson and compare the word order.</span>
            </p>
          </div>
          <div className={styles.chatInput}>Ask about your Arabic lesson… <span>↑</span></div>
        </div>

        <div className={styles.noorCopy}>
          <p className={styles.sectionLabel}>Ustaad Noor</p>
          <h2>A question should not stop the lesson.</h2>
          <p>
            Noor is a focused AI tutor for Arabic vocabulary, grammar, and lesson
            context. It is deliberately not a general chatbot or a source for religious rulings.
          </p>
          <ul>
            <li><span>01</span> Uses recent visible conversation context</li>
            <li><span>02</span> Stays within Arabic-learning scope</li>
            <li><span>03</span> Redirects rulings to qualified scholars</li>
          </ul>
          <p className={styles.noorDisclosure}>AI responses can make mistakes. Learners should verify important information.</p>
        </div>
      </section>

      <section className={styles.tadabburSection}>
        <div className={styles.tadabburCopy}>
          <p className={styles.sectionLabelLight}>Tadabbur · تَدَبُّر</p>
          <h2>Watch familiar words emerge.</h2>
          <p>
            As vocabulary becomes familiar, selected Quranic passages show that
            progress visually—without turning sacred text into a score or spectacle.
          </p>
          <div className={styles.legend}>
            <span><i className={styles.knownDot} /> Familiar</span>
            <span><i className={styles.learningDot} /> Still learning</span>
          </div>
        </div>
        <div className={styles.ayahPanel} lang="ar" dir="rtl">
          <div className={styles.ayahPanelTop}>
            <span>سُورَةُ الإِخْلَاص</span>
            <span dir="ltr">Growing familiarity</span>
          </div>
          <p>
            <mark>قُلْ</mark> <mark>هُوَ</mark> <mark>ٱللَّهُ</mark> أَحَدٌ<br />
            <mark>ٱللَّهُ</mark> ٱلصَّمَدُ<br />
            لَمْ يَلِدْ وَلَمْ يُولَدْ
          </p>
        </div>
      </section>

      <section className={styles.principlesSection}>
        <div className={styles.principleStatement}>
          <StarMark />
          <p className={styles.sectionLabel}>Built with restraint</p>
          <h2>A teacher’s warmth—not an attention machine.</h2>
        </div>
        <div className={styles.principleGrid}>
          <article><span>01</span><h3>No shame mechanics</h3><p>Wrong answers receive useful guidance, not lost lives or public comparison.</p></article>
          <article><span>02</span><h3>Clear privacy choices</h3><p>No ads or data selling. Voice-comparison recordings stay on the device.</p></article>
          <article><span>03</span><h3>Honest access</h3><p>A seven-day full trial, free vocabulary, and subscription pricing shown by the store.</p></article>
        </div>
      </section>

      <section className={styles.betaSection} id="beta">
        <div>
          <p className={styles.sectionLabelLight}>Android closed beta</p>
          <h2>Help Warsh become ready for learners.</h2>
          <p>
            We are testing real lessons, audio, Noor, subscriptions, accessibility,
            and account controls before requesting a public Google Play launch.
          </p>
        </div>
        <div className={styles.betaActions}>
          <a href="mailto:support@warsh.app?subject=Join%20the%20Warsh%20closed%20beta">Request an invitation</a>
          <a href="https://app.warsh.app">Use the web app <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className={styles.faqSection} id="questions">
        <div className={styles.faqIntro}>
          <p className={styles.sectionLabel}>Before you begin</p>
          <h2>Clear answers, before any commitment.</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">＋</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerBrand}>
          <a className={styles.brandDark} href="#top">
            <span className={styles.brandMark}><StarMark small /></span>
            <span>Warsh</span>
            <span lang="ar" dir="rtl">وَرْش</span>
          </a>
          <p>Understand more of the Arabic you meet in the Quran.</p>
        </div>
        <div className={styles.footerLinks}>
          <div><strong>Explore</strong><a href="#product">Product</a><a href="#method">Method</a><a href="#noor">Noor</a></div>
          <div><strong>Legal</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/delete-account">Delete account</a></div>
          <div><strong>Support</strong><a href="/help">Help &amp; FAQ</a><a href="mailto:support@warsh.app">support@warsh.app</a><a href="https://app.warsh.app">Web app</a></div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Warsh. Made with care in Pakistan.</span>
          <span>English · اردو · العربية</span>
        </div>
      </footer>
    </div>
  );
}
