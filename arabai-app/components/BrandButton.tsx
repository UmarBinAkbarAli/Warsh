import { StyleSheet, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { Colors, Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

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

// Returns true for colors that need a light text overlay (contrast check)
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

  // Callers sometimes pass backgroundColor directly in style (e.g. the ink
  // dark button in lessons). Extract it so we can hand it to Paper's
  // buttonColor prop — which controls the actual surface — and derive a
  // readable text color from it automatically.
  const flat = StyleSheet.flatten(style) as (ViewStyle & { backgroundColor?: string }) | undefined;
  const bgFromStyle: string | undefined = flat?.backgroundColor;
  const { backgroundColor: _stripped, ...outerStyle } = flat ?? {};

  if (variant === "primary") {
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
        style={[styles.base, selected ? styles.selectedBorder : null, outerStyle]}
        contentStyle={styles.content}
        labelStyle={styles.label}
      >
        {title}
      </Button>
    );
  }

  if (variant === "secondary") {
    return (
      <Button
        mode="outlined"
        onPress={onPress}
        disabled={isDisabled}
        loading={loading}
        textColor={Colors.text.secondary}
        style={[styles.base, outerStyle]}
        contentStyle={styles.content}
        labelStyle={[styles.label, styles.labelSecondary]}
      >
        {title}
      </Button>
    );
  }

  // danger
  return (
    <Button
      mode="contained-tonal"
      onPress={onPress}
      disabled={isDisabled}
      loading={loading}
      buttonColor="rgba(192, 57, 43, 0.15)"
      textColor="#E8A09A"
      style={[styles.base, styles.dangerBorder, outerStyle]}
      contentStyle={styles.content}
      labelStyle={[styles.label, styles.labelSecondary]}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md + 2,
    minWidth: 0,
  },
  content: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
  },
  labelSecondary: {
    fontWeight: "600",
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
  },
  dangerBorder: {
    borderWidth: 1.5,
    borderColor: WarshPalette.wrongBorder,
  },
});
