import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { BrandButton } from "./BrandButton";
import { Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

export type WebChoice<T extends string | number> = {
  value: T;
  label: string;
  description?: string;
  icon?: keyof typeof Feather.glyphMap;
};

export function useWebOnboardingLayout() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 768;
}

export function WebOnboardingChoices<T extends string | number>({
  title,
  body,
  choices,
  selected,
  onSelect,
  onContinue,
  continueLabel,
  secondaryAction,
}: {
  title: string;
  body: string;
  choices: WebChoice<T>[];
  selected: T | null | undefined;
  onSelect: (value: T) => void;
  onContinue: () => void;
  continueLabel: string;
  secondaryAction?: ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>

      <View style={styles.choiceRow} accessibilityRole="radiogroup">
        {choices.map((choice) => {
          const active = selected === choice.value;
          return (
            <Pressable
              key={String(choice.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onSelect(choice.value)}
              style={({ pressed }) => [
                styles.choice,
                active && styles.choiceActive,
                pressed && styles.choicePressed,
              ]}
            >
              <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                <Feather
                  name={choice.icon ?? "book-open"}
                  size={18}
                  color={active ? WarshPalette.gold : WarshPalette.navy}
                />
              </View>
              <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>
                {choice.label}
              </Text>
              {choice.description ? (
                <Text style={[styles.choiceDescription, active && styles.choiceDescriptionActive]}>
                  {choice.description}
                </Text>
              ) : null}
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <View>{secondaryAction}</View>
        <BrandButton
          title={continueLabel}
          onPress={onContinue}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  heading: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    color: WarshPalette.ink,
    fontFamily: "CormorantGaramond-SemiBold",
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
  },
  body: {
    maxWidth: 610,
    marginTop: 8,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  choiceRow: {
    width: "100%",
    flexDirection: "row",
    gap: 14,
  },
  choice: {
    flex: 1,
    minWidth: 0,
    minHeight: 154,
    padding: 18,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.white,
  },
  choiceActive: {
    borderColor: WarshPalette.navy,
    backgroundColor: WarshPalette.navy,
  },
  choicePressed: {
    opacity: 0.84,
  },
  iconBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderRadius: 9,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  iconBoxActive: {
    backgroundColor: "#FFFFFF16",
  },
  choiceLabel: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  choiceLabelActive: {
    color: WarshPalette.white,
  },
  choiceDescription: {
    marginTop: 5,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  choiceDescriptionActive: {
    color: WarshPalette.parchment,
  },
  radio: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WarshPalette.sage,
    borderRadius: 8,
  },
  radioActive: {
    borderColor: WarshPalette.gold,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WarshPalette.gold,
  },
  actions: {
    width: "100%",
    marginTop: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueButton: {
    width: 176,
  },
});
