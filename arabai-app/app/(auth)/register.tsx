import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@hooks/useAuth";
import { useOnboardingStore } from "@stores/onboardingStore";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { getApiErrorMessage } from "@services/api";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../constants/theme";
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
      router.replace("/(app)");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to finish account setup. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        وَرْش
      </ArabicText>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.displayL, lineHeight: LineHeights.displayL, fontWeight: "700", marginBottom: Spacing.sm }}>
        Create your Warsh account
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
        onChangeText={(v) => { setEmail(v); setEmailTouched(true); }}
        onBlur={() => setEmailTouched(true)}
        placeholder="Email"
        placeholderTextColor={Colors.text.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={{ borderWidth: 1, borderColor: emailInvalid ? Colors.text.danger : Colors.border.subtle, color: Colors.text.primary, backgroundColor: Colors.bg.surface, borderRadius: Radii.md, padding: Spacing.md, marginBottom: emailInvalid ? Spacing.xs : Spacing.md }}
      />
      {emailInvalid ? <Text style={{ color: Colors.text.danger, fontSize: FontSizes.caption, marginBottom: Spacing.md }}>Enter a valid email address.</Text> : null}
      <TextInput
        value={password}
        onChangeText={(v) => { setPassword(v); setPasswordTouched(true); }}
        onBlur={() => setPasswordTouched(true)}
        placeholder="Password (min 8 characters)"
        placeholderTextColor={Colors.text.muted}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: passwordShort ? Colors.text.danger : Colors.border.subtle, color: Colors.text.primary, backgroundColor: Colors.bg.surface, borderRadius: Radii.md, padding: Spacing.md, marginBottom: passwordShort ? Spacing.xs : Spacing.xl }}
      />
      {passwordShort ? <Text style={{ color: Colors.text.danger, fontSize: FontSizes.caption, marginBottom: Spacing.md }}>Password must be at least 8 characters.</Text> : null}
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
