import { useCallback, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../constants/theme";
import { BrandButton } from "../../components/BrandButton";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/progress");
      setData(response.data.data);
    } catch (err) {
      setError("Unable to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
      return undefined;
    }, [loadProgress])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.lg }}>Your progress</Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.md }}>{error}</Text> : null}
      {data ? (
        <View style={{ backgroundColor: Colors.bg.card, padding: Spacing.lg, borderRadius: Radii.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border.subtle, ...Shadows.card }}>
          <Text style={{ fontSize: FontSizes.h3, lineHeight: LineHeights.h3, color: Colors.text.secondary, marginBottom: Spacing.sm }}>XP</Text>
          <Text style={{ fontSize: 32, color: Colors.accent.gold, fontWeight: "800", marginBottom: Spacing.sm }}>{data.xp}</Text>
          <Text style={{ marginBottom: Spacing.sm, color: Colors.text.primary }}>Level: {data.level}</Text>
          <View
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: 999,
              backgroundColor: "rgba(255, 107, 53, 0.2)",
              borderWidth: 1,
              borderColor: Colors.accent.streak,
              marginBottom: Spacing.sm,
            }}
          >
            <Text style={{ color: Colors.accent.streak, fontSize: 18, fontWeight: "800", marginRight: Spacing.sm }}>{data.streak}</Text>
            <Text style={{ color: Colors.accent.streak }}>day streak</Text>
          </View>
          <Text style={{ marginBottom: Spacing.sm, color: Colors.text.secondary }}>Completed lessons: {data.completedLessons.length}</Text>
        </View>
      ) : null}
      <BrandButton title="Log Out" onPress={logout} variant="danger" />
    </ScrollView>
  );
}
