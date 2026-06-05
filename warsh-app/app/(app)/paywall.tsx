import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { verifyPurchase, getSubscriptionStatus } from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { trackPaywallViewed, trackSubscriptionStarted, trackSubscriptionRestored } from "@services/analytics";
import {
  acknowledgeAndroidPurchase,
  connectIap,
  endIapConnection,
  getAvailableIapPurchases,
  getIapDisplayPrice,
  getIapProductId,
  getSubscriptionProducts,
  isBillingSupportedEnvironment,
  isIapUnavailableError,
  requestSubscriptionPurchase,
  type IapSubscription,
  type IapSubscriptionPurchase,
} from "@services/iap";

export const PRODUCT_IDS = {
  monthly: "warsh_monthly",
  annual: "warsh_yearly",
} as const;

const SKUS = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual];

// Feature comparison: [label, free, premium]
const COMPARISON: [string, boolean, boolean][] = [
  ["Vocabulary Bank (all words)", true,  true],
  ["First chapter free",          true,  true],
  ["All 72 chapters & lessons",   false, true],
  ["Ustaad Noor — AI tutor",      false, true],
  ["Audio for every word & ayah", false, true],
  ["Speaking practice",           false, true],
  ["Tadabbur — Quran deep dive",  false, true],
  ["Streak protection & freezes", false, true],
  ["All future content",          false, true],
];

interface Props {
  dismissable?: boolean;
}

