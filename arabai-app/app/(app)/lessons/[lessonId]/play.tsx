import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextStyle, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../../services/api";
import { ArabicText } from "../../../components/ArabicText";
import { BrandButton } from "../../../components/BrandButton";
import { Fonts, WarshPalette } from "../../../../constants/theme";

type Hook = {
  ayahAr?: string;
  ayahRef?: string;
  question?: string;
};

type DiscoverCard = {
  arabicText?: string;
  translation?: string;
  transliteration?: string;
};

type ExerciseType = "TRUE_FALSE" | "TAP_TRANSLATION" | "FILL_BLANK" | "BUILD_SENTENCE";

type Exercise = {
  type: ExerciseType;
  prompt?: string;
  arabicText?: string;
  options?: string[];
  correctAnswer?: string;
};

type RevealAyah = {
  ayahAr?: string;
  ayahRef?: string;
  highlightedWord?: string;
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
};

type CompletionResult = {
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
};

const ANSWER_DELAY_MS = 1200;

function splitWords(value?: string) {
  return value?.trim().split(/\s+/).filter(Boolean) ?? [];
}

function containsArabic(value?: string | null) {
  return Boolean(value && /[\u0600-\u06FF]/.test(value));
}

function normalizeAnswer(value?: string | null) {
  return value?.normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function getSelectedText(selectedAnswer: string | string[] | null) {
  return Array.isArray(selectedAnswer) ? selectedAnswer.join(" ") : selectedAnswer;
}

function isAnswerCorrect(exercise: Exercise | undefined, selectedAnswer: string | string[] | null) {
  if (!exercise) {
    return false;
  }

  return normalizeAnswer(getSelectedText(selectedAnswer)) === normalizeAnswer(exercise.correctAnswer);
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
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [legacyAnswer, setLegacyAnswer] = useState<string | null>(null);
  const [legacyAnswered, setLegacyAnswered] = useState(false);

  const discoverCards = lesson?.discoverCards ?? [];
  const exercises = lesson?.exercises ?? [];
  const currentExercise = exercises[currentExerciseIndex];
  const selectedText = getSelectedText(selectedAnswer);
  const answeredCorrectly = isAnswered && isAnswerCorrect(currentExercise, selectedAnswer);
  const completedExerciseCount = Math.min(currentExerciseIndex + (isAnswered ? 1 : 0), exercises.length);

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) {
        setError("Invalid lesson.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/lessons/${lessonId}`);
        setLesson(response.data.data.lesson);
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
        const response = await api.post(`/api/lessons/${lessonId}/complete`, { score: 100 });
        const data = response.data.data;
        setCompletionResult({
          xpEarned: data.xpEarned,
          totalXp: data.totalXp,
          currentStreak: data.currentStreak,
        });
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

  function answerExercise(answer: string | string[]) {
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
                {currentExercise.correctAnswer}
              </ArabicText>
            ) : (
              <Text style={styles.feedbackCorrectAnswerText}>{currentExercise.correctAnswer}</Text>
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

  function renderLegacyLesson() {
    const content = lesson?.content as Record<string, any> | null;
    const isFlashcard = lesson?.type === "FLASHCARD";
    const contentOptions = Array.isArray(content?.options) ? (content!.options as string[]) : [];
    const hasOptions = contentOptions.length > 0;

    if (isFlashcard && !cardFlipped) {
      return (
        <View style={styles.fullScreen}>
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
        <View style={styles.fullScreen}>
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
        <View style={styles.fullScreen}>
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
      <View style={styles.fullScreen}>
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

  function renderHook() {
    return (
      <View style={styles.fullScreen}>
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
      <View style={styles.fullScreen}>
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
          {card?.arabicText ? (
            <ArabicText size="lg" style={styles.discoverArabic}>
              {card.arabicText}
            </ArabicText>
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
    return (
      <View style={styles.fullScreen}>
        {renderProgressBar()}
        <Text style={styles.exercisePrompt}>{currentExercise?.prompt}</Text>
        {currentExercise?.arabicText ? (
          <View style={styles.exerciseArabicCard}>
            <ArabicText size="lg" style={styles.exerciseArabic}>
              {currentExercise.arabicText}
            </ArabicText>
          </View>
        ) : null}

        {currentExercise?.type === "BUILD_SENTENCE" ? renderBuildSentence() : renderOptionGrid()}
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
      <View style={[styles.fullScreen, styles.revealScreen]}>
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

    return (
      <View style={styles.fullScreen}>
        <View style={styles.closeContent}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.xpText}>+{earnedPoints} pts</Text>
          <ArabicText size="lg" style={styles.closeArabic}>
            بارك الله فيك
          </ArabicText>
          <View style={styles.noorBubble}>
            <Text style={styles.noorLabel}>Ustaad Noor</Text>
            <Text style={styles.noorTip}>
              Tonight, open the Quran to Al-Baqarah. Find the word you learned today. You will see it differently now.
            </Text>
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
    paddingTop: 56,
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
});
