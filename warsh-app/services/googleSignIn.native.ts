import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

let configuredClientId: string | null = null;

export function ensureGoogleSignInConfigured() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("Google sign-in is not configured for this build.");
  }
  if (configuredClientId !== clientId) {
    GoogleOneTapSignIn.configure({ webClientId: clientId });
    configuredClientId = clientId;
  }
}

export async function signOutGoogle() {
  if (!configuredClientId) return;
  await GoogleOneTapSignIn.signOut();
}
