import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../services/api";

export default function ChapterScreen() {
  const router = useRouter();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChapter() {
      if (!chapterId) {
        setError("Invalid chapter.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/chapters/${chapterId}/lessons`);
        setChapter(response.data.data.chapter);
      } catch (err) {
        setError("Unable to load chapter lessons.");
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, color: "#6b7280" }}>{error ?? "Chapter not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>{chapter.title}</Text>
      <Text style={{ color: "#6b7280", marginBottom: 24 }}>{chapter.description}</Text>
      {chapter.lessons.map((lesson: any) => (
        <View key={lesson.id} style={{ marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: lesson.isCompleted ? "#dcfce7" : "#f8fafc" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{lesson.title}</Text>
          <Text style={{ color: "#4b5563", marginBottom: 12 }}>XP: {lesson.xpReward}</Text>
          <Text style={{ color: lesson.isCompleted ? "#16a34a" : "#6b7280", marginBottom: 12 }}>
            {lesson.isCompleted ? "Completed" : "Not completed"}
          </Text>
          <Pressable onPress={() => router.push(`/lessons/${lesson.id}/play`)} style={{ backgroundColor: "#0f766e", padding: 12, borderRadius: 12 }}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Start Lesson</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
