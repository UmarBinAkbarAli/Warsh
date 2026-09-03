'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { SearchGroup, SearchItem } from '@/content/search';

const GROUP_ORDER: SearchGroup[] = ['Help', 'Blog'];
const MAX_PER_GROUP = 5;

/**
 * Search across the help answers and the blog, on whichever of the two pages
 * you happen to be on.
 *
 * Results are grouped by source rather than merged into one ranked list. On a
 * site this small the useful question is not "which of these is most relevant"
 * but "is this a help answer or an article" — they are different kinds of
 * reading, and a flat list hides that distinction for no gain.
 */
export function SiteSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // The WebSite schema's SearchAction sends people to /help?q=..., so that URL
  // has to actually search. Read after mount from window rather than through
  // useSearchParams: the latter forces a Suspense boundary and opts the route
  // out of static rendering, for a value only the client ever needs.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQuery(initial);
  }, []);

  const trimmed = query.trim();

  const grouped = useMemo(() => {
    if (trimmed.length < 2) return null;

    const needle = trimmed.toLowerCase();
    const matches = items.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) || item.snippet.toLowerCase().includes(needle),
    );

    return GROUP_ORDER.map((group) => ({
      group,
      // A title hit is a stronger signal than a body hit, which is the only
      // ranking this corpus justifies.
      hits: matches
        .filter((item) => item.group === group)
        .sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(needle) ? 0 : 1;
          const bTitle = b.title.toLowerCase().includes(needle) ? 0 : 1;
          return aTitle - bTitle;
        })
        .slice(0, MAX_PER_GROUP),
    })).filter((entry) => entry.hits.length > 0);
  }, [items, trimmed]);

  const total = grouped?.reduce((sum, entry) => sum + entry.hits.length, 0) ?? 0;

  return (
    /*
     * A real search form around the live filter, not a bare input: `role
     * search` and a `q` field are what assistive tech and crawlers look for,
     * and submitting falls back to /help?q=... — the SearchAction URL — for
     * anyone whose JavaScript never ran.
     */
    <form role="search" action="/help" method="get" className="w-full max-w-xl">
      <label htmlFor="site-search" className="sr-only">
        Search posts and help
      </label>
      <div className="flex items-center gap-3 rounded-lg border border-navy/10 bg-white px-4 py-3">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-subtle-brown"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="site-search"
          ref={inputRef}
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
          }}
          placeholder="Search posts and help…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle-brown"
          autoComplete="off"
        />
      </div>

      {/*
        Announced politely so a screen reader hears the count change without the
        results stealing focus from the field the reader is still typing into.
      */}
      <p aria-live="polite" className="sr-only">
        {trimmed.length < 2 ? '' : `${total} result${total === 1 ? '' : 's'} for ${trimmed}`}
      </p>

      {grouped !== null && (
        <div className="mt-2.5 overflow-hidden rounded-lg border border-navy/10 bg-white">
          {total === 0 ? (
            <p className="px-4 py-4 text-sm text-subtle-brown">
              Nothing matched &ldquo;{trimmed}&rdquo;. Try a shorter word, or email{' '}
              <a
                href="mailto:support@warsh.app"
                className="font-semibold text-navy underline underline-offset-4"
              >
                support@warsh.app
              </a>
              .
            </p>
          ) : (
            grouped.map((entry) => (
              <div key={entry.group}>
                <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                  {entry.group} &middot; {entry.hits.length}
                </p>
                <ul>
                  {entry.hits.map((hit) => (
                    <li key={`${hit.group}-${hit.title}`} className="border-b border-navy/10 last:border-b-0">
                      <Link href={hit.href} className="block px-4 pb-3 pt-1.5 hover:bg-parchment-bg">
                        <span className="block text-sm font-semibold text-navy">
                          <Highlight text={hit.title} needle={trimmed} />
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-subtle-brown">
                          <Highlight text={hit.snippet} needle={trimmed} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </form>
  );
}

/**
 * Marks the matched run inside a result.
 *
 * Split on a literal index rather than a RegExp so a query containing regex
 * metacharacters (a bare `(`, say) highlights instead of throwing.
 */
function Highlight({ text, needle }: { text: string; needle: string }) {
  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[2px] bg-gold/30 text-inherit">
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  );
}
