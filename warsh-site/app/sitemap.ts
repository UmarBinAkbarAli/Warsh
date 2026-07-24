import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-20T00:00:00.000Z');

  return [
    {
      url: 'https://warsh.app',
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://warsh.app/privacy',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://warsh.app/terms',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://warsh.app/delete-account',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://warsh.app/help',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
