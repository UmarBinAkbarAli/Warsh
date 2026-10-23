import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import { pickLocalized, useLanguage, useTranslationLanguage } from "@services/language";
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

/** One entry of `lessonNotices` from GET /api/chapters. */
export type LessonNotice = {
  kind: "new" | "updated";
  lessonId: string;
  lessonTitle: string;
  lessonTitleUr?: string | null;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  chapterTitleUr?: string | null;
};

type NewLessonsPromptProps = {
  visible: boolean;
  notices: LessonNotice[];
  onOpen: (notice: LessonNotice) => void;
  onDismiss: () => void;
};

const MAX_ROWS = 3;

/**
 * Tells a learner that a lesson was added to a chapter they had already
 * finished, or that a lesson they completed was updated (owner rule,
 * 2026-09-23). It never blocks anything: the server keeps later chapters open
 * (`findLessonsAddedAfterFinish` in warsh-backend/lib/course.ts), so the sheet
 * only invites them to take a look, and Later is as valid as opening it.
 *
 * Designed in warsh-app-UI-v2.pen — "20 — New Lessons Prompt · Proposed Flow"
 * (revised 2026-09-23 as the non-blocking new / updated notice).
 */
export function NewLessonsPrompt({ visible, notices, onOpen, onDismiss }: NewLessonsPromptProps) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const isUrdu = useLanguage() === "ur";
  const translationLanguage = useTranslationLanguage();

  const newCount = notices.filter((notice) => notice.kind === "new").length;
  const updatedCount = notices.length - newCount;
  const titleKey =
    updatedCount === 0
      ? newCount === 1
        ? "lessonNotice.titleNewSingle"
        : "lessonNotice.titleNewMultiple"
      : newCount === 0
        ? updatedCount === 1
          ? "lessonNotice.titleUpdatedSingle"
          : "lessonNotice.titleUpdatedMultiple"
        : "lessonNotice.titleMixed";
  const count = newCount > 0 ? newCount : updatedCount;
  const rows = notices.slice(0, MAX_ROWS);
  const hiddenCount = notices.length - rows.length;
  const rtlText = isUrdu ? styles.rtlText : null;
  const rtlRow = isUrdu ? styles.rtlRow : null;

  if (notices.length === 0) return null;

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
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, rtlText]} numberOfLines={1}>
              {t("lessonNotice.eyebrow")}
            </Text>
            <Text style={[styles.title, rtlText]} accessibilityRole="header">{t(titleKey, { count })}</Text>
          </View>

          <Text style={[styles.body, rtlText]}>{t("lessonNotice.body")}</Text>

          <View style={styles.list}>
            {rows.map((notice, index) => {
              const isNew = notice.kind === "new";
              return (
                <Pressable
                  key={`${notice.kind}-${notice.lessonId}`}
                  onPress={() => onOpen(notice)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.row, index > 0 && styles.rowRule, rtlRow, pressed && styles.rowPressed]}
                >
                  <View style={styles.rowText}>
                    <Text style={[styles.rowMeta, rtlText]} numberOfLines={1}>
                      {t("lessonNotice.chapterLabel", { order: notice.chapterOrder })}
                    </Text>
                    <Text style={[styles.rowTitle, rtlText]} numberOfLines={1}>
                      {pickLocalized(notice.lessonTitle, notice.lessonTitleUr, translationLanguage)}
                    </Text>
                  </View>
                  <View style={[styles.pill, isNew ? styles.pillNew : styles.pillUpdated]}>
                    <Text style={[styles.pillText, isNew ? styles.pillTextNew : styles.pillTextUpdated]}>
                      {t(isNew ? "lessonNotice.badgeNew" : "lessonNotice.badgeUpdated")}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {hiddenCount > 0 ? (
            <Text style={[styles.more, rtlText]}>{t("lessonNotice.more", { count: hiddenCount })}</Text>
          ) : null}

          <View style={[styles.reassurance, rtlRow]}>
            <Ionicons name="lock-open-outline" size={19} color={WarshPalette.sageDeep} />
            <Text style={[styles.reassuranceText, rtlText]}>{t("lessonNotice.reassurance")}</Text>
          </View>

          <BrandButton title={t("lessonNotice.open")} onPress={() => onOpen(notices[0])} />

          <Pressable
            onPress={onDismiss}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("lessonNotice.later")}
            style={styles.laterButton}
          >
            <Text style={styles.laterText}>{t("lessonNotice.later")}</Text>
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
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: WarshPalette.creamBg,
  },
  handleArea: {
    alignItems: "center",
    paddingBottom: Spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchment,
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  headerText: {
    gap: 6,
  },
  eyebrow: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: WarshPalette.navy,
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 32,
  },
  body: {
    marginTop: Spacing.sm,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    marginTop: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
    overflow: "hidden",
  },
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rowRule: {
    borderTopWidth: 1,
    borderTopColor: WarshPalette.cream,
  },
  rowPressed: {
    backgroundColor: WarshPalette.highlightBg,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  pillNew: {
    backgroundColor: WarshPalette.correctBg,
  },
  pillUpdated: {
    backgroundColor: WarshPalette.parchmentDeep,
  },
  pillText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: 16,
  },
  pillTextNew: {
    color: WarshPalette.sageDeep,
  },
  pillTextUpdated: {
    color: WarshPalette.goldText,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  rowMeta: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    lineHeight: 16,
  },
  more: {
    marginTop: Spacing.sm,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  reassurance: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    marginBottom: Spacing.gutter,
    paddingVertical: Spacing.md,
    paddingHorizontal: 14,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.sageTintBg,
  },
  reassuranceText: {
    flex: 1,
    color: WarshPalette.sageDeep,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 20,
  },
  laterButton: {
    minHeight: 48,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  laterText: {
    color: WarshPalette.navy,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
  },
});
