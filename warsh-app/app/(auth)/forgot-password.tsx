import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import api, { getApiErrorMessage } from "@services/api";
import { Colors, Fonts, FontSizes, LineHeights, Spacing, WarshPalette } from "../../constants/theme";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!email.trim() || !isValidEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim() });
      router.push(`/(auth)/forgot-password-confirm?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.md }]}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={WarshPalette.ink} />
      </TouchableOpacity>

      {/* Brand mark */}
      <ArabicText size="sm" style={styles.brandMark}>
        وَرْش
      </ArabicText>

      {/* Title */}
      <Text style={styles.title}>Reset your password</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Enter your email. We'll send you a reset link.</Text>

      {/* Email input */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* Error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Submit */}
      <BrandButton title="Send reset link →" onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.xl,
  },
  brandMark: {
    textAlign: "center",
    color: WarshPalette.gold,
    marginBottom: Spacing.sm,
  },
  title: {
    color: WarshPalette.ink,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: WarshPalette.bodyBrown,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM * 1.5,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg.surface,
  },
  error: {
    color: WarshPalette.wrongText,
    fontSize: FontSizes.bodyM,
    fontFamily: Fonts.regular,
    marginBottom: Spacing.md,
  },
});
