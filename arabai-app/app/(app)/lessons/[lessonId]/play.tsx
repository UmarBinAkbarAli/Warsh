import { ReactNode, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../../services/api";
import { ArabicText } from "../../../components/ArabicText";
import { useAuthStore } from "../../../stores/authStore";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../../constants/theme";

type BilingualWord = {
  arabic?: string;
  transliteration?: string;
  meaning_en?: string;
  meaning_ur?: string;
};

type LessonContent = {
  question?: string;
  question_ur?: string;
  answer?: string;
  options?: string[];
  arabic?: string;
  transliteration?: string;
  meaning_en?: string;
  meaning_ur?: string;
  explanation_en?: string;
  explanation_ur?: string;
  hook?: BilingualWord;
  quranic_example?: BilingualWord;
  conversation_example?: BilingualWord;
  ustadh_noor_tip_en?: string;
  ustadh_noor_tip_ur?: string;
  review_words?: BilingualWord[];
};

type Lesson = {
  id: string;
  title: string;
  titleAr?: string;
  type: string;
  xpReward: number;
  content: LessonContent;
};

function containsArabic(value?: string) {
  return Boolean(value && /[\u0600-\u06FF]/.test(value));
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: Colors.bg.card,
        padding: Spacing.lg,
        borderRadius: Radii.xl,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        ...Shadows.card,
      }}
    >
      <Text
        style={{
          color: Colors.accent.gold,
          fontSize: FontSizes.h3,
          lineHeight: LineHeights.h3,
          fontWeight: "700",
          marginBottom: Spacing.md,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function WordBlock({ data }: { data?: BilingualWord | null }) {
  if (!data || (!data.arabic && !data.transliteration && !data.meaning_en && !data.meaning_ur)) {
    return null;
  }

  return (
    <View style={{ marginBottom: Spacing.md }}>
      {data.arabic ? (
        <ArabicText size="md" style={{ marginBottom: Spacing.xs }}>
          {data.arabic}
        </ArabicText>
      ) : null}
      {data.transliteration ? (
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>{data.transliteration}</Text>
      ) : null}
      {data.meaning_en ? (
        <Text style={{ color: Colors.text.primary, marginBottom: Spacing.xs }}>EN: {data.meaning_en}</Text>
      ) : null}
      {data.meaning_ur ? (
        <Text style={{ color: Colors.text.secondary }}>UR: {data.meaning_ur}</Text>
      ) : null}
    </View>
  );
}

function ExampleBlock({ label, data }: { label: string; data?: BilingualWord | null }) {
  if (!data) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: Colors.bg.surface,
        borderRadius: Radii.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
      }}
    >
      <Text style={{ color: Colors.accent.gold, fontWeight: "700", marginBottom: Spacing.sm }}>{label}</Text>
      <WordBlock data={data} />
    </View>
  );
}

