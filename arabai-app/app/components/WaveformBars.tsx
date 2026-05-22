import { StyleSheet, View } from "react-native";
import { WarshPalette } from "../../constants/theme";

// Decorative static pattern used for original audio display
const STATIC_LEVELS = [0.3, 0.5, 0.8, 0.6, 1.0, 0.7, 0.9, 0.4, 0.8, 0.6, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.5, 0.3, 0.7];

type Props = {
  // Normalized levels 0–1. When omitted, renders the static decorative pattern.
  levels?: number[];
  color?: string;
  barWidth?: number;
  height?: number;
};

export function WaveformBars({ levels = STATIC_LEVELS, color = WarshPalette.ink, barWidth = 3, height = 32 }: Props) {
  return (
    <View style={[styles.container, { height }]}>
      {levels.map((level, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              width: barWidth,
              height: Math.max(3, Math.round(level * height)),
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    overflow: "hidden",
  },
  bar: {
    borderRadius: 2,
  },
});
