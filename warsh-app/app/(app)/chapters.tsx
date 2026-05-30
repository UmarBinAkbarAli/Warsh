import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import {
  WarshPalette,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  Radii,
} from "../../constants/theme";

interface Chapter {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  completedLessonCount: number;
  lessons: { id: string }[];
}

export default function ChaptersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api
        .get("/api/chapters")
        .then((res) => setChapters(res.data.data.chapters ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const renderChapter = ({ item }: { item: Chapter }) => {
    const total = item.lessons.length;
    const done = item.completedLessonCount;
    const progress = total > 0 ? done / total : 0;

    return (
      <View
        style={[
          styles.card,
          item.isCompleted && styles.cardCompleted,
          item.isLocked && styles.cardLocked,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.chapterNum}>Chapter {item.order}</Text>
          {item.isCompleted && (
            <Ionicons name="checkmark-circle" size={16} color={WarshPalette.sage} />
          )}
          {item.isLocked && (
            <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.subtleBrown} />
          )}
          {item.isSkippedByPlacement && (
            <Text style={styles.skippedBadge}>Skipped</Text>
          )}
        </View>

        <Text style={[styles.title, item.isLocked && styles.titleLocked]}>{item.title}</Text>
        {item.titleAr ? (
          <ArabicText size="sm" style={styles.titleAr}>{item.titleAr}</ArabicText>
        ) : null}
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{done}/{total}</Text>
        </View>

        {!item.isLocked && (
          <Pressable
            onPress={() => router.push(`/lessons/${item.id}`)}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.ctaText}>
              {item.isCompleted || item.isSkippedByPlacement ? "Review" : "Open"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Chapters</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          color={WarshPalette.gold}
          style={{ marginTop: Spacing.xl }}
        />
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id}
          renderItem={renderChapter}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    padding: Spacing.lg,
  },
  cardCompleted: { borderColor: WarshPalette.sage + "99" },
  cardLocked: { opacity: 0.65 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  chapterNum: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  skippedBadge: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
    marginBottom: Spacing.xs,
  },
  titleLocked: { color: WarshPalette.subtleBrown },
  titleAr: { color: WarshPalette.gold, marginBottom: Spacing.xs },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    marginBottom: Spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: WarshPalette.gold,
  },
  progressLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    minWidth: 32,
    textAlign: "right",
  },
  cta: {
    backgroundColor: WarshPalette.gold,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.white,
  },
});
