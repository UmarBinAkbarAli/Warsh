import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import {
  completeCore500Set,
  getApiErrorMessage,
  getCore500Set,
} from "@services/api";
import { useTranslationLanguage } from "@services/language";
import { useT } from "@i18n/index";
import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../../../constants/theme";

interface SetWord {
  id: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  frequencyInQuran: number | null;
  quranicRank: number | null;
  isCorePrefix: boolean;
  audioUrl: string | null;
  known: boolean;
  coverageGain: number;
}

export default function Core500SetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const t = useT();
  const language = useTranslationLanguage();
  const params = useLocalSearchParams<{ setNumber: string }>();
  const setNumber = Number.parseInt(String(params.setNumber ?? "1"), 10);

  const [words, setWords] = useState<SetWord[]>([]);
  const [index, setIndex] = useState(0);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<{
    coveragePercent: number;
    currentStreak: number;
    streakAdvanced: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await getCore500Set(setNumber);
        if (!cancelled) setWords(response.data.data.words);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, t("core500.loadFailed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setNumber, t]);

  const word = words[index];
  const isPrefixSet = useMemo(() => words.some((w) => w.isCorePrefix), [words]);

  const finish = useCallback(
    async (finalKnownIds: string[]) => {
      setFinishing(true);
      try {
        const response = await completeCore500Set(setNumber, finalKnownIds);
        setResult(response.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err, t("core500.loadFailed")));
      } finally {
        setFinishing(false);
      }
    },
    [setNumber, t],
  );

  const advance = useCallback(
    (markKnown: boolean) => {
      const nextKnown = markKnown && word ? [...knownIds, word.id] : knownIds;
      if (markKnown) setKnownIds(nextKnown);

      if (index + 1 < words.length) {
        setIndex(index + 1);
        return;
      }
      void finish(nextKnown);
    },
    [finish, index, knownIds, word, words.length],
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={WarshPalette.gold} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
          <Text style={styles.retryText}>{t("common.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Completion summary. The streak line only claims what the server confirmed.
  if (result) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.doneBadge}>
          <Ionicons name="checkmark" size={30} color={WarshPalette.white} />
        </View>
        <Text style={styles.doneTitle}>{t("core500.setComplete", { set: setNumber })}</Text>
        <Text style={styles.doneBody}>
          {t("core500.setCompleteBody", { percent: result.coveragePercent })}
        </Text>
        {result.streakAdvanced ? (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={15} color={WarshPalette.sageDeep} />
            <Text style={styles.streakPillText}>
              {result.currentStreak === 1
                ? t("core500.streakKeptOne")
                : t("core500.streakKept", { days: result.currentStreak })}
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>{t("core500.done")}</Text>
        </Pressable>
      </View>
    );
  }

  if (!word) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{t("core500.loadFailed")}</Text>
      </View>
    );
  }

  const meaning = language === "ur" ? word.translationUr : word.translationEn;
  const secondary = language === "ur" ? word.translationEn : word.translationUr;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          desktopWeb ? styles.webHeaderRow : { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={22} color={WarshPalette.subtleBrown} />
        </TouchableOpacity>

        <View style={styles.dots}>
          {words.map((w, i) => (
            <View key={w.id} style={[styles.dot, i <= index && styles.dotFilled]} />
          ))}
        </View>

        <Text style={styles.setLabel}>{t("core500.setLabel", { set: setNumber })}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wordCard}>
          <ArabicText size="xl" style={styles.wordArabic}>
            {word.arabic}
          </ArabicText>
          <Text style={styles.translit}>{word.transliteration}</Text>
          <PlayButton text={word.arabic} wordId={word.id} audioUrl={word.audioUrl ?? undefined} size={30} />
        </View>

        <View style={styles.meaningCard}>
          <Text style={styles.meaningEyebrow}>
            {language === "ur" ? t("core500.urdu") : t("core500.english")}
          </Text>
          <Text style={styles.meaningPrimary}>{meaning}</Text>
          <Text style={styles.meaningEyebrow}>
            {language === "ur" ? t("core500.english") : t("core500.urdu")}
          </Text>
          <Text style={styles.meaningSecondary}>{secondary}</Text>
        </View>

        <View style={styles.chipRow}>
          {word.frequencyInQuran !== null ? (
            <View style={[styles.chip, styles.chipSage]}>
              <Text style={styles.chipSageText}>
                {t("core500.inQuran", { count: word.frequencyInQuran })}
              </Text>
            </View>
          ) : null}
          {word.quranicRank !== null ? (
            <View style={[styles.chip, styles.chipGold]}>
              <Text style={styles.chipGoldText}>
                {t("core500.rank", { rank: word.quranicRank })}
              </Text>
            </View>
          ) : null}
        </View>

        {isPrefixSet ? (
          <Text style={styles.note}>{t("core500.prefixIntro")}</Text>
        ) : null}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          disabled={finishing}
          onPress={() => advance(false)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionSecondary,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.actionSecondaryText}>{t("core500.stillLearning")}</Text>
        </Pressable>
        <Pressable
          disabled={finishing}
          onPress={() => advance(true)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionPrimary,
            pressed && styles.ctaPressed,
          ]}
        >
          {finishing ? (
            <ActivityIndicator color={WarshPalette.parchment} />
          ) : (
            <Text style={styles.actionPrimaryText}>{t("core500.iKnowIt")}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  centered: { alignItems: "center", justifyContent: "center", padding: Spacing.gutter },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.lg,
  },
  webHeaderRow: { paddingTop: Spacing.xl },
  dots: { flex: 1, flexDirection: "row", gap: 5, alignItems: "center" },
  dot: {
    flex: 1,
    height: 5,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
  },
  dotFilled: { backgroundColor: WarshPalette.gold },
  setLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },

  content: { paddingHorizontal: Spacing.gutter, gap: Spacing.lg },
  wordCard: {
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.parchmentCardBorder,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  wordArabic: { color: WarshPalette.ink },
  translit: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.transliteration,
    lineHeight: LineHeights.transliteration,
    color: WarshPalette.subtleBrown,
  },

  meaningCard: {
    backgroundColor: WarshPalette.parchmentDeep,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  meaningEyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 1.2,
    color: WarshPalette.subtleBrown,
  },
  meaningPrimary: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
  },
  meaningSecondary: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    color: WarshPalette.bodyBrown,
  },

  chipRow: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
  },
  chipSage: { backgroundColor: WarshPalette.sageTintBg },
  chipSageText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.sageDeep,
  },
  chipGold: { backgroundColor: WarshPalette.highlightBg },
  chipGoldText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.goldDeep,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },

  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionSecondary: { borderWidth: 1, borderColor: WarshPalette.defaultCardBorder },
  actionSecondaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
  },
  actionPrimary: { backgroundColor: WarshPalette.navy },
  actionPrimaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.parchment,
  },
  actionPressed: { backgroundColor: WarshPalette.highlightBgSoft },

  doneBadge: {
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  doneTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    color: WarshPalette.ink,
    textAlign: "center",
  },
  doneBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: WarshPalette.sageTintBg,
    borderRadius: Radii.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  streakPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.sageDeep,
  },
  cta: {
    backgroundColor: WarshPalette.navy,
    borderRadius: Radii.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    marginTop: Spacing.xxl,
  },
  ctaPressed: { backgroundColor: WarshPalette.navyDeep },
  ctaText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.parchment,
  },

  errorText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.wrongText,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.navy,
  },
  retryText: { fontFamily: Fonts.semiBold, color: WarshPalette.parchment },
});
