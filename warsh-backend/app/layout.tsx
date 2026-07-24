import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
