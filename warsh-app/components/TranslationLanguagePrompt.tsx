import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import type { AppLanguage } from "@services/language";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../constants/theme";

type TranslationLanguagePromptProps = {
  visible: boolean;
  current: AppLanguage;
  saving: boolean;
  onSelect: (value: AppLanguage) => void;
  onDismiss: () => void;
};

/**
 * First-time-home-screen nudge: signup only ever sets translationLanguage
 * equal to the chosen app language (LanguageSheet), so this is the only
 * place a user is offered a different meaning language unless they find
 * Settings on their own.
 */
export function TranslationLanguagePrompt({
  visible,
  current,
  saving,
  onSelect,
  onDismiss,
}: TranslationLanguagePromptProps) {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => !saving && onDismiss()}
        />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t("language.chooseMeaning")}</Text>
              <Text style={styles.body}>
                {t("language.meaningDescription")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onDismiss}
              disabled={saving}
              hitSlop={8}
              accessibilityLabel={t("common.close")}
            >
              <Ionicons
                name="close"
                size={20}
                color={WarshPalette.subtleBrown}
              />
            </TouchableOpacity>
          </View>

          {(["ur", "en"] as AppLanguage[]).map((value) => {
            const selected = current === value;
            return (
              <TouchableOpacity
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: saving }}
                disabled={saving}
                activeOpacity={0.8}
                onPress={() => onSelect(value)}
                style={[styles.choice, selected ? styles.choiceSelected : null]}
              >
                <View
                  style={[
                    styles.choiceIcon,
                    selected ? styles.choiceIconSelected : null,
                  ]}
                >
                  <Ionicons
                    name={selected ? "checkmark" : "book-outline"}
                    size={21}
                    color={
                      selected ? WarshPalette.white : WarshPalette.subtleBrown
                    }
                  />
                </View>
                <View style={styles.choiceCopy}>
                  <Text
                    style={[
                      styles.choiceTitle,
                      selected ? styles.choiceTitleSelected : null,
                    ]}
                  >
                    {value === "ur"
                      ? t("language.urdu")
                      : t("language.english")}
                  </Text>
                  <Text
                    style={[
                      styles.choiceBody,
                      selected ? styles.choiceBodySelected : null,
                    ]}
                  >
                    {value === "ur"
                      ? t("language.meaningsUrdu")
                      : t("language.meaningsEnglish")}
                  </Text>
                </View>
                {selected && saving ? (
                  <ActivityIndicator color={WarshPalette.white} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  sheet: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: WarshPalette.parchmentBg,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  title: {
    color: WarshPalette.navy,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
  },
  body: {
    marginTop: Spacing.xs,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  choice: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  choiceSelected: {
    borderColor: WarshPalette.navy,
    backgroundColor: WarshPalette.navy,
  },
  choiceIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sageTintBg,
  },
  choiceIconSelected: { backgroundColor: WarshPalette.gold },
  choiceCopy: { flex: 1 },
  choiceTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
  },
  choiceTitleSelected: { color: WarshPalette.white },
  choiceBody: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    marginTop: 2,
  },
  choiceBodySelected: { color: "rgba(255,255,255,0.7)" },
});
