import type { MetadataRoute } from 'next';
import { getBlogPosts } from '@/content/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts();
  const siteModified = new Date('2026-08-25T00:00:00.000Z');
  const legalModified = new Date('2026-07-20T00:00:00.000Z');

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://warsh.app', lastModified: siteModified, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://warsh.app/features', lastModified: siteModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://warsh.app/pricing', lastModified: siteModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://warsh.app/about', lastModified: siteModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://warsh.app/blog', lastModified: siteModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: 'https://warsh.app/privacy', lastModified: legalModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://warsh.app/terms', lastModified: legalModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://warsh.app/delete-account', lastModified: legalModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://warsh.app/help', lastModified: legalModified, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `https://warsh.app/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages];
}
