import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { getCachedTtsAudioUri } from "../services/audioCache";
import { WarshPalette } from "../../constants/theme";

type PlayButtonProps = {
  text: string;
  cacheKey?: string;
  category?: "words" | "phrases" | "lessons";
  size?: number;
  color?: string;
};

type PlayState = "idle" | "loading" | "playing" | "error";

export function PlayButton({ text, cacheKey, category = "words", size = 20, color = WarshPalette.gold }: PlayButtonProps) {
  const [state, setState] = useState<PlayState>("idle");
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const handlePress = useCallback(async () => {
    if (state === "loading") return;

    if (state === "playing") {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      setState("idle");
      return;
    }

    setState("loading");
    try {
      const uri = await getCachedTtsAudioUri({ text, cacheKey, category });
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setState("playing");

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => undefined);
          soundRef.current = null;
          setState("idle");
        }
      });

      await sound.playAsync();
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }, [state, text, cacheKey, category]);

  if (state === "loading") {
    return (
      <Pressable style={styles.button} disabled>
        <ActivityIndicator size="small" color={color} />
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Play pronunciation" onPress={handlePress} style={styles.button}>
      <Ionicons
        name={state === "playing" ? "stop-circle-outline" : state === "error" ? "alert-circle-outline" : "volume-medium-outline"}
        size={size}
        color={state === "error" ? "#B07070" : color}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