export default function PaywallScreen({ dismissable = true }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [products, setProducts] = useState<IapSubscription[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSubscriptionStatus()
        .then((res) => {
          setTrialDaysRemaining(res.data.data.trialDaysRemaining ?? null);
        })
        .catch(() => {});

      trackPaywallViewed();
      let cancelled = false;

      (async () => {
        const connected = await connectIap();
        if (!connected) { if (!cancelled) setProducts([]); return; }
        if (cancelled) { await endIapConnection(); return; }
        const subs = await getSubscriptionProducts(SKUS);
        if (!cancelled) setProducts(subs);
      })();

      return () => { cancelled = true; endIapConnection(); };
    }, [])
  );

  function getPriceLabel(productId: string) {
    const product = products.find((p) => getIapProductId(p) === productId);
    if (!product) return productId === PRODUCT_IDS.annual ? "$10 / year" : "$1 / month";
    return getIapDisplayPrice(product) ?? (productId === PRODUCT_IDS.annual ? "$10 / year" : "$1 / month");
  }

  async function handlePurchase() {
    if (purchasing) return;
    if (!isBillingSupportedEnvironment()) {
      Alert.alert("Purchases unavailable", "Subscriptions can only be tested in a Play Store test build, not Expo Go.");
      return;
    }
    setPurchasing(true);
    const productId = selected === "annual" ? PRODUCT_IDS.annual : PRODUCT_IDS.monthly;
    const product = products.find((item) => getIapProductId(item) === productId);
    try {
      const purchase = await requestSubscriptionPurchase(productId, product);
      const purchaseRecord = Array.isArray(purchase)
        ? (purchase[0] as IapSubscriptionPurchase)
        : (purchase as IapSubscriptionPurchase);
      const token = purchaseRecord?.purchaseToken;
      const receiptData = (purchaseRecord as { transactionReceipt?: string } | undefined)?.transactionReceipt;
      await verifyPurchase({
        productId,
        purchaseToken: token ?? undefined,
        receiptData: receiptData ?? undefined,
        platform: Platform.OS as "android" | "ios",
      });
      if (token && Platform.OS === "android") await acknowledgeAndroidPurchase(token);
      trackSubscriptionStarted(selected);
      Alert.alert("Subscribed!", "JazakAllah khair. Welcome to Warsh.", [
        { text: "Continue", onPress: () => router.replace("/(app)/trial-reminder") },
      ]);
    } catch (err: any) {
      if (isIapUnavailableError(err)) {
        Alert.alert("Purchases unavailable", "In-app purchases are not available on this build.");
      } else if (err?.code !== "E_USER_CANCELLED") {
        Alert.alert("Purchase failed", "Something went wrong. Please try again or contact support.");
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    if (restoring) return;
    if (!isBillingSupportedEnvironment()) {
      Alert.alert("Restore unavailable", "Purchases can only be restored in a Play Store test build.");
      return;
    }
    setRestoring(true);
    try {
      const purchases = await getAvailableIapPurchases();
      const activePurchase = purchases.find(
        (p) => p.productId === PRODUCT_IDS.annual || p.productId === PRODUCT_IDS.monthly
      );
      if (!activePurchase) { Alert.alert("No subscription found", "No active subscription was found."); return; }
      await verifyPurchase({
        productId: activePurchase.productId,
        purchaseToken: (activePurchase as IapSubscriptionPurchase).purchaseToken ?? undefined,
        receiptData: (activePurchase as { transactionReceipt?: string }).transactionReceipt ?? undefined,
        platform: Platform.OS as "android" | "ios",
      });
      trackSubscriptionRestored(activePurchase.productId);
      Alert.alert("Restored!", "Your subscription has been restored.", [
        { text: "Continue", onPress: () => router.replace("/(app)/(tabs)") },
      ]);
    } catch (err) {
      if (isIapUnavailableError(err)) {
        Alert.alert("Restore unavailable", "In-app purchases are not available on this build.");
      } else {
        Alert.alert("Restore failed", "Could not restore purchases. Please try again.");
      }
    } finally {
      setRestoring(false);
    }
  }

  const billingSupported = isBillingSupportedEnvironment();
  const trialCopy = trialDaysRemaining !== null && trialDaysRemaining > 0
    ? `Free trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""}.`
    : "Unlock the full Warsh experience.";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {dismissable ? (
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={22} color={WarshPalette.bodyBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
        <ArabicText size="sm" style={styles.headerArabic}>وَرْش</ArabicText>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>

        {/* Hero */}
        <Text style={styles.heroTitle}>Continue your journey.</Text>
        <Text style={styles.heroSubtitle}>{trialCopy}</Text>

        {/* Comparison table */}
        <View style={styles.table}>
          {/* Column headers */}
          <View style={styles.tableHeader}>
            <View style={styles.featureCol} />
            <View style={styles.colHeader}>
              <Text style={styles.colHeaderLabel}>Free</Text>
            </View>
            <View style={[styles.colHeader, styles.colHeaderPremium]}>
              <Text style={[styles.colHeaderLabel, styles.colHeaderLabelPremium]}>Premium</Text>
            </View>
          </View>

          {/* Rows */}
          {COMPARISON.map(([label, free, premium], i) => (
            <View key={label} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowAlt : null]}>
              <Text style={styles.featureLabel}>{label}</Text>
              <View style={styles.checkCell}>
                {free
                  ? <Ionicons name="checkmark" size={16} color={WarshPalette.bodyBrown} />
                  : <Text style={styles.dash}>—</Text>}
              </View>
              <View style={[styles.checkCell, styles.premiumCell]}>
                {premium
                  ? <Ionicons name="checkmark" size={16} color={WarshPalette.sage} />
                  : <Text style={styles.dash}>—</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* No payment note */}
        <View style={styles.noPayNote}>
          <Ionicons name="checkmark-circle-outline" size={16} color={WarshPalette.sage} />
          <Text style={styles.noPayText}>No payment due now. Cancel anytime.</Text>
        </View>

        {/* Plan selector */}
        <View style={styles.planRow}>
          <TouchableOpacity
            style={[styles.planTile, selected === "annual" ? styles.planTileSelected : null]}
            onPress={() => setSelected("annual")}
            activeOpacity={0.8}
          >
            <View style={styles.radioOuter}>
              {selected === "annual" ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.planText}>
              <Text style={styles.planPrice}>{getPriceLabel(PRODUCT_IDS.annual)}</Text>
              <Text style={styles.planSub}>Billed annually</Text>
            </View>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 17%</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planTile, selected === "monthly" ? styles.planTileSelected : null]}
            onPress={() => setSelected("monthly")}
            activeOpacity={0.8}
          >
            <View style={styles.radioOuter}>
              {selected === "monthly" ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.planText}>
              <Text style={styles.planPrice}>{getPriceLabel(PRODUCT_IDS.monthly)}</Text>
              <Text style={styles.planSub}>Billed monthly</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, (purchasing || !billingSupported) ? styles.ctaBtnDisabled : null]}
          onPress={handlePurchase}
          disabled={purchasing || !billingSupported}
          activeOpacity={0.85}
        >
          {purchasing
            ? <ActivityIndicator color={WarshPalette.ink} />
            : <Text style={styles.ctaBtnText}>
                {billingSupported
                  ? `Try for free, then ${getPriceLabel(selected === "annual" ? PRODUCT_IDS.annual : PRODUCT_IDS.monthly)}`
                  : "Unavailable in Expo Go"}
              </Text>}
        </TouchableOpacity>

        {/* Restore + legal */}
        <TouchableOpacity onPress={handleRestore} disabled={restoring || !billingSupported} style={styles.restoreBtn}>
          {restoring
            ? <ActivityIndicator color={WarshPalette.gold} size="small" />
            : <Text style={styles.restoreText}>Restore purchases</Text>}
        </TouchableOpacity>

        <Text style={styles.legal}>
          Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
          Payment charged to your Google Play account.
        </Text>
      </ScrollView>
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
  },
  headerArabic: { color: WarshPalette.gold },
  content: { paddingHorizontal: Spacing.xl },

  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.displayL,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: LineHeights.displayL,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyL,
    marginBottom: Spacing.lg,
  },

  // Table
  table: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: WarshPalette.parchmentBg,
    borderBottomWidth: 1,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  featureCol: { flex: 1 },
  colHeader: {
    width: 72,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  colHeaderPremium: {
    backgroundColor: WarshPalette.sage + "22",
  },
  colHeaderLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
    color: WarshPalette.bodyBrown,
  },
  colHeaderLabelPremium: {
    color: WarshPalette.sage,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  tableRowAlt: {
    backgroundColor: WarshPalette.white,
  },
  featureLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
    lineHeight: 18,
    paddingRight: Spacing.xs,
  },
  checkCell: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumCell: {
    backgroundColor: WarshPalette.sage + "0D",
  },
  dash: {
    color: WarshPalette.defaultCardBorder,
    fontSize: 14,
    fontWeight: "700",
  },

  noPayNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  noPayText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.sage,
  },

  // Plan selector
  planRow: { gap: Spacing.sm, marginBottom: Spacing.md },
  planTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  planTileSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: WarshPalette.gold,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: WarshPalette.gold,
  },
  planText: { flex: 1 },
  planPrice: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h3,
    fontWeight: "600",
    color: WarshPalette.ink,
  },
  planSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },
  saveBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sage,
  },
  saveText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    fontWeight: "700",
    color: WarshPalette.white,
  },

  // CTA
  ctaBtn: {
    backgroundColor: WarshPalette.gold,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h3,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
  },

  restoreBtn: { alignItems: "center", paddingVertical: Spacing.sm, marginBottom: Spacing.md },
  restoreText: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    textDecorationLine: "underline",
  },
  legal: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
});
