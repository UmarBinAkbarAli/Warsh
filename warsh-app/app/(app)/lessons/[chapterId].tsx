import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { useLanguage, pickLocalized } from "@services/language";
import { useT } from "@i18n/index";
import {
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../../constants/theme";

// ─── helpers ──────────────────────────────────────────────────────────────────

function lessonTypeLabel(type: string, t: ReturnType<typeof useT>) {
  switch (type) {
    case "FLASHCARD":
      return t("chapter.typeFlashcards");
    case "FILL_BLANK":
      return t("chapter.typeFillBlank");
    case "MULTIPLE_CHOICE":
      return t("chapter.typeMultipleChoice");
    case "MATCHING":
      return t("chapter.typeMatching");
    case "LISTENING":
      return t("chapter.typeListening");
    case "VOCABULARY":
      return t("chapter.typeVocabulary");
    case "VERB_PATTERN":
      return t("chapter.typeVerbPatterns");
    case "AUDIO_LESSON":
      return t("chapter.typeAudioLesson");
    case "REVIEW":
      return t("chapter.typeReview");
    default:
      return type;
  }
}

function lessonTypeIcon(type: string): React.ComponentProps<typeof Ionicons>["name"] {
  switch (type) {
    case "LISTENING":
    case "AUDIO_LESSON":
      return "headset-outline";
    case "FLASHCARD":
      return "layers-outline";
    case "FILL_BLANK":
    case "MULTIPLE_CHOICE":
      return "create-outline";
    case "MATCHING":
      return "git-compare-outline";
    case "VOCABULARY":
      return "book-outline";
    case "VERB_PATTERN":
      return "code-slash-outline";
    default:
      return "school-outline";
  }
}

// ─── status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ label }: { label: string }) {
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>{label}</Text>
    </View>
  );
}

// ─── lesson preview sheet ─────────────────────────────────────────────────────

