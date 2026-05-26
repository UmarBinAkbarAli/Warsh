import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { BrandButton } from "@components/BrandButton";
import { ArabicText } from "@components/ArabicText";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, newPassword });
      Alert.alert(
        "Password updated",
        "Your password has been changed. Please log in with your new password.",
        [{ text: "Log in", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to reset password. The link may have expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.md }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ArabicText size="sm" style={styles.brandMark}>وَرْش</ArabicText>

      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>
        Choose a strong password — at least 8 characters.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="New password"
          placeholderTextColor={WarshPalette.subtleBrown}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={WarshPalette.subtleBrown}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.inputRow, { marginTop: Spacing.md }]}>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Confirm new password"
          placeholderTextColor={WarshPalette.subtleBrown}
        />
      </View>

      <BrandButton
        title="Update password"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.backLink} hitSlop={8}>
        <Text style={styles.backLinkText}>Back to login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  brandMark: {
    textAlign: "center",
    color: WarshPalette.gold,
    marginBottom: Spacing.xl,
  },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  errorText: {
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WarshPalette.white,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
    paddingVertical: Spacing.md,
  },
  submitBtn: { marginTop: Spacing.xl },
  backLink: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  backLinkText: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
});
