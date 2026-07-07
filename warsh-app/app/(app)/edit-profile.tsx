import { useState } from "react";
import {
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
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import api from "@services/api";
import { useAuthStore } from "@stores/authStore";
import { BrandButton } from "@components/BrandButton";
import { useT } from "@i18n/index";

type Lang = "en" | "ur";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const t = useT();

  const [selectedLang, setSelectedLang] = useState<Lang>(
    (user?.nativeLanguage as Lang) ?? "en"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch("/api/users/me", { nativeLanguage: selectedLang });
      patchUser({ nativeLanguage: selectedLang });
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSide} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("editProfile.title")}</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.headerSide, styles.saveBtn]}
          hitSlop={8}
        >
          <Text style={[styles.saveBtnText, saving ? styles.saveBtnDisabled : null]}>
            {saving ? t("common.saving") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.avatarHint}>{t("editProfile.changePhotoSoon")}</Text>
        </View>

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
            value={user?.name ?? ""}
            editable={false}
            placeholderTextColor={WarshPalette.subtleBrown}
          />
          <Text style={styles.comingSoonNote}>{t("editProfile.nameSoon")}</Text>
        </View>

        {/* Language section */}
        <Text style={styles.sectionHeader}>{t("editProfile.language")}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[
              styles.langCard,
              selectedLang === "en" ? styles.langCardSelected : styles.langCardUnselected,
            ]}
            onPress={() => setSelectedLang("en")}
            activeOpacity={0.75}
          >
            <Text style={[styles.langTitle, selectedLang === "en" ? styles.langTitleSelected : null]}>
              {t("editProfile.englishLabel")}
            </Text>
            <Text style={styles.langSubtitle}>{t("editProfile.englishUi")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langCard,
              selectedLang === "ur" ? styles.langCardSelected : styles.langCardUnselected,
            ]}
            onPress={() => setSelectedLang("ur")}
            activeOpacity={0.75}
          >
            <Text style={[styles.langTitle, selectedLang === "ur" ? styles.langTitleSelected : null]}>
              {t("editProfile.urduLabel")}
            </Text>
            <Text style={styles.langSubtitle}>{t("editProfile.urduUi")}</Text>
          </TouchableOpacity>
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  headerSide: {
    width: 60,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: WarshPalette.ink,
    fontWeight: "700",
    textAlign: "center",
  },
  saveBtn: {
    alignItems: "flex-end",
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.gold,
    fontWeight: "700",
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },

  // Content
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 36,
  },
  avatarHint: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    fontStyle: "italic",
  },

  // Feedback banners
  successBanner: {
    backgroundColor: "rgba(122, 139, 112, 0.12)",
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
    color: WarshPalette.gold,
    fontWeight: "700",
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
    fontWeight: "600",
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
    opacity: 0.5,
    backgroundColor: WarshPalette.creamBg,
  },
  comingSoonNote: {
    marginTop: Spacing.xs,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    fontStyle: "italic",
  },

  // Language cards
  langRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  langCard: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
  },
  langCardSelected: {
    backgroundColor: WarshPalette.parchmentBg,
    borderColor: WarshPalette.gold,
  },
  langCardUnselected: {
    backgroundColor: WarshPalette.white,
    borderColor: WarshPalette.defaultCardBorder,
  },
  langTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.bodyBrown,
    fontWeight: "600",
    textAlign: "center",
  },
  langTitleSelected: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontWeight: "700",
  },
  langSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
    textAlign: "center",
  },

  // Save button
  saveButtonContainer: {
    marginTop: Spacing.sm,
  },
});
