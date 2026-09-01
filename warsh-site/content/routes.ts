/**
 * Every public route on warsh.app, in one place.
 *
 * `app/sitemap.ts` (the XML crawlers read) and `app/sitemap/page.tsx` (the HTML
 * page people read) are both generated from this list, so the two cannot drift
 * apart — which is the failure mode that makes an HTML sitemap worse than none,
 * because it quietly advertises pages that no longer exist.
 *
 * `lastModified` is the date the page's own content last changed, not the date
 * of the deploy: bumping every entry on every release trains crawlers to ignore
 * the field. Update an entry only when that page's copy actually changes.
 */
export type RouteGroup = 'Product' | 'Company' | 'Legal & help';

export type SiteRoute = {
  path: string;
  label: string;
  blurb: string;
  group: RouteGroup;
  lastModified: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
};

const CONTENT_UPDATED = '2026-09-01T00:00:00.000Z';
const SITE_UPDATED = '2026-08-25T00:00:00.000Z';
const LEGAL_UPDATED = '2026-07-20T00:00:00.000Z';

export const SITE_ROUTES: readonly SiteRoute[] = [
  { path: '/', label: 'Home', blurb: 'Understand the Arabic of the Quran',
    group: 'Product', lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority: 1 },
  { path: '/features', label: 'Features', blurb: 'The 72-chapter course and the four skills',
    group: 'Product', lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
  { path: '/pricing', label: 'Pricing', blurb: 'What Warsh costs, and what stays free',
    group: 'Product', lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },

  { path: '/about', label: 'About', blurb: 'Why Warsh exists, and what it does not claim to be',
    group: 'Company', lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', label: 'Contact', blurb: 'Support, content corrections, account and data',
    group: 'Company', lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog', label: 'Blog', blurb: 'Notes on Quranic Arabic and how the curriculum is built',
    group: 'Company', lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority: 0.6 },

  { path: '/help', label: 'Help & FAQ', blurb: 'Answers on billing, accounts, and learning',
    group: 'Legal & help', lastModified: LEGAL_UPDATED, changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', label: 'Privacy policy', blurb: 'What we store, and why',
    group: 'Legal & help', lastModified: LEGAL_UPDATED, changeFrequency: 'monthly', priority: 0.3 },
  { path: '/terms', label: 'Terms of service', blurb: 'The agreement you accept by using Warsh',
    group: 'Legal & help', lastModified: LEGAL_UPDATED, changeFrequency: 'monthly', priority: 0.3 },
  { path: '/delete-account', label: 'Delete account', blurb: 'How to remove your account and data',
    group: 'Legal & help', lastModified: LEGAL_UPDATED, changeFrequency: 'monthly', priority: 0.3 },
  { path: '/sitemap', label: 'Sitemap', blurb: 'This page',
    group: 'Legal & help', lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.2 },
] as const;

/**
 * Destinations worth listing for a reader but not for the XML sitemap: the feed
 * is a format crawlers find through <link rel="alternate">, and the web app is a
 * different origin that warsh.app has no authority to declare canonical URLs for.
 */
export const OFF_SITEMAP_LINKS: readonly {
  href: string;
  label: string;
  blurb: string;
  group: RouteGroup;
}[] = [
  { href: 'https://app.warsh.app', label: 'Open Warsh on the web', blurb: 'app.warsh.app',
    group: 'Product' },
  { href: '/blog/rss.xml', label: 'RSS feed', blurb: 'Subscribe to new posts',
    group: 'Company' },
] as const;

export const ROUTE_GROUPS: readonly RouteGroup[] = ['Product', 'Company', 'Legal & help'] as const;
