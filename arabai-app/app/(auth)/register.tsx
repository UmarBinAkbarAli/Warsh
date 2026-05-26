import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@hooks/useAuth";
import { useOnboardingStore } from "@stores/onboardingStore";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { getApiErrorMessage } from "@services/api";
import { Colors, FontSizes, LineHeights, Spacing } from "../../constants/theme";
import { trackSignupCompleted } from "@services/analytics";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, applyPlacement } = useAuth();
  const { name, language, goal, placementType, dailyGoalMinutes, setName } = useOnboardingStore();
  const [displayName, setDisplayName] = useState(name);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailInvalid = emailTouched && email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordShort = passwordTouched && password.length > 0 && password.length < 8;

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit() {
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setName(trimmedName);
      await register(trimmedName, trimmedEmail, password, language, goal, dailyGoalMinutes);
      await applyPlacement(placementType);
      trackSignupCompleted({ goal: goal ?? "", level: "", placement: placementType ?? "BEGINNER", language: language ?? "en" });
      router.replace("/(auth)/onboarding/permissions");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to finish account setup. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        وَرْش
      </ArabicText>
      <Text style={styles.heading}>Create your Warsh account</Text>
      <Text style={styles.subheading}>
        {displayName
          ? `Welcome ${displayName}. Your journey to understanding the Quran starts here.`
          : "Your journey to understanding the Quran starts here."}
      </Text>

      <TextInput
        label="Name"
        value={displayName}
        onChangeText={setDisplayName}
        mode="outlined"
        autoCapitalize="words"
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={(v) => { setEmail(v); setEmailTouched(true); }}
        onBlur={() => setEmailTouched(true)}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailInvalid}
        style={styles.input}
      />
      {emailInvalid ? (
        <Text style={styles.fieldError}>Enter a valid email address.</Text>
      ) : null}
      <TextInput
        label="Password (min 8 characters)"
        value={password}
        onChangeText={(v) => { setPassword(v); setPasswordTouched(true); }}
        onBlur={() => setPasswordTouched(true)}
        mode="outlined"
        secureTextEntry
        error={passwordShort}
        style={styles.input}
      />
      {passwordShort ? (
        <Text style={styles.fieldError}>Password must be at least 8 characters.</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  fieldError: {
    color: Colors.text.danger,
    fontSize: FontSizes.caption,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
    fontFamily: "Lora-Regular",
  },
  error: {
    color: Colors.text.danger,
    marginBottom: Spacing.md,
    fontFamily: "Lora-Regular",
  },
});
