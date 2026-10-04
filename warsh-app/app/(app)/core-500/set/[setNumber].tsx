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

type Stage = "cards" | "intro" | "test";
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
  const [feedback, setFeedback] = useState<CoreAssessment["feedback"]>();
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
    setLoading(true); setError(null); setFeedback(undefined); setSelected(null); setBusy(false); busyRef.current = false;
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
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [index, stage, test?.question?.id, feedback]);
  const word = words[Math.min(index, words.length - 1)];
  const testLanguage = test?.language ?? language;
  async function act(action: Parameters<typeof updateCoreAssessment>[1]) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try {
      const next = await updateCoreAssessment(setNumber, action);
      if (sessionKey.current !== storageKey) return;
      setTest(next); setStage("test"); setResume(null); setFeedback(next.feedback); setSelected(null);
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
      <Text style={styles.meta}>{direction(t("core500.wordOf", { index: index + 1, total: words.length }))}</Text>
      <View style={styles.card}>
        <View style={styles.wordRow}><ArabicText size="xl" style={styles.word}>{word.arabic}</ArabicText><PlayButton key={word.id} text={word.arabic} wordId={word.id} audioUrl={word.audioUrl ?? undefined} size={28} /></View>
        <Text style={styles.translit}>{direction(word.transliteration, "en")}</Text>
        <Text style={[styles.meaning, language === "ur" && styles.rtl]}>{direction(language === "ur" ? word.translationUr : word.translationEn, language)}</Text>
        <Text style={[styles.body, language === "en" && styles.rtl]}>{direction(language === "ur" ? word.translationEn : word.translationUr, language === "ur" ? "en" : "ur")}</Text>
        <Text style={styles.meta}>{direction(t("core500.appearsCount", { count: word.frequencyInQuran ?? 0 }))}</Text>
        {word.isCorePrefix && <Text style={styles.note}>{direction(t("core500.prefixInAyah"))}</Text>}
      </View>
      <AyahExamples key={word.id} examples={word.ayahExamples ?? []} language={language} />
      <Text style={styles.note}>{direction(t("core500.cardsBeforeTest"))}</Text>
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
    if (feedback) return <View style={[styles.card, feedback.correct ? styles.correct : styles.incorrect]}>
      <Text style={styles.title}>{direction(t(feedback.correct ? "core500.answerCorrect" : "core500.answerMissed"))}</Text>
      <ArabicText size="xl">{words.find(w => w.id === feedback.wordId)?.arabic}</ArabicText>
      <Text style={styles.meaning}>{direction(feedback.meaning, testLanguage)}</Text>
      <BrandButton title={t("core500.testContinue")} onPress={() => setFeedback(undefined)} />
    </View>;
    if (test?.phase === "REVIEW") return <>
      <Text style={styles.title}>{direction(t("core500.reviewMissed"))}</Text>
      <Text style={styles.body}>{direction(t("core500.reviewMissedBody", { count: test.review.length }))}</Text>
      {test.review.map(missed => <View key={missed.wordId} style={styles.card}>
        <ArabicText size="lg">{missed.arabic}</ArabicText>
        <Text style={styles.meaning}>{direction(missed.meaning, testLanguage)}</Text>
        <AyahExamples examples={words.find(w => w.id === missed.wordId)?.ayahExamples ?? []} language={testLanguage} />
      </View>)}
      <BrandButton title={t("core500.retryMissed")} loading={busy} onPress={() => void act({ action: "retry", round: test.round })} />
    </>;
    if (test?.phase === "COMPLETE" && test.completed) return <View style={styles.card}>
      <Ionicons name="checkmark-circle" size={56} color={WarshPalette.sageDeep} />
      <Text style={styles.title}>{direction(t("core500.setComplete", { set: setNumber }))}</Text>
      <Text style={styles.meaning}>{direction(t("core500.testPassed"))}</Text>
      <Text style={styles.body}>{direction(t("core500.setCompleteBody", { percent: test.coveragePercent ?? 0 }))}</Text>
      <Text style={styles.note}>{direction(t("core500.testStreak", { count: test.currentStreak ?? 0 }))}</Text>
      {setNumber < 100 && <BrandButton title={t("core500.continue", { set: setNumber + 1 })} onPress={() => router.replace(`/core-500/set/${setNumber + 1}` as never)} />}
      <BrandButton variant="secondary" title={t("core500.done")} onPress={() => router.replace("/core-500" as never)} />
      <BrandButton variant="secondary" title={t("core500.reviewCards")} onPress={() => { setIndex(0); setStage("cards"); }} />
    </View>;
    const question = test?.question;
    if (!question || !test) return null;
    return <>
      <Text style={styles.meta}>{direction(t("core500.questionOf", { index: test.answeredCount + 1, total: test.total }))}</Text>
      <View style={styles.card}><Text style={styles.title}>{direction(t("core500.chooseMeaning"))}</Text><ArabicText size="xl" style={styles.word}>{question.arabic}</ArabicText></View>
      {question.options.map(option => <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: selected === option.id, disabled: busy }} disabled={busy} onPress={() => setSelected(option.id)} style={[styles.option, selected === option.id && styles.selected]}>
        <Text style={[styles.body, testLanguage === "ur" && styles.rtl]}>{direction(option.text, testLanguage)}</Text>
      </Pressable>)}
      <BrandButton title={t("core500.checkAnswer")} loading={busy} disabled={!selected} onPress={() => { if (selected) void act({ action: "answer", questionId: question.id, optionId: selected, round: test.round }); }} />
    </>;
  };
  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} hitSlop={12} onPress={() => router.back()}><Ionicons name="close" size={24} color={WarshPalette.ink} /></Pressable>
      <Text style={styles.headerText}>{direction(t("core500.setLabel", { set: setNumber }))}</Text>
      <Text style={styles.meta}>Core 500</Text>
    </View>
    <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.lg), maxWidth: Platform.OS === "web" && width >= 960 ? 720 : 560 }]}>
      {error && <View accessibilityRole="alert" style={styles.error}><Text style={styles.body}>{direction(error)}</Text>
        {words.length > 0 && <BrandButton variant="secondary" title={t("core500.resumeTest")} disabled={busy} onPress={() => setReload(n => n + 1)} />}
      </View>}
      {body()}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WarshPalette.creamBg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: WarshPalette.listDivider },
  headerText: { fontFamily: Fonts.semiBold, color: WarshPalette.ink, fontSize: FontSizes.bodyL },
  content: { padding: Spacing.lg, gap: Spacing.md, width: "100%", alignSelf: "center", flexGrow: 1 },
  card: { backgroundColor: WarshPalette.parchmentBg, borderWidth: 1, borderColor: WarshPalette.listDivider, borderRadius: Radii.xl, padding: Spacing.lg, gap: Spacing.md },
  wordRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.md },
  word: { textAlign: "center" },
  title: { fontFamily: Fonts.display, fontSize: FontSizes.display, lineHeight: LineHeights.display, color: WarshPalette.ink },
  meaning: { fontFamily: Fonts.semiBold, fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: WarshPalette.ink },
  translit: { fontFamily: Fonts.regular, fontSize: FontSizes.transliteration, color: WarshPalette.goldText, textAlign: "center" },
  body: { fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL, color: WarshPalette.bodyBrown },
  meta: { fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption, color: WarshPalette.subtleBrown },
  note: { fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM, color: WarshPalette.subtleBrown },
  rtl: { textAlign: "right" },
  option: { padding: Spacing.lg, minHeight: 56, borderWidth: 1, borderColor: WarshPalette.sageSoft, borderRadius: Radii.md, backgroundColor: WarshPalette.parchmentBg },
  selected: { borderColor: WarshPalette.goldText, backgroundColor: WarshPalette.highlightBg },
  correct: { backgroundColor: WarshPalette.correctBg, borderColor: WarshPalette.sageTintBorder },
  incorrect: { backgroundColor: WarshPalette.wrongBg, borderColor: WarshPalette.wrongBorder },
  error: { padding: Spacing.md, gap: Spacing.sm, backgroundColor: WarshPalette.wrongBg, borderRadius: Radii.md },
});
