import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";
import { requestNotificationPermission } from "@services/notifications";
import { BrandButton } from "@components/BrandButton";

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleNotifRequest() {
    setLoading(true);
    try {
      const result = await requestNotificationPermission();
      setNotifGranted(result);
    } catch {
      setNotifGranted(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleMicRequest() {
    setLoading(true);
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setMicGranted(granted);
    } catch {
      setMicGranted(false);
    } finally {
      setLoading(false);
    }
  }

  function handleBegin() {
    router.replace("/(app)/(tabs)");
  }

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      {/* Top heading */}
      <View style={styles.topSection}>
        <Text style={styles.heading}>One more thing.</Text>
        <Text style={styles.subheading}>
          These help Warsh work better for you. Both are optional.
        </Text>
      </View>

      {/* Permission cards */}
      <View style={styles.cardsContainer}>

        {/* Notifications card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="notifications-outline" size={24} color={WarshPalette.gold} />
            <Text style={styles.cardTitle}>Daily reminders</Text>
          </View>
          <Text style={styles.cardBody}>
            We'll remind you when it's time for today's lesson. You can change this anytime.
          </Text>
          {notifGranted === null ? (
            <BrandButton
              title="Allow notifications"
              onPress={handleNotifRequest}
              variant="secondary"
              loading={loading}
            />
          ) : notifGranted ? (
            <View style={styles.grantedRow}>
              <Ionicons name="checkmark-circle" size={20} color={WarshPalette.sage} />
              <Text style={styles.grantedText}>Enabled</Text>
            </View>
          ) : (
            <Text style={styles.deniedText}>Off · change in Settings</Text>
          )}
        </View>

        {/* Microphone card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="mic-outline" size={24} color={WarshPalette.gold} />
            <Text style={styles.cardTitle}>Speaking practice</Text>
          </View>
          <Text style={styles.cardBody}>
            Some lessons let you practice speaking. Your recordings stay on your device.
          </Text>
          {micGranted === null ? (
            <BrandButton
              title="Allow microphone"
              onPress={handleMicRequest}
              variant="secondary"
              loading={loading}
            />
          ) : micGranted ? (
            <View style={styles.grantedRow}>
              <Ionicons name="checkmark-circle" size={20} color={WarshPalette.sage} />
              <Text style={styles.grantedText}>Enabled</Text>
            </View>
          ) : (
            <Text style={styles.deniedText}>Off · change in Settings</Text>
          )}
        </View>
      </View>

      {/* Begin CTA */}
      <View style={styles.beginContainer}>
        <BrandButton
          title="Begin →"
          onPress={handleBegin}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WarshPalette.parchmentBg,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
  },

  // Top section
  topSection: {
    alignItems: "center",
    paddingTop: Spacing.md,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: WarshPalette.ink,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },

  // Cards
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },
  card: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h3,
    color: WarshPalette.ink,
    fontWeight: "700",
  },
  cardBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
  },

  // Permission status
  grantedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  grantedText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.sage,
    fontWeight: "600",
  },
  deniedText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },

  // Begin button
  beginContainer: {
    marginTop: Spacing.sm,
  },
});
