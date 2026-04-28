import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useOnboardingStore } from "../stores/onboardingStore";
import { ArabicText } from "../components/ArabicText";
import { BrandButton } from "../components/BrandButton";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { name, language, goal, setName } = useOnboardingStore();
  const [displayName, setDisplayName] = useState(name);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const trimmedName = displayName.trim();
    if (!trimmedName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setName(trimmedName);
      await register(trimmedName, email, password, language, goal);
      router.replace("/(app)");
    } catch (err) {
      setError("Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        نُور
      </ArabicText>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.displayL, lineHeight: LineHeights.displayL, fontWeight: "700", marginBottom: Spacing.sm }}>
        Create your Noor account
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        {displayName ? `Welcome ${displayName}. Your journey to understanding the Quran starts here.` : "Your journey to understanding the Quran starts here."}
      </Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Name"
        placeholderTextColor={Colors.text.muted}
        autoCapitalize="words"
        style={{ borderWidth: 1, borderColor: Colors.border.subtle, color: Colors.text.primary, backgroundColor: Colors.bg.surface, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md }}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={Colors.text.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: Colors.border.subtle, color: Colors.text.primary, backgroundColor: Colors.bg.surface, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={Colors.text.muted}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: Colors.border.subtle, color: Colors.text.primary, backgroundColor: Colors.bg.surface, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.xl }}
      />
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.md }}>{error}</Text> : null}
      <BrandButton title="Create Account" onPress={handleSubmit} loading={loading} />
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl }}>
        <Text style={{ color: Colors.text.secondary }}>Already have an account? </Text>
        <Link href="/(auth)/login" style={{ color: Colors.accent.gold, fontWeight: "700" }}>
          Login
        </Link>
      </View>
    </View>
  );
}
