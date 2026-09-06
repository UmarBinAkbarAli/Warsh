import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow } from '../components/Section';
import { ADDRESS, PHONE, SITE_URL, SUPPORT_EMAIL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'How to reach Warsh: product support, content corrections, and account or data requests, with the response time to expect from each.',
  alternates: { canonical: '/contact' },
};

/**
 * ContactPage schema with the Organization's contact points.
 *
 * `contactType` values are schema.org's controlled vocabulary, not free text —
 * Google matches on them, so "customer support" and "technical support" are
 * spelled exactly as the spec has them.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${SITE_URL}/contact#page`,
  url: `${SITE_URL}/contact`,
  name: 'Contact Warsh',
  mainEntity: {
    '@id': `${SITE_URL}/#organization`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.countryCode,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SUPPORT_EMAIL,
        availableLanguage: ['English', 'Urdu'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: PHONE.tel,
        availableLanguage: ['English', 'Urdu'],
      },
    ],
  },
};

const routes = [
  {
    index: '01',
    title: 'Product support',
    body: 'Login trouble, a subscription that has not unlocked, audio that will not play, a lesson that will not load.',
    note: 'Include your account email, your device, and the chapter or lesson number.',
    sla: 'Reply within 2 working days',
  },
  {
    index: '02',
    title: 'Content corrections',
    body: 'A mistake in an Arabic word, a translation, a harakat, or something Ustaad Noor got wrong.',
    note: 'Include the chapter and lesson number, and what you believe is correct.',
    sla: 'Reviewed before the next content release',
  },
  {
    index: '03',
    title: 'Account & data',
    body: 'Deleting your account, exporting your data, or any question under our privacy policy.',
    note: 'You can also delete your account in the app: You → Settings → Account.',
    sla: 'Within 30 days, per our privacy policy',
  },
];

export default function ContactPage() {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Eyebrow>Contact</Eyebrow>
      <h1 className="font-display text-4xl font-semibold text-navy sm:text-5xl">Talk to us.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-deep">
        Warsh is a small team, and every email reaches someone who works on the product. Pick the
        route that matches what you need.
      </p>

      <h2 className="mt-16 font-display text-2xl font-semibold text-navy sm:text-3xl">
        Where to write
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {routes.map((route) => (
          <div
            key={route.index}
            className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-parchment-bg p-7"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
              {route.index}
            </span>
            <h3 className="font-display text-xl font-semibold text-navy">{route.title}</h3>
            <p className="text-sm leading-relaxed text-deep">{route.body}</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm font-semibold text-navy underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="text-sm leading-relaxed text-subtle-brown">{route.note}</p>
            <span className="mt-auto self-start rounded-md bg-navy/5 px-3 py-1.5 text-xs font-medium text-navy">
              {route.sla}
            </span>
          </div>
        ))}
      </div>

      <hr className="mt-16 border-navy/10" />

      <div className="mt-16 grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-14">
        <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">Who we are</h2>
        <div className="max-w-prose space-y-4 text-base leading-relaxed text-deep">
          <p>
            Warsh is built in Pakistan by a small team, for Pakistan and the wider South Asian and
            global Muslim diaspora first &mdash; communities where Salah is daily practice and
            formal Arabic education is often out of reach.
          </p>
          <p>
            Warsh teaches Fusha Arabic through a 72-chapter path that begins with the Quran and
            Al-Fatiha, the passage many learners already recite every day. The current curriculum
            builds Quranic and Classical Arabic foundations for wider formal reading and speaking.
            We are not a madrasah, we do not certify anyone, and Ustaad Noor redirects questions of
            fiqh to qualified scholars every time. What the course covers is set out on the{' '}
            <Link href="/features" className="font-semibold text-navy underline underline-offset-4">
              features page
            </Link>
            .
          </p>
          <p>
            Curriculum review is ongoing rather than a one-time claim. If something in a lesson felt
            wrong, tell us &mdash; we read every email.
          </p>
        </div>
      </div>

      <hr className="mt-16 border-navy/10" />

      <div className="mt-16 grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-14">
        <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">By phone</h2>
        <div className="max-w-prose space-y-4 text-base leading-relaxed text-deep">
          <p>
            <a
              href={`tel:${PHONE.tel}`}
              className="font-display text-2xl font-semibold text-navy underline underline-offset-4"
            >
              {PHONE.display}
            </a>
          </p>
          <p>
            For press and partnership enquiries. Support is email-first, because an email carries
            the account address, device and lesson number we need to actually fix something &mdash;
            a call usually ends with us asking you to send one.
          </p>
        </div>
      </div>

      <hr className="mt-16 border-navy/10" />

      <div className="mt-16 grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-14">
        <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">Where we are</h2>
        <div className="max-w-prose space-y-4 text-base leading-relaxed text-deep">
          {/*
            One text node, not three spans: see ADDRESS.full in content/site.ts.
            The parts stay machine-readable through the PostalAddress microdata
            below and the ContactPage schema above.
          */}
          <address
            className="font-display text-2xl font-semibold not-italic text-navy"
            itemScope
            itemType="https://schema.org/PostalAddress"
          >
            <meta itemProp="addressLocality" content={ADDRESS.locality} />
            <meta itemProp="addressRegion" content={ADDRESS.region} />
            <meta itemProp="addressCountry" content={ADDRESS.countryCode} />
            {ADDRESS.full}
          </address>
          <p>
            Warsh is built here. We do not keep a public walk-in office &mdash; the team is small
            and works remotely &mdash; so email and phone are the ways to reach us, and both are
            answered by the people who build the product.
          </p>
        </div>
      </div>
    </Section>
  );
}
