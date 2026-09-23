import { Ionicons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MushafPage } from "@components/quran/MushafPage";
import { PageTranslation, TRANSLATION_PEEK_HEIGHT, TranslationPeek } from "@components/quran/PageTranslation";
import { QuranSettingsSheet, TajweedLegend, TajweedRuleSheet } from "@components/quran/QuranSheets";
import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, TajweedPalette, WarshPalette } from "../../../constants/theme";
import {
  ayahForPage,
  clampPage,
  getPage,
  hasTajweed,
  isIndoPak,
  juzForPage,
  pageCount,
  pageForAyah,
  surahForPage,
  type QuranWord,
} from "../../../services/quran/data";

const KEEP_AWAKE_TAG = "quran-reader";
const PAGE_GUTTER = Spacing.md;

/**
 * The Mushaf reader (Pen sections 27 and 28). Pages run right to left like a
 * printed Mushaf: swiping towards the right turns to the next page. The page
 * in the route is a page of the current layout; switching layout reopens at
 * the page holding the ayah being read.
 */
export default function QuranReaderScreen() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ page?: string }>();
  const layout = useQuranStore((s) => s.layout);
  const tajweedOn = useQuranStore((s) => s.tajweed);
  const tajweed = tajweedOn && hasTajweed(layout);
  const setTajweed = useQuranStore((s) => s.setTajweed);
  const keepAwake = useQuranStore((s) => s.keepAwake);
  const translation = useQuranStore((s) => s.translation);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const setLastAyah = useQuranStore((s) => s.setLastAyah);
  const lastAyah = useQuranStore((s) => s.lastAyah);

  // The page the pager opens at. A change of layout reopens the pager at the
  // page holding the ayah being read.
  const [opening, setOpening] = useState(() => ({ layout, page: clampPage(layout, Number(params.page)) }));
  const [currentPage, setCurrentPage] = useState(opening.page);
  if (opening.layout !== layout) {
    const page = lastAyah ? pageForAyah(layout, lastAyah) : 1;
    setOpening({ layout, page });
    setCurrentPage(page);
  }
  const lastPageNumber = pageCount(layout);
  const pages = useMemo(() => Array.from({ length: lastPageNumber }, (_, index) => index + 1), [lastPageNumber]);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tapped, setTapped] = useState<{ word: QuranWord; key: string; page: number } | null>(null);
  const listRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    setLastAyah(ayahForPage(layout, currentPage));
  }, [layout, currentPage, setLastAyah]);

  useEffect(() => {
    if (!keepAwake) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [keepAwake]);

  useEffect(() => {
    if (!tajweed) setTapped(null);
  }, [tajweed]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visible = viewableItems.find((item) => item.isViewable);
    if (visible && typeof visible.item === "number") setCurrentPage(visible.item);
  }).current;

  const goToPage = useCallback(
    (page: number) => {
      const target = clampPage(layout, page);
      listRef.current?.scrollToIndex({ index: target - 1, animated: true });
      setCurrentPage(target);
    },
    [layout],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (!size || Math.abs(size.width - width) > 1 || Math.abs(size.height - height) > 1) {
      setSize({ width, height });
    }
  };

  const page = getPage(layout, currentPage);
  const chapter = surahForPage(layout, currentPage);
  const pageAyahs = {
    first: ayahForPage(layout, currentPage),
    next: currentPage < lastPageNumber ? ayahForPage(layout, currentPage + 1) : null,
  };
  const bookmarked = bookmarks.some(
    (ayah) => ayah >= pageAyahs.first && (pageAyahs.next === null || ayah < pageAyahs.next),
  );
  const itemWidth = size?.width ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      if (!size) return null;
      const mushafPage = (
        <MushafPage
          layout={layout}
          pageNumber={item}
          width={size.width - PAGE_GUTTER * 2}
          height={translation ? size.height - TRANSLATION_PEEK_HEIGHT : size.height}
          tajweed={tajweed}
          selectedWord={tapped && tapped.page === item ? tapped.key : null}
          onWordPress={(word, key) => setTapped({ word, key, page: item })}
        />
      );
      if (!translation) {
        return <View style={{ width: size.width, height: size.height, paddingHorizontal: PAGE_GUTTER }}>{mushafPage}</View>;
      }
      // Translation under the page (Pen section 30): the page keeps its
      // printed lines, a strip peeks below it, and the page scrolls down to
      // the translation of its ayahs.
      return (
        <ScrollView
          style={{ width: size.width, height: size.height }}
          contentContainerStyle={{ paddingHorizontal: PAGE_GUTTER }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {mushafPage}
          <TranslationPeek translation={translation} />
          <PageTranslation layout={layout} pageNumber={item} translation={translation} />
        </ScrollView>
      );
    },
    [size, layout, tajweed, tapped, translation],
  );

  const extraData = useMemo(() => ({ tajweed, tapped, translation }), [tajweed, tapped, translation]);
  const juzLabel =
    isIndoPak(layout)
      ? t("quran.parahPosition", { juz: juzForPage(layout, currentPage) })
      : t("quran.juzHizb", { juz: juzForPage(layout, currentPage), hizb: page.z ?? 0 });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.xs, paddingBottom: insets.bottom + Spacing.sm }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(app)/quran"))}
          hitSlop={10}
          style={styles.titleButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="chevron-back" size={24} color={WarshPalette.navy} />
          <Text style={styles.title} numberOfLines={1}>
            {chapter.en}
          </Text>
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.dismissTo("/(app)/quran")}
            hitSlop={6}
            style={({ pressed }) => [styles.indexButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("quran.indexButton")}
          >
            <Ionicons name="list" size={16} color={WarshPalette.navy} />
            <Text style={styles.indexButtonText}>{t("quran.indexButton")}</Text>
          </Pressable>
          {hasTajweed(layout) ? (
            <Pressable
              onPress={() => setTajweed(!tajweed)}
              hitSlop={8}
              accessibilityRole="switch"
              accessibilityState={{ checked: tajweed }}
              accessibilityLabel={t("quran.settings.tajweed")}
            >
              <Ionicons
                name={tajweed ? "color-palette" : "color-palette-outline"}
                size={22}
                color={tajweed ? TajweedPalette.nasal : WarshPalette.navy}
              />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => toggleBookmark(pageAyahs)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: bookmarked }}
            accessibilityLabel={t(bookmarked ? "quran.removeBookmark" : "quran.addBookmark")}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={bookmarked ? WarshPalette.gold : WarshPalette.navy}
            />
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

      {tajweed ? (
        <View style={styles.legendRow}>
          <TajweedLegend />
        </View>
      ) : null}

      <View style={styles.pager} onLayout={onLayout}>
        {size ? (
          <FlatList
            key={opening.layout}
            ref={listRef}
            data={pages}
            extraData={extraData}
            keyExtractor={(item) => String(item)}
            renderItem={renderItem}
            horizontal
            inverted
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={opening.page - 1}
            getItemLayout={(_, index) => ({ length: itemWidth, offset: itemWidth * index, index })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          />
        ) : null}
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage >= lastPageNumber}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={t("quran.nextPage")}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={currentPage >= lastPageNumber ? WarshPalette.disabledText : WarshPalette.subtleBrown}
          />
          <Text style={[styles.navText, currentPage >= lastPageNumber && styles.navTextDisabled]}>
            {currentPage >= lastPageNumber ? t("quran.endOfMushaf") : t("quran.page", { page: currentPage + 1 })}
          </Text>
        </Pressable>
        <Text style={styles.position}>{juzLabel}</Text>
        <Pressable
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          hitSlop={8}
          style={[styles.navButton, styles.navButtonEnd]}
          accessibilityRole="button"
          accessibilityLabel={t("quran.previousPage")}
        >
          <Text style={[styles.navText, currentPage <= 1 && styles.navTextDisabled]}>
            {currentPage <= 1 ? t("quran.startOfMushaf") : t("quran.page", { page: currentPage - 1 })}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={currentPage <= 1 ? WarshPalette.disabledText : WarshPalette.subtleBrown}
          />
        </Pressable>
      </View>

      <QuranSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <TajweedRuleSheet word={tapped?.word ?? null} layout={layout} onClose={() => setTapped(null)} />
    </View>
  );
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
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  titleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexShrink: 1,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    color: WarshPalette.navy,
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  indexButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  indexButtonText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.navy,
  },
  pressed: {
    opacity: 0.7,
  },
  legendRow: {
    paddingHorizontal: PAGE_GUTTER,
    paddingBottom: Spacing.sm,
  },
  pager: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 96,
  },
  navButtonEnd: {
    justifyContent: "flex-end",
  },
  navText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },
  navTextDisabled: {
    color: WarshPalette.disabledText,
  },
  position: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.navy,
  },
});
