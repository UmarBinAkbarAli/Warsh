import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { INDOPAK_FONT, QURAN_FONT } from "@components/quran/MushafPage";
import { QuranSettingsSheet } from "@components/quran/QuranSheets";
import { useWebLayout, useWebPageStyle } from "@components/WebPage";
import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { track } from "@services/analytics";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette, WebLayout, desktopFontSize, desktopLineHeight } from "../../../constants/theme";
import {
  chapters,
  getChapter,
  juzForPage,
  juzStarts,
  pageForAyah,
  surahForPage,
  surahPage,
  type Chapter,
  type JuzStart,
} from "../../../services/quran/data";

type Tab = "surah" | "juz" | "bookmarks";

type Row = {
  key: string;
  badge: string;
  title: string;
  subtitle: string;
  arabic?: string;
  /** The Arabic is Indo-Pak text (a parah name), drawn in its own font. */
  indoPak?: boolean;
  page: number;
  bookmarkAyah?: number;
  /** An empty cell that fills out the last row of the web grid. */
  pad?: boolean;
};

/** Surah, juz (parah) and bookmark lists for the Quran reader (Pen sections 27 and 28). */
export default function QuranIndexScreen({ isTab = false }: { isTab?: boolean }) {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const layout = useQuranStore((s) => s.layout);
  const lastAyah = useQuranStore((s) => s.lastAyah);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const removeBookmark = useQuranStore((s) => s.removeBookmark);
  const lastPage = lastAyah ? pageForAyah(layout, lastAyah) : null;
  const [tab, setTab] = useState<Tab>("surah");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  // A Collection page on web (design system › Web layout): the list becomes a
  // 2 / 3 / 4-column grid of cards on the shared frame.
  const webLayout = useWebLayout();
  const collectionStyle = useWebPageStyle("collection");
  const columns = webLayout.isWeb ? webLayout.gridColumns : 1;

  const openPage = (page: number) => router.push({ pathname: "/(app)/quran/[page]", params: { page: String(page) } });

  const rows = useMemo<Row[]>(() => {
    if (tab === "juz") {
      return juzStarts(layout).map((juz, index, all) =>
        juz.en && juz.ar && juz.ayah
          ? {
              key: `juz-${juz.juz}`,
              badge: String(juz.juz),
              title: t("quran.parahName", { juz: juz.juz, name: juz.en }),
              subtitle: parahRange(juz, all[index + 1]),
              arabic: juz.ar,
              indoPak: true,
              page: juz.page,
            }
          : {
              key: `juz-${juz.juz}`,
              badge: String(juz.juz),
              title: t("quran.juz", { juz: juz.juz }),
              subtitle: t("quran.juzStarts", { surah: getChapter(juz.surah).en, page: juz.page }),
              page: juz.page,
            },
      );
    }
    if (tab === "bookmarks") {
      return bookmarks.map((ayah) => {
        const page = pageForAyah(layout, ayah);
        const chapter = surahForPage(layout, page);
        return {
          key: `bookmark-${ayah}`,
          bookmarkAyah: ayah,
          badge: String(page),
          title: chapter.en,
          subtitle: t("quran.pageJuz", { page, juz: juzForPage(layout, page) }),
          arabic: chapter.ar,
          page,
        };
      });
    }
    return filterChapters(query).map((chapter) => ({
      key: `surah-${chapter.n}`,
      badge: String(chapter.n),
      title: chapter.en,
      // While searching, the row says where the surah is rather than what it means.
      subtitle: searching
        ? t("quran.searchMeta", { ayat: chapter.ayat, page: surahPage(layout, chapter.n) })
        : t("quran.surahMeta", {
            meaning: chapter.meaning,
            place: t(chapter.place === "meccan" ? "quran.meccan" : "quran.medinan"),
            ayat: chapter.ayat,
          }),
      arabic: chapter.ar,
      page: surahPage(layout, chapter.n),
    }));
  }, [tab, query, bookmarks, layout, searching, t]);

  function closeSearch() {
    setSearching(false);
    setQuery("");
  }

  const lastChapter = lastPage ? surahForPage(layout, lastPage) : null;
  const remainder = rows.length % columns;
  const gridRows: Row[] =
    columns > 1 && remainder > 0
      ? [
          ...rows,
          ...Array.from({ length: columns - remainder }, (_, i) => ({ key: `pad-${i}`, pad: true, badge: "", title: "", subtitle: "", page: 0 })),
        ]
      : rows;

  return (
    <View style={[styles.screen, { paddingTop: webLayout.isWeb ? 36 : insets.top + Spacing.sm }]}>
      <View style={[styles.topBar, webLayout.isWeb && collectionStyle]}>
        {/* On web the sidebar always marks Quran as the current page, and the
            tab and this stack copy share the /quran URL, so neither gets a
            back chevron there. */}
        {isTab || webLayout.isWeb ? (
          <View style={styles.titleButton}>
            <Text style={styles.title}>{t("quran.title")}</Text>
          </View>
        ) : (
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
        )}
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
        // numColumns can't change on a mounted list, so a new column count remounts it.
        key={`cols-${columns}`}
        data={gridRows}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: WebLayout.gridGap } : undefined}
        keyExtractor={(row) => row.key}
        contentContainerStyle={[
          styles.content,
          webLayout.isWeb && collectionStyle,
          {
            paddingBottom: webLayout.isWeb
              ? Spacing.xxl
              : isTab
                ? insets.bottom + 90
                : insets.bottom + Spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={[styles.header, webLayout.isWeb && styles.webHeader]}>
            {searching ? (
              <View style={styles.searchRow}>
                <View style={styles.searchField}>
                  <Ionicons name="search" size={18} color={WarshPalette.subtleBrown} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    placeholder={t("quran.searchPlaceholder")}
                    placeholderTextColor={WarshPalette.disabledText}
                    style={styles.search}
                    accessibilityLabel={t("quran.searchSurahs")}
                  />
                </View>
                <Pressable onPress={closeSearch} style={styles.searchCancel} accessibilityRole="button">
                  <Text style={styles.searchCancelText}>{t("common.cancel")}</Text>
                </Pressable>
              </View>
            ) : null}
            {searching && query.trim() && rows.length > 0 ? (
              <Text style={styles.resultCount}>{t("quran.searchCount", { count: rows.length })}</Text>
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
          tab === "bookmarks" && !searching ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="bookmark-outline" size={28} color={WarshPalette.goldText} />
              </View>
              <Text style={styles.emptyTitle}>{t("quran.noBookmarksTitle")}</Text>
              <Text style={styles.emptyBody}>{t("quran.noBookmarks")}</Text>
              <Pressable
                onPress={() => openPage(lastPage ?? 1)}
                style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.emptyActionText}>{t("quran.startReading")}</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.empty}>{t("quran.noResults")}</Text>
          )
        }
        ItemSeparatorComponent={() => <View style={columns > 1 ? styles.gridSpacer : styles.separator} />}
        renderItem={({ item }) => item.pad ? <View style={styles.gridCell} /> : (
          <View style={[styles.rowWrap, columns > 1 && [styles.gridCell, styles.gridCard]]}>
          <Pressable
            onPress={() => { if (tab === "surah") track("quran_surah_opened", { surah_number: Number(item.badge) }); openPage(item.page); }}
            style={({ pressed }) => [styles.row, styles.rowMain, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <View style={styles.badge}>
              {item.bookmarkAyah ? (
                <Ionicons name="bookmark" size={16} color={WarshPalette.goldText} />
              ) : (
                <Text style={styles.badgeText}>{item.badge}</Text>
              )}
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
              {item.arabic ? (
                <Text style={[styles.rowArabic, item.indoPak && styles.rowArabicIndoPak]}>{item.arabic}</Text>
              ) : null}
              {item.bookmarkAyah || searching ? null : (
                <Text style={styles.rowPage}>{t("quran.pageShort", { page: item.page })}</Text>
              )}
            </View>
          </Pressable>
          {item.bookmarkAyah ? (
            <Pressable
              onPress={() => { removeBookmark(item.bookmarkAyah!); track("quran_bookmark_changed", { page: item.page, action: "removed" }); }}
              style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t("quran.removeBookmark", { surah: item.title, page: item.page })}
            >
              <Ionicons name="trash-outline" size={20} color={WarshPalette.subtleBrown} />
            </Pressable>
          ) : null}
          </View>
        )}
      />

      <QuranSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

// "Al-Baqarah 142 – 252", or "Al-Baqarah 253 – Ali 'Imran 91" when the
// parah crosses into the next surah; it ends where the next parah begins.
function parahRange(parah: JuzStart, next: JuzStart | undefined) {
  const from = `${getChapter(parah.surah).en} ${parah.ayah}`;
  let endSurah = next ? next.surah : 114;
  let endAyah = next ? (next.ayah ?? 1) - 1 : getChapter(114).ayat;
  if (endAyah === 0) {
    endSurah -= 1;
    endAyah = getChapter(endSurah).ayat;
  }
  const to = endSurah === parah.surah ? String(endAyah) : `${getChapter(endSurah).en} ${endAyah}`;
  return `${from} – ${to}`;
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchField: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.white,
  },
  search: {
    flex: 1,
    minHeight: 46,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
  },
  searchCancel: {
    minHeight: 48,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  searchCancelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: WarshPalette.navy,
  },
  resultCount: {
    marginTop: -Spacing.xs,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1,
    color: WarshPalette.goldText,
    textTransform: "uppercase",
  },
  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rowMain: { flex: 1, minWidth: 0 },
  webHeader: { maxWidth: WebLayout.readingMax, paddingBottom: Spacing.lg },
  gridCell: { flex: 1, minWidth: 0 },
  gridCard: {
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  gridSpacer: { height: WebLayout.gridGap },
  removeButton: {
    width: 44,
    height: 44,
    marginRight: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    marginTop: 56,
    alignItems: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: WarshPalette.parchment,
    backgroundColor: WarshPalette.parchmentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: WarshPalette.navy,
    textAlign: "center",
  },
  emptyBody: {
    marginTop: Spacing.sm,
    maxWidth: 280,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 21,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  emptyAction: {
    marginTop: Spacing.gutter,
    minHeight: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: WarshPalette.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: WarshPalette.navy,
  },
  continueStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
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
    fontSize: desktopFontSize(20, "display"),
    lineHeight: desktopLineHeight(34, 20, "display"),
    color: WarshPalette.navy,
  },
  rowArabicIndoPak: {
    fontFamily: INDOPAK_FONT,
    fontSize: desktopFontSize(18, "display"),
  },
  rowPage: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    color: WarshPalette.goldText,
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
