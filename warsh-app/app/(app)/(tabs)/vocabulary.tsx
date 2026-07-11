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
import { Image } from "expo-image";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { getVocabularyWords, getWordOfDay, getSRSDueWords } from "@services/api";
import { useLanguage, pickTranslation } from "@services/language";
import { useT } from "@i18n/index";

// ─── topic catalog ──────────────────────────────────────────────────────────

export const TOPIC_CATALOG = [
  { key: "people",      labelAr: "النَّاس",                   labelEn: "People",         labelUr: "???" },
  { key: "family",      labelAr: "العَائِلَة",                 labelEn: "Family",         labelUr: "??????" },
  { key: "body",        labelAr: "الجِسْم",                   labelEn: "Body",           labelUr: "???" },
  { key: "home",        labelAr: "البَيْت",                   labelEn: "Home",           labelUr: "???" },
  { key: "food",        labelAr: "الطَّعَام",                  labelEn: "Food",           labelUr: "?????" },
  { key: "time",        labelAr: "الزَّمَن",                   labelEn: "Time",           labelUr: "???" },
  { key: "nature",      labelAr: "الطَّبِيعَة",                labelEn: "Nature",         labelUr: "????" },
  { key: "worship",     labelAr: "العِبَادَة",                 labelEn: "Worship",        labelUr: "?????" },
  { key: "quranic",     labelAr: "مُصْطَلَحَات قُرْآنِيَّة",   labelEn: "Quranic Terms",  labelUr: "????? ????????" },
  { key: "verbs",       labelAr: "الأَفْعَال",                 labelEn: "Verbs",          labelUr: "?????" },
  { key: "travel",      labelAr: "السَّفَر",                   labelEn: "Travel",         labelUr: "???" },
  { key: "masjid",      labelAr: "المَسْجِد",                  labelEn: "Masjid",         labelUr: "????" },
  { key: "marketplace", labelAr: "السُّوق",                   labelEn: "Marketplace",    labelUr: "?????" },
  { key: "school",      labelAr: "المَدْرَسَة",                labelEn: "School",         labelUr: "?????" },
  { key: "numbers",     labelAr: "الأَعْدَاد",                 labelEn: "Numbers",        labelUr: "?????" },
  { key: "colors",      labelAr: "الأَلْوَان",                 labelEn: "Colors",         labelUr: "???" },
];

// ─── types ───────────────────────────────────────────────────────────────────

export function getTopicLabel(topicKey: string, language: "en" | "ur", t: ReturnType<typeof useT>) {
  if (language !== "ur") {
    return TOPIC_CATALOG.find((topic) => topic.key === topicKey)?.labelEn ?? topicKey;
  }

  switch (topicKey) {
    case "people":
      return t("vocabulary.topicPeople");
    case "family":
      return t("vocabulary.topicFamily");
    case "body":
      return t("vocabulary.topicBody");
    case "home":
      return t("vocabulary.topicHome");
    case "food":
      return t("vocabulary.topicFood");
    case "time":
      return t("vocabulary.topicTime");
    case "nature":
      return t("vocabulary.topicNature");
    case "worship":
      return t("vocabulary.topicWorship");
    case "quranic":
      return t("vocabulary.topicQuranic");
    case "verbs":
      return t("vocabulary.topicVerbs");
    case "travel":
      return t("vocabulary.topicTravel");
    case "masjid":
      return t("vocabulary.topicMasjid");
    case "marketplace":
      return t("vocabulary.topicMarketplace");
    case "school":
      return t("vocabulary.topicSchool");
    case "numbers":
      return t("vocabulary.topicNumbers");
    case "colors":
      return t("vocabulary.topicColors");
    default:
      return TOPIC_CATALOG.find((topic) => topic.key === topicKey)?.labelEn ?? topicKey;
  }
}

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
  imageUrl?: string | null;
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

