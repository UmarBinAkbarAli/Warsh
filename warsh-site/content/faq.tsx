import type { FaqSection } from '@/app/components/faq-content';
import { SUPPORT_EMAIL } from '@/content/site';

/**
 * The help centre's questions and answers, the single source for both the
 * rendered accordion on /help and the FAQPage structured data it emits — and,
 * since search reaches across the site, for the search index too. Lifted out of
 * the page so /blog can index it without importing a route module.
 */
export const FAQ_SECTIONS: FaqSection[] = [
  {
    label: 'Subscriptions & Billing',
    items: [
      {
        q: 'How does the free trial work?',
        a: 'Every new account starts with 7 full days of free access to all Warsh features. Your trial begins the moment you create an account, and you may explore as much of the 72-chapter course as you can during those 7 days. Chapter progress never ends the trial early. After 7 days, you will need a paid subscription to continue accessing lessons, Noor, and Tadabbur; the Vocabulary Bank remains free.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: "You cancel directly in your device's app store settings. On Android, open Google Play Store → tap your profile icon → Payments & subscriptions → Subscriptions → Warsh → Cancel subscription. Your access continues until the end of your current billing period.",
      },
      {
        q: 'Can I get a refund?',
        a: "Refunds are handled by Google according to their policies. Please contact Google Play support directly to request a refund. We are unable to process refunds ourselves.",
      },
      {
        q: 'What happens to my Vocabulary Bank if I cancel?',
        a: 'The Vocabulary Bank stays free forever, even after your subscription ends or is cancelled. You will never lose access to the words you have already learned.',
      },
      {
        q: "I subscribed but don't have access. What do I do?",
        a: (
          <>
            First, try tapping &ldquo;Restore purchases&rdquo; on the subscription paywall
            screen in the app. If that doesn&rsquo;t work, email us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>{' '}
            with the email address registered to your account and we will investigate.
          </>
        ),
        plain:
          'First, try tapping "Restore purchases" on the subscription paywall screen in the app. If that does not work, email us at support@warsh.app with the email address registered to your account and we will investigate.',
      },
    ],
  },
  {
    label: 'Account & Access',
    items: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the Warsh login screen, tap "Forgot password?" and enter the email address registered to your account. You will receive a reset link within a few minutes. If you don\'t see it, check your spam or junk folder.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Open the Warsh app → go to the You tab → Settings → Account → Delete account. This is permanent and cannot be undone. All your personal data will be removed from our servers within 30 days.',
      },
      {
        q: 'Can I use Warsh on multiple devices?',
        a: 'Yes. As long as you log in with the same account on all your devices, your progress, streaks, and subscription sync automatically. Purchases are tied to your Google Play account and can be restored on any device signed into the same account.',
      },
    ],
  },
  {
    label: 'Learning',
    items: [
      {
        q: 'How is Warsh different from other Arabic learning apps?',
        a: "Warsh follows a structured, 72-chapter curriculum built specifically to teach classical Fus'ha Arabic — the Arabic of the Quran — rather than modern dialect or random vocabulary. Lessons are organized around the Quran itself, and Ustaad Noor, an AI tutor, knows the curriculum and can answer your questions in context.",
      },
      {
        q: 'What level of Arabic do I need to start?',
        a: 'None. Warsh is designed for complete beginners who want to learn the Arabic of the Quran from scratch. Our placement test ensures you start at the right chapter for your level.',
      },
      {
        q: 'I already know some Arabic. Is Warsh still for me?',
        a: 'Yes. Warsh includes a placement test that can place you at Chapter 4, 6, or 8 depending on what you already know. Even if you can read basic Arabic but want to understand grammar and Quranic structure, Warsh will help.',
      },
      {
        q: 'What is Ustaad Noor?',
        a: 'Ustaad Noor is our AI-powered Arabic tutor inside the app. You can ask him anything about Arabic grammar, vocabulary, or the Quranic context of a word. He knows the Warsh curriculum deeply. You get 5 free messages with him per day; additional message packs can be purchased inside the app.',
      },
      {
        q: 'Does Warsh teach speaking Arabic?',
        a: 'Yes. Warsh includes speaking practice lessons where you listen to native pronunciation and practice saying it yourself. While Warsh does not currently use speech recognition for pronunciation grading, audio playback and shadow practice help build spoken Fus\'ha fluency over time.',
      },
      {
        q: 'What is the Vocabulary Bank?',
        a: 'The Vocabulary Bank is a free feature containing 600+ Arabic words with audio pronunciation, English and Urdu translations, and Quranic examples. It uses spaced repetition (SM-2 algorithm) to help you retain words long-term. The Vocabulary Bank is free forever, even without a subscription.',
      },
      {
        q: 'What is Tadabbur?',
        a: "Tadabbur is Warsh's feature for understanding the Quran word by word. As you complete chapters, you unlock Surahs to study. Vocabulary words from your lessons light up inside real Quranic ayat, so you see exactly how each word functions in context.",
      },
    ],
  },
  {
    label: 'Technical',
    items: [
      {
        q: "The app isn't loading lessons. What do I do?",
        a: (
          <>
            First, check that you have a stable internet connection. If the problem persists, try
            closing and reopening the app. If the issue continues, email us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>{' '}
            with your device model, OS version, and the lesson you were trying to open.
          </>
        ),
        plain:
          'First, check that you have a stable internet connection. If the problem persists, try closing and reopening the app. If the issue continues, email us at support@warsh.app with your device model, OS version, and the lesson you were trying to open.',
      },
      {
        q: "The audio doesn't play. What should I do?",
        a: "Check that your device's volume is turned up and that audio permission is granted to the Warsh app. If audio still doesn't play, try closing and reopening the app. If the issue persists, contact support.",
      },
      {
        q: 'Which devices does Warsh support?',
        a: 'Warsh currently supports Android devices running Android 8 (API 26) or later. iOS support is planned for a future release.',
      },
      {
        q: 'I found an error in the content. What do I do?',
        a: (
          <>
            If you find a mistake in a lesson, vocabulary entry, or any Arabic text, please email
            us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>{' '}
            with the chapter, lesson number, and a description of the issue.
          </>
        ),
        plain:
          'If you find a mistake in a lesson, vocabulary entry, or any Arabic text, please email us at support@warsh.app with the chapter, lesson number, and a description of the issue.',
      },
    ],
  },
];

