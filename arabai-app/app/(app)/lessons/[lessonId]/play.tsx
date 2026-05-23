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
import { cancelTodayReminders, fireMilestoneNotification } from "@services/notifications";
import { trackLessonStarted, trackLessonCompleted, trackMilestoneUnlocked } from "@services/analytics";

type Hook = {
  ayahAr?: string;
  ayahRef?: string;
  question?: string;
};

type DiscoverCard = {
  emoji?: string;
  arabicText?: string;
  translation?: string;
  transliteration?: string;
};

type ExerciseType = "TRUE_FALSE" | "TAP_TRANSLATION" | "FILL_BLANK" | "BUILD_SENTENCE" | "MATCHING" | "GRAMMAR_PARSE" | "CONVERSATION_BUILDER" | "SHADOW_REPEAT";

type MatchingPair = {
  left: string;
  right: string;
};

type ParseToken = {
  word: string;
  label: string;
  gloss?: string;
};

type ConversationLine = {
  speaker: string;
  line: string;
};

type Exercise = {
  type: ExerciseType;
  prompt?: string;
  arabicText?: string;
  options?: string[];
  correctAnswer?: string;
  pairs?: MatchingPair[];
  parseTokens?: ParseToken[];
  labels?: string[];
  conversation?: ConversationLine[];
};

type RevealAyah = {
  ayahAr?: string;
  ayahRef?: string;
  highlightedWord?: string;
};

type SpokenPhrase = {
  arabic: string;
  transliteration?: string;
  translation: string;
  recognitionOptions?: string[];
};

type DialogueLine = {
  speaker: string;
  line: string;
  translation?: string;
};

type SpokenPhrasesContent = {
  contextTitle?: string;
  contextTitleEn?: string;
  contextBody?: string;
  phrases?: SpokenPhrase[];
  dialogue?: DialogueLine[];
};

type Lesson = {
  id: string;
  title: string;
  xpReward: number;
  hook?: Hook | null;
  discoverCards?: DiscoverCard[] | null;
  exercises?: Exercise[] | null;
  revealText?: string | null;
  revealAyah?: RevealAyah | null;
  fatihaProgressDelta?: number;
  content?: Record<string, unknown> | null;
  type?: string | null;
};

type CompletionResult = {
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
};

type SelectedAnswer = string | string[] | Record<string, string> | null;

const ANSWER_DELAY_MS = 1800;

function splitWords(value?: string) {
  return value?.trim().split(/\s+/).filter(Boolean) ?? [];
}

function containsArabic(value?: string | null) {
  return Boolean(value && /[\u0600-\u06FF]/.test(value));
}

