import { useCallback, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import api from "../../services/api";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../constants/theme";

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const [error, setError] = useState<string | null>(null);

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
      setMessages((prev) => [...prev, { role: "USER", content: input.trim() }, { role: "ASSISTANT", content: response.data.data.reply }]);
      setUsage({ used: response.data.data.messagesUsedToday, limit: response.data.data.messagesLimit });
      setInput("");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError("You have reached your daily chat limit.");
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
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm }}>
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
        <View>
          <Text style={{ fontSize: FontSizes.h2, lineHeight: LineHeights.h2, color: Colors.text.primary, fontWeight: "700" }}>Ustaad Noor</Text>
          <Text style={{ color: Colors.text.secondary }}>Warm, patient, and always ready to help.</Text>
        </View>
      </View>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.md }}>
        Chat with your Arabic tutor. {usage.used} of {usage.limit} messages used today.
      </Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.md }}>{error}</Text> : null}
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
      <View style={{ flexDirection: "row", gap: Spacing.sm }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Ustaad Noor"
          placeholderTextColor={Colors.text.muted}
          style={{ flex: 1, borderWidth: 1, borderColor: Colors.border.subtle, borderRadius: Radii.md, padding: Spacing.md, color: Colors.text.primary, backgroundColor: Colors.bg.surface }}
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
    </View>
  );
}
