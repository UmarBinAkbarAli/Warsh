import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@hooks/useAuth";
import { ArabicText } from "@components/ArabicText";
import { AuthInput } from "@components/AuthInput";
import { BrandButton } from "@components/BrandButton";
import { GoogleAuthSection } from "@components/GoogleAuthSection";
import { WebAuthLayout } from "@components/WebAuthLayout";
import { getApiErrorMessage } from "@services/api";
import { trackLoginCompleted } from "@services/analytics";
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const isUrdu = useLanguage() === "ur";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      trackLoginCompleted();
      router.replace("/(app)");
    } catch (err) {
      setError(getApiErrorMessage(err, t("auth.loginFailed")));
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
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.screen,
            { paddingTop: insets.top + Spacing.xxxl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/warsh-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Warsh"
          />
          <ArabicText size="sm" style={styles.bismillah}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </ArabicText>

          <Text style={[styles.title, isUrdu ? styles.rtlText : null]}>{t("auth.loginTitle")}</Text>
          <Text style={[styles.subtitle, isUrdu ? styles.rtlText : null]}>{t("auth.loginBody")}</Text>

          <AuthInput
            placeholder={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            containerStyle={styles.field}
          />
          <AuthInput
            placeholder={t("auth.passwordLabel")}
            value={password}
            onChangeText={setPassword}
            secure
            textContentType="password"
            containerStyle={styles.field}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <BrandButton
            title={t("auth.signIn")}
            onPress={handleSubmit}
            loading={loading}
            style={styles.cta}
          />

          <View style={[styles.switchRow, isUrdu ? styles.switchRowRtl : null]}>
            <Text style={styles.switchText}>{t("auth.noAccount")} </Text>
            <Link href="/(auth)/register" style={styles.switchLink}>
              {t("auth.register")}
            </Link>
          </View>

          <Link
            href="/(auth)/forgot-password"
            style={[styles.forgot, isUrdu ? styles.rtlText : null]}
          >
            {t("auth.forgotPassword")}
          </Link>

          <GoogleAuthSection showDivider />
        </ScrollView>
      </KeyboardAvoidingView>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flexGrow: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xxl,
  },
  logo: {
    width: 82,
    height: 56,
    alignSelf: "center",
  },
  bismillah: {
    textAlign: "center",
    color: WarshPalette.gold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
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
  cta: {
    marginTop: Spacing.xl,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  switchRowRtl: {
    flexDirection: "row-reverse",
  },
  switchText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
  },
  switchLink: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    fontWeight: "700",
    color: WarshPalette.gold,
  },
  forgot: {
    marginTop: Spacing.lg,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
  },
});
