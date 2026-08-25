import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/features',
        '/pricing',
        '/about',
        '/blog',
        '/privacy',
        '/terms',
        '/delete-account',
        '/help',
      ],
      disallow: ['/api/', '/dashboard/', '/reset-password'],
    },
    sitemap: 'https://warsh.app/sitemap.xml',
    host: 'https://warsh.app',
  };
}
