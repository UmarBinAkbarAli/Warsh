import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TextStyle, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api, { isSubscriptionRequiredError } from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { PlayButton } from "@components/PlayButton";
import { ShadowRepeatExercise } from "@components/ShadowRepeatExercise";
import { Fonts, WarshPalette } from "../../../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelTodayReminders, fireMilestoneNotification } from "@services/notifications";
import { trackLessonStarted, trackLessonCompleted, trackMilestoneUnlocked } from "@services/analytics";
import { pickLocalized, useTranslationLanguage } from "@services/language";
import { useT } from "@i18n/index";
import { prefetchRemoteAudio, prefetchTtsAudio } from "@services/audioCache";

// ---------------------------------------------------------------------------
// API response shape — content is the raw warsh-content-schema v1.0 blob
// ---------------------------------------------------------------------------
type RawLesson = {
  id: string;
  title: string;
  titleUr?: string;
  titleAr?: string;
  xpReward: number;
  template: string;
  content: Record<string, unknown> | null;
  isCompleted?: boolean;
  isSkippedByPlacement?: boolean;
};

type CompletionResult = {
  xpEarned: number;
  chapterBonusXp: number;
  chapterJustCompleted: boolean;
  totalXp: number;
  currentStreak: number;
  streakCelebration: boolean;
  newAchievements: { key: string; title: string; titleAr?: string; xpReward: number }[];
  dailyGoalMet: boolean;
};

type SelectedAnswer = string | string[] | Record<string, string> | null;

// ---------------------------------------------------------------------------
// Internal types kept only for renderers that need typed pairs/tokens
// ---------------------------------------------------------------------------
type MatchingPair = { left: string; right: string };
type ParseToken   = { word: string; label: string; gloss?: string };
type LessonLanguage = "en" | "ur";
type TranslateFn = ReturnType<typeof useT>;

// ---------------------------------------------------------------------------
// Raw exercise helper functions — read warsh-content-schema v1.0 directly
// ---------------------------------------------------------------------------
type RawEx = Record<string, any>;

function exType(ex: RawEx): string { return ex.type as string; }

function localizedText(value: any, language: "en" | "ur"): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return pickLocalized(value.en as string | undefined, value.ur as string | undefined, language) || undefined;
}

function exWrongExpl(ex: RawEx, language: "en" | "ur"): string | undefined {
  return localizedText(ex.explanation_on_wrong, language) ?? localizedText(ex.explanation, language);
}

// Extracts just what's needed to prefetch a discover card's image + autoplay audio ahead of time.
// Mirrors the field extraction in renderDiscover() so the prefetch cache key matches the real play call.
function discoverCardPrefetchFields(card: Record<string, any> | undefined, language: "en" | "ur") {
  if (!card) return { imageUrl: undefined, audioUrl: undefined, arabicText: undefined, transliteration: undefined };
  const cardType = card.type as string | undefined;
  const text    = card.text    as Record<string, any> | undefined;
  const concept = card.concept as Record<string, any> | undefined;
  const titleObj = card.title  as Record<string, any> | undefined;
  const examples = card.examples as Array<Record<string, any>> | undefined;

  const imageUrl = card.image_url as string | undefined;
  const audioUrl = card.audio_url as string | undefined;

  let arabicText: string | undefined;
  let transliteration: string | undefined;
  if (cardType === "GRAMMAR_NOTE") {
    arabicText = titleObj?.ar as string | undefined;
  } else if (cardType === "SENTENCE") {
    arabicText = text?.ar as string | undefined;
    transliteration = text?.translit as string | undefined;
  } else {
    arabicText = (text?.ar ?? concept?.ar ?? examples?.[0]?.ar) as string | undefined;
    transliteration = text?.translit as string | undefined;
  }

  return { imageUrl, audioUrl, arabicText, transliteration };
}

function roleLabel(role: string, t: TranslateFn): string {
  switch (role) {
    case "ADJECTIVE":
      return t("player.roleAdjective");
    case "CONJUNCTION":
      return t("player.roleConjunction");
    case "DEMONSTRATIVE":
      return t("player.roleDemonstrative");
    case "INTERJECTION":
      return t("player.roleInterjection");
    case "LITERARY_DEVICE":
      return t("player.roleLiteraryDevice");
    case "NOUN":
      return t("player.roleNoun");
    case "OBJECT":
      return t("player.roleObject");
    case "PARTICLE":
      return t("player.roleParticle");
    case "PLACE_ZARF":
      return t("player.rolePlaceZarf");
    case "POSSESSIVE":
      return t("player.rolePossessive");
    case "PREDICATE":
      return t("player.rolePredicate");
    case "PREPOSITION":
      return t("player.rolePreposition");
    case "PRONOUN":
      return t("player.rolePronoun");
    case "RELATIVE_PRONOUN":
      return t("player.roleRelativePronoun");
    case "SUBJECT":
      return t("player.roleSubject");
    case "TIME_ZARF":
      return t("player.roleTimeZarf");
    case "VERB":
      return t("player.roleVerb");
    case "VOCATIVE":
      return t("player.roleVocative");
    default:
      return role;
  }
}

function exPrompt(ex: RawEx, language: LessonLanguage, t: TranslateFn): string | undefined {
  const type = exType(ex);
  if (type === "TAP_TRANSLATION") {
    if ((ex.direction as string | undefined) === "en_to_ar") {
      return t("player.prompt.whichArabicMeans", { value: localizedText(ex.prompt, language) ?? "" });
    }
    return t("player.prompt.whatArabicMeans");
  }
  if (type === "TRUE_FALSE") return localizedText(ex.statement, language);
  if (type === "FILL_BLANK") return localizedText(ex.hint, language);
  if (type === "BUILD_SENTENCE") return localizedText(ex.target_translation, language);
  if (type === "MATCHING") return t("player.prompt.matchArabicMeaning");
  if (type === "MATCH_AYAH") return t("player.prompt.matchAyahMeaning");
  if (type === "AUDIO_RECOGNITION") return t("player.prompt.audioMeaning");
  if (type === "WRITE_ARABIC") return localizedText(ex.prompt, language);
  if (type === "HARAKAH_PLACEMENT") return t("player.prompt.harakah");
  if (type === "WORD_ORDER") return localizedText(ex.context, language);
  if (type === "TRANSLATE_TO_ARABIC") return localizedText(ex.source, language);
  if (type === "IDENTIFY_ROOT") return t("player.prompt.identifyRoot");
  return undefined;
}

function exArabicText(ex: RawEx): string | undefined {
  const t = exType(ex);
  if (t === "TAP_TRANSLATION") {
    if ((ex.direction as string | undefined) === "en_to_ar") return undefined;
    return (ex.prompt as any)?.ar as string | undefined;
  }
  if (t === "TRUE_FALSE") return ((ex.statement as any)?.ar_example as any)?.ar as string | undefined;
  if (t === "FILL_BLANK") return ex.sentence_ar as string | undefined;
  if (t === "SHADOW_REPEAT") return (ex.phrase as any)?.ar as string | undefined;
  if (t === "MATCH_AYAH") return (ex.ayah_fragment as any)?.ar as string | undefined;
  if (t === "HARAKAH_PLACEMENT") return ex.word_unvowelled as string | undefined;
  if (t === "IDENTIFY_ROOT") return (ex.word as any)?.ar as string | undefined;
  return undefined;
}

function exOptions(ex: RawEx, language: LessonLanguage, t: TranslateFn): string[] {
  const type = exType(ex);
  if (type === "TAP_TRANSLATION") {
    const opts = ex.options as Array<any> | undefined;
    if ((ex.direction as string | undefined) === "en_to_ar") {
      return opts ? opts.map((o) => o.ar as string) : [];
    }
    return opts ? opts.map((o) => localizedText(o, language) ?? "") : [];
  }
  if (type === "TRUE_FALSE") return [t("common.true"), t("common.false")];
  if (type === "FILL_BLANK") {
    const opts = ex.options as Array<any> | undefined;
    return opts ? opts.map((o) => o.ar as string) : [];
  }
  if (type === "BUILD_SENTENCE") {
    const tiles = ex.tiles as Array<any> | undefined;
    return tiles ? tiles.map((tile) => tile.ar as string) : [];
  }
  if (type === "MATCHING") {
    const right = ex.right_column as Array<any> | undefined;
    return right ? right.map((item) => localizedText(item, language) ?? "") : [];
  }
  if (type === "MATCH_AYAH") {
    const opts = ex.options as Array<any> | undefined;
    return opts ? opts.map((o) => localizedText(o, language) ?? "") : [];
  }
  if (type === "AUDIO_RECOGNITION") {
    const opts = ex.options as Array<any> | undefined;
    return opts ? opts.map((o) => localizedText(o, language) ?? "") : [];
  }
  if (type === "WORD_ORDER") {
    const tiles = ex.tiles as Array<any> | undefined;
    return tiles ? tiles.map((tile) => tile.ar as string) : [];
  }
  if (type === "TRANSLATE_TO_ARABIC") {
    const answers = ex.acceptable_answers as Array<any> | undefined;
    return answers ? answers.map((answer) => answer.ar as string) : [];
  }
  if (type === "IDENTIFY_ROOT") {
    return (ex.options as string[] | undefined) ?? [];
  }
  return [];
}