function WordRow({ word, language, onPress }: { word: VocabWord; language: "en" | "ur"; onPress?: () => void }) {
  const t = useT();
  const inner = (
    <View style={styles.wordCard}>
      <View style={styles.wordCardContent}>
        {word.imageUrl ? (
          <Image source={{ uri: word.imageUrl }} style={styles.wordImage} contentFit="contain" cachePolicy="disk" />
        ) : null}
        <View style={styles.wordTextContent}>
          <View style={styles.wordTopRow}>
            <View style={styles.wordArabicRow}>
              <ArabicText size="md" style={styles.wordArabic}>{word.arabic}</ArabicText>
              <PlayButton text={word.arabic} wordId={word.id} size={18} />
            </View>
            {word.rootLetters ? (
              <Text style={styles.rootText}>{t("vocabulary.root", { value: word.rootLetters })}</Text>
            ) : null}
          </View>
          <Text style={styles.meaningText}>{pickTranslation(word, language)}</Text>
          <Text style={styles.detailText}>{word.transliteration}</Text>
        </View>
      </View>
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

function WordOfDayCard({ word, language, onPress }: { word: VocabWord; language: "en" | "ur"; onPress?: () => void }) {
  const t = useT();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={styles.wotdCard}>
        <Text style={styles.wotdLabel}>{t("vocabulary.wordOfDay")}</Text>
        {word.imageUrl ? (
          <Image source={{ uri: word.imageUrl }} style={styles.wotdImage} contentFit="contain" cachePolicy="disk" />
        ) : null}
        <View style={styles.wotdArabicRow}>
          <ArabicText size="xl" style={styles.wotdArabic}>{word.arabic}</ArabicText>
          <PlayButton text={word.arabic} wordId={word.id} size={28} />
        </View>
        <Text style={styles.wotdMeaning}>{pickTranslation(word, language)}</Text>
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
          <Text style={styles.wotdTapHint}>{t("vocabulary.tapToExplore")}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── topic grid ───────────────────────────────────────────────────────────────

function TopicGrid({ language, wordCounts, onPress }: { language: "en" | "ur"; wordCounts: Record<string, number>; onPress: (key: string) => void }) {
  const t = useT();
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
              <Text style={styles.topicEnglish}>{getTopicLabel(topic.key, language, t)}</Text>
              {wordCounts[topic.key] != null ? (
                <Text style={styles.topicCount}>
                  {t("vocabulary.wordCount", {
                    count: wordCounts[topic.key],
                    suffix: wordCounts[topic.key] !== 1 ? "s" : "",
                  })}
                </Text>
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
  const language = useLanguage();
  const t = useT();
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
        <Text style={styles.eyebrow}>{t("vocabulary.freeForever")}</Text>
        <Text style={styles.title}>{t("vocabulary.title")}</Text>
        <ArabicText size="md" style={styles.titleAr}>مُفْرَدَات</ArabicText>
      </View>

      {/* Search */}
      <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/(app)/vocabulary/search")}>
        <View pointerEvents="none">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("vocabulary.searchPlaceholder")}
            mode="outlined"
            dense
            editable={false}
            left={<TextInput.Icon icon="magnify" />}
            style={[styles.searchInput, { backgroundColor: Colors.bg.surface }]}
          />
        </View>
      </TouchableOpacity>

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
                language={language}
                onPress={() => router.push(`/(app)/vocabulary/word/${w.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("vocabulary.noWordsFound")}</Text>
              <Text style={styles.emptyCopy}>{t("vocabulary.tryDifferentSpelling")}</Text>
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
                language={language}
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
                  <Text style={styles.reviewCardTitle}>{t("vocabulary.review")}</Text>
                  <Text style={styles.reviewCardCount}>{t("vocabulary.reviewReady", { count: srsDueCount, suffix: srsDueCount !== 1 ? "s" : "" })}</Text>
                </View>
              </View>
              <Text style={styles.reviewCardCta}>{t("vocabulary.begin")}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{allWords.length}</Text>
              <Text style={styles.statLabel}>{t("vocabulary.wordsInBank")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>16</Text>
              <Text style={styles.statLabel}>{t("vocabulary.topics")}</Text>
            </View>
          </View>

          {/* My Words */}
          <TouchableOpacity
            style={styles.myWordsCard}
            onPress={() => router.push("/(app)/vocabulary/my-words")}
            activeOpacity={0.8}
          >
            <View style={styles.myWordsLeft}>
              <Ionicons name="bookmark-outline" size={22} color={WarshPalette.gold} />
              <View style={{ marginLeft: Spacing.sm }}>
                <Text style={styles.myWordsTitle}>{t("vocabulary.myWords")}</Text>
                <Text style={styles.myWordsSub}>{t("vocabulary.myWordsSub")}</Text>
              </View>
            </View>
            <Text style={styles.myWordsCta}>{t("common.view")} ›</Text>
          </TouchableOpacity>

          {/* Browse by Topic */}
          <Text style={styles.sectionTitle}>{t("vocabulary.browseByTopic")}</Text>
          <TopicGrid
            language={language}
            wordCounts={wordCounts}
            onPress={(key) => router.push(`/(app)/vocabulary/${key}`)}
          />

          {/* Footer */}
          <Text style={styles.footer}>{t("vocabulary.footer")}</Text>
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
    backgroundColor: WarshPalette.sageTintBg,
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

  // My Words card
  myWordsCard: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: Spacing.md,
    borderRadius: Radii.md, borderWidth: 1,
    borderColor: WarshPalette.gold + "55",
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.lg,
  },
  myWordsLeft: { flexDirection: "row", alignItems: "center" },
  myWordsTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },
  myWordsSub: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
  myWordsCta: {
    color: WarshPalette.gold, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
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
  wordCardContent: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  wordTextContent: { flex: 1, minWidth: 0 },
  wordImage: { width: 72, height: 72, borderRadius: Radii.sm },
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
  wotdImage: { width: "100%", height: 150, marginBottom: Spacing.sm },

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