export default function LessonPlayScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const user = useAuthStore((state) => state.user);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; totalXp: number; currentStreak: number } | null>(null);

  const preferredLanguage = user?.nativeLanguage === "en" ? "en" : "ur";

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

  async function finishLesson(score: number) {
    if (submitting || completed) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/api/lessons/${lessonId}/complete`, { score });
      const data = response.data.data;
      setCompletionResult({
        xpEarned: data.xpEarned,
        totalXp: data.totalXp,
        currentStreak: data.currentStreak,
      });
      setCompleted(true);
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

  function handleSubmitAnswer() {
    if (!lesson) {
      return;
    }

    if (!selected) {
      setFeedback("Please choose an answer.");
      return;
    }

    const correct = selected === lesson.content.answer;
    setFeedback(correct ? "Mashallah. That's exactly right." : `Not quite - the correct answer is ${lesson.content.answer}.`);
    void finishLesson(correct ? 100 : 50);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl, backgroundColor: Colors.bg.primary }}>
        <Text style={{ color: Colors.text.secondary }}>{error ?? "Lesson not found."}</Text>
      </View>
    );
  }

  const explanation =
    preferredLanguage === "ur"
      ? lesson.content.explanation_ur ?? lesson.content.explanation_en
      : lesson.content.explanation_en ?? lesson.content.explanation_ur;
  const ustadhTip =
    preferredLanguage === "ur"
      ? lesson.content.ustadh_noor_tip_ur ?? lesson.content.ustadh_noor_tip_en
      : lesson.content.ustadh_noor_tip_en ?? lesson.content.ustadh_noor_tip_ur;
  const practiceQuestion =
    preferredLanguage === "ur"
      ? lesson.content.question_ur ?? lesson.content.question
      : lesson.content.question ?? lesson.content.question_ur;
  const focusWord: BilingualWord = {
    arabic: lesson.content.arabic,
    transliteration: lesson.content.transliteration,
    meaning_en: lesson.content.meaning_en,
    meaning_ur: lesson.content.meaning_ur,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl }}>
      <Text
        style={{
          fontSize: FontSizes.h1,
          lineHeight: LineHeights.h1,
          fontWeight: "700",
          color: Colors.text.primary,
          marginBottom: Spacing.sm,
        }}
      >
        {lesson.title}
      </Text>
      {lesson.titleAr ? (
        <ArabicText size="md" style={{ marginBottom: Spacing.sm, color: Colors.accent.gold }}>
          {lesson.titleAr}
        </ArabicText>
      ) : null}
      <Text style={{ color: Colors.accent.gold, marginBottom: Spacing.xl }}>XP reward: {lesson.xpReward}</Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.lg }}>{error}</Text> : null}

      {lesson.content.hook ? (
        <SectionCard title="Hook">
          <WordBlock data={lesson.content.hook} />
        </SectionCard>
      ) : null}

      {(focusWord.arabic || explanation) ? (
        <SectionCard title="Learn">
          <WordBlock data={focusWord} />
          {explanation ? <Text style={{ color: Colors.text.primary, lineHeight: LineHeights.bodyL }}>{explanation}</Text> : null}
        </SectionCard>
      ) : null}

      {(lesson.content.quranic_example || lesson.content.conversation_example) ? (
        <SectionCard title="Examples">
          <ExampleBlock label="Quranic track" data={lesson.content.quranic_example} />
          <ExampleBlock label="Conversation track" data={lesson.content.conversation_example} />
        </SectionCard>
      ) : null}

      {lesson.type === "FLASHCARD" ? (
        <SectionCard title="Practice">
          <View
            style={{
              borderRadius: Radii.xl,
              backgroundColor: flipped ? Colors.bg.primary : Colors.bg.surface,
              padding: Spacing.xl,
              marginBottom: Spacing.md,
              borderWidth: 1,
              borderColor: "rgba(212, 168, 71, 0.4)",
            }}
          >
            {containsArabic(lesson.content.question) ? (
              <ArabicText size="xl" style={{ textAlign: "center", marginBottom: Spacing.xl }}>
                {lesson.content.question ?? ""}
              </ArabicText>
            ) : (
              <Text style={{ fontSize: 40, textAlign: "center", color: Colors.text.primary, marginBottom: Spacing.xl }}>
                {lesson.content.question}
              </Text>
            )}

            {flipped ? (
              containsArabic(lesson.content.answer) ? (
                <ArabicText size="md" style={{ textAlign: "center", color: Colors.text.primary, marginBottom: Spacing.lg }}>
                  {lesson.content.answer ?? ""}
                </ArabicText>
              ) : (
                <Text style={{ fontSize: 18, textAlign: "center", color: Colors.text.primary, marginBottom: Spacing.lg }}>
                  {lesson.content.answer}
                </Text>
              )
            ) : (
              <Text style={{ fontSize: 16, textAlign: "center", color: Colors.text.secondary, marginBottom: Spacing.lg }}>
                Tap to reveal the meaning.
              </Text>
            )}

            <Pressable
              onPress={() => setFlipped((current) => !current)}
              style={({ pressed }) => ({
                backgroundColor: Colors.accent.gold,
                padding: 14,
                borderRadius: Radii.md,
                marginBottom: Spacing.md,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ color: Colors.bg.primary, textAlign: "center", fontWeight: "700" }}>{flipped ? "Hide Answer" : "Reveal Answer"}</Text>
            </Pressable>

            {flipped ? (
              <View>
                <Pressable
                  onPress={() => void finishLesson(100)}
                  style={{ backgroundColor: Colors.accent.teal, padding: 14, borderRadius: Radii.md, marginBottom: Spacing.sm, opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  <Text style={{ color: Colors.text.primary, textAlign: "center", fontWeight: "700" }}>I knew it</Text>
                </Pressable>
                <Pressable
                  onPress={() => void finishLesson(50)}
                  style={{
                    backgroundColor: "rgba(192, 57, 43, 0.15)",
                    borderWidth: 1.5,
                    borderColor: Colors.accent.crimson,
                    padding: 14,
                    borderRadius: Radii.md,
                    opacity: submitting ? 0.7 : 1,
                  }}
                  disabled={submitting}
                >
                  <Text style={{ color: "#E8A09A", textAlign: "center", fontWeight: "700" }}>I forgot</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </SectionCard>
      ) : (
        <SectionCard title="Practice">
          {containsArabic(practiceQuestion) ? (
            <ArabicText size="lg" style={{ marginBottom: Spacing.lg }}>
              {practiceQuestion ?? ""}
            </ArabicText>
          ) : (
            <Text style={{ fontSize: 18, color: Colors.text.primary, marginBottom: Spacing.lg }}>{practiceQuestion}</Text>
          )}

          {(lesson.content.options ?? []).map((option) => (
            <Pressable
              key={option}
              onPress={() => setSelected(option)}
              style={{
                backgroundColor: selected === option ? Colors.accent.gold : Colors.bg.surface,
                padding: 14,
                borderRadius: Radii.md,
                marginBottom: Spacing.md,
                borderWidth: 1,
                borderColor: selected === option ? Colors.accent.gold : Colors.border.subtle,
              }}
            >
              {containsArabic(option) ? (
                <ArabicText size="md" style={{ color: selected === option ? Colors.bg.primary : Colors.text.primary }}>
                  {option}
                </ArabicText>
              ) : (
                <Text style={{ color: selected === option ? Colors.bg.primary : Colors.text.primary }}>{option}</Text>
              )}
            </Pressable>
          ))}

          {feedback ? <Text style={{ marginBottom: Spacing.md, color: Colors.text.primary }}>{feedback}</Text> : null}

          <Pressable onPress={handleSubmitAnswer} style={{ backgroundColor: Colors.accent.gold, padding: 14, borderRadius: Radii.md }} disabled={submitting}>
            <Text style={{ color: Colors.bg.primary, textAlign: "center", fontWeight: "700" }}>{submitting ? "Submitting" : "Submit Answer"}</Text>
          </Pressable>
        </SectionCard>
      )}

      {ustadhTip ? (
        <SectionCard title="Ustadh Noor Tip">
          <Text style={{ color: Colors.text.primary, lineHeight: LineHeights.bodyL }}>{ustadhTip}</Text>
        </SectionCard>
      ) : null}

      {(lesson.content.review_words ?? []).length > 0 ? (
        <SectionCard title="Review Words">
          {(lesson.content.review_words ?? []).map((entry, index) => (
            <View
              key={`${entry.arabic ?? entry.transliteration ?? "word"}-${index}`}
              style={{
                backgroundColor: Colors.bg.surface,
                borderRadius: Radii.lg,
                padding: Spacing.md,
                marginBottom: Spacing.sm,
                borderWidth: 1,
                borderColor: Colors.border.subtle,
              }}
            >
              <WordBlock data={entry} />
            </View>
          ))}
        </SectionCard>
      ) : null}

      {completed ? (
        <View
          style={{
            backgroundColor: Colors.bg.card,
            padding: Spacing.lg,
            borderRadius: Radii.lg,
            borderWidth: 1,
            borderColor: Colors.accent.gold,
            ...Shadows.goldGlow,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.text.primary, marginBottom: Spacing.sm }}>Lesson completed!</Text>
          <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>Mashallah. Your progress has been saved.</Text>
          {completionResult ? (
            <Text style={{ color: Colors.accent.gold }}>
              XP earned: {completionResult.xpEarned} | Total XP: {completionResult.totalXp} | Streak: {completionResult.currentStreak}
            </Text>
          ) : null}
          <Pressable onPress={() => router.back()} style={{ backgroundColor: Colors.accent.gold, padding: 12, borderRadius: Radii.md, marginTop: Spacing.lg }}>
            <Text style={{ color: Colors.bg.primary, textAlign: "center", fontWeight: "700" }}>Back to chapter</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