/**
 * The homepage's five questions. Deliberately a different set from
 * `FAQ_SECTIONS`: the help centre answers a reader who already has the app and
 * hit a problem, while these answer the one still deciding whether to install
 * it. Keeping them distinct also keeps the two FAQPage nodes from describing
 * the same questions at two URLs.
 *
 * Every answer here is a plain string, because the homepage renders them as
 * running prose rather than through the `Faq` accordion.
 */
export const HOME_FAQ_SECTIONS: FaqSection[] = [
  {
    label: 'Questions',
    items: [
      {
        q: 'What is Warsh?',
        a: 'Warsh is an Android app for learning the Arabic of the Quran. It holds a 72-chapter curriculum taken in order, a Vocabulary Bank of over 600 words with recited audio, Tadabbur for reading real ayat word by word, and Ustaad Noor, an AI tutor that knows the curriculum and answers questions in context.',
      },
      {
        q: 'Which Arabic does Warsh teach?',
        a: "Classical Fus'ha, the Arabic the Quran is written in, rather than a modern spoken dialect. The curriculum is organized around the Quran itself, so the vocabulary and grammar you learn are the vocabulary and grammar you already recite in Salah.",
      },
      {
        q: 'Do I need to know any Arabic to start?',
        a: 'No. Warsh is built for complete beginners, starting from the letters. If you already read some Arabic, a placement test can start you at Chapter 4, 6, or 8 instead, so you are not made to repeat what you know.',
      },
      {
        q: 'What does Warsh cost?',
        a: 'Every new account gets 7 full days of everything, free. After that one subscription covers the whole app, about $1 a month or about $10 a year, with the exact price set by Google Play for your region. The Vocabulary Bank stays free forever, subscription or not, and there are no ads.',
      },
      {
        q: 'Which devices can I use Warsh on?',
        a: 'Android 8 or later, from Google Play. Your progress, streak, and subscription sync across every device you sign in on. iOS support is planned for a future release.',
      },
    ],
  },
];
