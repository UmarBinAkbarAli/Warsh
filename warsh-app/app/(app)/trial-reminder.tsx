import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BrandButton } from "@components/BrandButton";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";
import { Colors, Fonts, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { ArabicText } from "@components/ArabicText";

export default function TrialReminderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const t = useT();
  const language = useLanguage();
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const { days } = useLocalSearchParams<{ days: string }>();
  const trialDays = parseInt(days ?? "7", 10) || 7;

  // Subscription end date
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + trialDays);
  const endDateStr = endDate.toLocaleDateString(language === "ur" ? "ur-PK" : "en-US", { month: "short", day: "numeric" });

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={[styles.body, desktopWeb && styles.webNarrow]}>
        <ArabicText size="sm" style={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </ArabicText>
        <Text style={styles.title} accessibilityRole="header">
          {t("trialReminder.title", { days: trialDays })}
        </Text>

        {/* An hourglass, not a face: no Warsh image shows facial features. */}
        <View style={styles.emblemOuter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.emblemInner}>
            <Ionicons name="hourglass-outline" size={52} color={WarshPalette.parchment} />
          </View>
        </View>

        <View style={styles.messageCard}>
          <View style={styles.messageIcon}>
            <Ionicons name="mail-outline" size={20} color={WarshPalette.parchment} />
          </View>
          <Text style={styles.messageText}>{t("trialReminder.reminder", { days: Math.max(1, trialDays - 2) })}</Text>
        </View>

        <Text style={styles.finePrint}>{t("trialReminder.finePrint", { date: endDateStr })}</Text>

        <View style={styles.spacer} />
        <BrandButton title={t("common.continue")} onPress={() => router.replace("/(app)/(tabs)")} style={styles.cta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: Spacing.xxxl,
  },
  webNarrow: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  bismillah: {
    color: WarshPalette.goldText,
  },
  title: {
    marginTop: Spacing.lg,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: WarshPalette.ink,
    textAlign: "center",
  },
  emblemOuter: {
    marginTop: 44,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: WarshPalette.parchmentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: WarshPalette.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  messageCard: {
    marginTop: 44,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radii.xl,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchment,
    backgroundColor: WarshPalette.parchmentBg,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WarshPalette.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: WarshPalette.ink,
  },
  finePrint: {
    marginTop: Spacing.lg,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  spacer: { flex: 1, minHeight: Spacing.xl },
  cta: { alignSelf: "stretch" },
});
