import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "@i18n/index";
import type { AppLanguage } from "@services/language";
import { BrandButton } from "./BrandButton";
import { Fonts, FontSizes, Radii, Spacing, WarshAlpha, WarshPalette } from "../constants/theme";

export type LanguageChoice = { value: AppLanguage; title: string; subtitle: string };

type Props = {
  visible: boolean;
  title: string;
  body: string;
  options: LanguageChoice[];
  current: AppLanguage;
  /** Label of the confirm button for the option currently picked. */
  ctaLabel: (value: AppLanguage) => string;
  onConfirm: (value: AppLanguage) => void;
  onClose: () => void;
  saving?: boolean;
  /** Shown under the options for the option currently picked. */
  preview?: (value: AppLanguage) => ReactNode;
  footnote?: string;
};

/**
 * Cream bottom sheet with radio options and a confirm button (Claude Design
 * canvas: "Welcome · app language sheet", "Learn · choose meaning language").
 * Picking an option only moves the radio; the button applies it.
 */
export function LanguageChoiceSheet({
  visible,
  title,
  body,
  options,
  current,
  ctaLabel,
  onConfirm,
  onClose,
  saving = false,
  preview,
  footnote,
}: Props) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const [picked, setPicked] = useState<AppLanguage>(current);

  useEffect(() => {
    if (visible) setPicked(current);
  }, [visible, current]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.scrim}
          onPress={() => !saving && onClose()}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + Spacing.xl }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            <Pressable
              onPress={onClose}
              disabled={saving}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
            >
              <Ionicons name="close" size={22} color={WarshPalette.subtleBrown} />
            </Pressable>
          </View>
          <Text style={styles.body}>{body}</Text>

          <View style={styles.options} accessibilityRole="radiogroup">
            {options.map((option) => {
              const selected = picked === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPicked(option.value)}
                  disabled={saving}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: saving }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && !selected && styles.optionPressed,
                  ]}
                >
                  <View style={[styles.radio, selected && styles.radioOn]} />
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionSub}>{option.subtitle}</Text>
                  </View>
                  {option.value === "ur" ? <Text style={styles.native}>اردو</Text> : null}
                </Pressable>
              );
            })}
          </View>

          {preview ? preview(picked) : null}
          {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}

          <BrandButton
            title={ctaLabel(picked)}
            onPress={() => onConfirm(picked)}
            loading={saving}
            style={styles.cta}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: WarshAlpha.scrim },
  sheet: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: WarshPalette.creamBg,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchment,
    marginBottom: Spacing.lg,
  },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: {
    flex: 1,
    color: WarshPalette.navy,
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 32,
  },
  close: {
    width: 44,
    height: 44,
    marginTop: -10,
    marginRight: -12,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    marginTop: Spacing.xs,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  options: { marginTop: 18, gap: 10 },
  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
  },
  optionSelected: {
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.white,
  },
  optionPressed: { backgroundColor: WarshPalette.parchmentBg },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: WarshPalette.disabledText,
  },
  radioOn: { borderWidth: 6, borderColor: WarshPalette.navy },
  optionCopy: { flex: 1, gap: 2 },
  optionTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL,
    lineHeight: 22,
  },
  optionSub: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  native: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.arabic,
    fontSize: 22,
    lineHeight: 30,
  },
  footnote: {
    marginTop: Spacing.md,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  cta: { marginTop: Spacing.gutter },
});
