import { LearnRow } from "@components/learn/LearnRow";
import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { QURAN_FONT } from "./MushafPage";
import { WarshPalette } from "../../constants/theme";
import {
  chapters,
  juzForPage,
  pageForAyah,
  surahForPage,
} from "../../services/quran/data";

/**
 * Learn tab entry to the free Quran reader (Pen sections 27 and 28), drawn as
 * a calm row since section 31. It never depends on lessons or the
 * subscription, so the tab always offers something to open.
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
    <LearnRow
      icon="book-outline"
      title={
        lastPage
          ? t("quran.card.continue", { surah: chapter.en })
          : t("quran.card.start")
      }
      meta={
        lastPage
          ? t("quran.pageJuz", { page: lastPage, juz })
          : t("quran.card.startMeta")
      }
      trailing={
        lastPage ? <Text style={styles.arabic}>{chapter.ar}</Text> : undefined
      }
      onPress={() =>
        lastPage
          ? router.push({
              pathname: "/(app)/quran/[page]",
              params: { page: String(lastPage) },
            })
          : router.push("/(app)/quran")
      }
    />
  );
}

const styles = StyleSheet.create({
  arabic: {
    fontFamily: QURAN_FONT,
    fontSize: 20,
    lineHeight: 34,
    color: WarshPalette.navy,
  },
});
