import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { GoogleAuthButton } from "@components/GoogleAuthButton";
import { useAuth } from "@hooks/useAuth";
import { useOnboardingStore } from "@stores/onboardingStore";
import { getApiErrorMessage } from "@services/api";
import { captureError } from "@services/sentry";
import { useT } from "@i18n/index";
import { trackLoginCompleted, trackSignupCompleted } from "@services/analytics";
import { Colors, FontSizes, Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

type LinkRequest = {
  email: string;
  linkToken: string;
};

type Props = {
  context: "login" | "signup";
};

export function GoogleAuthSection({ context }: Props) {
  const router = useRouter();
  const t = useT();
  const { loginWithGoogle, linkGoogleAccount, applyPlacement } = useAuth();
  const {
    language,
    translationLanguage,
    goal,
    placementType,
    dailyGoalMinutes,
  } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkRequest, setLinkRequest] = useState<LinkRequest | null>(null);
  const [password, setPassword] = useState("");
  const [linking, setLinking] = useState(false);

  const finishGoogleSession = useCallback(
    async (created: boolean) => {
      if (created) {
        await applyPlacement(placementType);
        trackSignupCompleted({
          goal: goal ?? "",
          level: "",
          placement: placementType ?? "BEGINNER",
          language: language ?? "en",
        });
        router.replace("/(auth)/onboarding/permissions");
        return;
      }
      trackLoginCompleted();
      router.replace("/(app)");
    },
    [applyPlacement, goal, language, placementType, router],
  );

  const handleToken = useCallback(
    async (idToken: string) => {
      setLoading(true);
      setError("");
      try {
        const data = await loginWithGoogle(idToken, {
          nativeLanguage: language,
          translationLanguage,
          goal,
          dailyGoalMinutes,
        });
        await finishGoogleSession(Boolean(data.created));
      } catch (authError: any) {
        const responseData = authError?.response?.data;
        if (
          responseData?.code === "google_link_required" &&
          typeof responseData.linkToken === "string" &&
          typeof responseData.email === "string"
        ) {
          setPassword("");
          setLinkRequest({
            email: responseData.email,
            linkToken: responseData.linkToken,
          });
        } else {
          setError(getApiErrorMessage(authError, t("auth.googleError")));
        }
      } finally {
        setLoading(false);
      }
    },
    [
      dailyGoalMinutes,
      finishGoogleSession,
      goal,
      language,
      loginWithGoogle,
      t,
      translationLanguage,
    ],
  );

  const handleProviderError = useCallback(
    (providerError: unknown) => {
      captureError(providerError, {
        source: "google_sign_in_provider",
        platform: Platform.OS,
      });
      setError(getApiErrorMessage(providerError, t("auth.googleError")));
    },
    [t],
  );

  async function confirmLink() {
    if (!linkRequest || !password) return;
    setLinking(true);
    setError("");
    try {
      await linkGoogleAccount(linkRequest.linkToken, password);
      setLinkRequest(null);
      setPassword("");
      await finishGoogleSession(false);
    } catch (linkError) {
      setError(getApiErrorMessage(linkError, t("auth.googleLinkWrongPassword")));
    } finally {
      setLinking(false);
    }
  }

  return (
    <>
      <View style={styles.section}>
        <GoogleAuthButton loading={loading} onToken={handleToken} onError={handleProviderError} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {context === "login" ? (
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t("auth.orEmail")}</Text>
            <View style={styles.divider} />
          </View>
        ) : null}
      </View>

      <Modal
        transparent
        visible={linkRequest !== null}
        animationType="fade"
        onRequestClose={() => !linking && setLinkRequest(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("auth.googleLinkTitle")}</Text>
            <Text style={styles.modalBody}>
              {t("auth.googleLinkBody", { email: linkRequest?.email ?? "" })}
            </Text>
            <TextInput
              label={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              autoCapitalize="none"
              autoFocus
              disabled={linking}
              style={styles.passwordInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                disabled={linking}
                onPress={() => setLinkRequest(null)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={linking || !password}
                onPress={() => void confirmLink()}
                style={[styles.linkButton, !password ? styles.disabledButton : null]}
              >
                {linking ? (
                  <ActivityIndicator size="small" color={WarshPalette.ink} />
                ) : (
                  <Text style={styles.linkText}>{t("auth.googleLinkAction")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    gap: Spacing.sm,
  },
  error: {
    color: Colors.text.danger,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    textAlign: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: WarshPalette.defaultCardBorder,
  },
  dividerText: {
    color: Colors.text.secondary,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    backgroundColor: "rgba(7, 27, 68, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bg.surface,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    fontWeight: "700",
  },
  modalBody: {
    color: Colors.text.secondary,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 21,
  },
  passwordInput: {
    backgroundColor: Colors.bg.surface,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  cancelButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  cancelText: {
    color: Colors.text.secondary,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  linkButton: {
    minWidth: 118,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  linkText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
  },
});
