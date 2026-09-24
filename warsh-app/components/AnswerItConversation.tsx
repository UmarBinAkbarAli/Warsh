import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useT } from "@i18n/index";
import { pickLocalized, useLanguage } from "@services/language";
import { requestMicPermission } from "@services/micPermission";
import { biasingStrings, checkAlternatives, type AnswerCheck, type AnswerSlot } from "@services/answerMatch";
import { ArabicText } from "./ArabicText";
import { BrandButton } from "./BrandButton";
import { PlayButton } from "./PlayButton";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../constants/theme";

/**
 * "Answer it" — the spoken conversation in a Conversation Lab
 * (`spoken_phrases.lab.answer_it`). The friend asks a lesson phrase, the
 * learner answers out loud, and the device's own speech recogniser (Google on
 * Android, the browser's on web) turns the answer into text. Checking is word
 * level only — see services/answerMatch.ts. Never scored and never blocking:
 * Try again, Show answer and Skip are always there, and after three misses the
 * learner may move on without a check.
 *
 * Where no recogniser exists (no Google services, Safari/Firefox, Arabic not
 * supported) the same chat falls back to record-and-compare with the model
 * answer — the Say-it experience, with no check.
 *
 * Designed in warsh-app-UI-v2.pen — "26 — Answer It · Spoken Conversation".
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRecord = Record<string, any>;
type MeaningLanguage = "en" | "ur";
type Mode = "speech" | "fallback";
type Phase = "idle" | "listening" | "result" | "unheard";
type Done = { passed: boolean; check: AnswerCheck | null; recordingUri?: string | null };

const RECOGNITION_LANG = "ar-SA";
const MISSES_BEFORE_FREE_PASS = 3;

function text(value: AnyRecord | undefined, language: MeaningLanguage): string {
  if (!value) return "";
  return pickLocalized(value.en as string | undefined, value.ur as string | undefined, language) ?? "";
}

/** Prefixes prose with a direction mark so Android lays it out in the reading language. */
function directed(value: string, language: MeaningLanguage) {
  return (language === "ur" ? "‏" : "‎") + value;
}

