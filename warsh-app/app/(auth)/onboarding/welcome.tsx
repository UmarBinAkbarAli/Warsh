import { View, Text } from "react-native";
import { Link } from "expo-router";
import { ArabicText } from "@components/ArabicText";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../../constants/theme";
import { useT } from "@i18n/index";

export default function WelcomeScreen() {
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center", alignItems: "center" }}>
      <ArabicText size="sm" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </ArabicText>
      <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.xs }}>
        وَرْش
      </ArabicText>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.displayL, lineHeight: LineHeights.displayL, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.md, textAlign: "center" }}>
        {t("onboarding.welcomeTitle")}
      </Text>
      <Text style={{ fontSize: FontSizes.bodyL, color: Colors.text.secondary, textAlign: "center", marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        {t("onboarding.welcomeBody")}
      </Text>
      <Link href="/(auth)/onboarding/goal" style={{ backgroundColor: Colors.accent.gold, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.md + 2 }}>
        <Text style={{ color: Colors.bg.primary, fontWeight: "700" }}>{t("common.start")}</Text>
      </Link>
    </View>
  );
}
