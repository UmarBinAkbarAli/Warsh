import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { BrandButton } from "@components/BrandButton";

const CHANNELS = [
  "Online Advertisement",
  "Social Media (Instagram / TikTok / X)",
  "YouTube",
  "Friend or Family",
  "Podcast or Radio",
  "Search Engine (Google, etc.)",
  "Islamic Centre or Masjid",
  "Influencer or Scholar",
  "News or Blog Post",
  "Word of Mouth",
];

export default function AttributionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(channel: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) {
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  }

  function handleContinue() {
    // Attribution data can be sent to analytics here in the future
    router.push("/(auth)/auth-options");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      {/* Noor bubble */}
      <View style={styles.noorRow}>
        <View style={styles.noorAvatar}>
          <Text style={styles.noorAvatarText}>ن</Text>
        </View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>How did you hear about Warsh?</Text>
        </View>
      </View>

      <Text style={styles.hint}>Select all that apply</Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {CHANNELS.map((channel) => {
          const isSelected = selected.has(channel);
          return (
            <TouchableOpacity
              key={channel}
              style={[styles.option, isSelected ? styles.optionSelected : null]}
              onPress={() => toggle(channel)}
              activeOpacity={0.75}
            >
              <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>
                {channel}
              </Text>
              {isSelected ? (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BrandButton
        title="Continue"
        onPress={handleContinue}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xl,
  },
  noorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  noorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  noorAvatarText: {
    color: WarshPalette.gold,
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: "700",
  },
  bubble: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.lg,
    borderTopLeftRadius: 4,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    flex: 1,
  },
  bubbleText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    fontWeight: "600",
    lineHeight: LineHeights.bodyL,
  },
  hint: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    marginBottom: Spacing.md,
  },
  list: {
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  optionText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },
  optionTextSelected: {
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: WarshPalette.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  cta: {
    marginTop: Spacing.md,
  },
});
