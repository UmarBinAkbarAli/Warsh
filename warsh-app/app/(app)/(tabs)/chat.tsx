import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Platform, TouchableOpacity, Alert, StyleSheet, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import api, { isSubscriptionRequiredError, subscriptionRequiredRoute, purchaseNoorPack, updateUserVocabularyWord } from "@services/api";
import { BottomSheetModal } from "@components/BottomSheetModal";
import { BrandButton } from "@components/BrandButton";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { StatusBarBacking } from "@components/StatusBarBacking";
import { useT } from "@i18n/index";
import { useAuthStore } from "@stores/authStore";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette, desktopFontSize, desktopLineHeight } from "../../../constants/theme";
import { track, trackNoorMessageSent } from "@services/analytics";
import { useTranslationLanguage } from "@services/language";
import {
  addIapPurchaseListeners,
  connectIap,
  endIapConnection,
  finishIapTransaction,
  getConsumableProducts,
  getIapDisplayPrice,
  isBillingSupportedEnvironment,
  isBillingDeclinedError,
  isIapUnavailableError,
  requestConsumablePurchase,
  type IapSubscriptionPurchase,
} from "@services/iap";
import { useWebLayout, useWebPageStyle } from "@components/WebPage";

const NOOR_PACK_PRODUCT_ID = "warsh_noor_pack";

type Direction = "ltr" | "rtl";

const LATIN_LETTER = /[A-Za-z]/g;
const ARABIC_SCRIPT_LETTER = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;

/** A paragraph's direction from its own text, not the reply-language setting:
 *  Noor answers an English question in English even for an Urdu learner, and
 *  quotes Arabic inside both. Whichever script has more letters wins. */
function paragraphDirection(text: string): Direction {
  const latin = text.match(LATIN_LETTER)?.length ?? 0;
  const arabicScript = text.match(ARABIC_SCRIPT_LETTER)?.length ?? 0;
  return arabicScript > latin ? "rtl" : "ltr";
}

/** Prefix prose with a Unicode direction mark so the paragraph direction is the
 *  one given rather than Android's first-strong character. */
function withDirectionMark(text: string, direction: Direction): string {
  // Android resolves direction per paragraph, so the mark has to follow every
  // line break too, not just open the string.
  const mark = direction === "rtl" ? "‏" : "‎";
  return mark + text.replace(/\n/g, `\n${mark}`);
}

function paragraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

