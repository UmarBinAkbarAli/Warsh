import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette, WarshAlpha } from "../../constants/theme";
import api from "@services/api";
import { useAuthStore } from "@stores/authStore";
import { BrandButton } from "@components/BrandButton";
import { ScreenHeader } from "@components/ScreenHeader";
import { useT } from "@i18n/index";
import { isDesktopWeb } from "@components/WebPage";

// Mirrors DISPLAY_NAME_MAX_LENGTH in warsh-backend/lib/displayName.ts.
const NAME_MAX_LENGTH = 60;

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktopWeb = isDesktopWeb(width);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const t = useT();

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const trimmedName = name.replace(/\s+/g, " ").trim();
  const nameChanged = trimmedName !== (user?.name ?? "");
  const nameValid = trimmedName.length > 0 && trimmedName.length <= NAME_MAX_LENGTH;

  async function handleSave() {
    if (saving) return;
    if (!nameValid) {
      setError(t("editProfile.nameInvalid"));
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // The app-language choice is hidden (owner, 2026-10-30), so only the name
      // is saved here and an existing Urdu interface is left as it is.
      if (nameChanged) {
        await api.patch("/api/users/me", { name: trimmedName });
        patchUser({ name: trimmedName });
      }
      setSuccess(true);
      setTimeout(() => router.back(), 800);
    } catch {
      setError(t("editProfile.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={t("editProfile.title")} style={desktopWeb ? styles.webHeaderRow : null} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          desktopWeb && styles.webRow,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Feedback banners */}
        {success ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{t("editProfile.saved")}</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Personal section */}
        <Text style={styles.sectionHeader}>{t("editProfile.personal")}</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t("editProfile.name")}</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            maxLength={NAME_MAX_LENGTH}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            accessibilityLabel={t("editProfile.name")}
            placeholderTextColor={WarshPalette.subtleBrown}
          />
        </View>

        {/* Save button */}
        <View style={styles.saveButtonContainer}>
          <BrandButton
            title={saving ? t("common.saving") : t("common.saveChanges")}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            variant="primary"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WarshPalette.parchmentBg,
  },

  // Content
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  webRow: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  webHeaderRow: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingTop: 36,
  },

  // Feedback banners
  successBanner: {
    backgroundColor: WarshAlpha.sageTint,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: WarshPalette.sage,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.sage,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: WarshPalette.wrongBg,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: WarshPalette.wrongBorder,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.wrongText,
    textAlign: "center",
  },

  // Section header
  sectionHeader: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    color: WarshPalette.goldText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginLeft: 2,
    marginTop: Spacing.md,
  },

  // Personal card
  card: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: WarshPalette.white,
  },


  // Save button
  saveButtonContainer: {
    marginTop: Spacing.sm,
  },
});
