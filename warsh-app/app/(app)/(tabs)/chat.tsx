import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, Platform, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import api, { isSubscriptionRequiredError, purchaseNoorPack } from "@services/api";
import { BrandButton } from "@components/BrandButton";
import { useAuthStore } from "@stores/authStore";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";
import { trackNoorMessageSent } from "@services/analytics";
import {
  addIapPurchaseListeners,
  connectIap,
  endIapConnection,
  finishIapTransaction,
  getConsumableProducts,
  getIapDisplayPrice,
  isBillingSupportedEnvironment,
  isIapUnavailableError,
  requestConsumablePurchase,
  type IapSubscriptionPurchase,
} from "@services/iap";

const NOOR_PACK_PRODUCT_ID = "warsh_noor_pack";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<any[]>([]);
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
        router.replace("/(app)/paywall");
        return;
      }
      setError("Unable to load chat history.");
    } finally {
      setLoading(false);
    }
  }, [router]);

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
      Alert.alert("Purchases unavailable", "In-app purchases are only available in a Play Store build, not Expo Go.");
      return;
    }
    if (!user?.id) {
      Alert.alert("Sign in required", "Please sign in again before making a purchase.");
      return;
    }
    if (!packDisplayPrice) {
      Alert.alert("Purchase unavailable", "Google Play has not returned a price for this product. Please try again later.");
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
      Alert.alert(
        "20 messages added!",
        "JazakAllah khair. Noor is ready to help whenever you need.",
        [{ text: "Continue" }]
      );
    } catch (err: any) {
      setPurchasingPack(false);
      const code = err?.response?.data?.code ?? err?.code ?? "unknown";
      console.error("[IAP] Noor pack verify failed:", code, err?.message);
      if (code === "purchase_pending") {
        Alert.alert("Purchase pending", "Google Play is still processing this purchase. Messages will be added after payment completes.");
      } else {
        Alert.alert("Purchase failed", `We couldn't add the pack (${code}). If you were charged, contact support.`);
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
    if (isIapUnavailableError(err)) {
      Alert.alert("Purchases unavailable", "In-app purchases are not available on this build.");
      return;
    }
    console.error("[IAP] Noor pack failed:", code, err?.message);
    Alert.alert("Purchase failed", "Something went wrong. Please try again or contact support.");
  }

  async function sendMessage() {
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const response = await api.post("/api/chat", { message: input.trim() });
      setMessages((prev) => [
        ...prev,
        { role: "USER", content: input.trim() },
        { role: "ASSISTANT", content: response.data.data.reply },
      ]);
      const usedToday = response.data.data.messagesUsedToday;
      setUsage({
        used: usedToday,
        limit: response.data.data.messagesLimit,
        packBalance: response.data.data.noorOverageBalance ?? 0,
      });
      trackNoorMessageSent(usedToday);
      setInput("");
      const newAchievement = response.data.data.newAchievement;
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
      if (isSubscriptionRequiredError(err)) {
        router.replace("/(app)/paywall");
      } else if (err.response?.status === 429) {
        setShowOverageModal(true);
      } else {
        setError("Unable to send message. Try again.");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: Spacing.lg, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm, paddingTop: insets.top }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.bg.card,
            borderWidth: 1,
            borderColor: Colors.accent.gold,
            alignItems: "center",
            justifyContent: "center",
            marginRight: Spacing.md,
          }}
        >
          <Text style={{ color: Colors.accent.gold, fontSize: 18, fontWeight: "700" }}>ن</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FontSizes.h2, lineHeight: LineHeights.h2, color: Colors.text.primary, fontWeight: "700" }}>
            Ustaad Noor
          </Text>
          <Text style={{ color: Colors.text.secondary }} numberOfLines={1}>
            Warm, patient, and always ready to help.
          </Text>
        </View>
      </View>

      {/* Usage indicator */}
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.md }}>
        Chat with your Arabic tutor.{" "}
        {usage.used >= usage.limit && usage.packBalance > 0
          ? `${usage.packBalance} pack message${usage.packBalance !== 1 ? "s" : ""} remaining.`
          : `${usage.used} of ${usage.limit} messages used today.`}
      </Text>

      {/* Non-429 errors */}
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.md }}>{error}</Text> : null}

      {/* Message list */}
      <ScrollView style={{ flex: 1, marginBottom: Spacing.md }} contentContainerStyle={{ paddingBottom: Spacing.sm }}>
        {messages.map((message, index) => (
          <View
            key={`${message.role}-${index}`}
            style={{
              backgroundColor: message.role === "USER" ? "rgba(196, 155, 77, 0.15)" : Colors.bg.card,
              padding: Spacing.md,
              borderRadius: Radii.md,
              marginBottom: Spacing.sm,
              alignSelf: message.role === "USER" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              borderLeftWidth: message.role === "ASSISTANT" ? 2 : 0,
              borderLeftColor: Colors.accent.gold,
              borderWidth: message.role === "USER" ? 0 : 1,
              borderColor: message.role === "USER" ? "transparent" : Colors.border.subtle,
              ...Shadows.card,
            }}
          >
            <Text style={{ color: Colors.text.primary, lineHeight: LineHeights.bodyL }}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input row */}
      <View style={{ flexDirection: "row", gap: Spacing.sm }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Ustaad Noor"
          mode="outlined"
          dense
          style={{ flex: 1, backgroundColor: Colors.bg.surface }}
        />
        <Pressable
          onPress={sendMessage}
          disabled={sending}
          style={({ pressed }) => ({
            backgroundColor: Colors.accent.gold,
            borderRadius: Radii.md + 2,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            justifyContent: "center",
            transform: [{ scale: pressed && !sending ? 0.97 : 1 }],
            opacity: sending ? 0.7 : 1,
          })}
        >
          <Text style={{ color: Colors.bg.primary, fontWeight: "700" }}>{sending ? "Sending" : "Send"}</Text>
        </Pressable>
      </View>

      {/* N2 — Overage Modal */}
      <Modal
        visible={showOverageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOverageModal(false)}
      >
        {/* Backdrop — tap to dismiss */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowOverageModal(false)}
        >
          {/* Bottom-anchored card — block tap propagation so the card itself doesn't dismiss */}
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Plant emoji */}
            <Text style={styles.modalEmoji}>🌿</Text>

            {/* Title */}
            <Text style={styles.modalTitle}>Continue learning with Noor</Text>

            {/* Body */}
            <Text style={styles.modalBody}>
              You've used today's 5 messages with Ustaad Noor. Get 20 additional messages for {packDisplayPrice ?? "the price shown by Google Play"} — they don't expire.
            </Text>

            {/* Price display */}
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>{packPriceLoading ? "Loading price..." : packDisplayPrice ?? "Unavailable"}</Text>
              <Text style={styles.priceLabel}>for 20 messages</Text>
            </View>

            {/* Purchase CTA */}
            <BrandButton
              title={purchasingPack ? "Processing..." : packDisplayPrice ? "Get more messages" : "Purchase unavailable"}
              onPress={handleBuyNoorPack}
              loading={purchasingPack}
              disabled={purchasingPack || !packDisplayPrice}
            />

            {/* Dismiss link */}
            <TouchableOpacity
              onPress={() => setShowOverageModal(false)}
              style={styles.dismissButton}
              hitSlop={8}
            >
              <Text style={styles.dismissText}>Maybe tomorrow</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 26, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: WarshPalette.parchmentBg,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    alignItems: "center",
  },
  handleBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
    marginBottom: Spacing.xl,
  },
  modalEmoji: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    color: WarshPalette.ink,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalBody: {
    color: WarshPalette.bodyBrown,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM * 1.5,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  priceRow: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  priceAmount: {
    color: WarshPalette.ink,
    fontSize: 24,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    lineHeight: 30,
  },
  priceLabel: {
    color: WarshPalette.subtleBrown,
    fontSize: FontSizes.bodyM,
    fontFamily: Fonts.regular,
    lineHeight: LineHeights.bodyM,
    marginTop: Spacing.xs,
  },
  dismissButton: {
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  dismissText: {
    color: WarshPalette.subtleBrown,
    fontSize: FontSizes.bodyM,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
});
