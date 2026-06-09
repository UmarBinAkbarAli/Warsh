import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { BrandButton } from "@components/BrandButton";
import { useOnboardingStore } from "@stores/onboardingStore";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingPlacementSelected } from "@services/analytics";
import { useT } from "@i18n/index";

export default function OnboardingPlacementScreen() {
  const router = useRouter();
  const { placementType, setPlacementType } = useOnboardingStore();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        {t("onboarding.placementTitle")}
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        {t("onboarding.placementBody")}
      </Text>
      <BrandButton title={t("onboarding.placementBeginner")} variant="secondary" onPress={() => setPlacementType("BEGINNER")} selected={placementType === "BEGINNER"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.placementLetters")} variant="secondary" onPress={() => setPlacementType("KNOWS_LETTERS")} selected={placementType === "KNOWS_LETTERS"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.placementStudied")} variant="secondary" onPress={() => setPlacementType("STUDIED_BEFORE")} selected={placementType === "STUDIED_BEFORE"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.placementReadBasic")} variant="secondary" onPress={() => setPlacementType("CAN_READ_BASIC")} selected={placementType === "CAN_READ_BASIC"} />
      <View style={{ height: Spacing.xl }} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.placementSkip")} variant="secondary" onPress={() => { setPlacementType("BEGINNER"); router.push("/(auth)/onboarding/ready"); }} selected={false} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title={t("common.continue")} onPress={() => { if (placementType) trackOnboardingPlacementSelected(placementType); router.push("/(auth)/onboarding/ready"); }} />
    </View>
  );
}
