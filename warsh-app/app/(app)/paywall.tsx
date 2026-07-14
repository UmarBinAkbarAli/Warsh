import { useCallback, useEffect, useRef, useState } from "react";
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
  addIapPurchaseListeners,
  connectIap,
  endIapConnection,
  finishIapTransaction,
  getActiveSubscriptionToken,
  getAvailableIapPurchases,
  getIapDisplayPrice,
  getIapProductId,
  getSubscriptionProducts,
  isBillingSupportedEnvironment,
  isIapUnavailableError,
  requestSubscriptionPlanChange,
  requestSubscriptionPurchase,
  type IapSubscription,
  type IapSubscriptionPurchase,
} from "@services/iap";

// Single subscription product with two base plans
export const SUBSCRIPTION_PRODUCT_ID = "warsh_premium";
const BASE_PLAN_IDS = { monthly: "monthly", annual: "yearly" } as const;

const SKUS = [SUBSCRIPTION_PRODUCT_ID];

// Feature comparison: [label, free, premium]
const COMPARISON: [string, boolean, boolean][] = [
  ["Vocabulary Bank (all words)", true,  true],
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
  const [googlePlayVerificationReady, setGooglePlayVerificationReady] = useState<boolean | null>(null);
  // Current subscription (from verified backend state) so we can mark the active
  // plan and switch instead of creating a duplicate subscription.
  const [currentBasePlan, setCurrentBasePlan] = useState<string | null>(null);
  const [subscribedActive, setSubscribedActive] = useState(false);

  // True when the in-flight billing action is a plan switch (vs a first purchase),
  // so the success handler shows the right message.
  const planChangeInFlightRef = useRef(false);

  // Keep the latest selected plan readable from inside listener callbacks (avoids stale closures).
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // True only between launching our own billing flow and handling its result.
  // Gates the global purchase listener so it ignores restores / pending purchases
  // emitted on mount and only reacts to a purchase the user just initiated here.
  const purchaseInFlightRef = useRef(false);

  // react-native-iap v14 delivers purchase results through events, not the
  // `requestPurchase` promise. Register listeners once for the screen's lifetime.
  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};

    (async () => {
      const remove = await addIapPurchaseListeners(
        (purchase) => { if (purchaseInFlightRef.current) void handlePurchaseUpdate(purchase); },
        (error) => { if (purchaseInFlightRef.current) handlePurchaseError(error); },
      );
      if (mounted) cleanup = remove;
      else remove();
    })();

    return () => { mounted = false; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      getSubscriptionStatus()
        .then((res) => {
          const d = res.data.data;
          setTrialDaysRemaining(d.trialDaysRemaining ?? null);
          setGooglePlayVerificationReady(d.googlePlayVerificationReady ?? null);
          setSubscribedActive(Boolean(d.subscriptionActive));
          setCurrentBasePlan(d.subscriptionProductId ?? null);
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

  function getPriceLabel(planKey: "monthly" | "annual") {
    const fallback = planKey === "annual" ? "$10 / year" : "$1 / month";
    const product = products.find((p) => getIapProductId(p) === SUBSCRIPTION_PRODUCT_ID);
    if (!product) return fallback;
    const basePlanId = BASE_PLAN_IDS[planKey];
    const offers = ((product as any)?.subscriptionOffers ?? []) as Array<any>;
    // v14 field is `basePlanIdAndroid` (not `basePlanId`).
    const offer = offers.find((o: any) => o.basePlanIdAndroid === basePlanId);
    if (!offer) return fallback;
    // Prefer the regular recurring phase from the Android pricing phases; the last
    // phase is the ongoing price (earlier phases are free-trial / intro offers).
    const phaseList: any[] = offer?.pricingPhasesAndroid?.pricingPhaseList ?? [];
    const recurringPhase = [...phaseList].reverse().find((p: any) => p.formattedPrice);
    return recurringPhase?.formattedPrice ?? offer.displayPrice ?? fallback;
  }

  // Launches the billing flow. The result arrives asynchronously via the purchase
  // listeners (see effect above) — we must NOT verify here, because on Android this
  // promise resolves before the user finishes paying (token isn't available yet).
  async function handlePurchase() {
    if (purchasing) return;
    if (Platform.OS === "android" && googlePlayVerificationReady === false) {
      Alert.alert(
        "Purchases temporarily unavailable",
        "Warsh cannot safely confirm Google Play purchases right now. Please try again later; no payment has been started.",
      );
      return;
    }
    if (!isBillingSupportedEnvironment()) {
      Alert.alert("Purchases unavailable", "Subscriptions can only be tested in a Play Store test build, not Expo Go.");
      return;
    }
    setPurchasing(true);
    purchaseInFlightRef.current = true;
    planChangeInFlightRef.current = false;
    const productId = SUBSCRIPTION_PRODUCT_ID;
    const basePlanId = BASE_PLAN_IDS[selected];
    const product = products.find((item) => getIapProductId(item) === SUBSCRIPTION_PRODUCT_ID);
    try {
      await requestSubscriptionPurchase(productId, product, basePlanId);
      // Success/failure handled by handlePurchaseUpdate / handlePurchaseError.
    } catch (err: any) {
      // Thrown only if the flow couldn't be launched at all.
      handlePurchaseError(err);
    }
  }

  // Switches the existing subscription to the other base plan via Google Play's
  // upgrade/downgrade flow (no duplicate subscription). Result arrives via the
  // purchase listeners, same as a first purchase.
  async function handleChangePlan() {
    if (purchasing) return;
    if (!currentPlanKey || selected === currentPlanKey) return;
    setPurchasing(true);
    purchaseInFlightRef.current = true;
    planChangeInFlightRef.current = true;
    const productId = SUBSCRIPTION_PRODUCT_ID;
    const newBasePlanId = BASE_PLAN_IDS[selected];
    const product = products.find((item) => getIapProductId(item) === SUBSCRIPTION_PRODUCT_ID);
    try {
      const oldToken = await getActiveSubscriptionToken(productId);
      if (!oldToken) {
        // No existing token found locally — fall back to a normal purchase so the
        // user isn't stuck; Google will still reconcile to a single subscription.
        planChangeInFlightRef.current = false;
        await requestSubscriptionPurchase(productId, product, newBasePlanId);
      } else {
        await requestSubscriptionPlanChange(productId, product, newBasePlanId, oldToken);
      }
    } catch (err: any) {
      handlePurchaseError(err);
    }
  }

  // Called by purchaseUpdatedListener once the purchase actually completes.
  async function handlePurchaseUpdate(purchase: IapSubscriptionPurchase) {
    purchaseInFlightRef.current = false;
    const wasPlanChange = planChangeInFlightRef.current;
    planChangeInFlightRef.current = false;
    try {
      const token = purchase?.purchaseToken;
      const receiptData = (purchase as { transactionReceipt?: string } | undefined)?.transactionReceipt;
      await verifyPurchase({
        productId: SUBSCRIPTION_PRODUCT_ID,
        purchaseToken: token ?? undefined,
        receiptData: receiptData ?? undefined,
        platform: Platform.OS as "android" | "ios",
      });
      // Acknowledge so Google doesn't auto-refund after 3 days.
      await finishIapTransaction(purchase, false);
      trackSubscriptionStarted(selectedRef.current);
      setPurchasing(false);
      if (wasPlanChange) {
        Alert.alert("Plan updated", "Your subscription plan has been changed.", [
          { text: "Done", onPress: () => router.replace("/(app)/manage-subscription") },
        ]);
      } else {
        Alert.alert("Subscribed!", "JazakAllah khair. Welcome to Warsh.", [
          { text: "Continue", onPress: () => router.replace("/(app)/(tabs)") },
        ]);
      }
    } catch (err: any) {
      setPurchasing(false);
      const code = err?.response?.data?.code ?? err?.code ?? "unknown";
      console.error("[IAP] Verify failed:", code, err?.message);
      if (code === "store_not_configured") {
        Alert.alert(
          "Purchase needs attention",
          "Google Play completed the purchase, but Warsh's purchase verification is not configured. This is not caused by your test card. Your purchase can be restored after verification is enabled.",
        );
        return;
      }
      Alert.alert(
        "Couldn't confirm subscription",
        `Your payment may have gone through but we couldn't activate it (${code}). If you were charged, tap "Restore purchases".`,
      );
    }
  }

  // Called by purchaseErrorListener (and when launching the flow throws).
  function handlePurchaseError(err: any) {
    purchaseInFlightRef.current = false;
    planChangeInFlightRef.current = false;
    setPurchasing(false);
    const code = err?.code;
    if (code === "E_USER_CANCELLED" || code === "user-cancelled" || code === "USER_CANCELED" || code === "USER_CANCELLED") {
      return; // User cancelled — no alert needed
    }
    if (isIapUnavailableError(err)) {
      Alert.alert("Purchases unavailable", "In-app purchases are not available on this build.");
      return;
    }
    if (code === "offer_unavailable") {
      Alert.alert(
        "Plan unavailable",
        "This plan couldn't be loaded from Google Play just now. Please try again in a moment.",
      );
      return;
    }
    if (code === "E_ALREADY_OWNED" || code === "already_owned" || code === "ALREADY_OWNED") {
      Alert.alert(
        "Already subscribed",
        "You already have an active subscription. Tap 'Restore purchases' to link it to your account.",
      );
      return;
    }
    console.error("[IAP] Purchase failed:", code, err?.message, JSON.stringify(err));
    Alert.alert("Purchase failed", `Something went wrong (${code ?? "unknown"}). Please try again or contact support.`);
  }

  // Web can't purchase (no IAP). If the user already subscribed on the Android
  // app, this re-checks their account-level entitlement and lets them in.
  async function handleWebRefreshAccess() {
    if (restoring) return;
    setRestoring(true);
    try {
      const res = await getSubscriptionStatus();
      if (res.data.data?.hasAccess) {
        router.replace("/(app)/(tabs)");
      } else {
        Alert.alert(
          "No active subscription yet",
          "We couldn't find an active subscription on this account. Subscribe in the Warsh app on Android, then tap this again.",
        );
      }
    } catch {
      Alert.alert("Couldn't check access", "Please try again in a moment.");
    } finally {
      setRestoring(false);
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
        (p) => p.productId === SUBSCRIPTION_PRODUCT_ID
      );
      if (!activePurchase) { Alert.alert("No subscription found", "No active subscription was found."); return; }
      const restoreToken = (activePurchase as IapSubscriptionPurchase).purchaseToken ?? undefined;
      await verifyPurchase({
        productId: activePurchase.productId,
        purchaseToken: restoreToken,
        receiptData: (activePurchase as { transactionReceipt?: string }).transactionReceipt ?? undefined,
        platform: Platform.OS as "android" | "ios",
      });
      // Acknowledge in case the original purchase was never acknowledged (covers the stuck token case)
      if (restoreToken && Platform.OS === "android") await acknowledgeAndroidPurchase(restoreToken).catch(() => {});
      trackSubscriptionRestored(activePurchase.productId);
      Alert.alert("Restored!", "Your subscription has been restored.", [
        { text: "Continue", onPress: () => router.replace("/(app)/(tabs)") },
      ]);
    } catch (err: any) {
      if (isIapUnavailableError(err)) {
        Alert.alert("Restore unavailable", "In-app purchases are not available on this build.");
      } else {
        console.error("[IAP] Restore failed:", err?.code, err?.message, JSON.stringify(err));
        const code = err?.response?.data?.code ?? err?.code ?? "unknown";
        Alert.alert(
          "Restore failed",
          code === "store_not_configured"
            ? "Warsh's Google Play verification still needs configuration. This is not caused by your test card; your purchase remains available to restore afterward."
            : `Could not restore purchases (${code}). Please try again.`,
        );
      }
    } finally {
      setRestoring(false);
    }
  }

  const billingSupported = isBillingSupportedEnvironment();
  const isWeb = Platform.OS === "web";
  const purchaseReady = billingSupported &&
    (Platform.OS !== "android" || googlePlayVerificationReady === true);
  const trialCopy = trialDaysRemaining !== null && trialDaysRemaining > 0
    ? `Free trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""}.`
    : "Unlock the full Warsh experience.";

  // Which plan key the user currently holds (verified backend state), for marking
  // the "Current plan" and driving switch-vs-purchase.
  const currentPlanKey: "monthly" | "annual" | null =
    subscribedActive && currentBasePlan === "yearly" ? "annual"
    : subscribedActive && currentBasePlan === "monthly" ? "monthly"
    : null;
  const selectedIsCurrent = currentPlanKey != null && selected === currentPlanKey;
  const isSwitching = currentPlanKey != null && !selectedIsCurrent;
  const ctaOnPress = isSwitching ? handleChangePlan : handlePurchase;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {dismissable ? (
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(app)/(tabs)"))}
            hitSlop={8}
          >
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
        <Text style={styles.heroSubtitle}>
          {isWeb
            ? "To unlock all 72 chapters, start your subscription in the Warsh app on Android. It unlocks everything here in your browser too — just sign in with the same account."
            : trialCopy}
        </Text>

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

        {/* No payment note — native only (web can't purchase here) */}
        {!isWeb && trialDaysRemaining !== null && trialDaysRemaining > 0 && (
          <View style={styles.noPayNote}>
            <Ionicons name="checkmark-circle-outline" size={16} color={WarshPalette.sage} />
            <Text style={styles.noPayText}>No payment due now. Cancel anytime.</Text>
          </View>
        )}

        {/* Web instruction card — where to subscribe */}
        {isWeb && (
          <View style={styles.webNote}>
            <Ionicons name="phone-portrait-outline" size={18} color={WarshPalette.sage} />
            <Text style={styles.webNoteText}>
              Subscriptions are purchased in the Warsh Android app via Google Play. Once
              subscribed, return here and refresh to continue on the web.
            </Text>
          </View>
        )}

        {/* Plan selector — native only */}
        {!isWeb && (
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
              <Text style={styles.planPrice}>{getPriceLabel("annual")}</Text>
              <Text style={styles.planSub}>Billed annually</Text>
            </View>
            {currentPlanKey === "annual" ? (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>Current plan</Text>
              </View>
            ) : (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>Save 17%</Text>
              </View>
            )}
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
              <Text style={styles.planPrice}>{getPriceLabel("monthly")}</Text>
              <Text style={styles.planSub}>Billed monthly</Text>
            </View>
            {currentPlanKey === "monthly" ? (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>Current plan</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
        )}

        {/* CTA */}
        {isWeb ? (
          <>
            <TouchableOpacity
              style={[styles.ctaBtn, restoring ? styles.ctaBtnDisabled : null]}
              onPress={handleWebRefreshAccess}
              disabled={restoring}
              activeOpacity={0.85}
            >
              {restoring
                ? <ActivityIndicator color={WarshPalette.ink} />
                : <Text style={styles.ctaBtnText}>I&apos;ve subscribed — refresh access</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")} style={styles.restoreBtn}>
              <Text style={styles.restoreText}>Back to free lessons</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.ctaBtn, (purchasing || !purchaseReady || selectedIsCurrent) ? styles.ctaBtnDisabled : null]}
              onPress={ctaOnPress}
              disabled={purchasing || !purchaseReady || selectedIsCurrent}
              activeOpacity={0.85}
            >
              {purchasing
                ? <ActivityIndicator color={WarshPalette.ink} />
                : <Text style={styles.ctaBtnText}>
                    {!billingSupported
                      ? "Unavailable in Expo Go"
                      : googlePlayVerificationReady === null
                        ? "Checking purchase availability..."
                      : googlePlayVerificationReady === false
                        ? "Purchases temporarily unavailable"
                      : selectedIsCurrent
                        ? "Current plan"
                      : isSwitching
                        ? `Switch to ${selected === "annual" ? "yearly" : "monthly"} plan`
                        : trialDaysRemaining !== null && trialDaysRemaining > 0
                          ? `Try for free, then ${getPriceLabel(selected)}`
                          : `Subscribe for ${getPriceLabel(selected)}`}
                  </Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRestore} disabled={restoring || !billingSupported} style={styles.restoreBtn}>
              {restoring
                ? <ActivityIndicator color={WarshPalette.gold} size="small" />
                : <Text style={styles.restoreText}>Restore purchases</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace("/(app)/(tabs)/vocabulary")}
              style={styles.restoreBtn}
            >
              <Text style={styles.freeAccessText}>Continue with free Vocabulary</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.legal}>
          {isWeb
            ? "Subscriptions are available in the Warsh Android app via Google Play. Once subscribed, sign in here with the same account to continue on the web."
            : "Subscription auto-renews unless cancelled at least 24 hours before the end of the current period. Payment charged to your Google Play account."}
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
  webNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: WarshPalette.sage + "12",
    borderWidth: 1,
    borderColor: WarshPalette.sage + "33",
    marginBottom: Spacing.lg,
  },
  webNoteText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.bodyM,
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
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  currentText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    fontWeight: "700",
    color: WarshPalette.gold,
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
  freeAccessText: {
    color: WarshPalette.sage,
    fontFamily: Fonts.semiBold,
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
