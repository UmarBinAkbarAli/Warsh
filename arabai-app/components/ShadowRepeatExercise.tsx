import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { ArabicText } from "./ArabicText";
import { WaveformBars } from "./WaveformBars";
import { BrandButton } from "./BrandButton";
import { getMicPermissionStatus, requestMicPermission } from "@services/micPermission";
import { WarshPalette, Fonts } from "../constants/theme";

type Props = {
  arabic: string;
  transliteration?: string;
  translation?: string;
  // When provided, the Play button fetches this URI; otherwise it shows a play icon that does nothing (audio not yet available)
  originalAudioUri?: string;
  onComplete: (recorded: boolean) => void;
};

type State = "prepare" | "listening" | "ready" | "recording" | "comparison" | "done";

const MAX_RECORDING_MS = 15_000;
const NOOR_MESSAGES = ["Well spoken", "Keep going", "Barak Allahu feek", "Ma shaa Allah"];

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: ".aac",
    outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: ".wav",
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.LOW,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: { mimeType: "audio/webm", bitsPerSecond: 64000 },
  isMeteringEnabled: true,
};

export function ShadowRepeatExercise({ arabic, transliteration, translation, originalAudioUri, onComplete }: Props) {
  const [state, setState] = useState<State>("prepare");
  const [hasListened, setHasListened] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [liveLevels, setLiveLevels] = useState<number[]>([]);
  const [originalPlaying, setOriginalPlaying] = useState(false);
  const [userPlaying, setUserPlaying] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [noorMessage] = useState(() => NOOR_MESSAGES[Math.floor(Math.random() * NOOR_MESSAGES.length)]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const originalSoundRef = useRef<Audio.Sound | null>(null);
  const userSoundRef = useRef<Audio.Sound | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  async function cleanup() {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    if (originalSoundRef.current) {
      try {
        await originalSoundRef.current.unloadAsync();
      } catch {}
      originalSoundRef.current = null;
    }
    if (userSoundRef.current) {
      try {
        await userSoundRef.current.unloadAsync();
      } catch {}
      userSoundRef.current = null;
    }
    // Delete any recording file
    if (recordingUri) {
      FileSystem.deleteAsync(recordingUri, { idempotent: true }).catch(() => {});
    }
  }

  async function playOriginal() {
    if (originalPlaying) {
      await originalSoundRef.current?.stopAsync();
      await originalSoundRef.current?.unloadAsync();
      originalSoundRef.current = null;
      setOriginalPlaying(false);
      return;
    }

    if (!originalAudioUri) {
      // No audio available yet — just mark as listened so user can proceed
      setHasListened(true);
      if (state === "prepare") setState("listening");
      return;
    }

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
      const { sound } = await Audio.Sound.createAsync({ uri: originalAudioUri });
      originalSoundRef.current = sound;
      setOriginalPlaying(true);
      setHasListened(true);
      if (state === "prepare") setState("listening");

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          originalSoundRef.current = null;
          setOriginalPlaying(false);
          if (state === "prepare" || state === "listening") setState("ready");
        }
      });

      await sound.playAsync();
    } catch {
      setOriginalPlaying(false);
      setHasListened(true);
      if (state === "prepare") setState("ready");
    }
  }

  async function handleSpeakPress() {
    const permStatus = await getMicPermissionStatus();
    if (permStatus === "granted") {
      await startRecording();
    } else if (permStatus === "denied_permanent") {
      setPermissionDenied(true);
      setShowPermissionModal(true);
    } else {
      setShowPermissionModal(true);
    }
  }

  async function handleEnableMic() {
    setShowPermissionModal(false);
    const result = await requestMicPermission();
    if (result === "granted") {
      await startRecording();
    } else if (result === "denied_permanent") {
      setPermissionDenied(true);
    }
  }

  function handleSkip() {
    setShowPermissionModal(false);
    onComplete(false);
  }

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      recording.setProgressUpdateInterval(150);
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          const normalised = Math.max(0, Math.min(1, (status.metering + 60) / 60));
          setLiveLevels((prev) => [...prev.slice(-19), normalised]);
        }
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setState("recording");

      autoStopTimerRef.current = setTimeout(() => {
        void stopRecording();
      }, MAX_RECORDING_MS);
    } catch {
      // If recording fails, treat as skipped
      onComplete(false);
    }
  }

  const stopRecording = useCallback(async () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setRecordingUri(uri ?? null);
      setState("comparison");
      setLiveLevels([]);
    } catch {
      recordingRef.current = null;
      setState("comparison");
    }
  }, []);

  async function playUserRecording() {
    if (!recordingUri) return;
    if (userPlaying) {
      await userSoundRef.current?.stopAsync();
      await userSoundRef.current?.unloadAsync();
      userSoundRef.current = null;
      setUserPlaying(false);
      return;
    }

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      userSoundRef.current = sound;
      setUserPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          userSoundRef.current = null;
          setUserPlaying(false);
        }
      });

      await sound.playAsync();
    } catch {
      setUserPlaying(false);
    }
  }

  async function playCompare() {
    // Play original then user back-to-back
    if (originalAudioUri) {
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        const { sound: orig } = await Audio.Sound.createAsync({ uri: originalAudioUri });
        setOriginalPlaying(true);
        orig.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            orig.unloadAsync().catch(() => {});
            setOriginalPlaying(false);
            // Short pause then play user recording
            await new Promise((r) => setTimeout(r, 500));
            if (recordingUri) {
              const { sound: user } = await Audio.Sound.createAsync({ uri: recordingUri });
              userSoundRef.current = user;
              setUserPlaying(true);
              user.setOnPlaybackStatusUpdate((us) => {
                if (us.isLoaded && us.didJustFinish) {
                  user.unloadAsync().catch(() => {});
                  userSoundRef.current = null;
                  setUserPlaying(false);
                }
              });
              await user.playAsync();
            }
          }
        });
        await orig.playAsync();
      } catch {}
    } else {
      void playUserRecording();
    }
  }

  async function reRecord() {
    // Discard old recording and restart
    if (recordingUri) {
      FileSystem.deleteAsync(recordingUri, { idempotent: true }).catch(() => {});
      setRecordingUri(null);
    }
    setLiveLevels([]);
    setState("ready");
  }

  function handleDone() {
    // Clean up recording file before advancing
    if (recordingUri) {
      FileSystem.deleteAsync(recordingUri, { idempotent: true }).catch(() => {});
    }
    setState("done");
    onComplete(true);
  }

  // ---------- Render helpers ----------

  function renderPermissionModal() {
    return (
      <Modal transparent animationType="fade" visible={showPermissionModal} onRequestClose={() => setShowPermissionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="mic-outline" size={40} color={WarshPalette.gold} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Speaking practice</Text>
            <Text style={styles.modalBody}>
              To record yourself saying this phrase, Warsh needs access to your microphone.
            </Text>
            <Text style={styles.modalPrivacy}>
              Your recording stays on this device. We don't upload, store, or analyse it.
            </Text>
            {permissionDenied ? (
              <Text style={styles.modalDenied}>Microphone is currently disabled in your device settings.</Text>
            ) : null}
            <View style={styles.modalActions}>
              {!permissionDenied ? (
                <BrandButton title="Enable microphone" onPress={() => void handleEnableMic()} style={styles.modalPrimaryBtn} />
              ) : null}
              <Pressable onPress={handleSkip} style={styles.modalSkipBtn}>
                <Text style={styles.modalSkipText}>Skip this exercise</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // State: prepare or ready
  if (state === "prepare" || state === "listening" || state === "ready") {
    const micEnabled = state === "ready" || (state === "listening" && hasListened);
    return (
      <View style={styles.container}>
        {renderPermissionModal()}
        <View style={styles.phraseCard}>
          <ArabicText size="xl" style={styles.arabic}>{arabic}</ArabicText>
          {transliteration ? <Text style={styles.transliteration}>{transliteration}</Text> : null}
          {translation ? <Text style={styles.translation}>{translation}</Text> : null}
          <View style={styles.waveformRow}>
            <WaveformBars color={WarshPalette.gold} height={28} />
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => void playOriginal()} style={[styles.playBtn, originalPlaying ? styles.playBtnActive : null]}>
            {originalPlaying ? (
              <ActivityIndicator size="small" color={WarshPalette.cream} />
            ) : (
              <Ionicons name="volume-medium-outline" size={26} color={WarshPalette.cream} />
            )}
            <Text style={styles.playBtnLabel}>{hasListened ? "Listen again" : "Listen first"}</Text>
          </Pressable>

          <Pressable
            onPress={micEnabled ? () => void handleSpeakPress() : undefined}
            style={[styles.speakBtn, micEnabled ? styles.speakBtnEnabled : styles.speakBtnDisabled]}
            disabled={!micEnabled}
          >
            <Ionicons name="mic-outline" size={26} color={micEnabled ? WarshPalette.cream : "#A09888"} />
            <Text style={[styles.speakBtnLabel, !micEnabled ? styles.speakBtnLabelDisabled : null]}>
              {permissionDenied ? "Enable microphone in Settings" : "Speak"}
            </Text>
          </Pressable>
        </View>

        {state === "prepare" ? (
          <Text style={styles.hint}>Listen to the phrase, then record yourself.</Text>
        ) : state === "listening" ? (
          <Text style={styles.hint}>Now you try</Text>
        ) : null}
      </View>
    );
  }

  // State: recording
  if (state === "recording") {
    return (
      <View style={styles.container}>
        <View style={styles.phraseCard}>
          <ArabicText size="xl" style={styles.arabic}>{arabic}</ArabicText>
          {translation ? <Text style={styles.translation}>{translation}</Text> : null}
          <View style={styles.waveformRow}>
            <WaveformBars levels={liveLevels.length >= 5 ? liveLevels : undefined} color={WarshPalette.sage} height={28} />
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => void stopRecording()} style={[styles.speakBtn, styles.recordingBtn]}>
            <View style={styles.recordingPulse} />
            <Text style={styles.speakBtnLabel}>Stop recording</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>Tap stop when finished — max 15 seconds</Text>
      </View>
    );
  }

  // State: comparison
  if (state === "comparison") {
    return (
      <View style={styles.container}>
        <View style={styles.phraseCard}>
          <ArabicText size="lg" style={styles.arabic}>{arabic}</ArabicText>
          {translation ? <Text style={styles.translation}>{translation}</Text> : null}
        </View>

        <View style={styles.comparisonPanel}>
          <Pressable onPress={() => void playOriginal()} style={[styles.audioRow, originalPlaying ? styles.audioRowActive : null]}>
            <Text style={styles.audioLabel}>Original</Text>
            <WaveformBars color={originalPlaying ? WarshPalette.gold : "#C0B890"} height={24} />
            <Ionicons name={originalPlaying ? "stop-circle-outline" : "play-circle-outline"} size={28} color={WarshPalette.gold} />
          </Pressable>

          <Pressable onPress={() => void playUserRecording()} style={[styles.audioRow, userPlaying ? styles.audioRowActive : null]}>
            <Text style={styles.audioLabel}>You</Text>
            <WaveformBars color={userPlaying ? WarshPalette.sage : "#90A890"} height={24} />
            <Ionicons name={userPlaying ? "stop-circle-outline" : "play-circle-outline"} size={28} color={WarshPalette.sage} />
          </Pressable>

          <Pressable onPress={() => void playCompare()} style={styles.compareBtn}>
            <Text style={styles.compareBtnText}>Compare</Text>
          </Pressable>
        </View>

        <View style={styles.comparisonActions}>
          <Pressable onPress={() => void reRecord()} style={styles.reRecordBtn}>
            <Text style={styles.reRecordText}>Record again</Text>
          </Pressable>
          <BrandButton title="Done" onPress={handleDone} style={styles.doneBtn} />
        </View>
      </View>
    );
  }

  // State: done (brief flash before parent advances)
  return (
    <View style={[styles.container, styles.doneContainer]}>
      <Text style={styles.noorMessage}>{noorMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
  },
  phraseCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#C8C0A8",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#EDE8D8",
    alignItems: "center",
  },
  arabic: {
    color: "#0F1117",
    fontSize: 32,
    lineHeight: 46,
    textAlign: "center",
  },
  transliteration: {
    marginTop: 6,
    color: "#9A8F6A",
    fontFamily: Fonts.italic,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  translation: {
    marginTop: 4,
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  waveformRow: {
    marginTop: 12,
    alignItems: "center",
  },
  controls: {
    gap: 12,
    marginBottom: 16,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#0F1117",
  },
  playBtnActive: {
    backgroundColor: "#3A5030",
  },
  playBtnLabel: {
    color: "#F5F2EA",
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    fontWeight: "500",
  },
  speakBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  speakBtnEnabled: {
    backgroundColor: "#3A5030",
  },
  speakBtnDisabled: {
    backgroundColor: "#C8C0A8",
  },
  speakBtnLabel: {
    color: "#F5F2EA",
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    fontWeight: "500",
  },
  speakBtnLabelDisabled: {
    color: "#8A8070",
  },
  recordingBtn: {
    backgroundColor: "#8B3A3A",
  },
  recordingPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF5555",
  },
  hint: {
    textAlign: "center",
    color: "#9A8F6A",
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  comparisonPanel: {
    gap: 8,
    marginBottom: 20,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#D8D0BE",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  audioRowActive: {
    borderColor: "#9A8F6A",
    backgroundColor: "#FEF9E7",
  },
  audioLabel: {
    width: 52,
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  compareBtn: {
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#C8C0A8",
    borderRadius: 8,
    backgroundColor: "#F5F2EA",
  },
  compareBtnText: {
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  comparisonActions: {
    flexDirection: "row",
    gap: 12,
  },
  reRecordBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#D8D0BE",
    borderRadius: 10,
    backgroundColor: "#F5F2EA",
  },
  reRecordText: {
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  doneBtn: {
    flex: 1,
  },
  doneContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  noorMessage: {
    color: "#9A8F6A",
    fontFamily: Fonts.italic,
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  // Permission modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#F5F2EA",
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    color: "#0F1117",
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 8,
  },
  modalBody: {
    color: "#5A5240",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  modalPrivacy: {
    color: "#9A8F6A",
    fontFamily: Fonts.italic,
    fontSize: 11,
    fontStyle: "italic",
    lineHeight: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  modalDenied: {
    color: "#8B4A3A",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  modalActions: {
    alignSelf: "stretch",
    gap: 8,
  },
  modalPrimaryBtn: {
    alignSelf: "stretch",
  },
  modalSkipBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  modalSkipText: {
    color: "#9A8F6A",
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
