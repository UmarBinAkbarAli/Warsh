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
  wrongBorderSoft: "#C09090",
  wrongText: "#7A3030",
  correctBg: "#EAF2E8",
  correctBorder: "#B8CEAE",
  sageTintBg: "#EDF5ED",
  sageTintBorder: "#90B090",
  sageTintBorderStrong: "#70A870",
  disabledIcon: "#A09888",
  disabledText: "#8A8070",
  waveformGoldIdle: "#C0B890",
  waveformSageIdle: "#90A890",
  recordingBg: "#8B3A3A",
  recordingDot: "#FF5555",
  deniedText: "#8B4A3A",
  highlightBg: "#FEF9E7",
  highlightBorder: "#F0D080",
  highlightBgSoft: "#FFFBF0",
  closeBg: "#F8F5EE",
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
    // Spec-11 §2.4: captions/helper text use muted ink, never gold.
    muted: WarshPalette.subtleBrown,
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
  arabicSemiBold: "Scheherazade New SemiBold",
  arabicMedium: "Scheherazade New Medium",
  regular: "Lora-Regular",
  semiBold: "Lora-SemiBold",
  bold: "Lora-Bold",
  italic: "Lora-Italic",
  urduFallback: "Scheherazade New",
};

// Spec-11 §3.3 type scale: base body 16/24, screen titles 28/38.
export const FontSizes = {
  displayXL: 28,
  displayL: 22,
  h1: 22,
  h2: 18,
  h3: 16,
  bodyL: 16,
  bodyM: 14,
  caption: 12,
  label: 10,
  transliteration: 14,
  arabicXL: 52,
  arabicL: 28,
  arabicM: 20,
  arabicS: 18,
} as const;

export const LineHeights = {
  displayXL: 38,
  displayL: 32,
  h1: 32,
  h2: 28,
  h3: 24,
  bodyL: 24,
  bodyM: 20,
  caption: 18,
  label: 14,
  transliteration: 20,
  arabicXL: 80,
  arabicL: 48,
  arabicM: 32,
  arabicS: 30,
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
  gutter: 20, // spec-11 §4.2: screen horizontal padding
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
