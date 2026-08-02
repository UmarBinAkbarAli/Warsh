import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { Colors } from "../constants/theme";

// Desktop web now follows the approved responsive Pen shell. Individual
// screens may use this as their readable content cap; mobile web still follows
// the native responsive layout at the actual viewport width.
export const WEB_MAX_WIDTH = 1180;

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
    backgroundColor: Colors.bg.primary,
  },
  frame: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.bg.primary,
    overflow: "hidden",
  },
});
