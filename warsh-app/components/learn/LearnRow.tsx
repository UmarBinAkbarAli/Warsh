import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

/**
 * A calm white row on the Learn tab (Pen section 31, Rows C and E): leading
 * icon or number, title and one meta line, and a trailing chevron or lock.
 */
export function LearnRow({
  icon,
  leading,
  title,
  meta,
  trailing,
  locked,
  trailingIcon,
  rtl = false,
  compact = false,
  onPress,
}: {
  icon?: IconName;
  /** Replaces the icon, e.g. a chapter number. */
  leading?: ReactNode;
  title: string;
  meta?: string;
  /** Shown before the chevron, e.g. a Surah name in Arabic. */
  trailing?: ReactNode;
  locked?: boolean;
  /** Replaces the default chevron, e.g. the Learn screen's info affordance. */
  trailingIcon?: IconName;
  rtl?: boolean;
  /** Compact treatment for the Android Learn path's secondary rows. */
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      accessibilityLabel={meta ? `${title}, ${meta}` : title}
      style={({ pressed }) => [
        styles.row,
        compact && styles.rowCompact,
        compact && rtl && styles.rowCompactRtl,
        compact && meta && styles.rowCompactWithMeta,
        pressed && styles.pressed,
      ]}
    >
      {leading ??
        (icon ? (
          <View style={[styles.iconWell, compact && styles.iconWellCompact]}>
            <Ionicons name={icon} size={20} color={WarshPalette.goldText} />
          </View>
        ) : null)}
      <View style={styles.copy}>
        <Text
          style={[
            styles.title,
            compact && styles.titleCompact,
            compact && meta && styles.titleCompactWithMeta,
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {meta ? (
          <Text style={[styles.meta, compact && styles.metaCompact]}>{meta}</Text>
        ) : null}
      </View>
      {trailing}
      {compact ? (
        <View style={styles.trailingIconWell}>
          <Ionicons
            name={
              locked
                ? "lock-closed-outline"
                : trailingIcon ?? (rtl ? "chevron-back" : "chevron-forward")
            }
            size={16}
            color={WarshPalette.metaGrey}
          />
        </View>
      ) : (
        <Ionicons
          name={locked ? "lock-closed-outline" : trailingIcon ?? "chevron-forward"}
          size={locked ? 16 : trailingIcon ? 14 : 18}
          color={WarshPalette.subtleBrown}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  rowCompact: {
    minHeight: 44,
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 0,
  },
  rowCompactRtl: { flexDirection: "row-reverse" },
  rowCompactWithMeta: { minHeight: 64 },
  iconWell: { alignItems: "center", justifyContent: "center" },
  iconWellCompact: { width: 40, height: 40 },
  trailingIconWell: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { backgroundColor: WarshPalette.highlightBgSoft },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM + 1,
    lineHeight: 20,
  },
  titleCompact: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM - 1,
    lineHeight: 16,
  },
  titleCompactWithMeta: { fontFamily: Fonts.medium },
  meta: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption + 1,
    lineHeight: 18,
  },
  metaCompact: {
    color: WarshPalette.metaGrey,
    fontSize: FontSizes.label - 1,
    lineHeight: 13,
    marginTop: 1,
  },
});
