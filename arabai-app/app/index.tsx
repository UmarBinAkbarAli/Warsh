import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>ArabAI</Text>
      <Text style={{ textAlign: "center", marginBottom: 24 }}>
        Welcome to the ArabAI mobile app scaffold. This is the starting point for Phase 1.
      </Text>
      <Link href="/(auth)/login" style={{ color: "blue" }}>
        Go to Login
      </Link>
    </View>
  );
}
