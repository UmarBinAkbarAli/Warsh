import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QURAN_FONT } from "@components/quran/MushafPage";
import { QuranSettingsSheet } from "@components/quran/QuranSheets";
import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { chapters, getChapter, juzForPage, juzStarts, surahForPage, type Chapter } from "../../../services/quran/data";

type Tab = "surah" | "juz" | "bookmarks";

type Row = { key: string; badge: string; title: string; subtitle: string; arabic?: string; page: number };

/** Surah, juz and bookmark lists for the Quran reader (Pen section 27, screen 2). */
export default function QuranIndexScreen() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const lastPage = useQuranStore((s) => s.lastPage);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const [tab, setTab] = useState<Tab>("surah");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openPage = (page: number) => router.push({ pathname: "/(app)/quran/[page]", params: { page: String(page) } });

  const rows = useMemo<Row[]>(() => {
    if (tab === "juz") {
      return juzStarts.map((juz) => ({
        key: `juz-${juz.juz}`,
        badge: String(juz.juz),
        title: t("quran.juz", { juz: juz.juz }),
        subtitle: t("quran.juzStarts", { surah: getChapter(juz.surah).en, page: juz.page }),
        page: juz.page,
      }));
    }
    if (tab === "bookmarks") {
      return bookmarks.map((page) => {
        const chapter = surahForPage(page);
        return {
          key: `bookmark-${page}`,
          badge: String(page),
          title: chapter.en,
          subtitle: t("quran.pageJuz", { page, juz: juzForPage(page) }),
          arabic: chapter.ar,
          page,
        };
      });
    }
    return filterChapters(query).map((chapter) => ({
      key: `surah-${chapter.n}`,
      badge: String(chapter.n),
      title: chapter.en,
      subtitle: t("quran.surahMeta", {
        meaning: chapter.meaning,
        place: t(chapter.place === "meccan" ? "quran.meccan" : "quran.medinan"),
        ayat: chapter.ayat,
      }),
      arabic: chapter.ar,
      page: chapter.page,
    }));
  }, [tab, query, bookmarks, t]);

  const lastChapter = lastPage ? surahForPage(lastPage) : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(app)/(tabs)"))}
          hitSlop={10}
          style={styles.titleButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="chevron-back" size={24} color={WarshPalette.navy} />
          <Text style={styles.title}>{t("quran.title")}</Text>
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              setSearching((open) => !open);
              setQuery("");
              setTab("surah");
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.search")}
          >
            <Ionicons name={searching ? "close" : "search"} size={22} color={WarshPalette.navy} />
          </Pressable>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("quran.settings.title")}
          >
            <Ionicons name="options-outline" size={22} color={WarshPalette.navy} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            {searching ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus
                placeholder={t("quran.searchPlaceholder")}
                placeholderTextColor={WarshPalette.disabledText}
                style={styles.search}
                accessibilityLabel={t("common.search")}
              />
            ) : null}

            {lastPage && lastChapter && !searching ? (
              <Pressable
                onPress={() => openPage(lastPage)}
                style={({ pressed }) => [styles.continueStrip, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Ionicons name="bookmark" size={18} color={WarshPalette.parchment} />
                <View style={styles.continueCopy}>
                  <Text style={styles.continueLabel}>{t("quran.continueReading")}</Text>
                  <Text style={styles.continueValue}>
                    {t("quran.surahPage", { surah: lastChapter.en, page: lastPage })}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={WarshPalette.white} />
              </Pressable>
            ) : null}

            {!searching ? (
              <View style={styles.segmented}>
                {(["surah", "juz", "bookmarks"] as Tab[]).map((value) => {
                  const selected = tab === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setTab(value)}
                      style={[styles.segment, selected && styles.segmentSelected]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                        {t(`quran.tab.${value}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === "bookmarks" ? t("quran.noBookmarks") : t("quran.noResults")}
          </Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openPage(item.page)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rowSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>
            <View style={styles.rowEnd}>
              {item.arabic ? <Text style={styles.rowArabic}>{item.arabic}</Text> : null}
              <Text style={styles.rowPage}>{t("quran.pageShort", { page: item.page })}</Text>
            </View>
          </Pressable>
        )}
      />

      <QuranSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

// Matches a surah number, or an English or Arabic name with the "Al-" /
// apostrophes / harakat folded away, so "baqara", "2" and "البقرة" all work.
function filterChapters(query: string): Chapter[] {
  const needle = fold(query);
  if (!needle) return chapters;
  return chapters.filter(
    (chapter) =>
      String(chapter.n) === needle ||
      fold(chapter.en).includes(needle) ||
      fold(chapter.meaning).includes(needle) ||
      fold(chapter.ar).includes(needle),
  );
}

function fold(value: string) {
  return value
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/^(al|an|ar|as|at|ad|adh|az|ash)[-\s]/, "")
    .replace(/['’`\-\s]/g, "")
    .trim();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  titleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.navy,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg + 2,
  },
  content: {
    paddingHorizontal: Spacing.gutter,
  },
  header: {
    gap: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  search: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.white,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
  },
  continueStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: WarshPalette.navy,
  },
  continueCopy: {
    flex: 1,
    gap: 2,
  },
  continueLabel: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1,
    color: WarshPalette.parchment,
  },
  continueValue: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.white,
  },
  segmented: {
    flexDirection: "row",
    padding: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  segmentSelected: {
    backgroundColor: WarshPalette.white,
  },
  segmentText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM - 1,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.subtleBrown,
  },
  segmentTextSelected: {
    fontFamily: Fonts.bold,
    color: WarshPalette.navy,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: WarshPalette.cream,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1,
    borderColor: WarshPalette.parchment,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    color: WarshPalette.navy,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL - 1,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.ink,
  },
  rowSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption - 1,
    lineHeight: LineHeights.caption - 2,
    color: WarshPalette.subtleBrown,
  },
  rowEnd: {
    alignItems: "flex-end",
  },
  rowArabic: {
    fontFamily: QURAN_FONT,
    fontSize: 20,
    lineHeight: 34,
    color: WarshPalette.navy,
  },
  rowPage: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    color: WarshPalette.goldDeep,
  },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    paddingVertical: Spacing.xxl,
  },
});
