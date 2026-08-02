import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  GoogleOneTapSignIn,
  GoogleSignInButton,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { ensureGoogleSignInConfigured } from "@services/googleSignIn";

type Props = {
  loading?: boolean;
  onToken: (idToken: string) => void | Promise<void>;
  onError: (error: unknown) => void;
};

export function GoogleAuthButton({ loading = false, onToken, onError }: Props) {
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
    <View style={styles.container}>
      <View
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <GoogleSignInButton
          colorScheme="light"
          size="wide"
          contentAlignment="center"
          signInBehavior="none"
          loading={busy}
          disabled={busy}
          style={styles.nativeButton}
        />
      </View>
      <Pressable
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={() => void handlePress()}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 54,
  },
  nativeButton: {
    width: "100%",
    height: 54,
  },
});
