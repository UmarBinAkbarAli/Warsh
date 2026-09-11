import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import type { CourseContinuityBreak } from "@services/courseContinuity";
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
 * `@services/courseContinuity`). Nothing of theirs was lost, so the job here is
 * to say so plainly and hand them the one lesson that restores the map.
 *
 * Design is deliberately provisional — approved for build ahead of the Pen
 * gate so the behaviour could ship; the visual pass is still owed.
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

  const titleKey =
    info.newLessonCount === 1
      ? "continuity.titleSingle"
      : "continuity.titleMultiple";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.handle} />

          <View style={styles.badge}>
            <Ionicons
              name="sparkles"
              size={18}
              color={WarshPalette.white}
            />
          </View>

          <Text style={styles.title}>
            {t(titleKey, { count: info.newLessonCount })}
          </Text>

          <Text style={styles.body}>
            {t("continuity.body", {
              chapter: chapterTitle,
              count: info.newLessonCount,
            })}
          </Text>

          <View style={styles.reassurance}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={WarshPalette.navy}
            />
            <Text style={styles.reassuranceText}>
              {t("continuity.reassurance", {
                count: info.chaptersAheadCount,
              })}
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
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: WarshPalette.parchmentBg,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
  },
  badge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.navy,
  },
  title: {
    color: WarshPalette.navy,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
  },
  body: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  reassurance: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  reassuranceText: {
    flex: 1,
    color: WarshPalette.navy,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  laterButton: {
    alignSelf: "center",
    paddingVertical: Spacing.xs,
  },
  laterText: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
});
