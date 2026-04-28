import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";

export default function OnboardingReadyScreen() {
  const { goal, level, name, language } = useOnboardingStore();

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>You're all set!</Text>
      <Text style={{ textAlign: "center", color: "#4b5563", marginBottom: 24 }}>
        {name ? `${name},` : ""} your learning profile is ready.
      </Text>
      <View style={{ width: "100%", padding: 16, borderRadius: 16, backgroundColor: "#f3f4f6", marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Your onboarding summary</Text>
        <Text>Goal: {goal}</Text>
        <Text>Level: {level}</Text>
        <Text>Language: {language}</Text>
      </View>
      <Link href="/(auth)/register" style={{ backgroundColor: "#0f766e", padding: 16, borderRadius: 12 }}>
        Create Account
      </Link>
    </View>
  );
}
