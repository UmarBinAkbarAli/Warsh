import { Ionicons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MushafPage } from "@components/quran/MushafPage";
import { QuranSettingsSheet, TajweedLegend, TajweedRuleSheet } from "@components/quran/QuranSheets";
import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { Colors, Fonts, FontSizes, LineHeights, Spacing, TajweedPalette, WarshPalette } from "../../../constants/theme";
import { PAGE_COUNT, clampPage, getPage, juzForPage, surahForPage, type QuranWord } from "../../../services/quran/data";

const KEEP_AWAKE_TAG = "quran-reader";
const PAGES = Array.from({ length: PAGE_COUNT }, (_, index) => index + 1);
const PAGE_GUTTER = Spacing.md;

/**
 * The Mushaf reader (Pen section 27, screens 3–5). Pages run right to left
 * like a printed Mushaf: swiping towards the right turns to the next page.
 */
export default function QuranReaderScreen() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ page?: string }>();
  const initialPage = clampPage(Number(params.page));

  const tajweed = useQuranStore((s) => s.tajweed);
  const setTajweed = useQuranStore((s) => s.setTajweed);
  const keepAwake = useQuranStore((s) => s.keepAwake);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const setLastPage = useQuranStore((s) => s.setLastPage);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tapped, setTapped] = useState<{ word: QuranWord; key: string; page: number } | null>(null);
  const listRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    setLastPage(currentPage);
  }, [currentPage, setLastPage]);

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

  const goToPage = useCallback((page: number) => {
    const target = clampPage(page);
    listRef.current?.scrollToIndex({ index: target - 1, animated: true });
    setCurrentPage(target);
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (!size || Math.abs(size.width - width) > 1 || Math.abs(size.height - height) > 1) {
      setSize({ width, height });
    }
  };

  const page = getPage(currentPage);
  const chapter = surahForPage(currentPage);
  const bookmarked = bookmarks.includes(currentPage);
  const itemWidth = size?.width ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: number }) =>
      size ? (
        <View style={{ width: size.width, height: size.height, paddingHorizontal: PAGE_GUTTER }}>
          <MushafPage
            pageNumber={item}
            width={size.width - PAGE_GUTTER * 2}
            height={size.height}
            tajweed={tajweed}
            selectedWord={tapped && tapped.page === item ? tapped.key : null}
            onWordPress={(word, key) => setTapped({ word, key, page: item })}
          />
        </View>
      ) : null,
    [size, tajweed, tapped],
  );

  const extraData = useMemo(() => ({ tajweed, tapped }), [tajweed, tapped]);

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
          <Pressable
            onPress={() => toggleBookmark(currentPage)}
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
            ref={listRef}
            data={PAGES}
            extraData={extraData}
            keyExtractor={(item) => String(item)}
            renderItem={renderItem}
            horizontal
            inverted
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialPage - 1}
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
          disabled={currentPage >= PAGE_COUNT}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={t("quran.nextPage")}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={currentPage >= PAGE_COUNT ? WarshPalette.disabledText : WarshPalette.subtleBrown}
          />
          <Text style={[styles.navText, currentPage >= PAGE_COUNT && styles.navTextDisabled]}>
            {currentPage >= PAGE_COUNT ? t("quran.endOfMushaf") : t("quran.page", { page: currentPage + 1 })}
          </Text>
        </Pressable>
        <Text style={styles.position}>{t("quran.juzHizb", { juz: juzForPage(currentPage), hizb: page.z })}</Text>
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
      <TajweedRuleSheet word={tapped?.word ?? null} onClose={() => setTapped(null)} />
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
    gap: Spacing.lg + 2,
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
