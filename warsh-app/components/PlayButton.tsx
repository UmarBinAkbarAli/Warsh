import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { getCachedRemoteAudioUri, getCachedTtsAudioUri, getVocabWordAudioUri } from "@services/audioCache";
import { WarshPalette } from "../constants/theme";

type PlayButtonProps = {
  text: string;
  cacheKey?: string;
  category?: "words" | "phrases" | "lessons";
  // When set, uses R2-backed vocab audio (generates once, CDN for all users)
  wordId?: string;
  audioUrl?: string;
  size?: number;
  color?: string;
  autoPlay?: boolean;
};

type PlayState = "idle" | "loading" | "playing" | "error";

export function PlayButton({ text, cacheKey, category = "words", wordId, audioUrl, size = 20, color = WarshPalette.gold, autoPlay = false }: PlayButtonProps) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const soundRef = useRef<Audio.Sound | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const startPlay = useCallback(async () => {
    if (!mountedRef.current) return;
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => undefined);
      await soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
    setPlayState("loading");
    try {
      let uri: string;
      if (audioUrl) {
        // Quran recitation (open-source reciter on everyayah, or the future
        // premium R2 `audio/quran/…` files) must play the authentic recording.
        // If it fails we surface an error — never disguise it with generated TTS.
        const isRecitation = /everyayah\.com|\/audio\/quran\//.test(audioUrl);
        try {
          uri = await getCachedRemoteAudioUri(audioUrl, cacheKey ?? text, category);
        } catch (err) {
          if (isRecitation) throw err;
          uri = wordId
            ? await getVocabWordAudioUri(wordId, text)
            : await getCachedTtsAudioUri({ text, cacheKey, category });
        }
      } else {
        uri = wordId
          ? await getVocabWordAudioUri(wordId, text)
          : await getCachedTtsAudioUri({ text, cacheKey, category });
      }

      if (!mountedRef.current) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri });
      if (!mountedRef.current) { sound.unloadAsync().catch(() => undefined); return; }
      soundRef.current = sound;
      setPlayState("playing");
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => undefined);
          if (mountedRef.current) {
            soundRef.current = null;
            setPlayState("idle");
          }
        }
      });
      await sound.playAsync();
    } catch {
      if (mountedRef.current) {
        setPlayState("error");
        setTimeout(() => { if (mountedRef.current) setPlayState("idle"); }, 2000);
      }
    }
  }, [text, cacheKey, category, wordId, audioUrl]);

  useEffect(() => {
    if (!autoPlay || !text) return;
    const timer = setTimeout(startPlay, 350);
    return () => {
      clearTimeout(timer);
      if (soundRef.current && mountedRef.current) {
        soundRef.current.stopAsync().catch(() => undefined);
        soundRef.current.unloadAsync().catch(() => undefined);
        soundRef.current = null;
        setPlayState("idle");
      }
    };
  }, [autoPlay, text, startPlay]);

  const handlePress = useCallback(async () => {
    if (playState === "loading") return;
    if (playState === "playing") {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      setPlayState("idle");
      return;
    }
    void startPlay();
  }, [playState, startPlay]);

  if (playState === "loading") {
    return (
      <Pressable style={styles.button} disabled>
        <ActivityIndicator size="small" color={color} />
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Play pronunciation" onPress={handlePress} style={styles.button}>
      <Ionicons
        name={playState === "playing" ? "stop-circle-outline" : playState === "error" ? "alert-circle-outline" : "volume-medium-outline"}
        size={size}
        color={playState === "error" ? WarshPalette.wrongBorder : color}
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
