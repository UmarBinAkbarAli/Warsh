import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Colors, Radii, Shadows, Spacing } from "../constants/theme";

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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        selected ? styles.selected : null,
        variant === "primary" ? Shadows.goldGlow : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.bg.primary : Colors.text.primary} />
      ) : (
        <Text style={[styles.label, labelStyles[variant], selected ? labelStyles.selected : null]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radii.md + 2,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: Colors.accent.gold,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.border.default,
  },
  danger: {
    backgroundColor: "rgba(192, 57, 43, 0.15)",
    borderWidth: 1.5,
    borderColor: Colors.accent.crimson,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Amiri-Bold",
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.7,
  },
  selected: {
    borderColor: Colors.accent.gold,
    borderWidth: 2,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: Colors.bg.primary,
  },
  secondary: {
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  danger: {
    color: "#E8A09A",
    fontWeight: "600",
  },
  selected: {
    color: Colors.text.primary,
  },
});
