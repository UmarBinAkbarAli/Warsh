import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextStyle, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { PlayButton } from "@components/PlayButton";
import { ShadowRepeatExercise } from "@components/ShadowRepeatExercise";
import { Fonts, WarshPalette } from "../../../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelTodayReminders, fireMilestoneNotification } from "@services/notifications";
import { trackLessonStarted, trackLessonCompleted, trackMilestoneUnlocked } from "@services/analytics";

// ---------------------------------------------------------------------------
// API response shape — content is the raw warsh-content-schema v1.0 blob
// ---------------------------------------------------------------------------
type RawLesson = {
  id: string;
  title: string;
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

// ---------------------------------------------------------------------------
// Raw exercise helper functions — read warsh-content-schema v1.0 directly
// ---------------------------------------------------------------------------
type RawEx = Record<string, any>;

function exType(ex: RawEx): string { return ex.type as string; }

function exWrongExpl(ex: RawEx): string | undefined {
  return ((ex.explanation_on_wrong as any)?.en ?? (ex.explanation as any)?.en) as string | undefined;
}

function exPrompt(ex: RawEx): string | undefined {
  const t = exType(ex);
  if (t === "TAP_TRANSLATION") {
    const direction = ex.direction as string | undefined;
    const prompt = ex.prompt as any;
    if (direction === "en_to_ar") return `Which Arabic means: "${prompt?.en as string}"?`;
    return "What does this Arabic mean?";
  }
  if (t === "TRUE_FALSE") return (ex.statement as any)?.en as string | undefined;
  if (t === "FILL_BLANK") return (ex.hint as any)?.en as string | undefined;
  if (t === "BUILD_SENTENCE") return (ex.target_translation as any)?.en as string | undefined;
  if (t === "MATCHING") return "Match each Arabic word with its meaning.";
  if (t === "MATCH_AYAH") return "What does this ayah fragment mean?";
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
  return undefined;
}

function exOptions(ex: RawEx): string[] {
  const t = exType(ex);
  if (t === "TAP_TRANSLATION") {
    const opts = ex.options as Array<any> | undefined;
    return opts ? opts.map((o) => o.en as string) : [];
  }
  if (t === "TRUE_FALSE") return ["True", "False"];
  if (t === "FILL_BLANK") {
    const opts = ex.options as Array<any> | undefined;
    return opts ? opts.map((o) => o.ar as string) : [];
  }
  if (t === "BUILD_SENTENCE") {
    const tiles = ex.tiles as Array<any> | undefined;
    return tiles ? tiles.map((t2) => t2.ar as string) : [];
  }
  if (t === "MATCHING") {
    const right = ex.right_column as Array<any> | undefined;
    return right ? right.map((r) => r.en as string) : [];
  }
  if (t === "MATCH_AYAH") {
    const opts = ex.options as Array<any> | undefined;
    return opts ? opts.map((o) => o.en as string) : [];
  }
  return [];
}

function exCorrectAnswer(ex: RawEx): string {
  const t = exType(ex);
  if (t === "TAP_TRANSLATION") {
    const opts = ex.options as Array<any> | undefined;
    const idx = ex.correct_index as number | undefined;
    if (opts && idx !== undefined) return opts[idx].en as string;
    return "";
  }
  if (t === "TRUE_FALSE") {
    return (ex.correct_answer as boolean | undefined) ? "True" : "False";
  }
  if (t === "FILL_BLANK") return (ex.correct_answer as any)?.ar as string ?? "";
  if (t === "BUILD_SENTENCE") {
    const tiles = ex.tiles as Array<any> | undefined;
    const order = ex.correct_order as number[] | undefined;
    if (tiles && order) return order.map((i) => tiles[i].ar as string).join(" ");
    return "";
  }
  if (t === "MATCH_AYAH") {
    const opts = ex.options as Array<any> | undefined;
    const idx = ex.correct_index as number | undefined;
    if (opts && idx !== undefined) return opts[idx].en as string;
    return "";
  }
  return "";
}

function exPairs(ex: RawEx): MatchingPair[] {
  const left  = ex.left_column  as Array<any> | undefined;
  const right = ex.right_column as Array<any> | undefined;
  const pairs = ex.correct_pairs as Array<[number, number]> | undefined;
  if (left && right && pairs) {
    return pairs.map(([l, r]) => ({ left: left[l].ar as string, right: right[r].en as string }));
  }
  return [];
}

function exParseTokens(ex: RawEx): ParseToken[] {
  const words = ex.words as Array<any> | undefined;
  const roles = ex.correct_roles as string[] | undefined;
  if (!words || !roles) return [];
  return words.map((w, i) => ({ word: w.ar as string, label: roles[i], gloss: w.en as string }));
}

function exLabels(ex: RawEx): string[] {
  return (ex.available_roles as string[] | undefined) ?? [];
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

function getSelectedText(selectedAnswer: SelectedAnswer) {
  if (selectedAnswer && !Array.isArray(selectedAnswer) && typeof selectedAnswer === "object") {
    return Object.values(selectedAnswer).join(" ");
  }
  return Array.isArray(selectedAnswer) ? selectedAnswer.join(" ") : selectedAnswer;
}

function isAnswerCorrect(ex: RawEx | undefined, selectedAnswer: SelectedAnswer): boolean {
  if (!ex) return false;

  if (exType(ex) === "MATCHING") {
    if (!selectedAnswer || Array.isArray(selectedAnswer) || typeof selectedAnswer !== "object") return false;
    return exPairs(ex).every((pair) => normalizeAnswer(selectedAnswer[pair.left]) === normalizeAnswer(pair.right));
  }

  if (exType(ex) === "GRAMMAR_PARSE") {
    if (!selectedAnswer || Array.isArray(selectedAnswer) || typeof selectedAnswer !== "object") return false;
    return exParseTokens(ex).every((token) => normalizeAnswer(selectedAnswer[token.word]) === normalizeAnswer(token.label));
  }

  const correct = exCorrectAnswer(ex);
  const selText = getSelectedText(selectedAnswer) ?? "";
  if (containsArabic(selText) || containsArabic(correct)) return selText === correct;
  return normalizeAnswer(selText) === normalizeAnswer(correct);
}

function getCorrectAnswerDisplay(ex?: RawEx): string {
  if (!ex) return "";
  if (exType(ex) === "MATCHING") return exPairs(ex).map((p) => `${p.left} = ${p.right}`).join(" | ");
  if (exType(ex) === "GRAMMAR_PARSE") return exParseTokens(ex).map((t) => `${t.word} = ${t.label}`).join(" | ");
  return exCorrectAnswer(ex);
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
  const answeredCorrectly = isAnswered && isAnswerCorrect(currentExercise, selectedAnswer);
  const completedExerciseCount = Math.min(currentExerciseIndex + (isAnswered ? 1 : 0), exercises.length);
  const screenPadding = { paddingTop: insets.top + 16 };

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) { setError("Invalid lesson."); setLoading(false); return; }
      try {
        const response = await api.get(`/api/lessons/${lessonId}`);
        const raw = response.data.data.lesson as RawLesson;
        setLesson(raw);
        trackLessonStarted(lessonId, raw.template);
      } catch {
        setError("Unable to load lesson.");
      } finally {
        setLoading(false);
      }
    }
    void loadLesson();
  }, [lessonId]);

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
          setError("This lesson is locked until earlier chapters are complete.");
        } else {
          setError("Unable to complete lesson. Try again.");
        }
      } finally {
        setSubmitting(false);
      }
    }
    void finishLesson();
  }, [currentBeat, lessonId]);

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
      const expected = splitWords(exCorrectAnswer(currentExercise)).length;
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
    const correct = exCorrectAnswer(currentExercise);
    const isCorrect = containsArabic(option) || containsArabic(correct)
      ? option === correct
      : normalizeAnswer(option) === normalizeAnswer(correct);
    if (isCorrect) return [styles.optionButton, styles.optionCorrect];
    if (selectedText === option) return [styles.optionButton, styles.optionWrong];
    return styles.optionButton;
  }

  function getOptionTextStyle(option: string) {
    if (!isAnswered) return containsArabic(option) ? styles.optionArabicText : styles.optionText;
    const correct = exCorrectAnswer(currentExercise);
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
    const wrongExpl = exWrongExpl(currentExercise);
    const arabicForDisplay = exArabicText(currentExercise) ?? exCorrectAnswer(currentExercise);
    return (
      <View style={[styles.feedbackBar, answeredCorrectly ? styles.feedbackCorrect : styles.feedbackWrong]}>
        {answeredCorrectly ? (
          <>
            <ArabicText size="sm" style={styles.feedbackArabic}>بارك الله فيك</ArabicText>
            <Text style={styles.feedbackExplanation}>You recognised the pattern and chose the right answer.</Text>
          </>
        ) : (
          <>
            <Text style={styles.feedbackWrongTitle}>Almost - let's look at this again</Text>
            {wrongExpl ? <Text style={[styles.feedbackExplanation, styles.feedbackWrongExplanation]}>{wrongExpl}</Text> : null}
            {containsArabic(arabicForDisplay) ? (
              <ArabicText size="sm" style={styles.feedbackCorrectAnswerArabic}>{getCorrectAnswerDisplay(currentExercise)}</ArabicText>
            ) : (
              <Text style={styles.feedbackCorrectAnswerText}>{getCorrectAnswerDisplay(currentExercise)}</Text>
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
    const options = exOptions(currentExercise ?? {});
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

  // ---- BUILD_SENTENCE ----

  function renderBuildSentence() {
    const selectedTiles = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const slots = splitWords(exCorrectAnswer(currentExercise ?? {}));
    const canCheck = selectedTiles.length === slots.length && !isAnswered;
    const options = exOptions(currentExercise ?? {});

    return (
      <>
        <View style={[styles.answerRow, isAnswered ? (answeredCorrectly ? styles.answerRowCorrect : styles.answerRowWrong) : null, containsArabic(exCorrectAnswer(currentExercise ?? {})) ? styles.answerRowRtl : null]}>
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
        {canCheck ? <BrandButton title="Check" onPress={checkBuildSentence} style={styles.bottomButton} /> : null}
      </>
    );
  }

  // ---- MATCHING ----

  function renderMatching() {
    const pairs = exPairs(currentExercise ?? {});
    const choices = exOptions(currentExercise ?? {});
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
        {canCheck ? <BrandButton title="Check" onPress={() => answerExercise(selectedMap)} style={styles.bottomButton} /> : null}
      </>
    );
  }

  // ---- GRAMMAR_PARSE ----

  function renderGrammarParse() {
    const tokens = exParseTokens(currentExercise ?? {});
    const labels = exLabels(currentExercise ?? {}).length > 0
      ? exLabels(currentExercise ?? {})
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
                <Text style={styles.parseGloss}>{selectedMap[token.word] ?? token.gloss ?? "Choose role"}</Text>
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
        {canCheck ? <BrandButton title="Check" onPress={() => answerExercise(selectedMap)} style={styles.bottomButton} /> : null}
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
    const noorIntroEn = (hook?.noor_intro as Record<string, any> | undefined)?.en as string | undefined;

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {ayah?.ar ? <ArabicText size="lg" style={styles.hookAyah}>{ayah.ar as string}</ArabicText> : null}
          {ayah?.label ? <Text style={styles.ayahRef}>{ayah.label as string}</Text> : null}
          <View style={styles.divider} />
          {noorIntroEn ? <Text style={styles.hookQuestion}>{noorIntroEn}</Text> : null}
        </View>
        <BrandButton title="I want to understand this" onPress={() => goToBeat(2)} style={styles.bottomButton} />
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

    if (card) {
      const text    = card.text    as Record<string, any> | undefined;
      const concept = card.concept as Record<string, any> | undefined;
      const expl    = card.explanation as Record<string, any> | undefined;
      const titleObj = card.title  as Record<string, any> | undefined;
      const bodyObj  = card.body   as Record<string, any> | undefined;
      const examples = card.examples as Array<Record<string, any>> | undefined;

      if (cardType === "GRAMMAR_NOTE") {
        arabicText    = titleObj?.ar as string | undefined;
        translation   = titleObj?.en as string | undefined;
        explanation   = bodyObj?.en  as string | undefined;
      } else if (cardType === "SENTENCE") {
        arabicText    = text?.ar     as string | undefined;
        translation   = text?.en     as string | undefined;
        transliteration = text?.translit as string | undefined;
      } else {
        arabicText    = (text?.ar ?? concept?.ar) as string | undefined;
        translation   = (text?.en ?? concept?.en) as string | undefined;
        transliteration = text?.translit as string | undefined;
        const exampleLine = !text && examples?.[0]
          ? `${examples[0].ar as string} — ${examples[0].en as string}`
          : undefined;
        explanation   = (expl?.en ?? exampleLine) as string | undefined;
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
          <Text style={styles.discoverProgress}>{currentCardIndex + 1} of {discoverCards.length}</Text>
          <View style={styles.backButtonSpacer} />
        </View>

        <View style={styles.discoverCard}>
          {arabicText ? (
            <>
              <ArabicText size="lg" style={styles.discoverArabic}>{arabicText}</ArabicText>
              <View style={styles.discoverPlayRow}>
                <PlayButton text={arabicText} cacheKey={transliteration ?? arabicText} category="lessons" size={22} />
              </View>
            </>
          ) : null}
          {translation   ? <Text style={styles.discoverTranslation}>{translation}</Text> : null}
          {transliteration ? <Text style={styles.discoverTransliteration}>{transliteration}</Text> : null}
          {explanation   ? <Text style={styles.discoverTranslation}>{explanation}</Text> : null}
        </View>

        <BrandButton
          title={isLastCard ? "Start practising" : "Next"}
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
          translation={phrase?.en as string | undefined}
          onComplete={(recorded) => {
            if (recorded) phrasesCompletedRef.current += 1;
            goToNextExercise();
          }}
        />
      );
    }
    if (type === "BUILD_SENTENCE")     return renderBuildSentence();
    if (type === "MATCHING")           return renderMatching();
    if (type === "GRAMMAR_PARSE")      return renderGrammarParse();
    if (type === "CONVERSATION_BUILDER") return renderConversationBuilder();
    return renderOptionGrid();
  }

  function renderPractice() {
    const prompt    = exPrompt(currentExercise ?? {});
    const arabicTxt = exArabicText(currentExercise ?? {});

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        {renderProgressBar()}
        <Text style={styles.exercisePrompt}>{prompt}</Text>
        {arabicTxt ? (
          <View style={styles.exerciseArabicCard}>
            <ArabicText size="lg" style={styles.exerciseArabic}>{arabicTxt}</ArabicText>
            <View style={styles.exercisePlayRow}>
              <PlayButton text={arabicTxt} cacheKey={`${lessonId}-ex${currentExerciseIndex}`} category="lessons" size={20} />
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
    const noorExpl  = (reveal?.noor_explanation as Record<string, any> | undefined)?.en as string | undefined;

    return (
      <View style={[styles.fullScreen, screenPadding, styles.revealScreen]}>
        <View style={styles.revealContent}>
          <Text style={styles.revealHeading}>Without realising it...</Text>
          {noorExpl ? <Text style={styles.revealText}>{noorExpl}</Text> : null}
          <View style={styles.divider} />
          {renderRevealAyah()}
          {ayah?.label ? <Text style={styles.ayahRef}>{ayah.label as string}</Text> : null}
        </View>
        <BrandButton title="Continue" onPress={() => goToBeat(5)} style={styles.bottomButton} />
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

    const closeBlock = c.close as Record<string, any> | undefined;
    const noorTip = isSpoken
      ? `Barak Allahu feek.\nYou can now say ${phrasesLearned > 0 ? phrasesLearned : "new"} phrase${phrasesLearned !== 1 ? "s" : ""}.\nSpeak them when you can, in shaa Allah.`
      : (closeBlock?.noor_message as Record<string, any> | undefined)?.en as string | undefined
        ?? "Tonight, open the Quran and look for the pattern you learned today. You will see the ayah differently now.";

    const floatingLetters = [
      { char: "أ",  top:  70, left:  30, size: 34, opacity: 0.55, color: "#9A8F6A" },
      { char: "ب",  top:  90, right: 45, size: 26, opacity: 0.40, color: "#3A5030" },
      { char: "ق",  top: 140, left:  65, size: 30, opacity: 0.50, color: "#D4C99A" },
      { char: "ر",  top: 110, right: 80, size: 22, opacity: 0.45, color: "#9A8F6A" },
      { char: "م",  top: 200, left:  20, size: 28, opacity: 0.35, color: "#3A5030" },
      { char: "ل",  top: 170, right: 30, size: 38, opacity: 0.50, color: "#D4C99A" },
      { char: "ن",  top: 260, left:  55, size: 24, opacity: 0.40, color: "#9A8F6A" },
      { char: "ه",  top: 230, right: 55, size: 32, opacity: 0.45, color: "#3A5030" },
      { char: "و",  top: 310, left:  35, size: 28, opacity: 0.35, color: "#D4C99A" },
      { char: "ي",  top: 340, right: 25, size: 36, opacity: 0.50, color: "#9A8F6A" },
      { char: "ع",  top: 400, left:  22, size: 24, opacity: 0.40, color: "#3A5030" },
      { char: "ك",  top: 420, right: 60, size: 30, opacity: 0.45, color: "#D4C99A" },
      { char: "ص",  top: 460, left:  70, size: 22, opacity: 0.35, color: "#9A8F6A" },
      { char: "ف",  top: 500, right: 35, size: 28, opacity: 0.40, color: "#3A5030" },
      { char: "ج",  top: 540, left:  40, size: 32, opacity: 0.45, color: "#D4C99A" },
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
            <Text style={styles.completeCardTitle}>Lesson Complete!</Text>
            <Text style={styles.xpBadge}>+{earnedPoints} pts</Text>
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
            <Text style={styles.chapterUnlockedBadge}>Next chapter unlocked</Text>
          ) : null}
          {isSpoken && phrasesLearned > 0 ? (
            <Text style={styles.spPhrasesEarned}>
              {phrasesLearned} phrase{phrasesLearned !== 1 ? "s" : ""} learned to say
            </Text>
          ) : null}
        </View>

        <View style={styles.noorBubble}>
          <Text style={styles.noorLabel}>Ustaad Noor</Text>
          <Text style={styles.noorTip}>{noorTip}</Text>
        </View>

        <BrandButton
          title="Continue"
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
    const titleEn = scene?.en as string | undefined;

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {titleAr ? <ArabicText size="lg" style={styles.hookAyah}>{titleAr}</ArabicText> : null}
          {titleEn ? <Text style={styles.spContextTitleEn}>{titleEn}</Text> : null}
          <View style={styles.divider} />
          {sp?.context_body ? <Text style={styles.hookQuestion}>{sp.context_body as string}</Text> : null}
        </View>
        <BrandButton title="Begin" onPress={() => goToBeat(2)} style={styles.bottomButton} />
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
    const translation  = phrase?.en as string ?? "";

    // Build recognition options: correct translation + up to 3 others from sibling phrases
    const recognitionOptions: string[] = phrases.length >= 2
      ? [translation, ...phrases.filter((_, i) => i !== spPhraseIdx).map((p) => ((p.phrase as any)?.en as string) ?? "").filter(Boolean)].slice(0, 4)
      : [];
    const hasRecognition = recognitionOptions.length >= 2;

    if (!phraseRow) {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}><Text style={styles.hookQuestion}>No phrases available.</Text></View>
          <BrandButton title="Continue" onPress={() => goToBeat(3)} style={styles.bottomButton} />
        </View>
      );
    }

    if (spPhraseStep === "intro") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{spPhraseIdx + 1} of {total}</Text>
          <View style={styles.spPhraseCard}>
            <ArabicText size="xl" style={styles.spPhraseArabic}>{arabicPhrase}</ArabicText>
            {translit ? <Text style={styles.discoverTransliteration}>{translit}</Text> : null}
            <Text style={styles.discoverTranslation}>{translation}</Text>
            <View style={styles.discoverPlayRow}>
              <PlayButton text={arabicPhrase} cacheKey={`sp-${spPhraseIdx}`} category="phrases" size={22} />
            </View>
          </View>
          <BrandButton title="Now I'll try" onPress={() => setSpPhraseStep("shadow")} style={styles.bottomButton} />
        </View>
      );
    }

    if (spPhraseStep === "shadow") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{spPhraseIdx + 1} of {total} · Speaking</Text>
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
          <Text style={styles.spPhraseCounter}>{spPhraseIdx + 1} of {total} · Meaning check</Text>
          <View style={styles.centerStack}>
            <ArabicText size="lg" style={styles.spPhraseArabic}>{arabicPhrase}</ArabicText>
            <Text style={[styles.hookQuestion, { marginTop: 16 }]}>What does this mean?</Text>
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
            <Text style={styles.spPhraseCompleteCount}>{completed} of {total} phrases learned</Text>
            <ArabicText size="lg" style={styles.closeArabic}>{arabicPhrase}</ArabicText>
            <Text style={[styles.hookQuestion, { marginTop: 8 }]}>{translation}</Text>
          </View>
          <BrandButton title={completed < total ? "Next phrase" : "Continue"} onPress={advanceSpPhrase} style={styles.bottomButton} />
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
      return { speaker: line.speaker as string ?? "", ar: phrase?.ar as string ?? "", en: phrase?.en as string | undefined };
    });

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <Text style={styles.spContextTitleEn}>Mini-dialogue</Text>
        <ScrollView style={styles.exerciseScroller} contentContainerStyle={styles.exerciseScrollerContent}>
          <View style={styles.dialogueCard}>
            {lines.map((line, i) => (
              <View key={i} style={styles.dialogueLine}>
                <Text style={styles.dialogueSpeaker}>{line.speaker}</Text>
                <ArabicText size="sm" style={styles.dialogueArabic}>{line.ar}</ArabicText>
                {line.en ? <Text style={styles.discoverTranslation}>{line.en}</Text> : null}
              </View>
            ))}
            {lines.length === 0 ? <Text style={styles.hookQuestion}>Dialogue coming soon, in shaa Allah.</Text> : null}
          </View>
        </ScrollView>
        <BrandButton title="Continue" onPress={() => goToBeat(5)} style={styles.bottomButton} />
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
              <Text style={styles.hookQuestion}>Verb pattern content coming soon.</Text>
            </View>
          </View>
          <BrandButton title="Continue" onPress={() => goToBeat(3)} style={styles.bottomButton} />
        </View>
      );
    }

    const patternNode = table.pattern_name as Record<string, any> | undefined;
    const patternNameEn = patternNode?.en as string | undefined;
    const patternNameAr = patternNode?.ar as string | undefined;
    const patternDisplayEn = patternNameEn?.split("—")[0]?.trim();

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

        {(patternDisplayEn || patternNameAr) ? (
          <View style={styles.verbPatternNameRow}>
            {patternDisplayEn ? <Text style={styles.verbBaseMeaning}>{patternDisplayEn}</Text> : null}
            {patternDisplayEn && patternNameAr ? <Text style={styles.verbBaseMeaningSep}> — </Text> : null}
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
                  <Text style={styles.verbPronounEn}> ({pronoun?.en as string})</Text>
                </View>
                <Text style={styles.verbConjugatedForm}>{conjugated?.ar as string}</Text>
              </View>
            );
          })}
        </View>

        <BrandButton title="Continue" onPress={() => goToBeat(3)} style={StyleSheet.flatten([styles.bottomButton, styles.verbPatternContinueButton])} />
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
        <Text style={styles.errorText}>{error ?? "Lesson not found."}</Text>
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
    backgroundColor: "#F5F2EA",
  },
  fullScreen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: "#F5F2EA",
  },
  centerStack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hookAyah: {
    color: "#0F1117",
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
  },
  ayahRef: {
    marginTop: 8,
    color: "#9A8F6A",
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
    backgroundColor: "#D8D0BE",
  },
  hookQuestion: {
    maxWidth: 280,
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  bottomButton: {
    alignSelf: "stretch",
    backgroundColor: "#0F1117",
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
    color: "#0F1117",
    fontFamily: Fonts.regular,
    fontSize: 34,
    lineHeight: 38,
  },
  discoverProgress: {
    color: "#9A9080",
    fontFamily: Fonts.regular,
    fontSize: 10,
    textAlign: "center",
  },
  discoverCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#EDE8D8",
  },
  discoverArabic: {
    color: "#0F1117",
    fontSize: 36,
    lineHeight: 52,
    textAlign: "center",
  },
  discoverTranslation: {
    marginTop: 8,
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  discoverTransliteration: {
    marginTop: 4,
    color: "#9A8F6A",
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
    backgroundColor: "#D8D0BE",
  },
  progressSegment: {
    flex: 1,
    height: 4,
  },
  progressSegmentFilled: {
    backgroundColor: "#3A5030",
  },
  progressSegmentEmpty: {
    backgroundColor: "#D8D0BE",
  },
  exercisePrompt: {
    marginTop: 32,
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  exerciseArabicCard: {
    marginTop: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#EDE8D8",
  },
  exerciseArabic: {
    color: "#0F1117",
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
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
    borderColor: "#D8D0BE",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  optionCorrect: {
    borderColor: "#3A5030",
    backgroundColor: "#EAF2E8",
  },
  optionWrong: {
    borderColor: "#B07070",
    backgroundColor: "#F9EDED",
  },
  optionText: {
    color: "#0F1117",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  optionTextCorrect: {
    color: "#3A5030",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  optionTextWrong: {
    color: "#7A3030",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  optionArabicText: {
    color: "#0F1117",
    textAlign: "center",
  },
  optionArabicTextCorrect: {
    color: "#3A5030",
    textAlign: "center",
  },
  optionArabicTextWrong: {
    color: "#7A3030",
    textAlign: "center",
  },
  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 12,
  },
  answerRowCorrect: {
    borderColor: "#3A5030",
    backgroundColor: "#EAF2E8",
  },
  answerRowWrong: {
    borderColor: "#B07070",
    backgroundColor: "#F9EDED",
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
    backgroundColor: "#F5F2EA",
  },
  answerSlotFilled: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C8C0A8",
    backgroundColor: "#EDE8D8",
  },
  emptySlotText: {
    color: "#9A9080",
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
    borderColor: "#C8C0A8",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EDE8D8",
  },
  tileText: {
    color: "#0F1117",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  tileArabicText: {
    color: "#0F1117",
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
    borderColor: "#D8D0BE",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
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
    borderColor: "#D8D0BE",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#F5F2EA",
  },
  matchingChoiceSelected: {
    borderColor: "#9A8F6A",
    backgroundColor: "#FEF9E7",
  },
  matchingArabic: {
    color: "#0F1117",
    fontSize: 22,
    lineHeight: 32,
    textAlign: "center",
  },
  matchingText: {
    color: "#0F1117",
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
    borderColor: "#F0D080",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFBF0",
  },
  parseToken: {
    alignItems: "center",
    margin: 6,
  },
  parseWord: {
    color: "#0F1117",
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
  },
  parseGloss: {
    marginTop: 2,
    color: "#9A8F6A",
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
  },
  parseRow: {
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8D0BE",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
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
    borderColor: "#D8D0BE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F5F2EA",
  },
  dialogueCard: {
    marginTop: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  dialogueLine: {
    marginBottom: 10,
  },
  dialogueSpeaker: {
    color: "#9A8F6A",
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  dialogueArabic: {
    color: "#0F1117",
    fontSize: 22,
    lineHeight: 32,
    textAlign: "left",
  },
  dialogueText: {
    color: "#0F1117",
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
    borderColor: "#B8CEAE",
    backgroundColor: "#EAF2E8",
  },
  feedbackWrong: {
    borderColor: "#B07070",
    backgroundColor: "#F9EDED",
  },
  feedbackArabic: {
    color: "#3A5030",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "left",
  },
  feedbackExplanation: {
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  feedbackWrongTitle: {
    color: "#7A3030",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  feedbackWrongExplanation: {
    marginTop: 4,
  },
  feedbackCorrectAnswerArabic: {
    marginTop: 4,
    color: "#7A3030",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "left",
  },
  feedbackCorrectAnswerText: {
    marginTop: 4,
    color: "#7A3030",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  revealScreen: {
    backgroundColor: "#FEF9E7",
  },
  revealContent: {
    flex: 1,
    justifyContent: "center",
  },
  revealHeading: {
    color: "#0F1117",
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  revealText: {
    marginTop: 12,
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  revealAyah: {
    color: "#0F1117",
    fontSize: 26,
    lineHeight: 40,
    textAlign: "center",
  },
  revealAyahWord: {
    color: "#0F1117",
  },
  highlightedWord: {
    color: "#9A8F6A",
  },
  closeScreen: {
    backgroundColor: "#F8F5EE",
  },
  closeCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    zIndex: 1,
  },
  completeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#0F1117",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  completeCardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F1117",
    textAlign: "center",
  },
  xpBadge: {
    marginTop: 6,
    color: "#3A5030",
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  noorAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#D4C99A",
    borderWidth: 3,
    borderColor: "#9A8F6A",
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
    backgroundColor: "#0F1117",
  },
  noorAvatarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9A8F6A",
  },
  closeArabic: {
    color: "#9A8F6A",
    fontSize: 22,
    lineHeight: 34,
    textAlign: "center",
  },
  xpText: {
    color: "#3A5030",
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
    backgroundColor: "#0F1117",
  },
  noorLabel: {
    color: "#9A8F6A",
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  noorTip: {
    marginTop: 8,
    color: "#D4C99A",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: "#7A3030",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  spContextTitleEn: {
    marginTop: 8,
    color: "#9A8F6A",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  spPhraseCounter: {
    marginBottom: 12,
    color: "#9A9080",
    fontFamily: Fonts.regular,
    fontSize: 10,
    textAlign: "center",
  },
  spPhraseCard: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#EDE8D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  spPhraseArabic: {
    color: "#0F1117",
    fontSize: 32,
    lineHeight: 46,
    textAlign: "center",
  },
  spPhraseCompleteCount: {
    color: "#3A5030",
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 8,
  },
  spPhrasesEarned: {
    marginTop: 8,
    color: "#3A5030",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  verbPatternScreen: {
    flex: 1,
    backgroundColor: "#F5F2EA",
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
    color: "#FFFFFF",
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
    color: "#5A5240",
    textAlign: "center",
  },
  verbTableCard: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#C8C0A8",
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
    borderBottomColor: "#EDE8D8",
  },
  verbTableLeft: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  verbPronounAr: {
    fontFamily: "Scheherazade New",
    fontSize: 18,
    lineHeight: 28,
    color: "#0F1117",
  },
  verbPronounEn: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: "#9A8F6A",
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
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 24,
    backgroundColor: "#EDE8D8",
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
    color: "#5A5240",
  },
  verbPatternNameAr: {
    color: "#5A5240",
  },
  chapterUnlockedBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#3A5030",
    color: "#F5F2EA",
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  verbPatternContinueButton: {
    alignSelf: "stretch",
  },
});
