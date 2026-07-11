import { Linking, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { API_BASE_URL } from "@services/api";

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

  const providers: Provider[] = [
    {
      label: "Continue with Email",
      icon: "mail-outline",
      bg: WarshPalette.gold,
      text: WarshPalette.ink,
      onPress: () => router.push("/(auth)/register"),
    },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={WarshPalette.ink} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <ArabicText size="sm" style={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </ArabicText>
        <Text style={styles.title}>Let's sign you up{"\n"}to continue</Text>
      </View>

      {/* Provider buttons */}
      <View style={styles.providers}>
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
            <Ionicons name={p.icon as any} size={20} color={p.text} style={styles.providerIcon} />
            <Text style={[styles.providerLabel, { color: p.text }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legal */}
      <Text style={styles.legal}>
        By continuing, you agree to Warsh's{" "}
        <Text style={styles.legalLink} onPress={() => void Linking.openURL(`${API_BASE_URL}/terms`)}>Terms of Service</Text>
        {" "}and{" "}
        <Text style={styles.legalLink} onPress={() => void Linking.openURL(`${API_BASE_URL}/privacy`)}>Privacy Policy</Text>.
      </Text>

      {/* Login link */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
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
