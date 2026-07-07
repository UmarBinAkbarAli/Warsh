import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { Colors, WarshPalette } from "../constants/theme";

// On web the app renders as a centered phone-width column on a navy
// backdrop instead of stretching mobile layouts across the viewport.
// Native platforms pass through untouched.
const MAX_WIDTH = 480;

export function WebShell({ children }: { children: ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;

  return (
    <View style={styles.backdrop}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    backgroundColor: WarshPalette.navy,
  },
  frame: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_WIDTH,
    backgroundColor: Colors.bg.primary,
    boxShadow: "0 0 48px rgba(0, 0, 0, 0.4)",
  },
});
