import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const KEY = "warsh_mic_permission";

export type MicPermissionStatus = "not_asked" | "granted" | "denied" | "denied_permanent";

export async function getMicPermissionStatus(): Promise<MicPermissionStatus> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    return (stored as MicPermissionStatus) ?? "not_asked";
  } catch {
    return "not_asked";
  }
}

export async function requestMicPermission(): Promise<MicPermissionStatus> {
  try {
    const stored = await getMicPermissionStatus();
    if (stored === "denied_permanent") return "denied_permanent";

    const result = await Audio.requestPermissionsAsync();
    let status: MicPermissionStatus;

    if (result.status === "granted") {
      status = "granted";
    } else if (stored === "denied") {
      // Second denial — system won't show prompt again
      status = "denied_permanent";
    } else {
      status = "denied";
    }

    await AsyncStorage.setItem(KEY, status);
    return status;
  } catch {
    return "denied";
  }
}

export async function recheckMicPermission(): Promise<MicPermissionStatus> {
  try {
    const result = await Audio.getPermissionsAsync();
    if (result.status === "granted") {
      await AsyncStorage.setItem(KEY, "granted");
      return "granted";
    }
    return getMicPermissionStatus();
  } catch {
    return getMicPermissionStatus();
  }
}
