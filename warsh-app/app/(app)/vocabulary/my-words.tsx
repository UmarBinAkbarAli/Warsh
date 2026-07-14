import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import api from "@services/api";
import { useTranslationLanguage, pickTranslation } from "@services/language";
import { useT } from "@i18n/index";
import {
  WarshPalette,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  Radii,
} from "../../../constants/theme";

type Filter = "all" | "new" | "mastered" | "needs_review";
type Sort = "date" | "alpha" | "topic";

interface SRSData {
  repetitions: number;
  easeFactor: number;
  isFavorite: boolean;
  nextReviewDate: string | null;
}

interface MyWord {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
  topicCategories: string[];
  chapterIntroduced: number | null;
  sortOrder: number;
  imageUrl?: string | null;
  srs: SRSData;
}

const FILTER_OPTIONS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "mastered", label: "Mastered" },
  { key: "needs_review", label: "Needs review" },
];

const SORT_CYCLE: Sort[] = ["date", "alpha", "topic"];

export default function MyWordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useTranslationLanguage();
  const t = useT();

  const [words, setWords] = useState<MyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("date");

  const loadWords = useCallback(async (f: Filter, s: Sort) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/vocabulary/my-words?filter=${f}&sort=${s}`
      );
      setWords(res.data.data.words ?? []);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords(filter, sort);
  }, [filter, sort, loadWords]);

  const cycleSort = () => {
    const idx = SORT_CYCLE.indexOf(sort);
    setSort(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  };

  const isMastered = (srs: SRSData) =>
    srs.repetitions >= 5 && srs.easeFactor >= 2.5;

  const renderWord = ({ item }: { item: MyWord }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/vocabulary/word/${item.id}`)}
      activeOpacity={0.75}
    >
      <View style={styles.wordCard}>
        <View style={styles.wordRow}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.wordImage} contentFit="contain" cachePolicy="disk" />
          ) : null}
          {/* Left: text content */}
          <View style={styles.wordLeft}>
            <Text style={styles.arabic}>{item.arabic}</Text>
            <Text style={styles.translit}>{item.transliteration}</Text>
            <Text style={styles.translation}>{pickTranslation(item, language)}</Text>
          </View>
          {/* Right: icons + badge */}
          <View style={styles.wordRight}>
            <Ionicons
              name="volume-medium-outline"
              size={18}
              color={WarshPalette.gold}
            />
            {isMastered(item.srs) && (
              <View style={styles.masteredBadge}>
                <Text style={styles.masteredText}>{t("vocabulary.filterMastered")}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("vocabulary.myWords")}</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_OPTIONS.map((opt) => {
          const selected = filter === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setFilter(opt.key)}
              activeOpacity={0.75}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {t(
                  opt.key === "all"
                    ? "vocabulary.filterAll"
                    : opt.key === "new"
                      ? "vocabulary.filterNew"
                      : opt.key === "mastered"
                        ? "vocabulary.filterMastered"
                        : "vocabulary.filterNeedsReview"
                )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <TouchableOpacity onPress={cycleSort} activeOpacity={0.75}>
          <Text style={styles.sortLabel}>
            {t("vocabulary.sortLabel", {
              value:
                sort === "date"
                  ? t("vocabulary.sortDate")
                  : sort === "alpha"
                    ? t("vocabulary.sortAlpha")
                    : t("vocabulary.sortTopic"),
            })} ▾
          </Text>
        </TouchableOpacity>
      </View>

      {/* Word list */}
      {loading ? (
        <ActivityIndicator
          color={WarshPalette.gold}
          style={{ marginTop: Spacing.xl }}
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={renderWord}
          contentContainerStyle={
            words.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t("vocabulary.myWordsEmpty")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarshPalette.creamBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: WarshPalette.ink,
  },
  filterRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.white,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
  chipSelected: {
    backgroundColor: WarshPalette.gold,
    borderColor: WarshPalette.gold,
  },
  chipText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.bodyBrown,
  },
  chipTextSelected: {
    color: WarshPalette.white,
  },
  sortRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    alignItems: "flex-end",
  },
  sortLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.gold,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  wordCard: {
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
  },
  wordImage: { width: 64, height: 64, borderRadius: Radii.sm },
  wordRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  wordLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  arabic: {
    fontFamily: Fonts.arabic,
    fontSize: FontSizes.arabicM,
    color: WarshPalette.ink,
    textAlign: "right",
    writingDirection: "rtl",
  },
  translit: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },
  translation: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    marginTop: 2,
  },
  wordRight: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  masteredBadge: {
    backgroundColor: WarshPalette.gold,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: Spacing.xs,
  },
  masteredText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.white,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
});
