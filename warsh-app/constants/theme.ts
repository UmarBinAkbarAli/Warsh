// Spec-11 §2 locked brand palette. Key names kept from the legacy theme
// (renaming 300+ call sites isn't worth it) but every VALUE now maps to a
// spec token by role — the spec name is noted on each line.
export const WarshPalette = {
  ink: "#1A1A1A",             // --ink
  deep: "#3D3D3D",            // --ink-soft (secondary text / dark surface)
  gold: "#C8A047",            // --gold
  goldDeep: "#9A7D33",        // --gold-deep (pressed states)
  parchment: "#E0BC68",       // --gold-soft (this key is used as the muted-gold accent)
  cream: "#EDDFAF",           // --parchment-deep (borders, grouping surfaces)
  creamBg: "#F4EBD0",         // --parchment (primary screen background)
  parchmentBg: "#FAF6E9",     // --cream (card background)
  parchmentSoft: "#FAF2DD",   // --parchment-soft (emphasis cards)
  white: "#FFFFFF",           // --white-pure
  defaultCardBorder: "#9DAB94",   // --sage-soft (dividers/borders per §2.4)
  parchmentCardBorder: "#E0BC68", // --gold-soft (emphasis card border per §5.2)
  bodyBrown: "#3D3D3D",       // --ink-soft (body text)
  subtleBrown: "#5F5F5F",     // --ink-muted (captions, helper text)
  sage: "#7A8B70",            // --sage
  sageSoft: "#9DAB94",        // --sage-soft
  sageDeep: "#5A6953",        // --sage-deep (confirmation states)
  mint: "#9DAB94",            // legacy key → --sage-soft
  wrongBg: "#F7E9E0",         // tint of --warning-soft
  wrongBorder: "#C8744A",     // --warning-soft (warm terracotta, never harsh red)
  wrongBorderSoft: "#D99A78", // lighter --warning-soft
  wrongText: "#9C5432",       // darker --warning-soft for text contrast
  correctBg: "#EDF1E4",       // tint of --success-soft
  correctBorder: "#A8BC8F",   // light --success-soft
  sageTintBg: "#EDF1E4",      // tint of --success-soft
  sageTintBorder: "#7B9461",  // --success-soft
  sageTintBorderStrong: "#5A6953", // --sage-deep
  disabledIcon: "#9DAB94",    // --sage-soft
  disabledText: "#9B9283",    // warm grey, between ink-muted and sage-soft
  waveformGoldIdle: "#DCC98F",// desaturated --gold-soft
  waveformSageIdle: "#9DAB94",// --sage-soft
  recordingBg: "#944232",     // deep terracotta (live-recording state)
  recordingDot: "#D9634A",    // vivid --warning-soft (no panic red per §2.3)
  deniedText: "#9C5432",      // darker --warning-soft
  highlightBg: "#FBF3DC",     // gold-tinted parchment (selection highlight)
  highlightBorder: "#E0BC68", // --gold-soft
  highlightBgSoft: "#FDF8EA", // lighter gold-tinted parchment
  closeBg: "#FAF2DD",         // --parchment-soft
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
    default: WarshPalette.sageSoft,
    subtle: WarshPalette.cream,
    gold: WarshPalette.gold,
  },
  success: WarshPalette.sage,
  error: WarshPalette.wrongText,
  warning: WarshPalette.wrongBorder,
  // Spec-11 §5.6: ink at 60% for confirmation modals
  overlay: "rgba(26, 26, 26, 0.6)",
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
  // Spec-11 §5.2: very soft shadow — elevation reads through color, not shadow
  card: {
    shadowColor: WarshPalette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
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
