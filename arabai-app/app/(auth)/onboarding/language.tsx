import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";

export default function OnboardingLanguageScreen() {
  const setLanguage = useOnboardingStore((state) => state.setLanguage);

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Native language</Text>
      <Text style={{ textAlign: "center", color: "#4b5563", marginBottom: 24 }}>
        Choose your native language for personalized prompts.
      </Text>
      <Pressable onPress={() => setLanguage("ur")} style={{ backgroundColor: "#0f766e", padding: 16, borderRadius: 12, width: "100%", marginBottom: 12 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Urdu</Text>
      </Pressable>
      <Pressable onPress={() => setLanguage("hi")} style={{ backgroundColor: "#0ea5e9", padding: 16, borderRadius: 12, width: "100%", marginBottom: 12 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Hindi</Text>
      </Pressable>
      <Pressable onPress={() => setLanguage("en")} style={{ backgroundColor: "#8b5cf6", padding: 16, borderRadius: 12, width: "100%", marginBottom: 24 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>English</Text>
      </Pressable>
      <Link href="/(auth)/onboarding/ready" style={{ color: "#0f766e", fontWeight: "bold" }}>
        Continue
      </Link>
    </View>
  );
}
