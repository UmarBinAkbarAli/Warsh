'use client';

import { useState } from 'react';
import type { FaqSection } from './faq-content';

export type { FaqItem, FaqSection } from './faq-content';

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
              return (
                <div key={key} className="rounded-lg border border-navy/10 bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy"
                    aria-expanded={isOpen}
                    onClick={() => setOpenKey(isOpen ? null : key)}
                  >
                    <span>{item.q}</span>
                    <span className="text-lg text-gold-deep" aria-hidden>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm leading-relaxed text-deep">{item.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
