import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { PlayButton } from "@components/PlayButton";
import { AyahExamples } from "@components/core500/AyahExamples";
import { getApiErrorMessage } from "@services/api";
import { coreDirectionMark, loadCoreAssessment, loadCoreSet, updateCoreAssessment, type CoreAssessment, type CoreSetWord } from "@services/core500";
import { useLanguage, useTranslationLanguage } from "@services/language";
import { useAuthStore } from "@stores/authStore";
import { useT } from "@i18n/index";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../../../constants/theme";
import { isDesktopWeb } from "@components/WebPage";

type Stage = "cards" | "intro" | "test";
type Question = NonNullable<CoreAssessment["question"]>;
// The question just answered, kept on screen so the answer is marked in place.
type Answered = { question: Question; picked: string; correct: boolean; meaning: string };

export default function Core500SetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const t = useT();
  const language = useTranslationLanguage();
  const uiLanguage = useLanguage();
  const userId = useAuthStore(s => s.user?.id);
  const params = useLocalSearchParams<{ setNumber: string }>();
  const setNumber = Number(params.setNumber);
  const storageKey = `core500:cards:${userId}:${setNumber}`;
  const sessionKey = useRef(storageKey);
  sessionKey.current = storageKey;
  const [words, setWords] = useState<CoreSetWord[]>([]);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("cards");
  const [test, setTest] = useState<CoreAssessment | null>(null);
  const [answered, setAnswered] = useState<Answered | null>(null);
  // Right/wrong per question in this round, for the progress dots.
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  // Right first time in round 1, when this session saw it.
  const [firstTimeRight, setFirstTimeRight] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [resume, setResume] = useState<CoreAssessment | null>(null);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const direction = (text: string, lang = uiLanguage) => coreDirectionMark(text, lang);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setAnswered(null); setSelected(null); setBusy(false); busyRef.current = false;
    (async () => {
      try {
        const [set, saved] = await Promise.all([loadCoreSet(setNumber), AsyncStorage.getItem(storageKey)]);
        const assessment = set.assessmentSupported ? await loadCoreAssessment(setNumber) : null;
        if (cancelled) return;
        setReady(!!set.assessmentSupported && !!set.examplesReady);
        setWords(set.words); setTest(null); setStage("cards"); setResume(null);
        const savedIndex = Number(saved ?? 0);
        setIndex(Number.isInteger(savedIndex) ? Math.min(set.words.length, Math.max(0, savedIndex)) : 0);
        if (assessment && assessment.phase !== "COMPLETE") setResume(assessment);
        else if (assessment?.phase === "COMPLETE") { setTest(assessment); setStage("test"); }
        else if (savedIndex >= set.words.length) setStage("intro");
      } catch (err) { if (!cancelled) setError(getApiErrorMessage(err, t("core500.loadFailed"))); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [setNumber, storageKey, t, reload]);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [index, stage, test?.question?.id, test?.phase]);
  const word = words[Math.min(index, words.length - 1)];
  const testLanguage = test?.language ?? language;
  async function act(action: Parameters<typeof updateCoreAssessment>[1]) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    const asked = test?.question;
    try {
      const next = await updateCoreAssessment(setNumber, action);
      if (sessionKey.current !== storageKey) return;
      if (action.action === "answer" && asked && next.feedback) {
        const correct = next.feedback.correct;
        setAnswered({ question: asked, picked: action.optionId, correct, meaning: next.feedback.meaning });
        setRoundResults(results => [...results, correct]);
      } else {
        setAnswered(null);
        setRoundResults([]);
      }
      if (action.action === "answer" && next.phase !== "QUIZ" && test?.round === 1) {
        setFirstTimeRight([...roundResults, next.feedback?.correct ?? false].filter(Boolean).length);
      }
      setTest(next); setStage("test"); setResume(null); setSelected(null);
      if (next.phase === "COMPLETE") await AsyncStorage.removeItem(storageKey);
    } catch (err) { if (sessionKey.current === storageKey) setError(getApiErrorMessage(err, t("core500.testSaveFailed"))); }
    finally { if (sessionKey.current === storageKey) { busyRef.current = false; setBusy(false); } }
  }
  async function advance() {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try {
      const nextIndex = index + 1;
      await AsyncStorage.setItem(storageKey, String(nextIndex));
      if (sessionKey.current !== storageKey) return;
      setIndex(nextIndex);
      if (nextIndex >= words.length) setStage("intro");
    } catch { if (sessionKey.current === storageKey) setError(t("core500.testSaveFailed")); }
    finally { if (sessionKey.current === storageKey) { busyRef.current = false; setBusy(false); } }
  }

  const inTest = stage === "test" && !!test && (test.phase !== "COMPLETE" || !!answered);
  const headerTitle = inTest || test?.phase === "REVIEW"
    ? t("core500.setTestLabel", { set: setNumber })
    : t("core500.setLabel", { set: setNumber });
  const headerMeta = (() => {
    if (loading || resume) return "";
    if (stage === "cards" && words.length) return t("core500.wordOf", { index: Math.min(index + 1, words.length), total: words.length });
    if (test?.phase === "REVIEW") return t("core500.toReview", { count: test.review.length });
    if (inTest && test) {
      const shown = answered ? test.answeredCount : test.answeredCount + 1;
      return t("core500.questionOf", { index: Math.max(1, shown), total: test.total });
    }
    return "";
  })();
  const dots = (() => {
    if (stage === "cards" && words.length) {
      return words.map((_, i) => (i <= index ? WarshPalette.navy : WarshPalette.waveformGoldIdle));
    }
    if (inTest && test && (test.phase === "QUIZ" || answered)) {
      return Array.from({ length: test.total }, (_, i) => {
        if (i < roundResults.length) return roundResults[i] ? WarshPalette.sageDeep : WarshPalette.wrongBorder;
        if (i === roundResults.length && !answered) return WarshPalette.navy;
        return WarshPalette.waveformGoldIdle;
      });
    }
    return null;
  })();

  function renderOptions(question: Question, mark: Answered | null) {
    return <View accessibilityRole="radiogroup" style={styles.options}>
      {question.options.map(option => {
        const isRight = !!mark && option.text === mark.meaning;
        const isPicked = !!mark && option.id === mark.picked && !mark.correct;
        const isSelected = !mark && selected === option.id;
        return <Pressable
          key={option.id}
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected || isPicked || isRight, disabled: busy || !!mark }}
          disabled={busy || !!mark}
          onPress={() => setSelected(option.id)}
          style={[styles.option, isSelected && styles.optionSelected, isRight && styles.optionRight, isPicked && styles.optionPicked]}
        >
          {!mark && <View style={[styles.radio, isSelected && styles.radioOn]}>{isSelected && <View style={styles.radioDot} />}</View>}
          <Text style={[
            styles.optionText,
            testLanguage === "ur" && styles.rtl,
            (isSelected || isRight || isPicked) && styles.optionTextStrong,
            isRight && styles.optionTextRight,
            isPicked && styles.optionTextPicked,
            !!mark && !isRight && !isPicked && styles.optionTextMuted,
          ]}>{direction(option.text, testLanguage)}</Text>
          {isRight && (mark.correct
            ? <Ionicons name="checkmark" size={20} color={WarshPalette.sageDeep} />
            : <Text style={[styles.optionTag, styles.optionTextRight]}>{t("core500.answerTag")}</Text>)}
          {isPicked && <Text style={[styles.optionTag, styles.optionTextPicked]}>{t("core500.yourPickTag")}</Text>}
        </Pressable>;
      })}
    </View>;
  }

  function renderQuestion(question: Question, mark: Answered | null) {
    return <View style={styles.testBody}>
      <Text style={styles.kicker}>{direction(t("core500.chooseMeaning"))}</Text>
      <View style={styles.testWordRow}>
        <ArabicText size="xl" style={styles.testWord}>{question.arabic}</ArabicText>
        {mark && !mark.correct && <PlayButton key={`missed-${question.id}`} text={question.arabic} wordId={question.wordId} audioUrl={words.find(w => w.id === question.wordId)?.audioUrl ?? undefined} size={20} />}
      </View>
      {renderOptions(question, mark)}
      <View style={styles.spacer} />
      {mark && (mark.correct
        ? <View accessibilityRole="alert" style={[styles.result, styles.resultRight]}>
            <View style={styles.resultTick}><Ionicons name="checkmark" size={18} color={WarshPalette.white} /></View>
            <Text style={[styles.resultTitle, styles.optionTextRight]}>{direction(t("core500.answerCorrect"))}</Text>
          </View>
        : <View accessibilityRole="alert" style={[styles.result, styles.resultWrong]}>
            <View style={styles.resultCopy}>
              <Text style={[styles.resultTitle, styles.optionTextPicked]}>{direction(t("core500.answerNotQuite"))}</Text>
              <Text style={styles.resultBody}>
                {direction(t("core500.missedMeans", { meaning: mark.meaning }), testLanguage)}
              </Text>
            </View>
          </View>)}
      {mark
        ? <BrandButton title={t(test?.phase === "QUIZ" ? "core500.nextQuestion" : "core500.testContinue")} onPress={() => setAnswered(null)} />
        : <BrandButton title={t("core500.checkAnswer")} loading={busy} disabled={!selected} onPress={() => { if (selected && test) void act({ action: "answer", questionId: question.id, optionId: selected, round: test.round }); }} />}
    </View>;
  }

  const body = () => {
    if (loading) return <ActivityIndicator color={WarshPalette.goldText} />;
    if (!words.length) return <BrandButton title={t("core500.tryAgain")} onPress={() => setReload(n => n + 1)} />;
    if (resume) return <View style={styles.card}>
      <Text style={styles.title}>{direction(t("core500.resumeTest"))}</Text>
      <Text style={styles.body}>{direction(t("core500.resumeTestBody", { count: resume.passedCount }))}</Text>
      <BrandButton title={t("core500.resumeTest")} onPress={() => { setTest(resume); setResume(null); setStage("test"); }} />
      <BrandButton variant="secondary" title={t("core500.reviewCards")} onPress={() => { setResume(null); setIndex(0); setStage("cards"); }} />
    </View>;
    if (stage === "cards") return <>
      <View style={styles.wordCard}>
        <View style={styles.wordRow}>
          <ArabicText size="xl" style={styles.word}>{word.arabic}</ArabicText>
          <PlayButton key={word.id} text={word.arabic} wordId={word.id} audioUrl={word.audioUrl ?? undefined} size={28} />
        </View>
        <Text style={styles.translit}>{direction(word.transliteration, "en")}</Text>
        <Text style={[styles.meaning, language === "ur" && styles.rtl]}>{direction(language === "ur" ? word.translationUr : word.translationEn, language)}</Text>
        <Text style={[styles.secondMeaning, language === "en" && styles.urdu]}>{direction(language === "ur" ? word.translationEn : word.translationUr, language === "ur" ? "en" : "ur")}</Text>
        <View style={styles.frequencyPill}>
          <Text style={styles.frequencyText}>{direction(t("core500.appearsCount", { count: word.frequencyInQuran ?? 0 }))}</Text>
        </View>
        {word.isCorePrefix && <Text style={styles.note}>{direction(t("core500.prefixInAyah"))}</Text>}
      </View>
      <AyahExamples key={word.id} examples={word.ayahExamples ?? []} language={language} />
      <Text style={[styles.note, styles.centered]}>{direction(t("core500.cardsBeforeTest"))}</Text>
      <BrandButton title={t(index + 1 === words.length ? "core500.toTest" : "core500.nextWord")} loading={busy} onPress={() => void advance()} />
      {index > 0 && <BrandButton variant="secondary" title={t("core500.previousWord")} disabled={busy} onPress={() => { setIndex(index - 1); void AsyncStorage.setItem(storageKey, String(index - 1)); }} />}
    </>;
    if (stage === "intro") return <View style={styles.card}>
      <Ionicons name="checkmark-circle-outline" size={48} color={WarshPalette.goldText} />
      <Text style={styles.title}>{direction(t("core500.testTitle"))}</Text>
      <Text style={styles.body}>{direction(t("core500.testIntro"))}</Text>
      {!ready && <Text style={styles.note}>{direction(t("core500.testNotReady"))}</Text>}
      <BrandButton title={t("core500.startTest")} loading={busy} disabled={!ready} onPress={() => void act({ action: "start", language, restart: test?.phase === "COMPLETE" })} />
      <BrandButton variant="secondary" title={t("core500.reviewCards")} disabled={busy} onPress={() => { setIndex(0); setStage("cards"); }} />
    </View>;
    if (answered) return renderQuestion(answered.question, answered);
    if (test?.phase === "REVIEW") return <>
      <Text style={styles.title}>{direction(t("core500.reviewMissed"))}</Text>
      <Text style={styles.body}>{direction(t("core500.reviewMissedBody", { count: test.review.length }))}</Text>
      {test.review.map(missed => {
        const reviewWord = words.find(w => w.id === missed.wordId);
        const example = reviewWord?.ayahExamples?.[0];
        return <View key={missed.wordId} style={styles.reviewCard}>
          <View style={styles.reviewTop}>
            <View style={styles.reviewWord}>
              <PlayButton text={missed.arabic} wordId={missed.wordId} audioUrl={reviewWord?.audioUrl ?? undefined} size={20} />
              <ArabicText size="lg">{missed.arabic}</ArabicText>
            </View>
            <Text style={[styles.reviewMeaning, testLanguage === "ur" && styles.rtl]}>{direction(missed.meaning, testLanguage)}</Text>
          </View>
          {example && <View style={styles.reviewAyah}>
            <ArabicText size="sm">{example.arabic}</ArabicText>
            <Text style={[styles.reviewGloss, testLanguage === "ur" && styles.rtl]}>{direction(testLanguage === "ur" ? example.translationUr : example.translationEn, testLanguage)}</Text>
            <Text style={styles.reviewRef}>{direction(`${example.surahName} ${example.surahNumber}:${example.ayahNumber}`, "en")}</Text>
          </View>}
        </View>;
      })}
      <View style={styles.spacer} />
      <BrandButton title={t("core500.retryMissed")} loading={busy} onPress={() => void act({ action: "retry", round: test.round })} />
    </>;
    if (test?.phase === "COMPLETE" && test.completed) {
      const coverage = test.coveragePercent ?? 0;
      const streak = test.currentStreak ?? 0;
      return <>
        <View style={styles.hero}>
          <View style={[styles.heroCorner, styles.heroCornerTop]} />
          <View style={[styles.heroCorner, styles.heroCornerBottom]} />
          <View style={styles.heroTick}><Ionicons name="checkmark" size={30} color={WarshPalette.parchment} /></View>
          <Text style={styles.heroTitle}>{direction(t("core500.setComplete", { set: setNumber }))}</Text>
          <Text style={styles.heroSub}>
            {direction(firstTimeRight !== null
              ? t("core500.allLearnedFirstTime", { total: words.length, count: firstTimeRight })
              : t("core500.allLearned", { total: words.length }))}
          </Text>
        </View>
        <View style={styles.coverageCard}>
          <Text style={styles.coverageText}>{direction(t("core500.setCompleteBody", { percent: coverage }))}</Text>
          <View style={styles.coverageTrack}><View style={[styles.coverageFill, { width: `${Math.min(100, coverage)}%` as any }]} /></View>
        </View>
        {streak > 0 && <View style={styles.streakPill}>
          <Ionicons name="flame-outline" size={18} color={WarshPalette.sageDeep} />
          <Text style={styles.streakText}>{direction(streak === 1 ? t("core500.streakKeptOne") : t("core500.streakKept", { days: streak }))}</Text>
        </View>}
        <View style={styles.spacer} />
        {setNumber < 100 && <BrandButton title={t("core500.startSet", { set: setNumber + 1 })} onPress={() => router.replace(`/core-500/set/${setNumber + 1}` as never)} />}
        <Pressable accessibilityRole="button" onPress={() => router.replace("/core-500" as never)} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>{direction(t("core500.backToCore"))}</Text>
        </Pressable>
      </>;
    }
    const question = test?.question;
    if (!question || !test) return null;
    return renderQuestion(question, null);
  };
  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={inTest ? t("core500.closeTest") : t("common.back")}
        onPress={() => router.back()}
        style={styles.headerButton}
      >
        <Ionicons name={inTest || test?.phase === "REVIEW" ? "close" : "chevron-back"} size={24} color={WarshPalette.ink} />
      </Pressable>
      <Text style={styles.headerText}>{direction(headerTitle)}</Text>
      {headerMeta ? <Text style={styles.headerMeta}>{direction(headerMeta)}</Text> : null}
    </View>
    {dots && <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {dots.map((color, i) => <View key={i} style={[styles.dot, { backgroundColor: color }]} />)}
    </View>}
    <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.lg, maxWidth: isDesktopWeb(width) ? 720 : 560 }]}>
      {error && <View accessibilityRole="alert" style={styles.error}><Text style={styles.body}>{direction(error)}</Text>
        {words.length > 0 && <BrandButton variant="secondary" title={t("core500.resumeTest")} disabled={busy} onPress={() => setReload(n => n + 1)} />}
      </View>}
      {body()}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WarshPalette.creamBg },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingLeft: Spacing.sm, paddingRight: Spacing.gutter },
  headerButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, fontFamily: Fonts.semiBold, color: WarshPalette.ink, fontSize: FontSizes.h2, lineHeight: 24 },
  headerMeta: { fontFamily: Fonts.regular, color: WarshPalette.bodyBrown, fontSize: FontSizes.bodyM },
  dots: { flexDirection: "row", gap: 6, paddingHorizontal: Spacing.gutter, paddingTop: Spacing.xs },
  dot: { flex: 1, height: 3, borderRadius: 2 },
  content: { paddingHorizontal: Spacing.gutter, paddingTop: 18, gap: 14, width: "100%", alignSelf: "center", flexGrow: 1 },
  spacer: { flex: 1, minHeight: Spacing.sm },
  card: { backgroundColor: WarshPalette.parchmentBg, borderWidth: 1, borderColor: WarshPalette.listDivider, borderRadius: Radii.xl, padding: Spacing.lg, gap: Spacing.md },
  wordCard: { alignItems: "center", paddingTop: 22, paddingHorizontal: Spacing.gutter, paddingBottom: Spacing.gutter, borderRadius: Radii.xl, borderWidth: 0.5, borderColor: WarshPalette.parchment, backgroundColor: WarshPalette.white },
  wordRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  word: { textAlign: "center" },
  translit: { fontFamily: Fonts.italic, fontSize: 15, color: WarshPalette.goldText, textAlign: "center" },
  meaning: { marginTop: 10, fontFamily: Fonts.bold, fontSize: FontSizes.h1, lineHeight: 28, color: WarshPalette.ink, textAlign: "center" },
  secondMeaning: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 17, lineHeight: 26, color: WarshPalette.bodyBrown, textAlign: "center" },
  urdu: { fontFamily: Fonts.urduFallback, lineHeight: 34 },
  frequencyPill: { marginTop: 10, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full, backgroundColor: WarshPalette.correctBg },
  frequencyText: { fontFamily: Fonts.semiBold, fontSize: FontSizes.caption, color: WarshPalette.sageDeep },
  title: { fontFamily: Fonts.display, fontSize: FontSizes.display, lineHeight: LineHeights.display, color: WarshPalette.navy },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: WarshPalette.bodyBrown },
  note: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: WarshPalette.bodyBrown },
  centered: { textAlign: "center" },
  rtl: { textAlign: "right" },
  testBody: { flexGrow: 1, paddingTop: 18, gap: 0 },
  kicker: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, letterSpacing: 1.2, color: WarshPalette.subtleBrown, textAlign: "center", textTransform: "uppercase" },
  testWordRow: { marginTop: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.md },
  testWord: { textAlign: "center" },
  options: { marginTop: Spacing.xl, gap: 10 },
  option: { minHeight: 56, paddingHorizontal: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.md, borderRadius: Radii.md, borderWidth: 1, borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.white },
  optionSelected: { borderWidth: 2, borderColor: WarshPalette.gold, backgroundColor: WarshPalette.highlightBg },
  optionRight: { borderWidth: 2, borderColor: WarshPalette.sageDeep, backgroundColor: WarshPalette.correctBg },
  optionPicked: { borderWidth: 2, borderColor: WarshPalette.wrongBorder, backgroundColor: WarshPalette.wrongBg },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: WarshPalette.sageSoft, alignItems: "center", justifyContent: "center" },
  radioOn: { borderWidth: 2, borderColor: WarshPalette.gold },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: WarshPalette.gold },
  optionText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL, color: WarshPalette.ink },
  optionTextStrong: { fontFamily: Fonts.bold },
  optionTextRight: { color: WarshPalette.sageDeep },
  optionTextPicked: { color: WarshPalette.wrongText },
  optionTextMuted: { color: WarshPalette.subtleBrown },
  optionTag: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, letterSpacing: 0.6 },
  result: { marginBottom: Spacing.lg, paddingVertical: 14, paddingHorizontal: Spacing.lg, borderRadius: Radii.md, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: Spacing.md },
  resultRight: { borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.correctBg },
  resultWrong: { borderColor: WarshPalette.wrongBorderSoft, backgroundColor: WarshPalette.wrongBg },
  resultTick: { width: 32, height: 32, borderRadius: 16, backgroundColor: WarshPalette.sageDeep, alignItems: "center", justifyContent: "center" },
  resultCopy: { flex: 1, gap: Spacing.xs },
  resultTitle: { fontFamily: Fonts.bold, fontSize: FontSizes.bodyL, lineHeight: 22 },
  resultBody: { fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM, color: WarshPalette.bodyBrown },
  reviewCard: { padding: Spacing.lg, borderRadius: Radii.md, borderWidth: 0.5, borderColor: WarshPalette.parchment, backgroundColor: WarshPalette.white, gap: 10 },
  reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.md },
  reviewWord: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  reviewMeaning: { flex: 1, fontFamily: Fonts.semiBold, fontSize: 17, lineHeight: 24, color: WarshPalette.ink, textAlign: "right" },
  reviewAyah: { padding: Spacing.md, borderRadius: Radii.sm, borderWidth: 1, borderColor: WarshPalette.cream, backgroundColor: WarshPalette.highlightBgSoft, gap: Spacing.xs },
  reviewGloss: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: WarshPalette.bodyBrown },
  reviewRef: { fontFamily: Fonts.italic, fontSize: FontSizes.caption, lineHeight: 16, color: WarshPalette.goldText },
  hero: { overflow: "hidden", alignItems: "center", paddingVertical: 28, paddingHorizontal: Spacing.xl, borderRadius: Radii.xl, borderWidth: 0.5, borderColor: WarshPalette.gold, backgroundColor: WarshPalette.navy },
  heroCorner: { position: "absolute", width: 32, height: 32, borderColor: WarshPalette.gold },
  heroCornerTop: { top: Spacing.md, left: Spacing.md, borderTopWidth: 1, borderLeftWidth: 1, borderTopLeftRadius: 6 },
  heroCornerBottom: { right: Spacing.md, bottom: Spacing.md, borderRightWidth: 1, borderBottomWidth: 1, borderBottomRightRadius: 6 },
  heroTick: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: WarshPalette.gold, backgroundColor: WarshPalette.navyDeep, alignItems: "center", justifyContent: "center" },
  heroTitle: { marginTop: 14, fontFamily: Fonts.bold, fontSize: 25, lineHeight: 32, color: WarshPalette.white, textAlign: "center" },
  heroSub: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: WarshPalette.parchment, textAlign: "center" },
  coverageCard: { paddingVertical: 18, paddingHorizontal: Spacing.lg, borderRadius: Radii.md, borderWidth: 0.5, borderColor: WarshPalette.parchment, backgroundColor: WarshPalette.parchmentBg },
  coverageText: { fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 22, color: WarshPalette.ink },
  coverageTrack: { marginTop: Spacing.md, height: 8, borderRadius: Radii.full, backgroundColor: WarshPalette.cream, overflow: "hidden" },
  coverageFill: { height: "100%", borderRadius: Radii.full, backgroundColor: WarshPalette.gold },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: Radii.md, borderWidth: 0.5, borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.correctBg },
  streakText: { fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyM, lineHeight: 20, color: WarshPalette.sageDeep },
  textButton: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: -Spacing.sm },
  textButtonLabel: { fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyL, color: WarshPalette.navy },
  error: { padding: Spacing.md, gap: Spacing.sm, backgroundColor: WarshPalette.wrongBg, borderRadius: Radii.md },
});
