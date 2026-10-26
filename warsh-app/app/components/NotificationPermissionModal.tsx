import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@components/BottomSheetModal";
import { BrandButton } from "@components/BrandButton";
import { requestNotificationPermission } from "@services/notifications";
import {
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

type Props = {
  visible: boolean;
  onGranted: () => void;
  onDismiss: () => void;
};

export function NotificationPermissionModal({ visible, onGranted, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  async function handleAllow() {
    await requestNotificationPermission();
    onGranted();
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onDismiss}
      sheetStyle={[styles.sheet, { paddingBottom: Spacing.xxl + insets.bottom }]}
    >
      <View style={styles.content}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Bell icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="notifications-outline" size={36} color={WarshPalette.gold} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Stay on track with Warsh</Text>

          {/* Body */}
          <Text style={styles.body}>
            We'll remind you when it's time for today's lesson. You can change this anytime
            in settings.
          </Text>

          {/* CTA */}
          <BrandButton
            title="Allow notifications"
            onPress={handleAllow}
            style={styles.button}
          />

          {/* Maybe later */}
          <Pressable onPress={onDismiss} style={styles.laterPressable}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: WarshPalette.parchmentBg,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  content: {
    alignItems: "center",
    gap: Spacing.md,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    color: WarshPalette.ink,
    textAlign: "center",
    lineHeight: LineHeights.h1,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM * 1.5,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  button: {
    width: "100%",
  },
  laterPressable: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  laterText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
  },
});