function exCorrectAnswer(ex: RawEx, language: LessonLanguage, t: TranslateFn): string {
  const type = exType(ex);
  if (type === "TAP_TRANSLATION") {
    const opts = ex.options as Array<any> | undefined;
    const idx = ex.correct_index as number | undefined;
    if (opts && idx !== undefined) {
      if ((ex.direction as string | undefined) === "en_to_ar") return opts[idx].ar as string;
      return localizedText(opts[idx], language) ?? "";
    }
    return "";
  }
  if (type === "TRUE_FALSE") {
    return (ex.correct_answer as boolean | undefined) ? t("common.true") : t("common.false");
  }
  if (type === "FILL_BLANK") return (ex.correct_answer as any)?.ar as string ?? "";
  if (type === "BUILD_SENTENCE") {
    const tiles = ex.tiles as Array<any> | undefined;
    const order = ex.correct_order as number[] | undefined;
    if (tiles && order) return order.map((i) => tiles[i].ar as string).join(" ");
    return "";
  }
  if (type === "MATCH_AYAH") {
    const opts = ex.options as Array<any> | undefined;
    const idx = ex.correct_index as number | undefined;
    if (opts && idx !== undefined) return localizedText(opts[idx], language) ?? "";
    return "";
  }
  if (type === "AUDIO_RECOGNITION") {
    const opts = ex.options as Array<any> | undefined;
    const idx = ex.correct_index as number | undefined;
    if (opts && idx !== undefined) return localizedText(opts[idx], language) ?? "";
    return "";
  }
  if (type === "WRITE_ARABIC") return (ex.correct_answer as any)?.ar as string ?? "";
  if (type === "HARAKAH_PLACEMENT") return ex.correct_vowelled as string ?? "";
  if (type === "WORD_ORDER") {
    const tiles = ex.tiles as Array<any> | undefined;
    const order = ex.correct_order as number[] | undefined;
    if (tiles && order) return order.map((i) => tiles[i].ar as string).join(" ");
    return "";
  }
  if (type === "TRANSLATE_TO_ARABIC") {
    const answers = ex.acceptable_answers as Array<any> | undefined;
    const idx = ex.correct_index as number | undefined;
    if (answers && idx !== undefined) return answers[idx].ar as string;
    return "";
  }
  if (type === "IDENTIFY_ROOT") {
    const opts = ex.options as string[] | undefined;
    const idx = ex.correct_index as number | undefined;
    if (opts && idx !== undefined) return opts[idx];
    return "";
  }
  return "";
}

function exPairs(ex: RawEx, language: LessonLanguage): MatchingPair[] {
  const left = ex.left_column as Array<any> | undefined;
  const right = ex.right_column as Array<any> | undefined;
  const pairs = ex.correct_pairs as Array<[number, number]> | undefined;
  if (left && right && pairs) {
    return pairs.map(([l, r]) => ({ left: left[l].ar as string, right: localizedText(right[r], language) ?? "" }));
  }
  return [];
}

function exParseTokens(ex: RawEx, language: LessonLanguage, t: TranslateFn): ParseToken[] {
  const words = ex.words as Array<any> | undefined;
  const roles = ex.correct_roles as string[] | undefined;
  if (!words || !roles) return [];
  return words.map((word, index) => ({
    word: word.ar as string,
    label: roleLabel(roles[index], t),
    gloss: localizedText(word, language),
  }));
}

function exLabels(ex: RawEx, t: TranslateFn): string[] {
  return ((ex.available_roles as string[] | undefined) ?? []).map((role) => roleLabel(role, t));
}

// ---------------------------------------------------------------------------
// Pure utility helpers
// ---------------------------------------------------------------------------
const ANSWER_DELAY_MS = 1800;

function splitWords(value?: string) {
  return value?.trim().split(/\s+/).filter(Boolean) ?? [];
}

function containsArabic(value?: string | null) {
  return Boolean(value && /[؀-ۿ]/.test(value));
}

