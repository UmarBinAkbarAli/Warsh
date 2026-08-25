import { ReactNode } from 'react';
import { Section } from './Section';

export function LegalLayout({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <Section padded={false} className="pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">{title}</h1>
        {meta && <p className="mt-2 text-sm text-deep/70">{meta}</p>}
        <div className="legal-prose mt-8 flex flex-col gap-4">{children}</div>
      </div>
    </Section>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-6 font-display text-xl font-semibold text-navy">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-deep">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-2 pl-5">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return <li className="list-disc text-sm leading-relaxed text-deep">{children}</li>;
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-semibold text-navy underline underline-offset-4">
      {children}
    </a>
  );
}
