import { GoogleSignInButton } from "react-native-nitro-google-signin";
import { ensureGoogleSignInConfigured } from "@services/googleSignIn";

type Props = {
  loading?: boolean;
  onToken: (idToken: string) => void | Promise<void>;
  onError: (error: unknown) => void;
};

export function GoogleAuthButton({ loading = false, onToken, onError }: Props) {
  return (
    <GoogleSignInButton
      accessibilityLabel="Continue with Google"
      colorScheme="light"
      size="wide"
      contentAlignment="center"
      signInBehavior="credentialManager"
      loading={loading}
      disabled={loading}
      style={{ width: "100%", height: 54 }}
      onPress={ensureGoogleSignInConfigured}
      onSignInSuccess={(data) => {
        void onToken(data.idToken);
      }}
      onSignInError={onError}
    />
  );
}
