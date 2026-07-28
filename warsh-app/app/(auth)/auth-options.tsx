import { Linking, Platform, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { useT } from "@i18n/index";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { WEB_BASE_URL } from "@services/api";
import { GoogleAuthSection } from "@components/GoogleAuthSection";
import { useLanguage } from "@services/language";

type Provider = {
  label: string;
  icon: string;
  bg: string;
  text: string;
  border?: string;
  onPress: () => void;
};

export default function AuthOptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useLanguage();
  const t = useT();
  const isUrdu = language === "ur";

  const providers: Provider[] = [
    {
      label: t("auth.continueEmail"),
      icon: "mail-outline",
      bg: WarshPalette.gold,
      text: WarshPalette.ink,
      onPress: () => router.push("/(auth)/register"),
    },
  ];

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 24 : 0),
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name={isUrdu ? "chevron-forward" : "chevron-back"} size={24} color={WarshPalette.ink} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <ArabicText size="sm" style={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </ArabicText>
        <Text style={[styles.title, isUrdu ? styles.urduText : null]}>
          {t("auth.signupTitle")}
        </Text>
      </View>

      {/* Provider buttons */}
      <View style={styles.providers}>
        <GoogleAuthSection context="signup" />
        {providers.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={[
              styles.providerBtn,
              { backgroundColor: p.bg },
              p.border ? { borderWidth: 1, borderColor: p.border } : null,
            ]}
            onPress={p.onPress}
            activeOpacity={0.85}
          >
            <Ionicons
              name={p.icon as any}
              size={20}
              color={p.text}
              style={[styles.providerIcon, isUrdu ? styles.providerIconUrdu : null]}
            />
            <Text style={[styles.providerLabel, { color: p.text }, isUrdu ? styles.urduText : null]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legal */}
      <Text style={[styles.legal, isUrdu ? styles.urduText : null]}>
        {t("auth.legalPrefix")}{" "}
        <Text style={styles.legalLink} onPress={() => void Linking.openURL(`${WEB_BASE_URL}/terms`)}>
          {t("auth.terms")}
        </Text>
        {" "}{t("auth.legalAnd")}{" "}
        <Text style={styles.legalLink} onPress={() => void Linking.openURL(`${WEB_BASE_URL}/privacy`)}>
          {t("auth.privacy")}
        </Text>
        {t("auth.legalSuffix")}
      </Text>

      {/* Login link */}
      <View style={[styles.loginRow, isUrdu ? styles.loginRowUrdu : null]}>
        <Text style={[styles.loginText, isUrdu ? styles.urduText : null]}>
          {t("auth.alreadyAccount")}{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={[styles.loginLink, isUrdu ? styles.urduText : null]}>{t("auth.logIn")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.emphasis,
    paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    marginTop: Spacing.md,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  bismillah: {
    color: WarshPalette.gold,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL * 1.3,
    color: WarshPalette.ink,
    fontWeight: "700",
    textAlign: "center",
  },
  providers: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  providerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.xl,
  },
  providerIcon: {
    position: "absolute",
    left: Spacing.xl,
  },
  providerIconUrdu: {
    left: undefined,
    right: Spacing.xl,
  },
  providerLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    fontWeight: "600",
  },
  legal: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: Spacing.lg,
  },
  legalLink: {
    color: WarshPalette.gold,
    textDecorationLine: "underline",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginRowUrdu: {
    flexDirection: "row-reverse",
  },
  urduText: {
    fontFamily: Fonts.urduFallback,
    writingDirection: "rtl",
  },
  loginText: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
  loginLink: {
    color: WarshPalette.gold,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
  },
});
