import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandButton } from "@components/BrandButton";
import { useT } from "@i18n/index";
import { useOnboardingStore } from "@stores/onboardingStore";
import { FontSizes, Fonts, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";

export default function OnboardingLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useOnboardingStore();
  const t = useT();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg }]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{t("language.appStep")}</Text>
        <Text style={styles.title}>{t("onboarding.languageTitle")}</Text>
        <Text style={styles.body}>{t("onboarding.languageBody")}</Text>

        <View style={styles.options} accessibilityRole="radiogroup">
          {(["en", "ur"] as const).map((value) => {
            const selected = language === value;
            return (
              <TouchableOpacity
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                activeOpacity={0.82}
                onPress={() => setLanguage(value)}
                style={[styles.option, selected ? styles.optionSelected : null]}
              >
                <View style={[styles.optionIcon, selected ? styles.optionIconSelected : null]}>
                  <Ionicons name={selected ? "checkmark" : "language-outline"} size={24} color={selected ? WarshPalette.white : WarshPalette.subtleBrown} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionTitle, selected ? styles.optionTitleSelected : null]}>
                    {value === "ur" ? t("language.urdu") : t("language.english")}
                  </Text>
                  <Text style={[styles.optionBody, selected ? styles.optionBodySelected : null]}>
                    {value === "ur" ? t("language.interfaceUrdu") : t("language.interfaceEnglish")}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons name="book-outline" size={20} color={WarshPalette.goldDeep} />
          </View>
          <View style={styles.noteCopy}>
            <Text style={styles.noteTitle}>{t("language.meaningsSeparateTitle")}</Text>
            <Text style={styles.noteBody}>{t("language.meaningsSeparateBody")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <BrandButton title={t("common.continue")} onPress={() => router.push("/(auth)/onboarding/translation-language" as never)} />
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
  options: { gap: Spacing.md, marginTop: Spacing.xxl },
  option: { minHeight: 88, flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1, borderColor: WarshPalette.cream, backgroundColor: WarshPalette.white, ...Shadows.card },
  optionSelected: { borderColor: WarshPalette.navy, backgroundColor: WarshPalette.navy },
  optionIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: Radii.full, backgroundColor: WarshPalette.sageTintBg },
  optionIconSelected: { backgroundColor: WarshPalette.gold },
  optionCopy: { flex: 1 },
  optionTitle: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: FontSizes.h2 },
  optionTitleSelected: { color: WarshPalette.white },
  optionBody: { marginTop: 3, color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption },
  optionBodySelected: { color: "rgba(255,255,255,0.72)" },
  noteCard: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl, padding: Spacing.md, borderRadius: Radii.md, backgroundColor: WarshPalette.sageTintBg },
  noteIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: Radii.full, backgroundColor: WarshPalette.highlightBg },
  noteCopy: { flex: 1 },
  noteTitle: { color: WarshPalette.navy, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyM },
  noteBody: { marginTop: 2, color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption },
  footer: { paddingHorizontal: Spacing.gutter },
});
