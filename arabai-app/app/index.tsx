import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "./stores/authStore";
import { Colors } from "../constants/theme";

export const PREVIEW_SEEN_KEY = "warsh_preview_seen";

export default function Index() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const [previewChecked, setPreviewChecked] = useState(false);
  const [hasSeenPreview, setHasSeenPreview] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREVIEW_SEEN_KEY).then((val) => {
      setHasSeenPreview(val === "1");
      setPreviewChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || !previewChecked) return;
    if (token) {
      router.replace("/(app)/(tabs)");
    } else if (hasSeenPreview) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/(auth)/preview/a1-welcome");
    }
  }, [isHydrated, previewChecked, token, hasSeenPreview]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Colors.accent.gold} />
    </View>
  );
}
