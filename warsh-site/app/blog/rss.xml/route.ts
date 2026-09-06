import { getBlogPosts } from '@/content/blog';
import { SITE_URL } from '@/content/site';

/**
 * RSS 2.0 feed for the blog.
 *
 * Posts are authored in Warsh Studio and reach the site over the public blog
 * API, so the feed is generated from the same `getBlogPosts()` call the index
 * uses and cannot drift from what the site actually shows. Revalidated on the
 * same cadence as that fetch rather than rebuilt per request.
 *
 * Bodies are deliberately not inlined. `post.body` is Studio-authored HTML, and
 * a feed reader renders whatever it is handed with none of the site's CSP in
 * front of it; the excerpt plus a link keeps the trust boundary where the rest
 * of the site already puts it.
 */
export const revalidate = 60;

const FEED_TITLE = 'Warsh — Notes on Quran-First Fusha';
const FEED_DESCRIPTION =
  'Practical pieces on Quranic and Classical Arabic, wider Fusha foundations, and how Warsh’s curriculum is built.';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getBlogPosts();

  // A feed reader sorts on pubDate, so send it newest-first and never trust the
  // API's incidental ordering.
  const ordered = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const lastBuildDate = (ordered[0] ? new Date(ordered[0].date) : new Date()).toUTCString();

  const items = ordered
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        post.author ? `      <dc:creator>${escapeXml(post.author)}</dc:creator>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600',
    },
  });
}
