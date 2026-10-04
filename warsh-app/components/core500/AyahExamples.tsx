import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ArabicText } from "../ArabicText";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { coreDirectionMark, type CoreAyahExample } from "../../services/core500";
import { useT } from "../../i18n";
import { useLanguage } from "../../services/language";
export function AyahExamples({ examples, language }: { examples: CoreAyahExample[]; language: "en" | "ur" }) {
  const t = useT();
  const uiLanguage = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(examples[0]?.id ?? null);
  return <View style={styles.group}>
    <Text style={styles.heading}>{coreDirectionMark(t("core500.ayahHeading"), uiLanguage)}</Text>
    {examples.length === 0 && <Text style={styles.body}>{coreDirectionMark(t("core500.examplesPending"), uiLanguage)}</Text>}
    {examples.map(example => {
      const open = expanded === example.id;
      return <View key={example.id} style={styles.example}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setExpanded(open ? null : example.id)} style={styles.row}>
          <Text style={styles.reference}>{coreDirectionMark(`${example.surahName} · ${example.surahNumber}:${example.ayahNumber}`, "en")}</Text>
          <ArabicText size="sm" style={styles.surface}>{example.surface}</ArabicText>
          <Text style={styles.body}>{open ? "−" : "+"}</Text>
        </Pressable>
        {open && <View style={styles.details}>
          <ArabicText size="md">{example.arabic.split(/\s+/).map((part, i) => <Text key={i} style={i + 1 === example.wordPosition ? styles.highlight : undefined}>{part}{" "}</Text>)}</ArabicText>
          <Text style={[styles.body, language === "ur" && styles.rtl]}>{coreDirectionMark(language === "ur" ? example.translationUr : example.translationEn, language)}</Text>
          {example.matchKind !== "exact" && <Text style={styles.note}>{coreDirectionMark(t(example.matchKind === "prefix" ? "core500.prefixInAyah" : "core500.formInAyah"), uiLanguage)}</Text>}
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(example.source)}><Text style={styles.note}>{coreDirectionMark(t("core500.ayahAttribution"), uiLanguage)}</Text></Pressable>
        </View>}
      </View>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  group: { gap: Spacing.sm, marginTop: Spacing.lg },
  heading: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: FontSizes.h3 },
  example: { borderWidth: 1, borderColor: WarshPalette.listDivider, borderRadius: Radii.md, backgroundColor: WarshPalette.parchmentBg },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, minHeight: 56 },
  reference: { flex: 1, color: WarshPalette.goldText, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyM },
  surface: { color: WarshPalette.ink },
  details: { padding: Spacing.md, paddingTop: 0, gap: Spacing.md },
  highlight: { color: WarshPalette.goldText, backgroundColor: WarshPalette.highlightBg, fontFamily: Fonts.arabicBold },
  body: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL },
  note: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption },
  rtl: { textAlign: "right" },
});
