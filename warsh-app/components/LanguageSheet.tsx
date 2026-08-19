import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOnboardingStore } from "@stores/onboardingStore";
import { useT } from "@i18n/index";
import type { AppLanguage } from "@services/language";
import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../constants/theme";

const OPTIONS: { value: AppLanguage; labelKey: string; flag: number }[] = [
  { value: "en", labelKey: "language.english", flag: require("../assets/images/flag-en.png") },
  { value: "ur", labelKey: "language.urdu", flag: require("../assets/images/flag-ur.png") },
];

type LanguageSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Bottom sheet for the pre-auth language picker.
 *
 * Selecting a language sets BOTH `language` (app UI) and
 * `translationLanguage` (ayah meanings) so an English user never lands on
 * Urdu translations. Settings can still change them independently later.
 */
export function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const language = useOnboardingStore((s) => s.language);
  const setLanguage = useOnboardingStore((s) => s.setLanguage);
  const setTranslationLanguage = useOnboardingStore((s) => s.setTranslationLanguage);

  function select(value: AppLanguage) {
    setLanguage(value);
    setTranslationLanguage(value);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.handle} />

        <Text style={styles.title}>{t("language.sheetTitle")}</Text>
        <Text style={styles.subtitle}>{t("language.sheetBody")}</Text>

        {OPTIONS.map((option) => {
          const selected = language === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => select(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : null,
                pressed ? styles.optionPressed : null,
              ]}
            >
              <Image source={option.flag} style={styles.flag} resizeMode="contain" />
              <Text style={styles.optionLabel}>{t(option.labelKey)}</Text>
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: WarshPalette.white,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 37,
    height: 3,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sageSoft,
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.ink,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    marginBottom: Spacing.xl,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    height: 56,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
    marginBottom: Spacing.lg,
  },
  optionSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  optionPressed: {
    backgroundColor: WarshPalette.parchmentBg,
  },
  optionLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    color: WarshPalette.ink,
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: Radii.full,
  },
});
