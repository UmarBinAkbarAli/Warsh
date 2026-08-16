import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthInput } from "@components/AuthInput";
import { BrandButton } from "@components/BrandButton";
import { WebAuthLayout } from "@components/WebAuthLayout";
import api, { getApiErrorMessage } from "@services/api";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";
import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const isUrdu = useLanguage() === "ur";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setError(t("auth.errorEmail"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: trimmed });
      router.push(`/(auth)/forgot-password-confirm?email=${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError(getApiErrorMessage(err, t("auth.errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebAuthLayout>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.screen,
            { paddingTop: insets.top + Spacing.xxxl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <Image
            source={require("../../assets/images/warsh-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Warsh"
          />

          <Text style={[styles.title, isUrdu ? styles.rtlText : null]}>{t("auth.resetTitle")}</Text>
          <Text style={[styles.subtitle, isUrdu ? styles.rtlText : null]}>{t("auth.resetBody")}</Text>

          <AuthInput
            placeholder={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            containerStyle={styles.field}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <BrandButton title={t("auth.sendResetLink")} onPress={handleSubmit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xxl,
  },
  logo: {
    width: 82,
    height: 56,
    alignSelf: "center",
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.ink,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    color: WarshPalette.bodyBrown,
    marginBottom: Spacing.xl,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  field: {
    marginBottom: Spacing.lg,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.wrongText,
    marginBottom: Spacing.md,
  },
});
