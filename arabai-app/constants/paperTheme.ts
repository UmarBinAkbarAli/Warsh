import { MD3LightTheme, configureFonts } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";
import { WarshPalette } from "./theme";

const fontConfig = {
  displayLarge:  { fontFamily: "Lora-Regular",  fontSize: 57, letterSpacing: -0.25, lineHeight: 64, fontWeight: "400" as const },
  displayMedium: { fontFamily: "Lora-Regular",  fontSize: 45, letterSpacing: 0,     lineHeight: 52, fontWeight: "400" as const },
  displaySmall:  { fontFamily: "Lora-Regular",  fontSize: 36, letterSpacing: 0,     lineHeight: 44, fontWeight: "400" as const },
  headlineLarge: { fontFamily: "Lora-Bold",     fontSize: 32, letterSpacing: 0,     lineHeight: 40, fontWeight: "700" as const },
  headlineMedium:{ fontFamily: "Lora-Bold",     fontSize: 28, letterSpacing: 0,     lineHeight: 36, fontWeight: "700" as const },
  headlineSmall: { fontFamily: "Lora-Bold",     fontSize: 24, letterSpacing: 0,     lineHeight: 32, fontWeight: "700" as const },
  titleLarge:    { fontFamily: "Lora-Bold",     fontSize: 22, letterSpacing: 0,     lineHeight: 28, fontWeight: "700" as const },
  titleMedium:   { fontFamily: "Lora-SemiBold", fontSize: 16, letterSpacing: 0.15, lineHeight: 24, fontWeight: "600" as const },
  titleSmall:    { fontFamily: "Lora-SemiBold", fontSize: 14, letterSpacing: 0.1,  lineHeight: 20, fontWeight: "600" as const },
  bodyLarge:     { fontFamily: "Lora-Regular",  fontSize: 16, letterSpacing: 0.5,  lineHeight: 24, fontWeight: "400" as const },
  bodyMedium:    { fontFamily: "Lora-Regular",  fontSize: 14, letterSpacing: 0.25, lineHeight: 20, fontWeight: "400" as const },
  bodySmall:     { fontFamily: "Lora-Regular",  fontSize: 12, letterSpacing: 0.4,  lineHeight: 16, fontWeight: "400" as const },
  labelLarge:    { fontFamily: "Lora-SemiBold", fontSize: 14, letterSpacing: 0.1,  lineHeight: 20, fontWeight: "600" as const },
  labelMedium:   { fontFamily: "Lora-Regular",  fontSize: 12, letterSpacing: 0.5,  lineHeight: 16, fontWeight: "400" as const },
  labelSmall:    { fontFamily: "Lora-Regular",  fontSize: 11, letterSpacing: 0.5,  lineHeight: 16, fontWeight: "400" as const },
};

export const WarshPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    // Primary — gold
    primary:              WarshPalette.gold,
    onPrimary:            WarshPalette.ink,
    primaryContainer:     WarshPalette.parchment,
    onPrimaryContainer:   WarshPalette.ink,
    // Secondary — sage green
    secondary:            WarshPalette.sage,
    onSecondary:          WarshPalette.white,
    secondaryContainer:   WarshPalette.mint,
    onSecondaryContainer: WarshPalette.ink,
    // Tertiary — parchment accent
    tertiary:             WarshPalette.parchment,
    onTertiary:           WarshPalette.ink,
    tertiaryContainer:    WarshPalette.cream,
    onTertiaryContainer:  WarshPalette.ink,
    // Error — crimson
    error:                WarshPalette.wrongText,
    onError:              WarshPalette.white,
    errorContainer:       WarshPalette.wrongBg,
    onErrorContainer:     WarshPalette.wrongText,
    // Backgrounds & surfaces
    background:           WarshPalette.creamBg,
    onBackground:         WarshPalette.ink,
    surface:              WarshPalette.parchmentBg,
    onSurface:            WarshPalette.ink,
    surfaceVariant:       WarshPalette.cream,
    onSurfaceVariant:     WarshPalette.bodyBrown,
    // Borders
    outline:              WarshPalette.defaultCardBorder,
    outlineVariant:       WarshPalette.parchmentCardBorder,
    // Inverse
    inverseSurface:       WarshPalette.ink,
    inverseOnSurface:     WarshPalette.cream,
    inversePrimary:       WarshPalette.parchment,
    // Misc
    shadow:               WarshPalette.ink,
    scrim:                WarshPalette.ink,
    surfaceDisabled:      `${WarshPalette.cream}99`,
    onSurfaceDisabled:    `${WarshPalette.subtleBrown}61`,
    backdrop:             "rgba(15, 17, 23, 0.4)",
  },
};
