import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthInput } from "@components/AuthInput";
import { BrandButton } from "@components/BrandButton";
import { WebAuthLayout } from "@components/WebAuthLayout";
import api from "@services/api";
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const isUrdu = useLanguage() === "ur";
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!token) {
      setError(t("auth.errorResetToken"));
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError(t("auth.errorPasswordShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.errorPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, newPassword });
      Alert.alert(t("auth.resetDoneTitle"), t("auth.resetDoneBody"), [
        { text: t("auth.logIn"), onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? t("auth.errorResetFailed"));
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

          <Text style={[styles.title, isUrdu ? styles.rtlText : null]}>
            {t("auth.newPasswordTitle")}
          </Text>
          <Text style={[styles.subtitle, isUrdu ? styles.rtlText : null]}>
            {t("auth.newPasswordBody")}
          </Text>

          <AuthInput
            placeholder={t("auth.newPassword")}
            value={newPassword}
            onChangeText={setNewPassword}
            secure
            textContentType="newPassword"
            containerStyle={styles.field}
          />
          <AuthInput
            placeholder={t("auth.confirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure
            textContentType="newPassword"
            containerStyle={styles.field}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <BrandButton
            title={t("auth.updatePassword")}
            onPress={handleSubmit}
            loading={loading}
          />

          <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8} style={styles.back}>
            <Text style={styles.backText}>{t("auth.backToLoginPlain")}</Text>
          </Pressable>
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
  back: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  backText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.gold,
  },
});
