import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../../services/api";

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
    loadLesson();
  }, [lessonId]);

  async function finishLesson(score: number) {
    setSubmitting(true);
    try {
      await api.post(`/api/lessons/${lessonId}/complete`, { score });
      setCompleted(true);
    } catch (err) {
      setError("Unable to complete lesson. Try again.");
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
    setFeedback(correct ? "Correct!" : `Not quite. The correct answer is ${lesson.content.answer}.`);
    finishLesson(correct ? 100 : 50);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "#6b7280" }}>{error ?? "Lesson not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>{lesson.title}</Text>
      <Text style={{ color: "#6b7280", marginBottom: 24 }}>XP reward: {lesson.xpReward}</Text>
      {lesson.type === "FLASHCARD" ? (
        <View style={{ borderRadius: 18, backgroundColor: "#f8fafc", padding: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 48, textAlign: "center", marginBottom: 24 }}>{lesson.content.question}</Text>
          {flipped ? (
            <Text style={{ fontSize: 20, textAlign: "center", color: "#1f2937", marginBottom: 24 }}>{lesson.content.answer}</Text>
          ) : (
            <Text style={{ fontSize: 16, textAlign: "center", color: "#6b7280", marginBottom: 24 }}>Tap to reveal the meaning.</Text>
          )}
          <Pressable onPress={() => setFlipped(!flipped)} style={{ backgroundColor: "#0f766e", padding: 14, borderRadius: 12, marginBottom: 12 }}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{flipped ? "Hide Answer" : "Reveal Answer"}</Text>
          </Pressable>
          {flipped ? (
            <View>
              <Pressable onPress={() => finishLesson(100)} style={{ backgroundColor: "#16a34a", padding: 14, borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>I knew it</Text>
              </Pressable>
              <Pressable onPress={() => finishLesson(50)} style={{ backgroundColor: "#f59e0b", padding: 14, borderRadius: 12 }}>
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>I forgot</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ backgroundColor: "#f8fafc", padding: 24, borderRadius: 18, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>{lesson.content.question}</Text>
          {lesson.content.options.map((option: string) => (
            <Pressable key={option} onPress={() => setSelected(option)} style={{ backgroundColor: selected === option ? "#0f766e" : "#e5e7eb", padding: 14, borderRadius: 12, marginBottom: 12 }}>
              <Text style={{ color: selected === option ? "white" : "#111827" }}>{option}</Text>
            </Pressable>
          ))}
          {feedback ? <Text style={{ marginBottom: 16, color: "#1f2937" }}>{feedback}</Text> : null}
          <Pressable onPress={handleSubmitAnswer} style={{ backgroundColor: "#0f766e", padding: 14, borderRadius: 12 }} disabled={submitting}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{submitting ? "Submitting" : "Submit Answer"}</Text>
          </Pressable>
        </View>
      )}
      {completed ? (
        <View style={{ backgroundColor: "#d1fae5", padding: 16, borderRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Lesson completed!</Text>
          <Text style={{ color: "#166534" }}>Your progress has been saved.</Text>
          <Pressable onPress={() => router.back()} style={{ backgroundColor: "#0f766e", padding: 12, borderRadius: 12, marginTop: 16 }}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Back to chapter</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
