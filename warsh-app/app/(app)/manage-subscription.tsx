import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { getSubscriptionStatus } from "@services/api";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";

const SUBSCRIPTION_PRODUCT_ID = "warsh_premium";

// Deep link to THIS subscription's management page in the Play Store.
const PLAY_SUBSCRIPTION_URL =
  `https://play.google.com/store/account/subscriptions?sku=${SUBSCRIPTION_PRODUCT_ID}&package=com.warsh.app`;

// Normalized store states persisted by the backend (source of truth).
type StoreState =
  | "active" | "canceled" | "in_grace" | "on_hold" | "paused" | "expired" | "pending";

interface SubState {
  subscriptionStatus: string;
  storeState: StoreState | null;
  willCancel: boolean;
  inGracePeriod: boolean;
  trialDaysRemaining: number;
  trialActive: boolean;
  subscriptionActive: boolean;
  hasAccess: boolean;
  subscriptionActiveUntil: string | null;
  subscriptionProductId: string | null;
  noorOverageBalance: number;
}

export default function ManageSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const language = useLanguage();
  const t = useT();

  const [state, setState] = useState<SubState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await getSubscriptionStatus();
      setState(res.data.data as SubState);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh + verify whenever the screen gains focus.
  useFocusEffect(
    useCallback(() => {
      void load();
      return undefined;
    }, [load])
  );

  // Refresh when the app returns to the foreground — e.g. after the user manages
  // or cancels the subscription over in the Google Play app.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") void load();
    });
    return () => sub.remove();
  }, [load]);

  function planLabel(productId: string | null) {
    switch (productId) {
      case "yearly":
        return t("manageSub.planYearly");
      case "monthly":
        return t("manageSub.planMonthly");
      default:
        return t("manageSub.planPremium");
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return null;
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return null;
    return d.toLocaleDateString(language === "ur" ? "ur-PK" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function openPlayStore() {
    void Linking.openURL(PLAY_SUBSCRIPTION_URL).catch(() => {
      Alert.alert(t("settings.errorTitle"), t("manageSub.openPlayError"));
    });
  }

  const isAndroid = Platform.OS === "android";

  // Build the view model from verified backend state (never local guesses).
  const storeState = state?.storeState ?? null;
  const subscriptionActive = state?.subscriptionActive ?? false;
  const trialActive = state?.trialActive ?? false;
  const date = formatDate(state?.subscriptionActiveUntil ?? null);

  type Tone = "good" | "warn" | "muted";
  let statusKey = "manageSub.statusNone";
  let tone: Tone = "muted";
  let planName: string | null = null;
  let dateLine: string | null = null;
  let bodyLine: string | null = null;
  let showManage = false; // "Manage or cancel" (has a store subscription)
  let showChangePlan = false;
  let showSeePlans = false;

  if (trialActive) {
    statusKey = "manageSub.statusTrial";
    tone = "warn";
    planName = t("manageSub.freeTrial");
    dateLine = t("manageSub.trialDaysLeft", {
      count: state?.trialDaysRemaining ?? 0,
      suffix: (state?.trialDaysRemaining ?? 0) !== 1 ? "s" : "",
    });
    showSeePlans = true;
  } else if (subscriptionActive) {
    // active / cancelled-but-in-period / grace period — all still have access.
    planName = planLabel(state?.subscriptionProductId ?? null);
    showManage = isAndroid;
    showChangePlan = true;
    if (state?.inGracePeriod) {
      statusKey = "manageSub.statusGrace";
      tone = "warn";
      dateLine = date ? t("manageSub.graceUntil", { date }) : null;
      bodyLine = t("manageSub.graceBody");
    } else if (state?.willCancel) {
      statusKey = "manageSub.statusActive";
      tone = "good";
      dateLine = date ? t("manageSub.cancelsOn", { date }) : null;
      bodyLine = t("manageSub.cancelBody");
    } else {
      statusKey = "manageSub.statusActive";
      tone = "good";
      dateLine = date ? t("manageSub.renewsOn", { date }) : null;
      bodyLine = t("manageSub.manageHint");
    }
  } else if (storeState === "on_hold") {
    statusKey = "manageSub.statusOnHold";
    tone = "warn";
    planName = planLabel(state?.subscriptionProductId ?? null);
    bodyLine = t("manageSub.onHoldBody");
    showManage = isAndroid;
  } else if (storeState === "paused") {
    statusKey = "manageSub.statusPaused";
    tone = "warn";
    planName = planLabel(state?.subscriptionProductId ?? null);
    bodyLine = t("manageSub.pausedBody");
    showManage = isAndroid;
  } else if (storeState === "pending") {
    statusKey = "manageSub.statusPending";
    tone = "warn";
    planName = planLabel(state?.subscriptionProductId ?? null);
    bodyLine = t("manageSub.pendingBody");
    showManage = isAndroid;
  } else {
    // expired / never subscribed
    statusKey = "manageSub.statusNone";
    tone = "muted";
    planName = t("manageSub.noPlan");
    bodyLine = t("manageSub.noPlanSub");
    showSeePlans = true;
  }

  const toneColor =
    tone === "good" ? WarshPalette.sage
    : tone === "warn" ? WarshPalette.gold
    : WarshPalette.subtleBrown;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("manageSub.title")}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={WarshPalette.gold} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("manageSub.loadError")}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); void load(); }} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Status card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: toneColor }]} />
              <Text style={[styles.statusLabel, { color: toneColor }]}>{t(statusKey)}</Text>
            </View>
            {planName ? <Text style={styles.planName}>{planName}</Text> : null}
            {dateLine ? <Text style={styles.planMeta}>{dateLine}</Text> : null}
            {bodyLine ? <Text style={styles.planHint}>{bodyLine}</Text> : null}
          </View>

          {/* Noor balance, if any */}
          {(state?.noorOverageBalance ?? 0) > 0 ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubbles-outline" size={18} color={WarshPalette.sage} />
              <Text style={styles.infoText}>
                {t("manageSub.noorBalance", { count: state?.noorOverageBalance ?? 0 })}
              </Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            {showSeePlans ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/(app)/paywall")}>
                <Text style={styles.primaryBtnText}>{t("manageSub.seePlans")}</Text>
              </TouchableOpacity>
            ) : null}

            {showManage ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={openPlayStore}>
                <Ionicons name="logo-google-playstore" size={16} color={WarshPalette.ink} />
                <Text style={styles.secondaryBtnText}>{t("manageSub.manageOrCancel")}</Text>
              </TouchableOpacity>
            ) : null}

            {showChangePlan ? (
              <TouchableOpacity style={styles.linkBtn} onPress={() => router.push("/(app)/paywall")}>
                <Text style={styles.linkText}>{t("manageSub.changePlan")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.legal}>{t("manageSub.legal")}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.parchmentCardBorder,
  },
  backBtn: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, width: 60 },
  headerTitle: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.h2, fontWeight: "700" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl, gap: Spacing.md },
  errorText: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, textAlign: "center",
  },
  retryBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  retryText: { color: WarshPalette.gold, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyL },

  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xl * 2 },

  statusCard: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: {
    fontFamily: Fonts.semiBold, fontSize: FontSizes.caption,
    fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8,
  },
  planName: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700", lineHeight: LineHeights.h2,
  },
  planMeta: {
    marginTop: Spacing.xs, color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL,
  },
  planHint: {
    marginTop: Spacing.sm, color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption, lineHeight: LineHeights.caption,
  },

  infoRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    marginTop: Spacing.md, paddingHorizontal: Spacing.xs,
  },
  infoText: {
    flex: 1, color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyM,
  },

  actions: { marginTop: Spacing.xl, gap: Spacing.sm },
  primaryBtn: {
    backgroundColor: WarshPalette.gold, padding: Spacing.lg,
    borderRadius: Radii.lg, alignItems: "center",
  },
  primaryBtnText: {
    color: WarshPalette.ink, fontFamily: Fonts.bold,
    fontSize: FontSizes.h3, fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm,
    padding: Spacing.lg, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  secondaryBtnText: {
    color: WarshPalette.ink, fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL, fontWeight: "600",
  },
  linkBtn: { alignItems: "center", paddingVertical: Spacing.md },
  linkText: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, textDecorationLine: "underline",
  },
  legal: {
    marginTop: Spacing.xl, color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption,
    textAlign: "center", lineHeight: 16,
  },
});
