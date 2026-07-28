import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { Shadows, WarshPalette } from "../constants/theme";

type CelebrationEmblemProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  tone?: "light" | "dark";
  size?: "sm" | "lg";
};

export function CelebrationEmblem({
  icon,
  tone = "light",
  size = "lg",
}: CelebrationEmblemProps) {
  const isDark = tone === "dark";
  const dimension = size === "sm" ? 52 : 72;

  return (
    <View
      style={[
        styles.outer,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: isDark
            ? WarshPalette.navyDeep
            : WarshPalette.parchmentSoft,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: dimension - 10,
            height: dimension - 10,
            borderRadius: (dimension - 10) / 2,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={size === "sm" ? 24 : 32}
          color={isDark ? WarshPalette.parchment : WarshPalette.goldDeep}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    ...Shadows.goldGlow,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.parchmentCardBorder,
  },
});