type Headword = {
  arabic: string;
  wordId: string | null;
  transliteration: string | null;
  meaning: string | null;
  audioUrl: string | null;
};
type ChatMessage = { role: "USER" | "ASSISTANT"; content: string; headword?: Headword | null };

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webLayout = useWebLayout();
  const readingStyle = useWebPageStyle("reading");
  const flush = webLayout.isWeb ? styles.flush : null;
  const user = useAuthStore((state) => state.user);
  const language = useTranslationLanguage();
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [purchasingPack, setPurchasingPack] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5, packBalance: 0 });
  const [error, setError] = useState<string | null>(null);
  const [showOverageModal, setShowOverageModal] = useState(false);
  const [packDisplayPrice, setPackDisplayPrice] = useState<string | null>(null);
  const [packPriceLoading, setPackPriceLoading] = useState(true);

  // True only between launching the pack purchase and handling its result, so the
  // global purchase listener ignores any unrelated/pending purchases.
  const packInFlightRef = useRef(false);
  const processingPurchaseTokensRef = useRef(new Set<string>());

  const loadNoorPackProduct = useCallback(async () => {
    if (!isBillingSupportedEnvironment()) {
      setPackPriceLoading(false);
      return;
    }

    setPackPriceLoading(true);
    const products = await getConsumableProducts([NOOR_PACK_PRODUCT_ID]);
    const product = products.find((item) => item.id === NOOR_PACK_PRODUCT_ID);
    setPackDisplayPrice(product ? getIapDisplayPrice(product) ?? null : null);
    setPackPriceLoading(false);
  }, []);

  // react-native-iap v14 delivers purchase results via events, not the
  // `requestPurchase` promise. Register listeners for the screen's lifetime.
  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};

    (async () => {
      const remove = await addIapPurchaseListeners(
        (purchase) => {
          if (purchase.productId === NOOR_PACK_PRODUCT_ID) void handlePackPurchase(purchase);
        },
        (error) => { if (packInFlightRef.current) handlePackError(error); },
      );
      if (mounted) cleanup = remove;
      else remove();
    })();

    return () => {
      mounted = false;
      cleanup();
      endIapConnection().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadNoorPackProduct();
  }, [loadNoorPackProduct]);

  useEffect(() => {
    if (showOverageModal && !packDisplayPrice) {
      void loadNoorPackProduct();
    }
  }, [loadNoorPackProduct, packDisplayPrice, showOverageModal]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/chat/history");
      const data = response.data.data;
      setMessages(data.messages);
      // Sync the counter to server truth on every open so it survives tab
      // navigation and app restart (not just the current send).
      if (typeof data.messagesUsedToday === "number") {
        setUsage({
          used: data.messagesUsedToday,
          limit: data.messagesLimit ?? 5,
          packBalance: data.noorOverageBalance ?? 0,
        });
      }
    } catch (err) {
      if (isSubscriptionRequiredError(err)) {
        router.replace(await subscriptionRequiredRoute());
        return;
      }
      setError(t("chat.loadError"));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
      return undefined;
    }, [loadHistory])
  );

  // Launches the consumable billing flow. The result arrives via the purchase
  // listeners above (v14 is event-based) — do NOT read the resolved value here,
  // the purchase token isn't available until the user finishes paying.
  async function handleBuyNoorPack() {
    if (!isBillingSupportedEnvironment()) {
      Alert.alert(t("chat.iapUnavailableTitle"), t("chat.iapUnavailableExpoGo"));
      return;
    }
    if (!user?.id) {
      Alert.alert(t("chat.signInRequiredTitle"), t("chat.signInRequiredBody"));
      return;
    }
    if (!packDisplayPrice) {
      Alert.alert(t("chat.noPriceTitle"), t("chat.noPriceBody"));
      return;
    }
    setShowOverageModal(false);
    setPurchasingPack(true);
    packInFlightRef.current = true;
    try {
      const connected = await connectIap();
      if (!connected) throw Object.assign(new Error("IAP not available"), { code: "IAP_UNAVAILABLE" });
      const storeAccountId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        user.id,
      );
      await requestConsumablePurchase(NOOR_PACK_PRODUCT_ID, storeAccountId);
      // Success/failure handled by handlePackPurchase / handlePackError.
    } catch (err: any) {
      handlePackError(err);
    }
  }

  // Called by purchaseUpdatedListener once the pack purchase completes.
  async function handlePackPurchase(purchase: IapSubscriptionPurchase) {
    packInFlightRef.current = false;
    const token = purchase.purchaseToken;
    if (!token || processingPurchaseTokensRef.current.has(token)) return;
    processingPurchaseTokensRef.current.add(token);

    try {
      const response = await purchaseNoorPack({ purchaseToken: token, platform: Platform.OS as "android" | "ios" });
      const newBalance: number = response.data.data.noorOverageBalance ?? 0;

      // Finish only after the server has durably and idempotently granted the
      // credits. If finishing fails, Play redelivers and the server returns the
      // already-granted result without incrementing again.
      try {
        await finishIapTransaction(purchase, true);
      } catch (finishError: any) {
        console.warn("[IAP] Noor pack finish deferred:", finishError?.code ?? finishError?.message);
      }

      setUsage((prev) => ({ ...prev, packBalance: newBalance }));
      setPurchasingPack(false);
      Alert.alert(t("chat.packAddedTitle"), t("chat.packAddedBody"), [{ text: t("common.continue") }]);
    } catch (err: any) {
      setPurchasingPack(false);
      const code = err?.response?.data?.code ?? err?.code ?? "unknown";
      console.error("[IAP] Noor pack verify failed:", code, err?.message);
      if (code === "purchase_pending") {
        Alert.alert(t("chat.pendingTitle"), t("chat.pendingBody"));
      } else {
        Alert.alert(t("chat.failedTitle"), t("chat.failedVerifyBody", { code }));
      }
    } finally {
      processingPurchaseTokensRef.current.delete(token);
    }
  }

  // Called by purchaseErrorListener (and when launching the flow throws).
  function handlePackError(err: any) {
    packInFlightRef.current = false;
    setPurchasingPack(false);
    const code = err?.code;
    if (code === "E_USER_CANCELLED" || code === "user-cancelled" || code === "USER_CANCELED" || code === "USER_CANCELLED") {
      return; // User cancelled — no alert needed
    }
    if (isBillingDeclinedError(err)) {
      Alert.alert(t("chat.declinedTitle"), t("chat.declinedBody"));
      return;
    }
    if (isIapUnavailableError(err)) {
      Alert.alert(t("chat.iapUnavailableTitle"), t("chat.iapUnavailableBuild"));
      return;
    }
    console.error("[IAP] Noor pack failed:", code, err?.message);
    Alert.alert(t("chat.failedTitle"), t("chat.failedBody"));
  }

  async function sendMessage(text = input) {
    const message = text.trim();
    if (!message || sending) return;
    track("noor_message_submitted");
    setSending(true);
    setError(null);
    try {
      const response = await api.post("/api/chat", { message });
      const data = response.data.data;
      setMessages((prev) => [
        ...prev,
        { role: "USER", content: message },
        { role: "ASSISTANT", content: data.reply, headword: data.headword ?? null },
      ]);
      const usedToday = data.messagesUsedToday;
      setUsage({
        used: usedToday,
        limit: data.messagesLimit,
        packBalance: data.noorOverageBalance ?? 0,
      });
      trackNoorMessageSent(usedToday);
      track("noor_response_received");
      if (text === input) setInput("");
      const newAchievement = data.newAchievement;
      if (newAchievement) {
        router.push({
          pathname: "/(app)/milestone-celebration",
          params: {
            achievements: JSON.stringify([newAchievement]),
            // Return to Noor so the reply stays visible instead of dumping the
            // user on the Learn tab.
            nextRoute: "chat",
            streak: "0",
          },
        });
      }
    } catch (err: any) {
      track("noor_response_failed", { status: typeof err.response?.status === "number" ? err.response.status : 0 });
      if (isSubscriptionRequiredError(err)) {
        router.replace(await subscriptionRequiredRoute());
      } else if (err.response?.status === 429 && err.response?.data?.code === "rate_limited") {
        // Burst limit, not the daily quota — don't offer to sell credits.
        setError(t("chat.tooFast"));
      } else if (err.response?.status === 429) {
        track("noor_limit_reached");
        setShowOverageModal(true);
      } else if (err.response?.data?.code === "assistant_unavailable") {
        setError(t("chat.unavailable"));
      } else {
        setError(t("chat.sendError"));
      }
    } finally {
      setSending(false);
    }
  }

  async function saveWord(wordId: string) {
    setSavedWords((prev) => new Set(prev).add(wordId));
    try {
      await updateUserVocabularyWord(wordId, { isFavorite: true });
      track("word_saved", { word_id: wordId, source: "noor" });
    } catch {
      setSavedWords((prev) => {
        const next = new Set(prev);
        next.delete(wordId);
        return next;
      });
      setError(t("chat.saveWordError"));
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  const replyLanguage = language === "ur" ? t("language.urdu") : t("language.english");
  const freeLeft = Math.max(0, usage.limit - usage.used);
  const onPack = freeLeft === 0 && usage.packBalance > 0;
  const meterLabel = onPack
    ? t("chat.packLeft", { count: usage.packBalance, suffix: usage.packBalance === 1 ? "" : "s" })
    : t("chat.leftToday", { count: freeLeft });
  const meterA11y = onPack
    ? t("chat.packLeftA11y", { count: usage.packBalance, suffix: usage.packBalance === 1 ? "" : "s" })
    : t("chat.leftTodayA11y", { count: freeLeft, limit: usage.limit });

  // Follow-ups track the latest reply: word-specific when it was about one
  // word, general otherwise. Each tap sends a message and counts like one.
  const lastReply = [...messages].reverse().find((m) => m.role === "ASSISTANT") ?? null;
  const followUps = lastReply
    ? lastReply.headword
      ? [
          { label: t("chat.followSentence"), message: t("chat.followSentenceMsg", { word: lastReply.headword.arabic }) },
          { label: t("chat.followQuiz"), message: t("chat.followQuizMsg", { word: lastReply.headword.arabic }) },
          { label: t("chat.followSimpler"), message: t("chat.followSimplerMsg") },
        ]
      : [
          { label: t("chat.followSimpler"), message: t("chat.followSimplerMsg") },
          { label: t("chat.followExample"), message: t("chat.followExampleMsg") },
        ]
    : [];

  const starters = [
    { icon: "chatbubble-outline", text: t("chat.starterBismillah"), meta: t("chat.starterBismillahMeta") },
    { icon: "help-circle-outline", text: t("chat.starterQuiz"), meta: t("chat.starterQuizMeta") },
    { icon: "book-outline", text: t("chat.starterHarakat"), meta: t("chat.starterHarakatMeta") },
    { icon: "moon-outline", text: t("chat.starterFatiha"), meta: t("chat.starterFatihaMeta") },
  ] as const;

  const firstName = (user?.name ?? "").trim().split(/\s+/)[0] ?? "";

  const noorMark = (size: "sm" | "md" | "lg") => (
    <View
      style={[styles.noorMark, size === "sm" ? styles.noorMarkSm : size === "lg" ? styles.noorMarkLg : null]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text style={[styles.noorMarkText, size === "sm" ? styles.noorMarkTextSm : size === "lg" ? styles.noorMarkTextLg : null]}>ن</Text>
    </View>
  );

  const renderAssistant = (message: ChatMessage, key: string) => {
    const headword = message.headword ?? null;
    const saved = headword?.wordId ? savedWords.has(headword.wordId) : false;
    return (
      <View key={key} style={[styles.assistantRow, webLayout.isWeb && styles.assistantRowWeb]}>
        {noorMark("sm")}
        <View style={styles.assistantCard}>
          {headword ? (
            <View style={styles.headword}>
              <ArabicText size="lg" style={styles.headwordArabic}>{headword.arabic}</ArabicText>
              {headword.transliteration || headword.meaning ? (
                <Text style={styles.headwordMeta}>
                  {[headword.transliteration, headword.meaning].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </View>
          ) : null}
          {/* Noor often opens an English reply with an Arabic greeting
              ("السلام عليكم. How can I help…"), and an Urdu learner can still
              get an English answer. Each paragraph takes the direction of its
              own text, with a direction mark for Android (`writingDirection`
              is iOS- and web-only). */}
          <View style={styles.assistantParagraphs}>
            {paragraphs(message.content).map((paragraph, index) => {
              const direction = paragraphDirection(paragraph);
              return (
                <Text key={index} style={[styles.assistantText, direction === "rtl" ? styles.proseRtl : styles.proseLtr]}>
                  {withDirectionMark(paragraph, direction)}
                </Text>
              );
            })}
          </View>
          {headword?.wordId ? (
            <View style={styles.wordActions}>
              <PlayButton
                text={headword.arabic}
                wordId={headword.wordId}
                audioUrl={headword.audioUrl ?? undefined}
                size={16}
                color={WarshPalette.goldText}
                label={t("chat.listen")}
                labelStyle="link"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: saved }}
                disabled={saved}
                onPress={() => void saveWord(headword.wordId as string)}
                style={styles.wordAction}
                hitSlop={6}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16} color={WarshPalette.goldText} />
                <Text style={styles.wordActionText}>{saved ? t("chat.savedWord") : t("chat.saveWord")}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const welcome = (
    <View style={styles.welcome}>
      <View style={styles.welcomeHero}>
        {noorMark("lg")}
        <Text style={styles.welcomeTitle}>{t("chat.welcomeTitle", { name: firstName || t("chat.tutorName") })}</Text>
        <Text style={styles.welcomeBody}>{t("chat.welcomeBody", { language: replyLanguage })}</Text>
      </View>
      <Text style={styles.tryAsking}>{t("chat.tryAsking")}</Text>
      <View style={styles.starterList}>
        {starters.map((starter) => (
          <Pressable
            key={starter.text}
            accessibilityRole="button"
            disabled={sending}
            onPress={() => void sendMessage(starter.text)}
            style={({ pressed }) => [styles.starter, pressed && styles.starterPressed]}
          >
            <View style={styles.starterIcon}>
              <Ionicons name={starter.icon} size={20} color={WarshPalette.goldText} />
            </View>
            <View style={styles.starterCopy}>
              <Text style={styles.starterText}>{starter.text}</Text>
              <Text style={styles.starterMeta}>{starter.meta}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={WarshPalette.metaGrey} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View
        style={
          webLayout.isWeb
            ? [readingStyle, styles.webColumn]
            : [styles.column, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 80 }]
        }
      >
        {/* Header: title row (as Quran and You), then the tutor */}
        <View style={[styles.header, flush]}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t("tabs.noor")}</Text>
            <View style={styles.meter} accessible accessibilityLabel={meterA11y}>
              <Ionicons name="chatbubble-outline" size={16} color={WarshPalette.goldText} />
              <Text style={styles.meterText}>{meterLabel}</Text>
            </View>
          </View>
          {messages.length > 0 ? (
            <View style={styles.tutorRow}>
              {noorMark("md")}
              <View style={styles.tutorCopy}>
                <Text style={styles.tutorName}>{t("chat.tutorName")}</Text>
                <Text style={styles.tutorLine} numberOfLines={1}>{t("chat.tutorLine", { language: replyLanguage })}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {error ? <Text style={[styles.errorText, flush]}>{error}</Text> : null}

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={[styles.messagesContent, flush]}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0
            ? welcome
            : messages.map((message, index) =>
                message.role === "USER" ? (
                  <View key={`USER-${index}`} style={[styles.userBubble, webLayout.isWeb && styles.userBubbleWeb]}>
                    <Text style={[styles.userText, paragraphDirection(message.content) === "rtl" ? styles.proseRtl : styles.proseLtr]}>
                      {withDirectionMark(message.content, paragraphDirection(message.content))}
                    </Text>
                  </View>
                ) : (
                  renderAssistant(message, `ASSISTANT-${index}`)
                ),
              )}
          {sending ? (
            <View style={styles.assistantRow}>
              {noorMark("sm")}
              <View style={[styles.assistantCard, styles.typingCard]}>
                <ActivityIndicator size="small" color={WarshPalette.goldText} />
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Composer */}
        {followUps.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.followUps}
            contentContainerStyle={[styles.followUpsContent, flush]}
            keyboardShouldPersistTaps="handled"
          >
            {followUps.map((followUp) => (
              <Pressable
                key={followUp.label}
                accessibilityRole="button"
                disabled={sending}
                onPress={() => void sendMessage(followUp.message)}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              >
                <Text style={styles.chipText}>{followUp.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View style={[styles.composer, flush]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("chat.placeholder")}
            placeholderTextColor={WarshPalette.subtleBrown}
            accessibilityLabel={t("chat.placeholder")}
            onSubmitEditing={() => void sendMessage()}
            returnKeyType="send"
            maxLength={2000}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("chat.send")}
            accessibilityState={{ disabled: sending || !input.trim() }}
            onPress={() => void sendMessage()}
            disabled={sending || !input.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              (sending || !input.trim()) && styles.sendButtonIdle,
              pressed && styles.sendButtonPressed,
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={WarshPalette.gold} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={WarshPalette.gold} />
            )}
          </Pressable>
        </View>
      </View>
      {webLayout.isWeb ? null : <StatusBarBacking />}

      {/* N2 — Overage Modal */}
      <BottomSheetModal
        visible={showOverageModal}
        onClose={() => setShowOverageModal(false)}
        sheetStyle={[styles.modalCard, { paddingBottom: Spacing.xxl + insets.bottom }]}
      >
        <View style={styles.modalContent}>
            <View style={styles.handleBar} />
            <View style={styles.modalIcon}>
              <Ionicons name="chatbubbles-outline" size={28} color={WarshPalette.goldText} />
            </View>
            <Text style={styles.modalTitle}>{t("chat.packTitle")}</Text>
            <Text style={styles.modalBody}>
              {t("chat.packBody", { limit: usage.limit, price: packDisplayPrice ?? t("chat.packPriceFallback") })}
            </Text>
            <View style={styles.priceRow}>
              <View style={styles.priceCopy}>
                <Text style={styles.priceTitle}>{t("chat.packOptionTitle")}</Text>
                <Text style={styles.priceLabel}>{t("chat.packOptionSub")}</Text>
              </View>
              <Text style={styles.priceAmount}>
                {packPriceLoading ? t("chat.packLoadingPrice") : packDisplayPrice ?? t("chat.packPriceUnavailable")}
              </Text>
            </View>
            <BrandButton
              title={purchasingPack ? t("chat.packProcessing") : packDisplayPrice ? t("chat.packBuy") : t("chat.packBuyUnavailable")}
              onPress={handleBuyNoorPack}
              loading={purchasingPack}
              disabled={purchasingPack || !packDisplayPrice}
              style={styles.packCta}
            />
            <TouchableOpacity
              onPress={() => setShowOverageModal(false)}
              style={styles.dismissButton}
              hitSlop={8}
            >
              <Text style={styles.dismissText}>{t("chat.packLater")}</Text>
            </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  column: { flex: 1 },
  // Reading page (design system › Web layout): the frame sets width, gutter
  // and left edge, so the header, messages and composer drop their own side
  // padding (see `flush`) to line up on it.
  webColumn: {
    flex: 1,
    paddingTop: 36,
    paddingBottom: 28,
  },
  flush: { paddingHorizontal: 0, marginHorizontal: 0 },
  assistantParagraphs: { gap: Spacing.md },
  header: { paddingHorizontal: Spacing.xl },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: WarshPalette.navy,
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: desktopLineHeight(36, 30),
  },
  meter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  meterText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
  },
  tutorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  tutorCopy: { flex: 1, minWidth: 0 },
  tutorName: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    lineHeight: desktopLineHeight(20, 16),
  },
  tutorLine: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  noorMark: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  noorMarkSm: { width: 28, height: 28, marginTop: 2 },
  noorMarkLg: { width: 72, height: 72 },
  noorMarkText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.arabicBold,
    fontSize: desktopFontSize(20),
    lineHeight: desktopLineHeight(28, 20),
  },
  noorMarkTextSm: { fontSize: desktopFontSize(14), lineHeight: desktopLineHeight(20, 14) },
  noorMarkTextLg: { fontSize: desktopFontSize(36), lineHeight: desktopLineHeight(48, 36) },
  errorText: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    color: Colors.text.danger,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
  messages: { flex: 1 },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    backgroundColor: WarshPalette.navy,
  },
  userBubbleWeb: { maxWidth: "64%" },
  userText: {
    color: WarshPalette.creamBg,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: desktopLineHeight(22, 15),
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    alignSelf: "flex-start",
    maxWidth: "92%",
  },
  assistantRowWeb: { maxWidth: "76%" },
  assistantCard: {
    flexShrink: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  typingCard: { paddingVertical: Spacing.sm },
  headword: { alignItems: "center", marginBottom: Spacing.sm },
  headwordArabic: { color: WarshPalette.navy, textAlign: "center" },
  headwordMeta: {
    marginTop: 2,
    color: WarshPalette.goldText,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    textAlign: "center",
  },
  assistantText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },
  proseLtr: {
    textAlign: "left",
    writingDirection: "ltr",
  },
  proseRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  wordActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: WarshPalette.cream,
  },
  wordAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
  },
  wordActionText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
  },
  welcome: { paddingBottom: Spacing.md },
  welcomeHero: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  welcomeTitle: {
    marginTop: Spacing.lg,
    color: WarshPalette.navy,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    lineHeight: desktopLineHeight(30, 24),
    textAlign: "center",
  },
  welcomeBody: {
    marginTop: Spacing.sm,
    maxWidth: 320,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: desktopLineHeight(21, 14),
    textAlign: "center",
  },
  tryAsking: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    color: WarshPalette.goldText,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    textTransform: "uppercase",
  },
  starterList: { gap: Spacing.sm },
  starter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 56,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  starterPressed: { backgroundColor: WarshPalette.parchmentBg },
  starterIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  starterCopy: { flex: 1, minWidth: 0 },
  starterText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.medium,
    fontSize: FontSizes.bodyM,
    lineHeight: desktopLineHeight(18, 14),
  },
  starterMeta: {
    marginTop: 2,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  followUps: { flexGrow: 0, marginBottom: 10 },
  followUpsContent: { gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  chip: {
    height: 32,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  chipPressed: { backgroundColor: WarshPalette.parchmentDeep },
  chipText: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: desktopFontSize(13),
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingVertical: 4,
    paddingLeft: Spacing.lg,
    paddingRight: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    paddingVertical: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.navy,
  },
  sendButtonIdle: { opacity: 0.55 },
  sendButtonPressed: { backgroundColor: WarshPalette.navyDeep },
  modalCard: {
    backgroundColor: WarshPalette.parchmentBg,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  modalContent: {
    alignItems: "center",
  },
  handleBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
    marginBottom: Spacing.xl,
  },
  modalIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentDeep,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    color: WarshPalette.navy,
    fontSize: desktopFontSize(26, "display"),
    lineHeight: desktopLineHeight(32, 26, "display"),
    fontFamily: Fonts.display,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  modalBody: {
    color: WarshPalette.bodyBrown,
    fontSize: desktopFontSize(15),
    lineHeight: desktopLineHeight(22, 15),
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  priceRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginTop: 18,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.white,
  },
  priceCopy: { flex: 1, gap: 2 },
  priceTitle: {
    color: WarshPalette.ink,
    fontSize: FontSizes.bodyL,
    fontFamily: Fonts.bold,
    lineHeight: 22,
  },
  priceAmount: {
    color: WarshPalette.navy,
    fontSize: desktopFontSize(20),
    fontFamily: Fonts.bold,
    lineHeight: desktopLineHeight(26, 20),
  },
  priceLabel: {
    color: WarshPalette.subtleBrown,
    fontSize: desktopFontSize(13),
    fontFamily: Fonts.regular,
    lineHeight: desktopLineHeight(18, 13),
  },
  packCta: { alignSelf: "stretch", marginTop: Spacing.gutter },
  dismissButton: {
    alignSelf: "stretch",
    minHeight: 48,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    color: WarshPalette.navy,
    fontSize: FontSizes.bodyL,
    fontFamily: Fonts.semiBold,
    textAlign: "center",
  },
});
