import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";

export default function OnboardingNameScreen() {
  const [name, setName] = useState("");
  const setNameState = useOnboardingStore((state) => state.setName);

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>What should Ustadh Noor call you?</Text>
      <TextInput
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameState(value);
        }}
        placeholder="Your name"
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 24 }}
      />
      <Link href="/(auth)/onboarding/language" style={{ color: "#0f766e", fontWeight: "bold" }}>
        Continue
      </Link>
    </View>
  );
}
