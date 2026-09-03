'use client';

import { useState } from 'react';
import type { FaqSection } from './faq-content';

export type { FaqItem, FaqSection } from './faq-content';

/**
 * A stable DOM id for the panel a question controls. Derived from the question
 * text rather than an index so the id survives reordering, and so server and
 * client render the same string.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function Faq({ sections }: { sections: FaqSection[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep">
            {section.label}
          </p>
          <div className="flex flex-col gap-2">
            {section.items.map((item) => {
              const key = `${section.label}-${item.q}`;
              const isOpen = openKey === key;
              const panelId = `faq-panel-${slugify(key)}`;
              return (
                <div key={key} className="rounded-lg border border-navy/10 bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenKey(isOpen ? null : key)}
                  >
                    <span>{item.q}</span>
                    <span className="text-lg text-gold-deep" aria-hidden>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {/*
                    Rendered always and hidden with the `hidden` attribute rather
                    than swapped in on state. The answers are what the FAQPage
                    structured data promises a crawler, and `{isOpen && ...}`
                    kept every one of them out of the server-rendered HTML until
                    a click — so the markup described text that was not on the
                    page. `hidden` keeps it in the document and out of the
                    accessibility tree, which is what a collapsed panel wants
                    anyway.
                  */}
                  <div
                    id={panelId}
                    hidden={!isOpen}
                    className="px-5 pb-4 text-sm leading-relaxed text-deep"
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
