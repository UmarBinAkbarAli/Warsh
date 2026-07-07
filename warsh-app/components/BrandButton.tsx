import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

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

// Returns true for hex colors that need a light text overlay
function isDarkColor(hex?: string): boolean {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

// Spec-11 §5.1 button system: gold primary (pressed → gold-deep),
// sage-bordered secondary, transparent terracotta destructive. 56pt tall.
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
    // Callers may override backgroundColor via style; honor it and pick a
    // readable label color for dark overrides.
    const flat = StyleSheet.flatten(style) as
      | (ViewStyle & { backgroundColor?: string })
      | undefined;
    const bgFromStyle: string | undefined = flat?.backgroundColor;
    const { backgroundColor: _stripped, ...outerStyle } = flat ?? {};

    const labelColor = isDarkColor(bgFromStyle)
      ? WarshPalette.parchmentBg
      : WarshPalette.ink;

    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor:
              bgFromStyle ??
              (pressed && !isDisabled
                ? WarshPalette.goldDeep
                : selected
                  ? WarshPalette.highlightBg
                  : WarshPalette.gold),
          },
          selected ? styles.selectedBorder : null,
          isDisabled ? styles.primaryDisabled : null,
          outerStyle,
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
        <ActivityIndicator color={WarshPalette.wrongBorder} />
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
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
  },
  primaryDisabled: {
    backgroundColor: WarshPalette.parchment,
    opacity: 0.5,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: WarshPalette.sage,
  },
  secondaryPressed: {
    backgroundColor: "rgba(157, 171, 148, 0.2)", // sage-soft @ 20% per spec
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
    backgroundColor: "rgba(200, 116, 74, 0.12)", // warning-soft tint
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
    color: WarshPalette.wrongBorder,
  },
  disabled: {
    opacity: 0.5,
  },
});
