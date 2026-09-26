import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { ScreenHeader } from "@components/ScreenHeader";
import { StatusBarBacking } from "@components/StatusBarBacking";
import { BrandButton } from "@components/BrandButton";
import { useLanguage, useTranslationLanguage, pickLocalized } from "@services/language";
import { useT } from "@i18n/index";
import {
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Spacing,
  WarshAlpha,
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

// The lessons API sends `template`; `type` is a legacy field that is unset.
const TEMPLATE_LABEL_KEYS: Record<string, string> = {
  STANDARD: "chapter.typeLesson",
  REVIEW: "chapter.typeReview",
  VERB_PATTERN: "chapter.typeVerbPatterns",
  SPOKEN_PHRASES: "chapter.typeSpoken",
};

// Android lays a paragraph out right-to-left when its first strong character
// is Arabic; the mark pins mixed titles to the reading language.
function withDirectionMark(text: string, language: string): string {
  return (language === "ur" ? "\u200F" : "\u200E") + text;
}

function lessonKindLabel(lesson: any, t: ReturnType<typeof useT>) {
  if (lesson.isConversationLab) return t("lab.typeLabel");
  if (lesson.type) return lessonTypeLabel(lesson.type, t);
  const key = TEMPLATE_LABEL_KEYS[lesson.template as string];
  return key ? t(key) : "";
}

function lessonKindIcon(lesson: any): React.ComponentProps<typeof Ionicons>["name"] {
  return lesson.isConversationLab ? "chatbubbles-outline" : lessonTypeIcon(lesson.type);
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

function StatusBadge({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <View style={[styles.statusBadge, compact && styles.androidStatusBadge]}>
      <Text style={[styles.statusBadgeText, compact && styles.androidStatusBadgeText]}>{label}</Text>
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
  const language = useTranslationLanguage();
  const t = useT();
  if (!lesson) return null;

  // A lab backfilled as skipped into a finished chapter is still new to the
  // learner: offer to start it, not to review it.
  const isNewLab = (lesson.isConversationLab || lesson.isNew) && !lesson.isCompleted;
  const skipped = lesson.isSkippedByPlacement && !isNewLab;
  const ctaLabel =
    lesson.isCompleted || skipped ? t("chapter.reviewLesson") : t("chapter.startLesson");

  return (
    <Modal statusBarTranslucent navigationBarTranslucent visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.sheetOverlay} onPress={onDismiss}>
        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.sheetHandle} />

          {/* Lesson type pill */}
          <View style={styles.typePill}>
            <Ionicons name={lessonKindIcon(lesson)} size={14} color={WarshPalette.gold} />
            <Text style={styles.typePillText}>{lessonKindLabel(lesson, t)}</Text>
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
            ) : skipped ? (
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
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const androidMinimal = Platform.OS === "android";
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const language = useTranslationLanguage();
  const uiLanguage = useLanguage();
  const isUrduUi = uiLanguage === "ur";
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
    if (lesson.isLocked) return;
    if (lesson.isChapterTest) {
      router.push(`/chapter-test/${lesson.id}`);
      return;
    }
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
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader />
        <View style={styles.errorScreen}>
          <Text style={styles.errorText}>{error ?? t("chapter.notFound")}</Text>
        </View>
      </View>
    );
  }

  const regularLessons = chapter.lessons.filter((lesson: any) => !lesson.isChapterTest);
  const chapterTest = chapter.lessons.find((lesson: any) => lesson.isChapterTest);
  const lessonCount = chapter.lessonCount ?? regularLessons.length;
  const progressPct = lessonCount
    ? (chapter.completedLessonCount / lessonCount) * 100
    : 0;

  const progressCard = (
    <View style={desktopWeb ? styles.progressCard : undefined}>
      {desktopWeb ? <Text style={styles.progressCardTitle}>{t("chapter.chapterProgress")}</Text> : null}
      <View style={desktopWeb ? undefined : styles.progressRow}>
        {desktopWeb ? null : (
          <Text style={styles.progressLabel}>
            {t("chapter.lessonsCompleted", { done: chapter.completedLessonCount, total: lessonCount })}
          </Text>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
      </View>
      {desktopWeb ? (
        <Text style={styles.progressCardLabel}>
          {t("chapter.lessonsCompleted", { done: chapter.completedLessonCount, total: lessonCount })}
        </Text>
      ) : null}
    </View>
  );

  const androidProgress = (
    <View style={styles.androidProgress}>
      <View style={[styles.androidProgressSummary, isUrduUi && styles.androidProgressSummaryRtl]}>
        <Text style={[styles.androidProgressLabel, isUrduUi && styles.androidRtlText]}>
          {t("chapter.lessonsCompletedOf", { done: chapter.completedLessonCount, total: lessonCount })}
        </Text>
        <Text style={styles.androidProgressPercent}>{Math.round(progressPct)}%</Text>
      </View>
      <View style={styles.androidProgressTrack}>
        <View style={[styles.androidProgressFill, { width: `${progressPct}%` as any }]} />
      </View>
    </View>
  );

  // The first lesson that is neither done nor skipped is the one to do next.
  const upNextId = regularLessons.find((lesson: any) => !lesson.isCompleted && !(lesson.isSkippedByPlacement && !lesson.isConversationLab && !lesson.isNew))?.id;

  const lessonList = (
    <View
      style={[
        desktopWeb ? undefined : { marginTop: Spacing.xl },
        androidMinimal && styles.androidLessonListWrap,
      ]}
    >
      <View style={androidMinimal ? styles.androidLessonList : undefined}>
      {regularLessons.map((lesson: any, idx: number) => {
        const done = lesson.isCompleted;
        const upNext = lesson.id === upNextId;
        // A lab that is not completed is shown as new, including for learners
        // whose finished chapter had it backfilled as skipped: "skipped by
        // placement" would be untrue for a lesson that did not exist then.
        // The same holds for any lesson added after the learner finished the
        // chapter (`isNew`, from the server).
        const isNewLab = (lesson.isConversationLab || lesson.isNew) && !done;
        const skipped = lesson.isSkippedByPlacement && !isNewLab;
        const updated = lesson.isUpdated && done;
        return (
          <View key={lesson.id}>
            <TouchableOpacity
              style={[
                styles.lessonCard,
                desktopWeb && styles.webLessonCard,
                !androidMinimal && done && styles.lessonCardDone,
                !androidMinimal && skipped && styles.lessonCardSkipped,
                !androidMinimal && isNewLab && styles.lessonCardNewLab,
                !androidMinimal && upNext && styles.lessonCardUpNext,
                androidMinimal && styles.androidLessonRow,
                androidMinimal && upNext && styles.androidLessonRowUpNext,

              ]}
              onPress={() => handleLessonTap(lesson)}
              activeOpacity={0.8}
            >
              {androidMinimal ? (
                <View style={[styles.androidLessonCardTop, isUrduUi && styles.androidLessonCardTopRtl]}>
                  <View style={[styles.androidLessonIndex, done && styles.androidLessonIndexDone, upNext && styles.androidLessonIndexUpNext]}>
                    {done ? (
                      <Ionicons name="checkmark" size={15} color={WarshPalette.sageDeep} />
                    ) : (
                      <Text style={[styles.androidLessonIndexText, upNext && styles.androidLessonIndexTextUpNext]}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={styles.androidLessonInfo}>
                    <View style={[styles.androidLessonTitleLine, isUrduUi && styles.androidLessonTitleLineRtl]}>
                      <Text
                        style={[styles.androidLessonTitle, upNext && styles.androidLessonTitleUpNext, (isUrduUi || language === "ur") && styles.androidRtlText]}
                        numberOfLines={2}
                      >
                        {withDirectionMark(pickLocalized(lesson.title, lesson.titleUr, language), language)}
                      </Text>
                      {upNext ? <StatusBadge compact label={t("chapter.upNext")} /> : null}
                      {isNewLab ? <StatusBadge compact label={t("lab.newBadge")} /> : null}
                      {updated ? <StatusBadge compact label={t("lessonNotice.badgeUpdated")} /> : null}
                    </View>
                    <Text style={[styles.androidLessonMeta, isUrduUi && styles.androidRtlText]} numberOfLines={1}>
                      {withDirectionMark(
                        `${lessonKindLabel(lesson, t)} · ${
                          done
                            ? "100%"
                            : skipped
                              ? t("chapter.skippedByPlacement")
                              : t("chapter.xp", { count: lesson.xpReward })
                        }`,
                        isUrduUi ? "ur" : "en",
                      )}
                    </Text>
                  </View>
                  <Ionicons
                    name={done ? "checkmark-circle-outline" : isUrduUi ? "chevron-back" : "chevron-forward"}
                    size={18}
                    color={done ? WarshPalette.sageDeep : WarshPalette.subtleBrown}
                  />
                </View>
              ) : (
                <>
                  {upNext ? <StatusBadge label={t("chapter.upNext")} /> : null}
                  {skipped ? <StatusBadge label={t("chapter.skippedByPlacement")} /> : null}
                  {isNewLab ? <StatusBadge label={t("lab.newBadge")} /> : null}
                  {updated ? <StatusBadge label={t("lessonNotice.badgeUpdated")} /> : null}
                  <View style={styles.lessonCardTop}>
                    <View style={[styles.lessonIndex, upNext && styles.lessonIndexUpNext]}>
                      {done ? (
                        <Ionicons name="checkmark" size={14} color={WarshPalette.sage} />
                      ) : (
                        <Text style={[styles.lessonIndexText, upNext && styles.lessonIndexTextUpNext]}>{idx + 1}</Text>
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{pickLocalized(lesson.title, lesson.titleUr, language)}</Text>
                      {lesson.titleAr ? (
                        <ArabicText size="sm" style={styles.lessonTitleAr}>
                          {lesson.titleAr}
                        </ArabicText>
                      ) : null}
                      <View style={styles.lessonMeta}>
                        <Ionicons name={lessonKindIcon(lesson)} size={12} color={WarshPalette.gold} />
                        <Text style={styles.lessonMetaText}>{lessonKindLabel(lesson, t)}</Text>
                        <Text style={styles.lessonMetaDot}>·</Text>
                        <Text style={styles.lessonMetaText}>{t("chapter.xp", { count: lesson.xpReward })}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={done ? "checkmark-circle" : "chevron-forward"}
                      size={20}
                      color={done ? WarshPalette.sage : WarshPalette.subtleBrown}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>
            {androidMinimal && idx < regularLessons.length - 1 ? <View style={styles.androidLessonDivider} /> : null}
          </View>
        );
      })}
      </View>
      {chapterTest ? (
        <TouchableOpacity
          style={[
            styles.chapterTestCard,
            desktopWeb && styles.webLessonCard,
            chapterTest.isLocked && styles.chapterTestCardLocked,
            chapterTest.isCompleted && styles.chapterTestCardCompleted,
            androidMinimal && styles.androidChapterTestCard,
            androidMinimal && chapterTest.isLocked && styles.androidChapterTestCardLocked,
            androidMinimal && chapterTest.isCompleted && styles.androidChapterTestCardCompleted,
            androidMinimal && isUrduUi && styles.androidChapterTestCardRtl,
          ]}
          onPress={() => handleLessonTap(chapterTest)}
          activeOpacity={chapterTest.isLocked ? 1 : 0.8}
          accessibilityState={{ disabled: chapterTest.isLocked }}
        >
          <View style={[
            styles.chapterTestIcon,
            chapterTest.isLocked && styles.chapterTestIconLocked,
            androidMinimal && styles.androidChapterTestIcon,
            androidMinimal && chapterTest.isLocked && styles.androidChapterTestIconLocked,
            androidMinimal && chapterTest.isCompleted && styles.androidChapterTestIconCompleted,
          ]}>
            <Ionicons
              name={chapterTest.isCompleted ? "trophy-outline" : chapterTest.isLocked ? "lock-closed-outline" : "clipboard-outline"}
              size={androidMinimal ? 16 : 20}
              color={chapterTest.isLocked ? WarshPalette.goldText : chapterTest.isCompleted ? WarshPalette.sageDeep : WarshPalette.navy}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[styles.chapterTestTitle, chapterTest.isLocked && styles.chapterTestTextLocked, androidMinimal && styles.androidChapterTestTitle, isUrduUi && styles.androidRtlText]}>
              {androidMinimal
                ? withDirectionMark(pickLocalized(chapterTest.title, chapterTest.titleUr, language), language)
                : pickLocalized(chapterTest.title, chapterTest.titleUr, language)}
            </Text>
            <Text style={[styles.chapterTestMeta, chapterTest.isLocked && styles.chapterTestTextLocked, androidMinimal && styles.androidChapterTestMeta, isUrduUi && styles.androidRtlText]}>
              {chapterTest.isLocked
                ? androidMinimal
                  ? t("learn.chapterTestLockedShort")
                  : t("chapterTest.locked")
                : t("chapterTest.questionsToPass", { count: chapterTest.questionCount, required: chapterTest.requiredCorrect })}
            </Text>
          </View>
          {!chapterTest.isLocked ? (
            <Ionicons
              name={chapterTest.isCompleted ? "checkmark-circle" : isUrduUi ? "chevron-back" : "chevron-forward"}
              size={20}
              color={chapterTest.isCompleted ? WarshPalette.sage : androidMinimal ? WarshPalette.subtleBrown : WarshPalette.white}
            />
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.screen, desktopWeb ? null : { paddingTop: insets.top }]}>
      <ScreenHeader
        title={chapter.order ? t("chapter.number", { count: chapter.order }) : undefined}
        style={desktopWeb ? styles.webHeader : androidMinimal ? styles.androidHeader : null}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          desktopWeb
            ? styles.webContent
            : androidMinimal
              ? styles.androidContent
              : { paddingTop: Spacing.sm },
        ]}
      >
        <View style={[desktopWeb && styles.webMain, androidMinimal && styles.androidMain]}>
          {chapter.isSkippedByPlacement ? <StatusBadge label={t("chapter.skippedByPlacement")} /> : null}

          <Text style={[styles.chapterTitle, androidMinimal && styles.androidChapterTitle, (isUrduUi || language === "ur") && styles.androidRtlText]}>
            {androidMinimal
              ? withDirectionMark(pickLocalized(chapter.title, chapter.titleUr, language), language)
              : pickLocalized(chapter.title, chapter.titleUr, language)}
          </Text>
          {chapter.titleAr ? (
            <ArabicText
              size="sm"
              style={androidMinimal
                ? { ...styles.chapterTitleAr, ...styles.androidChapterTitleAr }
                : styles.chapterTitleAr}
            >
              {chapter.titleAr}
            </ArabicText>
          ) : null}
          <Text style={[styles.chapterDesc, androidMinimal && styles.androidChapterDesc, (isUrduUi || language === "ur") && styles.androidRtlText]}>
            {androidMinimal
              ? withDirectionMark(pickLocalized(chapter.description, chapter.descriptionUr, language), language)
              : pickLocalized(chapter.description, chapter.descriptionUr, language)}
          </Text>

          {desktopWeb ? null : androidMinimal ? androidProgress : progressCard}
          {lessonList}
        </View>

        {desktopWeb ? <View style={styles.webRail}>{progressCard}</View> : null}
      </ScrollView>
      <StatusBarBacking />

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
  webContent: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
    paddingHorizontal: 32,
    paddingTop: 36,
  },
  webMain: { flex: 1, minWidth: 0, maxWidth: 760 },
  webRail: { width: 320, flexShrink: 0 },

  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary },
  errorScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl, backgroundColor: Colors.bg.primary },
  errorText: { fontSize: FontSizes.bodyL, color: Colors.text.secondary, textAlign: "center" },

  webHeader: { width: "100%", maxWidth: 1180, alignSelf: "center", paddingTop: 24 },
  androidHeader: { minHeight: 48 },
  androidContent: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.sm, paddingBottom: Spacing.xl * 3 },
  androidMain: { width: "100%" },
  androidChapterTitle: {
    fontSize: 26,
    lineHeight: 30,
    fontFamily: Fonts.semiBold,
    letterSpacing: -0.2,
    marginBottom: Spacing.xs,
  },
  androidChapterTitleAr: { fontSize: 22, lineHeight: 30, textAlign: "right", marginBottom: Spacing.xs },
  androidChapterDesc: {
    color: WarshPalette.subtleBrown,
    fontSize: FontSizes.bodyM,
    lineHeight: 20,
    marginBottom: 0,
  },
  androidRtlText: { textAlign: "right" },

  androidProgress: { marginTop: Spacing.lg, gap: Spacing.sm },
  androidProgressSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  androidProgressSummaryRtl: { flexDirection: "row-reverse" },
  androidProgressLabel: { color: WarshPalette.bodyBrown, fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 16 },
  androidProgressPercent: { color: WarshPalette.goldText, fontFamily: Fonts.semiBold, fontSize: FontSizes.caption, lineHeight: 16 },
  androidProgressTrack: { height: 4, borderRadius: 2, overflow: "hidden", backgroundColor: WarshPalette.progressTrack },
  androidProgressFill: { height: 4, borderRadius: 2, backgroundColor: WarshPalette.gold },

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
  statusBadgeText: { color: Colors.text.secondary, fontFamily: Fonts.bold, fontSize: FontSizes.caption },
  androidStatusBadge: {
    alignSelf: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    backgroundColor: WarshPalette.parchmentDeep,
    borderWidth: 0,
    marginBottom: 0,
  },
  androidStatusBadgeText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.bold,
    fontSize: 10,
    lineHeight: 13,
    textTransform: "uppercase",
  },

  chapterTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    marginBottom: Spacing.xs,
  },
  chapterTitleAr: { color: WarshPalette.goldText, marginBottom: Spacing.sm },
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
  progressCard: {
    padding: 20,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
    gap: Spacing.sm,
  },
  progressCardTitle: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyL, marginBottom: 4 },
  progressCardLabel: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },

  lessonCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  lessonCardUpNext: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
  },
  lessonCardSkipped: {
    backgroundColor: WarshPalette.parchmentBg,
  },
  lessonIndexUpNext: {
    backgroundColor: WarshPalette.navy,
  },
  lessonIndexTextUpNext: {
    color: WarshPalette.parchment,
  },
  webLessonCard: {
    marginBottom: 12,
    padding: 18,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  lessonCardDone: {
    borderColor: WarshPalette.sage + "55",
    backgroundColor: WarshPalette.sageTintBg,
  },
  lessonCardNewLab: {
    borderColor: WarshPalette.gold,
    borderWidth: 2,
    backgroundColor: WarshAlpha.goldWash,
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
  lessonIndexText: { color: WarshPalette.goldText, fontFamily: Fonts.bold, fontSize: FontSizes.caption, fontVariant: ["lining-nums", "tabular-nums"] },
  lessonInfo: { flex: 1 },
  lessonTitle: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL },
  lessonTitleAr: { color: WarshPalette.goldText, marginTop: 2 },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  lessonMetaText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  lessonMetaDot: { color: WarshPalette.subtleBrown, fontSize: FontSizes.caption },
  androidLessonList: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.md,
    overflow: "hidden",
  },
  androidLessonListWrap: { marginTop: Spacing.lg },
  androidLessonRow: {
    minHeight: 58,
    justifyContent: "center",
    marginBottom: 0,
    padding: Spacing.md,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: WarshPalette.white,
  },
  androidLessonRowUpNext: { backgroundColor: WarshPalette.highlightBg },
  androidLessonCardTop: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  androidLessonCardTopRtl: { flexDirection: "row-reverse" },
  androidLessonIndex: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentDeep,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  androidLessonIndexDone: { backgroundColor: WarshPalette.correctBg },
  androidLessonIndexUpNext: { backgroundColor: WarshPalette.navy },
  androidLessonIndexText: { color: WarshPalette.goldText, fontFamily: Fonts.bold, fontSize: FontSizes.caption, lineHeight: 14, fontVariant: ["lining-nums", "tabular-nums"] },
  androidLessonIndexTextUpNext: { color: WarshPalette.white },
  androidLessonInfo: { flex: 1, minWidth: 0, gap: 2 },
  androidLessonTitleLine: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  androidLessonTitleLineRtl: { flexDirection: "row-reverse" },
  androidLessonTitle: { flex: 1, minWidth: 0, color: WarshPalette.ink, fontFamily: Fonts.medium, fontSize: FontSizes.bodyM, lineHeight: 17 },
  androidLessonTitleUpNext: { fontFamily: Fonts.semiBold },
  androidLessonMeta: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: 15 },
  androidLessonDivider: { height: 1, backgroundColor: WarshPalette.listDivider },
  androidChapterTestCard: {
    minHeight: 58,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    gap: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.parchmentSoft,
  },
  androidChapterTestCardRtl: { flexDirection: "row-reverse" },
  androidChapterTestCardLocked: { backgroundColor: WarshPalette.parchmentSoft, borderWidth: 0 },
  androidChapterTestCardCompleted: { backgroundColor: WarshPalette.correctBg, borderWidth: 0 },
  androidChapterTestIcon: { width: 28, height: 28, borderRadius: Radii.sm, backgroundColor: WarshPalette.parchmentDeep },
  androidChapterTestIconLocked: { backgroundColor: WarshPalette.parchmentDeep },
  androidChapterTestIconCompleted: { backgroundColor: WarshPalette.sageSoft },
  androidChapterTestTitle: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyM, lineHeight: 17 },
  androidChapterTestMeta: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: 15, marginTop: 2 },
  chapterTestCard: {
    minHeight: 76,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.navy,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  chapterTestCardLocked: {
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
  chapterTestCardCompleted: { borderWidth: 1, borderColor: WarshPalette.gold },
  chapterTestIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: WarshPalette.gold, alignItems: "center", justifyContent: "center" },
  chapterTestIconLocked: { backgroundColor: WarshPalette.cream },
  chapterTestTitle: { color: WarshPalette.white, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyL },
  chapterTestMeta: { color: WarshPalette.parchment, fontFamily: Fonts.regular, fontSize: FontSizes.caption, marginTop: 3 },
  chapterTestTextLocked: { color: WarshPalette.disabledText },

  // Bottom sheet
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: WarshAlpha.sheetScrim },
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
  typePillText: { color: WarshPalette.goldText, fontFamily: Fonts.bold, fontSize: FontSizes.caption },
  sheetTitleAr: { color: WarshPalette.ink, textAlign: "right", marginBottom: Spacing.xs },
  sheetTitleEn: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.h2, lineHeight: LineHeights.h2, marginBottom: Spacing.md },
  sheetMetaRow: { flexDirection: "row", gap: Spacing.lg },
  sheetMetaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  sheetMetaText: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
  sheetCancelBtn: { alignItems: "center", paddingVertical: Spacing.md },
  sheetCancelText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
});
