import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Fonts, WarshPalette } from "../constants/theme";

export function WebAuthLayout({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;

  if (!desktop) return <>{children}</>;

  return (
    <View style={styles.screen}>
      <View style={styles.brandPanel}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.arabicBrand}>وَرْش</Text>
        <Text style={styles.wordmark}>WARSH</Text>
      </View>
      <View style={styles.formPanel}>
        <View style={styles.formFrame}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: WarshPalette.creamBg,
  },
  brandPanel: {
    width: "39%",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: WarshPalette.navy,
  },
  bismillah: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.arabic,
    fontSize: 17,
  },
  arabicBrand: {
    color: WarshPalette.gold,
    fontFamily: Fonts.arabic,
    fontSize: 56,
    lineHeight: 76,
  },
  wordmark: {
    color: WarshPalette.white,
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 6,
  },
  formPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  formFrame: {
    width: "100%",
    maxWidth: 440,
  },
});
