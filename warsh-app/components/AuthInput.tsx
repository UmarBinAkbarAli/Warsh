import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useLanguage } from "@services/language";
import { Fonts, FontSizes, Radii, Spacing, WarshPalette } from "../constants/theme";

type AuthInputProps = Omit<TextInputProps, "style"> & {
  /** Renders the show/hide eye toggle and masks the value until toggled. */
  secure?: boolean;
  containerStyle?: ViewStyle;
  /** Shown under the field, which turns terracotta, so each problem sits by its field. */
  error?: string;
};

/**
 * Outlined field used across the auth screens (2026-08 redesign):
 * 56pt tall, 4pt radius, 1pt muted-ink border, no fill — the screen
 * background shows through.
 *
 * The eye toggle is right-aligned rather than inline after the placeholder
 * as drawn in Figma: once the user types, an inline icon would slide with
 * the text and eventually run off the field.
 */
export function AuthInput({ secure = false, containerStyle, error, ...props }: AuthInputProps) {
  const [visible, setVisible] = useState(false);
  const isUrdu = useLanguage() === "ur";
  const { marginBottom, marginTop, ...fieldContainer } = StyleSheet.flatten(containerStyle) ?? {};

  return (
    <View style={{ marginBottom, marginTop }}>
    <View style={[styles.field, isUrdu ? styles.fieldRtl : null, fieldContainer, error ? styles.fieldError : null]}>
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
        {...props}
        style={[styles.input, isUrdu ? styles.inputRtl : null]}
        secureTextEntry={secure && !visible}
        placeholderTextColor={WarshPalette.subtleBrown}
        autoCapitalize={props.autoCapitalize ?? "none"}
        autoCorrect={props.autoCorrect ?? false}
      />
      {secure ? (
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={WarshPalette.subtleBrown}
          />
        </TouchableOpacity>
      ) : null}
    </View>
    {error ? (
      <Text style={[styles.errorText, isUrdu ? styles.inputRtl : null]} accessibilityLiveRegion="polite">
        {error}
      </Text>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: WarshPalette.subtleBrown,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  fieldRtl: {
    flexDirection: "row-reverse",
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
    // Android centres text oddly in a fixed-height row without this.
    paddingVertical: 0,
  },
  fieldError: {
    borderColor: WarshPalette.wrongText,
    borderWidth: 1.5,
  },
  errorText: {
    marginTop: Spacing.xs,
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 20,
  },
  inputRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
