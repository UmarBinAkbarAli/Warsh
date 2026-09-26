import { ArabicText } from "@components/ArabicText";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import { pickLocalized, type AppLanguage } from "@services/language";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshAlpha,
  WarshPalette,
} from "../../constants/theme";

export type PathLesson = {
  id: string;
  title: string;
  titleUr?: string | null;
  titleAr: string;
  template?: string;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  isChapterTest?: boolean;
  isConversationLab?: boolean;
  isNew?: boolean;
  isLocked?: boolean;
  questionCount?: number | null;
  requiredCorrect?: number | null;
};

export type PathChapter = {
  id: string;
  order: number;
  title: string;
  titleUr?: string | null;
  titleAr: string;
  lessons: PathLesson[];
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// The compact Android path keeps the current lesson in view with two nearby
// lessons for context. Other platforms retain their existing three-item path.
const COLLAPSED_COUNT = 3;
const ANDROID_COLLAPSED_COUNT = 4;

// Authoring codes such as "R15 — " lead some Arabic titles (finding H9).
function learnerArabicTitle(title: string | null | undefined) {
  return (title ?? "").replace(/^[A-Za-z]+\d*\s*[—–-]\s*/, "").trim();
}

// Android lays a paragraph out right-to-left when its first strong character
// is Arabic, and a title that mixes English with Arabic can land either way;
// the mark pins it to the reading language (as in the lesson player).
function withDirectionMark(text: string, language: AppLanguage): string {
  return (language === "ur" ? "‏" : "‎") + text;
}

// A placed-out lesson still counts as open when it is a lab or was added
// after placement — the same rule the chapter screen uses for "Up next".
function isOpen(lesson: PathLesson) {
  return (
    !lesson.isCompleted &&
    !(lesson.isSkippedByPlacement && !lesson.isConversationLab && !lesson.isNew)
  );
}

const LETTER_SPOTS = [
  { top: -6, right: 58, size: 44 },
  { top: 18, right: 6, size: 40 },
  { top: 54, right: 50, size: 40 },
  { top: 76, right: 2, size: 36 },
];

function lessonIcon(lesson: PathLesson): IconName {
  if (lesson.isConversationLab) return "chatbubbles-outline";
  if (lesson.template === "REVIEW") return "refresh-outline";
  if (lesson.template === "VERB_PATTERN") return "git-branch-outline";
  if (lesson.template === "SPOKEN_PHRASES") return "mic-outline";
  return "book-outline";
}

/**
 * Current chapter learning path. Android uses the compact Pen home layout;
 * other platforms retain the existing illustrated band and three-row preview.
 * The expanded state is not remembered, so the tab reopens in its compact state.
 */
export function ChapterPath({
  chapter,
  language,
  locked,
  onOpenChapter,
  onOpenLesson,
}: {
  chapter: PathChapter;
  language: AppLanguage;
  /** Premium is suspended: rows show a lock and the caller routes to billing. */
  locked: boolean;
  onOpenChapter: () => void;
  onOpenLesson: (lesson: PathLesson) => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const compactAndroid = Platform.OS === "android";

  const regular = chapter.lessons.filter((lesson) => !lesson.isChapterTest);
  const test = chapter.lessons.find((lesson) => lesson.isChapterTest) ?? null;
  const items = test ? [...regular, test] : regular;
  const currentLessonIndex = regular.findIndex(isOpen);
  const upNextId = currentLessonIndex >= 0 ? regular[currentLessonIndex].id : null;
  const currentLesson =
    currentLessonIndex >= 0
      ? regular[currentLessonIndex]
      : (regular[regular.length - 1] ?? null);
  const currentPosition =
    currentLessonIndex >= 0 ? currentLessonIndex + 1 : regular.length;
  const doneCount = regular.filter((lesson) => !isOpen(lesson)).length;

  // Keep two completed lessons before the active one for context, followed by
  // the next lesson. If the chapter is finished, show its last four lessons.
  const androidStartIndex = currentLessonIndex >= 0
    ? Math.max(currentLessonIndex - 2, 0)
    : Math.max(regular.length - ANDROID_COLLAPSED_COUNT, 0);
  const androidVisible = expanded
    ? regular
    : regular.slice(androidStartIndex, androidStartIndex + ANDROID_COLLAPSED_COUNT);
  // Other platforms keep the existing three-item path and expansion behavior.
  const startIndex = upNextId
    ? items.findIndex((lesson) => lesson.id === upNextId)
    : Math.max(items.length - COLLAPSED_COUNT, 0);
  const visible = expanded
    ? items
    : compactAndroid
      ? [...androidVisible, ...(test ? [test] : [])]
      : items.slice(startIndex, startIndex + COLLAPSED_COUNT);
  const visibleRegularCount = compactAndroid
    ? androidVisible.length
    : visible.filter((lesson) => !lesson.isChapterTest).length;
  const canExpand = compactAndroid
    ? regular.length > visibleRegularCount || expanded
    : items.length > visible.length || expanded;
  const progress = regular.length ? (doneCount / regular.length) * 100 : 0;
  const nextChapterOrder = chapter.order + 1;

  return (
    <View style={[styles.section, compactAndroid && styles.sectionAndroid]}>
      {compactAndroid ? (
        <View style={[styles.band, styles.bandAndroid]}>
          <Pressable
            onPress={onOpenChapter}
            style={({ pressed }) => [
              styles.bandSummaryAndroid,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={pickLocalized(
              chapter.title,
              chapter.titleUr,
              language,
            )}
          >
            <View style={styles.bandTopAndroid}>
              <Text style={[styles.bandEyebrow, styles.bandEyebrowAndroid]}>
                {t("learn.chapterLesson", {
                  chapter: chapter.order,
                  lesson: currentPosition,
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.bandTitle,
                styles.bandTitleAndroid,
                language === "ur" && styles.bandTitleAndroidRtl,
              ]}
              numberOfLines={2}
            >
              {withDirectionMark(
                pickLocalized(
                  currentLesson?.title ?? chapter.title,
                  currentLesson?.titleUr ?? chapter.titleUr,
                  language,
                ),
                language,
              )}
            </Text>
            <View
              style={[
                styles.bandProgressAndroid,
                language === "ur" && styles.bandProgressAndroidRtl,
              ]}
            >
              <View style={[styles.bandTrack, styles.bandTrackAndroid]}>
                <View
                  style={[
                    styles.bandFill,
                    language === "ur" && styles.bandFillAndroidRtl,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.bandProgressCountAndroid}>
                {t("learn.completedProgressCount", {
                  current: doneCount,
                  total: regular.length,
                })}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() =>
              currentLesson ? onOpenLesson(currentLesson) : onOpenChapter()
            }
            style={({ pressed }) => [
              styles.continueButtonAndroid,
              language === "ur" && styles.continueButtonAndroidRtl,
              pressed && styles.continueButtonPressedAndroid,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("learn.continueLesson")}
          >
            <Text style={styles.continueButtonTextAndroid}>
              {t("learn.continueLesson")}
            </Text>
            <Ionicons
              name={language === "ur" ? "arrow-back" : "arrow-forward"}
              size={18}
              color={WarshPalette.navy}
            />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onOpenChapter}
          style={({ pressed }) => [styles.band, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={pickLocalized(
            chapter.title,
            chapter.titleUr,
            language,
          )}
        >
          <View style={styles.letters} pointerEvents="none">
            {Array.from(
              new Set(learnerArabicTitle(chapter.titleAr).replace(/[^ء-ي]/g, "")),
            )
              .slice(0, 4)
              .map((letter, index) => {
                const spot = LETTER_SPOTS[index];
                return (
                  <View
                    key={`${letter}-${index}`}
                    style={[
                      styles.letterCircle,
                      {
                        top: spot.top,
                        right: spot.right,
                        width: spot.size,
                        height: spot.size,
                      },
                    ]}
                  >
                    <ArabicText size="sm" style={styles.letterText}>
                      {letter}
                    </ArabicText>
                  </View>
                );
              })}
          </View>
        <Text style={styles.bandEyebrow}>
          {t("learn.chapterBandEyebrow", {
            chapter: chapter.order,
            done: doneCount,
            total: regular.length,
          })}
        </Text>
        <Text style={styles.bandTitle} numberOfLines={3}>
          {withDirectionMark(
            pickLocalized(chapter.title, chapter.titleUr, language),
            language,
          )}
        </Text>
        <View style={styles.bandTrack}>
          <View style={[styles.bandFill, { width: `${progress}%` }]} />
        </View>
        </Pressable>
      )}

      {expanded ? (
        <View style={styles.expandedHead}>
          <Text
            style={[styles.expandedTitle, compactAndroid && styles.expandedTitleAndroid]}
          >
            {t("learn.chapterAllLessons", {
              chapter: chapter.order,
              count: compactAndroid ? regular.length : items.length,
            })}
          </Text>
          <Pressable
            onPress={() => setExpanded(false)}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>{t("learn.showLess")}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.rows, compactAndroid && styles.rowsAndroid]}>
        {visible.map((lesson) =>
          lesson.isChapterTest ? (
            <TestRow
              key={lesson.id}
              lesson={lesson}
              language={language}
              locked={locked || !!lesson.isLocked}
              compactAndroid={compactAndroid}
              nextChapterOrder={nextChapterOrder}
              onPress={() => onOpenLesson(lesson)}
            />
          ) : (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              language={language}
              lessonNumber={regular.findIndex((item) => item.id === lesson.id) + 1}
              upNext={lesson.id === upNextId}
              locked={locked}
              compactAndroid={compactAndroid}
              onPress={() => onOpenLesson(lesson)}
            />
          ),
        )}
      </View>

      {canExpand && !expanded ? (
        <Pressable
          onPress={() => setExpanded(true)}
          style={[
            styles.showAll,
            compactAndroid && styles.showAllAndroid,
            compactAndroid && language === "ur" && styles.showAllAndroidRtl,
          ]}
          hitSlop={6}
          accessibilityRole="button"
        >
          <Text style={[styles.linkText, compactAndroid && styles.linkTextAndroid]}>
            {t("learn.showAllLessons", {
              count: compactAndroid ? regular.length : items.length,
            })}
          </Text>
          <Ionicons
            name="chevron-down"
            size={compactAndroid ? 14 : 16}
            color={WarshPalette.goldText}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function LessonRow({
  lesson,
  language,
  lessonNumber,
  upNext,
  locked,
  compactAndroid,
  onPress,
}: {
  lesson: PathLesson;
  language: AppLanguage;
  lessonNumber: number;
  upNext: boolean;
  locked: boolean;
  compactAndroid: boolean;
  onPress: () => void;
}) {
  const t = useT();
  const done = lesson.isCompleted;
  const skipped = !done && !isOpen(lesson);
  const finished = done || skipped;
  const rowLocked = locked || (compactAndroid && !!lesson.isLocked);
  const percent = done ? 100 : 0;
  const showProgress = !compactAndroid || finished;
  const title = withDirectionMark(
    pickLocalized(lesson.title, lesson.titleUr, language),
    language,
  );
  const arabic = learnerArabicTitle(lesson.titleAr);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        compactAndroid && styles.rowAndroid,
        compactAndroid && language === "ur" && styles.rowAndroidRtl,
        upNext && styles.rowUpNext,
        compactAndroid && upNext && styles.rowUpNextAndroid,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={upNext ? `${t("chapter.upNext")}: ${title}` : title}
    >
      <View
        style={[
          styles.picture,
          compactAndroid && styles.pictureAndroid,
          finished && !compactAndroid && styles.pictureDone,
        ]}
      >
        <Ionicons
          name={lessonIcon(lesson)}
          size={compactAndroid ? 20 : 24}
          color={compactAndroid ? WarshPalette.goldText : finished ? WarshPalette.sageDeep : WarshPalette.goldText}
        />
      </View>
      <View style={[styles.rowCopy, compactAndroid && styles.rowCopyAndroid]}>
        {upNext ? (
          <View style={[styles.upNextChip, compactAndroid && styles.upNextChipAndroid]}>
            <Text style={[styles.upNextText, compactAndroid && styles.upNextTextAndroid]}>
              {t("chapter.upNext")}
            </Text>
          </View>
        ) : compactAndroid ? (
          <Text style={styles.lessonNumberAndroid}>
            {t("learn.lessonNumber", { lesson: lessonNumber })}
          </Text>
        ) : null}
        <Text style={[styles.rowTitle, compactAndroid && styles.rowTitleAndroid]}>
          {title}
        </Text>
        {arabic && !compactAndroid ? (
          <ArabicText
            size="sm"
            style={
              compactAndroid
                ? { ...styles.rowArabic, ...styles.rowArabicAndroid }
                : styles.rowArabic
            }
            numberOfLines={2}
          >
            {arabic}
          </ArabicText>
        ) : null}
        {showProgress ? (
          <View style={[styles.progressRow, compactAndroid && styles.progressRowAndroid]}>
            <View style={[styles.track, compactAndroid && styles.trackAndroid]}>
              <View style={[styles.fill, { width: `${percent}%` }]} />
            </View>
            <Text
              style={[
                styles.percent,
                compactAndroid && styles.percentAndroid,
                done && styles.percentDone,
              ]}
            >
              {skipped ? t("learn.skipped") : `${percent}%`}
            </Text>
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.action,
          compactAndroid && styles.actionAndroid,
          finished
            ? styles.actionDone
            : upNext
              ? styles.actionUpNext
              : compactAndroid
                ? styles.actionLockedAndroid
                : styles.actionOpen,
        ]}
      >
        <Ionicons
          name={
            rowLocked
              ? "lock-closed-outline"
              : finished
                ? "checkmark"
                : compactAndroid && upNext
                  ? language === "ur"
                    ? "arrow-back"
                    : "arrow-forward"
                  : compactAndroid && language === "ur"
                    ? "chevron-back"
                    : "chevron-forward"
          }
          size={18}
          color={
            finished
              ? WarshPalette.sageDeep
              : upNext
                ? compactAndroid
                  ? WarshPalette.gold
                  : WarshPalette.parchment
                : compactAndroid
                  ? WarshPalette.metaGrey
                  : WarshPalette.subtleBrown
          }
        />
      </View>
    </Pressable>
  );
}

function TestRow({
  lesson,
  language,
  locked,
  compactAndroid,
  nextChapterOrder,
  onPress,
}: {
  lesson: PathLesson;
  language: AppLanguage;
  locked: boolean;
  compactAndroid: boolean;
  nextChapterOrder: number;
  onPress: () => void;
}) {
  const t = useT();
  const testLocked = locked || !!lesson.isLocked;
  const rule =
    compactAndroid && testLocked && !lesson.isCompleted
      ? t("learn.chapterTestLockedShort")
      : lesson.questionCount && lesson.requiredCorrect
      ? t("learn.testPassRule", {
          required: lesson.requiredCorrect,
          count: lesson.questionCount,
          chapter: nextChapterOrder,
        })
      : t("chapterTest.locked");

  return (
    <Pressable
      onPress={onPress}
      disabled={!!lesson.isLocked}
      accessibilityState={{ disabled: !!lesson.isLocked }}
      style={({ pressed }) => [
        styles.row,
        compactAndroid && styles.rowAndroid,
        compactAndroid && language === "ur" && styles.rowAndroidRtl,
        styles.testRow,
        compactAndroid && styles.testRowAndroid,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.medal, compactAndroid && styles.medalAndroid]}>
        <Ionicons
          name={lesson.isCompleted ? "trophy-outline" : "ribbon-outline"}
          size={compactAndroid ? 20 : 26}
          color={compactAndroid ? WarshPalette.goldText : WarshPalette.navy}
        />
      </View>
      <View style={[styles.rowCopy, compactAndroid && styles.rowCopyAndroid]}>
        {compactAndroid ? (
          <Text style={styles.testEyebrowAndroid}>
            {t("learn.chapterTestLabel")}
          </Text>
        ) : null}
        <Text style={[styles.rowTitle, compactAndroid && styles.rowTitleAndroid]}>
          {withDirectionMark(pickLocalized(lesson.title, lesson.titleUr, language), language)}
        </Text>
        <Text style={[styles.testRule, compactAndroid && styles.testRuleAndroid]}>
          {rule}
        </Text>
      </View>
      <View
        style={[
          styles.action,
          compactAndroid && styles.actionAndroid,
          lesson.isCompleted ? styles.actionDone : styles.actionTest,
          compactAndroid && !lesson.isCompleted && testLocked && styles.actionTestAndroid,
          compactAndroid && !lesson.isCompleted && !testLocked && styles.actionUpNext,
        ]}
      >
        <Ionicons
          name={
            lesson.isCompleted
              ? "checkmark"
              : testLocked
                ? "lock-closed-outline"
                : compactAndroid
                  ? language === "ur"
                    ? "arrow-back"
                    : "arrow-forward"
                  : "chevron-forward"
          }
          size={lesson.isCompleted || (compactAndroid && !testLocked) ? 18 : 16}
          color={
            lesson.isCompleted
              ? WarshPalette.sageDeep
              : compactAndroid && !testLocked
                ? WarshPalette.gold
                : WarshPalette.goldText
          }
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xl },
  sectionAndroid: { marginBottom: Spacing.xl },
  band: {
    overflow: "hidden",
    gap: 6,
    paddingVertical: 18,
    paddingLeft: Spacing.gutter,
    paddingRight: 118,
    borderRadius: Radii.xl,
    backgroundColor: WarshPalette.navy,
    marginBottom: Spacing.md,
  },
  bandAndroid: {
    gap: 14,
    // The shared band reserves paddingRight for its letter art; the compact
    // hero spans the full card, so both sides are set explicitly.
    paddingLeft: Spacing.gutter,
    paddingRight: Spacing.gutter,
    paddingVertical: Spacing.gutter,
    borderRadius: 22,
    marginBottom: Spacing.lg,
  },
  bandTopAndroid: { minHeight: 16, justifyContent: "center" },
  bandSummaryAndroid: { gap: 14 },
  pressed: { opacity: 0.94 },
  letters: { ...StyleSheet.absoluteFillObject },
  letterCircle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshAlpha.onNavySurface,
  },
  letterText: {
    color: WarshPalette.parchment,
    opacity: 0.7,
    fontSize: 18,
    lineHeight: 28,
  },
  bandEyebrow: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bandTitle: {
    color: WarshPalette.white,
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 25,
  },
  bandEyebrowAndroid: {
    color: WarshPalette.heroEyebrow,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption + 1,
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: "none",
  },
  bandTitleAndroid: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 29,
  },
  bandTitleAndroidRtl: { textAlign: "right" },
  bandArabic: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.arabic,
    fontSize: 20,
    lineHeight: 26,
  },
  bandTrack: {
    height: 6,
    marginTop: 6,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: WarshAlpha.onNavySurface,
  },
  bandTrackAndroid: { flex: 1, height: 6, marginTop: 0 },
  bandFillAndroidRtl: { alignSelf: "flex-end" },
  bandProgressAndroid: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  bandProgressAndroidRtl: { flexDirection: "row-reverse" },
  bandProgressCountAndroid: {
    color: WarshPalette.navyMuted,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    lineHeight: 15,
    flexShrink: 0,
  },
  continueButtonAndroid: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  continueButtonAndroidRtl: { flexDirection: "row-reverse" },
  continueButtonPressedAndroid: { opacity: 0.86 },
  continueButtonTextAndroid: {
    color: WarshPalette.navy,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM + 1,
    lineHeight: LineHeights.bodyM,
  },
  bandProgressLabel: {
    color: WarshAlpha.onNavyMuted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
  },
  bandFill: {
    height: "100%",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  expandedHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  expandedTitle: {
    flex: 1,
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h3,
    lineHeight: LineHeights.bodyL,
  },
  expandedTitleAndroid: { fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyM },
  rows: { gap: 10 },
  rowsAndroid: { gap: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  rowAndroid: {
    minHeight: 64,
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 0,
  },
  rowAndroidRtl: { flexDirection: "row-reverse" },
  rowUpNext: { borderColor: WarshPalette.navy, borderWidth: 1.5 },
  rowUpNextAndroid: { borderWidth: 0 },
  rowPressed: { backgroundColor: WarshPalette.highlightBgSoft },
  picture: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  pictureAndroid: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  pictureDone: { backgroundColor: WarshPalette.sageTintBg },
  rowCopy: { flex: 1, minWidth: 0, gap: 4 },
  rowCopyAndroid: { gap: 1 },
  upNextChip: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  upNextChipAndroid: {
    height: 14,
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 0,
    borderRadius: 7,
    backgroundColor: WarshPalette.parchmentSoft,
    marginBottom: 3,
  },
  upNextText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  upNextTextAndroid: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.label - 4,
    lineHeight: 10,
    letterSpacing: 0,
  },
  lessonNumberAndroid: {
    color: WarshPalette.metaGrey,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label - 3,
    lineHeight: 11,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  rowTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM + 1,
    lineHeight: 20,
  },
  rowTitleAndroid: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.bodyM,
    lineHeight: 17,
  },
  rowArabic: {
    width: "100%",
    color: WarshPalette.bodyBrown,
    textAlign: "right",
    fontSize: 18,
    lineHeight: 28,
  },
  rowArabicAndroid: { fontSize: FontSizes.bodyM, lineHeight: 16 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  progressRowAndroid: { gap: Spacing.sm, marginTop: 4 },
  track: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  trackAndroid: { flex: 0, width: 84, height: 4, borderRadius: 2 },
  fill: {
    height: "100%",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sage,
  },
  percent: {
    minWidth: 36,
    textAlign: "right",
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
  },
  percentAndroid: {
    minWidth: 0,
    textAlign: "left",
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label - 2,
    lineHeight: LineHeights.label - 4,
  },
  percentDone: { color: WarshPalette.sageDeep },
  action: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
  },
  actionAndroid: {
    width: 36,
    height: 32,
    borderRadius: Radii.sm,
    borderWidth: 0,
  },
  actionDone: { backgroundColor: WarshPalette.sageTintBg },
  actionUpNext: { backgroundColor: WarshPalette.navy },
  actionLockedAndroid: {
    backgroundColor: WarshPalette.parchmentSoft,
  },
  actionTestAndroid: {
    backgroundColor: WarshPalette.parchmentDeep,
    borderWidth: 0,
  },
  actionOpen: {
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.white,
  },
  actionTest: {
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.white,
  },
  testRow: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentSoft,
  },
  testRowAndroid: {
    borderWidth: 1,
    borderColor: WarshAlpha.goldTextBorder,
    backgroundColor: WarshPalette.parchmentSoft,
  },
  medal: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  medalAndroid: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: "transparent",
  },
  testRule: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption + 1,
    lineHeight: 18,
  },
  testRuleAndroid: {
    color: WarshPalette.metaGrey,
    fontSize: FontSizes.label - 2,
    lineHeight: 12,
    marginTop: 4,
  },
  testEyebrowAndroid: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.medium,
    marginBottom: 2,
    fontSize: FontSizes.label - 3,
    lineHeight: 11,
    textTransform: "uppercase",
  },
  showAll: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  showAllAndroid: {
    minHeight: 15,
    justifyContent: "flex-start",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  showAllAndroidRtl: { flexDirection: "row-reverse" },
  linkText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  linkTextAndroid: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: 15,
  },
});
