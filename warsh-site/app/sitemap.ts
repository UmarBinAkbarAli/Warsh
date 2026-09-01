import type { MetadataRoute } from 'next';
import { getBlogPosts } from '@/content/blog';
import { SITE_ROUTES } from '@/content/routes';
import { SITE_URL } from '@/content/site';

/**
 * The XML sitemap, generated from the shared route table in `content/routes.ts`
 * so it always lists exactly what the HTML sitemap at /sitemap lists. Blog posts
 * are appended from the live Studio API rather than hard-coded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts();

  const staticPages: MetadataRoute.Sitemap = SITE_ROUTES.map((route) => ({
    // The homepage is the bare origin; every other path appends to it.
    url: route.path === '/' ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages];
}
