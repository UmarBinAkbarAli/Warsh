export const SITE_URL = 'https://warsh.app';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.warsh.app';
export const WEB_APP_URL = 'https://app.warsh.app';
export const SUPPORT_EMAIL = 'support@warsh.app';

/**
 * Profiles Warsh actually maintains, in the order they should appear.
 *
 * This is the single source for the footer row and for the `sameAs` array on
 * the Organization schema, so a profile is either published in both places or
 * in neither. Only add a URL that resolves to a live profile Warsh owns — a
 * dead or unclaimed social link is a worse trust signal to a reader, and to
 * Google, than an absent one. All three below were opened and confirmed.
 */
export type SocialLink = { href: string; label: string };
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { href: 'https://www.instagram.com/warsh.app/', label: 'Instagram' },
  { href: 'https://www.facebook.com/trywarshapp/', label: 'Facebook' },
  { href: 'https://www.linkedin.com/company/warshapp/', label: 'LinkedIn' },
] as const;

/**
 * Published contact number, for press and partnership enquiries.
 *
 * Two forms because they are read by different things: `tel` is what a dialler
 * and schema.org need (E.164, no spaces), `display` is what a person reads.
 * Support stays email-first — an email carries the account address, device and
 * lesson number that a phone call does not.
 */
export const PHONE = {
  tel: '+923181046756',
  display: '+92 318 104 6756',
} as const;

/**
 * Where Warsh is made.
 *
 * City and country only — that is what the owner chose to publish, and it is
 * what the Facebook page already states, so the two agree. Deliberately not
 * dressed up as a full postal address: schema.org's PostalAddress is happy with
 * locality and country alone, and inventing a street line to satisfy an audit
 * checkbox would be worse than a short honest one.
 */
export const ADDRESS = {
  locality: 'Karachi',
  country: 'Pakistan',
  countryCode: 'PK',
  display: 'Karachi, Pakistan',
} as const;

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
    { href: '/contact', label: 'Contact' },
    { href: '/editorial-guidelines', label: 'Editorial Guidelines' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/help', label: 'Help' },
    { href: '/delete-account', label: 'Delete Account' },
    { href: '/sitemap', label: 'Sitemap' },
  ],
} as const;
