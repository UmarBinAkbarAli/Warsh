import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { getSRSDueWords, submitSRSReview } from "@services/api";
import { trackSRSReviewCompleted } from "@services/analytics";
import { useLanguage, pickTranslation } from "@services/language";
import { useT } from "@i18n/index";
import { prefetchVocabWordAudio } from "@services/audioCache";

interface QuranicExample {
  surahNameEn: string;
  surahNumber: number;
  ayahNumber: number;
  ayahArabic: string;
}

interface DueWord {
  id: string; // UserVocabularyWord id
  wordId: string;
  word: {
    id: string;
    arabic: string;
    arabicPlain: string;
    transliteration: string;
    translationEn: string;
    translationUr: string;
    quranicExample: QuranicExample | null;
    imageUrl: string | null;
  };
}

type Stage = "loading" | "empty" | "pre" | "front" | "back" | "done";

export default function SRSReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const language = useLanguage();
  const t = useT();

  const [stage, setStage] = useState<Stage>("loading");
  const [queue, setQueue] = useState<DueWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ hard: 0, good: 0, easy: 0 });
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStage("loading");
      setCurrentIndex(0);
      setResults({ hard: 0, good: 0, easy: 0 });
      getSRSDueWords()
        .then((res) => {
          const words: DueWord[] = res.data.data;
          setQueue(words);
          setStage(words.length === 0 ? "empty" : "pre");
        })
        .catch(() => setStage("empty"));
    }, [])
  );

  async function submitReview(quality: 2 | 4 | 5) {
    if (submitting) return;
    const current = queue[currentIndex];
    if (!current) return;

    setSubmitting(true);
    try {
      await submitSRSReview(current.wordId, quality);
      const nextResults = {
        hard: results.hard + (quality === 2 ? 1 : 0),
        good: results.good + (quality === 4 ? 1 : 0),
        easy: results.easy + (quality === 5 ? 1 : 0),
      };
      setResults(nextResults);
      if (currentIndex + 1 >= queue.length) {
        trackSRSReviewCompleted({ wordsReviewed: queue.length, ...nextResults });
        setStage("done");
      } else {
        setCurrentIndex((i) => i + 1);
        setStage("front");
      }
    } catch {
      // If review fails, just advance anyway
      if (currentIndex + 1 >= queue.length) {
        setStage("done");
      } else {
        setCurrentIndex((i) => i + 1);
        setStage("front");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const current = queue[currentIndex];
  const total = queue.length;

  // Prefetch the next 1-2 cards' image + audio while the current card is shown,
  // so they're already warm by the time the user swipes forward.
  useEffect(() => {
    const upcoming = queue.slice(currentIndex + 1, currentIndex + 3);
    for (const item of upcoming) {
      if (item.word.imageUrl) {
        Image.prefetch(item.word.imageUrl).catch(() => undefined);
      }
      prefetchVocabWordAudio(item.word.id, item.word.arabic).catch(() => undefined);
    }
  }, [queue, currentIndex]);

  if (stage === "loading") {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator color={WarshPalette.gold} style={{ marginTop: Spacing.xl * 3 }} />
      </View>
    );
  }

  if (stage === "empty") {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ArabicText size="xl" style={styles.emptyArabic}>ما شاء الله</ArabicText>
          <Text style={styles.emptyTitle}>{t("vocabulary.reviewNoWords")}</Text>
          <Text style={styles.emptyCopy}>{t("vocabulary.reviewEmptyHelp")}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>{t("vocabulary.title")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (stage === "pre") {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ArabicText size="lg" style={styles.preArabic}>مُرَاجَعَة الكَلِمَات</ArabicText>
          <Text style={styles.preTitle}>{t("vocabulary.review")}</Text>
          <Text style={styles.preCount}>{t("vocabulary.reviewReady", { count: total, suffix: total !== 1 ? "s" : "" })}</Text>
          <Text style={styles.preCopy}>{t("vocabulary.reviewIntro")}</Text>
          <TouchableOpacity style={styles.beginBtn} onPress={() => setStage("front")}>
            <Text style={styles.beginBtnText}>{t("vocabulary.begin")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (stage === "done") {
    const totalReviewed = results.hard + results.good + results.easy;
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ArabicText size="xl" style={styles.doneArabic}>بَارَكَ اللّٰهُ فِيكَ</ArabicText>
          <Text style={styles.doneTitle}>{t("vocabulary.reviewDone")}</Text>
          <Text style={styles.doneCount}>{t("vocabulary.wordCount", { count: totalReviewed, suffix: totalReviewed !== 1 ? "s" : "" })}</Text>
          <View style={styles.resultRow}>
            <View style={[styles.resultBox, styles.hardBox]}>
              <Text style={styles.resultNum}>{results.hard}</Text>
              <Text style={styles.resultLabel}>{t("vocabulary.reviewHard")}</Text>
            </View>
            <View style={[styles.resultBox, styles.goodBox]}>
              <Text style={styles.resultNum}>{results.good}</Text>
              <Text style={styles.resultLabel}>{t("vocabulary.reviewGood")}</Text>
            </View>
            <View style={[styles.resultBox, styles.easyBox]}>
              <Text style={styles.resultNum}>{results.easy}</Text>
              <Text style={styles.resultLabel}>{t("vocabulary.reviewEasy")}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>{t("common.complete")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // front or back
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header with progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.progressLabel}>{currentIndex + 1} / {total}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((currentIndex) / total) * 100}%` as any }]} />
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        <TouchableOpacity
          style={styles.flashCard}
          onPress={() => stage === "front" && setStage("back")}
          activeOpacity={stage === "front" ? 0.8 : 1}
        >
          {current?.word.imageUrl ? (
            <Image
              source={{ uri: current.word.imageUrl }}
              style={styles.cardImage}
              contentFit="contain"
              cachePolicy="disk"
              transition={150}
            />
          ) : null}

          <ArabicText size="xl" style={styles.cardArabic}>{current?.word.arabic}</ArabicText>

          {stage === "back" ? (
            <View style={styles.backContent}>
              <View style={styles.divider} />
              <Text style={styles.cardTranslation}>{current?.word ? pickTranslation(current.word, language) : ""}</Text>
              <Text style={styles.cardTranslit}>{current?.word.transliteration}</Text>
              {current?.word.quranicExample ? (
                <View style={styles.cardAyah}>
                  <ArabicText size="sm" style={styles.cardAyahText}>
                    {current.word.quranicExample.ayahArabic}
                  </ArabicText>
                  <Text style={styles.cardAyahRef}>
                    {current.word.quranicExample.surahNameEn} · {current.word.quranicExample.surahNumber}:{current.word.quranicExample.ayahNumber}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.tapPrompt}>{t("vocabulary.reviewTapToReveal")}</Text>
          )}
        </TouchableOpacity>

        {stage === "front" ? (
          <View style={styles.audioRow}>
            <PlayButton
              text={current?.word.arabic ?? ""}
              wordId={current?.word.id}
              size={24}
            />
          </View>
        ) : null}
      </View>

      {/* Response buttons (only in back stage) */}
      {stage === "back" ? (
        <View style={styles.responseRow}>
          <TouchableOpacity
            style={[styles.responseBtn, styles.hardBtn]}
            onPress={() => submitReview(2)}
            disabled={submitting}
          >
            <Text style={styles.responseBtnText}>{t("vocabulary.reviewHard")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseBtn, styles.goodBtn]}
            onPress={() => submitReview(4)}
            disabled={submitting}
          >
            <Text style={[styles.responseBtnText, styles.goodBtnText]}>{t("vocabulary.reviewGood")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseBtn, styles.easyBtn]}
            onPress={() => submitReview(5)}
            disabled={submitting}
          >
            <Text style={styles.responseBtnText}>{t("vocabulary.reviewEasy")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: WarshPalette.parchmentCardBorder,
  },
  backBtn: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
  },
  progressLabel: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },

  progressBarBg: {
    height: 3, backgroundColor: WarshPalette.cream,
  },
  progressBarFill: {
    height: 3, backgroundColor: WarshPalette.gold,
  },

  centerContent: {
    flex: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: Spacing.xl * 1.5,
  },

  // Empty state
  emptyArabic: { color: WarshPalette.gold, textAlign: "center", marginBottom: Spacing.md },
  emptyTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700", textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyCopy: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, textAlign: "center",
    lineHeight: LineHeights.bodyL, marginBottom: Spacing.xl,
  },

  // Pre-review
  preArabic: { color: WarshPalette.gold, marginBottom: Spacing.md, textAlign: "center" },
  preTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700", textAlign: "center",
    marginBottom: Spacing.sm,
  },
  preCount: {
    color: WarshPalette.sage, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700", textAlign: "center",
    marginBottom: Spacing.sm,
  },
  preCopy: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, textAlign: "center",
    lineHeight: LineHeights.bodyL, marginBottom: Spacing.xl,
  },
  beginBtn: {
    backgroundColor: WarshPalette.ink, paddingHorizontal: Spacing.xl * 1.5,
    paddingVertical: Spacing.md, borderRadius: Radii.lg, minWidth: 180,
    alignItems: "center",
  },
  beginBtnText: {
    color: WarshPalette.cream, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },

  // Done
  doneArabic: { color: WarshPalette.gold, textAlign: "center", marginBottom: Spacing.md },
  doneTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700", textAlign: "center",
    marginBottom: Spacing.sm,
  },
  doneCount: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, textAlign: "center",
    marginBottom: Spacing.lg,
  },
  resultRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  resultBox: {
    flex: 1, padding: Spacing.md, borderRadius: Radii.md,
    alignItems: "center",
  },
  hardBox: { backgroundColor: "#F9EDEDED", borderWidth: 1, borderColor: "#C09090" },
  goodBox: { backgroundColor: WarshPalette.parchmentBg, borderWidth: 1, borderColor: WarshPalette.defaultCardBorder },
  easyBox: { backgroundColor: "#EDF5ED", borderWidth: 1, borderColor: "#90B090" },
  resultNum: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700",
  },
  resultLabel: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, marginTop: 2,
  },
  doneBtn: {
    backgroundColor: WarshPalette.ink, paddingHorizontal: Spacing.xl * 1.5,
    paddingVertical: Spacing.md, borderRadius: Radii.lg, minWidth: 180,
    alignItems: "center",
  },
  doneBtnText: {
    color: WarshPalette.cream, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },

  // Flash card
  cardArea: { flex: 1, justifyContent: "center", paddingHorizontal: Spacing.xl },
  flashCard: {
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.xl ?? 20, borderWidth: 1,
    borderColor: WarshPalette.gold + "55",
    padding: Spacing.xl,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.md,
    borderRadius: Radii.md,
  },
  cardArabic: { color: WarshPalette.ink, textAlign: "center" },
  tapPrompt: {
    marginTop: Spacing.xl, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyL,
    fontStyle: "italic",
  },
  backContent: { alignSelf: "stretch", alignItems: "center" },
  divider: {
    height: 0.5, backgroundColor: WarshPalette.parchmentCardBorder,
    alignSelf: "stretch", marginVertical: Spacing.lg,
  },
  cardTranslation: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700", textAlign: "center",
  },
  cardTranslit: {
    marginTop: 4, color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, fontStyle: "italic", textAlign: "center",
  },
  cardAyah: {
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 0.5, borderTopColor: WarshPalette.parchmentCardBorder,
    alignSelf: "stretch", alignItems: "flex-end",
  },
  cardAyahText: { color: WarshPalette.ink, textAlign: "right" },
  cardAyahRef: {
    marginTop: 2, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
  },
  audioRow: { alignItems: "center", marginTop: Spacing.lg },

  // Response buttons
  responseRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl * 1.5,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  responseBtn: {
    flex: 1, paddingVertical: Spacing.md,
    borderRadius: Radii.md, borderWidth: 1,
    alignItems: "center",
  },
  hardBtn: { backgroundColor: "#F9EDED", borderColor: "#B07070" },
  goodBtn: { backgroundColor: WarshPalette.parchmentBg, borderColor: WarshPalette.defaultCardBorder },
  easyBtn: { backgroundColor: "#EDF5ED", borderColor: "#70A870" },
  responseBtnText: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },
  goodBtnText: { color: WarshPalette.bodyBrown },
});
