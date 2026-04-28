import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../../services/api";
import { ArabicText } from "../../../components/ArabicText";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../../constants/theme";

function containsArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

export default function LessonPlayScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; totalXp: number; currentStreak: number } | null>(null);

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, fontWeight: "700", color: Colors.text.primary, marginBottom: Spacing.sm }}>{lesson.title}</Text>
      <Text style={{ color: Colors.accent.gold, marginBottom: Spacing.xl }}>XP reward: {lesson.xpReward}</Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.lg }}>{error}</Text> : null}

      {lesson.type === "FLASHCARD" ? (
        <View
          style={{
            borderRadius: Radii.xl,
            backgroundColor: flipped ? Colors.bg.primary : Colors.bg.card,
            padding: Spacing.xl,
            marginBottom: Spacing.xl,
            borderWidth: 1,
            borderColor: "rgba(212, 168, 71, 0.4)",
            ...Shadows.card,
          }}
        >
          {containsArabic(lesson.content.question) ? (
            <ArabicText size="xl" style={{ textAlign: "center", marginBottom: Spacing.xl }}>
              {lesson.content.question}
            </ArabicText>
          ) : (
            <Text style={{ fontSize: 48, textAlign: "center", color: Colors.text.primary, marginBottom: Spacing.xl }}>{lesson.content.question}</Text>
          )}

          {flipped ? (
            containsArabic(lesson.content.answer) ? (
              <ArabicText size="md" style={{ textAlign: "center", color: Colors.text.primary, marginBottom: Spacing.xl }}>
                {lesson.content.answer}
              </ArabicText>
            ) : (
              <Text style={{ fontSize: 20, textAlign: "center", color: Colors.text.primary, marginBottom: Spacing.xl }}>{lesson.content.answer}</Text>
            )
          ) : (
            <Text style={{ fontSize: 16, textAlign: "center", color: Colors.text.secondary, marginBottom: Spacing.xl }}>Tap to reveal the meaning.</Text>
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
              <Pressable onPress={() => void finishLesson(100)} style={{ backgroundColor: Colors.accent.teal, padding: 14, borderRadius: Radii.md, marginBottom: Spacing.sm, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
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
      ) : (
        <View
          style={{
            backgroundColor: Colors.bg.card,
            padding: Spacing.xl,
            borderRadius: Radii.xl,
            marginBottom: Spacing.xl,
            borderWidth: 1,
            borderColor: Colors.border.subtle,
            ...Shadows.card,
          }}
        >
          {containsArabic(lesson.content.question) ? (
            <ArabicText size="lg" style={{ marginBottom: Spacing.lg }}>
              {lesson.content.question}
            </ArabicText>
          ) : (
            <Text style={{ fontSize: 18, color: Colors.text.primary, marginBottom: Spacing.lg }}>{lesson.content.question}</Text>
          )}

          {lesson.content.options.map((option: string) => (
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
        </View>
      )}

      {completed ? (
        <View style={{ backgroundColor: Colors.bg.card, padding: Spacing.lg, borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.accent.gold, ...Shadows.goldGlow }}>
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
