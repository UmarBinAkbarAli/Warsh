import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { BrandButton } from "./BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../constants/theme";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Destructive actions get a terracotta confirm; the safe choice stays the primary. */
  destructive?: boolean;
  loading?: boolean;
};

// Branded confirmation in the lesson player's leave-dialog style, used in place
// of the white system dialog (UX evaluation 2026-09-24, findings M6 and L3).
// The safe choice is the navy primary; the action being confirmed sits below it.
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" accessibilityLabel={cancelLabel} />
        <View style={styles.dialog} accessibilityViewIsModal>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <BrandButton title={cancelLabel} onPress={onCancel} style={styles.primary} />
          <BrandButton
            title={confirmLabel}
            onPress={onConfirm}
            loading={loading}
            variant={destructive ? "danger" : "secondary"}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.overlay,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.parchmentBg,
  },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    textAlign: "center",
  },
  body: {
    marginTop: Spacing.sm,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 22,
    textAlign: "center",
  },
  primary: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
});
