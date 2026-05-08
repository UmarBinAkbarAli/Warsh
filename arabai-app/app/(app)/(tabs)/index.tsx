import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import type { DimensionValue } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../../services/api";
import { ArabicText } from "../../components/ArabicText";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";

const FATIHA_WORDS = [
  { word: "بِسْمِ", threshold: 70 },
  { word: "اللهِ", threshold: 70 },
  { word: "الرَّحْمٰنِ", threshold: 20 },
  { word: "الرَّحِيمِ", threshold: 20 },
  { word: "اَلْحَمْدُ", threshold: 20 },
  { word: "لِلّٰهِ", threshold: 40 },
  { word: "رَبِّ", threshold: 70 },
  { word: "الْعَالَمِينَ", threshold: 20 },
  { word: "الرَّحْمٰنِ", threshold: 20 },
  { word: "الرَّحِيمِ", threshold: 20 },
  { word: "مٰلِكِ", threshold: 70 },
  { word: "يَوْمِ", threshold: 70 },
  { word: "الدِّينِ", threshold: 20 },
  { word: "الصِّرَاطَ", threshold: 20 },
  { word: "الْمُسْتَقِيمَ", threshold: 30 },
];

function ChapterBadge({ label }: { label: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: Colors.bg.surface,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        marginBottom: Spacing.sm,
      }}
    >
      <Text style={{ color: Colors.text.secondary, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chapters, setChapters] = useState<any[]>([]);
  const [fatihaPercent, setFatihaPercent] = useState(0);
  const [fatihaExpanded, setFatihaExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chaptersResponse, progressResponse] = await Promise.all([
        api.get("/api/chapters"),
        api.get("/api/progress"),
      ]);
      setChapters(chaptersResponse.data.data.chapters);
      setFatihaPercent(progressResponse.data.data.fatihaPercent ?? 0);
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

  const fatihaProgressWidth = `${fatihaPercent}%` as DimensionValue;
  const fatihaProgressFillStyle = { width: fatihaProgressWidth };
  const unlockedFatihaWords = FATIHA_WORDS.filter((item) => fatihaPercent >= item.threshold).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl, paddingTop: insets.top + 16 }}>
      <View style={styles.fatihaCard}>
        <Pressable style={styles.fatihaTopRow} onPress={() => setFatihaExpanded((prev) => !prev)}>
          <Text style={styles.fatihaTitle}>Surah Al-Fatiha</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.fatihaPercent}>{fatihaPercent}%</Text>
            <Text style={styles.fatihaChevron}>{fatihaExpanded ? "⌃" : "⌄"}</Text>
          </View>
        </Pressable>

        <View style={styles.fatihaProgressTrack}>
          <View style={[styles.fatihaProgressFill, fatihaProgressFillStyle]} />
        </View>

        {fatihaExpanded ? (
          <>
            <View style={styles.fatihaAyahRow}>
              {FATIHA_WORDS.map((item, index) => (
                <ArabicText
                  key={`${item.word}-${index}`}
                  size="sm"
                  style={StyleSheet.flatten([
                    styles.fatihaWord,
                    fatihaPercent >= item.threshold ? styles.fatihaWordUnlocked : styles.fatihaWordLocked,
                  ])}
                >
                  {item.word}
                </ArabicText>
              ))}
            </View>

            <View style={styles.fatihaBottomRow}>
              <Text style={styles.fatihaHint}>words understood grow as you complete lessons</Text>
              <Text style={styles.fatihaWordCount}>
                {unlockedFatihaWords}/{FATIHA_WORDS.length} words
              </Text>
            </View>
          </>
        ) : null}
      </View>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.h1, lineHeight: LineHeights.h1, fontWeight: "700", marginBottom: Spacing.sm }}>
        Your learning path
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Learn Quranic Arabic — one lesson at a time.
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
          {chapter.isSkippedByPlacement ? <ChapterBadge label="Skipped" /> : null}
          <Text style={{ fontSize: FontSizes.h2, lineHeight: LineHeights.h2, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>{chapter.title}</Text>
          {chapter.titleAr ? (
            <ArabicText size="sm" style={{ marginBottom: Spacing.sm, color: Colors.accent.gold }}>
              {chapter.titleAr}
            </ArabicText>
          ) : null}
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
                {chapter.isCompleted || chapter.isSkippedByPlacement ? "Review Chapter" : "Open Chapter"}
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fatihaCard: {
    padding: Spacing.lg,
    marginBottom: 20,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  fatihaTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fatihaTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h3,
    fontWeight: "500",
    lineHeight: LineHeights.h3,
  },
  fatihaPercent: {
    color: WarshPalette.sage,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h3,
    fontWeight: "500",
    lineHeight: LineHeights.h3,
  },
  fatihaChevron: {
    marginLeft: Spacing.sm,
    color: WarshPalette.subtleBrown,
    fontSize: 16,
    lineHeight: 18,
  },
  fatihaAyahRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: Spacing.md,
  },
  fatihaWord: {
    marginHorizontal: Spacing.xs,
    marginVertical: 2,
    fontSize: 22,
    lineHeight: 32,
    textAlign: "right",
  },
  fatihaWordUnlocked: {
    color: WarshPalette.gold,
  },
  fatihaWordLocked: {
    color: WarshPalette.parchmentCardBorder,
  },
  fatihaProgressTrack: {
    width: "100%",
    height: 4,
    marginTop: Spacing.md,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
  },
  fatihaProgressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: WarshPalette.sage,
  },
  fatihaBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  fatihaHint: {
    flex: 1,
    color: WarshPalette.gold,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    fontStyle: "italic",
    lineHeight: LineHeights.caption,
  },
  fatihaWordCount: {
    color: WarshPalette.sage,
    fontFamily: Fonts.display,
    fontSize: FontSizes.caption,
    fontWeight: "500",
    lineHeight: LineHeights.caption,
  },
});
