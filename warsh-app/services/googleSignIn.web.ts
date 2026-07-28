export function ensureGoogleSignInConfigured() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("Google sign-in is not configured for this build.");
  }
}

export async function signOutGoogle() {
  if (typeof window === "undefined") return;
  (window as any).google?.accounts.id.disableAutoSelect();
}
