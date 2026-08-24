import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { ensureGoogleSignInConfigured } from "@services/googleSignIn";
import { useT } from "@i18n/index";
import { Fonts, FontSizes, Radii, Spacing, WarshPalette } from "../constants/theme";

type Props = {
  loading?: boolean;
  onToken: (idToken: string) => void | Promise<void>;
  onError: (error: unknown) => void;
};

/**
 * 2026-08 redesign: gold-outlined button matching the onboarding frames.
 * Previously this rendered the vendor's `GoogleSignInButton`, but that view
 * was already decorative — `pointerEvents="none"` with a transparent
 * Pressable on top doing the real work — so swapping the visual changes
 * nothing about the sign-in path. Google's official "G" mark is kept as
 * required by their branding terms.
 */
export function GoogleAuthButton({ loading = false, onToken, onError }: Props) {
  const t = useT();
  const [providerLoading, setProviderLoading] = useState(false);

  async function handlePress() {
    setProviderLoading(true);
    try {
      ensureGoogleSignInConfigured();
      await GoogleOneTapSignIn.checkPlayServices();

      let response = await GoogleOneTapSignIn.signIn();
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
      }
      if (!isSuccessResponse(response)) {
        // Previously a bare `return` here — every non-success outcome (no
        // account on the device, the user backing out, or Credential
        // Manager silently cancelling after an account was already picked —
        // which the native module's own comments flag as the usual symptom
        // of a release build's SHA-1 not being registered on the Android
        // OAuth client) landed here with zero feedback: the button just
        // reset with no explanation. Surface it instead of hiding it.
        onError(new Error(`google_sign_in_incomplete:${response.type}`));
        return;
      }

      await onToken(response.data.idToken);
    } catch (error) {
      onError(error);
    } finally {
      setProviderLoading(false);
    }
  }

  const busy = loading || providerLoading;

  return (
    <Pressable
      accessibilityLabel={t("auth.continueGoogle")}
      accessibilityRole="button"
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={() => void handlePress()}
      style={({ pressed }) => [styles.button, pressed && !busy ? styles.pressed : null]}
    >
      {busy ? (
        <ActivityIndicator color={WarshPalette.subtleBrown} />
      ) : (
        <>
          <Image
            source={require("../assets/images/google-g.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{t("auth.continueGoogle")}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    borderRadius: Radii.sm,
  },
  pressed: {
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
    color: WarshPalette.subtleBrown,
  },
});
