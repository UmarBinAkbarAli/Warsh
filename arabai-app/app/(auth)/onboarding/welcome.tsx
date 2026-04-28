import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";

export default function WelcomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 16 }}>Welcome to ArabAI</Text>
      <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 24 }}>
        Learn Quranic Arabic with Ustadh Noor, earn XP, and build a daily streak.
      </Text>
      <Link href="/(auth)/onboarding/goal" style={{ backgroundColor: "#0f766e", padding: 16, borderRadius: 12 }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Start Onboarding</Text>
      </Link>
    </View>
  );
}
