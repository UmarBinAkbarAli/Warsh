import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { useTranslationLanguage } from "@services/language";
import { useT } from "@i18n/index";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";

type LocalizedText = { en: string; ur: string };
type TestOption = LocalizedText & { arabic?: string };
type TestQuestion = {
  id: string;
  topic: LocalizedText;
  prompt: LocalizedText;
  arabic?: string;
  options: TestOption[];
};
type Assessment = {
  type: "CHAPTER_TEST";
  chapter_order: number;
  pass_score_percent: number;
  questions: TestQuestion[];
};
type TestResult = {
  passed: boolean;
  score: number;
  correctCount: number;
  totalScored: number;
  requiredCorrect: number;
  chapterBonusXp?: number;
  chapterJustCompleted?: boolean;
  nextChapterId?: string | null;
  recovered?: boolean;
};

const SUBMISSION_RECOVERY_DELAYS_MS = [750, 1500, 2500];

export default function ChapterTestScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const t = useT();
  const language = useTranslationLanguage();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"intro" | "questions" | "result">("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!lessonId) return;
      try {
        const response = await api.get(`/api/lessons/${lessonId}`);
        const nextAssessment = response.data.data.lesson.content?.assessment;
        if (!response.data.data.lesson.isChapterTest || nextAssessment?.type !== "CHAPTER_TEST") throw new Error("not_test");
        if (active) setAssessment(nextAssessment);
      } catch {
        if (active) setError(t("chapterTest.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [lessonId, t]);

  const requiredCorrect = assessment
    ? Math.ceil((assessment.pass_score_percent / 100) * assessment.questions.length)
    : 0;
  const topics = useMemo(() => {
    if (!assessment) return "";
    return [...new Set(assessment.questions.map((question) => question.topic[language]))].join("  •  ");
  }, [assessment, language]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={WarshPalette.gold} /></View>;
  }
  if (!assessment || error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error ?? t("chapterTest.loadError")}</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>‹ {t("common.back")}</Text></TouchableOpacity>
      </View>
    );
  }

  const localized = (value: LocalizedText) => value[language] || value.en;
  const contentWidth = Platform.OS === "web" ? Math.min(width, 560) : width;
  const shellStyle = [{ paddingTop: insets.top + Spacing.sm }, Platform.OS === "web" && { width: contentWidth, alignSelf: "center" as const }];

  function resetTest() {
    setAnswers({});
    setQuestionIndex(0);
    setResult(null);
    setError(null);
    setPhase("questions");
  }

  async function submitTest() {
    if (!lessonId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post(`/api/lessons/${lessonId}/complete`, {
        assessmentAnswers: assessment!.questions.map((question) => ({
          questionId: question.id,
          selectedIndex: answers[question.id],
        })),
      });
      setResult(response.data.data);
      setPhase("result");
    } catch {
      // A mobile timeout can happen after the backend has already committed the
      // pass. Reconcile with server state so a saved success is never shown as
      // a failed submission. This is read-only and cannot duplicate rewards.
      for (const delayMs of SUBMISSION_RECOVERY_DELAYS_MS) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        try {
          const recovery = await api.get(`/api/lessons/${lessonId}`);
          const savedResult = recovery.data.data.lesson.chapterTestResult as TestResult | null;
          if (savedResult?.passed) {
            setResult(savedResult);
            setPhase("result");
            return;
          }
        } catch {
          // Keep polling briefly; the original request may still be completing.
        }
      }
      setError(t("chapterTest.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function renderHeader(subtitle?: string) {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={21} color={WarshPalette.navy} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t("chapterTest.finalTest", { chapter: assessment!.chapter_order })}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    );
  }

  if (phase === "intro") {
    return (
      <View style={[styles.screen, shellStyle]}>
        {renderHeader(t("chapterTest.beforeBegin"))}
        <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}><Ionicons name="clipboard-outline" size={28} color={WarshPalette.navy} /></View>
            <Text style={styles.heroTitle}>{t("chapterTest.heroTitle")}</Text>
            <ArabicText size="md" style={styles.heroArabic}>هَذَا  •  ذَٰلِكَ  •  هَذِهِ  •  تِلْكَ</ArabicText>
          </View>
          <View style={styles.metricsCard}>
            <Metric icon="list-outline" value={String(assessment.questions.length)} label={t("chapterTest.questions")} />
            <Metric icon="disc-outline" value={String(requiredCorrect)} label={t("chapterTest.toPass")} />
            <Metric icon="refresh-outline" value="∞" label={t("chapterTest.retries")} />
          </View>
          <View style={styles.rulesCard}>
            {[t("chapterTest.ruleChoose"), t("chapterTest.ruleSubmit"), t("chapterTest.ruleRetry")].map((rule) => (
              <View key={rule} style={styles.ruleRow}><Text style={styles.ruleBullet}>•</Text><Text style={styles.ruleText}>{rule}</Text></View>
            ))}
          </View>
        </ScrollView>
        <BrandButton title={t("chapterTest.start")} onPress={resetTest} style={styles.bottomButton} />
      </View>
    );
  }

  if (phase === "result" && result) {
    const needed = Math.max(result.requiredCorrect - result.correctCount, 0);
    return (
      <View style={[styles.screen, shellStyle]}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.resultHero, result.passed ? styles.resultHeroPassed : styles.resultHeroRetry]}>
            <View style={[styles.resultIcon, !result.passed && styles.resultIconRetry]}>
              <Ionicons name={result.passed ? "trophy-outline" : "refresh-outline"} size={30} color={result.passed ? WarshPalette.navy : WarshPalette.wrongText} />
            </View>
            <Text style={[styles.resultTitle, result.passed && styles.resultTitlePassed]}>
              {result.passed ? t("chapterTest.passed") : t("chapterTest.almost")}
            </Text>
            <Text style={[styles.resultScore, result.passed && styles.resultScorePassed]}>{result.correctCount}/{result.totalScored}</Text>
            <Text style={[styles.resultNote, result.passed && styles.resultNotePassed]}>
              {result.passed ? t("chapterTest.required", { count: result.requiredCorrect }) : t("chapterTest.moreNeeded", { count: needed })}
            </Text>
          </View>
          <View style={[styles.outcomeCard, result.passed ? styles.outcomePassed : styles.outcomeRetry]}>
            <Text style={[styles.outcomeTitle, !result.passed && styles.outcomeTitleRetry]}>
              {result.passed
                ? t(result.recovered || result.chapterJustCompleted ? "chapterTest.chapterComplete" : "chapterTest.chapterRemainsComplete", { chapter: assessment.chapter_order })
                : t("chapterTest.progressSaved")}
            </Text>
            <Text style={styles.outcomeText}>
              {result.passed
                ? t(result.recovered ? "chapterTest.completionConfirmed" : result.chapterJustCompleted ? "chapterTest.unlockedNext" : "chapterTest.noRepeatReward")
                : t("chapterTest.retryNote")}
            </Text>
          </View>
          <View style={styles.topicsCard}>
            <Text style={styles.topicsTitle}>{t("chapterTest.topics")}</Text>
            <Text style={styles.topicsText}>{topics}</Text>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.resultActions}>
          <BrandButton
            title={result.passed ? t("chapterTest.continueNext") : t("chapterTest.retry")}
            onPress={() => {
              if (!result.passed) return resetTest();
              if (result.nextChapterId) router.replace(`/chapters/${result.nextChapterId}`);
              else router.replace("/(app)/(tabs)");
            }}
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>
              {result.passed ? t("chapterTest.reviewChapter", { chapter: assessment.chapter_order }) : t("chapterTest.reviewLessons")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = assessment.questions[questionIndex];
  const selectedIndex = answers[question.id];
  const isLast = questionIndex === assessment.questions.length - 1;
  return (
    <View style={[styles.screen, shellStyle]}>
      <View style={styles.questionHeader}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={22} color={WarshPalette.navy} /></TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((questionIndex + 1) / assessment.questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.questionCount}>{questionIndex + 1}/{assessment.questions.length}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topicPill}><Text style={styles.topicPillText}>{localized(question.topic)}</Text></View>
        <Text style={styles.prompt}>{localized(question.prompt)}</Text>
        {question.arabic ? <ArabicText size="lg" style={styles.questionArabic}>{question.arabic}</ArabicText> : null}
        <View style={styles.optionList}>
          {question.options.map((option, index) => {
            const selected = selectedIndex === index;
            return (
              <TouchableOpacity
                key={`${question.id}-${index}`}
                style={[styles.option, selected && styles.optionSelected]}
                activeOpacity={0.8}
                onPress={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <Ionicons name="checkmark" size={14} color={WarshPalette.navy} /> : null}
                </View>
                <View style={styles.optionTextWrap}>
                  {option.arabic ? <ArabicText size="md" style={styles.optionArabic}>{option.arabic}</ArabicText> : null}
                  <Text style={styles.optionText}>{localized(option)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.privateResultNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color={WarshPalette.sageDeep} />
          <Text style={styles.privateResultText}>{t("chapterTest.resultAfterFinish")}</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
      <BrandButton
        title={isLast ? t("chapterTest.submit") : t("chapterTest.nextQuestion")}
        disabled={selectedIndex === undefined}
        loading={submitting}
        onPress={() => isLast ? void submitTest() : setQuestionIndex((index) => index + 1)}
        style={styles.bottomButton}
      />
    </View>
  );
}

function Metric({ icon, value, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={18} color={WarshPalette.gold} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WarshPalette.parchmentDeep },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg, padding: Spacing.xl, backgroundColor: WarshPalette.parchmentDeep },
  header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: Spacing.gutter, paddingVertical: Spacing.md, gap: Spacing.md },
  headerBack: { paddingTop: 5 },
  headerText: { flex: 1 },
  headerTitle: { color: WarshPalette.navy, fontFamily: Fonts.display, fontSize: 26, lineHeight: 32 },
  headerSubtitle: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, marginTop: 2 },
  introContent: { padding: Spacing.gutter, gap: Spacing.lg, paddingBottom: 110 },
  hero: { height: 190, borderRadius: 24, backgroundColor: WarshPalette.navy, alignItems: "center", justifyContent: "center", gap: Spacing.md, padding: Spacing.lg },
  heroIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: WarshPalette.gold, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: WarshPalette.white, fontFamily: Fonts.display, fontSize: 26 },
  heroArabic: { color: WarshPalette.parchment, textAlign: "center" },
  metricsCard: { flexDirection: "row", backgroundColor: WarshPalette.white, borderRadius: Radii.lg, borderWidth: 1, borderColor: WarshPalette.defaultCardBorder, paddingVertical: Spacing.lg },
  metric: { flex: 1, alignItems: "center", gap: 3 },
  metricValue: { color: WarshPalette.navy, fontFamily: Fonts.bold, fontSize: FontSizes.h2 },
  metricLabel: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.label, textAlign: "center" },
  rulesCard: { backgroundColor: WarshPalette.correctBg, borderRadius: Radii.lg, borderWidth: 1, borderColor: WarshPalette.defaultCardBorder, padding: Spacing.lg, gap: Spacing.sm },
  ruleRow: { flexDirection: "row", gap: Spacing.sm },
  ruleBullet: { color: WarshPalette.sageDeep, fontFamily: Fonts.bold },
  ruleText: { flex: 1, color: Colors.text.secondary, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM },
  bottomButton: { marginHorizontal: Spacing.gutter, marginBottom: Spacing.lg },
  questionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingHorizontal: Spacing.gutter, paddingVertical: Spacing.lg },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: WarshPalette.sageSoft },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: WarshPalette.gold },
  questionCount: { color: WarshPalette.subtleBrown, fontFamily: Fonts.bold, fontSize: FontSizes.caption },
  questionContent: { paddingHorizontal: Spacing.gutter, paddingBottom: 110 },
  topicPill: { alignSelf: "flex-start", backgroundColor: WarshPalette.parchmentBg, borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: 6, marginBottom: Spacing.lg },
  topicPillText: { color: WarshPalette.goldDeep, fontFamily: Fonts.bold, fontSize: FontSizes.label, textTransform: "uppercase" },
  prompt: { color: WarshPalette.navy, fontFamily: Fonts.display, fontSize: 23, lineHeight: 29, marginBottom: Spacing.md },
  questionArabic: { color: WarshPalette.ink, textAlign: "center", marginBottom: Spacing.lg },
  optionList: { gap: Spacing.sm },
  option: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1, borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.white },
  optionSelected: { borderWidth: 2, borderColor: WarshPalette.gold, backgroundColor: WarshPalette.correctBg },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: WarshPalette.sageSoft, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: WarshPalette.gold, backgroundColor: WarshPalette.gold },
  optionTextWrap: { flex: 1, alignItems: "center" },
  optionArabic: { color: WarshPalette.ink, textAlign: "center" },
  optionText: { color: Colors.text.secondary, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, textAlign: "center" },
  privateResultNote: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, backgroundColor: WarshPalette.parchmentBg, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.lg },
  privateResultText: { flex: 1, color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  resultContent: { padding: Spacing.gutter, gap: Spacing.md, paddingBottom: 150 },
  resultHero: { minHeight: 245, borderRadius: 24, alignItems: "center", justifyContent: "center", gap: Spacing.sm, padding: Spacing.lg, borderWidth: 1 },
  resultHeroPassed: { backgroundColor: WarshPalette.navy, borderColor: WarshPalette.navy },
  resultHeroRetry: { backgroundColor: WarshPalette.white, borderColor: WarshPalette.wrongBorder },
  resultIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: WarshPalette.gold, alignItems: "center", justifyContent: "center" },
  resultIconRetry: { backgroundColor: WarshPalette.wrongBg },
  resultTitle: { color: WarshPalette.navy, fontFamily: Fonts.display, fontSize: 25, textAlign: "center" },
  resultTitlePassed: { color: WarshPalette.white },
  resultScore: { color: WarshPalette.wrongText, fontFamily: Fonts.bold, fontSize: 38 },
  resultScorePassed: { color: WarshPalette.parchment },
  resultNote: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  resultNotePassed: { color: WarshPalette.white },
  outcomeCard: { borderRadius: Radii.lg, padding: Spacing.lg, borderWidth: 1, gap: Spacing.sm },
  outcomePassed: { backgroundColor: WarshPalette.correctBg, borderColor: WarshPalette.defaultCardBorder },
  outcomeRetry: { backgroundColor: WarshPalette.wrongBg, borderColor: WarshPalette.wrongBorder },
  outcomeTitle: { color: WarshPalette.sageDeep, fontFamily: Fonts.bold, fontSize: FontSizes.bodyL },
  outcomeTitleRetry: { color: WarshPalette.wrongText },
  outcomeText: { color: Colors.text.secondary, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM },
  topicsCard: { borderRadius: Radii.lg, padding: Spacing.lg, borderWidth: 1, borderColor: WarshPalette.defaultCardBorder, backgroundColor: WarshPalette.white, gap: Spacing.sm },
  topicsTitle: { color: WarshPalette.navy, fontFamily: Fonts.bold, fontSize: FontSizes.bodyM },
  topicsText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption },
  resultActions: { gap: Spacing.sm, paddingHorizontal: Spacing.gutter, paddingBottom: Spacing.lg },
  secondaryButton: { height: 54, borderRadius: Radii.lg, borderWidth: 1, borderColor: WarshPalette.sageSoft, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: WarshPalette.navy, fontFamily: Fonts.bold, fontSize: FontSizes.bodyM },
  errorText: { color: Colors.error, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, textAlign: "center" },
  backLink: { color: WarshPalette.goldDeep, fontFamily: Fonts.bold, fontSize: FontSizes.bodyL },
});
