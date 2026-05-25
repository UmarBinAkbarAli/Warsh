import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { getVocabularyWords, getWordOfDay, getSRSDueWords } from "@services/api";

// ─── topic catalog ──────────────────────────────────────────────────────────

export const TOPIC_CATALOG = [
  { key: "people",      labelAr: "النَّاس",                   labelEn: "People" },
  { key: "family",      labelAr: "العَائِلَة",                 labelEn: "Family" },
  { key: "body",        labelAr: "الجِسْم",                   labelEn: "Body" },
  { key: "home",        labelAr: "البَيْت",                   labelEn: "Home" },
  { key: "food",        labelAr: "الطَّعَام",                  labelEn: "Food" },
  { key: "time",        labelAr: "الزَّمَن",                   labelEn: "Time" },
  { key: "nature",      labelAr: "الطَّبِيعَة",                labelEn: "Nature" },
  { key: "worship",     labelAr: "العِبَادَة",                 labelEn: "Worship" },
  { key: "quranic",     labelAr: "مُصْطَلَحَات قُرْآنِيَّة",   labelEn: "Quranic Terms" },
  { key: "verbs",       labelAr: "الأَفْعَال",                 labelEn: "Verbs" },
  { key: "travel",      labelAr: "السَّفَر",                   labelEn: "Travel" },
  { key: "masjid",      labelAr: "المَسْجِد",                  labelEn: "Masjid" },
  { key: "marketplace", labelAr: "السُّوق",                   labelEn: "Marketplace" },
  { key: "school",      labelAr: "المَدْرَسَة",                labelEn: "School" },
  { key: "numbers",     labelAr: "الأَعْدَاد",                 labelEn: "Numbers" },
  { key: "colors",      labelAr: "الأَلْوَان",                 labelEn: "Colors" },
];

// ─── types ───────────────────────────────────────────────────────────────────

interface VocabWord {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
  gender?: string | null;
  rootLetters?: string | null;
  topicCategories: string[];
  quranicExample?: {
    surahNumber: number;
    surahNameEn: string;
    ayahNumber: number;
    ayahArabic: string;
    translationEn: string;
  } | null;
}

// ─── word row ─────────────────────────────────────────────────────────────────

function WordRow({ word, onPress }: { word: VocabWord; onPress?: () => void }) {
  const inner = (
    <View style={styles.wordCard}>
      <View style={styles.wordTopRow}>
        <View style={styles.wordArabicRow}>
          <ArabicText size="md" style={styles.wordArabic}>{word.arabic}</ArabicText>
          <PlayButton text={word.arabic} cacheKey={word.arabicPlain} category="words" size={18} />
        </View>
        {word.rootLetters ? (
          <Text style={styles.rootText}>root: {word.rootLetters}</Text>
        ) : null}
      </View>
      <Text style={styles.meaningText}>{word.translationEn}</Text>
      <Text style={styles.detailText}>{word.transliteration}</Text>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{inner}</TouchableOpacity>
    );
  }
  return inner;
}

// ─── word of day card ────────────────────────────────────────────────────────

