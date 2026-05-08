export const WarshPalette = {
  ink: "#0F1117",
  deep: "#1A1F30",
  gold: "#9A8F6A",
  parchment: "#D4C99A",
  cream: "#E8E0CC",
  creamBg: "#F5F2EA",
  parchmentBg: "#EDE8D8",
  white: "#FFFFFF",
  defaultCardBorder: "#D8D0BE",
  parchmentCardBorder: "#C8C0A8",
  bodyBrown: "#5A5240",
  subtleBrown: "#9A9080",
  sage: "#3A5030",
  mint: "#8FC9A0",
  wrongBg: "#F9EDED",
  wrongBorder: "#B07070",
  wrongText: "#7A3030",
} as const;

export const Colors = {
  bg: {
    primary: WarshPalette.creamBg,
    secondary: WarshPalette.deep,
    card: WarshPalette.parchmentBg,
    surface: WarshPalette.cream,
  },
  text: {
    primary: WarshPalette.ink,
    secondary: WarshPalette.deep,
    muted: WarshPalette.gold,
    arabic: WarshPalette.ink,
    danger: WarshPalette.wrongText,
  },
  accent: {
    gold: WarshPalette.gold,
    goldMuted: WarshPalette.parchment,
    goldLight: WarshPalette.cream,
    teal: WarshPalette.sage,
    crimson: WarshPalette.wrongBorder,
    streak: WarshPalette.sage,
  },
  border: {
    default: WarshPalette.cream,
    subtle: WarshPalette.cream,
    gold: WarshPalette.gold,
  },
  success: WarshPalette.sage,
  error: WarshPalette.wrongText,
  warning: WarshPalette.gold,
  overlay: "rgba(15, 17, 23, 0.72)",
} as const;

export const Fonts: Record<string, string | undefined> = {
  arabic: "Scheherazade New",
  arabicBold: "Scheherazade New Bold",
  display: undefined,
  regular: undefined,
  semiBold: undefined,
  bold: undefined,
  extraBold: undefined,
  italic: undefined,
  urduFallback: undefined,
};

export const FontSizes = {
  displayXL: 17,
  displayL: 15,
  h1: 15,
  h2: 14,
  h3: 13,
  bodyL: 12,
  bodyM: 11,
  caption: 10,
  label: 9,
  transliteration: 11,
  arabicXL: 52,
  arabicL: 28,
  arabicM: 20,
  arabicS: 18,
} as const;

export const LineHeights = {
  displayXL: 22,
  displayL: 20,
  h1: 20,
  h2: 19,
  h3: 18,
  bodyL: 18,
  bodyM: 16,
  caption: 14,
  label: 12,
  transliteration: 14,
  arabicXL: 64,
  arabicL: 40,
  arabicM: 30,
  arabicS: 28,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Shadows = {
  card: {
    shadowColor: WarshPalette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  goldGlow: {
    shadowColor: WarshPalette.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  xpFloat: 800,
} as const;
