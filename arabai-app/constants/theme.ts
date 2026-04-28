export const Colors = {
  bg: {
    primary: "#1B2A4A",
    secondary: "#0F1923",
    card: "#2C3E6B",
    surface: "#243352",
  },
  text: {
    primary: "#F5F0E8",
    secondary: "#B8C4D4",
    muted: "#7A8BA0",
    arabic: "#F5F0E8",
    danger: "#F2B8B5",
  },
  accent: {
    gold: "#D4A847",
    goldMuted: "#A07830",
    goldLight: "#F0C060",
    teal: "#2A7F6F",
    crimson: "#C0392B",
    streak: "#FF6B35",
  },
  border: {
    default: "#2C3E6B",
    subtle: "#1F3055",
    gold: "#D4A847",
  },
  success: "#2A7F6F",
  error: "#C0392B",
  warning: "#D4A847",
  overlay: "rgba(15, 25, 35, 0.72)",
} as const;

export const Fonts = {
  arabic: "Amiri-Regular",
  arabicBold: "Amiri-Bold",
  display: "System",
  regular: "System",
  semiBold: "System",
  bold: "System",
  extraBold: "System",
} as const;

export const FontSizes = {
  displayXL: 40,
  displayL: 32,
  h1: 26,
  h2: 22,
  h3: 18,
  bodyL: 16,
  bodyM: 14,
  caption: 12,
  label: 12,
  arabicXL: 40,
  arabicL: 30,
  arabicM: 22,
  arabicS: 16,
} as const;

export const LineHeights = {
  displayXL: 48,
  displayL: 40,
  h1: 34,
  h2: 30,
  h3: 26,
  bodyL: 24,
  bodyM: 22,
  caption: 18,
  arabicXL: 58,
  arabicL: 46,
  arabicM: 36,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  goldGlow: {
    shadowColor: "#D4A847",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  xpFloat: 800,
} as const;
