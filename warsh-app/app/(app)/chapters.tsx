import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import api from "@services/api";
import { ScreenHeader } from "@components/ScreenHeader";
import { useTranslationLanguage, pickLocalized } from "@services/language";
import { useT } from "@i18n/index";
import {
  WarshAlpha,
  WarshPalette,
  Fonts,
  FontSizes,
  Spacing,
  Radii,
} from "../../constants/theme";

interface ChapterLesson {
  id: string;
  isNew?: boolean;
  isUpdated?: boolean;
}

interface Chapter {
  id: string;
  order: number;
  title: string;
  titleUr?: string | null;
  isLocked: boolean;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  completedLessonCount: number;
  lessons: ChapterLesson[];
}

type Tone = "done" | "current" | "idle" | "locked";

const GROUP_SIZE = 10;
const RING_SIZE = 40;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function toneOf(chapter: Chapter): Tone {
  if (chapter.isLocked) return "locked";
  if (chapter.isCompleted || chapter.isSkippedByPlacement) return "done";
  if (chapter.completedLessonCount > 0) return "current";
  return "idle";
}

/**
 * All chapters (Claude Design canvas, "All chapters" — V9): chapters grouped
 * in tens, a progress ring per row, New / Updated badges from the lesson flags
 * on `GET /api/chapters`, and a sheet explaining a locked chapter instead of a
 * dead tap.
 */
