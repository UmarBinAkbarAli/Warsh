import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandButton } from "@components/BrandButton";
import { WebAuthLayout } from "@components/WebAuthLayout";
import api from "@services/api";
import { useT } from "@i18n/index";
import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

export default function ForgotPasswordConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const { email } = useLocalSearchParams<{ email: string }>();
  const decodedEmail = email ? decodeURIComponent(email) : "";
  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (resending) return;
    setResending(true);
    try {
      await api.post("/api/auth/forgot-password", { email: decodedEmail });
      Alert.alert(t("auth.resendSentTitle"), t("auth.resendSentBody"));
    } catch {
      Alert.alert(t("common.error"), t("auth.errorGeneric"));
    } finally {
      setResending(false);
    }
  }

  return (
    <WebAuthLayout>
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Image
          source={require("../../assets/images/warsh-logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Warsh"
        />

        <Text style={styles.title}>{t("auth.checkEmailTitle")}</Text>

        <Text style={styles.body}>{t("auth.checkEmailSentTo")}</Text>
        <Text style={styles.email}>{decodedEmail}</Text>

        <Text style={styles.body}>{t("auth.checkEmailTapLink")}</Text>
        <Text style={styles.note}>{t("auth.checkEmailExpiry")}</Text>

        <BrandButton
          title={t("auth.backToLogin")}
          onPress={() => router.replace("/(auth)/login")}
          style={styles.cta}
        />

        <Pressable onPress={handleResend} hitSlop={8} style={styles.resend}>
          <Text style={styles.resendText}>
            {t("auth.didntReceive")} <Text style={styles.resendAction}>{t("auth.resend")}</Text>
          </Text>
        </Pressable>
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 82,
    height: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.ink,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  email: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  cta: {
    alignSelf: "stretch",
  },
  resend: {
    marginTop: Spacing.lg,
  },
  resendText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  resendAction: {
    color: WarshPalette.gold,
  },
});
