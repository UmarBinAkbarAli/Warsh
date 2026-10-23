import { StyleSheet, Text, View } from "react-native";

import { useT } from "@i18n/index";
import type { AppLanguage } from "@services/language";
import { ArabicText } from "./ArabicText";
import { LanguageChoiceSheet } from "./LanguageChoiceSheet";
import { Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

type TranslationLanguagePromptProps = {
  visible: boolean;
  current: AppLanguage;
  saving: boolean;
  onSelect: (value: AppLanguage) => void;
  onDismiss: () => void;
};

/**
 * First-time-home-screen nudge: signup only ever sets translationLanguage
 * equal to the chosen app language (LanguageSheet), so this is the only
 * place a user is offered a different meaning language unless they find
 * Settings on their own.
 */
export function TranslationLanguagePrompt({
  visible,
  current,
  saving,
  onSelect,
  onDismiss,
}: TranslationLanguagePromptProps) {
  const t = useT();

  return (
    <LanguageChoiceSheet
      visible={visible}
      title={t("language.chooseMeaning")}
      body={t("language.meaningDescription")}
      current={current}
      saving={saving}
      options={[
        { value: "ur", title: t("language.urdu"), subtitle: t("language.meaningsUrdu") },
        { value: "en", title: t("language.english"), subtitle: t("language.meaningsEnglish") },
      ]}
      ctaLabel={(value) => t(value === "ur" ? "language.useUrduMeanings" : "language.useEnglishMeanings")}
      onConfirm={onSelect}
      onClose={onDismiss}
      footnote={t("language.changeInSettings")}
      preview={(value) => (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{t("language.previewLabel")}</Text>
          <View style={styles.previewRow}>
            {value === "ur" ? (
              <Text style={styles.previewUrdu}>اللہ کا گھر</Text>
            ) : (
              <Text style={styles.previewEnglish}>the House of Allah</Text>
            )}
            <ArabicText size="md">بَيْتُ اللَّهِ</ArabicText>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  preview: {
    marginTop: Spacing.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  previewLabel: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
  },
  previewRow: {
    marginTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  previewUrdu: { color: WarshPalette.ink, fontFamily: Fonts.arabic, fontSize: 22, lineHeight: 34 },
  previewEnglish: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: 16 },
});
