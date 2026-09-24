import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useT } from "@i18n/index";
import { getCachedCatalogAudioUri, getCachedRemoteAudioUri } from "@services/audioCache";
import { pickLocalized, useLanguage } from "@services/language";
import { ArabicText } from "./ArabicText";
import { BrandButton } from "./BrandButton";
import { PlayButton } from "./PlayButton";
import { ShadowRepeatExercise } from "./ShadowRepeatExercise";
import { AnswerItConversation, hasAnswerIt } from "./AnswerItConversation";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshAlpha, WarshPalette } from "../constants/theme";

/**
 * Conversation Lab screens — the `spoken_phrases.lab` block of a SPOKEN_PHRASES
 * lesson (`@warsh/lesson-schema`). The lesson player owns the beats and the
 * scored practice; these screens are the parts only a lab has: scene and
 * mission, listen first, phrase discovery, speaking and the final mission.
 *
 * Designed in warsh-app-UI-v2.pen — "25 — Conversation Labs · CL6 Pilot".
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRecord = Record<string, any>;
type MeaningLanguage = "en" | "ur";

// Steps shown in the header counter: intro, listen, phrases, practice, speak,
// mission, complete.
export const LAB_STEP_COUNT = 7;

export function getConversationLab(content: AnyRecord | null | undefined): AnyRecord | undefined {
  return content?.spoken_phrases?.lab as AnyRecord | undefined;
}

function text(value: AnyRecord | undefined, language: MeaningLanguage): string {
  if (!value) return "";
  return pickLocalized(value.en as string | undefined, value.ur as string | undefined, language) ?? "";
}

/** Prefixes prose with a direction mark so Android lays it out in the reading language. */
function directed(value: string, language: MeaningLanguage) {
  return (language === "ur" ? "‏" : "‎") + value;
}

function phrasesById(block: AnyRecord): Map<string, AnyRecord> {
  return new Map(((block.phrases ?? []) as AnyRecord[]).map((row) => [row.id as string, row]));
}

function useRtl() {
  return useLanguage() === "ur";
}

// ─── shared chrome ────────────────────────────────────────────────────────────

function StepHeader({ step, onClose }: { step: number; onClose: () => void }) {
  const t = useT();
  const rtl = useRtl();
  return (
    <View style={[styles.header, rtl && styles.rowReverse]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("player.leaveLesson")} onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={22} color={WarshPalette.navy} />
      </Pressable>
      <View style={styles.headerTrack}>
        <View style={[styles.headerFill, { width: `${(step / LAB_STEP_COUNT) * 100}%` }, rtl && styles.headerFillRtl]} />
      </View>
      <Text style={styles.headerCount}>{`${step}/${LAB_STEP_COUNT}`}</Text>
    </View>
  );
}

