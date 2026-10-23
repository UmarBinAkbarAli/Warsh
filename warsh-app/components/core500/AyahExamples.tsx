import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ArabicText } from "../ArabicText";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { coreDirectionMark, type CoreAyahExample } from "../../services/core500";
import { useT } from "../../i18n";
import { useLanguage } from "../../services/language";
// One "See it in the Quran" card: the open example shows the ayah with the
// word highlighted, its translation and reference; other examples sit below
// as rows that open in its place.
export function AyahExamples({ examples, language }: { examples: CoreAyahExample[]; language: "en" | "ur" }) {
  const t = useT();
  const uiLanguage = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(examples[0]?.id ?? null);
  const open = examples.find(example => example.id === expanded);
  return <View style={styles.group}>
    <Text style={styles.heading}>{coreDirectionMark(t("core500.ayahHeading"), uiLanguage)}</Text>
    {examples.length === 0 && <Text style={styles.body}>{coreDirectionMark(t("core500.examplesPending"), uiLanguage)}</Text>}
    {open && <View style={styles.details}>
      <ArabicText size="md" style={styles.ayah}>{open.arabic.split(/\s+/).map((part, i) => <Text key={i} style={i + 1 === open.wordPosition ? styles.highlight : undefined}>{part}{" "}</Text>)}</ArabicText>
      <Text style={[styles.body, language === "ur" && styles.rtl]}>{coreDirectionMark(language === "ur" ? open.translationUr : open.translationEn, language)}</Text>
      <Text style={styles.reference}>{coreDirectionMark(`${open.surahName} ${open.surahNumber}:${open.ayahNumber}`, "en")}</Text>
      {open.matchKind !== "exact" && <Text style={styles.body}>{coreDirectionMark(t(open.matchKind === "prefix" ? "core500.prefixInAyah" : "core500.formInAyah"), uiLanguage)}</Text>}
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(open.source)}><Text style={styles.note}>{coreDirectionMark(t("core500.ayahAttribution"), uiLanguage)}</Text></Pressable>
    </View>}
    {examples.filter(example => example.id !== expanded).map(example => (
      <Pressable key={example.id} accessibilityRole="button" accessibilityState={{ expanded: false }} onPress={() => setExpanded(example.id)} style={styles.row}>
        <Text style={styles.rowReference}>{coreDirectionMark(`${example.surahName} · ${example.surahNumber}:${example.ayahNumber}`, "en")}</Text>
        <ArabicText size="sm" style={styles.surface}>{example.surface}</ArabicText>
        <Text style={styles.plus}>+</Text>
      </Pressable>
    ))}
  </View>;
}
const styles = StyleSheet.create({
  group: { padding: Spacing.lg, gap: Spacing.sm, borderRadius: Radii.xl, borderWidth: 0.5, borderColor: WarshPalette.waveformGoldIdle, backgroundColor: WarshPalette.parchmentBg },
  heading: { color: WarshPalette.goldText, fontFamily: Fonts.bold, fontSize: FontSizes.caption, letterSpacing: 1.2, textTransform: "uppercase" },
  details: { gap: 6 },
  ayah: { textAlign: "right" },
  highlight: { color: WarshPalette.ink, backgroundColor: WarshPalette.highlightBorder, fontFamily: Fonts.arabicBold },
  reference: { color: WarshPalette.goldText, fontFamily: Fonts.semiBold, fontSize: FontSizes.caption },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, minHeight: 48, borderTopWidth: 1, borderTopColor: WarshPalette.cream },
  rowReference: { flex: 1, color: WarshPalette.goldText, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyM },
  surface: { color: WarshPalette.ink },
  plus: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL },
  body: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, lineHeight: 21 },
  note: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: Spacing.xs },
  rtl: { textAlign: "right" },
});
