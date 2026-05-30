import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { BrandButton } from "@components/BrandButton";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";
import { trackNoorMessageSent } from "@services/analytics";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const [error, setError] = useState<string | null>(null);
  const [showOverageModal, setShowOverageModal] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/chat/history");
      setMessages(response.data.data.messages);
    } catch (err) {
      setError("Unable to load chat history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
      return undefined;
    }, [loadHistory])
  );

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
      setUsage({ used: usedToday, limit: response.data.data.messagesLimit });
      trackNoorMessageSent(usedToday);
      setInput("");
    } catch (err: any) {
      if (err.response?.status === 429) {
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
        Chat with your Arabic tutor. {usage.used} of {usage.limit} messages used today.
      </Text>

      {/* Non-429 errors */}
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.md }}>{error}</Text> : null}

      {/* Message list */}
      <ScrollView style={{ flex: 1, marginBottom: Spacing.md }} contentContainerStyle={{ paddingBottom: Spacing.sm }}>
        {messages.map((message, index) => (
          <View
            key={`${message.role}-${index}`}
            style={{
              backgroundColor: message.role === "USER" ? "rgba(212, 168, 71, 0.15)" : Colors.bg.card,
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
              You've used today's 5 messages with Ustaad Noor. Get 20 additional messages for $0.99 — they don't expire.
            </Text>

            {/* Price display */}
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>$0.99</Text>
              <Text style={styles.priceLabel}>for 20 messages</Text>
            </View>

            {/* Purchase CTA */}
            <BrandButton
              title="Get more messages →"
              onPress={() => {
                Alert.alert("Coming soon", "In-app purchase will be available soon.");
                setShowOverageModal(false);
              }}
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
    backgroundColor: "rgba(15, 17, 23, 0.72)",
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
