import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { getVocabularyWords } from "@services/api";
import { TOPIC_CATALOG } from "../(tabs)/vocabulary";

interface VocabWord {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
  rootLetters?: string | null;
  quranicExample?: {
    surahNameEn: string;
    surahNumber: number;
    ayahNumber: number;
    ayahArabic: string;
    translationEn: string;
  } | null;
}

export default function TopicDetailScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topicMeta = TOPIC_CATALOG.find((t) => t.key === topic);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!topic) return;
      setLoading(true);
      getVocabularyWords({ topic })
        .then((res) => setWords(res.data.data))
        .catch(() => setWords([]))
        .finally(() => setLoading(false));
    }, [topic])
  );

  const filtered = query.trim().length >= 2
    ? words.filter((w) =>
        [w.arabic, w.arabicPlain, w.transliteration, w.translationEn, w.rootLetters ?? ""].some(
          (f) => f.toLowerCase().includes(query.trim().toLowerCase())
        )
      )
    : words;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.backBtn} onPress={() => router.back()}>‹ Back</Text>
        <View style={styles.headerTitle}>
          <ArabicText size="md" style={styles.headerAr}>{topicMeta?.labelAr ?? topic}</ArabicText>
          <Text style={styles.headerEn}>{topicMeta?.labelEn ?? topic}</Text>
        </View>
      </View>

      {/* Search within topic */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search within topic"
          placeholderTextColor={Colors.text.muted}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={WarshPalette.gold} style={{ marginTop: Spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.length > 0 ? (
            filtered.map((word) => (
              <TouchableOpacity
                key={word.id}
                onPress={() => router.push(`/(app)/vocabulary/word/${word.id}`)}
                activeOpacity={0.75}
              >
                <View style={styles.wordCard}>
                  <View style={styles.topRow}>
                    <View style={styles.arabicRow}>
                      <ArabicText size="md" style={styles.arabic}>{word.arabic}</ArabicText>
                      <PlayButton text={word.arabic} cacheKey={word.arabicPlain} category="words" size={18} />
                    </View>
                    {word.rootLetters ? (
                      <Text style={styles.root}>root: {word.rootLetters}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.meaning}>{word.translationEn}</Text>
                  <Text style={styles.translit}>{word.transliteration}</Text>
                  {word.quranicExample ? (
                    <View style={styles.ayahBox}>
                      <ArabicText size="sm" style={styles.ayahText}>{word.quranicExample.ayahArabic}</ArabicText>
                      <Text style={styles.ayahRef}>
                        {word.quranicExample.surahNameEn} · {word.quranicExample.surahNumber}:{word.quranicExample.ayahNumber}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No words found</Text>
              <Text style={styles.emptyCopy}>Try clearing the search filter.</Text>
            </View>
          )}

          <Text style={styles.countNote}>{filtered.length} word{filtered.length !== 1 ? "s" : ""}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.parchmentCardBorder,
  },
  backBtn: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, marginBottom: Spacing.sm,
  },
  headerTitle: { alignItems: "flex-end" },
  headerAr: { color: WarshPalette.ink },
  headerEn: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700", lineHeight: LineHeights.h2,
  },

  searchInput: {
    borderWidth: 1, borderColor: Colors.border.subtle, borderRadius: Radii.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.text.primary, backgroundColor: Colors.bg.surface,
    fontSize: FontSizes.bodyM,
  },

  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl * 2 },

  wordCard: {
    marginBottom: Spacing.sm, padding: Spacing.md,
    borderRadius: Radii.md, borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  topRow: {
    flexDirection: "row-reverse", alignItems: "center",
    justifyContent: "space-between", gap: Spacing.sm,
  },
  arabicRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  arabic: { color: WarshPalette.ink },
  root: {
    flexShrink: 1, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
  },
  meaning: {
    marginTop: Spacing.xs, color: WarshPalette.ink,
    fontFamily: Fonts.display, fontSize: FontSizes.bodyL,
    fontWeight: "700", lineHeight: LineHeights.bodyL,
  },
  translit: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, fontStyle: "italic",
  },
  ayahBox: {
    marginTop: Spacing.sm, paddingTop: Spacing.sm,
    borderTopWidth: 0.5, borderTopColor: WarshPalette.parchmentCardBorder,
  },
  ayahText: { color: WarshPalette.ink, textAlign: "right" },
  ayahRef: {
    marginTop: 2, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
  },

  emptyCard: {
    padding: Spacing.lg, borderRadius: Radii.md,
    borderWidth: 1, borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  emptyTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700",
  },
  emptyCopy: {
    marginTop: Spacing.xs, color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyM,
  },
  countNote: {
    marginTop: Spacing.lg, textAlign: "center",
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
});