function Pill({ label, icon }: { label: string; icon?: React.ComponentProps<typeof Ionicons>["name"] }) {
  const rtl = useRtl();
  return (
    <View style={[styles.pill, rtl && styles.selfEnd, rtl && styles.rowReverse]}>
      {icon ? <Ionicons name={icon} size={13} color={WarshPalette.goldDeep} /> : null}
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function Avatar({ you }: { you: boolean }) {
  const t = useT();
  return (
    <View style={[styles.avatar, you ? styles.avatarYou : styles.avatarFriend]}>
      <Text style={[styles.avatarText, you ? styles.avatarTextYou : styles.avatarTextFriend]}>
        {you ? t("lab.you") : t("lab.friendInitial")}
      </Text>
    </View>
  );
}

// ─── 1. scene and mission ─────────────────────────────────────────────────────

export function LabIntroScreen({
  content,
  language,
  contentStyle,
  onStart,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onStart: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const rtl = useRtl();
  const block = content.spoken_phrases as AnyRecord;
  const lab = block.lab as AnyRecord;
  const chapter = content._meta?.chapter_order as number | undefined;
  const minutes = content._meta?.estimated_minutes as number | undefined;
  const toolkit = (lab.toolkit ?? []) as string[];
  const align = rtl ? styles.textRight : null;

  return (
    <View style={[styles.screen, contentStyle]}>
      <StepHeader step={1} onClose={onClose} />
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Pill icon="chatbubbles-outline" label={chapter ? t("lab.pillChapter", { chapter }) : t("lab.pill")} />
        <Text style={[styles.title, align]}>{text(lab.title, language)}</Text>
        <Text style={[styles.body, align]}>{directed(text(block.scene, language), language)}</Text>

        <View style={[styles.missionCard, rtl && styles.rowReverse]}>
          <View style={styles.missionIcon}>
            <Ionicons name="flag-outline" size={18} color={WarshPalette.navy} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.missionLabel, align]}>{t("lab.missionLabel")}</Text>
            <Text style={[styles.missionText, align]}>{directed(text(lab.mission, language), language)}</Text>
          </View>
        </View>

        {toolkit.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, align]}>{t("lab.toolkitLabel")}</Text>
            <View style={styles.chips}>
              {toolkit.map((word) => (
                <View key={word} style={styles.chip}>
                  <ArabicText size="sm" style={styles.chipText}>{word}</ArabicText>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={[styles.metaRow, rtl && styles.rowReverse]}>
          {minutes ? <Meta icon="time-outline" label={t("lab.metaMinutes", { count: minutes })} /> : null}
          <Meta icon="volume-high-outline" label={t("lab.metaSound")} />
          <Meta icon="mic-outline" label={t("lab.metaSpeaking")} />
        </View>
      </ScrollView>
      <BrandButton title={t("lab.startListening")} onPress={onStart} />
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }) {
  const rtl = useRtl();
  return (
    <View style={[styles.metaItem, rtl && styles.rowReverse]}>
      <Ionicons name={icon} size={13} color={WarshPalette.sageDeep} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

// ─── 2. listen first + 3. phrases ─────────────────────────────────────────────

async function resolvePhraseAudio(row: AnyRecord): Promise<string> {
  const arabic = row.phrase?.ar as string;
  if (row.audio_url) {
    try {
      return await getCachedRemoteAudioUri(row.audio_url as string, row.id as string, "phrases");
    } catch {
      // Fall through to the text catalogue.
    }
  }
  return getCachedCatalogAudioUri({ text: arabic, cacheKey: row.id as string, category: "phrases" });
}

export function LabListenAndPhrases({
  content,
  language,
  contentStyle,
  onDone,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onDone: () => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"listen" | "phrases">("listen");
  if (stage === "listen") {
    return <ListenFirst content={content} language={language} contentStyle={contentStyle} onDone={() => setStage("phrases")} onClose={onClose} />;
  }
  return <PhraseDiscovery content={content} language={language} contentStyle={contentStyle} onDone={onDone} onClose={onClose} />;
}

function ListenFirst({
  content,
  language,
  contentStyle,
  onDone,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onDone: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const rtl = useRtl();
  const block = content.spoken_phrases as AnyRecord;
  const byId = useMemo(() => phrasesById(block), [block]);
  const lines = useMemo(
    () => ((block.dialogue ?? []) as AnyRecord[]).map((line) => ({ you: line.speaker === "B", row: byId.get(line.phrase_id as string) })).filter((line) => line.row),
    [block, byId],
  );
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [heardAll, setHeardAll] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const runRef = useRef(0);

  useEffect(() => () => {
    runRef.current += 1;
    soundRef.current?.unloadAsync().catch(() => undefined);
  }, []);

  async function playFrom(start: number) {
    const run = ++runRef.current;
    setPlaying(true);
    for (let index = start; index < lines.length; index += 1) {
      if (run !== runRef.current) return;
      setCurrent(index);
      try {
        const uri = await resolvePhraseAudio(lines[index].row!);
        if (run !== runRef.current) return;
        await soundRef.current?.unloadAsync().catch(() => undefined);
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        soundRef.current = sound;
        await new Promise<void>((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded || status.didJustFinish) resolve();
          });
        });
      } catch {
        // A missing clip must not trap the learner on this screen; show the
        // line for a moment and move on.
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (run !== runRef.current) return;
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
    if (run !== runRef.current) return;
    setPlaying(false);
    setHeardAll(true);
  }

  function pause() {
    runRef.current += 1;
    soundRef.current?.stopAsync().catch(() => undefined);
    setPlaying(false);
  }

  function togglePlay() {
    if (playing) return pause();
    const start = current < 0 || current >= lines.length - 1 ? 0 : current;
    void playFrom(start);
  }

  const progress = lines.length > 0 ? Math.max(current + 1, 0) / lines.length : 0;

  return (
    <View style={[styles.screen, contentStyle]}>
      <StepHeader step={2} onClose={onClose} />
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Pill label={t("lab.stepListen")} />
        <Text style={[styles.prompt, rtl && styles.textRight]}>{t("lab.listenPrompt")}</Text>
        <View style={styles.dialogue}>
          {lines.map(({ you, row }, index) => {
            const active = index === current;
            const upcoming = !heardAll && index > current;
            return (
              <View key={`${row!.id}-${index}`} style={[styles.turn, you ? styles.turnYou : styles.turnFriend]}>
                {!you ? <Avatar you={false} /> : null}
                <View style={[styles.bubble, you ? styles.bubbleYou : styles.bubbleFriend, active && styles.bubbleActive, upcoming && styles.bubbleUpcoming]}>
                  <ArabicText size="sm" style={StyleSheet.flatten([styles.bubbleArabic, you && styles.bubbleArabicYou])}>{row!.phrase.ar}</ArabicText>
                  {showTranslation ? (
                    <Text style={[styles.bubbleTranslation, you && styles.bubbleTranslationYou]}>{directed(text(row!.phrase, language), language)}</Text>
                  ) : null}
                </View>
                {you ? <Avatar you /> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.playback, rtl && styles.rowReverse]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? t("lab.pause") : t("lab.play")}
          onPress={togglePlay}
          style={styles.playbackButton}
        >
          <Ionicons name={playing ? "pause" : "play"} size={18} color={WarshPalette.navy} />
        </Pressable>
        <View style={styles.flex}>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.trackLabel, rtl && styles.textRight]}>
            {current >= 0 ? t("lab.lineOf", { current: current + 1, total: lines.length }) : t("lab.tapToPlay")}
          </Text>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: showTranslation }}
          accessibilityLabel={t("lab.translation")}
          onPress={() => setShowTranslation((value) => !value)}
          hitSlop={8}
        >
          <Ionicons name="language-outline" size={20} color={showTranslation ? WarshPalette.sageDeep : WarshPalette.disabledIcon} />
        </Pressable>
      </View>
      {!heardAll ? <Text style={styles.gateNote}>{t("lab.listenGate")}</Text> : null}
      <BrandButton title={t("common.continue")} onPress={() => { pause(); onDone(); }} disabled={!heardAll} />
    </View>
  );
}

function PhraseDiscovery({
  content,
  language,
  contentStyle,
  onDone,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onDone: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const rtl = useRtl();
  const block = content.spoken_phrases as AnyRecord;
  const lab = block.lab as AnyRecord;
  const phrases = (block.phrases ?? []) as AnyRecord[];
  const [index, setIndex] = useState(0);
  const row = phrases[index];
  const pattern = lab.pattern as AnyRecord | undefined;
  const showPattern = pattern && pattern.after_phrase_id === row?.id;
  const isLast = index >= phrases.length - 1;
  const align = rtl ? styles.textRight : null;

  useEffect(() => {
    if (!row) onDone();
  }, [row, onDone]);
  if (!row) return null;

  const context = text(row.context, language);

  return (
    <View style={[styles.screen, contentStyle]}>
      <StepHeader step={3} onClose={onClose} />
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={[styles.pillRow, rtl && styles.rowReverse]}>
          <Pill label={t("lab.stepPhrases")} />
          <Text style={styles.pager}>{t("lab.phraseOf", { current: index + 1, total: phrases.length })}</Text>
        </View>

        <View style={styles.phraseCard}>
          {row.heard_only ? (
            <View style={[styles.heardTag, rtl && styles.rowReverse]}>
              <Ionicons name="ear-outline" size={12} color={WarshPalette.sageDeep} />
              <Text style={styles.heardTagText}>{t("lab.heardOnly")}</Text>
            </View>
          ) : null}
          <ArabicText size="xl" style={styles.phraseArabic}>{row.phrase.ar}</ArabicText>
          {row.phrase.translit ? <Text style={styles.translit}>{row.phrase.translit}</Text> : null}
          <Text style={styles.meaning}>{directed(text(row.phrase, language), language)}</Text>
          {context ? <Text style={styles.context}>{directed(context, language)}</Text> : null}
          <View style={styles.phrasePlay}>
            <PlayButton key={row.id} text={row.phrase.ar} cacheKey={row.id} category="phrases" audioUrl={row.audio_url} label={t("lab.play")} autoPlay />
          </View>
        </View>

        {showPattern ? (
          <View style={styles.patternCard}>
            <Text style={[styles.sectionLabel, align]}>{t("lab.patternLabel")}</Text>
            <View style={[styles.patternRow, rtl && styles.rowReverse]}>
              {(pattern.items as AnyRecord[]).map((item) => (
                <View key={item.ar} style={styles.patternItem}>
                  <ArabicText size="md" style={styles.patternArabic}>{item.ar}</ArabicText>
                  <Text style={styles.patternMeaning}>{text(item.meaning, language)}</Text>
                  <Text style={styles.patternSource}>{directed(text(item.source, language), language)}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.body, align]}>{directed(text(pattern.note, language), language)}</Text>
          </View>
        ) : null}
      </ScrollView>
      <BrandButton title={isLast ? t("common.continue") : t("player.nextPhrase")} onPress={() => (isLast ? onDone() : setIndex((i) => i + 1))} />
    </View>
  );
}

// ─── 5. speak + 6. mission ────────────────────────────────────────────────────

export function LabSpeakAndMission({
  content,
  language,
  contentStyle,
  onLineSpoken,
  onDone,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onLineSpoken: () => void;
  onDone: () => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"speak" | "mission">("speak");
  // A lab with an Answer it conversation speaks its answers instead of
  // repeating lines (Pen section 26); otherwise the Say-it lines as before.
  if (stage === "speak" && hasAnswerIt(content)) {
    return (
      <AnswerItConversation
        content={content}
        header={<StepHeader step={5} onClose={onClose} />}
        contentStyle={contentStyle}
        onTurnSpoken={onLineSpoken}
        onDone={() => setStage("mission")}
      />
    );
  }
  if (stage === "speak") {
    return <SpeakLines content={content} language={language} contentStyle={contentStyle} onLineSpoken={onLineSpoken} onDone={() => setStage("mission")} onClose={onClose} />;
  }
  return <Mission content={content} language={language} contentStyle={contentStyle} onDone={onDone} onClose={onClose} />;
}

function SpeakLines({
  content,
  language,
  contentStyle,
  onLineSpoken,
  onDone,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onLineSpoken: () => void;
  onDone: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const block = content.spoken_phrases as AnyRecord;
  const byId = useMemo(() => phrasesById(block), [block]);
  const rows = ((block.lab?.shadow_phrase_ids ?? []) as string[]).map((id) => byId.get(id)).filter(Boolean) as AnyRecord[];
  const [index, setIndex] = useState(0);
  const row = rows[index];

  useEffect(() => {
    if (!row) onDone();
  }, [row, onDone]);
  if (!row) return null;

  return (
    <View style={[styles.screen, contentStyle]}>
      <StepHeader step={5} onClose={onClose} />
      <Pill label={t("lab.stepSay", { current: index + 1, total: rows.length })} />
      <ShadowRepeatExercise
        key={row.id}
        arabic={row.phrase.ar}
        transliteration={row.phrase.translit}
        translation={text(row.phrase, language)}
        originalAudioUri={row.audio_url}
        onComplete={(recorded) => {
          if (recorded) onLineSpoken();
          if (index >= rows.length - 1) onDone();
          else setIndex((i) => i + 1);
        }}
      />
    </View>
  );
}

function missionAnswer(turn: AnyRecord): string {
  if (turn.response_mode === "PICK") return turn.options?.[turn.correct_option_index]?.ar ?? "";
  return ((turn.correct_order ?? []) as number[]).map((i) => turn.tiles?.[i]?.ar ?? "").join(" ");
}

function Mission({
  content,
  language,
  contentStyle,
  onDone,
  onClose,
}: {
  content: AnyRecord;
  language: MeaningLanguage;
  contentStyle?: StyleProp<ViewStyle>;
  onDone: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const rtl = useRtl();
  const block = content.spoken_phrases as AnyRecord;
  const lab = block.lab as AnyRecord;
  const byId = useMemo(() => phrasesById(block), [block]);
  const turns = (lab.mission_turns ?? []) as AnyRecord[];
  const goals = (lab.goals ?? []) as AnyRecord[];
  const [turnIndex, setTurnIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [answered, setAnswered] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);

  const turn = turns[turnIndex];
  const finished = turnIndex >= turns.length;
  const doneGoals = new Set(turns.slice(0, turnIndex).map((item) => item.goal_index as number));
  const expectedLength = turn?.response_mode === "BUILD" ? (turn.correct_order as number[]).length : 0;

  function check() {
    if (!turn) return;
    const given = turn.response_mode === "PICK"
      ? turn.options?.[picked ?? -1]?.ar ?? ""
      : built.map((i) => turn.tiles[i].ar).join(" ");
    setResult(given === missionAnswer(turn) ? "right" : "wrong");
  }

  function next() {
    if (result === "wrong") {
      setResult(null);
      setPicked(null);
      setBuilt([]);
      return;
    }
    setAnswered((list) => [...list, missionAnswer(turn)]);
    setTurnIndex((i) => i + 1);
    setResult(null);
    setPicked(null);
    setBuilt([]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  const canCheck = turn && result === null && (turn.response_mode === "PICK" ? picked !== null : built.length === expectedLength);

  return (
    <View style={[styles.screen, contentStyle]}>
      <StepHeader step={6} onClose={onClose} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Pill label={t("lab.stepMission")} />

        <View style={styles.goalCard}>
          {goals.map((goal, index) => {
            const done = doneGoals.has(index) || finished;
            return (
              <View key={index} style={[styles.goalRow, rtl && styles.rowReverse]}>
                <Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={16} color={done ? WarshPalette.gold : WarshAlpha.goldBorder} />
                <Text style={[styles.goalText, done && styles.goalTextDone]}>{text(goal, language)}</Text>
              </View>
            );
          })}
        </View>

        {/* Reduced guidance: the friend's lines carry no translation here. */}
        <View style={styles.dialogue}>
          {turns.slice(0, Math.min(turnIndex + 1, turns.length)).map((item, index) => {
            const friendLine = byId.get(item.prompt_phrase_id as string)?.phrase?.ar ?? "";
            return (
              <View key={index}>
                <View style={[styles.turn, styles.turnFriend]}>
                  <Avatar you={false} />
                  <View style={[styles.bubble, styles.bubbleFriend]}>
                    <ArabicText size="sm" style={styles.bubbleArabic}>{friendLine}</ArabicText>
                  </View>
                </View>
                {answered[index] ? (
                  <View style={[styles.turn, styles.turnYou]}>
                    <Ionicons name="checkmark" size={14} color={WarshPalette.sageDeep} />
                    <View style={[styles.bubble, styles.bubbleYou]}>
                      <ArabicText size="sm" style={StyleSheet.flatten([styles.bubbleArabic, styles.bubbleArabicYou])}>{answered[index]}</ArabicText>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {turn ? (
          <>
            {turn.cue ? (
              <View style={[styles.cueCard, rtl && styles.rowReverse]}>
                <Ionicons name="image-outline" size={18} color={WarshPalette.goldDeep} />
                <Text style={[styles.cueText, rtl && styles.textRight]}>{directed(`${text(turn.cue, language)} ${t("lab.answerInArabic")}`, language)}</Text>
              </View>
            ) : null}

            {turn.response_mode === "PICK" ? (
              <View style={styles.optionList}>
                {(turn.options as AnyRecord[]).map((option, index) => {
                  const selected = picked === index;
                  const showRight = result !== null && index === turn.correct_option_index && result === "right";
                  const showWrong = result === "wrong" && selected;
                  return (
                    <Pressable
                      key={index}
                      accessibilityRole="button"
                      disabled={result !== null}
                      onPress={() => setPicked(index)}
                      style={[styles.option, selected && styles.optionSelected, showRight && styles.optionRight, showWrong && styles.optionWrong]}
                    >
                      <ArabicText size="sm" style={styles.optionArabic}>{option.ar}</ArabicText>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <>
                <View style={[styles.answerArea, result === "right" && styles.optionRight, result === "wrong" && styles.optionWrong]}>
                  {Array.from({ length: expectedLength }).map((_, slot) => {
                    const tileIndex = built[slot];
                    return (
                      <Pressable
                        key={slot}
                        accessibilityRole="button"
                        disabled={tileIndex === undefined || result !== null}
                        onPress={() => setBuilt((list) => list.filter((_, i) => i !== slot))}
                        style={[styles.slot, tileIndex !== undefined && styles.slotFilled]}
                      >
                        {tileIndex !== undefined ? <ArabicText size="sm" style={styles.tileArabic}>{turn.tiles[tileIndex].ar}</ArabicText> : null}
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.bank}>
                  {(turn.tiles as AnyRecord[]).map((tile, index) => {
                    const used = built.includes(index);
                    return (
                      <Pressable
                        key={index}
                        accessibilityRole="button"
                        disabled={used || result !== null || built.length >= expectedLength}
                        onPress={() => setBuilt((list) => [...list, index])}
                        style={[styles.tile, used && styles.tileUsed]}
                      >
                        <ArabicText size="sm" style={StyleSheet.flatten([styles.tileArabic, used && styles.tileArabicUsed])}>{tile.ar}</ArabicText>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {result ? (
              <View style={[styles.feedback, result === "right" ? styles.feedbackRight : styles.feedbackWrong, rtl && styles.rowReverse]}>
                <Ionicons name={result === "right" ? "checkmark-circle" : "refresh"} size={18} color={result === "right" ? WarshPalette.sageDeep : WarshPalette.wrongText} />
                <Text style={[styles.feedbackText, result === "wrong" && styles.feedbackTextWrong]}>
                  {result === "right" ? t("lab.missionRight") : t("lab.missionTryAgain")}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {finished ? (
        <BrandButton title={t("common.continue")} onPress={onDone} />
      ) : result ? (
        <BrandButton title={result === "right" ? t("common.continue") : t("lab.tryAgain")} onPress={next} />
      ) : (
        <BrandButton title={t("common.check")} onPress={check} disabled={!canCheck} />
      )}
    </View>
  );
}

// ─── 7. completion ────────────────────────────────────────────────────────────

export function LabCanDoCard({ content, language }: { content: AnyRecord; language: MeaningLanguage }) {
  const t = useT();
  const rtl = useRtl();
  const items = (getConversationLab(content)?.can_do ?? []) as AnyRecord[];
  if (items.length === 0) return null;
  return (
    <View style={styles.canDoCard}>
      <Text style={[styles.sectionLabel, rtl && styles.textRight]}>{t("lab.canDoLabel")}</Text>
      {items.map((item, index) => (
        <View key={index} style={[styles.canDoRow, rtl && styles.rowReverse]}>
          <Ionicons name={item.kind === "UNDERSTAND" ? "ear-outline" : "checkmark-circle-outline"} size={16} color={WarshPalette.sageDeep} />
          <Text style={[styles.canDoLabel, rtl && styles.textRight]}>{text(item.label, language)}</Text>
          <ArabicText size="sm" style={styles.canDoArabic}>{item.ar}</ArabicText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    backgroundColor: WarshPalette.creamBg,
  },
  flex: { flex: 1 },
  rowReverse: { flexDirection: "row-reverse" },
  selfEnd: { alignSelf: "flex-end" },
  textRight: { textAlign: "right" },
  scrollBody: { gap: Spacing.lg, paddingBottom: Spacing.lg },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  headerTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: WarshPalette.sageSoft, overflow: "hidden" },
  headerFill: { height: 6, borderRadius: 3, backgroundColor: WarshPalette.gold },
  headerFillRtl: { alignSelf: "flex-end" },
  headerCount: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, color: WarshPalette.subtleBrown },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.lg,
    backgroundColor: WarshPalette.parchmentBg,
  },
  pillText: { fontFamily: Fonts.bold, fontSize: 11, color: WarshPalette.goldText, letterSpacing: 0.4 },
  pillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pager: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, color: WarshPalette.subtleBrown },
  title: { fontFamily: Fonts.display, fontSize: FontSizes.displayXL, lineHeight: LineHeights.displayXL, color: WarshPalette.navy },
  prompt: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 27, color: WarshPalette.navy },
  body: { fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM, color: WarshPalette.bodyBrown },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: FontSizes.label, letterSpacing: 0.6, color: WarshPalette.goldText },
  missionCard: { flexDirection: "row", gap: Spacing.md, padding: 14, borderRadius: 14, backgroundColor: WarshPalette.navy },
  missionIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: WarshPalette.gold },
  missionLabel: { fontFamily: Fonts.bold, fontSize: FontSizes.label, letterSpacing: 0.6, color: WarshPalette.gold },
  missionText: { marginTop: 3, fontFamily: Fonts.bold, fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM, color: WarshPalette.white },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.white },
  chipText: { color: WarshPalette.navy },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontFamily: Fonts.regular, fontSize: 11, color: WarshPalette.subtleBrown },
  dialogue: { gap: 10 },
  turn: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  turnFriend: { justifyContent: "flex-start" },
  turnYou: { justifyContent: "flex-end", alignItems: "center" },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarFriend: { backgroundColor: WarshPalette.sageSoft },
  avatarYou: { backgroundColor: WarshPalette.navy },
  avatarText: { fontFamily: Fonts.bold, fontSize: 9 },
  avatarTextFriend: { color: WarshPalette.sageDeep, fontSize: 11 },
  avatarTextYou: { color: WarshPalette.gold },
  bubble: { maxWidth: "76%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, gap: 2 },
  bubbleFriend: { backgroundColor: WarshPalette.white, borderColor: WarshPalette.sageSoft },
  bubbleYou: { backgroundColor: WarshPalette.navy, borderColor: WarshPalette.navy },
  bubbleActive: { borderColor: WarshPalette.gold, borderWidth: 2 },
  bubbleUpcoming: { opacity: 0.45 },
  bubbleArabic: { color: WarshPalette.navy, textAlign: "right" },
  bubbleArabicYou: { color: WarshPalette.white },
  bubbleTranslation: { fontFamily: Fonts.regular, fontSize: 11, color: WarshPalette.subtleBrown },
  bubbleTranslationYou: { color: WarshAlpha.onNavyMuted },
  playback: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: WarshPalette.parchmentBg,
  },
  playbackButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: WarshPalette.gold },
  track: { height: 5, borderRadius: 3, backgroundColor: WarshPalette.sageSoft, overflow: "hidden" },
  trackFill: { height: 5, borderRadius: 3, backgroundColor: WarshPalette.gold },
  trackLabel: { marginTop: 5, fontFamily: Fonts.regular, fontSize: 10, color: WarshPalette.subtleBrown },
  gateNote: { fontFamily: Fonts.regular, fontSize: 11, color: WarshPalette.subtleBrown, textAlign: "center" },
  phraseCard: {
    alignItems: "center",
    gap: Spacing.sm,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.white,
  },
  heardTag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: WarshPalette.parchmentDeep },
  heardTagText: { fontFamily: Fonts.bold, fontSize: 10, color: WarshPalette.sageDeep, letterSpacing: 0.3 },
  phraseArabic: { color: WarshPalette.navy, textAlign: "center" },
  translit: { fontFamily: Fonts.italic, fontSize: 13, color: WarshPalette.subtleBrown },
  meaning: { fontFamily: Fonts.bold, fontSize: 17, color: WarshPalette.ink, textAlign: "center" },
  context: { fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption, color: WarshPalette.subtleBrown, textAlign: "center" },
  phrasePlay: { marginTop: Spacing.xs },
  patternCard: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: WarshPalette.parchmentBg },
  patternRow: { flexDirection: "row", gap: 10 },
  patternItem: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, backgroundColor: WarshPalette.white },
  patternArabic: { color: WarshPalette.navy },
  patternMeaning: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, color: WarshPalette.ink },
  patternSource: { fontFamily: Fonts.regular, fontSize: 10, color: WarshPalette.subtleBrown },
  goalCard: { gap: 7, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: WarshPalette.navy },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  goalText: { fontFamily: Fonts.bold, fontSize: FontSizes.caption, color: WarshPalette.white },
  goalTextDone: { color: WarshAlpha.onNavyMuted },
  cueCard: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: WarshPalette.parchmentDeep },
  cueText: { flex: 1, fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption, color: WarshPalette.bodyBrown },
  optionList: { gap: 10 },
  option: { minHeight: 56, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.white },
  optionSelected: { borderColor: WarshPalette.gold, borderWidth: 2 },
  optionRight: { backgroundColor: WarshPalette.correctBg, borderColor: WarshPalette.correctBorder },
  optionWrong: { backgroundColor: WarshPalette.wrongBg, borderColor: WarshPalette.wrongBorder },
  optionArabic: { color: WarshPalette.ink },
  answerArea: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  slot: { minWidth: 60, height: 40, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderRadius: 10, borderWidth: 1.5, borderColor: WarshPalette.parchment, borderStyle: "dashed" },
  slotFilled: { borderStyle: "solid", borderColor: WarshPalette.gold, backgroundColor: WarshPalette.white },
  bank: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tile: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: WarshPalette.sageSoft, backgroundColor: WarshPalette.white },
  tileUsed: { backgroundColor: WarshPalette.sageSoft },
  tileArabic: { color: WarshPalette.navy },
  tileArabicUsed: { color: WarshPalette.sageSoft },
  feedback: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12 },
  feedbackRight: { backgroundColor: WarshPalette.correctBg },
  feedbackWrong: { backgroundColor: WarshPalette.wrongBg },
  feedbackText: { flex: 1, fontFamily: Fonts.bold, fontSize: FontSizes.bodyM, color: WarshPalette.sageDeep },
  feedbackTextWrong: { color: WarshPalette.wrongText },
  canDoCard: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: WarshPalette.parchmentBg, alignSelf: "stretch" },
  canDoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  canDoLabel: { flex: 1, fontFamily: Fonts.bold, fontSize: 13, color: WarshPalette.ink },
  canDoArabic: { color: WarshPalette.navy },
});
