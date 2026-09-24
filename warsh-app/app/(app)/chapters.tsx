import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { ScreenHeader } from "@components/ScreenHeader";
import { useTranslationLanguage, pickLocalized } from "@services/language";
import { useT } from "@i18n/index";
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
  titleUr?: string | null;
  titleAr: string;
  description: string;
  descriptionUr?: string | null;
  isLocked: boolean;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  completedLessonCount: number;
  lessons: { id: string }[];
  imageUrl?: string | null;
}

type StatusTone = "done" | "current" | "idle" | "locked";

export default function ChaptersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const language = useTranslationLanguage();
  const t = useT();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const columnCount = desktopWeb ? (width >= 1180 ? 3 : 2) : 1;

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

  // One status per chapter. Placement skips read as "placed out" and hide the
  // 0/N bar, which otherwise looked like an unfinished chapter.
  function chapterStatus(item: Chapter): { label: string; tone: StatusTone } {
    if (item.isLocked) return { label: t("chapter.statusLocked"), tone: "locked" };
    if (item.isCompleted) return { label: t("chapter.completedStatus"), tone: "done" };
    if (item.isSkippedByPlacement) return { label: t("chapter.statusPlacedOut"), tone: "done" };
    if (item.completedLessonCount > 0) return { label: t("chapter.statusInProgress"), tone: "current" };
    return { label: t("chapter.statusNotStarted"), tone: "idle" };
  }

  const renderChapter = ({ item }: { item: Chapter }) => {
    const total = item.lessons.length;
    const done = item.completedLessonCount;
    const progress = total > 0 ? done / total : 0;
    const status = chapterStatus(item);
    const title = pickLocalized(item.title, item.titleUr, language);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("chapter.number", { count: item.order })}, ${title}, ${status.label}`}
        accessibilityState={{ disabled: item.isLocked }}
        disabled={item.isLocked}
        onPress={() => router.push(`/lessons/${item.id}`)}
        style={({ pressed }) => [
          styles.card,
          desktopWeb && styles.webCard,
          item.isLocked && styles.cardLocked,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardTopRow}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.chapterImage}
              contentFit="cover"
              cachePolicy="disk"
              transition={150}
            />
          ) : null}
          <View style={styles.cardTopRowText}>
            <View style={styles.cardHeader}>
              <Text style={styles.chapterNum}>{t("chapter.number", { count: item.order })}</Text>
              <View style={[styles.statusChip, STATUS_CHIP[status.tone]]}>
                {status.tone === "locked" ? <Ionicons name="lock-closed-outline" size={12} color={WarshPalette.subtleBrown} /> : null}
                {status.tone === "done" ? <Ionicons name="checkmark" size={12} color={WarshPalette.sageDeep} /> : null}
                <Text style={[styles.statusText, STATUS_TEXT[status.tone]]}>{status.label}</Text>
              </View>
            </View>
            <Text style={[styles.title, item.isLocked && styles.titleLocked]}>{title}</Text>
          </View>
          {!item.isLocked ? <Ionicons name="chevron-forward" size={20} color={WarshPalette.subtleBrown} /> : null}
        </View>

        {item.titleAr ? (
          <ArabicText size="sm" style={styles.titleAr}>{item.titleAr}</ArabicText>
        ) : null}
        <Text style={styles.description} numberOfLines={2}>{pickLocalized(item.description, item.descriptionUr, language)}</Text>

        {status.tone === "current" || (item.isCompleted && total > 0) ? (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{done}/{total}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: desktopWeb ? 0 : insets.top }]}>
      <ScreenHeader
        title={t("learn.allChapters", { count: chapters.length })}
        showBack={!desktopWeb}
        style={desktopWeb ? styles.webHeader : null}
      />

      {loading ? (
        <ActivityIndicator
          color={WarshPalette.gold}
          style={{ marginTop: Spacing.xl }}
        />
      ) : (
        <FlatList
          key={`chapters-${columnCount}`}
          data={chapters}
          keyExtractor={(item) => item.id}
          renderItem={renderChapter}
          numColumns={columnCount}
          columnWrapperStyle={columnCount > 1 ? styles.webRow : undefined}
          contentContainerStyle={[styles.list, desktopWeb && styles.webList]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  webHeader: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  webList: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingTop: 8,
    gap: 16,
  },
  webRow: {
    gap: 16,
  },
  card: {
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    padding: Spacing.lg,
  },
  webCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.md,
    padding: 20,
  },
  cardLocked: { opacity: 0.65 },
  cardPressed: { backgroundColor: WarshPalette.parchmentSoft },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  chapterImage: {
    width: 56,
    height: 56,
    borderRadius: Radii.md,
  },
  cardTopRowText: { flex: 1 },
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
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    lineHeight: 16,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
    marginBottom: Spacing.xs,
  },
  titleLocked: { color: WarshPalette.subtleBrown },
  titleAr: { color: WarshPalette.goldText, marginBottom: Spacing.xs },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
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
});

const STATUS_CHIP = StyleSheet.create({
  done: { backgroundColor: WarshPalette.correctBg },
  current: { backgroundColor: WarshPalette.highlightBg },
  idle: { backgroundColor: WarshPalette.parchmentSoft },
  locked: { backgroundColor: WarshPalette.parchmentSoft },
});

const STATUS_TEXT = StyleSheet.create({
  done: { color: WarshPalette.sageDeep },
  current: { color: WarshPalette.goldText },
  idle: { color: WarshPalette.bodyBrown },
  locked: { color: WarshPalette.subtleBrown },
});
