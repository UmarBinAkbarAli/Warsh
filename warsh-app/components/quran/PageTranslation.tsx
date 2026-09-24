import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useT } from "@i18n/index";
import { useLanguage } from "@services/language";
import { Colors, Fonts, FontSizes, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { getChapter, toUrduDigits, type MushafLayout } from "../../services/quran/data";
import {
  ayahsOnPage,
  isRtlTranslation,
  translationOf,
  type QuranTranslation,
} from "../../services/quran/translations";

export const TRANSLATION_PEEK_HEIGHT = 64;

const NAME_KEY: Record<QuranTranslation, string> = {
  "ur-junagarhi": "quran.translation.urduName",
  "en-pickthall": "quran.translation.englishName",
};
const CREDIT_KEY: Record<QuranTranslation, string> = {
  "ur-junagarhi": "quran.translation.urduCredit",
  "en-pickthall": "quran.translation.englishCredit",
};

/** The strip that peeks under the Mushaf page: scroll down to read on. */
export function TranslationPeek({ translation }: { translation: QuranTranslation }) {
  const t = useT();
  // Labels follow the app language; only the ayah text follows the translation.
  const rtl = useLanguage() === "ur";
  return (
    <View style={[styles.peek, rtl && styles.rowRtl]}>
      <Ionicons name="language-outline" size={18} color={WarshPalette.sageDeep} />
      <View style={styles.peekCopy}>
        <Text style={[styles.peekTitle, rtl && styles.textRtl]} numberOfLines={1}>
          {t("quran.translation.peekTitle", { name: t(NAME_KEY[translation]) })}
        </Text>
        <Text style={[styles.peekSub, rtl && styles.textRtl]} numberOfLines={1}>
          {t("quran.translation.peekSub")}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={18} color={Colors.text.muted} />
    </View>
  );
}

/**
 * The page's ayahs in translation (Pen section 30): the ayah it continues,
 * then every ayah that begins on it, grouped under their surah.
 */
export function PageTranslation({
  layout,
  pageNumber,
  translation,
}: {
  layout: MushafLayout;
  pageNumber: number;
  translation: QuranTranslation;
}) {
  const t = useT();
  const uiRtl = useLanguage() === "ur";
  const rtl = isRtlTranslation(translation);
  const ayahs = ayahsOnPage(layout, pageNumber);
  const digits = (value: number) => (uiRtl ? toUrduDigits(value) : String(value));

  // Consecutive ayahs of one surah share a heading.
  const groups: { surah: number; items: typeof ayahs }[] = [];
  for (const item of ayahs) {
    const surah = Math.floor(item.ayah / 1000);
    if (groups.at(-1)?.surah === surah) groups.at(-1)!.items.push(item);
    else groups.push({ surah, items: [item] });
  }

  return (
    <View style={styles.list}>
      <Text style={[styles.eyebrow, uiRtl && styles.textRtl]}>
        {t("quran.translation.eyebrow", { page: digits(pageNumber) })}
      </Text>
      {groups.map((group) => {
        const chapter = getChapter(group.surah);
        const from = group.items[0].ayah % 1000;
        const to = group.items.at(-1)!.ayah % 1000;
        return (
          <View key={group.surah} style={styles.group}>
            <Text style={[styles.surahLine, uiRtl && styles.textRtl]}>
              {t(from === to ? "quran.translation.surahAyah" : "quran.translation.surahAyahs", {
                surah: uiRtl ? chapter.ar : chapter.en,
                from: digits(from),
                to: digits(to),
              })}
            </Text>
            {group.items.map(({ ayah, continued }) => (
              <View key={ayah} style={[styles.row, rtl && styles.rowRtl]}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{digits(ayah % 1000)}</Text>
                </View>
                <View style={styles.rowCopy}>
                  {continued ? (
                    <Text style={[styles.continued, uiRtl && styles.textRtl]}>{t("quran.translation.continued")}</Text>
                  ) : null}
                  <Text style={[rtl ? styles.urdu : styles.english, rtl && styles.textRtl]}>
                    {translationOf(translation, ayah)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );
      })}
      <Text style={styles.credit}>{t(CREDIT_KEY[translation])}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  peek: {
    height: TRANSLATION_PEEK_HEIGHT - Spacing.sm,
    marginTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  peekCopy: {
    flex: 1,
    gap: 2,
  },
  peekTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  peekSub: {
    color: Colors.text.muted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
  },
  list: {
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 0.6,
  },
  group: {
    gap: Spacing.xs,
  },
  surahLine: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WarshPalette.cream,
  },
  rowRtl: {
    flexDirection: "row-reverse",
  },
  number: {
    width: 28,
    height: 28,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  numberText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  continued: {
    color: Colors.text.muted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
  },
  english: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 23,
  },
  // Urdu is left to the system font, which draws Nastaliq/Naskh properly.
  urdu: {
    color: WarshPalette.ink,
    fontSize: 17,
    lineHeight: 32,
  },
  textRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  credit: {
    marginTop: Spacing.sm,
    color: Colors.text.muted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    textAlign: "center",
  },
});
