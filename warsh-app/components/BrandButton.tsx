import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { Colors, Fonts, Radii, Shadows, Spacing, WarshPalette } from "../constants/theme";

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

  // Primary: use Paper Button — simple contained CTA, no selection state needed
  if (variant === "primary") {
    const flat = StyleSheet.flatten(style) as (ViewStyle & { backgroundColor?: string }) | undefined;
    const bgFromStyle: string | undefined = flat?.backgroundColor;
    const { backgroundColor: _stripped, ...outerStyle } = flat ?? {};

    const bg = bgFromStyle ?? (selected ? "rgba(212, 175, 55, 0.12)" : WarshPalette.gold);
    const fg = isDarkColor(bgFromStyle) ? WarshPalette.creamBg : WarshPalette.ink;

    return (
      <Button
        mode="contained"
        onPress={onPress}
        disabled={isDisabled}
        loading={loading}
        buttonColor={bg}
        textColor={fg}
        style={[styles.primaryBase, selected ? styles.selectedBorder : null, outerStyle]}
        contentStyle={styles.primaryContent}
        labelStyle={styles.primaryLabel}
      >
        {title}
      </Button>
    );
  }

  // Secondary & danger: Pressable — full control over selection border/bg
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
          pressed && !isDisabled ? styles.pressed : null,
          isDisabled ? styles.disabled : null,
          style,
        ]}
      >
        {loading
          ? <ActivityIndicator color={Colors.text.primary} />
          : <Text style={[styles.label, styles.labelSecondary, selected ? styles.labelSecondarySelected : null]}>
              {title}
            </Text>}
      </Pressable>
    );
  }

  // danger
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles.danger,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color="#E8A09A" />
        : <Text style={[styles.label, styles.labelDanger]}>{title}</Text>}
    </Pressable>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Paper Button base (primary only)
  primaryBase: {
    borderRadius: Radii.md + 2,
    minWidth: 0,
  },
  primaryContent: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
  },
  primaryLabel: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
  },

  // Pressable base (secondary + danger)
  base: {
    minHeight: 52,
    borderRadius: Radii.md + 2,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.border.default,
  },
  secondarySelected: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
    backgroundColor: "rgba(154, 143, 106, 0.10)",
  },
  danger: {
    backgroundColor: "rgba(192, 57, 43, 0.15)",
    borderWidth: 1.5,
    borderColor: WarshPalette.wrongBorder,
  },

  // Labels
  label: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Fonts.bold,
  },
  labelSecondary: {
    color: Colors.text.secondary,
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },
  labelSecondarySelected: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontWeight: "700",
  },
  labelDanger: {
    color: "#E8A09A",
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },

  // States
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.7,
  },
});
