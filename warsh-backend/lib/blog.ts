// Helpers shared by the admin blog routes and the public /api/blog routes.
// `body` is HTML authored by the Tiptap editor in Warsh Studio — see
// lib/blogSanitize.ts for the write/read sanitization boundary.
import { sanitizeBlogHtml } from "./blogSanitize";

export { estimateReadingMinutesFromHtml as estimateReadingMinutes } from "./blogSanitize";

// URL-safe slug from a title. Kept deliberately simple (ASCII only) because a
// blog slug is a permanent public URL — anything exotic is better rejected than
// silently transliterated.
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// Shape returned to warsh-site. Mirrors the fields the site's BlogPost type
// already expects (date + human reading time) so the page components only need
// their data source swapped, not their markup.
export function toPublicPost(post: {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  authorName: string;
  readingMinutes: number;
  publishedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    // Sanitize again on the way out — a second, cheap pass at the trust
    // boundary in case a stored value predates a stricter allowlist.
    body: sanitizeBlogHtml(post.body),
    coverImageUrl: post.coverImageUrl,
    author: post.authorName,
    date: (post.publishedAt ?? post.updatedAt).toISOString(),
    readingTime: `${post.readingMinutes} min read`,
    readingMinutes: post.readingMinutes,
  };
}
