import { Text, StyleSheet, TextProps, TextStyle } from "react-native";
import type { ReactNode } from "react";
import { Colors, FontSizes, Fonts, LineHeights } from "../../constants/theme";

interface ArabicTextProps extends TextProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  style?: TextStyle;
}

export function ArabicText({ children, size = "md", style, ...props }: ArabicTextProps) {
  return (
    <Text {...props} style={[styles.arabic, styles[size], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  arabic: {
    fontFamily: Fonts.arabic,
    writingDirection: "rtl",
    textAlign: "right",
    color: Colors.text.arabic,
  },
  sm: { fontSize: FontSizes.arabicS, lineHeight: LineHeights.arabicS },
  md: { fontSize: FontSizes.arabicM, lineHeight: LineHeights.arabicM },
  lg: { fontSize: FontSizes.arabicL, lineHeight: LineHeights.arabicL },
  xl: { fontSize: FontSizes.arabicXL, lineHeight: LineHeights.arabicXL },
});
