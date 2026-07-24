import type { Metadata, Viewport } from 'next';
import { Lora, Scheherazade_New } from 'next/font/google';
import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const scheherazade = Scheherazade_New({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#071B44',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://warsh.app'),
  title: {
    default: 'Warsh — Understand the Arabic of the Quran',
    template: '%s · Warsh',
  },
  description:
    'A calm, structured path into Quranic Arabic with guided lessons, vocabulary practice, Tadabbur, and Ustaad Noor.',
  applicationName: 'Warsh',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://warsh.app',
    siteName: 'Warsh',
    title: 'Warsh — Understand the Arabic of the Quran',
    description:
      'Guided Quranic Arabic lessons, vocabulary practice, Tadabbur, and a focused AI tutor.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${scheherazade.variable}`}>
      <body>{children}</body>
    </html>
  );
}
