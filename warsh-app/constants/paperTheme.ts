import { MD3LightTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";
import { WarshPalette } from "./theme";

export const WarshPaperTheme: MD3Theme = {
  ...MD3LightTheme,
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
    backdrop:             "rgba(26, 26, 26, 0.4)",
  },
};
