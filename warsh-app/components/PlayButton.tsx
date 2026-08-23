import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { getCachedCatalogAudioUri, getCachedRemoteAudioUri, getVocabWordAudioUri } from "@services/audioCache";
import { Fonts, FontSizes, Radii, WarshPalette } from "../constants/theme";

type PlayButtonProps = {
  text: string;
  cacheKey?: string;
  category?: "words" | "phrases" | "lessons";
  // When set, uses prebuilt R2-backed vocabulary audio.
  wordId?: string;
  audioUrl?: string;
  size?: number;
  color?: string;
  // When set, renders as a labelled navy pill instead of a bare icon — used
  // where the audio control has to carry its own weight (Discover cards),
  // rather than sitting as a hint beside text.
  label?: string;
  autoPlay?: boolean;
};

type PlayState = "idle" | "loading" | "playing" | "error";

export function PlayButton({ text, cacheKey, category = "words", wordId, audioUrl, size = 20, color = WarshPalette.gold, label, autoPlay = false }: PlayButtonProps) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const soundRef = useRef<Audio.Sound | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const resolveUri = useCallback(async () => {
    if (audioUrl) {
      // Quran recitation (open-source reciter on everyayah, or the future
      // premium R2 `audio/quran/…` files) must play the authentic recording.
      // If it fails we surface an error — never disguise it with generated TTS.
      const isRecitation = /everyayah\.com|\/audio\/quran\//.test(audioUrl);
      try {
        return await getCachedRemoteAudioUri(audioUrl, cacheKey ?? text, category);
      } catch (err) {
        if (isRecitation) throw err;
      }
    }
    return wordId
      ? getVocabWordAudioUri(wordId, text)
      : getCachedCatalogAudioUri({ text, cacheKey, category });
  }, [text, cacheKey, category, wordId, audioUrl]);

  const startPlay = useCallback(async () => {
    if (!mountedRef.current) return;
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => undefined);
      await soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
    setPlayState("loading");
    try {
      const uri = await resolveUri();

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
  }, [resolveUri]);

  useEffect(() => {
    if (!autoPlay || !text) return;
    // The 350ms delay exists to let the screen transition settle before sound
    // starts — but there is no reason to spend it idle. Resolving the URI now
    // means the download is already in flight (or done) when playback fires; the
    // in-flight dedupe in audioCache makes startPlay join it rather than refetch.
    void resolveUri().catch(() => undefined);
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
  }, [autoPlay, text, startPlay, resolveUri]);

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

  const iconColor = playState === "error" ? WarshPalette.wrongBorder : color;
  const icon = (
    <Ionicons
      name={playState === "playing" ? "stop-circle-outline" : playState === "error" ? "alert-circle-outline" : "volume-medium-outline"}
      size={size}
      color={iconColor}
    />
  );

  if (label) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={handlePress}
        disabled={playState === "loading"}
        style={({ pressed }) => [styles.pill, pressed ? styles.pillPressed : null]}
      >
        {playState === "loading" ? <ActivityIndicator size="small" color={color} /> : icon}
        <Text style={[styles.pillLabel, { color: iconColor }]}>{label}</Text>
      </Pressable>
    );
  }

  if (playState === "loading") {
    return (
      <Pressable style={styles.button} disabled>
        <ActivityIndicator size="small" color={color} />
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Play pronunciation" onPress={handlePress} style={styles.button}>
      {icon}
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
  // Labelled variant: navy surface so the gold-light mark reads at full
  // contrast, and a real 48pt target rather than the 36pt icon box.
  pill: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 22,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.navy,
  },
  pillPressed: {
    backgroundColor: WarshPalette.navyDeep,
  },
  pillLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
});
