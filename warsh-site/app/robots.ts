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
        '/contact',
        '/team',
        '/editorial-guidelines',
        '/blog',
        '/privacy',
        '/terms',
        '/delete-account',
        '/help',
        '/sitemap',
      ],
      disallow: ['/api/', '/dashboard/', '/reset-password'],
    },
    sitemap: 'https://warsh.app/sitemap.xml',
    host: 'https://warsh.app',
  };
}
