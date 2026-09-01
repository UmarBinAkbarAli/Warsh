import { faqPlainAnswer } from '@/app/components/faq-content';
import { getBlogPosts } from '@/content/blog';
import { FAQ_SECTIONS } from '@/content/faq';

/**
 * The search index, built on the server and handed to the client component as
 * plain data.
 *
 * Deliberately not a search service and not a prebuilt inverted index: the whole
 * corpus is a few dozen short records, so shipping it as JSON and filtering it
 * in the browser is smaller and faster than any library that could index it, and
 * it needs no network call — which matters, because the site's CSP allows
 * `connect-src` to nothing but the Warsh API.
 */
export type SearchGroup = 'Help' | 'Blog';

export type SearchItem = {
  group: SearchGroup;
  title: string;
  snippet: string;
  href: string;
};

/** Trim an answer or excerpt down to something that fits one result row. */
function toSnippet(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function buildSearchIndex(): Promise<SearchItem[]> {
  const helpItems: SearchItem[] = FAQ_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({
      group: 'Help' as const,
      title: item.q,
      // A JSX answer with no plain form still belongs in the index — the
      // question alone is what most people search for — so fall back to the
      // section label rather than dropping the row.
      snippet: toSnippet(faqPlainAnswer(item) ?? section.label),
      href: '/help',
    })),
  );

  const posts = await getBlogPosts();
  const blogItems: SearchItem[] = posts.map((post) => ({
    group: 'Blog' as const,
    title: post.title,
    snippet: toSnippet(post.excerpt),
    href: `/blog/${post.slug}`,
  }));

  return [...helpItems, ...blogItems];
}
