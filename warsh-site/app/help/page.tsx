import type { Metadata } from 'next';
import { Section } from '../components/Section';
import { Faq, type FaqSection } from '../components/Faq';
import { SUPPORT_EMAIL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description: 'Answers to common questions about subscriptions, accounts, and learning on Warsh.',
  alternates: { canonical: '/help' },
};

const sections: FaqSection[] = [
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
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">Help &amp; FAQ</h1>
        <p className="mt-3 text-base leading-relaxed text-deep">
          Find answers to common questions about Warsh below. Can&rsquo;t find what you need?
          Reach out to us directly.
        </p>

        <div className="mt-10">
          <Faq sections={sections} />
        </div>

        <div className="mt-10 rounded-lg border border-navy/10 bg-parchment-bg p-8 text-center">
          <h2 className="font-display text-lg font-semibold text-navy">Still need help?</h2>
          <p className="mt-2 text-sm leading-relaxed text-deep">
            Email us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>{' '}
            and we will get back to you as soon as possible, in sha Allah.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-block rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-cream-bg"
          >
            Email support
          </a>
        </div>
      </div>
    </Section>
  );
}
