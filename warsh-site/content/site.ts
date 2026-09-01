export const SITE_URL = 'https://warsh.app';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.warsh.app';
export const WEB_APP_URL = 'https://app.warsh.app';
export const SUPPORT_EMAIL = 'support@warsh.app';

/**
 * Profiles Warsh actually maintains, in the order they should appear.
 *
 * This is the single source for the footer row and for the `sameAs` array on
 * the Organization schema, so a profile is either published in both places or
 * in neither. Deliberately empty until a profile is live: a dead social link is
 * a worse trust signal to a reader — and to Google — than an absent one, so add
 * an entry only once the URL resolves to a real, populated profile.
 */
export type SocialLink = { href: string; label: string };
export const SOCIAL_LINKS: readonly SocialLink[] = [] as const;

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
