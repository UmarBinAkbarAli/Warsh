import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { Fonts, Radii, Spacing, WarshPalette, WarshAlpha } from "../constants/theme";

type Variant = "primary" | "secondary" | "danger";

type BrandButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  selected?: boolean;
  style?: ViewStyle;
};

// Button system: primary uses the A1 hero-CTA treatment (navy surface,
// gold-light label — user decision 2026-07-08, supersedes spec-11's gold
// primary); sage-bordered secondary and transparent terracotta destructive per
// spec-11 §5.1. 56pt tall. The primary is always navy: a backgroundColor in
// `style` is ignored, so every screen shows the same main action (UX
// evaluation 2026-09-24, finding H7).
export function BrandButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  selected = false,
  style,
}: BrandButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === "primary") {
    const flat = StyleSheet.flatten(style) as ViewStyle | undefined;
    const { backgroundColor: _ignored, borderColor: _ignoredBorder, ...outerStyle } = flat ?? {};

    const labelColor = isDisabled
      ? WarshPalette.subtleBrown
      : selected
        ? WarshPalette.ink
        : WarshPalette.parchment; // gold-light on navy

    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.primary,
          {
            backgroundColor:
              pressed && !isDisabled
                ? WarshPalette.navyDeep
                : selected
                  ? WarshPalette.highlightBg
                  : WarshPalette.navy,
          },
          selected ? styles.selectedBorder : null,
          outerStyle,
          isDisabled ? styles.primaryDisabled : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <Text style={[styles.label, { color: labelColor }]}>{title}</Text>
        )}
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.secondary,
          selected ? styles.secondarySelected : null,
          pressed && !isDisabled ? styles.secondaryPressed : null,
          isDisabled ? styles.disabled : null,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={WarshPalette.ink} />
        ) : (
          <Text style={[styles.label, styles.labelSecondary]}>{title}</Text>
        )}
      </Pressable>
    );
  }

  // danger — spec-11 destructive: transparent, terracotta text
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles.danger,
        pressed && !isDisabled ? styles.dangerPressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={WarshPalette.wrongText} />
      ) : (
        <Text style={[styles.label, styles.labelDanger]}>{title}</Text>
      )}
    </Pressable>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // 2026-08 redesign: solid navy, no border. Gold-light label carries the
  // contrast; the old 2px gold outline read as heavy at 56pt.
  primary: {
    borderWidth: 0,
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
  },
  // Warm fill with a readable muted label; a faded navy with a gold label
  // was close to invisible (finding M10).
  primaryDisabled: {
    backgroundColor: WarshPalette.disabledFill,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: WarshPalette.sage,
  },
  secondaryPressed: {
    backgroundColor: WarshAlpha.sageSoftTint
  },
  secondarySelected: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBg,
  },
  danger: {
    backgroundColor: "transparent",
  },
  dangerPressed: {
    backgroundColor: WarshAlpha.warningTint
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: WarshPalette.ink,
  },
  labelSecondary: {
    color: WarshPalette.ink,
  },
  labelDanger: {
    color: WarshPalette.wrongText, // 5.6:1 on parchment; wrongBorder was 2.9:1
  },
  disabled: {
    opacity: 0.5,
  },
});
