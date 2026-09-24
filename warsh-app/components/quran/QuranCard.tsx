import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { chapters, juzForPage, pageForAyah, surahForPage } from "../../services/quran/data";
import { QURAN_FONT } from "./MushafPage";

/**
 * Learn tab entry to the free Quran reader (Pen sections 27 and 28). It
 * never depends on lessons or the subscription, so the tab always offers
 * something to open.
 */
export function QuranCard() {
  const router = useRouter();
  const t = useT();
  const layout = useQuranStore((s) => s.layout);
  const lastAyah = useQuranStore((s) => s.lastAyah);

  const lastPage = lastAyah ? pageForAyah(layout, lastAyah) : null;
  const chapter = lastPage ? surahForPage(layout, lastPage) : chapters[0];
  const juz = lastPage ? juzForPage(layout, lastPage) : 1;

  return (
    <Pressable
      onPress={() =>
        lastPage
          ? router.push({ pathname: "/(app)/quran/[page]", params: { page: String(lastPage) } })
          : router.push("/(app)/quran")
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={lastPage ? t("quran.card.continue", { surah: chapter.en }) : t("quran.card.start")}
    >
      <View style={styles.tile}>
        <Ionicons name="book-outline" size={24} color={WarshPalette.parchment} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{t("quran.card.eyebrow")}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {lastPage ? t("quran.card.continue", { surah: chapter.en }) : t("quran.card.start")}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {lastPage ? t("quran.pageJuz", { page: lastPage, juz }) : t("quran.card.startMeta")}
        </Text>
      </View>
      <View style={styles.end}>
        {lastPage ? <Text style={styles.arabic}>{chapter.ar}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={WarshPalette.goldDeep} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md + 2,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1,
    borderColor: WarshPalette.parchment,
    marginBottom: Spacing.xl,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },
  tile: {
    width: 52,
    height: 64,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.navy,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1,
    color: WarshPalette.goldDeep,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL - 4,
    color: WarshPalette.navy,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption - 1,
    lineHeight: LineHeights.caption - 2,
    color: WarshPalette.subtleBrown,
  },
  end: {
    alignItems: "flex-end",
    gap: 2,
  },
  arabic: {
    fontFamily: QURAN_FONT,
    fontSize: 22,
    lineHeight: 38,
    color: WarshPalette.navy,
  },
});
