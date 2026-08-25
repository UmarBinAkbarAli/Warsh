export const SITE_URL = 'https://warsh.app';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.warsh.app';
export const WEB_APP_URL = 'https://app.warsh.app';
export const SUPPORT_EMAIL = 'support@warsh.app';

export const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: WEB_APP_URL, label: 'Open Warsh Web' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/help', label: 'Help' },
    { href: '/delete-account', label: 'Delete Account' },
  ],
} as const;
