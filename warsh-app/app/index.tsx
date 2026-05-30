import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@stores/authStore";
import { WarshPalette } from "../constants/theme";

export const PREVIEW_SEEN_KEY = "warsh_preview_seen";

export default function Index() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const [previewChecked, setPreviewChecked] = useState(false);
  const [hasSeenPreview, setHasSeenPreview] = useState(false);
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  // Animation values
  const latinOpacity = useRef(new Animated.Value(0)).current;
  const arabicOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(PREVIEW_SEEN_KEY).then((val) => {
      setHasSeenPreview(val === "1");
      setPreviewChecked(true);
    });
  }, []);

  // Run the splash animation sequence
  useEffect(() => {
    // Latin + separator fade in over 600ms
    Animated.timing(latinOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Arabic "وَرْش" illuminates at ~1000ms total
      Animated.timing(arabicOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        // Tagline fades in subtly
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Hold ~500ms then allow navigation
          const timer = setTimeout(() => setReadyToNavigate(true), 500);
          return () => clearTimeout(timer);
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || !previewChecked || !readyToNavigate) return;
    if (token) {
      router.replace("/(app)/(tabs)");
    } else if (hasSeenPreview) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/(auth)/preview/a1-welcome");
    }
  }, [isHydrated, previewChecked, token, hasSeenPreview, readyToNavigate]);

  return (
    <View style={styles.container}>
      {/* Subtle background seal motif — just a large dim Arabic letter */}
      <Text style={styles.sealMotif} aria-hidden>ش</Text>

      {/* Main lockup */}
      <View style={styles.lockup}>
        {/* Latin + separator animates together */}
        <Animated.View style={[styles.lockupRow, { opacity: latinOpacity }]}>
          <Text style={styles.latinWord}>Warsh</Text>
          <Text style={styles.separator}> · </Text>
        </Animated.View>

        {/* Arabic "وَرْش" illuminates last */}
        <Animated.Text style={[styles.arabicWord, { opacity: arabicOpacity }]}>
          وَرْش
        </Animated.Text>
      </View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Where Arabic is crafted.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarshPalette.creamBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sealMotif: {
    position: "absolute",
    fontSize: 320,
    fontFamily: "Scheherazade New Bold",
    color: WarshPalette.parchment,
    opacity: 0.35,
    letterSpacing: 0,
  },
  lockup: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  lockupRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  latinWord: {
    fontFamily: "Lora-Bold",
    fontSize: 36,
    color: WarshPalette.ink,
    letterSpacing: 1,
  },
  separator: {
    fontFamily: "Lora-Regular",
    fontSize: 28,
    color: WarshPalette.sage,
  },
  arabicWord: {
    fontFamily: "Scheherazade New Bold",
    fontSize: 42,
    color: WarshPalette.gold,
    // The Arabic glyph sits slightly lower by default — align with baseline
    lineHeight: 52,
  },
  tagline: {
    fontFamily: "Lora-Italic",
    fontSize: 14,
    color: WarshPalette.sage,
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
