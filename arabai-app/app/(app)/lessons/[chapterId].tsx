import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import api from "../../services/api";
import { ArabicText } from "../../components/ArabicText";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../constants/theme";

export default function ChapterScreen() {
  const router = useRouter();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChapter = useCallback(async () => {
    if (!chapterId) {
      setError("Invalid chapter.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/chapters/${chapterId}/lessons`);
      setChapter(response.data.data.chapter);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("This chapter is still locked. Complete earlier chapters first.");
      } else {
        setError("Unable to load chapter lessons.");
      }
      setChapter(null);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useFocusEffect(
    useCallback(() => {
      void loadChapter();
      return undefined;
    }, [loadChapter])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl, backgroundColor: Colors.bg.primary }}>
        <Text style={{ fontSize: 18, color: Colors.text.secondary }}>{error ?? "Chapter not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, fontWeight: "700", color: Colors.text.primary, marginBottom: Spacing.sm }}>{chapter.title}</Text>
      {chapter.titleAr ? (
        <ArabicText size="md" style={{ marginBottom: Spacing.sm, color: Colors.accent.gold }}>
          {chapter.titleAr}
        </ArabicText>
      ) : null}
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.lg, lineHeight: LineHeights.bodyL }}>{chapter.description}</Text>
      <Text style={{ color: Colors.text.primary, marginBottom: Spacing.lg }}>
        {chapter.completedLessonCount} / {chapter.lessons.length} lessons completed
      </Text>
      <View style={{ height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: Colors.border.subtle, marginBottom: Spacing.xl }}>
        <View
          style={{
            height: "100%",
            width: `${chapter.lessons.length ? (chapter.completedLessonCount / chapter.lessons.length) * 100 : 0}%`,
            backgroundColor: Colors.accent.gold,
          }}
        />
      </View>
      {chapter.lessons.map((lesson: any) => (
        <View key={lesson.id} style={{ marginBottom: Spacing.lg, padding: Spacing.lg, borderRadius: Radii.lg, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: lesson.isCompleted ? Colors.accent.teal : Colors.border.subtle, ...Shadows.card }}>
          <Text style={{ fontSize: FontSizes.h3, lineHeight: LineHeights.h3, fontWeight: "700", color: Colors.text.primary, marginBottom: Spacing.sm }}>{lesson.title}</Text>
          {lesson.titleAr ? (
            <ArabicText size="sm" style={{ marginBottom: Spacing.sm, color: Colors.accent.gold }}>
              {lesson.titleAr}
            </ArabicText>
          ) : null}
          <Text style={{ color: Colors.accent.gold, marginBottom: Spacing.sm }}>XP: {lesson.xpReward}</Text>
          <Text style={{ color: lesson.isCompleted ? Colors.accent.teal : Colors.text.secondary, marginBottom: Spacing.md }}>
            {lesson.isCompleted ? "Completed" : "Not completed"}
          </Text>
          <Pressable
            onPress={() => router.push(`/lessons/${lesson.id}/play`)}
            style={({ pressed }) => ({
              backgroundColor: Colors.accent.gold,
              padding: Spacing.md,
              borderRadius: Radii.md + 2,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text style={{ color: Colors.bg.primary, textAlign: "center", fontWeight: "700" }}>Start Lesson</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
