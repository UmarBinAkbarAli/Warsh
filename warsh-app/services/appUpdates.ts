import { Linking, NativeModules, Platform } from "react-native";

const PLAY_PACKAGE = "com.warsh.app";
const PLAY_MARKET_URL = `market://details?id=${PLAY_PACKAGE}`;
const PLAY_WEB_URL = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;

export type PlayUpdateInfo = {
  supported: boolean;
  installedFromPlay: boolean;
  available: boolean;
  installedVersionCode: number;
  availableVersionCode: number;
  availability: number;
  priority: number;
  flexibleAllowed: boolean;
  immediateAllowed: boolean;
  stalenessDays?: number;
  diagnostic?: string;
};

type NativePlayUpdateModule = {
  getUpdateInfo: () => Promise<PlayUpdateInfo>;
};

const unavailableInfo: PlayUpdateInfo = {
  supported: false,
  installedFromPlay: false,
  available: false,
  installedVersionCode: 0,
  availableVersionCode: 0,
  availability: 0,
  priority: 0,
  flexibleAllowed: false,
  immediateAllowed: false,
};

function getNativeModule(): NativePlayUpdateModule | null {
  if (Platform.OS !== "android") return null;
  const module = NativeModules.WarshInAppUpdates as NativePlayUpdateModule | undefined;
  return module?.getUpdateInfo ? module : null;
}

export async function getPlayUpdateInfo(): Promise<PlayUpdateInfo> {
  const module = getNativeModule();
  if (!module) return unavailableInfo;

  try {
    return await module.getUpdateInfo();
  } catch {
    return unavailableInfo;
  }
}

export async function openPlayStoreUpdate(): Promise<void> {
  if (Platform.OS === "android") {
    try {
      await Linking.openURL(PLAY_MARKET_URL);
      return;
    } catch {
      // Devices without a usable Play Store fall back to the web listing.
    }
  }

  await Linking.openURL(PLAY_WEB_URL);
}
