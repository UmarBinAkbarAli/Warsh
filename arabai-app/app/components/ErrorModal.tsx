import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandButton } from "@components/BrandButton";
import {
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

type ErrorModalProps = {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
  onDismiss: () => void;
};

export function ErrorModal({ visible, message, onRetry, onDismiss }: ErrorModalProps) {
  const displayMessage =
    message ?? "Unable to load. Please check your connection and try again.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-offline-outline" size={28} color={WarshPalette.gold} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Something went wrong</Text>

          {/* Message */}
          <Text style={styles.message}>{displayMessage}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            {onRetry ? (
              <BrandButton
                title="Retry"
                onPress={onRetry}
                style={styles.retryButton}
              />
            ) : null}
            <Pressable onPress={onDismiss} style={styles.dismissPressable}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: "100%",
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.md,
  },
  iconWrap: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
    lineHeight: LineHeights.h1,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM * 1.5,
    marginBottom: Spacing.sm,
  },
  actions: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  retryButton: {
    width: "100%",
  },
  dismissPressable: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dismissText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
  },
});