export default function ChaptersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const language = useTranslationLanguage();
  const t = useT();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});
  const [lockedChapter, setLockedChapter] = useState<Chapter | null>(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpQuery, setJumpQuery] = useState("");
  const desktopWeb = Platform.OS === "web" && width >= 960;

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

  const sorted = useMemo(() => [...chapters].sort((a, b) => a.order - b.order), [chapters]);
  const doneCount = sorted.filter((c) => toneOf(c) === "done").length;
  const percent = sorted.length > 0 ? Math.round((doneCount / sorted.length) * 100) : 0;
  // The chapter the learner is working towards: the first open one not yet done.
  const focusChapter = sorted.find((c) => !c.isLocked && toneOf(c) !== "done") ?? null;
  const upNextId = focusChapter && toneOf(focusChapter) === "idle" ? focusChapter.id : null;
  const focusGroup = focusChapter ? Math.floor((focusChapter.order - 1) / GROUP_SIZE) : 0;

  const groups = useMemo(() => {
    const byIndex = new Map<number, Chapter[]>();
    for (const chapter of sorted) {
      const index = Math.floor((chapter.order - 1) / GROUP_SIZE);
      byIndex.set(index, [...(byIndex.get(index) ?? []), chapter]);
    }
    return [...byIndex.entries()].sort((a, b) => a[0] - b[0]);
  }, [sorted]);

  function isGroupOpen(index: number) {
    return openGroups[index] ?? index === focusGroup;
  }

  // The chapter that holds a locked one back: the last open chapter before it.
  function blockerOf(chapter: Chapter) {
    return [...sorted].reverse().find((c) => c.order < chapter.order && !c.isLocked) ?? null;
  }

  function openChapter(chapter: Chapter) {
    if (chapter.isLocked) {
      setLockedChapter(chapter);
      return;
    }
    router.push(`/lessons/${chapter.id}`);
  }

  function jumpTo(chapter: Chapter) {
    setJumpOpen(false);
    setJumpQuery("");
    openChapter(chapter);
  }

  function subline(chapter: Chapter): string | null {
    const added = chapter.lessons
      .map((lesson, index) => ({ lesson, number: index + 1 }))
      .filter(({ lesson }) => lesson.isNew);
    if (added.length === 1) return t("chapters.lessonAdded", { count: added[0].number });
    if (added.length > 1) return t("chapters.lessonsAdded", { count: added.length });
    const updated = chapter.lessons.filter((lesson) => lesson.isUpdated).length;
    if (updated === 1) return t("chapters.lessonUpdated");
    if (updated > 1) return t("chapters.lessonsUpdated", { count: updated });
    if (chapter.id === upNextId) return t("chapter.upNext");
    if (chapter.isSkippedByPlacement && !chapter.isCompleted) return t("chapter.statusPlacedOut");
    return null;
  }

  function renderRing(chapter: Chapter, tone: Tone) {
    if (tone === "done") {
      return (
        <View style={styles.doneDisc}>
          <Ionicons name="checkmark" size={18} color={WarshPalette.sageDeep} />
        </View>
      );
    }
    const total = chapter.lessons.length;
    const progress = total > 0 ? chapter.completedLessonCount / total : 0;
    return (
      <View style={styles.ring}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={tone === "locked" ? WarshPalette.lockedRing : WarshPalette.ringTrack}
            strokeWidth={RING_STROKE}
          />
          {progress > 0 ? (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke={WarshPalette.gold}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRCUMFERENCE * progress} ${RING_CIRCUMFERENCE}`}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          ) : null}
        </Svg>
        {tone === "locked" ? (
          <Ionicons name="lock-closed-outline" size={15} color={WarshPalette.lockedText} />
        ) : (
          <Text style={styles.ringNumber}>{chapter.order}</Text>
        )}
      </View>
    );
  }

  function renderRow(chapter: Chapter) {
    const tone = toneOf(chapter);
    const title = pickLocalized(chapter.title, chapter.titleUr, language);
    const hasNew = chapter.lessons.some((lesson) => lesson.isNew);
    const hasUpdated = !hasNew && chapter.lessons.some((lesson) => lesson.isUpdated);
    const line = subline(chapter);
    const total = chapter.lessons.length;

    return (
      <Pressable
        key={chapter.id}
        accessibilityRole="button"
        accessibilityLabel={`${t("chapter.number", { count: chapter.order })}, ${title}${tone === "locked" ? `, ${t("chapter.statusLocked")}` : ""}`}
        onPress={() => openChapter(chapter)}
        style={({ pressed }) => [
          styles.row,
          tone === "locked" && styles.rowLocked,
          pressed && styles.rowPressed,
        ]}
      >
        {renderRing(chapter, tone)}
        <View style={styles.rowText}>
          <View style={styles.rowEyebrow}>
            <Text style={styles.chapterNum}>{t("chapter.number", { count: chapter.order })}</Text>
            {hasNew ? (
              <View style={[styles.badge, styles.badgeNew]}>
                <Text style={[styles.badgeText, styles.badgeNewText]}>{t("chapters.badgeNew")}</Text>
              </View>
            ) : null}
            {hasUpdated ? (
              <View style={[styles.badge, styles.badgeUpdated]}>
                <Text style={[styles.badgeText, styles.badgeUpdatedText]}>{t("chapters.badgeUpdated")}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.title, tone === "locked" && styles.titleLocked]} numberOfLines={1}>
            {title}
          </Text>
          {line ? <Text style={styles.subline}>{line}</Text> : null}
        </View>
        {tone === "current" ? (
          <Text style={styles.count}>{chapter.completedLessonCount}/{total}</Text>
        ) : null}
        {tone !== "locked" ? (
          <Ionicons name="chevron-forward" size={20} color={WarshPalette.subtleBrown} />
        ) : null}
      </Pressable>
    );
  }

  const blocker = lockedChapter ? blockerOf(lockedChapter) : null;
  const jumpNumber = Number.parseInt(jumpQuery, 10);
  const jumpList = Number.isFinite(jumpNumber)
    ? sorted.filter((c) => String(c.order).startsWith(String(jumpNumber)))
    : sorted;

  return (
    <View style={[styles.container, { paddingTop: desktopWeb ? 0 : insets.top }]}>
      <ScreenHeader
        title={t("learn.allChapters", { count: chapters.length })}
        showBack={!desktopWeb}
        style={desktopWeb ? styles.webHeader : null}
        right={
          sorted.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("chapters.jump")}
              onPress={() => setJumpOpen(true)}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            >
              <Text style={styles.jumpGlyph}>#</Text>
            </Pressable>
          ) : null
        }
      />

      {loading ? (
        <ActivityIndicator color={WarshPalette.gold} style={{ marginTop: Spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, desktopWeb && styles.webList]}>
          <View style={styles.overall}>
            <View style={styles.overallRow}>
              <Text style={styles.overallLabel}>
                {t("chapters.overall", { done: doneCount, total: sorted.length })}
              </Text>
              <Text style={styles.overallPercent}>{percent}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${percent}%` as any }]} />
            </View>
          </View>

          {groups.map(([index, members]) => {
            const open = isGroupOpen(index);
            const from = index * GROUP_SIZE + 1;
            const to = from + members.length - 1;
            const groupDone = members.filter((c) => toneOf(c) === "done").length;
            return (
              <View key={index} style={styles.group}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenGroups((prev) => ({ ...prev, [index]: !open }))}
                  style={styles.groupHeader}
                >
                  <Text style={styles.groupTitle}>{t("chapters.groupTitle", { from, to })}</Text>
                  <Text style={styles.groupDone}>
                    {t("chapters.groupDone", { done: groupDone, total: members.length })}
                  </Text>
                  <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={WarshPalette.subtleBrown} />
                </Pressable>
                {open ? <View style={styles.groupRows}>{members.map(renderRow)}</View> : null}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={lockedChapter !== null}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setLockedChapter(null)}
      >
        <Pressable style={styles.scrim} onPress={() => setLockedChapter(null)} accessibilityRole="button" accessibilityLabel={t("common.close")} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xxl }]}>
          <View style={styles.handle} />
          <View style={styles.lockDisc}>
            <Ionicons name="lock-closed-outline" size={26} color={WarshPalette.lockedText} />
          </View>
          <Text style={styles.sheetTitle}>
            {t("chapters.lockedTitle", { count: lockedChapter?.order ?? 0 })}
          </Text>
          {blocker ? (
            <Text style={styles.sheetBody}>{t("chapters.lockedBody", { count: blocker.order })}</Text>
          ) : null}
          {blocker ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setLockedChapter(null);
                router.push(`/lessons/${blocker.id}`);
              }}
              style={({ pressed }) => [styles.sheetCta, pressed && styles.sheetCtaPressed]}
            >
              <Text style={styles.sheetCtaText}>{t("chapters.lockedCta", { count: blocker.order })}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => setLockedChapter(null)} style={styles.sheetSecondary}>
            <Text style={styles.sheetSecondaryText}>{t("chapters.notNow")}</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={jumpOpen}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setJumpOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setJumpOpen(false)} accessibilityRole="button" accessibilityLabel={t("common.close")} />
        <View style={[styles.sheet, styles.jumpSheet, { paddingBottom: insets.bottom + Spacing.xxl }]}>
          <View style={styles.handle} />
          <View style={styles.jumpHeader}>
            <Text style={styles.jumpTitle}>{t("chapters.jump")}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              onPress={() => setJumpOpen(false)}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={22} color={WarshPalette.ink} />
            </Pressable>
          </View>
          <View style={styles.jumpInput}>
            <Ionicons name="search" size={18} color={WarshPalette.subtleBrown} />
            <TextInput
              value={jumpQuery}
              onChangeText={(value) => setJumpQuery(value.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder={t("chapters.jumpPlaceholder", { count: sorted.length })}
              placeholderTextColor={WarshPalette.subtleBrown}
              accessibilityLabel={t("chapters.jump")}
              style={styles.jumpField}
            />
          </View>
          <ScrollView contentContainerStyle={styles.jumpGrid} keyboardShouldPersistTaps="handled">
            {jumpList.map((chapter) => {
              const current = chapter.id === focusChapter?.id;
              return (
                <Pressable
                  key={chapter.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("chapter.number", { count: chapter.order })}${chapter.isLocked ? `, ${t("chapter.statusLocked")}` : ""}`}
                  onPress={() => jumpTo(chapter)}
                  style={[
                    styles.jumpTile,
                    current && styles.jumpTileCurrent,
                    chapter.isLocked && styles.jumpTileLocked,
                  ]}
                >
                  <Text style={[styles.jumpTileText, chapter.isLocked && styles.jumpTileTextLocked]}>
                    {chapter.order}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.jumpHint}>{t("chapters.jumpLockedHint")}</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  webHeader: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  webList: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 32,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
  },
  iconButtonPressed: { backgroundColor: WarshPalette.parchmentBg },
  jumpGlyph: {
    fontFamily: Fonts.semiBold,
    fontSize: 22,
    color: WarshPalette.ink,
  },
  overall: { marginBottom: Spacing.md },
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
  },
  overallLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
  },
  overallPercent: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.goldTextDeep,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.ringTrack,
    overflow: "hidden",
  },
  trackFill: { height: "100%", backgroundColor: WarshPalette.gold },
  group: { marginBottom: Spacing.sm },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.xs,
  },
  groupTitle: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: WarshPalette.ink,
  },
  groupDone: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: WarshPalette.subtleBrown,
  },
  groupRows: { gap: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 68,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  rowLocked: { backgroundColor: WarshPalette.lockedSurface },
  rowPressed: { backgroundColor: WarshPalette.parchmentSoft },
  doneDisc: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: WarshPalette.correctBg,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringNumber: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: WarshPalette.ink,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  chapterNum: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: 18,
    color: WarshPalette.subtleBrown,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: Radii.full,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  badgeNew: { backgroundColor: WarshPalette.highlightBg },
  badgeNewText: { color: WarshPalette.goldTextDeep },
  badgeUpdated: { backgroundColor: WarshPalette.updatedBg },
  badgeUpdatedText: { color: WarshPalette.updatedText },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: WarshPalette.ink,
  },
  titleLocked: { color: WarshPalette.lockedText },
  subline: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: 16,
    color: WarshPalette.subtleBrown,
  },
  count: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.goldInk,
  },
  scrim: { flex: 1, backgroundColor: WarshAlpha.sheetScrim },
  sheet: {
    backgroundColor: WarshPalette.creamBg,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.sheetHandle,
    marginBottom: Spacing.lg,
  },
  lockDisc: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WarshPalette.lockedChip,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    textAlign: "center",
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: WarshPalette.ink,
    marginBottom: Spacing.sm,
  },
  sheetBody: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: WarshPalette.bodyBrown,
    marginBottom: Spacing.gutter,
  },
  sheetCta: {
    minHeight: 52,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCtaPressed: { backgroundColor: WarshPalette.goldDeep },
  sheetCtaText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
  },
  sheetSecondary: {
    minHeight: 48,
    marginTop: Spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSecondaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: WarshPalette.bodyBrown,
  },
  jumpSheet: { maxHeight: "80%" },
  jumpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginRight: -Spacing.md,
  },
  jumpTitle: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    color: WarshPalette.ink,
  },
  jumpInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
    marginBottom: Spacing.lg,
  },
  jumpField: {
    flex: 1,
    minHeight: 48,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: WarshPalette.ink,
  },
  jumpGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  jumpTile: {
    width: "23%",
    flexGrow: 1,
    maxWidth: "24%",
    minHeight: 48,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  jumpTileCurrent: { backgroundColor: WarshPalette.gold, borderColor: WarshPalette.gold },
  jumpTileLocked: { backgroundColor: WarshPalette.lockedChip, borderColor: WarshPalette.lockedChip },
  jumpTileText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
  },
  jumpTileTextLocked: { color: WarshPalette.lockedText },
  jumpHint: {
    marginTop: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: WarshPalette.subtleBrown,
  },
});
