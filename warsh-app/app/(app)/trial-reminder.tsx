import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { ArabicText } from "@components/ArabicText";

export default function TrialReminderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { days } = useLocalSearchParams<{ days: string }>();
  const trialDays = parseInt(days ?? "7", 10) || 7;

  // Compute the reminder date (trial end - 2 days for buffer)
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + trialDays - 2);
  const dateStr = reminderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Subscription end date
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + trialDays);
  const endDateStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      {/* Title */}
      <View style={styles.header}>
        <ArabicText size="sm" style={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </ArabicText>
        <Text style={styles.title}>
          Try the very best of Warsh.{"\n"}First {trialDays} days on us.
        </Text>
      </View>

      {/* Noor mascot */}
      <View style={styles.mascotArea}>
        <View style={styles.mascotOuter}>
          <View style={styles.mascotInner}>
            <View style={styles.eyes}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      {/* Reminder message */}
      <View style={styles.messageCard}>
        <Text style={styles.messageText}>
          In {trialDays - 2} days, we'll remind you by email{"\n"}that your trial is about to end
        </Text>
      </View>

      {/* Fine print */}
      <Text style={styles.finePrint}>
        Your subscription starts {endDateStr}. Cancel 24 hours{"\n"}before in Google Play settings.
      </Text>

      <BrandButton
        title="Continue"
        onPress={() => router.replace("/(app)/(tabs)")}
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
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.lg,
  },
  bismillah: {
    color: WarshPalette.gold,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
    lineHeight: LineHeights.h1 * 1.4,
  },

  // Noor mascot (text-based, no image required)
  mascotArea: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  mascotOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: WarshPalette.parchment,
    borderWidth: 3,
    borderColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  eyes: {
    flexDirection: "row",
    gap: 16,
  },
  eye: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: WarshPalette.ink,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WarshPalette.gold,
  },

  messageCard: {
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1,
    borderColor: WarshPalette.parchmentCardBorder,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  messageText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
    textAlign: "center",
    lineHeight: LineHeights.bodyL,
  },
  finePrint: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  cta: {
    marginTop: Spacing.sm,
  },
});
