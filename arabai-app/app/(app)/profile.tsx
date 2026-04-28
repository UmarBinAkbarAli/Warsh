import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await api.get("/api/progress");
        setData(response.data.data);
      } catch (err) {
        setError("Unable to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Profile</Text>
      {error ? <Text style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</Text> : null}
      {data ? (
        <View style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>XP</Text>
          <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 8 }}>{data.xp}</Text>
          <Text style={{ marginBottom: 8 }}>Level: {data.level}</Text>
          <Text style={{ marginBottom: 8 }}>Streak: {data.streak} days</Text>
          <Text style={{ marginBottom: 8 }}>Completed lessons: {data.completedLessons.length}</Text>
        </View>
      ) : null}
      <Pressable onPress={logout} style={{ backgroundColor: "#ef4444", padding: 14, borderRadius: 12 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}
