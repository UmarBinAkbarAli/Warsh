import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { FontSizes, Fonts, Spacing, WarshPalette } from "../../constants/theme";

const SLIDE_DURATION = 300;
const POLL_INTERVAL_MS = 15000;

export function OfflineBar() {
  const [isOffline, setIsOffline] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        await api.get("/api/health");
        if (mounted) {
          if (isOffline) {
            // Was offline, now back — slide out
            Animated.timing(translateY, {
              toValue: -40,
              duration: SLIDE_DURATION,
              useNativeDriver: true,
            }).start(() => {
              if (mounted) setIsOffline(false);
            });
          } else {
            setIsOffline(false);
          }
        }
      } catch (err: unknown) {
        // Only treat as offline if there is no response (network error)
        const axiosErr = err as { response?: unknown };
        if (!axiosErr.response && mounted) {
          setIsOffline(true);
        }
      } finally {
        if (mounted) setHasChecked(true);
      }
    }

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slide in when offline becomes true
  useEffect(() => {
    if (isOffline) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, translateY]);

  if (!hasChecked || !isOffline) {
    return null;
  }

  return (
    <Animated.View style={[styles.bar, { transform: [{ translateY }] }]}>
      <Ionicons
        name="wifi-outline"
        size={14}
        color={WarshPalette.white}
        style={styles.icon}
      />
      <Text style={styles.label}>Offline · your progress is being saved</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 36,
    backgroundColor: WarshPalette.sage,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.white,
  },
});
