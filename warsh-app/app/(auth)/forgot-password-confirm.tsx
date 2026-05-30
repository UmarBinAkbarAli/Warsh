import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import api from "@services/api";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";

export default function ForgotPasswordConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const decodedEmail = email ? decodeURIComponent(email) : "";

  async function handleResend() {
    try {
      await api.post("/api/auth/forgot-password", { email: decodedEmail });
      Alert.alert("Sent!", "If that email is registered, a new reset link has been sent.");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.md }]}>
      {/* Brand mark */}
      <ArabicText size="sm" style={styles.brandMark}>
        وَرْش
      </ArabicText>

      {/* Mail icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="mail-outline" size={64} color={WarshPalette.gold} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Check your email.</Text>

      {/* Body */}
      <Text style={styles.body}>
        {"We sent a reset link to\n"}
        <Text style={styles.emailHighlight}>{decodedEmail}</Text>
        {"\n\nTap the link in the email to set a new password."}
      </Text>

      {/* Expiry note */}
      <Text style={styles.note}>The link will expire in 1 hour.</Text>

      {/* Back to login */}
      <BrandButton title="Back to login →" onPress={() => router.replace("/(auth)/login")} />

      {/* Resend link */}
      <TouchableOpacity onPress={handleResend} style={styles.resendButton} hitSlop={8}>
        <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendAction}>Resend</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMark: {
    textAlign: "center",
    color: WarshPalette.gold,
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: WarshPalette.ink,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  body: {
    color: WarshPalette.bodyBrown,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM * 1.6,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emailHighlight: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontWeight: "700",
  },
  note: {
    color: WarshPalette.subtleBrown,
    fontSize: FontSizes.caption,
    fontFamily: Fonts.italic,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  resendButton: {
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  resendText: {
    color: WarshPalette.subtleBrown,
    fontSize: FontSizes.bodyM,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  resendAction: {
    color: WarshPalette.gold,
    fontFamily: Fonts.bold,
    fontWeight: "700",
  },
});
