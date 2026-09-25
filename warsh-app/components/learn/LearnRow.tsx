import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Fonts,
  FontSizes,
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
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      accessibilityLabel={meta ? `${title}, ${meta}` : title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {leading ??
        (icon ? (
          <Ionicons name={icon} size={20} color={WarshPalette.goldText} />
        ) : null)}
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {trailing}
      <Ionicons
        name={locked ? "lock-closed-outline" : "chevron-forward"}
        size={locked ? 16 : 18}
        color={WarshPalette.subtleBrown}
      />
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
  pressed: { backgroundColor: WarshPalette.highlightBgSoft },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM + 1,
    lineHeight: 20,
  },
  meta: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption + 1,
    lineHeight: 18,
  },
});
