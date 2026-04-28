import { Text, StyleSheet, TextStyle } from "react-native";
import type { ReactNode } from "react";

interface ArabicTextProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  style?: TextStyle;
}

export function ArabicText({ children, size = "md", style }: ArabicTextProps) {
  return (
    <Text style={[styles.arabic, styles[size], style, { writingDirection: "rtl", textAlign: "right" }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  arabic: {
    fontFamily: "System",
  },
  sm: { fontSize: 16, lineHeight: 24 },
  md: { fontSize: 20, lineHeight: 28 },
  lg: { fontSize: 26, lineHeight: 36 },
  xl: { fontSize: 32, lineHeight: 44 },
});