function speechAvailable(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

export function hasAnswerIt(content: AnyRecord | null | undefined): boolean {
  return ((content?.spoken_phrases?.lab?.answer_it?.turns ?? []) as unknown[]).length > 0;
}

export function AnswerItConversation({
  content,
  header,
  contentStyle,
  onTurnSpoken,
  onDone,
}: {
  content: AnyRecord;
  header: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onTurnSpoken: () => void;
  onDone: () => void;
}) {
  const t = useT();
  const language = useLanguage() as MeaningLanguage;
  const rtl = language === "ur";
  const block = content.spoken_phrases as AnyRecord;
  const byId = useMemo(() => new Map(((block.phrases ?? []) as AnyRecord[]).map((row) => [row.id as string, row])), [block]);
  const turns = (block.lab?.answer_it?.turns ?? []) as AnyRecord[];

  const [mode, setMode] = useState<Mode>(() => (speechAvailable() ? "speech" : "fallback"));
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Done[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [partial, setPartial] = useState("");
  const [check, setCheck] = useState<AnswerCheck | null>(null);
  const [misses, setMisses] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const finalHandledRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const turn = turns[index];
  const finished = index >= turns.length;
  const slots = (turn?.slots ?? []) as AnswerSlot[];
  const freePass = misses >= MISSES_BEFORE_FREE_PASS;

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [index, phase, check, showAnswer, notice, recordingUri]);

  useEffect(() => () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // Nothing was listening.
    }
    recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
  }, []);

  function resetTurn() {
    setPhase("idle");
    setPartial("");
    setCheck(null);
    setMisses(0);
    setShowAnswer(false);
    setNotice(null);
    setRecordingUri(null);
  }

  function advance(entry: Done) {
    setDone((list) => [...list, entry]);
    setIndex((i) => i + 1);
    resetTurn();
  }

  function miss(message: string | null) {
    setMisses((n) => n + 1);
    setNotice(message);
  }

  function handleFinal(alternatives: string[]) {
    if (finalHandledRef.current) return;
    finalHandledRef.current = true;
    setPartial("");
    const result = checkAlternatives(alternatives, slots);
    if (!result) {
      setPhase("unheard");
      miss(null);
      return;
    }
    setCheck(result);
    if (result.passed) {
      onTurnSpoken();
      advance({ passed: true, check: result });
      return;
    }
    setPhase("result");
    miss(null);
  }

  useSpeechRecognitionEvent("result", (event) => {
    const alternatives = event.results.map((result) => result.transcript);
    if (event.isFinal) handleFinal(alternatives);
    else setPartial(alternatives[0] ?? "");
  });

  useSpeechRecognitionEvent("nomatch", () => handleFinal([]));

  useSpeechRecognitionEvent("error", (event) => {
    if (finalHandledRef.current || event.error === "aborted") return;
    finalHandledRef.current = true;
    setPartial("");
    if (event.error === "language-not-supported" || event.error === "service-not-allowed") {
      // This device cannot recognise Arabic: keep the chat, drop the check.
      setMode("fallback");
      setPhase("idle");
      setNotice(t("answerIt.unavailable"));
      return;
    }
    if (event.error === "not-allowed") {
      setPhase("idle");
      setNotice(t("answerIt.micDenied"));
      return;
    }
    setPhase("unheard");
    miss(event.error === "network" ? t("answerIt.network") : null);
  });

  useSpeechRecognitionEvent("end", () => {
    // Stopped without any final result (silence, or stop pressed too early).
    if (!finalHandledRef.current) handleFinal([]);
  });

  async function startListening() {
    if (!turn) return;
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync().catch(() => null);
    if (!permission?.granted) {
      setNotice(t("answerIt.micDenied"));
      return;
    }
    finalHandledRef.current = false;
    setCheck(null);
    setShowAnswer(false);
    setNotice(null);
    setPartial("");
    setPhase("listening");
    try {
      ExpoSpeechRecognitionModule.start({
        lang: RECOGNITION_LANG,
        interimResults: true,
        maxAlternatives: 5,
        continuous: false,
        contextualStrings: biasingStrings(slots),
      });
    } catch {
      finalHandledRef.current = true;
      setMode("fallback");
      setPhase("idle");
      setNotice(t("answerIt.unavailable"));
    }
  }

  function stopListening() {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      handleFinal([]);
    }
  }

  async function toggleRecording() {
    if (recording) {
      const current = recordingRef.current;
      recordingRef.current = null;
      setRecording(false);
      if (!current) return;
      await current.stopAndUnloadAsync().catch(() => undefined);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }).catch(() => undefined);
      setRecordingUri(current.getURI() ?? null);
      return;
    }
    const permission = await requestMicPermission();
    if (permission !== "granted") {
      setNotice(t("answerIt.micDenied"));
      return;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: next } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = next;
      setRecordingUri(null);
      setRecording(true);
    } catch {
      setNotice(t("answerIt.micDenied"));
    }
  }

  function skip() {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // Nothing was listening.
    }
    if (mode === "fallback" && recordingUri) onTurnSpoken();
    advance({ passed: false, check, recordingUri });
  }

  const passedCount = done.filter((entry) => entry.passed).length;

  return (
    <View style={[styles.screen, contentStyle]}>
      {header}
      <View style={[styles.pillRow, rtl && styles.rowReverse]}>
        <View style={[styles.pill, finished && styles.pillDone]}>
          <Text style={[styles.pillText, finished && styles.pillTextDone]}>
            {finished ? t("answerIt.completePill") : t("answerIt.pill")}
          </Text>
        </View>
        <Text style={styles.turnCount}>
          {finished
            ? t("answerIt.answeredOf", { count: passedCount, total: turns.length })
            : t("answerIt.turnOf", { current: index + 1, total: turns.length })}
        </Text>
      </View>
      {!finished ? <Text style={[styles.mission, rtl && styles.textRight]}>{directed(t("answerIt.mission"), language)}</Text> : null}

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatBody} showsVerticalScrollIndicator={false}>
        {turns.slice(0, Math.min(index + 1, turns.length)).map((item, turnIndex) => {
          const current = turnIndex === index;
          const past = done[turnIndex];
          return (
            <View key={turnIndex} style={styles.exchange}>
              <FriendBubble turn={item} row={byId.get(item.prompt_phrase_id as string)} language={language} rtl={rtl} autoPlay={current && phase === "idle" && !check} />
              {past ? (
                past.check ? (
                  <AnswerBubble check={past.check} rtl={rtl} verdict={past.passed ? t("answerIt.correct") : t("answerIt.skipped")} good={past.passed} />
                ) : (
                  <Note rtl={rtl} icon="play-skip-forward-outline" text={past.recordingUri ? t("answerIt.recorded") : t("answerIt.skipped")} />
                )
              ) : null}
            </View>
          );
        })}

        {!finished && turn ? (
          <View style={styles.exchange}>
            {mode === "speech" && phase === "listening" ? (
              <View style={[styles.turnYou, rtl && styles.turnYouRtl]}>
                <View style={[styles.bubble, styles.liveBubble, rtl ? styles.cornerRtl : styles.cornerLtr]}>
                  <Ionicons name="radio-button-on" size={14} color={WarshPalette.recordingDot} />
                  <ArabicText size="sm" style={styles.liveText}>{partial ? `${partial}…` : t("answerIt.listeningDots")}</ArabicText>
                </View>
              </View>
            ) : null}

            {mode === "speech" && phase === "result" && check ? (
              <>
                <AnswerBubble check={check} rtl={rtl} good={false} verdict={verdictFor(check, t)} tip={text(turn.tip, language)} language={language} />
                <View style={[styles.actions, rtl && styles.actionsRtl]}>
                  <Pressable accessibilityRole="button" onPress={() => setShowAnswer(true)} hitSlop={8}>
                    <Text style={styles.actionText}>{t("answerIt.showAnswer")}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={skip} hitSlop={8}>
                    <Text style={styles.actionText}>{freePass ? t("answerIt.continueNoCheck") : t("answerIt.skip")}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {mode === "speech" && phase === "unheard" ? (
              <Note rtl={rtl} icon="mic-off-outline" text={notice ?? t("answerIt.unheard", { current: Math.min(misses, MISSES_BEFORE_FREE_PASS), total: MISSES_BEFORE_FREE_PASS })} />
            ) : null}

            {notice && phase !== "unheard" ? <Note rtl={rtl} icon="information-circle-outline" text={notice} /> : null}

            {mode === "fallback" && recordingUri ? (
              <View style={[styles.turnYou, rtl && styles.turnYouRtl]}>
                <View style={[styles.bubble, styles.recordingBubble, rtl ? styles.cornerRtl : styles.cornerLtr]}>
                  <RecordingPlay uri={recordingUri} />
                  <Text style={styles.recordingText}>{t("answerIt.yourRecording")}</Text>
                </View>
              </View>
            ) : null}

            {showAnswer || mode === "fallback" ? <ModelBubble turn={turn} byId={byId} language={language} rtl={rtl} /> : null}

            {mode === "speech" && (phase === "idle" || phase === "unheard") && !check ? (
              <View style={[styles.turnYou, rtl && styles.turnYouRtl]}>
                <Pressable accessibilityRole="button" onPress={startListening} style={[styles.bubble, styles.slot, rtl ? styles.cornerRtl : styles.cornerLtr, rtl && styles.rowReverse]}>
                  <Ionicons name="mic" size={16} color={WarshPalette.goldDeep} />
                  <Text style={styles.slotText}>{t("answerIt.answerSlot")}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {finished ? (
          <Note
            rtl={rtl}
            icon="sparkles-outline"
            good={passedCount > 0}
            text={passedCount === turns.length ? t("answerIt.allDone") : t("answerIt.finished")}
          />
        ) : null}
      </ScrollView>

      <View style={styles.dock}>
        {finished ? (
          <View style={styles.fullWidth}>
            <BrandButton title={t("common.continue")} onPress={onDone} />
          </View>
        ) : mode === "speech" ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={phase === "listening" ? t("answerIt.stop") : t("answerIt.answerSlot")}
              onPress={phase === "listening" ? stopListening : startListening}
              style={[styles.micRing, phase === "listening" && styles.micRingLive]}
            >
              <View style={[styles.micButton, phase === "listening" && styles.micButtonLive]}>
                <Ionicons name={phase === "listening" ? "stop" : "mic"} size={24} color={WarshPalette.white} />
              </View>
            </Pressable>
            <Text style={[styles.micLabel, phase === "listening" && styles.micLabelLive]}>
              {phase === "listening" ? t("answerIt.listening") : phase === "result" || phase === "unheard" ? t("answerIt.tapToRetry") : t("answerIt.tapToAnswer")}
            </Text>
            {phase !== "result" ? (
              <Pressable accessibilityRole="button" onPress={skip} hitSlop={8}>
                <Text style={styles.skipText}>{freePass ? t("answerIt.continueNoCheck") : t("answerIt.skipQuestion")}</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel={t(recording ? "a11y.stopRecording" : "a11y.record")} onPress={toggleRecording} style={[styles.micRing, recording && styles.micRingLive]}>
              <View style={[styles.micButton, recording && styles.micButtonLive]}>
                <Ionicons name={recording ? "stop" : "mic"} size={24} color={WarshPalette.white} />
              </View>
            </Pressable>
            <Text style={[styles.micLabel, recording && styles.micLabelLive]}>
              {recording ? t("answerIt.recording") : recordingUri ? t("answerIt.recordAgain") : t("answerIt.recordAnswer")}
            </Text>
            <Pressable accessibilityRole="button" onPress={skip} disabled={recording} hitSlop={8}>
              <Text style={styles.skipText}>{recordingUri ? t("answerIt.nextQuestion") : t("answerIt.skipQuestion")}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function verdictFor(check: AnswerCheck, t: ReturnType<typeof useT>): string {
  if (check.missing.length > 0) return t("answerIt.missing", { words: check.missing.join(" ") });
  if (check.words.some((word) => word.status === "wrong")) return t("answerIt.wrong");
  return t("answerIt.incomplete");
}

function FriendBubble({ turn, row, language, rtl, autoPlay }: { turn: AnyRecord; row: AnyRecord | undefined; language: MeaningLanguage; rtl: boolean; autoPlay: boolean }) {
  const t = useT();
  if (!row) return null;
  return (
    <View style={[styles.turnFriend, rtl && styles.rowReverse]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{t("lab.friendInitial")}</Text>
      </View>
      <View style={[styles.bubble, styles.friendBubble, rtl ? styles.cornerLtr : styles.cornerRtl]}>
        {turn.cue ? (
          <View style={[styles.cue, rtl && styles.rowReverse]}>
            <Ionicons name="image-outline" size={14} color={WarshPalette.goldDeep} />
            <Text style={[styles.cueText, rtl && styles.textRight]}>{directed(text(turn.cue, language), language)}</Text>
          </View>
        ) : null}
        <View style={styles.friendLine}>
          <PlayButton text={row.phrase.ar} cacheKey={row.id} category="phrases" audioUrl={row.audio_url} size={18} color={WarshPalette.navy} autoPlay={autoPlay} />
          <ArabicText size="sm" style={styles.friendArabic}>{row.phrase.ar}</ArabicText>
        </View>
        <Text style={[styles.meaning, rtl && styles.textRight]}>{directed(text(row.phrase, language), language)}</Text>
      </View>
    </View>
  );
}

function AnswerBubble({ check, rtl, good, verdict, tip, language }: { check: AnswerCheck; rtl: boolean; good: boolean; verdict: string; tip?: string; language?: MeaningLanguage }) {
  return (
    <View style={[styles.turnYou, rtl && styles.turnYouRtl]}>
      <View style={[styles.badge, good ? styles.badgeGood : styles.badgeBad]}>
        <Ionicons name={good ? "checkmark" : "close"} size={13} color={WarshPalette.white} />
      </View>
      <View style={[styles.bubble, good ? styles.answerGood : styles.answerBad, rtl ? styles.cornerRtl : styles.cornerLtr]}>
        {/* Spoken order reads right to left: first word on the right. */}
        <View style={styles.words}>
          {check.words.map((word, i) => (
            <ArabicText
              key={`${word.text}-${i}`}
              size="sm"
              style={StyleSheet.flatten([
                styles.word,
                word.status === "open" && styles.wordOpen,
                word.status === "wrong" && styles.wordWrong,
                word.status === "extra" && styles.wordExtra,
              ])}
            >
              {word.text}
            </ArabicText>
          ))}
          {!good
            ? check.missing.map((word) => (
                <View key={word} style={styles.missingChip}>
                  <Ionicons name="add" size={12} color={WarshPalette.wrongText} />
                  <ArabicText size="sm" style={styles.missingText}>{word}</ArabicText>
                </View>
              ))
            : null}
        </View>
        <Text style={[styles.verdict, good ? styles.verdictGood : styles.verdictBad, styles.textRight]}>
          {language ? directed(verdict, language) : verdict}
        </Text>
        {tip ? <Text style={[styles.tip, styles.textRight]}>{language ? directed(tip, language) : tip}</Text> : null}
      </View>
    </View>
  );
}

function ModelBubble({ turn, byId, language, rtl }: { turn: AnyRecord; byId: Map<string, AnyRecord>; language: MeaningLanguage; rtl: boolean }) {
  const t = useT();
  const row = turn.model_phrase_id ? byId.get(turn.model_phrase_id as string) : undefined;
  const ar = (row?.phrase?.ar ?? turn.model?.ar) as string | undefined;
  if (!ar) return null;
  const meaning = row ? text(row.phrase, language) : text(turn.model, language);
  return (
    <View style={[styles.turnYou, rtl && styles.turnYouRtl]}>
      <View style={[styles.bubble, styles.modelBubble, rtl ? styles.cornerRtl : styles.cornerLtr]}>
        <Text style={[styles.modelLabel, styles.textRight]}>{t("answerIt.modelAnswer")}</Text>
        <View style={styles.friendLine}>
          {row ? <PlayButton text={ar} cacheKey={row.id} category="phrases" audioUrl={row.audio_url} size={18} color={WarshPalette.navy} /> : null}
          <ArabicText size="sm" style={styles.friendArabic}>{ar}</ArabicText>
        </View>
        <Text style={[styles.meaning, styles.textRight]}>{directed(meaning, language)}</Text>
      </View>
    </View>
  );
}

/** Plays the learner's own recording — a local file, so not through the audio cache. */
function RecordingPlay({ uri }: { uri: string }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  useEffect(() => () => { soundRef.current?.unloadAsync().catch(() => undefined); }, []);

  async function play() {
    try {
      await soundRef.current?.unloadAsync().catch(() => undefined);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      soundRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) setPlaying(false);
      });
    } catch {
      setPlaying(false);
    }
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t("answerIt.yourRecording")} onPress={play} hitSlop={8}>
      <Ionicons name={playing ? "volume-high" : "play"} size={18} color={WarshPalette.white} />
    </Pressable>
  );
}

function Note({ text: value, icon, rtl, good }: { text: string; icon: React.ComponentProps<typeof Ionicons>["name"]; rtl: boolean; good?: boolean }) {
  return (
    <View style={[styles.note, good && styles.noteGood, rtl && styles.rowReverse]}>
      <Ionicons name={icon} size={14} color={good ? WarshPalette.sageDeep : WarshPalette.goldDeep} />
      <Text style={[styles.noteText, rtl && styles.textRight, good && styles.noteTextGood]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: Spacing.gutter, gap: Spacing.sm, backgroundColor: WarshPalette.creamBg },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  pillRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  pill: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: Radii.md, backgroundColor: WarshPalette.parchmentBg },
  pillDone: { backgroundColor: WarshPalette.correctBg },
  pillText: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.4, color: WarshPalette.goldText },
  pillTextDone: { color: WarshPalette.sageDeep },
  turnCount: { fontFamily: Fonts.bold, fontSize: 12, color: WarshPalette.subtleBrown },
  mission: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21, color: WarshPalette.navy },
  chat: { flex: 1 },
  chatBody: { gap: 10, paddingVertical: Spacing.md },
  exchange: { gap: 10 },
  turnFriend: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  turnYou: { flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end", gap: 8 },
  // Mirrored for Urdu: in row-reverse, flex-end is the left edge.
  turnYouRtl: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: WarshPalette.sageSoft },
  avatarText: { fontFamily: Fonts.bold, fontSize: 12, color: WarshPalette.sageDeep },
  bubble: { maxWidth: "78%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radii.md, borderWidth: 1, gap: 4 },
  cornerLtr: { borderTopRightRadius: 4 },
  cornerRtl: { borderTopLeftRadius: 4 },
  friendBubble: { backgroundColor: WarshPalette.white, borderColor: WarshPalette.sageSoft, alignItems: "flex-end" },
  friendLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  friendArabic: { color: WarshPalette.navy },
  meaning: { fontFamily: Fonts.regular, fontSize: 12, color: WarshPalette.subtleBrown },
  cue: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radii.sm, backgroundColor: WarshPalette.parchmentBg, alignSelf: "stretch" },
  cueText: { flex: 1, fontFamily: Fonts.regular, fontSize: 12, color: WarshPalette.bodyBrown },
  slot: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1.5, borderColor: WarshPalette.gold, backgroundColor: WarshPalette.parchmentBg },
  slotText: { fontFamily: Fonts.bold, fontSize: 14, color: WarshPalette.goldText },
  liveBubble: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: WarshPalette.recordingDot, backgroundColor: WarshPalette.white },
  liveText: { color: WarshPalette.subtleBrown },
  recordingBubble: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: WarshPalette.navy, borderColor: WarshPalette.navy },
  recordingText: { fontFamily: Fonts.bold, fontSize: 12, color: WarshPalette.white },
  answerGood: { backgroundColor: WarshPalette.correctBg, borderColor: WarshPalette.correctBorder, alignItems: "flex-end" },
  answerBad: { backgroundColor: WarshPalette.wrongBg, borderColor: WarshPalette.wrongBorder, alignItems: "flex-end" },
  badge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  badgeGood: { backgroundColor: WarshPalette.sageDeep },
  badgeBad: { backgroundColor: WarshPalette.wrongText },
  words: { flexDirection: "row-reverse", flexWrap: "wrap", alignItems: "center", gap: 8 },
  word: { color: WarshPalette.navy },
  wordOpen: { color: WarshPalette.goldText },
  wordWrong: { color: WarshPalette.wrongText, textDecorationLine: "underline" },
  wordExtra: { color: WarshPalette.subtleBrown },
  missingChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, borderRadius: Radii.sm, borderWidth: 1.5, borderColor: WarshPalette.wrongText, borderStyle: "dashed" },
  missingText: { color: WarshPalette.wrongText },
  verdict: { fontFamily: Fonts.bold, fontSize: 12 },
  verdictGood: { color: WarshPalette.sageDeep },
  verdictBad: { color: WarshPalette.wrongText },
  tip: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, color: WarshPalette.bodyBrown },
  modelBubble: { backgroundColor: WarshPalette.white, borderColor: WarshPalette.gold, alignItems: "flex-end" },
  modelLabel: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.4, color: WarshPalette.goldText },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: Spacing.lg, paddingRight: 30 },
  actionsRtl: { flexDirection: "row-reverse", justifyContent: "flex-end", paddingRight: 0, paddingLeft: 30 },
  actionText: { fontFamily: Fonts.bold, fontSize: 12, color: WarshPalette.goldText },
  note: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 6, maxWidth: "92%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.md, backgroundColor: WarshPalette.parchmentBg },
  noteGood: { backgroundColor: WarshPalette.correctBg },
  noteText: { flexShrink: 1, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, color: WarshPalette.ink },
  noteTextGood: { fontFamily: Fonts.bold, color: WarshPalette.sageDeep },
  dock: {
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: -Spacing.gutter,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === "web" ? Spacing.lg : Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.parchmentBg,
  },
  micRing: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center", backgroundColor: WarshPalette.sageSoft },
  micRingLive: { backgroundColor: WarshPalette.recordingBg },
  micButton: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: WarshPalette.navy },
  micButtonLive: { backgroundColor: WarshPalette.recordingDot },
  micLabel: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, lineHeight: LineHeights.caption, color: WarshPalette.subtleBrown, textAlign: "center" },
  micLabelLive: { color: WarshPalette.recordingDot },
  fullWidth: { alignSelf: "stretch" },
  skipText: { fontFamily: Fonts.bold, fontSize: 13, color: WarshPalette.goldText },
});
