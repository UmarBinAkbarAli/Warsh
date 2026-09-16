import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { NativeModules, Platform } from "react-native";
import Constants from "expo-constants";
import { API_BASE_URL } from "./apiBaseUrl";
import type { User } from "@stores/authStore";
import { trackRestoreCredentialCreated, trackRestoreSignIn } from "./analytics";

/**
 * Android Restore Credentials (Zero-Tap Sign-In).
 *
 * After every sign-in the device silently creates a restore key — a FIDO2
 * credential Google Backup and device-to-device transfer carry to the user's
 * next phone. On first launch there, before any screen is shown, the app
 * signs the server's challenge with that key and receives a normal Warsh
 * session, so the learner lands on the Learn tab instead of the login screen.
 *
 * Nothing about the JWT is backed up: the token lives in SecureStore, which
 * does not transfer, and the restore key only ever proves identity to
 * `/api/auth/restore/verify`. Signing out clears the key on the device and
 * revokes it on the server; a password change/reset revokes every device's.
 *
 * Every entry point is a no-op on web, iOS, Android < 9 and devices without
 * Play services, and never throws — the login screen is always the fallback.
 */

type NativeStatus<T extends string> = { status: T | "unsupported" | "failed"; reason?: string };
type CreateResult = NativeStatus<"created"> & { cloudBackup?: boolean; responseJson?: string };
type GetResult = NativeStatus<"found" | "none"> & { responseJson?: string };
type ClearResult = NativeStatus<"cleared">;

type NativeRestoreModule = {
  isSupported: () => Promise<boolean>;
  createRestoreCredential: (requestJson: string) => Promise<CreateResult>;
  getRestoreCredential: (requestJson: string) => Promise<GetResult>;
  clearRestoreCredential: () => Promise<ClearResult>;
};

// The credential id of the key this device registered, per account. Its
// presence is only a hint to skip re-registration; the server is authoritative.
const storageKey = (userId: string) => `warsh_restore_credential_${userId}`;

// Bounds the silent restore attempt so a slow network never holds the splash.
const RESTORE_TIMEOUT_MS = 8000;

// A private axios client rather than the shared `api` instance: that one
// imports the auth store (which imports this file for sign-out), and its 401
// refresh interceptor has no business running before or during sign-out.
// The token is passed in explicitly for the same reason.
function client(token?: string | null) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: RESTORE_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      "X-Warsh-Platform": Platform.OS,
      "X-Warsh-App-Version": Constants.expoConfig?.version ?? "unknown",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function getNativeModule(): NativeRestoreModule | null {
  if (Platform.OS !== "android") return null;
  const module = NativeModules.WarshRestoreCredentials as NativeRestoreModule | undefined;
  return module?.getRestoreCredential ? module : null;
}

/**
 * Creates and registers a restore key for the signed-in user if this device
 * does not already hold one. Safe to call on every launch and sign-in.
 */
export async function ensureRestoreCredential(userId: string, token: string): Promise<void> {
  const native = getNativeModule();
  if (!native) return;

  try {
    if (await AsyncStorage.getItem(storageKey(userId))) return;

    const api = client(token);
    const optionsResponse = await api.post("/api/auth/restore/register/options");
    const { challengeId, options } = optionsResponse.data.data as {
      challengeId: string;
      options: Record<string, unknown>;
    };

    const created = await native.createRestoreCredential(JSON.stringify(options));
    if (created.status !== "created" || !created.responseJson) {
      // "unsupported"/"failed" (no Play services, Credential Manager
      // unavailable) is a per-device state, not an error to surface.
      return;
    }

    const registerResponse = await api.post("/api/auth/restore/register", {
      challengeId,
      response: JSON.parse(created.responseJson),
      cloudBackup: created.cloudBackup !== false,
    });
    const credentialId = registerResponse.data.data.credentialId as string;
    await AsyncStorage.setItem(storageKey(userId), credentialId);
    trackRestoreCredentialCreated(created.cloudBackup !== false);
  } catch {
    // Retried on the next launch; the account is never blocked on this.
  }
}

export type RestoredSession = { user: User; token: string };

/**
 * Tries to sign in silently with a restore key carried onto this device.
 * Resolves the new session (the caller stores it), or null in every other
 * case — no key, unsupported device, network down, key revoked.
 */
export async function attemptRestoreSignIn(): Promise<RestoredSession | null> {
  const native = getNativeModule();
  if (!native) return null;

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), RESTORE_TIMEOUT_MS));
  return Promise.race([restoreSignIn(native), timeout]).catch(() => null);
}

async function restoreSignIn(native: NativeRestoreModule): Promise<RestoredSession | null> {
  const api = client();
  const optionsResponse = await api.post("/api/auth/restore/options");
  const { challengeId, options } = optionsResponse.data.data as {
    challengeId: string;
    options: Record<string, unknown>;
  };

  const found = await native.getRestoreCredential(JSON.stringify(options));
  if (found.status !== "found" || !found.responseJson) return null;

  const verifyResponse = await api.post("/api/auth/restore/verify", {
    challengeId,
    response: JSON.parse(found.responseJson),
  });
  const { user, token, credentialId } = verifyResponse.data.data as {
    user: User;
    token: string;
    credentialId: string;
  };

  await AsyncStorage.setItem(storageKey(user.id), credentialId);
  trackRestoreSignIn();
  return { user, token };
}

/**
 * Sign-out / account deletion / dead session: revoke this device's key on the
 * server (while the token is still valid), then delete it locally so a backup
 * taken later cannot revive the account on another phone.
 */
export async function forgetRestoreCredential(userId: string | null, token: string | null): Promise<void> {
  const native = getNativeModule();
  if (!native) return;

  try {
    if (userId) {
      const credentialId = await AsyncStorage.getItem(storageKey(userId));
      if (credentialId) {
        if (token) {
          await client(token).delete("/api/auth/restore", { data: { credentialId } }).catch(() => {});
        }
        await AsyncStorage.removeItem(storageKey(userId));
      }
    }
    await native.clearRestoreCredential();
  } catch {
    // Best effort; the server-side revocation is what protects the account.
  }
}
