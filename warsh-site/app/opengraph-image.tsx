import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The default social card for every route that does not author its own.
 *
 * The site declared `og:type`, `og:title` and `twitter:card: summary_large_image`
 * but shipped no image at all, so every share on WhatsApp, X, Slack and iMessage
 * rendered as a bare text row — the single most visible SEO gap on the site, and
 * one no audit rule flagged.
 *
 * Generated rather than committed as a PNG so the wordmark, palette and claim
 * stay tied to the same tokens the site uses; a static asset would drift the
 * first time any of them changed. Latin type only: satori does not shape Arabic,
 * so `وَرْش` would render as disjoint unshaped glyphs here, and the Arabic
 * wordmark is deliberately left to the pages themselves.
 */
export const alt = 'Warsh — Understand the Arabic of the Quran';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#071B44';
const PARCHMENT = '#FAF6E9';
const GOLD = '#C49B4D';
const CREAM = '#EDDFAF';

export default async function OpengraphImage() {
  // assets/fonts, not public/fonts: these are the unsubsetted TTF masters, kept
  // out of the served tree so a 3.5 MB font nobody requests is not deployed
  // alongside the WOFF2 the browser actually loads. Still TTF because satori
  // parses TTF/OTF and cannot read WOFF2. next.config.js traces this directory
  // into the route's bundle.
  const [cormorant, inter] = await Promise.all([
    readFile(path.join(process.cwd(), 'assets/fonts/CormorantGaramond-SemiBold.ttf')),
    readFile(path.join(process.cwd(), 'assets/fonts/Inter-Regular.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: NAVY,
          padding: '76px 84px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 3, background: GOLD }} />
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: CREAM,
            }}
          >
            Warsh
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Cormorant',
              fontSize: 92,
              lineHeight: 1.05,
              color: PARCHMENT,
              maxWidth: 900,
            }}
          >
            Understand the Arabic of the Quran.
          </div>
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: 30,
              lineHeight: 1.4,
              color: CREAM,
              opacity: 0.75,
              marginTop: 28,
              maxWidth: 820,
            }}
          >
            A 72-chapter course, vocabulary practice, Tadabbur, and Ustaad Noor — your AI tutor.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Inter',
            fontSize: 24,
            color: GOLD,
          }}
        >
          <div style={{ display: 'flex' }}>warsh.app</div>
          <div style={{ display: 'flex' }}>Free on Google Play</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Cormorant', data: cormorant, weight: 600, style: 'normal' },
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
      ],
    },
  );
}
