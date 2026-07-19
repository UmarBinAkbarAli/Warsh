import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { Colors, WarshPalette } from "../constants/theme";

// On web the app renders as a centered phone-width column on a navy
// backdrop instead of stretching mobile layouts across the viewport.
// Native platforms pass through untouched.
//
// WEB_MAX_WIDTH is the single source of truth for the web frame width.
// Screens that size their own content on web must cap to this value (via
// useWindowDimensions the reported width is the full browser viewport, not
// the frame) or their content overflows the column and gets clipped.
export const WEB_MAX_WIDTH = 480;
const MAX_WIDTH = WEB_MAX_WIDTH;

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
    // Safety net: keep any over-wide screen content contained within the
    // column instead of bleeding onto the navy backdrop.
    overflow: "hidden",
  },
});
