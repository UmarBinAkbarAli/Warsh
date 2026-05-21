import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArabicText } from "../../components/ArabicText";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";

const STARTER_WORDS = [
  {
    arabic: "اللّٰه",
    transliteration: "Allah",
    meaning: "Allah",
    root: "ا ل ه",
    reference: "Al-Fatiha 1:2",
  },
  {
    arabic: "رَبّ",
    transliteration: "rabb",
    meaning: "Lord, Sustainer",
    root: "ر ب ب",
    reference: "Al-Fatiha 1:2",
  },
  {
    arabic: "كِتَاب",
    transliteration: "kitab",
    meaning: "book",
    root: "ك ت ب",
    reference: "Al-Baqarah 2:2",
  },
  {
    arabic: "بَيْت",
    transliteration: "bayt",
    meaning: "house",
    root: "ب ي ت",
    reference: "Madinah Reader 1",
  },
  {
    arabic: "عِلْم",
    transliteration: "ilm",
    meaning: "knowledge",
    root: "ع ل م",
    reference: "Core vocabulary",
  },
];

export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return STARTER_WORDS;

    return STARTER_WORDS.filter((word) =>
      [word.arabic, word.transliteration, word.meaning, word.root, word.reference].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Free forever</Text>
        <Text style={styles.title}>Vocabulary Bank</Text>
        <Text style={styles.subtitle}>Review the words you meet in lessons, with Quranic references kept close.</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search English, Arabic, or root"
        placeholderTextColor={Colors.text.muted}
        style={styles.searchInput}
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{STARTER_WORDS.length}</Text>
          <Text style={styles.statLabel}>starter words</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>due today</Text>
        </View>
      </View>

      {filteredWords.length ? (
        filteredWords.map((word) => (
          <View key={`${word.arabic}-${word.reference}`} style={styles.wordCard}>
            <View style={styles.wordTopRow}>
              <ArabicText size="md" style={styles.wordArabic}>
                {word.arabic}
              </ArabicText>
              <Text style={styles.reference}>{word.reference}</Text>
            </View>
            <Text style={styles.meaning}>{word.meaning}</Text>
            <Text style={styles.detail}>
              {word.transliteration} · root {word.root}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No words found</Text>
          <Text style={styles.emptyCopy}>Try a different English meaning, Arabic spelling, or root.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: LineHeights.label,
    textTransform: "uppercase",
  },
  title: {
    marginTop: Spacing.xs,
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    lineHeight: LineHeights.h1,
  },
  subtitle: {
    marginTop: Spacing.sm,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    backgroundColor: Colors.bg.surface,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  statValue: {
    color: WarshPalette.sage,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h2,
    fontWeight: "700",
    lineHeight: LineHeights.h2,
  },
  statLabel: {
    marginTop: Spacing.xs,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  wordCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  wordTopRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  wordArabic: {
    color: WarshPalette.ink,
    fontSize: FontSizes.arabicL,
    lineHeight: LineHeights.arabicL,
    textAlign: "right",
  },
  reference: {
    flexShrink: 1,
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  meaning: {
    marginTop: Spacing.sm,
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h3,
    fontWeight: "700",
    lineHeight: LineHeights.h3,
  },
  detail: {
    marginTop: Spacing.xs,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  emptyCard: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  emptyTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h3,
    fontWeight: "700",
    lineHeight: LineHeights.h3,
  },
  emptyCopy: {
    marginTop: Spacing.xs,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
});
