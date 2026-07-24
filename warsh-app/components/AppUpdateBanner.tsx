import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "../i18n";
import {
  getPlayUpdateInfo,
  openPlayStoreUpdate,
  type PlayUpdateInfo,
} from "../services/appUpdates";
import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Shadows,
  Spacing,
  WarshPalette,
} from "../constants/theme";
import { BrandButton } from "./BrandButton";

export function AppUpdateBanner() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [update, setUpdate] = useState<PlayUpdateInfo | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<number | null>(null);
  const [openingStore, setOpeningStore] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (Platform.OS !== "android") return;

    const info = await getPlayUpdateInfo();
    if (
      info.available &&
      info.availableVersionCode > info.installedVersionCode &&
      info.availableVersionCode !== dismissedVersion
    ) {
      setUpdate(info);
      return;
    }

    setUpdate(null);
  }, [dismissedVersion]);

  useEffect(() => {
    void checkForUpdate();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setOpeningStore(false);
        void checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, [checkForUpdate]);

  if (Platform.OS !== "android" || !update) return null;

  const dismiss = () => {
    setDismissedVersion(update.availableVersionCode);
    setUpdate(null);
  };

  const openUpdate = async () => {
    if (openingStore) return;
    setOpeningStore(true);
    try {
      await openPlayStoreUpdate();
    } finally {
      setOpeningStore(false);
    }
  };

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.container, { top: insets.top + Spacing.sm }]}
    >
      <View style={styles.headingRow}>
        <View style={styles.icon}>
          <Ionicons
            name="cloud-download-outline"
            size={24}
            color={WarshPalette.navy}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{t("updates.title")}</Text>
          <Text style={styles.body}>{t("updates.body")}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("updates.later")}
          hitSlop={12}
          onPress={dismiss}
          style={styles.close}
        >
          <Ionicons name="close" size={22} color={WarshPalette.subtleBrown} />
        </Pressable>
      </View>
      <BrandButton
        title={t("updates.action")}
        loading={openingStore}
        onPress={() => void openUpdate()}
        style={styles.updateButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 1000,
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    borderRadius: Radii.lg,
    backgroundColor: WarshPalette.parchmentBg,
    ...Shadows.goldGlow,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  icon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.highlightBg,
  },
  copy: {
    flex: 1,
    paddingTop: 1,
  },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },
  body: {
    marginTop: 2,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
    marginRight: -4,
  },
  updateButton: {
    minHeight: 52,
  },
});
