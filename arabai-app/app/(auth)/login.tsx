import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { ArabicText } from "../components/ArabicText";
import { BrandButton } from "../components/BrandButton";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/(app)");
    } catch (err) {
      setError("Unable to sign in. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <ArabicText size="sm" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </ArabicText>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.displayL, lineHeight: LineHeights.displayL, fontWeight: "700", marginBottom: Spacing.sm }}>
        Welcome back to Noor
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Pick up where you left off. Your next word is waiting.
      </Text>
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
        style={{ borderWidth: 1, borderColor: Colors.border.subtle, color: Colors.text.primary, backgroundColor: Colors.bg.surface, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md }}
      />
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.md }}>{error}</Text> : null}
      <BrandButton title="Sign In" onPress={handleSubmit} loading={loading} />
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Text style={{ color: Colors.text.secondary }}>Don't have an account? </Text>
        <Link href="/(auth)/onboarding/welcome" style={{ color: Colors.accent.gold, fontWeight: "700" }}>
          Register
        </Link>
      </View>
    </View>
  );
}
