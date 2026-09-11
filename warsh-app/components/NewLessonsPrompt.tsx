import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import type { CourseContinuityBreak } from "@services/courseContinuity";
import { useLanguage } from "@services/language";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../constants/theme";
import { BrandButton } from "./BrandButton";

type NewLessonsPromptProps = {
  visible: boolean;
  info: CourseContinuityBreak;
  chapterTitle: string;
  onResume: () => void;
  onDismiss: () => void;
};

/**
 * Shown when new lessons were published into a chapter the learner had already
 * finished, which re-locks everything after it (see
 * `@services/courseContinuity`). Nothing of theirs was lost, so the sheet leads
 * with that, shows the chapter as one step short, and hands them the lesson
 * that restores the map.
 *
 * Designed in warsh-app-UI-v2.pen — "20 — New Lessons Prompt · Proposed Flow".
 */
export function NewLessonsPrompt({
  visible,
  info,
  chapterTitle,
  onResume,
  onDismiss,
}: NewLessonsPromptProps) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const isUrdu = useLanguage() === "ur";

  const doneCount = Math.max(info.lessonCount - info.newLessonCount, 0);
  const rtlText = isUrdu ? styles.rtlText : null;
  const rtlRow = isUrdu ? styles.rtlRow : null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={[styles.header, rtlRow]}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={20} color={WarshPalette.gold} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, rtlText]} numberOfLines={1}>
                {`${t("continuity.chapterLabel", { order: info.chapterOrder })} · ${chapterTitle}`}
              </Text>
              <Text style={[styles.title, rtlText]}>
                {t(
                  info.newLessonCount === 1
                    ? "continuity.titleSingle"
                    : "continuity.titleMultiple",
                  { count: info.newLessonCount },
                )}
              </Text>
            </View>
          </View>

          <Text style={[styles.body, rtlText]}>{t("continuity.body")}</Text>

          <View style={styles.progress}>
            <View style={[styles.progressLabels, rtlRow]}>
              <Text style={styles.progressLabel}>
                {t("continuity.progressLabel")}
              </Text>
              <Text style={styles.progressCount}>
                {t("continuity.progressCount", {
                  done: doneCount,
                  total: info.lessonCount,
                })}
              </Text>
            </View>
            <View style={[styles.segments, rtlRow]}>
              {Array.from({ length: info.lessonCount }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.segment,
                    index < doneCount ? styles.segmentDone : styles.segmentNew,
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.progressNote, rtlText]}>
              {t(
                info.newLessonCount === 1
                  ? "continuity.progressNoteSingle"
                  : "continuity.progressNoteMultiple",
              )}
            </Text>
          </View>

          <View style={[styles.reassurance, rtlRow]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={WarshPalette.sageDeep}
            />
            <Text style={[styles.reassuranceText, rtlText]}>
              {t("continuity.reassurance", { count: info.chaptersAheadCount })}
            </Text>
          </View>

          <BrandButton title={t("continuity.resume")} onPress={onResume} />

          <Pressable
            onPress={onDismiss}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("continuity.later")}
            style={styles.laterButton}
          >
            <Text style={styles.laterText}>{t("continuity.later")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  sheet: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.sm,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: WarshPalette.white,
  },
  handleArea: {
    alignItems: "center",
    paddingBottom: Spacing.xs,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  badge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.navy,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: WarshPalette.gold,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
  },
  body: {
    color: Colors.text.secondary,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  progress: {
    gap: Spacing.xs,
  },
  progressLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: Colors.text.muted,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 0.6,
  },
  progressCount: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  segments: {
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: Radii.sm,
  },
  segmentDone: {
    backgroundColor: WarshPalette.sage,
  },
  segmentNew: {
    backgroundColor: WarshPalette.highlightBg,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
  },
  progressNote: {
    color: Colors.text.muted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
  },
  reassurance: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: WarshPalette.sageTintBg,
  },
  reassuranceText: {
    flex: 1,
    color: WarshPalette.sageDeep,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  laterButton: {
    alignSelf: "center",
    paddingVertical: Spacing.xs,
  },
  laterText: {
    color: Colors.text.muted,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
});
