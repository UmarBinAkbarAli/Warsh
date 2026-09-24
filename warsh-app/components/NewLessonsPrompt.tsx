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

          <View style={[styles.header, rtlRow]}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={20} color={WarshPalette.gold} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, rtlText]} numberOfLines={1}>
                {t("lessonNotice.eyebrow")}
              </Text>
              <Text style={[styles.title, rtlText]}>{t(titleKey, { count })}</Text>
            </View>
          </View>

          <Text style={[styles.body, rtlText]}>{t("lessonNotice.body")}</Text>

          <View style={styles.list}>
            {rows.map((notice) => {
              const isNew = notice.kind === "new";
              return (
                <Pressable
                  key={`${notice.kind}-${notice.lessonId}`}
                  onPress={() => onOpen(notice)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.row, rtlRow, pressed && styles.rowPressed]}
                >
                  <View style={[styles.pill, isNew ? styles.pillNew : styles.pillUpdated]}>
                    <Text style={[styles.pillText, isNew ? styles.pillTextNew : styles.pillTextUpdated]}>
                      {t(isNew ? "lessonNotice.badgeNew" : "lessonNotice.badgeUpdated")}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, rtlText]} numberOfLines={1}>
                      {pickLocalized(notice.lessonTitle, notice.lessonTitleUr, translationLanguage)}
                    </Text>
                    <Text style={[styles.rowMeta, rtlText]} numberOfLines={1}>
                      {`${t("lessonNotice.chapterLabel", { order: notice.chapterOrder })} · ${pickLocalized(
                        notice.chapterTitle,
                        notice.chapterTitleUr,
                        translationLanguage,
                      )}`}
                    </Text>
                  </View>
                  <Ionicons
                    name={isUrdu ? "chevron-back" : "chevron-forward"}
                    size={18}
                    color={Colors.text.muted}
                  />
                </Pressable>
              );
            })}
            {hiddenCount > 0 ? (
              <Text style={[styles.more, rtlText]}>{t("lessonNotice.more", { count: hiddenCount })}</Text>
            ) : null}
          </View>

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
    color: WarshPalette.goldText,
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
  list: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  rowPressed: {
    backgroundColor: WarshPalette.highlightBg,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  pillNew: {
    backgroundColor: WarshPalette.highlightBg,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
  },
  pillUpdated: {
    backgroundColor: WarshPalette.sageTintBg,
  },
  pillText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
  },
  pillTextNew: {
    color: WarshPalette.ink,
  },
  pillTextUpdated: {
    color: WarshPalette.sageDeep,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  rowMeta: {
    color: Colors.text.muted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
  },
  more: {
    color: Colors.text.muted,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    paddingHorizontal: Spacing.xs,
  },
  reassurance: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
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
