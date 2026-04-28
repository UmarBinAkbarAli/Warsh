import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import api from "../../services/api";
import { ArabicText } from "../../components/ArabicText";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/chapters");
      setChapters(response.data.data.chapters);
    } catch (err) {
      setError("Unable to load chapters. Please login or try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadChapters();
      return undefined;
    }, [loadChapters])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl }}>
      <ArabicText size="sm" style={{ textAlign: "center", marginBottom: Spacing.xs }}>
        Ù†ÙÙˆØ±
      </ArabicText>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.h1, lineHeight: LineHeights.h1, fontWeight: "700", marginBottom: Spacing.sm }}>
        Your learning path
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Start with Chapter 1 and unlock each next step by completing the lessons before it.
      </Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.lg }}>{error}</Text> : null}
      {chapters.map((chapter) => (
        <View
          key={chapter.id}
          style={{
            marginBottom: Spacing.lg,
            padding: Spacing.lg,
            borderRadius: Radii.lg,
            backgroundColor: chapter.isLocked ? Colors.bg.surface : Colors.bg.card,
            borderWidth: 1,
            borderColor: chapter.isCompleted ? Colors.accent.gold : Colors.border.subtle,
            opacity: chapter.isLocked ? 0.72 : 1,
            ...Shadows.card,
          }}
        >
          <Text style={{ fontSize: FontSizes.h2, lineHeight: LineHeights.h2, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>{chapter.title}</Text>
          <Text style={{ marginBottom: Spacing.md, color: Colors.text.secondary, lineHeight: LineHeights.bodyL }}>{chapter.description}</Text>
          <Text style={{ marginBottom: Spacing.sm, color: Colors.text.primary }}>
            {chapter.completedLessonCount} / {chapter.lessons.length} lessons completed
          </Text>
          <View style={{ height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: Colors.border.subtle, marginBottom: Spacing.md }}>
            <View
              style={{
                height: "100%",
                width: `${chapter.lessons.length ? (chapter.completedLessonCount / chapter.lessons.length) * 100 : 0}%`,
                backgroundColor: Colors.accent.gold,
              }}
            />
          </View>
          <Text style={{ marginBottom: Spacing.md, color: Colors.text.secondary }}>{chapter.lessons.length} lessons</Text>
          {chapter.isLocked ? (
            <Text style={{ color: Colors.text.muted }}>Locked until all lessons in previous chapters are complete.</Text>
          ) : (
            <Pressable
              onPress={() => router.push(`/lessons/${chapter.id}`)}
              style={({ pressed }) => ({
                backgroundColor: Colors.accent.gold,
                padding: Spacing.md,
                borderRadius: Radii.md + 2,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ color: Colors.bg.primary, textAlign: "center", fontWeight: "700" }}>
                {chapter.isCompleted ? "Review Chapter" : "Open Chapter"}
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
