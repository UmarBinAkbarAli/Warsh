import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { useT } from "@i18n/index";
import { type AppLanguage } from "@services/language";
import { useOnboardingStore } from "@stores/onboardingStore";
import { FontSizes, Fonts, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";

function LanguageOption({
  language,
  selected,
  onPress,
}: {
  language: AppLanguage;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useT();
  const isUrdu = language === "ur";

  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.option, selected ? styles.optionSelected : null]}
    >
      <View style={[styles.optionIcon, selected ? styles.optionIconSelected : null]}>
        <Ionicons
          name={selected ? "checkmark" : "book-outline"}
          size={24}
          color={selected ? WarshPalette.white : WarshPalette.subtleBrown}
        />
      </View>
      <View style={styles.optionCopy}>
        <Text style={[styles.optionTitle, selected ? styles.optionTitleSelected : null]}>
          {isUrdu ? t("language.urdu") : t("language.english")}
        </Text>
        <Text style={[styles.optionBody, selected ? styles.optionBodySelected : null]}>
          {isUrdu ? t("language.meaningsUrdu") : t("language.meaningsEnglish")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TranslationLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const { language, translationLanguage, setTranslationLanguage } = useOnboardingStore();
  const selected = translationLanguage === "ur" ? "ur" : "en";

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg }]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{t("language.meaningStep")}</Text>
        <Text style={styles.title}>{t("language.chooseMeaning")}</Text>
        <Text style={styles.body}>{t("language.meaningDescription")}</Text>

        <View style={styles.options} accessibilityRole="radiogroup">
          <LanguageOption language="ur" selected={selected === "ur"} onPress={() => setTranslationLanguage("ur")} />
          <LanguageOption language="en" selected={selected === "en"} onPress={() => setTranslationLanguage("en")} />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>{t("language.meaningPreview")}</Text>
            <Ionicons name="language-outline" size={20} color={WarshPalette.goldDeep} />
          </View>
          <ArabicText size="lg" style={styles.previewArabic}>ٱلْحَمْدُ لِلَّهِ</ArabicText>
          <Text style={[styles.previewMeaning, selected === "ur" ? styles.previewUrdu : null]}>
            {selected === "ur" ? "تمام تعریفیں اللہ کے لیے ہیں" : "All praise belongs to Allah"}
          </Text>
        </View>

        <View style={styles.summary}>
          <Ionicons name="checkmark-circle-outline" size={20} color={WarshPalette.navy} />
          <Text style={styles.summaryText}>
            {t("language.selectionSummary", {
              app: language === "ur" ? t("language.urdu") : t("language.english"),
              meaning: selected === "ur" ? t("language.urdu") : t("language.english"),
            })}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <BrandButton title={t("language.finishSetup")} onPress={() => router.push("/(auth)/register")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WarshPalette.parchmentBg },
  content: { flex: 1, paddingHorizontal: Spacing.gutter, paddingTop: Spacing.xxl },
  eyebrow: { color: WarshPalette.goldDeep, fontFamily: Fonts.semiBold, fontSize: FontSizes.label, letterSpacing: 0.8, textTransform: "uppercase" },
  title: { maxWidth: 330, marginTop: Spacing.sm, color: WarshPalette.navy, fontFamily: Fonts.bold, fontSize: 42, lineHeight: 48 },
  body: { marginTop: Spacing.md, color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL },
  options: { gap: Spacing.md, marginTop: Spacing.xl },
  option: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1, borderColor: WarshPalette.cream, backgroundColor: WarshPalette.white, ...Shadows.card },
  optionSelected: { borderColor: WarshPalette.navy, backgroundColor: WarshPalette.navy },
  optionIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: Radii.full, backgroundColor: WarshPalette.sageTintBg },
  optionIconSelected: { backgroundColor: WarshPalette.gold },
  optionCopy: { flex: 1 },
  optionTitle: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyL },
  optionTitleSelected: { color: WarshPalette.white },
  optionBody: { marginTop: 2, color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption },
  optionBodySelected: { color: "rgba(255,255,255,0.72)" },
  previewCard: { minHeight: 154, marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1, borderColor: WarshPalette.cream, backgroundColor: WarshPalette.white, ...Shadows.card },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewLabel: { color: WarshPalette.subtleBrown, fontFamily: Fonts.semiBold, fontSize: FontSizes.caption, textTransform: "uppercase" },
  previewArabic: { marginTop: Spacing.sm, color: WarshPalette.navy, textAlign: "right" },
  previewMeaning: { color: WarshPalette.ink, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL, textAlign: "right" },
  previewUrdu: { fontFamily: Fonts.urduFallback, writingDirection: "rtl" },
  summary: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.full, backgroundColor: WarshPalette.sageTintBg },
  summaryText: { flex: 1, color: WarshPalette.navy, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption },
  footer: { paddingHorizontal: Spacing.gutter },
});
