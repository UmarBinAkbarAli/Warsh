import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Nav } from './components/Nav';
import { FooterGate } from './components/FooterGate';
import { SITE_URL } from '@/content/site';

const inter = localFont({
  src: [
    { path: '../public/fonts/Inter-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Inter-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/Inter-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Inter-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = localFont({
  src: [
    { path: '../public/fonts/CormorantGaramond-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/CormorantGaramond-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/CormorantGaramond-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
});

const scheherazade = localFont({
  src: [
    { path: '../public/fonts/ScheherazadeNew-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/ScheherazadeNew-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/ScheherazadeNew-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/ScheherazadeNew-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-scheherazade',
  display: 'swap',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Warsh',
  url: SITE_URL,
  logo: `${SITE_URL}/images/warsh-logo.png`,
  sameAs: ['https://play.google.com/store/apps/details?id=com.warsh.app'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${scheherazade.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <Nav />
        <main role="main">{children}</main>
        <FooterGate />
      </body>
    </html>
  );
}
