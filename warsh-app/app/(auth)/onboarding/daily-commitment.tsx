import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingDailyCommitmentSelected } from "@services/analytics";
import { useT } from "@i18n/index";

const OPTIONS: { labelKey: string; subtitleKey: string; value: number }[] = [
  { labelKey: "onboarding.dailyOption5", subtitleKey: "onboarding.dailyOption5Sub", value: 5 },
  { labelKey: "onboarding.dailyOption10", subtitleKey: "onboarding.dailyOption10Sub", value: 10 },
  { labelKey: "onboarding.dailyOption15", subtitleKey: "onboarding.dailyOption15Sub", value: 15 },
  { labelKey: "onboarding.dailyOption30", subtitleKey: "onboarding.dailyOption30Sub", value: 30 },
];

export default function DailyCommitmentScreen() {
  const router = useRouter();
  const { dailyGoalMinutes, setDailyGoalMinutes } = useOnboardingStore();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.sm }}>
        {t("onboarding.dailyTitle")}
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        {t("onboarding.dailyBody")}
      </Text>

      {OPTIONS.map((option, index) => (
        <View key={option.value}>
          {index > 0 && <View style={{ height: Spacing.md }} />}
          <BrandButton
            title={t(option.labelKey)}
            variant={dailyGoalMinutes === option.value ? "primary" : "secondary"}
            selected={dailyGoalMinutes === option.value}
            onPress={() => setDailyGoalMinutes(option.value)}
          />
          <Text style={{ color: Colors.text.muted, fontSize: FontSizes.caption, marginTop: 4, marginLeft: 2, fontFamily: "Lora-Regular" }}>
            {t(option.subtitleKey)}
          </Text>
        </View>
      ))}

      <View style={{ height: Spacing.xl }} />
      <BrandButton title={t("common.continue")} onPress={() => { trackOnboardingDailyCommitmentSelected(dailyGoalMinutes); router.push("/(auth)/onboarding/name"); }} />
    </View>
  );
}
