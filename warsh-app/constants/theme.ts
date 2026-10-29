import { Platform } from "react-native";

// Values below come from the Warsh design system via constants/tokens.generated.ts.
// Change them in the design system, then run `npm run design-sync` (see scripts/design-sync.mjs).
import {
  AlphaTokens,
  ColorRoleTokens,
  DesktopFontSizeTokens,
  DesktopLineHeightTokens,
  FontSizeTokens,
  LineHeightTokens,
  MushafTokens,
  PaletteTokens,
  RadiusTokens,
  ShadowTokens,
  SpacingTokens,
  TajweedTokens,
  WebLayoutTokens,
} from "./tokens.generated";

// Spec-11 §2 locked brand palette. Key names kept from the legacy theme
// (renaming 300+ call sites isn't worth it) but every VALUE now maps to a
// spec token by role — the spec name is noted on each line.
// Gold family + navy come from the A1 preview screen's palette (user decision
// 2026-07-08), superseding spec-11 §2's gold values — richer gilt, and a deep
// navy for high-emphasis CTA surfaces.
export const WarshPalette = PaletteTokens;

// Quran reader (Pen section 27). Tajweed colours follow the printed Madani
// tajweed mushaf convention hafiz students already know: green for nasal
// rules, blue for qalqalah, reds and oranges for madd by length, grey for
// letters that are written but not pronounced.
export const TajweedPalette = TajweedTokens;

export const MushafPalette = MushafTokens;

// Translucent tints derived from the palette above. Every rgba() in the app
// comes from here so the alpha steps stay consistent; the base colour is the
// palette token named in the comment.
export const WarshAlpha = AlphaTokens;

export const Colors = ColorRoleTokens;

export const Fonts: Record<string, string | undefined> = {
  arabic: "Scheherazade New",
  arabicBold: "Scheherazade New Bold",
  arabicSemiBold: "Scheherazade New SemiBold",
  arabicMedium: "Scheherazade New Medium",
  // UI/body role — Inter (replaced Lora app-wide, user decision 2026-08-16).
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
  italic: "Inter-Italic",
  // Display role — Cormorant Garamond for screen titles and the wordmark.
  display: "CormorantGaramond-Bold",
  displaySemiBold: "CormorantGaramond-SemiBold",
  displayRegular: "CormorantGaramond-Regular",
  urduFallback: "Scheherazade New",
};

// Spec-11 §3.3 type scale: base body 16/24, screen titles 28/38.
const BaseFontSizes = FontSizeTokens;

// Laptop type scale (Pen section 32, owner-approved 2026-10-09; M18). Applies
// only to web at 1024px or wider, read once when the app loads — phones, tablets
// and narrow web windows keep the sizes above. Phone-size type read small on a
// laptop; a global CSS zoom was tried and broke the layout, so the scale is
// applied to the type tokens instead. Resize the window and reload to switch.
export const DESKTOP_MIN_WIDTH = WebLayoutTokens.bpLaptop;

/** Web-only layout values: breakpoints, shell widths, content caps, gutters, grid columns. */
export const WebLayout = WebLayoutTokens;
export const IS_DESKTOP_WEB =
  Platform.OS === "web" && typeof window !== "undefined" && window.innerWidth >= DESKTOP_MIN_WIDTH;

const DesktopFontSizes: Record<keyof typeof BaseFontSizes, number> = DesktopFontSizeTokens;

export const FontSizes: typeof BaseFontSizes = IS_DESKTOP_WEB
  ? (DesktopFontSizes as unknown as typeof BaseFontSizes)
  : BaseFontSizes;

/** A literal font size at laptop width: Inter-style text by the Pen table, display and Arabic ×1.15. */
export function desktopFontSize(size: number, kind: "text" | "display" = "text"): number {
  if (!IS_DESKTOP_WEB) return size;
  if (kind === "display") return Math.round(size * 1.15);
  if (size <= 11) return 13;
  if (size <= 12.5) return 14;
  if (size <= 13.5) return 15;
  if (size <= 14.5) return 16;
  if (size <= 15.5) return 17;
  return size + 2;
}

/** The line height that goes with a scaled literal font size, so larger text is not clipped. */
export function desktopLineHeight(lineHeight: number, size: number, kind: "text" | "display" = "text"): number {
  if (!IS_DESKTOP_WEB) return lineHeight;
  return Math.round((lineHeight * desktopFontSize(size, kind)) / size);
}

const BaseLineHeights = LineHeightTokens;

// Line heights follow their type token so a scaled size keeps its leading.
export const LineHeights: typeof BaseLineHeights = IS_DESKTOP_WEB
  ? (DesktopLineHeightTokens as unknown as typeof BaseLineHeights)
  : BaseLineHeights;

// Four corner roles (UX evaluation 2026-09-24). Use a literal radius only for
// a circle (width == height == 2r) or a hairline progress bar.
export const Radii = RadiusTokens;

export const Spacing = SpacingTokens;

type ShadowToken = (typeof ShadowTokens)[keyof typeof ShadowTokens];
const toShadow = (t: ShadowToken, elevation: number) => ({
  shadowColor: t.color,
  shadowOffset: { width: t.offsetX, height: t.offsetY },
  shadowOpacity: t.opacity,
  shadowRadius: t.blur,
  elevation,
});

export const Shadows = {
  card: toShadow(ShadowTokens.card, 1),
  goldGlow: toShadow(ShadowTokens.goldGlow, 4),
} as const;

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  xpFloat: 800,
} as const;
