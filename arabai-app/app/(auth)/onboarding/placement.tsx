import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { BrandButton } from "@components/BrandButton";
import { useOnboardingStore } from "@stores/onboardingStore";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingPlacementSelected } from "@services/analytics";

export default function OnboardingPlacementScreen() {
  const router = useRouter();
  const { placementType, setPlacementType } = useOnboardingStore();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        Choose your starting point
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Ustaad Noor can unlock the early chapters for you if you already know the basics. You can still review any skipped chapter later.
      </Text>
      <BrandButton title="I'm completely new to Arabic" onPress={() => setPlacementType("BEGINNER")} selected={placementType === "BEGINNER"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton
        title="I know the Arabic letters"
        variant="secondary"
        onPress={() => setPlacementType("KNOWS_LETTERS")}
        selected={placementType === "KNOWS_LETTERS"}
      />
      <View style={{ height: Spacing.md }} />
      <BrandButton
        title="I studied Arabic before but forgot most of it"
        variant="secondary"
        onPress={() => setPlacementType("STUDIED_BEFORE")}
        selected={placementType === "STUDIED_BEFORE"}
      />
      <View style={{ height: Spacing.md }} />
      <BrandButton
        title="I can read basic Arabic with vowels"
        variant="secondary"
        onPress={() => setPlacementType("CAN_READ_BASIC")}
        selected={placementType === "CAN_READ_BASIC"}
      />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title="Continue" onPress={() => { if (placementType) trackOnboardingPlacementSelected(placementType); router.push("/(auth)/onboarding/ready"); }} />
    </View>
  );
}
