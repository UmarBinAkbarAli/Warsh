import type { ComponentProps, ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BrandButton } from "./BrandButton";
import { Colors, FontSizes, Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

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
  /** Icon in the disc above the title: navy disc, or a terracotta tint when destructive. */
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Extra content between the body and the buttons (a note, a link). */
  children?: ReactNode;
};

// Branded confirmation in the lesson player's leave-dialog style, used in place
// of the white system dialog (UX evaluation 2026-09-24, findings M6 and L3).
// The safe choice is the navy primary; the action being confirmed sits below it
// as a text button (Claude Design canvas, Settings › log out / delete account).
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
  icon,
  children,
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
          {icon ? (
            <View style={[styles.icon, destructive && styles.iconDestructive]}>
              <Ionicons name={icon} size={26} color={destructive ? WarshPalette.wrongText : WarshPalette.parchment} />
            </View>
          ) : null}
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          <Text style={styles.body}>{body}</Text>
          {children}
          <BrandButton title={cancelLabel} onPress={onCancel} style={styles.primary} />
          {destructive ? (
            <BrandButton title={confirmLabel} onPress={onConfirm} loading={loading} variant="danger" style={styles.secondary} />
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [styles.textButton, pressed && styles.textButtonPressed]}
            >
              <Text style={styles.textButtonLabel}>{confirmLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: Colors.overlay,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
    paddingTop: 28,
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.lg,
    borderRadius: Radii.xl,
    backgroundColor: WarshPalette.parchmentBg,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.navy,
    marginBottom: Spacing.lg,
  },
  iconDestructive: { backgroundColor: WarshPalette.wrongBg },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    textAlign: "center",
  },
  body: {
    marginTop: Spacing.sm,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  primary: {
    alignSelf: "stretch",
    marginTop: Spacing.gutter,
  },
  secondary: {
    alignSelf: "stretch",
    marginTop: 6,
    minHeight: 48,
  },
  textButton: {
    alignSelf: "stretch",
    minHeight: 48,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
  },
  textButtonPressed: { backgroundColor: WarshPalette.parchmentSoft },
  textButtonLabel: {
    color: WarshPalette.navy,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
  },
});