function LessonPreviewSheet({
  lesson,
  visible,
  onDismiss,
  onStart,
}: {
  lesson: any;
  visible: boolean;
  onDismiss: () => void;
  onStart: () => void;
}) {
  const insets = useSafeAreaInsets();
  const language = useLanguage();
  const t = useT();
  if (!lesson) return null;

  const ctaLabel =
    lesson.isCompleted || lesson.isSkippedByPlacement ? t("chapter.reviewLesson") : t("chapter.startLesson");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.sheetOverlay} onPress={onDismiss}>
        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.sheetHandle} />

          {/* Lesson type pill */}
          <View style={styles.typePill}>
            <Ionicons name={lessonTypeIcon(lesson.type)} size={14} color={WarshPalette.gold} />
            <Text style={styles.typePillText}>{lessonTypeLabel(lesson.type, t)}</Text>
          </View>

          {/* Titles */}
          {lesson.titleAr ? (
            <ArabicText size="lg" style={styles.sheetTitleAr}>{lesson.titleAr}</ArabicText>
          ) : null}
          <Text style={styles.sheetTitleEn}>{pickLocalized(lesson.title, lesson.titleUr, language)}</Text>

          {/* XP row */}
          <View style={styles.sheetMetaRow}>
            <View style={styles.sheetMetaItem}>
              <Ionicons name="flash-outline" size={16} color={WarshPalette.gold} />
              <Text style={styles.sheetMetaText}>{t("chapter.xp", { count: lesson.xpReward })}</Text>
            </View>
            {lesson.isCompleted ? (
              <View style={styles.sheetMetaItem}>
                <Ionicons name="checkmark-circle" size={16} color={WarshPalette.sage} />
                <Text style={[styles.sheetMetaText, { color: WarshPalette.sage }]}>{t("chapter.completedStatus")}</Text>
              </View>
            ) : lesson.isSkippedByPlacement ? (
              <View style={styles.sheetMetaItem}>
                <Ionicons name="play-skip-forward-outline" size={16} color={WarshPalette.subtleBrown} />
                <Text style={[styles.sheetMetaText, { color: WarshPalette.subtleBrown }]}>{t("chapter.skippedStatus")}</Text>
              </View>
            ) : null}
          </View>

          <BrandButton title={ctaLabel} onPress={onStart} style={{ marginTop: Spacing.lg }} />
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={onDismiss}>
            <Text style={styles.sheetCancelText}>{t("chapter.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function ChapterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const language = useLanguage();
  const t = useT();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const loadChapter = useCallback(async () => {
    if (!chapterId) {
      setError(t("chapter.invalid"));
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
        setError(t("chapter.lockedError"));
      } else {
        setError(t("chapter.loadError"));
      }
      setChapter(null);
    } finally {
      setLoading(false);
    }
  }, [chapterId, t]);

  useFocusEffect(
    useCallback(() => {
      void loadChapter();
      return undefined;
    }, [loadChapter])
  );

  function handleLessonTap(lesson: any) {
    setPreviewLesson(lesson);
    setSheetVisible(true);
  }

  function handleStart() {
    setSheetVisible(false);
    if (previewLesson) {
      router.push(`/lessons/${previewLesson.id}/play`);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorText}>{error ?? t("chapter.notFound")}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
          <Text style={styles.backLink}>‹ {t("common.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressPct = chapter.lessons.length
    ? (chapter.completedLessonCount / chapter.lessons.length) * 100
    : 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ {t("chapter.backChapters")}</Text>
        </TouchableOpacity>

        {chapter.isSkippedByPlacement ? <StatusBadge label={t("chapter.skippedByPlacement")} /> : null}

        <Text style={styles.chapterTitle}>{pickLocalized(chapter.title, chapter.titleUr, language)}</Text>
        {chapter.titleAr ? (
          <ArabicText size="sm" style={styles.chapterTitleAr}>
            {chapter.titleAr}
          </ArabicText>
        ) : null}
        <Text style={styles.chapterDesc}>{pickLocalized(chapter.description, chapter.descriptionUr, language)}</Text>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {t("chapter.lessonsCompleted", { done: chapter.completedLessonCount, total: chapter.lessons.length })}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
        </View>

        {/* Lesson list */}
        <View style={{ marginTop: Spacing.xl }}>
          {chapter.lessons.map((lesson: any, idx: number) => {
            const done = lesson.isCompleted;
            const skipped = lesson.isSkippedByPlacement;
            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, done && styles.lessonCardDone]}
                onPress={() => handleLessonTap(lesson)}
                activeOpacity={0.8}
              >
                {skipped ? <StatusBadge label={t("chapter.skippedByPlacement")} /> : null}
                <View style={styles.lessonCardTop}>
                  <View style={styles.lessonIndex}>
                    <Text style={styles.lessonIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{pickLocalized(lesson.title, lesson.titleUr, language)}</Text>
                    {lesson.titleAr ? (
                      <ArabicText size="sm" style={styles.lessonTitleAr}>
                        {lesson.titleAr}
                      </ArabicText>
                    ) : null}
                    <View style={styles.lessonMeta}>
                      <Ionicons name={lessonTypeIcon(lesson.type)} size={12} color={WarshPalette.gold} />
                      <Text style={styles.lessonMetaText}>{lessonTypeLabel(lesson.type, t)}</Text>
                      <Text style={styles.lessonMetaDot}>·</Text>
                      <Text style={styles.lessonMetaText}>{lesson.xpReward} XP</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={done ? "checkmark-circle" : "chevron-forward"}
                    size={20}
                    color={done ? WarshPalette.sage : WarshPalette.subtleBrown}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <LessonPreviewSheet
        lesson={previewLesson}
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        onStart={handleStart}
      />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl * 3 },

  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary },
  errorScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl, backgroundColor: Colors.bg.primary },
  errorText: { fontSize: FontSizes.bodyL, color: Colors.text.secondary, textAlign: "center" },
  backLink: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL },

  backBtn: { marginBottom: Spacing.lg },
  backBtnText: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.bg.surface,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: Spacing.sm,
  },
  statusBadgeText: { color: Colors.text.secondary, fontFamily: Fonts.regular, fontSize: FontSizes.caption, fontWeight: "700" },

  chapterTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    lineHeight: LineHeights.h1,
    marginBottom: Spacing.xs,
  },
  chapterTitleAr: { color: WarshPalette.gold, marginBottom: Spacing.sm },
  chapterDesc: {
    color: Colors.text.secondary,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    marginBottom: Spacing.lg,
  },

  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  progressLabel: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: WarshPalette.cream },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: WarshPalette.gold },

  lessonCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  lessonCardDone: {
    borderColor: WarshPalette.sage + "55",
    backgroundColor: "#EDF5ED",
  },
  lessonCardTop: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  lessonIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1,
    borderColor: WarshPalette.parchmentCardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonIndexText: { color: WarshPalette.gold, fontFamily: Fonts.display, fontSize: FontSizes.caption, fontWeight: "700" },
  lessonInfo: { flex: 1 },
  lessonTitle: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.bodyL, fontWeight: "700", lineHeight: LineHeights.bodyL },
  lessonTitleAr: { color: WarshPalette.gold, marginTop: 2 },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  lessonMetaText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  lessonMetaDot: { color: WarshPalette.subtleBrown, fontSize: FontSizes.caption },

  // Bottom sheet
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheetContainer: {
    backgroundColor: WarshPalette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: WarshPalette.cream, borderRadius: 2, alignSelf: "center", marginBottom: Spacing.lg },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1,
    borderColor: WarshPalette.gold + "55",
    marginBottom: Spacing.md,
  },
  typePillText: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.caption, fontWeight: "700" },
  sheetTitleAr: { color: WarshPalette.ink, textAlign: "right", marginBottom: Spacing.xs },
  sheetTitleEn: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.h2, fontWeight: "700", lineHeight: LineHeights.h2, marginBottom: Spacing.md },
  sheetMetaRow: { flexDirection: "row", gap: Spacing.lg },
  sheetMetaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  sheetMetaText: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
  sheetCancelBtn: { alignItems: "center", paddingVertical: Spacing.md },
  sheetCancelText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
});
