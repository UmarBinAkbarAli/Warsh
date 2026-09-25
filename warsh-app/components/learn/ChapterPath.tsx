import { ArabicText } from "@components/ArabicText";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import { pickLocalized, type AppLanguage } from "@services/language";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

// How many lessons the Learn tab shows before "Show all" (owner, 2026-09-25).
const COLLAPSED_COUNT = 3;

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

function lessonIcon(lesson: PathLesson): IconName {
  if (lesson.isConversationLab) return "chatbubbles-outline";
  if (lesson.template === "REVIEW") return "refresh-outline";
  if (lesson.template === "VERB_PATTERN") return "git-branch-outline";
  if (lesson.template === "SPOKEN_PHRASES") return "mic-outline";
  return "book-outline";
}

// Base letters of the chapter's Arabic title, drawn faintly in the band.
function bandLetters(titleAr: string) {
  const letters = Array.from(
    learnerArabicTitle(titleAr).replace(/[^ء-ي]/g, ""),
  );
  return Array.from(new Set(letters)).slice(0, 4);
}

const LETTER_SPOTS = [
  { top: -6, right: 58, size: 44 },
  { top: 18, right: 6, size: 40 },
  { top: 54, right: 50, size: 40 },
  { top: 76, right: 2, size: 36 },
];

/**
 * The current chapter on the Learn tab (Pen section 31, Row E): a navy band,
 * then the next three lessons with "Show all" to expand in place. The expanded
 * state is not remembered, so the tab always reopens on the next three.
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

  const regular = chapter.lessons.filter((lesson) => !lesson.isChapterTest);
  const test = chapter.lessons.find((lesson) => lesson.isChapterTest) ?? null;
  const items = test ? [...regular, test] : regular;
  const upNextId = regular.find(isOpen)?.id ?? null;
  const doneCount = regular.filter((lesson) => !isOpen(lesson)).length;

  // Collapsed: the next three items in order, the chapter test included once
  // the lessons run out. A finished chapter shows its last three.
  const startIndex = upNextId
    ? items.findIndex((lesson) => lesson.id === upNextId)
    : Math.max(items.length - COLLAPSED_COUNT, 0);
  const visible = expanded
    ? items
    : items.slice(startIndex, startIndex + COLLAPSED_COUNT);
  const canExpand = items.length > visible.length || expanded;
  const progress = regular.length ? (doneCount / regular.length) * 100 : 0;
  const letters = bandLetters(chapter.titleAr);
  const nextChapterOrder = chapter.order + 1;

  return (
    <View style={styles.section}>
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
          {letters.map((letter, index) => {
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
          {withDirectionMark(pickLocalized(chapter.title, chapter.titleUr, language), language)}
        </Text>
        <View style={styles.bandTrack}>
          <View style={[styles.bandFill, { width: `${progress}%` }]} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.expandedHead}>
          <Text style={styles.expandedTitle}>
            {t("learn.chapterAllLessons", {
              chapter: chapter.order,
              count: items.length,
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

      <View style={styles.rows}>
        {visible.map((lesson) =>
          lesson.isChapterTest ? (
            <TestRow
              key={lesson.id}
              lesson={lesson}
              language={language}
              locked={locked || !!lesson.isLocked}
              nextChapterOrder={nextChapterOrder}
              onPress={() => onOpenLesson(lesson)}
            />
          ) : (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              language={language}
              upNext={lesson.id === upNextId}
              locked={locked}
              onPress={() => onOpenLesson(lesson)}
            />
          ),
        )}
      </View>

      {canExpand && !expanded ? (
        <Pressable
          onPress={() => setExpanded(true)}
          style={styles.showAll}
          hitSlop={6}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>
            {t("learn.showAllLessons", { count: items.length })}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
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
  upNext,
  locked,
  onPress,
}: {
  lesson: PathLesson;
  language: AppLanguage;
  upNext: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  const t = useT();
  const done = lesson.isCompleted;
  const skipped = !done && !isOpen(lesson);
  const finished = done || skipped;
  const percent = done ? 100 : 0;
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
        upNext && styles.rowUpNext,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={upNext ? `${t("chapter.upNext")}: ${title}` : title}
    >
      <View style={[styles.picture, finished && styles.pictureDone]}>
        <Ionicons
          name={lessonIcon(lesson)}
          size={24}
          color={finished ? WarshPalette.sageDeep : WarshPalette.goldText}
        />
      </View>
      <View style={styles.rowCopy}>
        {upNext ? (
          <View style={styles.upNextChip}>
            <Text style={styles.upNextText}>{t("chapter.upNext")}</Text>
          </View>
        ) : null}
        <Text style={styles.rowTitle}>{title}</Text>
        {arabic ? (
          <ArabicText size="sm" style={styles.rowArabic} numberOfLines={2}>
            {arabic}
          </ArabicText>
        ) : null}
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
          <Text style={[styles.percent, done && styles.percentDone]}>
            {skipped ? t("learn.skipped") : `${percent}%`}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.action,
          finished
            ? styles.actionDone
            : upNext
              ? styles.actionUpNext
              : styles.actionOpen,
        ]}
      >
        <Ionicons
          name={
            locked
              ? "lock-closed-outline"
              : finished
                ? "checkmark"
                : "chevron-forward"
          }
          size={18}
          color={
            finished
              ? WarshPalette.sageDeep
              : upNext
                ? WarshPalette.parchment
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
  nextChapterOrder,
  onPress,
}: {
  lesson: PathLesson;
  language: AppLanguage;
  locked: boolean;
  nextChapterOrder: number;
  onPress: () => void;
}) {
  const t = useT();
  const rule =
    lesson.questionCount && lesson.requiredCorrect
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
        styles.testRow,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.medal}>
        <Ionicons
          name={lesson.isCompleted ? "trophy-outline" : "ribbon-outline"}
          size={26}
          color={WarshPalette.navy}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>
          {withDirectionMark(pickLocalized(lesson.title, lesson.titleUr, language), language)}
        </Text>
        <Text style={styles.testRule}>{rule}</Text>
      </View>
      <View
        style={[
          styles.action,
          lesson.isCompleted ? styles.actionDone : styles.actionTest,
        ]}
      >
        <Ionicons
          name={
            lesson.isCompleted
              ? "checkmark"
              : locked
                ? "lock-closed-outline"
                : "chevron-forward"
          }
          size={lesson.isCompleted ? 18 : 16}
          color={
            lesson.isCompleted ? WarshPalette.sageDeep : WarshPalette.goldText
          }
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xl },
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
  bandTrack: {
    height: 6,
    marginTop: 6,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: WarshAlpha.onNavySurface,
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
  rows: { gap: 10 },
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
  rowUpNext: { borderColor: WarshPalette.navy, borderWidth: 1.5 },
  rowPressed: { backgroundColor: WarshPalette.highlightBgSoft },
  picture: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  pictureDone: { backgroundColor: WarshPalette.sageTintBg },
  rowCopy: { flex: 1, minWidth: 0, gap: 4 },
  upNextChip: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  upNextText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  rowTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM + 1,
    lineHeight: 20,
  },
  rowArabic: {
    width: "100%",
    color: WarshPalette.bodyBrown,
    textAlign: "right",
    fontSize: 18,
    lineHeight: 28,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  track: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentDeep,
  },
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
  percentDone: { color: WarshPalette.sageDeep },
  action: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
  },
  actionDone: { backgroundColor: WarshPalette.sageTintBg },
  actionUpNext: { backgroundColor: WarshPalette.navy },
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
  medal: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  testRule: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption + 1,
    lineHeight: 18,
  },
  showAll: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  linkText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
});
