import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../constants/theme";

// Solid backing under the top inset for screens whose content scrolls
// edge-to-edge, so cards and chips never run under the clock and status icons
// (UX evaluation 2026-09-24, finding H18). Render it last so it sits on top.
export function StatusBarBacking({ color = Colors.bg.primary }: { color?: string }) {
  const insets = useSafeAreaInsets();
  if (insets.top === 0) return null;
  return <View pointerEvents="none" style={[styles.backing, { height: insets.top, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  backing: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, elevation: 10 },
});