function WordOfDayCard({ word, onPress }: { word: VocabWord; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={styles.wotdCard}>
        <Text style={styles.wotdLabel}>Today's Word · كَلِمَة الْيَوْم</Text>
        <View style={styles.wotdArabicRow}>
          <ArabicText size="xl" style={styles.wotdArabic}>{word.arabic}</ArabicText>
          <PlayButton text={word.arabic} cacheKey={word.arabicPlain} category="words" size={28} />
        </View>
        <Text style={styles.wotdMeaning}>{word.translationEn}</Text>
        <Text style={styles.wotdTranslit}>{word.transliteration}</Text>
        {word.quranicExample ? (
          <View style={styles.wotdAyah}>
            <ArabicText size="sm" style={styles.wotdAyahText}>{word.quranicExample.ayahArabic}</ArabicText>
            <Text style={styles.wotdAyahRef}>
              {word.quranicExample.surahNameEn} · {word.quranicExample.surahNumber}:{word.quranicExample.ayahNumber}
            </Text>
          </View>
        ) : null}
        {onPress ? (
          <Text style={styles.wotdTapHint}>Tap to explore</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── topic grid ───────────────────────────────────────────────────────────────

function TopicGrid({ wordCounts, onPress }: { wordCounts: Record<string, number>; onPress: (key: string) => void }) {
  const pairs = [];
  for (let i = 0; i < TOPIC_CATALOG.length; i += 2) {
    pairs.push(TOPIC_CATALOG.slice(i, i + 2));
  }

  return (
    <View>
      {pairs.map((pair) => (
        <View key={pair[0].key} style={styles.topicRow}>
          {pair.map((topic) => (
            <TouchableOpacity
              key={topic.key}
              style={styles.topicCard}
              onPress={() => onPress(topic.key)}
              activeOpacity={0.75}
            >
              <ArabicText size="sm" style={styles.topicArabic}>{topic.labelAr}</ArabicText>
              <Text style={styles.topicEnglish}>{topic.labelEn}</Text>
              {wordCounts[topic.key] != null ? (
                <Text style={styles.topicCount}>{wordCounts[topic.key]} words</Text>
              ) : null}
            </TouchableOpacity>
          ))}
          {pair.length === 1 ? <View style={styles.topicCard} /> : null}
        </View>
      ))}
    </View>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [wordOfDay, setWordOfDay] = useState<VocabWord | null>(null);
  const [searchResults, setSearchResults] = useState<VocabWord[]>([]);
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [srsDueCount, setSrsDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [])
  );

  async function fetchAllWords(): Promise<VocabWord[]> {
    const collected: VocabWord[] = [];
    let page = 1;
    while (true) {
      const res = await getVocabularyWords({ page });
      const words: VocabWord[] = res.data.data;
      collected.push(...words);
      if (!res.data.meta?.hasMore) break;
      page += 1;
    }
    return collected;
  }

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [wotdRes, allWords, srsRes] = await Promise.all([
        getWordOfDay(),
        fetchAllWords(),
        getSRSDueWords().catch(() => ({ data: { data: [] } })),
      ]);
      setWordOfDay(wotdRes.data.data);
      setAllWords(allWords);
      setSrsDueCount((srsRes.data.data as unknown[]).length);
    } catch {
      // silently fall back to empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    getVocabularyWords({ search: q })
      .then((res) => setSearchResults(res.data.data))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [query]);

  const wordCounts: Record<string, number> = {};
  for (const word of allWords) {
    for (const topic of word.topicCategories) {
      wordCounts[topic] = (wordCounts[topic] ?? 0) + 1;
    }
  }

  const isSearching = query.trim().length >= 2;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Free forever · مجانيٌّ دائماً</Text>
        <Text style={styles.title}>Vocabulary</Text>
        <ArabicText size="md" style={styles.titleAr}>مُفْرَدَات</ArabicText>
      </View>

      {/* Search */}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search Arabic, English, or root"
        mode="outlined"
        dense
        left={<TextInput.Icon icon="magnify" />}
        style={[styles.searchInput, { backgroundColor: Colors.bg.surface }]}
      />

      {loading ? (
        <ActivityIndicator color={WarshPalette.gold} style={{ marginTop: Spacing.xl }} />
      ) : isSearching ? (
        /* Search results */
        <View style={{ marginTop: Spacing.lg }}>
          {searching ? (
            <ActivityIndicator color={WarshPalette.gold} />
          ) : searchResults.length > 0 ? (
            searchResults.map((w) => (
              <WordRow
                key={w.id}
                word={w}
                onPress={() => router.push(`/(app)/vocabulary/word/${w.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No words found</Text>
              <Text style={styles.emptyCopy}>Try a different spelling, English meaning, or root letters.</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Word of Day */}
          {wordOfDay ? (
            <View style={{ marginTop: Spacing.lg }}>
              <WordOfDayCard
                word={wordOfDay}
                onPress={() => router.push(`/(app)/vocabulary/word/${wordOfDay.id}`)}
              />
            </View>
          ) : null}

          {/* SRS Review card */}
          {srsDueCount > 0 ? (
            <TouchableOpacity
              style={styles.reviewCard}
              onPress={() => router.push("/(app)/vocabulary/review")}
              activeOpacity={0.8}
            >
              <View style={styles.reviewCardLeft}>
                <Ionicons name="repeat-outline" size={22} color={WarshPalette.sage} />
                <View style={{ marginLeft: Spacing.sm }}>
                  <Text style={styles.reviewCardTitle}>Review</Text>
                  <Text style={styles.reviewCardCount}>{srsDueCount} word{srsDueCount !== 1 ? "s" : ""} ready</Text>
                </View>
              </View>
              <Text style={styles.reviewCardCta}>Begin</Text>
            </TouchableOpacity>
          ) : null}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{allWords.length}</Text>
              <Text style={styles.statLabel}>words in bank</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>16</Text>
              <Text style={styles.statLabel}>topics</Text>
            </View>
          </View>

          {/* Browse by Topic */}
          <Text style={styles.sectionTitle}>Browse by Topic</Text>
          <TopicGrid
            wordCounts={wordCounts}
            onPress={(key) => router.push(`/(app)/vocabulary/${key}`)}
          />

          {/* Footer */}
          <Text style={styles.footer}>Vocabulary stays with you, always.</Text>
        </>
      )}
    </ScrollView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl * 2 },

  header: { marginBottom: Spacing.lg },
  eyebrow: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.label, fontWeight: "700", textTransform: "uppercase",
  },
  title: {
    marginTop: 2, color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h1, fontWeight: "700", lineHeight: LineHeights.h1,
  },
  titleAr: { color: WarshPalette.gold, marginTop: 0 },

  searchInput: {
    marginBottom: Spacing.sm,
  },

  // Word of Day
  wotdCard: {
    padding: Spacing.lg, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: WarshPalette.gold + "55",
    backgroundColor: WarshPalette.parchmentBg,
  },
  wotdLabel: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, fontWeight: "700", textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  wotdArabicRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: Spacing.xs,
  },
  wotdArabic: { color: WarshPalette.ink, flex: 1 },
  wotdMeaning: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700", lineHeight: LineHeights.h3,
  },
  wotdTranslit: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, fontStyle: "italic", marginTop: 2,
  },
  wotdAyah: {
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 0.5, borderTopColor: WarshPalette.parchmentCardBorder,
  },
  wotdAyahText: { color: WarshPalette.ink, textAlign: "right" },
  wotdAyahRef: {
    marginTop: 4, color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  wotdTapHint: {
    marginTop: Spacing.sm, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
    textAlign: "right",
  },

  // SRS Review card
  reviewCard: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: Spacing.md,
    borderRadius: Radii.md, borderWidth: 1,
    borderColor: WarshPalette.sage + "55",
    backgroundColor: "#EDF5ED",
    marginTop: Spacing.md,
  },
  reviewCardLeft: { flexDirection: "row", alignItems: "center" },
  reviewCardTitle: {
    color: WarshPalette.sage, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },
  reviewCardCount: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
  reviewCardCta: {
    color: WarshPalette.sage, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },

  // Stats
  statsRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, padding: Spacing.md, borderRadius: Radii.sm,
    borderWidth: 1, borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  statValue: {
    color: WarshPalette.sage, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700", lineHeight: LineHeights.h2,
  },
  statLabel: {
    marginTop: Spacing.xs, color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
  },

  // Section
  sectionTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700", lineHeight: LineHeights.h3,
    marginBottom: Spacing.md,
  },

  // Topic grid
  topicRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.md },
  topicCard: {
    flex: 1, padding: Spacing.md, borderRadius: Radii.md,
    borderWidth: 0.5, borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg, minHeight: 80,
    justifyContent: "center",
  },
  topicArabic: { color: WarshPalette.ink, textAlign: "right", marginBottom: 2 },
  topicEnglish: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM,
  },
  topicCount: {
    marginTop: 2, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
  },

  // Word card
  wordCard: {
    marginBottom: Spacing.sm, padding: Spacing.md,
    borderRadius: Radii.md, borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  wordTopRow: {
    flexDirection: "row-reverse", alignItems: "center",
    justifyContent: "space-between", gap: Spacing.sm,
  },
  wordArabicRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  wordArabic: { color: WarshPalette.ink },
  rootText: {
    flexShrink: 1, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
  },
  meaningText: {
    marginTop: Spacing.xs, color: WarshPalette.ink,
    fontFamily: Fonts.display, fontSize: FontSizes.bodyL,
    fontWeight: "700", lineHeight: LineHeights.bodyL,
  },
  detailText: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, fontStyle: "italic",
  },

  // Empty
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

  footer: {
    marginTop: Spacing.xl, textAlign: "center",
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, fontStyle: "italic",
  },
});
