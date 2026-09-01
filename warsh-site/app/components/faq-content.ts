/**
 * FAQ shape and the plain-text accessor, kept out of `Faq.tsx` because that file
 * is `'use client'` and a server component may not call a function exported from
 * a client module — only render it. The schema builder on the help page runs on
 * the server, so both sides import from here instead.
 */

export type FaqItem = {
  q: string;
  a: React.ReactNode;
  /**
   * Plain-text form of the answer, for FAQPage structured data.
   *
   * Required only where `a` is JSX: rich answers carry mailto links and typographic
   * entities that cannot be read back out of a React node without rendering it, and
   * Google wants the answer as text either way. Where `a` is already a string it is
   * used as-is, so this stays undefined for most items.
   */
  plain?: string;
};

export type FaqSection = {
  label: string;
  items: FaqItem[];
};

/**
 * The answer text a crawler should see, mirroring what a reader sees.
 *
 * Throwing on a missing `plain` would take the whole page down over a metadata
 * gap, so a JSX answer with no plain form is simply left out of the schema —
 * the rendered FAQ is unaffected, and the structured data stays truthful about
 * the answers it does carry.
 */
export function faqPlainAnswer(item: FaqItem): string | null {
  if (typeof item.a === 'string') return item.a;
  return item.plain ?? null;
}
