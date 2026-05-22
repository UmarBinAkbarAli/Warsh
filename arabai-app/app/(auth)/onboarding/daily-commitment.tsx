import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingDailyCommitmentSelected } from "../../services/analytics";

const OPTIONS: { label: string; subtitle: string; value: number }[] = [
  { label: "5 minutes", subtitle: "Casual — I'll squeeze it in.", value: 5 },
  { label: "10 minutes", subtitle: "Comfortable — I have a real window.", value: 10 },
  { label: "15 minutes", subtitle: "Committed — this is a priority.", value: 15 },
  { label: "30 minutes or more", subtitle: "Serious — I'm here to finish this.", value: 30 },
];

export default function DailyCommitmentScreen() {
  const router = useRouter();
  const { dailyGoalMinutes, setDailyGoalMinutes } = useOnboardingStore();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        How much time can you spend daily?
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Steady wins. Even 5 minutes a day adds up.
      </Text>

      {OPTIONS.map((option, index) => (
        <View key={option.value}>
          {index > 0 && <View style={{ height: Spacing.md }} />}
          <BrandButton
            title={option.label}
            variant={dailyGoalMinutes === option.value ? "primary" : "secondary"}
            selected={dailyGoalMinutes === option.value}
            onPress={() => setDailyGoalMinutes(option.value)}
          />
          <Text style={{ color: Colors.text.muted, fontSize: FontSizes.caption, marginTop: 4, marginLeft: 2 }}>
            {option.subtitle}
          </Text>
        </View>
      ))}

      <View style={{ height: Spacing.xl }} />
      <BrandButton
        title="Continue"
        onPress={() => { trackOnboardingDailyCommitmentSelected(dailyGoalMinutes); router.push("/(auth)/onboarding/name"); }}
      />
    </View>
  );
}
