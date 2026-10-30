import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";
import { track } from "./analytics";
import { useAuthStore } from "@stores/authStore";

const SENT_KEY = "warsh_install_referrer_reported_v1";
const FIRST_ELIGIBLE_KEY = "warsh_first_eligible_session_reported_v1";
let reporting = false;

export async function reportFirstEligibleSession() {
  try {
    if (await AsyncStorage.getItem(FIRST_ELIGIBLE_KEY)) return;
    if (await track("first_eligible_app_session")) await AsyncStorage.setItem(FIRST_ELIGIBLE_KEY, "1");
  } catch { /* Analytics must not block startup. */ }
}

// Attribution is campaign-level evidence only, never proof of a user identity.
// Read only after an adult account is known; never persist the raw referrer.
export async function reportInstallAttribution() {
  if (Platform.OS !== "android" || !NativeModules.WarshInstallReferrer || reporting || !process.env.EXPO_PUBLIC_MIXPANEL_TOKEN) return;
  const userId = useAuthStore.getState().user?.id;
  reporting = true;
  try {
    if (await AsyncStorage.getItem(SENT_KEY)) return;
    const raw: string | null = await NativeModules.WarshInstallReferrer.getReferrer();
    if (!raw) return; // Retry a transient Play service failure next session.
    const { user, token } = useAuthStore.getState();
    if (!token || !userId || user?.id !== userId || user.isMinor !== false || !user.dateOfBirth) return;
    const params = new URLSearchParams(raw);
    const props: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = params.get(key);
      if (value && /^[a-zA-Z0-9_.-]{1,80}$/.test(value)) props[key] = value;
    }
    const queued = await track("install_referrer_resolved", { attribution_status: Object.keys(props).length ? "campaign" : "unknown", ...props });
    if (queued) await AsyncStorage.setItem(SENT_KEY, "1");
  } catch { /* Attribution must never block learning. */ }
  finally { reporting = false; }
}