function normalizeAnswer(value?: string | null) {
  return value?.normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function getSelectedText(selectedAnswer: SelectedAnswer) {
  if (selectedAnswer && !Array.isArray(selectedAnswer) && typeof selectedAnswer === "object") {
    return Object.values(selectedAnswer).join(" ");
  }

  return Array.isArray(selectedAnswer) ? selectedAnswer.join(" ") : selectedAnswer;
}

function isAnswerCorrect(exercise: Exercise | undefined, selectedAnswer: SelectedAnswer) {
  if (!exercise) {
    return false;
  }

  if (exercise.type === "MATCHING") {
    if (!selectedAnswer || Array.isArray(selectedAnswer) || typeof selectedAnswer !== "object") {
      return false;
    }

    return (exercise.pairs ?? []).every((pair) => normalizeAnswer(selectedAnswer[pair.left]) === normalizeAnswer(pair.right));
  }

  if (exercise.type === "GRAMMAR_PARSE") {
    if (!selectedAnswer || Array.isArray(selectedAnswer) || typeof selectedAnswer !== "object") {
      return false;
    }

    return (exercise.parseTokens ?? []).every((token) => normalizeAnswer(selectedAnswer[token.word]) === normalizeAnswer(token.label));
  }

  return normalizeAnswer(getSelectedText(selectedAnswer)) === normalizeAnswer(exercise.correctAnswer);
}

function getCorrectAnswerDisplay(exercise?: Exercise) {
  if (!exercise) {
    return "";
  }

  if (exercise.type === "MATCHING") {
    return (exercise.pairs ?? []).map((pair) => `${pair.left} = ${pair.right}`).join(" | ");
  }

  if (exercise.type === "GRAMMAR_PARSE") {
    return (exercise.parseTokens ?? []).map((token) => `${token.word} = ${token.label}`).join(" | ");
  }

  return exercise.correctAnswer ?? "";
}

function renderMaybeArabic(value: string, arabicStyle: TextStyle = styles.optionArabicText, textStyle: TextStyle = styles.optionText) {
  if (containsArabic(value)) {
    return (
      <ArabicText size="sm" style={arabicStyle}>
        {value}
      </ArabicText>
    );
  }

  return <Text style={textStyle}>{value}</Text>;
}

export default function LessonPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<SelectedAnswer>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [legacyAnswer, setLegacyAnswer] = useState<string | null>(null);
  const [legacyAnswered, setLegacyAnswered] = useState(false);

  // SHADOW_REPEAT / SPOKEN_PHRASES tracking
  const phrasesCompletedRef = useRef(0);
  const [spPhraseIdx, setSpPhraseIdx] = useState(0);
  const [spPhraseStep, setSpPhraseStep] = useState<"intro" | "shadow" | "recognition" | "phraseComplete">("intro");
  const [spRecognitionAnswer, setSpRecognitionAnswer] = useState<string | null>(null);
  const [spRecognitionAnswered, setSpRecognitionAnswered] = useState(false);

  const discoverCards = lesson?.discoverCards ?? [];
  const exercises = lesson?.exercises ?? [];
  const currentExercise = exercises[currentExerciseIndex];
  const selectedText = getSelectedText(selectedAnswer);
  const answeredCorrectly = isAnswered && isAnswerCorrect(currentExercise, selectedAnswer);
  const completedExerciseCount = Math.min(currentExerciseIndex + (isAnswered ? 1 : 0), exercises.length);
  const screenPadding = { paddingTop: insets.top + 16 };

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) {
        setError("Invalid lesson.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/lessons/${lessonId}`);
        const lessonData = response.data.data.lesson;
        setLesson(lessonData);
        trackLessonStarted(lessonId, lessonData?.type);
      } catch (err) {
        setError("Unable to load lesson.");
      } finally {
        setLoading(false);
      }
    }

    void loadLesson();
  }, [lessonId]);

  useEffect(() => {
    async function finishLesson() {
      if (!lessonId || currentBeat !== 5 || submitting || completionResult) {
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const response = await api.post(`/api/lessons/${lessonId}/complete`, { score: 100, phrasesCompleted: phrasesCompletedRef.current });
        const data = response.data.data;
        setCompletionResult({
          xpEarned: data.xpEarned,
          totalXp: data.totalXp,
          currentStreak: data.currentStreak,
        });
        trackLessonCompleted({
          lessonId,
          lessonType: lesson?.type,
          xpEarned: data.xpEarned,
          currentStreak: data.currentStreak,
          dailyGoalMet: data.dailyGoalXp > 0,
        });
        // Cancel today's reminders if daily goal was first met
        if (data.dailyGoalXp > 0) {
          cancelTodayReminders().catch(() => {});
        }
        // Fire milestone notifications and track achievements
        if (Array.isArray(data.newAchievements) && data.newAchievements.length > 0) {
          for (const achievement of data.newAchievements as { key: string; title: string; xpReward: number }[]) {
            fireMilestoneNotification(achievement.title).catch(() => {});
            trackMilestoneUnlocked(achievement.key ?? "", achievement.title, achievement.xpReward ?? 0);
          }
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
  }, [completionResult, currentBeat, lessonId, submitting]);

  function goToBeat(beat: number) {
    setCurrentBeat(beat);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }

  function goToNextExercise() {
    if (currentExerciseIndex >= exercises.length - 1) {
      goToBeat(4);
      return;
    }

    setCurrentExerciseIndex((index) => index + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }

  function answerExercise(answer: SelectedAnswer) {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setTimeout(goToNextExercise, ANSWER_DELAY_MS);
  }

  function checkBuildSentence() {
    if (!Array.isArray(selectedAnswer)) return;
    answerExercise(selectedAnswer);
  }

  function addBuildTile(option: string) {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer((current) => {
      const currentTiles = Array.isArray(current) ? current : [];
      const expectedSlots = splitWords(currentExercise?.correctAnswer).length;

      if (currentTiles.length >= expectedSlots) {
        return currentTiles;
      }

      return [...currentTiles, option];
    });
  }

  function removeBuildTile(index: number) {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer((current) => {
      if (!Array.isArray(current)) {
        return current;
      }

      return current.filter((_, tileIndex) => tileIndex !== index);
    });
  }

  function getOptionStyle(option: string) {
    if (!isAnswered) {
      return styles.optionButton;
    }

    if (normalizeAnswer(option) === normalizeAnswer(currentExercise?.correctAnswer)) {
      return [styles.optionButton, styles.optionCorrect];
    }

    if (selectedText === option) {
      return [styles.optionButton, styles.optionWrong];
    }

    return styles.optionButton;
  }

  function getOptionTextStyle(option: string) {
    if (!isAnswered) {
      return containsArabic(option) ? styles.optionArabicText : styles.optionText;
    }

    if (normalizeAnswer(option) === normalizeAnswer(currentExercise?.correctAnswer)) {
      return containsArabic(option) ? styles.optionArabicTextCorrect : styles.optionTextCorrect;
    }

    if (selectedText === option) {
      return containsArabic(option) ? styles.optionArabicTextWrong : styles.optionTextWrong;
    }

    return containsArabic(option) ? styles.optionArabicText : styles.optionText;
  }

  function renderFeedback() {
    if (!isAnswered || !currentExercise) {
      return null;
    }

    return (
      <View style={[styles.feedbackBar, answeredCorrectly ? styles.feedbackCorrect : styles.feedbackWrong]}>
        {answeredCorrectly ? (
          <>
            <ArabicText size="sm" style={styles.feedbackArabic}>
              بارك الله فيك
            </ArabicText>
            <Text style={styles.feedbackExplanation}>You recognised the pattern and chose the right answer.</Text>
          </>
        ) : (
          <>
            <Text style={styles.feedbackWrongTitle}>Almost - let's look at this again</Text>
            {containsArabic(currentExercise.arabicText) || containsArabic(currentExercise.correctAnswer) ? (
              <ArabicText size="sm" style={styles.feedbackCorrectAnswerArabic}>
                {getCorrectAnswerDisplay(currentExercise)}
              </ArabicText>
            ) : (
              <Text style={styles.feedbackCorrectAnswerText}>{getCorrectAnswerDisplay(currentExercise)}</Text>
            )}
          </>
        )}
      </View>
    );
  }

  function renderProgressBar() {
    return (
      <View style={styles.progressTrack}>
        {exercises.map((exercise, index) => (
          <View
            key={`${exercise.prompt ?? "exercise"}-${index}`}
            style={[styles.progressSegment, index < completedExerciseCount ? styles.progressSegmentFilled : styles.progressSegmentEmpty]}
          />
        ))}
      </View>
    );
  }

  function renderOptionGrid() {
    return (
      <View style={styles.optionGrid}>
        {(currentExercise?.options ?? []).map((option) => (
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

  function renderBuildSentence() {
    const selectedTiles = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const slots = splitWords(currentExercise?.correctAnswer);
    const canCheck = selectedTiles.length === slots.length && !isAnswered;

    return (
      <>
        <View style={[styles.answerRow, isAnswered ? (answeredCorrectly ? styles.answerRowCorrect : styles.answerRowWrong) : null, containsArabic(currentExercise?.correctAnswer) ? styles.answerRowRtl : null]}>
          {slots.map((slot, index) => {
            const selectedTile = selectedTiles[index];

            return (
              <Pressable
                key={`${slot}-${index}`}
                accessibilityRole="button"
                disabled={!selectedTile || isAnswered}
                onPress={() => removeBuildTile(index)}
                style={[styles.answerSlot, selectedTile ? styles.answerSlotFilled : null]}
              >
                {selectedTile ? renderMaybeArabic(selectedTile, styles.tileArabicText, styles.tileText) : <Text style={styles.emptySlotText}> </Text>}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tileWrap}>
          {(currentExercise?.options ?? []).map((option, index) => (
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

  function updateMappedAnswer(key: string, value: string) {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer((current) => ({
      ...(!Array.isArray(current) && current && typeof current === "object" ? current : {}),
      [key]: value,
    }));
  }

  function renderMatching() {
    const pairs = currentExercise?.pairs ?? [];
    const choices = currentExercise?.options ?? pairs.map((pair) => pair.right);
    const selectedMap = !Array.isArray(selectedAnswer) && selectedAnswer && typeof selectedAnswer === "object" ? selectedAnswer : {};
    const canCheck = pairs.length > 0 && pairs.every((pair) => selectedMap[pair.left]) && !isAnswered;

    return (
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
        {canCheck ? <BrandButton title="Check" onPress={() => answerExercise(selectedMap)} style={styles.bottomButton} /> : null}
      </ScrollView>
    );
  }

  function renderGrammarParse() {
    const tokens = currentExercise?.parseTokens ?? [];
    const labels = currentExercise?.labels ?? Array.from(new Set(tokens.map((token) => token.label)));
    const selectedMap = !Array.isArray(selectedAnswer) && selectedAnswer && typeof selectedAnswer === "object" ? selectedAnswer : {};
    const canCheck = tokens.length > 0 && tokens.every((token) => selectedMap[token.word]) && !isAnswered;

    return (
      <ScrollView style={styles.exerciseScroller} contentContainerStyle={styles.exerciseScrollerContent}>
        <View style={styles.parseSentence}>
          {tokens.map((token) => (
            <View key={token.word} style={styles.parseToken}>
              <ArabicText size="sm" style={styles.parseWord}>
                {token.word}
              </ArabicText>
              <Text style={styles.parseGloss}>{selectedMap[token.word] ?? token.gloss ?? "Choose role"}</Text>
            </View>
          ))}
        </View>
        {tokens.map((token) => (
          <View key={`${token.word}-labels`} style={styles.parseRow}>
            <View style={styles.parseRowWord}>
              <ArabicText size="sm" style={styles.matchingArabic}>
                {token.word}
              </ArabicText>
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
        {canCheck ? <BrandButton title="Check" onPress={() => answerExercise(selectedMap)} style={styles.bottomButton} /> : null}
      </ScrollView>
    );
  }

  function renderConversationBuilder() {
    return (
      <>
        <View style={styles.dialogueCard}>
          {(currentExercise?.conversation ?? []).map((line, index) => (
            <View key={`${line.speaker}-${index}`} style={styles.dialogueLine}>
              <Text style={styles.dialogueSpeaker}>{line.speaker}</Text>
              {containsArabic(line.line) ? (
                <ArabicText size="sm" style={styles.dialogueArabic}>
                  {line.line}
                </ArabicText>
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

  function renderLegacyLesson() {
    const content = lesson?.content as Record<string, any> | null;
    const isFlashcard = lesson?.type === "FLASHCARD";
    const contentOptions = Array.isArray(content?.options) ? (content!.options as string[]) : [];
    const hasOptions = contentOptions.length > 0;

    if (isFlashcard && !cardFlipped) {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}>
            {content?.arabic ? (
              <ArabicText size="xl" style={styles.hookAyah}>
                {content.arabic}
              </ArabicText>
            ) : null}
            {content?.transliteration ? (
              <Text style={styles.ayahRef}>{content.transliteration}</Text>
            ) : null}
            <View style={styles.divider} />
            <Text style={styles.hookQuestion}>What does this mean?</Text>
          </View>
          <BrandButton title="Reveal" onPress={() => setCardFlipped(true)} style={styles.bottomButton} />
        </View>
      );
    }

    if (isFlashcard) {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}>
            {content?.arabic ? (
              <ArabicText size="lg" style={styles.hookAyah}>
                {content.arabic}
              </ArabicText>
            ) : null}
            {content?.meaning_en ? (
              <Text style={[styles.hookQuestion, { fontSize: 18, marginTop: 12 }]}>{content.meaning_en as string}</Text>
            ) : null}
            {content?.transliteration ? (
              <Text style={styles.ayahRef}>{content.transliteration as string}</Text>
            ) : null}
            {content?.explanation_en ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.hookQuestion}>{content.explanation_en as string}</Text>
              </>
            ) : null}
          </View>
          <BrandButton title="Got it" onPress={() => goToBeat(5)} style={styles.bottomButton} />
        </View>
      );
    }

    // FILL_BLANK / MULTIPLE_CHOICE / MATCHING
    if (hasOptions && !legacyAnswered) {
      const correctAnswer = content?.answer as string | undefined;
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}>
            {content?.question ? (
              <Text style={styles.hookQuestion}>{content.question as string}</Text>
            ) : null}
          </View>
          <View style={styles.optionGrid}>
            {contentOptions.map((option) => {
              const isCorrect = legacyAnswered && normalizeAnswer(option) === normalizeAnswer(correctAnswer);
              const isWrong = legacyAnswered && legacyAnswer === option && !isCorrect;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  disabled={legacyAnswered}
                  onPress={() => {
                    setLegacyAnswer(option);
                    setLegacyAnswered(true);
                    setTimeout(() => goToBeat(5), ANSWER_DELAY_MS);
                  }}
                  style={[styles.optionButton, isCorrect ? styles.optionCorrect : isWrong ? styles.optionWrong : null]}
                >
                  {renderMaybeArabic(option, isCorrect ? styles.optionArabicTextCorrect : isWrong ? styles.optionArabicTextWrong : styles.optionArabicText, isCorrect ? styles.optionTextCorrect : isWrong ? styles.optionTextWrong : styles.optionText)}
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {content?.question ? <Text style={styles.hookQuestion}>{content.question as string}</Text> : null}
          {content?.arabic ? (
            <ArabicText size="lg" style={styles.hookAyah}>
              {content.arabic as string}
            </ArabicText>
          ) : null}
          {content?.answer ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.hookQuestion}>{content.answer as string}</Text>
            </>
          ) : null}
        </View>
        <BrandButton title="Continue" onPress={() => goToBeat(5)} style={styles.bottomButton} />
      </View>
    );
  }

  // ---- SPOKEN_PHRASES lesson (SP1-SP4) ----

  function getSpContent(): SpokenPhrasesContent {
    return (lesson?.content ?? {}) as SpokenPhrasesContent;
  }

  function renderSP1Context() {
    const sp = getSpContent();
    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {sp.contextTitle ? (
            <ArabicText size="lg" style={styles.hookAyah}>{sp.contextTitle}</ArabicText>
          ) : null}
          {sp.contextTitleEn ? <Text style={styles.spContextTitleEn}>{sp.contextTitleEn}</Text> : null}
          <View style={styles.divider} />
          {sp.contextBody ? (
            <Text style={styles.hookQuestion}>{sp.contextBody}</Text>
          ) : null}
        </View>
        <BrandButton title="Begin" onPress={() => goToBeat(2)} style={styles.bottomButton} />
      </View>
    );
  }

  function advanceSpPhrase() {
    const sp = getSpContent();
    const total = sp.phrases?.length ?? 0;
    if (spPhraseIdx >= total - 1) {
      // All phrases done — move to SP3 Dialogue (beat 3)
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
    const sp = getSpContent();
    const phrases = sp.phrases ?? [];
    const phrase = phrases[spPhraseIdx];
    const total = phrases.length;

    if (!phrase) {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}><Text style={styles.hookQuestion}>No phrases available.</Text></View>
          <BrandButton title="Continue" onPress={() => goToBeat(3)} style={styles.bottomButton} />
        </View>
      );
    }

    // Step: intro
    if (spPhraseStep === "intro") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{spPhraseIdx + 1} of {total}</Text>
          <View style={styles.spPhraseCard}>
            <ArabicText size="xl" style={styles.spPhraseArabic}>{phrase.arabic}</ArabicText>
            {phrase.transliteration ? <Text style={styles.discoverTransliteration}>{phrase.transliteration}</Text> : null}
            <Text style={styles.discoverTranslation}>{phrase.translation}</Text>
            <View style={styles.discoverPlayRow}>
              <PlayButton text={phrase.arabic} cacheKey={`sp-${spPhraseIdx}`} category="phrases" size={22} />
            </View>
          </View>
          <BrandButton title="Now I'll try" onPress={() => setSpPhraseStep("shadow")} style={styles.bottomButton} />
        </View>
      );
    }

    // Step: shadow (SHADOW_REPEAT)
    if (spPhraseStep === "shadow") {
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{spPhraseIdx + 1} of {total} · Speaking</Text>
          <ShadowRepeatExercise
            arabic={phrase.arabic}
            transliteration={phrase.transliteration}
            translation={phrase.translation}
            onComplete={(recorded) => {
              if (recorded) phrasesCompletedRef.current += 1;
              if (phrase.recognitionOptions && phrase.recognitionOptions.length >= 2) {
                setSpPhraseStep("recognition");
              } else {
                setSpPhraseStep("phraseComplete");
              }
            }}
          />
        </View>
      );
    }

    // Step: recognition (AUDIO_RECOGNITION check)
    if (spPhraseStep === "recognition") {
      const options = phrase.recognitionOptions ?? [];
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <Text style={styles.spPhraseCounter}>{spPhraseIdx + 1} of {total} · Meaning check</Text>
          <View style={styles.centerStack}>
            <ArabicText size="lg" style={styles.spPhraseArabic}>{phrase.arabic}</ArabicText>
            <Text style={[styles.hookQuestion, { marginTop: 16 }]}>What does this mean?</Text>
          </View>
          <View style={styles.optionGrid}>
            {options.map((opt) => {
              const isCorrect = spRecognitionAnswered && opt === phrase.translation;
              const isWrong = spRecognitionAnswered && opt === spRecognitionAnswer && opt !== phrase.translation;
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

    // Step: phraseComplete (auto-advance)
    if (spPhraseStep === "phraseComplete") {
      const completed = spPhraseIdx + 1;
      return (
        <View style={[styles.fullScreen, screenPadding]}>
          <View style={styles.centerStack}>
            <Text style={styles.spPhraseCompleteCount}>{completed} of {total} phrases learned</Text>
            <ArabicText size="lg" style={styles.closeArabic}>{phrase.arabic}</ArabicText>
            <Text style={[styles.hookQuestion, { marginTop: 8 }]}>{phrase.translation}</Text>
          </View>
          <BrandButton title={completed < total ? "Next phrase" : "Continue"} onPress={advanceSpPhrase} style={styles.bottomButton} />
        </View>
      );
    }

    return null;
  }

  function renderSP3Dialogue() {
    const sp = getSpContent();
    const dialogue = sp.dialogue ?? [];

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <Text style={styles.spContextTitleEn}>Mini-dialogue</Text>
        <ScrollView style={styles.exerciseScroller} contentContainerStyle={styles.exerciseScrollerContent}>
          <View style={styles.dialogueCard}>
            {dialogue.map((line, i) => (
              <View key={i} style={styles.dialogueLine}>
                <Text style={styles.dialogueSpeaker}>{line.speaker}</Text>
                <ArabicText size="sm" style={styles.dialogueArabic}>{line.line}</ArabicText>
                {line.translation ? <Text style={styles.discoverTranslation}>{line.translation}</Text> : null}
              </View>
            ))}
          </View>
          {dialogue.length === 0 ? (
            <Text style={styles.hookQuestion}>Dialogue coming soon, in shaa Allah.</Text>
          ) : null}
        </ScrollView>
        <BrandButton title="Continue" onPress={() => goToBeat(5)} style={styles.bottomButton} />
      </View>
    );
  }

  // ---- End SPOKEN_PHRASES ----

  function renderHook() {
    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.centerStack}>
          {lesson?.hook?.ayahAr ? (
            <ArabicText size="lg" style={styles.hookAyah}>
              {lesson.hook.ayahAr}
            </ArabicText>
          ) : null}
          {lesson?.hook?.ayahRef ? <Text style={styles.ayahRef}>{lesson.hook.ayahRef}</Text> : null}
          <View style={styles.divider} />
          {lesson?.hook?.question ? <Text style={styles.hookQuestion}>{lesson.hook.question}</Text> : null}
        </View>
        <BrandButton title="I want to understand this" onPress={() => goToBeat(2)} style={styles.bottomButton} />
      </View>
    );
  }

  function renderDiscover() {
    const card = discoverCards[currentCardIndex];
    const isLastCard = currentCardIndex >= discoverCards.length - 1;

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (currentCardIndex === 0) {
                goToBeat(1);
              } else {
                setCurrentCardIndex((index) => index - 1);
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <Text style={styles.discoverProgress}>
            {currentCardIndex + 1} of {discoverCards.length}
          </Text>
          <View style={styles.backButtonSpacer} />
        </View>

        <View style={styles.discoverCard}>
          {card?.emoji ? <Text style={styles.discoverEmoji}>{card.emoji}</Text> : null}
          {card?.arabicText ? (
            <>
              <ArabicText size="lg" style={styles.discoverArabic}>
                {card.arabicText}
              </ArabicText>
              <View style={styles.discoverPlayRow}>
                <PlayButton
                  text={card.arabicText}
                  cacheKey={card.transliteration || card.arabicText}
                  category="lessons"
                  size={22}
                />
              </View>
            </>
          ) : null}
          {card?.translation ? <Text style={styles.discoverTranslation}>{card.translation}</Text> : null}
          {card?.transliteration ? <Text style={styles.discoverTransliteration}>{card.transliteration}</Text> : null}
        </View>

        <BrandButton
          title={isLastCard ? "Start practising" : "Next"}
          onPress={() => {
            if (isLastCard) {
              goToBeat(3);
            } else {
              setCurrentCardIndex((index) => index + 1);
            }
          }}
          style={styles.bottomButton}
        />
      </View>
    );
  }

  function renderPractice() {
    function renderCurrentExercise() {
      if (currentExercise?.type === "SHADOW_REPEAT") {
        return (
          <ShadowRepeatExercise
            arabic={currentExercise.arabicText ?? ""}
            transliteration={currentExercise.prompt}
            translation={currentExercise.correctAnswer}
            onComplete={(recorded) => {
              if (recorded) phrasesCompletedRef.current += 1;
              goToNextExercise();
            }}
          />
        );
      }

      if (currentExercise?.type === "BUILD_SENTENCE") {
        return renderBuildSentence();
      }

      if (currentExercise?.type === "MATCHING") {
        return renderMatching();
      }

      if (currentExercise?.type === "GRAMMAR_PARSE") {
        return renderGrammarParse();
      }

      if (currentExercise?.type === "CONVERSATION_BUILDER") {
        return renderConversationBuilder();
      }

      return renderOptionGrid();
    }

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        {renderProgressBar()}
        <Text style={styles.exercisePrompt}>{currentExercise?.prompt}</Text>
        {currentExercise?.arabicText ? (
          <View style={styles.exerciseArabicCard}>
            <ArabicText size="lg" style={styles.exerciseArabic}>
              {currentExercise.arabicText}
            </ArabicText>
            <View style={styles.exercisePlayRow}>
              <PlayButton
                text={currentExercise.arabicText}
                cacheKey={`${lessonId}-ex${currentExerciseIndex}`}
                category="lessons"
                size={20}
              />
            </View>
          </View>
        ) : null}

        {renderCurrentExercise()}
        {renderFeedback()}
      </View>
    );
  }

  function renderRevealAyah() {
    const ayah = lesson?.revealAyah;
    const words = splitWords(ayah?.ayahAr);

    return (
      <ArabicText size="lg" style={styles.revealAyah}>
        {words.map((word, index) => (
          <Text key={`${word}-${index}`} style={normalizeAnswer(word) === normalizeAnswer(ayah?.highlightedWord) ? styles.highlightedWord : styles.revealAyahWord}>
            {index === 0 ? word : ` ${word}`}
          </Text>
        ))}
      </ArabicText>
    );
  }

  function renderReveal() {
    return (
      <View style={[styles.fullScreen, screenPadding, styles.revealScreen]}>
        <View style={styles.revealContent}>
          <Text style={styles.revealHeading}>Without realising it...</Text>
          {lesson?.revealText ? <Text style={styles.revealText}>{lesson.revealText}</Text> : null}
          <View style={styles.divider} />
          {renderRevealAyah()}
          {lesson?.revealAyah?.ayahRef ? <Text style={styles.ayahRef}>{lesson.revealAyah.ayahRef}</Text> : null}
        </View>
        <BrandButton title="Continue" onPress={() => goToBeat(5)} style={styles.bottomButton} />
      </View>
    );
  }

  function renderClose() {
    const earnedPoints = completionResult?.xpEarned ?? lesson?.xpReward ?? 10;
    const isSpoken = lesson?.type === "SPOKEN_PHRASES";
    const phrasesLearned = phrasesCompletedRef.current;

    const noorTip = isSpoken
      ? `Barak Allahu feek.\nYou can now say ${phrasesLearned > 0 ? phrasesLearned : "new"} phrase${phrasesLearned !== 1 ? "s" : ""}.\nSpeak them when you can, in shaa Allah.`
      : typeof lesson?.content?.ustadh_noor_tip_en === "string"
        ? lesson.content.ustadh_noor_tip_en
        : "Tonight, open the Quran and look for the pattern you learned today. You will see the ayah differently now.";

    return (
      <View style={[styles.fullScreen, screenPadding]}>
        <View style={styles.closeContent}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.xpText}>+{earnedPoints} pts</Text>
          <ArabicText size="lg" style={styles.closeArabic}>
            بارك الله فيك
          </ArabicText>
          {isSpoken && phrasesLearned > 0 ? (
            <Text style={styles.spPhrasesEarned}>{phrasesLearned} phrase{phrasesLearned !== 1 ? "s" : ""} learned to say</Text>
          ) : null}
          <View style={styles.noorBubble}>
            <Text style={styles.noorLabel}>Ustaad Noor</Text>
            <Text style={styles.noorTip}>{noorTip}</Text>
          </View>
        </View>
        <BrandButton title="Back to lessons" onPress={() => router.back()} loading={submitting} style={styles.bottomButton} />
      </View>
    );
  }

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

  if (lesson.type === "SPOKEN_PHRASES") {
    if (currentBeat === 5) return renderClose();
    if (currentBeat === 2) return renderSP2Phrases();
    if (currentBeat === 3) return renderSP3Dialogue();
    return renderSP1Context();
  }

  if (lesson.type !== "VOCABULARY") {
    if (currentBeat === 5) {
      return renderClose();
    }
    return renderLegacyLesson();
  }

  if (currentBeat === 1) {
    return renderHook();
  }

  if (currentBeat === 2) {
    return renderDiscover();
  }

  if (currentBeat === 3) {
    return renderPractice();
  }

  if (currentBeat === 4) {
    return renderReveal();
  }

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
  discoverEmoji: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: 8,
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
    marginBottom: 96,
  },
  exerciseScrollerContent: {
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
  closeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  xpText: {
    color: "#3A5030",
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 32,
    textAlign: "center",
  },
  closeArabic: {
    marginTop: 8,
    color: "#9A8F6A",
    fontSize: 22,
    lineHeight: 34,
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
  // SPOKEN_PHRASES styles
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
});
