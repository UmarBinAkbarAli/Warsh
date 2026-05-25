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
    return (
      <Button
        mode="contained"
        onPress={onPress}
        disabled={isDisabled}
        loading={loading}
        buttonColor={selected ? "rgba(212, 175, 55, 0.12)" : WarshPalette.gold}
        textColor={selected ? WarshPalette.ink : WarshPalette.ink}
        style={[styles.base, selected ? styles.selectedBorder : null, style]}
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
        style={[styles.base, style]}
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
      style={[styles.base, styles.dangerBorder, style]}
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
