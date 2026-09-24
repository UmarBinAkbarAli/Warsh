import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useT } from "@i18n/index";
import { getStreakWeek } from "@services/streakWeek";
import { FontSizes, Fonts, Spacing, WarshPalette } from "../constants/theme";

interface Props {
  streak: number;
  lastActiveDate: Date | string | null;
}

/** Monday–Sunday row of the current streak. Shared by the lesson completion
 *  screen and Streak detail so both always show the same days. */
export function StreakWeekRow({ streak, lastActiveDate }: Props) {
  const t = useT();
  const { done, todayIndex } = getStreakWeek(streak, lastActiveDate);

  return (
    <View style={styles.row}>
      {done.map((isDone, index) => {
        const isToday = index === todayIndex;
        const label = t(`streak.weekday.${index}`);
        return (
          <View
            key={index}
            style={styles.col}
            accessible
            accessibilityLabel={`${label}${isDone ? `, ${t("streak.dayDone")}` : ""}`}
          >
            <View style={[styles.circle, isDone ? styles.circleDone : null, isToday && !isDone ? styles.circleToday : null]}>
              {isDone ? <Ionicons name="checkmark" size={16} color={WarshPalette.parchment} /> : <View style={styles.dot} />}
            </View>
            <Text style={[styles.label, isToday ? styles.labelToday : null]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    minWidth: 36,
    alignItems: "center",
    gap: Spacing.xs,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.parchmentSoft,
  },
  circleDone: {
    backgroundColor: WarshPalette.navy,
  },
  circleToday: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.sageSoft,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },
  labelToday: {
    fontFamily: Fonts.semiBold,
    color: WarshPalette.ink,
  },
});
