import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@hooks/useAuth";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { getApiErrorMessage } from "@services/api";
import { Colors, FontSizes, LineHeights, Spacing } from "../../constants/theme";
import { trackLoginCompleted } from "@services/analytics";

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
      trackLoginCompleted();
      router.replace("/(app)");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sign in. Check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ArabicText size="sm" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </ArabicText>
      <Text style={styles.heading}>Welcome back to Warsh</Text>
      <Text style={styles.subheading}>Pick up where you left off. Your next word is waiting.</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <BrandButton title="Sign In" onPress={handleSubmit} loading={loading} />
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: Spacing.lg }}>
        <Text style={{ color: Colors.text.secondary }}>Don't have an account? </Text>
        <Link href="/(auth)/onboarding/welcome" style={{ color: Colors.accent.gold, fontWeight: "700" }}>
          Register
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    padding: Spacing.xl,
    justifyContent: "center",
  },
  heading: {
    color: Colors.text.primary,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    fontWeight: "700",
    fontFamily: "Lora-Bold",
    marginBottom: Spacing.sm,
  },
  subheading: {
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    lineHeight: LineHeights.bodyL,
    fontFamily: "Lora-Regular",
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg.surface,
  },
  error: {
    color: Colors.text.danger,
    marginBottom: Spacing.md,
    fontFamily: "Lora-Regular",
  },
});
