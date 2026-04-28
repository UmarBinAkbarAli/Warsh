import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";

export default function OnboardingGoalScreen() {
  const setGoal = useOnboardingStore((state) => state.setGoal);

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Choose your goal</Text>
      <Text style={{ textAlign: "center", color: "#4b5563", marginBottom: 24 }}>
        Select the reason you want to learn Arabic so we can personalize your first lessons.
      </Text>
      <Pressable onPress={() => setGoal("QURAN")} style={{ backgroundColor: "#0f766e", padding: 16, borderRadius: 12, width: "100%", marginBottom: 12 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Quranic Arabic</Text>
      </Pressable>
      <Pressable onPress={() => setGoal("TRAVEL")} style={{ backgroundColor: "#0ea5e9", padding: 16, borderRadius: 12, width: "100%", marginBottom: 12 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Travel & Conversation</Text>
      </Pressable>
      <Pressable onPress={() => setGoal("STUDY")} style={{ backgroundColor: "#8b5cf6", padding: 16, borderRadius: 12, width: "100%", marginBottom: 24 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Study Arabic</Text>
      </Pressable>
      <Link href="/(auth)/onboarding/level" style={{ color: "#0f766e", fontWeight: "bold" }}>
        Continue
      </Link>
    </View>
  );
}
