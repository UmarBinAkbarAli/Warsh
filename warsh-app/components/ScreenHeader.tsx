import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useT } from "@i18n/index";
import { FontSizes, Fonts, LineHeights, Spacing, WarshPalette } from "../constants/theme";

interface Props {
  title?: string;
  /** Defaults to router.back(), falling back to the Learn tab on a deep link. */
  onBack?: () => void;
  /** Desktop web navigates from the sidebar, so screens may hide Back there. */
  showBack?: boolean;
  /** Optional action on the trailing edge (an icon button, a text link). */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The one header for every stack screen: a 48dp back chevron, then the title
 * on the leading edge. Screens keep their own top safe-area padding.
 */
export function ScreenHeader({ title, onBack, showBack = true, right, style }: Props) {
  const router = useRouter();
  const t = useT();

  function goBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/(tabs)");
  }

  return (
    <View style={[styles.header, !showBack && styles.headerNoBack, style]}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={goBack}
          hitSlop={4}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Ionicons name="chevron-back" size={24} color={WarshPalette.ink} />
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title ?? ""}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.gutter,
  },
  headerNoBack: {
    paddingLeft: Spacing.gutter,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backPressed: {
    backgroundColor: WarshPalette.parchmentSoft,
  },
  title: {
    flex: 1,
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
