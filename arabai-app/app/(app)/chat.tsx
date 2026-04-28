import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import api from "../services/api";

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await api.get("/api/chat/history");
        setMessages(response.data.data.messages);
        setLoading(false);
      } catch (err) {
        setError("Unable to load chat history.");
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>Ustadh Noor</Text>
      <Text style={{ color: "#6b7280", marginBottom: 12 }}>
        Chat with your Arabic tutor. {usage.used} of {usage.limit} messages used today.
      </Text>
      {error ? <Text style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</Text> : null}
      <ScrollView style={{ flex: 1, marginBottom: 12 }}>
        {messages.map((message, index) => (
          <View key={`${message.role}-${index}`} style={{ backgroundColor: message.role === "USER" ? "#e0f2fe" : "#f3f4f6", padding: 12, borderRadius: 12, marginBottom: 8, alignSelf: message.role === "USER" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <Text style={{ color: "#111827" }}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Ustadh Noor"
          style={{ flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, padding: 12 }}
        />
        <Pressable onPress={sendMessage} disabled={sending} style={{ backgroundColor: "#0f766e", borderRadius: 12, padding: 16, justifyContent: "center" }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{sending ? "Sending" : "Send"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