function normalizeAnswer(value?: string | null) {
  return value?.normalize("NFKD").replace(/[ً-ٰٟ]/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function normalizeArabicAnswer(value?: string | null) {
  return normalizeAnswer(value).replace(/[أإآٱ]/g, "ا");
}

function getSelectedText(selectedAnswer: SelectedAnswer) {
  if (selectedAnswer && !Array.isArray(selectedAnswer) && typeof selectedAnswer === "object") {
    return Object.values(selectedAnswer).join(" ");
  }
  return Array.isArray(selectedAnswer) ? selectedAnswer.join(" ") : selectedAnswer;
}

function isAnswerCorrect(ex: RawEx | undefined, selectedAnswer: SelectedAnswer, language: LessonLanguage, t: TranslateFn): boolean {
  if (!ex) return false;

  if (exType(ex) === "MATCHING") {
    if (!selectedAnswer || Array.isArray(selectedAnswer) || typeof selectedAnswer !== "object") return false;
    return exPairs(ex, language).every((pair) => normalizeAnswer(selectedAnswer[pair.left]) === normalizeAnswer(pair.right));
  }

  if (exType(ex) === "GRAMMAR_PARSE") {
    if (!selectedAnswer || Array.isArray(selectedAnswer) || typeof selectedAnswer !== "object") return false;
    return exParseTokens(ex, language, t).every((token) => normalizeAnswer(selectedAnswer[token.word]) === normalizeAnswer(token.label));
  }

  if (exType(ex) === "WRITE_ARABIC" || exType(ex) === "HARAKAH_PLACEMENT") {
    const selText = getSelectedText(selectedAnswer) ?? "";
    const correct = exCorrectAnswer(ex, language, t);
    return normalizeArabicAnswer(selText) === normalizeArabicAnswer(correct);
  }

  if (exType(ex) === "TRANSLATE_TO_ARABIC") {
    const answers = ex.acceptable_answers as Array<any> | undefined;
    const selText = getSelectedText(selectedAnswer) ?? "";
    return answers?.some((answer) => normalizeArabicAnswer(answer.ar as string) === normalizeArabicAnswer(selText)) ?? false;
  }

  const correct = exCorrectAnswer(ex, language, t);
  const selText = getSelectedText(selectedAnswer) ?? "";
  if (containsArabic(selText) || containsArabic(correct)) return selText === correct;
  return normalizeAnswer(selText) === normalizeAnswer(correct);
}

function getCorrectAnswerDisplay(ex: RawEx | undefined, language: LessonLanguage, t: TranslateFn): string {
  if (!ex) return "";
  if (exType(ex) === "MATCHING") return exPairs(ex, language).map((pair) => `${pair.left} = ${pair.right}`).join(" | ");
  if (exType(ex) === "GRAMMAR_PARSE") return exParseTokens(ex, language, t).map((token) => `${token.word} = ${token.label}`).join(" | ");
  return exCorrectAnswer(ex, language, t);
}

function renderMaybeArabic(value: string, arabicStyle: TextStyle = styles.optionArabicText, textStyle: TextStyle = styles.optionText) {
  if (containsArabic(value)) {
    return <ArabicText size="sm" style={arabicStyle}>{value}</ArabicText>;
  }
  return <Text style={textStyle}>{value}</Text>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LessonPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useTranslationLanguage();
  const t = useT();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<RawLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<SelectedAnswer>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);

  // WRITE_ARABIC hint state
  const [writeHintShown, setWriteHintShown] = useState(false);

  // SHADOW_REPEAT / SPOKEN_PHRASES tracking
  const phrasesCompletedRef = useRef(0);
  const completionFiredRef = useRef(false);
  const [spPhraseIdx, setSpPhraseIdx] = useState(0);
  const [spPhraseStep, setSpPhraseStep] = useState<"intro" | "shadow" | "recognition" | "phraseComplete">("intro");
  const [spRecognitionAnswer, setSpRecognitionAnswer] = useState<string | null>(null);
  const [spRecognitionAnswered, setSpRecognitionAnswered] = useState(false);

  // Shorthand content accessor — avoids casting everywhere
  const c = (lesson?.content ?? {}) as Record<string, any>;
  const discoverCards = (c.discover_cards ?? []) as Array<Record<string, any>>;
  const exercises     = (c.exercises ?? []) as Array<RawEx>;
  const currentExercise = exercises[currentExerciseIndex];
  const selectedText  = getSelectedText(selectedAnswer);
  const answeredCorrectly = isAnswered && isAnswerCorrect(currentExercise, selectedAnswer, language, t);
  const completedExerciseCount = Math.min(currentExerciseIndex + (isAnswered ? 1 : 0), exercises.length);
  const screenPadding = { paddingTop: insets.top + 16 };

  // Start warming every Discovery card as soon as the lesson loads (while the
  // learner is still on the hook screen). Fixtures usually provide CDN audio;
  // TTS remains a fallback for older cards without audio_url.
  useEffect(() => {
    if (!lesson || discoverCards.length === 0) return;
    for (const upcomingCard of discoverCards) {
      const { imageUrl, audioUrl, arabicText, transliteration } = discoverCardPrefetchFields(upcomingCard, language);
      if (imageUrl) Image.prefetch(imageUrl).catch(() => undefined);
      if (audioUrl && arabicText) {
        prefetchRemoteAudio(audioUrl, transliteration ?? arabicText, "lessons")
          .catch(() => prefetchTtsAudio([{
            text: arabicText,
            cacheKey: transliteration ?? arabicText,
            category: "lessons",
          }]))
          .catch(() => undefined);
      } else if (arabicText) {
        prefetchTtsAudio([{ text: arabicText, cacheKey: transliteration ?? arabicText, category: "lessons" }]).catch(() => undefined);
      }
    }
  }, [discoverCards, language, lesson]);

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) { setError(t("player.invalidLesson")); setLoading(false); return; }
      try {
        const response = await api.get(`/api/lessons/${lessonId}`);
        const raw = response.data.data.lesson as RawLesson;
        setLesson(raw);
        trackLessonStarted(lessonId, raw.template);
      } catch (loadError) {
        if (isSubscriptionRequiredError(loadError)) {
          router.replace("/(app)/paywall");
          return;
        }
        setError(t("player.loadError"));
      } finally {
        setLoading(false);
      }
    }
    void loadLesson();
  }, [lessonId, router, t]);

  useEffect(() => {
    async function finishLesson() {
      if (!lessonId || currentBeat !== 5 || completionFiredRef.current) return;
      completionFiredRef.current = true;
      setSubmitting(true);
      setError(null);
      try {
        const response = await api.post(`/api/lessons/${lessonId}/complete`, { score: 100, phrasesCompleted: phrasesCompletedRef.current });
        const data = response.data.data;
        const achievements = Array.isArray(data.newAchievements) ? data.newAchievements : [];
        const dailyGoalMet = data.dailyGoalXp > 0;
        setCompletionResult({
          xpEarned: data.xpEarned,
          chapterBonusXp: data.chapterBonusXp ?? 0,
          chapterJustCompleted: Boolean(data.chapterJustCompleted),
          totalXp: data.totalXp,
          currentStreak: data.currentStreak,
          streakCelebration: Boolean(data.streakCelebration),
          newAchievements: achievements,
          dailyGoalMet,
        });
        trackLessonCompleted({ lessonId, lessonType: lesson?.template, xpEarned: data.xpEarned, currentStreak: data.currentStreak, dailyGoalMet });
        if (dailyGoalMet) {
          cancelTodayReminders().catch(() => {});
          const today = new Date().toISOString().slice(0, 10);
          AsyncStorage.setItem(`warsh_daily_goal_toast_${today}`, "1").catch(() => {});
        }
        for (const achievement of achievements as { key: string; title: string; xpReward: number }[]) {
          fireMilestoneNotification(achievement.title).catch(() => {});
          trackMilestoneUnlocked(achievement.key ?? "", achievement.title, achievement.xpReward ?? 0);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError(t("player.lessonLocked"));
        } else {
          setError(t("player.completeError"));
        }
      } finally {
        setSubmitting(false);
      }
    }
    void finishLesson();
  }, [currentBeat, lessonId, lesson?.template, t]);

  function goToBeat(beat: number) {
    setCurrentBeat(beat);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }

  function goToNextExercise() {
    if (currentExerciseIndex >= exercises.length - 1) { goToBeat(4); return; }
    setCurrentExerciseIndex((i) => i + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setWriteHintShown(false);
  }

  function answerExercise(answer: SelectedAnswer) {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setTimeout(goToNextExercise, ANSWER_DELAY_MS);
  }

  function checkBuildSentence() {
    if (!Array.isArray(selectedAnswer)) return;
    answerExercise(selectedAnswer);
  }

  function addBuildTile(option: string) {
    if (isAnswered) return;
    setSelectedAnswer((current) => {
      const tiles = Array.isArray(current) ? current : [];
      const expected = splitWords(exCorrectAnswer(currentExercise, language, t)).length;
      if (tiles.length >= expected) return tiles;
      return [...tiles, option];
    });
  }

  function removeBuildTile(index: number) {
    if (isAnswered) return;
    setSelectedAnswer((current) => {
      if (!Array.isArray(current)) return current;
      return current.filter((_, i) => i !== index);
    });
  }

  function getOptionStyle(option: string) {
    if (!isAnswered) return styles.optionButton;
    const correct = exCorrectAnswer(currentExercise, language, t);
    const isCorrect = containsArabic(option) || containsArabic(correct)
      ? option === correct
      : normalizeAnswer(option) === normalizeAnswer(correct);
    if (isCorrect) return [styles.optionButton, styles.optionCorrect];
    if (selectedText === option) return [styles.optionButton, styles.optionWrong];
    return styles.optionButton;
  }

  function getOptionTextStyle(option: string) {
    if (!isAnswered) return containsArabic(option) ? styles.optionArabicText : styles.optionText;
    const correct = exCorrectAnswer(currentExercise, language, t);
    const isCorrect = containsArabic(option) || containsArabic(correct)
      ? option === correct
      : normalizeAnswer(option) === normalizeAnswer(correct);
    if (isCorrect) return containsArabic(option) ? styles.optionArabicTextCorrect : styles.optionTextCorrect;
    if (selectedText === option) return containsArabic(option) ? styles.optionArabicTextWrong : styles.optionTextWrong;
    return containsArabic(option) ? styles.optionArabicText : styles.optionText;
  }

  function updateMappedAnswer(key: string, value: string) {
    if (isAnswered) return;
    setSelectedAnswer((current) => ({
      ...(!Array.isArray(current) && current && typeof current === "object" ? current : {}),
      [key]: value,
    }));
  }

  // ---- Feedback bar ----

  function renderFeedback() {
    if (!isAnswered || !currentExercise) return null;
    const wrongExpl = exWrongExpl(currentExercise, language);
    const arabicForDisplay = exArabicText(currentExercise) ?? exCorrectAnswer(currentExercise, language, t);
    return (
      <View style={[styles.feedbackBar, answeredCorrectly ? styles.feedbackCorrect : styles.feedbackWrong]}>
        {answeredCorrectly ? (
          <>
            <ArabicText size="sm" style={styles.feedbackArabic}>بارك الله فيك</ArabicText>
            <Text style={styles.feedbackExplanation}>{t("player.feedback.correct")}</Text>
          </>
        ) : (
          <>
            <Text style={styles.feedbackWrongTitle}>{t("player.feedback.almost")}</Text>
            {wrongExpl ? <Text style={[styles.feedbackExplanation, styles.feedbackWrongExplanation]}>{wrongExpl}</Text> : null}
            {containsArabic(arabicForDisplay) ? (
              <ArabicText size="sm" style={styles.feedbackCorrectAnswerArabic}>{getCorrectAnswerDisplay(currentExercise, language, t)}</ArabicText>
            ) : (
              <Text style={styles.feedbackCorrectAnswerText}>{getCorrectAnswerDisplay(currentExercise, language, t)}</Text>
            )}
          </>
        )}
      </View>
    );
  }

  // ---- Progress bar ----

  function renderProgressBar() {
    return (
      <View style={styles.progressTrack}>
        {exercises.map((ex, index) => (
          <View
            key={`ex-${index}`}
            style={[styles.progressSegment, index < completedExerciseCount ? styles.progressSegmentFilled : styles.progressSegmentEmpty]}
          />
        ))}
      </View>
    );
  }

  // ---- Option grid (TAP_TRANSLATION, TRUE_FALSE) ----

  function renderOptionGrid() {
    const options = exOptions(currentExercise ?? {}, language, t);
    return (
      <View style={styles.optionGrid}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            disabled={isAnswered}
            onPress={() => answerExercise(option)}
            style={getOptionStyle(option)}
          >
            {renderMaybeArabic(option, getOptionTextStyle(option), getOptionTextStyle(option))}
          </Pressable>
        ))}
      </View>
    );
  }

  // ---- WRITE_ARABIC ----

  function renderWriteArabic() {
    const correctAr = (currentExercise?.correct_answer as any)?.ar as string | undefined;
    const hintAvailable = (currentExercise?.hint_available as boolean | undefined) ?? false;
    const firstLetter = correctAr?.[0];
    const typedValue = typeof selectedAnswer === "string" ? selectedAnswer : "";
    const hasInput = typedValue.trim().length > 0;

    return (
      <>
        <View style={styles.writeArabicContainer}>
          <TextInput
            value={typedValue}
            onChangeText={(text) => { if (!isAnswered) setSelectedAnswer(text); }}
            placeholder={t("player.writePlaceholder")}
            placeholderTextColor={WarshPalette.subtleBrown}
            style={styles.writeArabicInput}
            autoCorrect={false}
            autoCapitalize="none"
            editable={!isAnswered}
            textAlign="right"
          />
          {hintAvailable && !writeHintShown && !isAnswered ? (
            <Pressable onPress={() => setWriteHintShown(true)} style={styles.hintButton} hitSlop={8}>
              <Text style={styles.hintButtonText}>{t("player.showHint")}</Text>
            </Pressable>
          ) : null}
          {writeHintShown && firstLetter ? (
            <Text style={styles.hintRevealText}>{t("player.startsWith")} <Text style={styles.hintRevealLetter}>{firstLetter}</Text></Text>
          ) : null}
        </View>
        <BrandButton
          title={t("common.check")}
          onPress={() => { if (hasInput) answerExercise(typedValue.trim()); }}
          disabled={isAnswered || !hasInput}
          style={styles.bottomButton}
        />
      </>
    );
  }

  // ---- HARAKAH_PLACEMENT ----

  function renderHarakahPlacement() {
    const hint = localizedText(currentExercise?.hint, language);
    const typedValue = typeof selectedAnswer === "string" ? selectedAnswer : "";
    const hasInput = typedValue.trim().length > 0;

    return (
      <>
        <View style={styles.writeArabicContainer}>
          {hint ? <Text style={styles.harakahHintText}>{hint}</Text> : null}
          <TextInput
            value={typedValue}
            onChangeText={(text) => { if (!isAnswered) setSelectedAnswer(text); }}
            placeholder={t("player.harakahPlaceholder")}
            placeholderTextColor={WarshPalette.subtleBrown}
            style={[styles.writeArabicInput, styles.harakahInput]}
            autoCorrect={false}
            autoCapitalize="none"
            editable={!isAnswered}
            textAlign="right"
          />
        </View>
        <BrandButton
          title={t("common.check")}
          onPress={() => { if (hasInput) answerExercise(typedValue.trim()); }}
          disabled={isAnswered || !hasInput}
          style={styles.bottomButton}
        />
      </>
    );
  }

  // ---- AUDIO_RECOGNITION ----

  function renderAudioRecognition() {
    const arabicText = currentExercise?.arabic_text as string | undefined;
    return (
      <>
        <View style={styles.audioRecognitionCenter}>
          {arabicText ? (
            <View style={styles.audioRecognitionPlayWrap}>
              <PlayButton
                key={`audio-rec-${currentExerciseIndex}`}
                text={arabicText}
                cacheKey={`ar-${lessonId}-ex${currentExerciseIndex}`}
                category="lessons"
                size={48}
                autoPlay={true}
              />
              <Text style={styles.audioRecognitionHint}>{t("player.audioReplay")}</Text>
            </View>
          ) : (
            <Text style={styles.hookQuestion}>{t("player.audioUnavailable")}</Text>
          )}
        </View>
        {renderOptionGrid()}
      </>
    );
  }

  // ---- BUILD_SENTENCE ----

  function renderBuildSentence() {
    const selectedTiles = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const slots = splitWords(exCorrectAnswer(currentExercise ?? {}, language, t));
    const canCheck = selectedTiles.length === slots.length && !isAnswered;
    const options = exOptions(currentExercise ?? {}, language, t);

    return (
      <>
        <View style={[styles.answerRow, isAnswered ? (answeredCorrectly ? styles.answerRowCorrect : styles.answerRowWrong) : null, containsArabic(exCorrectAnswer(currentExercise ?? {}, language, t)) ? styles.answerRowRtl : null]}>
          {slots.map((slot, index) => {
            const tile = selectedTiles[index];
            return (
              <Pressable
                key={`${slot}-${index}`}
                accessibilityRole="button"
                disabled={!tile || isAnswered}
                onPress={() => removeBuildTile(index)}
                style={[styles.answerSlot, tile ? styles.answerSlotFilled : null]}
              >
                {tile ? renderMaybeArabic(tile, styles.tileArabicText, styles.tileText) : <Text style={styles.emptySlotText}> </Text>}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.tileWrap}>
          {options.map((option, index) => (
            <Pressable
              key={`${option}-${index}`}
              accessibilityRole="button"
              disabled={isAnswered}
              onPress={() => addBuildTile(option)}
              style={styles.wordTile}
            >
              {renderMaybeArabic(option, styles.tileArabicText, styles.tileText)}
            </Pressable>
          ))}
        </View>
        {canCheck ? <BrandButton title={t("common.check")} onPress={checkBuildSentence} style={styles.bottomButton} /> : null}
      </>
    );
  }

  // ---- MATCHING ----

  function renderMatching() {
    const pairs = exPairs(currentExercise ?? {}, language);
    const choices = exOptions(currentExercise ?? {}, language, t);
    const selectedMap = !Array.isArray(selectedAnswer) && selectedAnswer && typeof selectedAnswer === "object" ? selectedAnswer : {};
    const canCheck = pairs.length > 0 && pairs.every((pair) => selectedMap[pair.left]) && !isAnswered;

    return (
      <>
        <ScrollView style={styles.exerciseScroller} contentContainerStyle={styles.exerciseScrollerContent}>
          {pairs.map((pair) => (
            <View key={pair.left} style={styles.matchingRow}>
              <View style={styles.matchingLeft}>{renderMaybeArabic(pair.left, styles.matchingArabic, styles.matchingText)}</View>
              <View style={styles.matchingChoices}>
                {choices.map((choice) => {
                  const selected = selectedMap[pair.left] === choice;
                  const correct = isAnswered && normalizeAnswer(choice) === normalizeAnswer(pair.right);
                  const wrong = isAnswered && selected && !correct;
                  return (
                    <Pressable
                      key={`${pair.left}-${choice}`}
                      accessibilityRole="button"
                      disabled={isAnswered}
                      onPress={() => updateMappedAnswer(pair.left, choice)}
                      style={[styles.matchingChoice, selected ? styles.matchingChoiceSelected : null, correct ? styles.optionCorrect : wrong ? styles.optionWrong : null]}
                    >
                      {renderMaybeArabic(choice, correct ? styles.optionArabicTextCorrect : wrong ? styles.optionArabicTextWrong : styles.optionArabicText, correct ? styles.optionTextCorrect : wrong ? styles.optionTextWrong : styles.optionText)}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        {canCheck ? <BrandButton title={t("common.check")} onPress={() => answerExercise(selectedMap)} style={styles.bottomButton} /> : null}
      </>
    );
  }

  // ---- GRAMMAR_PARSE ----

  function renderGrammarParse() {
    const tokens = exParseTokens(currentExercise ?? {}, language, t);
    const labels = exLabels(currentExercise ?? {}, t).length > 0
      ? exLabels(currentExercise ?? {}, t)
      : Array.from(new Set(tokens.map((t) => t.label)));
    const selectedMap = !Array.isArray(selectedAnswer) && selectedAnswer && typeof selectedAnswer === "object" ? selectedAnswer : {};
    const canCheck = tokens.length > 0 && tokens.every((t) => selectedMap[t.word]) && !isAnswered;

    return (
      <>
        <ScrollView style={styles.exerciseScroller} contentContainerStyle={styles.exerciseScrollerContent}>
          <View style={styles.parseSentence}>
            {tokens.map((token) => (
              <View key={token.word} style={styles.parseToken}>
                <ArabicText size="sm" style={styles.parseWord}>{token.word}</ArabicText>
                <Text style={styles.parseGloss}>{selectedMap[token.word] ?? token.gloss ?? t("player.chooseRole")}</Text>
              </View>
            ))}
          </View>
          {tokens.map((token) => (
            <View key={`${token.word}-labels`} style={styles.parseRow}>
              <View style={styles.parseRowWord}>
                <ArabicText size="sm" style={styles.matchingArabic}>{token.word}</ArabicText>
                {token.gloss ? <Text style={styles.parseGloss}>{token.gloss}</Text> : null}
              </View>
              <View style={styles.labelWrap}>
                {labels.map((label) => {
                  const selected = selectedMap[token.word] === label;
                  const correct = isAnswered && normalizeAnswer(label) === normalizeAnswer(token.label);
                  const wrong = isAnswered && selected && !correct;
                  return (
                    <Pressable
                      key={`${token.word}-${label}`}
                      accessibilityRole="button"
                      disabled={isAnswered}
                      onPress={() => updateMappedAnswer(token.word, label)}
                      style={[styles.labelChip, selected ? styles.matchingChoiceSelected : null, correct ? styles.optionCorrect : wrong ? styles.optionWrong : null]}
                    >
                      {renderMaybeArabic(label, correct ? styles.optionArabicTextCorrect : wrong ? styles.optionArabicTextWrong : styles.optionArabicText, correct ? styles.optionTextCorrect : wrong ? styles.optionTextWrong : styles.optionText)}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        {canCheck ? <BrandButton title={t("common.check")} onPress={() => answerExercise(selectedMap)} style={styles.bottomButton} /> : null}
      </>
    );
  }

  // ---- CONVERSATION_BUILDER ----

  function renderConversationBuilder() {
    const lines = (currentExercise?.conversation as Array<{ speaker: string; line: string }> | undefined) ?? [];
    return (
      <>
        <View style={styles.dialogueCard}>
          {lines.map((line, index) => (
            <View key={`${line.speaker}-${index}`} style={styles.dialogueLine}>
              <Text style={styles.dialogueSpeaker}>{line.speaker}</Text>
              {containsArabic(line.line) ? (
                <ArabicText size="sm" style={styles.dialogueArabic}>{line.line}</ArabicText>
              ) : (
                <Text style={styles.dialogueText}>{line.line}</Text>
              )}
            </View>
          ))}
        </View>
        {renderOptionGrid()}
      </>
    );
  }

  // ---- Beat 1: HOOK ----

  function renderHook() {
    const hook = c.hook as Record<string, any> | undefined;
    const ayah = hook?.ayah as Record<string, any> | undefined;
    const noorIntro = localizedText(hook?.noor_intro, language);

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {ayah?.ar ? <ArabicText size="lg" style={styles.hookAyah}>{ayah.ar as string}</ArabicText> : null}
          {ayah?.label ? <Text style={styles.ayahRef}>{ayah.label as string}</Text> : null}
          <View style={styles.divider} />
          {noorIntro ? <Text style={styles.hookQuestion}>{noorIntro}</Text> : null}
        </View>
        <BrandButton title={t("player.hookCta")} onPress={() => goToBeat(2)} style={styles.bottomButton} />
      </View>
    );
  }

  // ---- Beat 2: DISCOVER ----

  function renderDiscover() {
    const card = discoverCards[currentCardIndex];
    const isLastCard = currentCardIndex >= discoverCards.length - 1;

    // Extract display fields from raw discover card
    const cardType = card?.type as string | undefined;
    let arabicText: string | undefined;
    let translation: string | undefined;
    let transliteration: string | undefined;
    let explanation: string | undefined;

    let discoverImageUrl: string | undefined;

    if (card) {
      const text    = card.text    as Record<string, any> | undefined;
      const concept = card.concept as Record<string, any> | undefined;
      const expl    = card.explanation as Record<string, any> | undefined;
      const titleObj = card.title  as Record<string, any> | undefined;
      const bodyObj  = card.body   as Record<string, any> | undefined;
      const examples = card.examples as Array<Record<string, any>> | undefined;

      discoverImageUrl = card.image_url as string | undefined;

      if (cardType === "GRAMMAR_NOTE") {
        arabicText    = titleObj?.ar as string | undefined;
        translation   = localizedText(titleObj, language);
        explanation   = localizedText(bodyObj, language);
      } else if (cardType === "SENTENCE") {
        arabicText    = text?.ar     as string | undefined;
        translation   = localizedText(text, language);
        transliteration = text?.translit as string | undefined;
      } else {
        arabicText    = (text?.ar ?? concept?.ar) as string | undefined;
        translation   = localizedText(text ?? concept, language);
        transliteration = text?.translit as string | undefined;
        const exampleLine = !text && examples?.[0]
          ? `${examples[0].ar as string} — ${localizedText(examples[0], language) ?? ""}`
          : undefined;
        explanation   = localizedText(expl, language) ?? exampleLine;
      }
    }

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (currentCardIndex === 0) goToBeat(1);
              else setCurrentCardIndex((i) => i - 1);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <Text style={styles.discoverProgress}>{t("player.discoverOf", { current: currentCardIndex + 1, total: discoverCards.length })}</Text>
          <View style={styles.backButtonSpacer} />
        </View>

        <View style={styles.discoverCard}>
          {discoverImageUrl ? (
            <Image
              source={{ uri: discoverImageUrl }}
              style={styles.discoverImage}
              contentFit="contain"
              cachePolicy="disk"
              transition={150}
            />
          ) : null}
          {arabicText ? (
            <>
              <ArabicText size="lg" style={styles.discoverArabic}>{arabicText}</ArabicText>
              <View style={styles.discoverPlayRow}>
                <PlayButton
                  text={arabicText}
                  cacheKey={transliteration ?? arabicText}
                  category="lessons"
                  audioUrl={card?.audio_url as string | undefined}
                  size={22}
                  autoPlay={true}
                />
              </View>
            </>
          ) : null}
          {translation   ? <Text style={styles.discoverTranslation}>{translation}</Text> : null}
          {transliteration ? <Text style={styles.discoverTransliteration}>{transliteration}</Text> : null}
          {explanation   ? <Text style={styles.discoverTranslation}>{explanation}</Text> : null}
        </View>

        <BrandButton
          title={isLastCard ? t("player.startPractising") : t("common.next")}
          onPress={() => {
            if (isLastCard) goToBeat(3);
            else setCurrentCardIndex((i) => i + 1);
          }}
          style={styles.bottomButton}
        />
      </View>
    );
  }

  // ---- Beat 3: PRACTICE ----

  function renderCurrentExercise() {
    const type = exType(currentExercise ?? {});

    if (type === "SHADOW_REPEAT") {
      const phrase = currentExercise?.phrase as Record<string, any> | undefined;
      return (
        <ShadowRepeatExercise
          arabic={phrase?.ar as string ?? ""}
          transliteration={phrase?.translit as string | undefined}
          translation={localizedText(phrase, language)}
          onComplete={(recorded) => {
            if (recorded) phrasesCompletedRef.current += 1;
            goToNextExercise();
          }}
        />
      );
    }
    if (type === "AUDIO_RECOGNITION")    return renderAudioRecognition();
    if (type === "WRITE_ARABIC")         return renderWriteArabic();
    if (type === "HARAKAH_PLACEMENT")    return renderHarakahPlacement();
    if (type === "WORD_ORDER")           return renderBuildSentence();   // same tile-tap UX
    if (type === "BUILD_SENTENCE")       return renderBuildSentence();
    if (type === "MATCHING")             return renderMatching();
    if (type === "GRAMMAR_PARSE")        return renderGrammarParse();
    if (type === "CONVERSATION_BUILDER") return renderConversationBuilder();
    // TRANSLATE_TO_ARABIC, IDENTIFY_ROOT, MATCH_AYAH → auto-submit option grid
    return renderOptionGrid();
  }

  function renderPractice() {
    const prompt    = exPrompt(currentExercise ?? {}, language, t);
    const arabicTxt = exArabicText(currentExercise ?? {});

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        {renderProgressBar()}
        <Text style={styles.exercisePrompt}>{prompt}</Text>
        {arabicTxt ? (
          <View style={styles.exerciseArabicCard}>
            <ArabicText size="lg" style={styles.exerciseArabic}>{arabicTxt}</ArabicText>
            <View style={styles.exercisePlayRow}>
              <PlayButton key={currentExerciseIndex} text={arabicTxt} cacheKey={`${lessonId}-ex${currentExerciseIndex}`} category="lessons" size={20} autoPlay={true} />
            </View>
          </View>
        ) : null}
        {renderCurrentExercise()}
        {renderFeedback()}
      </View>
    );
  }

  // ---- Beat 4: REVEAL ----

  function renderRevealAyah() {
    const reveal     = c.reveal as Record<string, any> | undefined;
    const ayah       = reveal?.ayah as Record<string, any> | undefined;
    const ayahAr     = ayah?.ar as string | undefined;
    const indices    = (reveal?.highlighted_word_indices as number[] | undefined) ?? [];
    const indexSet   = new Set(indices);
    const words      = splitWords(ayahAr);

    return (
      <ArabicText size="lg" style={styles.revealAyah}>
        {words.map((word, index) => (
          <Text key={`${word}-${index}`} style={indexSet.has(index) ? styles.highlightedWord : styles.revealAyahWord}>
            {index === 0 ? word : ` ${word}`}
          </Text>
        ))}
      </ArabicText>
    );
  }

  function renderReveal() {
    const reveal    = c.reveal as Record<string, any> | undefined;
    const ayah      = reveal?.ayah as Record<string, any> | undefined;
    const noorExpl  = localizedText(reveal?.noor_explanation, language);

    return (
      <View style={[styles.fullScreen, screenPadding, styles.revealScreen]}>
        <View style={styles.revealContent}>
          <Text style={styles.revealHeading}>{t("player.revealHeading")}</Text>
          {noorExpl ? <Text style={styles.revealText}>{noorExpl}</Text> : null}
          <View style={styles.divider} />
          {renderRevealAyah()}
          {ayah?.label ? <Text style={styles.ayahRef}>{ayah.label as string}</Text> : null}
        </View>
        <BrandButton title={t("common.continue")} onPress={() => goToBeat(5)} style={styles.bottomButton} />
      </View>
    );
  }

  // ---- Beat 5: CLOSE ----

  function renderClose() {
    const chapterBonus = completionResult?.chapterBonusXp ?? 0;
    const earnedPoints = (completionResult?.xpEarned || lesson?.xpReward || 10) + chapterBonus;
    const streak = completionResult?.currentStreak ?? 1;
    const shouldShowStreakCelebration = Boolean(completionResult?.streakCelebration);
    const isSpoken = lesson?.template === "SPOKEN_PHRASES";
    const phrasesLearned = phrasesCompletedRef.current;
    const spokenPhraseCount = phrasesLearned > 0 ? phrasesLearned : 1;

    const closeBlock = c.close as Record<string, any> | undefined;
    const noorTip = isSpoken
      ? t("player.closeSpokenTip", {
          count: spokenPhraseCount,
          suffix: spokenPhraseCount !== 1 ? "s" : "",
        })
      : localizedText(closeBlock?.noor_message, language) ?? t("player.closeDefaultTip");

    const floatingLetters = [
      { char: "أ",  top:  70, left:  30, size: 34, opacity: 0.55, color: WarshPalette.gold },
      { char: "ب",  top:  90, right: 45, size: 26, opacity: 0.40, color: WarshPalette.sage },
      { char: "ق",  top: 140, left:  65, size: 30, opacity: 0.50, color: WarshPalette.parchment },
      { char: "ر",  top: 110, right: 80, size: 22, opacity: 0.45, color: WarshPalette.gold },
      { char: "م",  top: 200, left:  20, size: 28, opacity: 0.35, color: WarshPalette.sage },
      { char: "ل",  top: 170, right: 30, size: 38, opacity: 0.50, color: WarshPalette.parchment },
      { char: "ن",  top: 260, left:  55, size: 24, opacity: 0.40, color: WarshPalette.gold },
      { char: "ه",  top: 230, right: 55, size: 32, opacity: 0.45, color: WarshPalette.sage },
      { char: "و",  top: 310, left:  35, size: 28, opacity: 0.35, color: WarshPalette.parchment },
      { char: "ي",  top: 340, right: 25, size: 36, opacity: 0.50, color: WarshPalette.gold },
      { char: "ع",  top: 400, left:  22, size: 24, opacity: 0.40, color: WarshPalette.sage },
      { char: "ك",  top: 420, right: 60, size: 30, opacity: 0.45, color: WarshPalette.parchment },
      { char: "ص",  top: 460, left:  70, size: 22, opacity: 0.35, color: WarshPalette.gold },
      { char: "ف",  top: 500, right: 35, size: 28, opacity: 0.40, color: WarshPalette.sage },
      { char: "ج",  top: 540, left:  40, size: 32, opacity: 0.45, color: WarshPalette.parchment },
    ];

    return (
      <View style={[styles.fullScreen, screenPadding, styles.closeScreen]}>
        {floatingLetters.map((l, i) => (
          <Text
            key={i}
            style={{
              position: "absolute",
              top: l.top,
              left: "left" in l ? (l as any).left : undefined,
              right: "right" in l ? (l as any).right : undefined,
              fontSize: l.size,
              opacity: l.opacity,
              color: l.color,
              fontFamily: "Scheherazade New",
            }}
          >
            {l.char}
          </Text>
        ))}

        <View style={styles.closeCenter}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.completeCard}>
            <Text style={styles.completeCardTitle}>{t("player.lessonComplete")}</Text>
            <Text style={styles.xpBadge}>{t("player.pointsEarned", { count: earnedPoints })}</Text>
          </View>
          <View style={styles.noorAvatar}>
            <View style={styles.noorAvatarEyes}>
              <View style={styles.noorEye} />
              <View style={styles.noorEye} />
            </View>
            <View style={styles.noorAvatarDot} />
          </View>
          <ArabicText size="md" style={styles.closeArabic}>بارك الله فيك</ArabicText>
          {completionResult?.chapterJustCompleted ? (
            <Text style={styles.chapterUnlockedBadge}>
              {t("player.nextChapterUnlocked")}
            </Text>
          ) : null}
          {isSpoken && phrasesLearned > 0 ? (
            <Text style={styles.spPhrasesEarned}>
              {t("player.phrasesToSay", { count: phrasesLearned, suffix: phrasesLearned !== 1 ? "s" : "" })}
            </Text>
          ) : null}
        </View>

        <View style={styles.noorBubble}>
          <Text style={styles.noorLabel}>Ustaad Noor</Text>
          <Text style={styles.noorTip}>{noorTip}</Text>
        </View>

        <BrandButton
          title={t("common.continue")}
          onPress={() => {
            const achievements = completionResult?.newAchievements ?? [];
            if (achievements.length > 0) {
              const nextRoute = shouldShowStreakCelebration ? "streak-celebration" : "tabs";
              router.push({ pathname: "/(app)/milestone-celebration", params: { achievements: JSON.stringify(achievements), nextRoute, streak: String(streak) } });
            } else if (shouldShowStreakCelebration) {
              router.push({ pathname: "/(app)/streak-celebration", params: { streak: String(streak) } });
            } else {
              router.replace("/(app)/(tabs)");
            }
          }}
          loading={submitting}
          style={styles.bottomButton}
        />
      </View>
    );
  }

  // ---- SPOKEN_PHRASES template (SP1-SP4) ----

  function renderSP1Context() {
    const sp    = c.spoken_phrases as Record<string, any> | undefined;
    const scene = sp?.scene as Record<string, any> | undefined;
    const titleAr = scene?.ar as string | undefined;
    const titleText = localizedText(scene, language);
    const contextBody = localizedText(sp?.context_body, language);

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {titleAr ? <ArabicText size="lg" style={styles.hookAyah}>{titleAr}</ArabicText> : null}
          {titleText ? <Text style={styles.spContextTitleEn}>{titleText}</Text> : null}
          <View style={styles.divider} />
          {contextBody ? <Text style={styles.hookQuestion}>{contextBody}</Text> : null}
        </View>
        <BrandButton title={t("common.begin")} onPress={() => goToBeat(2)} style={styles.bottomButton} />
      </View>
    );
  }

  function getSpPhrases(): Array<Record<string, any>> {
    const sp = c.spoken_phrases as Record<string, any> | undefined;
    return (sp?.phrases ?? []) as Array<Record<string, any>>;
  }

  function advanceSpPhrase() {
    const total = getSpPhrases().length;
    if (spPhraseIdx >= total - 1) {
      setSpPhraseIdx(0);
      setSpPhraseStep("intro");
      setSpRecognitionAnswer(null);
      setSpRecognitionAnswered(false);
      goToBeat(3);
    } else {
      setSpPhraseIdx((i) => i + 1);
      setSpPhraseStep("intro");
      setSpRecognitionAnswer(null);
      setSpRecognitionAnswered(false);
    }
  }

  function renderSP2Phrases() {
    const phrases = getSpPhrases();
    const phraseRow = phrases[spPhraseIdx];
    const total = phrases.length;
    const phrase = phraseRow?.phrase as Record<string, any> | undefined;
    const arabicPhrase = phrase?.ar as string ?? "";
    const translit     = phrase?.translit as string | undefined;
    const translation  = localizedText(phrase, language) ?? "";

    // Build recognition options: correct translation + up to 3 others from sibling phrases
    const recognitionOptions: string[] = phrases.length >= 2
      ? [translation, ...phrases.filter((_, i) => i !== spPhraseIdx).map((p) => localizedText(p.phrase, language) ?? "").filter(Boolean)].slice(0, 4)
      : [];
    const hasRecognition = recognitionOptions.length >= 2;

    if (!phraseRow) {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}><Text style={styles.hookQuestion}>{t("player.practiceNoPhrases")}</Text></View>
          <BrandButton title={t("common.continue")} onPress={() => goToBeat(3)} style={styles.bottomButton} />
        </View>
      );
    }

    if (spPhraseStep === "intro") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{t("player.discoverOf", { current: spPhraseIdx + 1, total })}</Text>
          <View style={styles.spPhraseCard}>
            <ArabicText size="xl" style={styles.spPhraseArabic}>{arabicPhrase}</ArabicText>
            {translit ? <Text style={styles.discoverTransliteration}>{translit}</Text> : null}
            <Text style={styles.discoverTranslation}>{translation}</Text>
            <View style={styles.discoverPlayRow}>
              <PlayButton text={arabicPhrase} cacheKey={`sp-${spPhraseIdx}`} category="phrases" size={22} />
            </View>
          </View>
          <BrandButton title={t("player.nowIllTry")} onPress={() => setSpPhraseStep("shadow")} style={styles.bottomButton} />
        </View>
      );
    }

    if (spPhraseStep === "shadow") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{t("player.discoverOf", { current: spPhraseIdx + 1, total })} · {t("player.speaking")}</Text>
          <ShadowRepeatExercise
            arabic={arabicPhrase}
            transliteration={translit}
            translation={translation}
            onComplete={(recorded) => {
              if (recorded) phrasesCompletedRef.current += 1;
              if (hasRecognition) setSpPhraseStep("recognition");
              else setSpPhraseStep("phraseComplete");
            }}
          />
        </View>
      );
    }

    if (spPhraseStep === "recognition") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{t("player.discoverOf", { current: spPhraseIdx + 1, total })} · {t("player.meaningCheck")}</Text>
          <View style={styles.centerStack}>
            <ArabicText size="lg" style={styles.spPhraseArabic}>{arabicPhrase}</ArabicText>
            <Text style={[styles.hookQuestion, { marginTop: 16 }]}>{t("player.whatDoesThisMean")}</Text>
          </View>
          <View style={styles.optionGrid}>
            {recognitionOptions.map((opt) => {
              const isCorrect = spRecognitionAnswered && opt === translation;
              const isWrong   = spRecognitionAnswered && opt === spRecognitionAnswer && opt !== translation;
              return (
                <Pressable
                  key={opt}
                  accessibilityRole="button"
                  disabled={spRecognitionAnswered}
                  onPress={() => {
                    if (spRecognitionAnswered) return;
                    setSpRecognitionAnswer(opt);
                    setSpRecognitionAnswered(true);
                    setTimeout(() => setSpPhraseStep("phraseComplete"), ANSWER_DELAY_MS);
                  }}
                  style={[styles.optionButton, isCorrect ? styles.optionCorrect : isWrong ? styles.optionWrong : null]}
                >
                  <Text style={isCorrect ? styles.optionTextCorrect : isWrong ? styles.optionTextWrong : styles.optionText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (spPhraseStep === "phraseComplete") {
      const completed = spPhraseIdx + 1;
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}>
            <Text style={styles.spPhraseCompleteCount}>{t("player.phrasesLearnedCount", { current: completed, total })}</Text>
            <ArabicText size="lg" style={styles.closeArabic}>{arabicPhrase}</ArabicText>
            <Text style={[styles.hookQuestion, { marginTop: 8 }]}>{translation}</Text>
          </View>
          <BrandButton title={completed < total ? t("player.nextPhrase") : t("common.continue")} onPress={advanceSpPhrase} style={styles.bottomButton} />
        </View>
      );
    }

    return null;
  }

  function renderSP3Dialogue() {
    const sp       = c.spoken_phrases as Record<string, any> | undefined;
    const phrases  = getSpPhrases();
    const phraseMap = new Map(phrases.map((row) => [row.id as string, row.phrase as Record<string, any> | undefined]));
    const dialogue = (sp?.dialogue as Array<Record<string, any>> | undefined) ?? [];
    const lines = dialogue.map((line) => {
      const phrase = phraseMap.get(line.phrase_id as string);
      return { speaker: line.speaker as string ?? "", ar: phrase?.ar as string ?? "", en: localizedText(phrase, language) };
    });

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <Text style={styles.spContextTitleEn}>{t("player.miniDialogue")}</Text>
        <ScrollView style={styles.exerciseScroller} contentContainerStyle={styles.exerciseScrollerContent}>
          <View style={styles.dialogueCard}>
            {lines.map((line, i) => (
              <View key={i} style={styles.dialogueLine}>
                <Text style={styles.dialogueSpeaker}>{line.speaker}</Text>
                <ArabicText size="sm" style={styles.dialogueArabic}>{line.ar}</ArabicText>
                {line.en ? <Text style={styles.discoverTranslation}>{line.en}</Text> : null}
              </View>
            ))}
            {lines.length === 0 ? <Text style={styles.hookQuestion}>{t("player.dialogueSoon")}</Text> : null}
          </View>
        </ScrollView>
        <BrandButton title={t("common.continue")} onPress={() => goToBeat(5)} style={styles.bottomButton} />
      </View>
    );
  }

  // ---- VERB_PATTERN template (Beat 2) ----

  function renderVerbPattern() {
    const table = c.conjugation_table as Record<string, any> | undefined;
    const rows  = table?.rows as Array<Record<string, any>> | undefined;

    if (!table || !rows || rows.length === 0) {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}>
            <View style={styles.verbPatternFallbackCard}>
              <Text style={styles.hookQuestion}>{t("player.verbPatternSoon")}</Text>
            </View>
          </View>
          <BrandButton title={t("common.continue")} onPress={() => goToBeat(3)} style={styles.bottomButton} />
        </View>
      );
    }

    const patternNode = table.pattern_name as Record<string, any> | undefined;
    const patternName = localizedText(patternNode, language);
    const patternNameAr = patternNode?.ar as string | undefined;
    const patternDisplay = patternName ?? undefined;

    return (
      <ScrollView style={styles.verbPatternScreen} contentContainerStyle={[styles.verbPatternContent, screenPadding]} showsVerticalScrollIndicator={false}>
        {table.root ? (
          <View style={styles.verbRootPill}>
            <Text style={styles.verbRootPillText}>{table.root as string}</Text>
          </View>
        ) : null}

        {/* Base form — هُوَ conjugation shown as the reference form */}
        {rows[0] ? (
          <Text style={styles.verbBaseForm}>{(rows[0].conjugated as Record<string, any>)?.ar as string}</Text>
        ) : null}

        {(patternDisplay || patternNameAr) ? (
          <View style={styles.verbPatternNameRow}>
            {patternDisplay ? <Text style={styles.verbBaseMeaning}>{patternDisplay}</Text> : null}
            {patternDisplay && patternNameAr ? <Text style={styles.verbBaseMeaningSep}> - </Text> : null}
            {patternNameAr ? <ArabicText size="sm" style={styles.verbPatternNameAr}>{patternNameAr}</ArabicText> : null}
          </View>
        ) : null}

        <View style={styles.verbTableCard}>
          {rows.map((row, index) => {
            const pronoun    = row.pronoun    as Record<string, any> | undefined;
            const conjugated = row.conjugated as Record<string, any> | undefined;
            return (
              <View key={`row-${index}`} style={[styles.verbTableRow, index < rows.length - 1 ? styles.verbTableRowBorder : null]}>
                <View style={styles.verbTableLeft}>
                  <Text style={styles.verbPronounAr}>{pronoun?.ar as string}</Text>
                  <Text style={styles.verbPronounEn}> ({localizedText(pronoun, language)})</Text>
                </View>
                <Text style={styles.verbConjugatedForm}>{conjugated?.ar as string}</Text>
              </View>
            );
          })}
        </View>

        <BrandButton title={t("common.continue")} onPress={() => goToBeat(3)} style={StyleSheet.flatten([styles.bottomButton, styles.verbPatternContinueButton])} />
      </ScrollView>
    );
  }

  // ---- Main render ----

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={WarshPalette.gold} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>{error ?? t("player.lessonNotFound")}</Text>
      </View>
    );
  }

  if (lesson.template === "SPOKEN_PHRASES") {
    if (currentBeat === 5) return renderClose();
    if (currentBeat === 2) return renderSP2Phrases();
    if (currentBeat === 3) return renderSP3Dialogue();
    return renderSP1Context();
  }

  if (currentBeat === 1) return renderHook();
  if (currentBeat === 2) {
    if (lesson.template === "VERB_PATTERN") return renderVerbPattern();
    return renderDiscover();
  }
  if (currentBeat === 3) return renderPractice();
  if (currentBeat === 4) return renderReveal();
  return renderClose();
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: WarshPalette.creamBg,
  },
  fullScreen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: WarshPalette.creamBg,
  },
  centerStack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hookAyah: {
    color: WarshPalette.ink,
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
  },
  ayahRef: {
    marginTop: 8,
    color: WarshPalette.gold,
    fontFamily: Fonts.italic,
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  divider: {
    alignSelf: "stretch",
    height: StyleSheet.hairlineWidth,
    marginTop: 40,
    marginBottom: 40,
    backgroundColor: WarshPalette.defaultCardBorder,
  },
  hookQuestion: {
    maxWidth: 280,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  bottomButton: {
    alignSelf: "stretch",
    backgroundColor: WarshPalette.ink,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButtonSpacer: {
    width: 44,
    height: 44,
  },
  backChevron: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: 34,
    lineHeight: 38,
  },
  discoverProgress: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 10,
    textAlign: "center",
  },
  discoverCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 12,
    padding: 16,
    backgroundColor: WarshPalette.parchmentBg,
  },
  discoverImage: {
    width: 96,
    height: 96,
    alignSelf: "center",
    marginBottom: 8,
  },
  discoverArabic: {
    color: WarshPalette.ink,
    fontSize: 36,
    lineHeight: 52,
    textAlign: "center",
  },
  discoverTranslation: {
    marginTop: 8,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  discoverTransliteration: {
    marginTop: 4,
    color: WarshPalette.gold,
    fontFamily: Fonts.italic,
    fontSize: 10,
    fontStyle: "italic",
    lineHeight: 14,
    textAlign: "center",
  },
  discoverPlayRow: {
    alignItems: "center",
    marginTop: 4,
  },
  exercisePlayRow: {
    alignItems: "center",
    marginTop: 4,
  },
  progressTrack: {
    flexDirection: "row",
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
  },
  progressSegment: {
    flex: 1,
    height: 4,
  },
  progressSegmentFilled: {
    backgroundColor: WarshPalette.sage,
  },
  progressSegmentEmpty: {
    backgroundColor: WarshPalette.defaultCardBorder,
  },
  exercisePrompt: {
    marginTop: 32,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  exerciseArabicCard: {
    marginTop: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 12,
    padding: 16,
    backgroundColor: WarshPalette.parchmentBg,
  },
  exerciseArabic: {
    color: WarshPalette.ink,
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
  },
  // WRITE_ARABIC / HARAKAH_PLACEMENT
  writeArabicContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 12,
  },
  writeArabicInput: {
    borderWidth: 1.5,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontFamily: "Scheherazade New",
    color: WarshPalette.ink,
    backgroundColor: WarshPalette.white,
    minHeight: 64,
  },
  harakahInput: {
    fontSize: 28,
  },
  harakahHintText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  hintButton: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
  },
  hintButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: WarshPalette.gold,
  },
  hintRevealText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  hintRevealLetter: {
    fontFamily: "Scheherazade New",
    fontSize: 20,
    color: WarshPalette.gold,
  },

  audioRecognitionCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  audioRecognitionPlayWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.cream,
    borderRadius: 80,
    padding: 28,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  audioRecognitionHint: {
    marginTop: 8,
    fontSize: 12,
    color: WarshPalette.ink,
    opacity: 0.5,
    fontFamily: Fonts.regular,
  },
  optionGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "space-between",
    paddingTop: 32,
    paddingBottom: 120,
  },
  optionButton: {
    width: "48%",
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: WarshPalette.white,
  },
  optionCorrect: {
    borderColor: WarshPalette.sage,
    backgroundColor: WarshPalette.correctBg,
  },
  optionWrong: {
    borderColor: WarshPalette.wrongBorder,
    backgroundColor: WarshPalette.wrongBg,
  },
  optionText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  optionTextCorrect: {
    color: WarshPalette.sage,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  optionTextWrong: {
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  optionArabicText: {
    color: WarshPalette.ink,
    textAlign: "center",
  },
  optionArabicTextCorrect: {
    color: WarshPalette.sage,
    textAlign: "center",
  },
  optionArabicTextWrong: {
    color: WarshPalette.wrongText,
    textAlign: "center",
  },
  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 12,
    padding: 12,
  },
  answerRowCorrect: {
    borderColor: WarshPalette.sage,
    backgroundColor: WarshPalette.correctBg,
  },
  answerRowWrong: {
    borderColor: WarshPalette.wrongBorder,
    backgroundColor: WarshPalette.wrongBg,
  },
  answerRowRtl: {
    flexDirection: "row-reverse",
  },
  answerSlot: {
    minWidth: 58,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: WarshPalette.creamBg,
  },
  answerSlotFilled: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  emptySlotText: {
    color: WarshPalette.subtleBrown,
  },
  tileWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-end",
    justifyContent: "center",
    paddingBottom: 16,
  },
  wordTile: {
    margin: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: WarshPalette.parchmentBg,
  },
  tileText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  tileArabicText: {
    color: WarshPalette.ink,
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
  },
  exerciseScroller: {
    flex: 1,
    marginTop: 20,
  },
  exerciseScrollerContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  matchingRow: {
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: 10,
    padding: 10,
    backgroundColor: WarshPalette.white,
  },
  matchingLeft: {
    marginBottom: 8,
  },
  matchingChoices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  matchingChoice: {
    minHeight: 38,
    minWidth: "47%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: 8,
    padding: 8,
    backgroundColor: WarshPalette.creamBg,
  },
  matchingChoiceSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBg,
  },
  matchingArabic: {
    color: WarshPalette.ink,
    fontSize: 22,
    lineHeight: 32,
    textAlign: "center",
  },
  matchingText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  parseSentence: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.highlightBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  parseToken: {
    alignItems: "center",
    margin: 6,
  },
  parseWord: {
    color: WarshPalette.ink,
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
  },
  parseGloss: {
    marginTop: 2,
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
  },
  parseRow: {
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: 10,
    padding: 10,
    backgroundColor: WarshPalette.white,
  },
  parseRowWord: {
    alignItems: "center",
    marginBottom: 8,
  },
  labelWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  labelChip: {
    minHeight: 36,
    minWidth: "30%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: WarshPalette.creamBg,
  },
  dialogueCard: {
    marginTop: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: WarshPalette.white,
  },
  dialogueLine: {
    marginBottom: 10,
  },
  dialogueSpeaker: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  dialogueArabic: {
    color: WarshPalette.ink,
    fontSize: 22,
    lineHeight: 32,
    textAlign: "left",
  },
  dialogueText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  feedbackBar: {
    position: "absolute",
    right: 24,
    bottom: 104,
    left: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
  },
  feedbackCorrect: {
    borderColor: WarshPalette.correctBorder,
    backgroundColor: WarshPalette.correctBg,
  },
  feedbackWrong: {
    borderColor: WarshPalette.wrongBorder,
    backgroundColor: WarshPalette.wrongBg,
  },
  feedbackArabic: {
    color: WarshPalette.sage,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "left",
  },
  feedbackExplanation: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  feedbackWrongTitle: {
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  feedbackWrongExplanation: {
    marginTop: 4,
  },
  feedbackCorrectAnswerArabic: {
    marginTop: 4,
    color: WarshPalette.wrongText,
    fontSize: 20,
    lineHeight: 30,
    textAlign: "left",
  },
  feedbackCorrectAnswerText: {
    marginTop: 4,
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  revealScreen: {
    backgroundColor: WarshPalette.highlightBg,
  },
  revealContent: {
    flex: 1,
    justifyContent: "center",
  },
  revealHeading: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  revealText: {
    marginTop: 12,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  revealAyah: {
    color: WarshPalette.ink,
    fontSize: 26,
    lineHeight: 40,
    textAlign: "center",
  },
  revealAyahWord: {
    color: WarshPalette.ink,
  },
  highlightedWord: {
    color: WarshPalette.gold,
  },
  closeScreen: {
    backgroundColor: WarshPalette.closeBg,
  },
  closeCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    zIndex: 1,
  },
  completeCard: {
    backgroundColor: WarshPalette.white,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: WarshPalette.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  completeCardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
  },
  xpBadge: {
    marginTop: 6,
    color: WarshPalette.sage,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  noorAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: WarshPalette.parchment,
    borderWidth: 3,
    borderColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noorAvatarEyes: {
    flexDirection: "row",
    gap: 14,
  },
  noorEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: WarshPalette.ink,
  },
  noorAvatarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WarshPalette.gold,
  },
  closeArabic: {
    color: WarshPalette.gold,
    fontSize: 22,
    lineHeight: 34,
    textAlign: "center",
  },
  xpText: {
    color: WarshPalette.sage,
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 32,
    textAlign: "center",
  },
  noorBubble: {
    alignSelf: "stretch",
    marginTop: 32,
    borderRadius: 12,
    padding: 16,
    backgroundColor: WarshPalette.ink,
  },
  noorLabel: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  noorTip: {
    marginTop: 8,
    color: WarshPalette.parchment,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  spContextTitleEn: {
    marginTop: 8,
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  spPhraseCounter: {
    marginBottom: 12,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 10,
    textAlign: "center",
  },
  spPhraseCard: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 12,
    padding: 20,
    backgroundColor: WarshPalette.parchmentBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  spPhraseArabic: {
    color: WarshPalette.ink,
    fontSize: 32,
    lineHeight: 46,
    textAlign: "center",
  },
  spPhraseCompleteCount: {
    color: WarshPalette.sage,
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 8,
  },
  spPhrasesEarned: {
    marginTop: 8,
    color: WarshPalette.sage,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  verbPatternScreen: {
    flex: 1,
    backgroundColor: WarshPalette.creamBg,
  },
  verbPatternContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  verbRootPill: {
    alignSelf: "center",
    backgroundColor: WarshPalette.gold,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 20,
    marginTop: 8,
  },
  verbRootPillText: {
    color: WarshPalette.white,
    fontFamily: "Scheherazade New",
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.5,
  },
  verbBaseForm: {
    fontFamily: "Scheherazade New",
    fontSize: 36,
    lineHeight: 52,
    color: WarshPalette.gold,
    textAlign: "center",
    writingDirection: "rtl",
  },
  verbBaseMeaning: {
    marginTop: 4,
    marginBottom: 8,
    fontFamily: Fonts.italic,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 20,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  verbTableCard: {
    alignSelf: "stretch",
    backgroundColor: WarshPalette.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    overflow: "hidden",
    marginVertical: 20,
  },
  verbTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  verbTableRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.parchmentBg,
  },
  verbTableLeft: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  verbPronounAr: {
    fontFamily: "Scheherazade New",
    fontSize: 18,
    lineHeight: 28,
    color: WarshPalette.ink,
  },
  verbPronounEn: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: WarshPalette.gold,
  },
  verbConjugatedForm: {
    fontFamily: "Scheherazade New",
    fontSize: 20,
    lineHeight: 30,
    color: WarshPalette.gold,
    textAlign: "right",
    writingDirection: "rtl",
  },
  verbPatternFallbackCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: 12,
    padding: 24,
    backgroundColor: WarshPalette.parchmentBg,
    alignItems: "center",
  },
  verbPatternNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 8,
  },
  verbBaseMeaningSep: {
    fontFamily: Fonts.italic,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 20,
    color: WarshPalette.bodyBrown,
  },
  verbPatternNameAr: {
    color: WarshPalette.bodyBrown,
  },
  chapterUnlockedBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: WarshPalette.sage,
    color: WarshPalette.creamBg,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  verbPatternContinueButton: {
    alignSelf: "stretch",
  },
});
