import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Nav } from './components/Nav';
import { FooterGate } from './components/FooterGate';
import { BackToTop } from './components/BackToTop';
import {
  ADDRESS,
  NAV_LINKS,
  PHONE,
  PLAY_STORE_URL,
  SITE_URL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
} from '@/content/site';

/*
 * These were eleven full-range TTFs, and next/font preloads every face it is
 * given: 1.86 MB of font hit the wire ahead of the hero image on every page
 * load, which is where the 11.4 s mobile LCP came from. Three things fixed it.
 *
 * WOFF2, not TTF. Same outlines, but the format brotli-preprocesses glyph data
 * rather than compressing a TTF as an opaque blob (-84% on Inter, -90% on
 * Cormorant).
 *
 * Subset to the scripts actually rendered. The originals carried Greek,
 * Cyrillic and Vietnamese for a site that writes Latin and Arabic. The
 * Scheherazade subsets keep every OpenType shaping feature the originals
 * defined (ccmp/init/medi/fina/rlig/liga/mark/mkmk) — Arabic is unshapeable
 * without them — and cover every Arabic codepoint in the source.
 *
 * Only the faces that render. A computed-style audit across all fourteen routes
 * found Cormorant used at 400/600 only and Scheherazade at 400/600 only, so
 * Cormorant-Bold and Scheherazade-Medium/Bold were dropped. Inter keeps 700:
 * `<strong>` in the legal and blog prose reaches it.
 *
 * Regenerate with scripts/build-fonts.py after changing any source .ttf.
 */
const inter = localFont({
  src: [
    { path: '../public/fonts/Inter-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Inter-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../public/fonts/Inter-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/Inter-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

// preload: false on both of these. They are `display: swap` already, so the
// first paint uses the fallback either way; preloading them only bought a
// slightly earlier swap at the cost of putting them ahead of the LCP image in
// the queue. Inter is the body face and stays preloaded.
const cormorant = localFont({
  src: [
    { path: '../public/fonts/CormorantGaramond-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/CormorantGaramond-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});

const scheherazade = localFont({
  src: [
    { path: '../public/fonts/ScheherazadeNew-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/ScheherazadeNew-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-scheherazade',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  themeColor: '#071B44',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Warsh — Understand the Arabic of the Quran',
    template: '%s · Warsh',
  },
  description:
    'A calm, structured path into Quranic Arabic with guided lessons, vocabulary practice, Tadabbur, and Ustaad Noor — your AI tutor. Free to start on Google Play.',
  applicationName: 'Warsh',
  keywords: [
    'Quranic Arabic',
    'learn Quranic Arabic',
    'Arabic for Quran',
    'understand the Quran',
    'Quran Arabic app',
    'Tadabbur',
    'Islamic education app',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Warsh',
    title: 'Warsh — Understand the Arabic of the Quran',
    description:
      'Guided Quranic Arabic lessons, vocabulary practice, Tadabbur, and a focused AI tutor. Free to start.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Warsh — Understand the Arabic of the Quran',
    description:
      'Guided Quranic Arabic lessons, vocabulary practice, Tadabbur, and a focused AI tutor.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * One `@graph` rather than several stray blocks, so the nodes can reference each
 * other by `@id` and a crawler reads them as one description of one site instead
 * of three unrelated fragments.
 *
 * The `SearchAction` points at /help, which renders the search field and the
 * full help index server-side, so the URL a sitelinks searchbox sends someone to
 * is a real page whether or not its JavaScript runs.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Warsh',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/warsh-logo.png`,
        width: 1048,
        height: 712,
      },
      description:
        'Warsh teaches the Arabic of the Quran through a structured 72-chapter course, vocabulary practice, Tadabbur, and Ustaad Noor, an AI tutor.',
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
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Warsh',
      description: 'Understand the Arabic of the Quran.',
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/help?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SiteNavigationElement',
      '@id': `${SITE_URL}/#navigation`,
      name: NAV_LINKS.map((link) => link.label),
      url: NAV_LINKS.map((link) => `${SITE_URL}${link.href}`),
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${scheherazade.variable}`}
    >
      <head>
        {/*
          Feed autodiscovery is rendered here rather than declared through
          `metadata.alternates.types`, because Next replaces the whole
          `alternates` object per route instead of merging into it: every page
          here sets its own `canonical`, which silently dropped the layout's
          feed entry from all of them. Rendered into <head> it is unconditional.
        */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Warsh — Notes on Quranic Arabic"
          href="/blog/rss.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <Nav />
        <main role="main">{children}</main>
        <FooterGate />
        <BackToTop />
      </body>
    </html>
  );
}
