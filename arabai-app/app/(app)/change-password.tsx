import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { BrandButton } from "@components/BrandButton";
import {
  WarshPalette,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  Radii,
} from "../../constants/theme";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/change-password", { currentPassword, newPassword });
      Alert.alert("Password changed", "Your password has been updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to change password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Current password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter current password"
            placeholderTextColor={WarshPalette.subtleBrown}
          />
          <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showCurrent ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={WarshPalette.subtleBrown}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: Spacing.lg }]}>New password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="At least 8 characters"
            placeholderTextColor={WarshPalette.subtleBrown}
          />
          <TouchableOpacity onPress={() => setShowNew((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showNew ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={WarshPalette.subtleBrown}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Confirm new password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showNew}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Repeat new password"
            placeholderTextColor={WarshPalette.subtleBrown}
          />
        </View>

        <BrandButton
          title="Update password"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.wrongText,
    marginBottom: Spacing.md,
    lineHeight: LineHeights.bodyM,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WarshPalette.white,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
    paddingVertical: Spacing.md,
  },
  submitBtn: { marginTop: Spacing.xl },
});
