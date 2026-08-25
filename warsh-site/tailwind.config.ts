import type { Config } from 'tailwindcss';

// Mirrors warsh-app/constants/theme.ts (WarshPalette / Colors) — the app's
// design-token source of truth. Keep values in sync with that file.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        deep: '#3D3D3D',
        'subtle-brown': '#5F5F5F',
        navy: '#071B44',
        'navy-deep': '#04122E',
        gold: '#C49B4D',
        'gold-deep': '#A88648',
        parchment: '#D4B06A',
        cream: '#EDDFAF',
        'cream-bg': '#F8F4ED',
        'parchment-deep': '#F4EBD0',
        'parchment-bg': '#FAF6E9',
        'parchment-soft': '#FAF2DD',
        sage: '#7A8B70',
        'sage-soft': '#9DAB94',
        'sage-deep': '#5A6953',
        terracotta: '#C8744A',
        'terracotta-deep': '#944232',
        highlight: '#FBF3DC',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        arabic: ['var(--font-scheherazade)', 'serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      spacing: {
        gutter: '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(26, 26, 26, 0.04)',
        gold: '0 4px 8px rgba(196, 155, 77, 0.2)',
        lifted: '0 12px 32px rgba(7, 27, 68, 0.12)',
      },
      maxWidth: {
        container: '1180px',
        prose: '680px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
};

export default config;
