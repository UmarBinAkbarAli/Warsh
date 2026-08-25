import { ReactNode } from 'react';
import { Container } from './Container';

export function Section({
  children,
  className = '',
  containerClassName = '',
  id,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  /**
   * Default vertical rhythm. Set false when the caller supplies its own padding —
   * the default `md:py-24` would otherwise beat any unprefixed `pt-*`/`pb-*`
   * override, since Tailwind emits responsive variants after base utilities.
   */
  padded?: boolean;
}) {
  return (
    <section id={id} className={`${padded ? 'py-16 md:py-24' : ''} ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
      {children}
    </p>
  );
}
