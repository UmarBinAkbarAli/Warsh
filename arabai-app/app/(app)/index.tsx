import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import api from "../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChapters() {
      setLoading(true);
      try {
        const response = await api.get("/api/chapters");
        setChapters(response.data.data.chapters);
      } catch (err) {
        setError("Unable to load chapters. Please login or try again.");
      } finally {
        setLoading(false);
      }
    }
    loadChapters();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>World Map</Text>
      <Text style={{ color: "#4b5563", marginBottom: 24 }}>Start with Chapter 1 and unlock Arabic lessons as you progress.</Text>
      {error ? <Text style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</Text> : null}
      {chapters.map((chapter) => (
        <View key={chapter.id} style={{ marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: chapter.isLocked ? "#e5e7eb" : "#f8fafc" }}>
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>{chapter.title}</Text>
          <Text style={{ marginBottom: 12, color: "#6b7280" }}>{chapter.description}</Text>
          <Text style={{ marginBottom: 12 }}>{chapter.lessons.length} lessons</Text>
          {chapter.isLocked ? (
            <Text style={{ color: "#9ca3af" }}>Locked until previous chapter is complete.</Text>
          ) : (
            <Pressable onPress={() => router.push(`/lessons/${chapter.id}`)} style={{ backgroundColor: "#0f766e", padding: 12, borderRadius: 12 }}>
              <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Open Chapter</Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
