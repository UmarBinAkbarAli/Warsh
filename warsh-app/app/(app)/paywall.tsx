import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { API_BASE_URL, verifyPurchase, getSubscriptionStatus } from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { useT } from "@i18n/index";
import { useLanguage } from "@services/language";
import { trackPaywallViewed, trackSubscriptionStarted, trackSubscriptionRestored } from "@services/analytics";
import {
  acknowledgeAndroidPurchase,
  addIapPurchaseListeners,
  connectIap,
  endIapConnection,
  finishIapTransaction,
  getActiveSubscriptionToken,
  getAvailableIapPurchases,
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

interface Props {
  dismissable?: boolean;
}

export default function PaywallScreen({ dismissable = true }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const t = useT();
  const language = useLanguage();
  const isUrdu = language === "ur";

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
    const fallback = planKey === "annual" ? "$10" : "$1";
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
  const trialChipText = trialDaysRemaining !== null && trialDaysRemaining > 0
    ? t("paywall.trialChip", { days: trialDaysRemaining })
    : t("paywall.premiumChip");
  const benefitItems = [
    { icon: "book-outline" as const, label: t("paywall.benefitChapters") },
    { icon: "sparkles-outline" as const, label: t("paywall.benefitNoor") },
    { icon: "mic-outline" as const, label: t("paywall.benefitPractice") },
  ];

  // Which plan key the user currently holds (verified backend state), for marking
  // the "Current plan" and driving switch-vs-purchase.
  const currentPlanKey: "monthly" | "annual" | null =
    subscribedActive && currentBasePlan === "yearly" ? "annual"
    : subscribedActive && currentBasePlan === "monthly" ? "monthly"
    : null;
  const selectedIsCurrent = currentPlanKey != null && selected === currentPlanKey;
  const isSwitching = currentPlanKey != null && !selectedIsCurrent;
  const ctaOnPress = isSwitching ? handleChangePlan : handlePurchase;
  const selectedPlanLabel = selected === "annual" ? t("paywall.yearly") : t("paywall.monthly");
  const primaryCtaTitle = !billingSupported
    ? t("paywall.unavailableExpo")
    : googlePlayVerificationReady === null
      ? t("paywall.checkingAvailability")
      : googlePlayVerificationReady === false
        ? t("paywall.temporarilyUnavailable")
        : selectedIsCurrent
          ? t("paywall.currentPlan")
          : isSwitching
            ? t("paywall.switchPlan", { plan: selectedPlanLabel })
            : t("paywall.continuePlan", { plan: selectedPlanLabel, price: getPriceLabel(selected) });

  function openLegal(path: "privacy" | "terms") {
    void Linking.openURL(`${API_BASE_URL}/${path}`).catch(() => {});
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {dismissable ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("paywall.close")}
            style={styles.closeButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(app)/(tabs)"))}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={WarshPalette.ink} />
          </TouchableOpacity>
        ) : null}
        <ArabicText size="sm" style={styles.headerArabic}>وَرْش</ArabicText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.sm) + Spacing.md }]}
      >
        <View style={styles.trialChip}>
          <Ionicons name="timer-outline" size={13} color={WarshPalette.navy} />
          <Text style={[styles.trialChipText, isUrdu && styles.urduText]}>{trialChipText}</Text>
        </View>

        <Text style={[styles.heroTitle, isUrdu && styles.urduText]}>{t("paywall.title")}</Text>
        <Text style={[styles.heroSubtitle, isUrdu && styles.urduText]}>
          {isWeb ? t("paywall.webHero") : t("paywall.subtitle")}
        </Text>

        <View style={styles.benefitsCard}>
          {benefitItems.map((item) => (
            <View key={item.label} style={[styles.benefitRow, isUrdu && styles.rowRtl]}>
              <View style={styles.benefitIcon}>
                <Ionicons name={item.icon} size={15} color={WarshPalette.sageDeep} />
              </View>
              <Text style={[styles.benefitText, isUrdu && styles.urduText]}>{item.label}</Text>
            </View>
          ))}
          <Text style={[styles.featuresLink, isUrdu && styles.urduText]}>{t("paywall.seeFeatures")}</Text>
        </View>

        {isWeb ? (
          <View style={[styles.webNote, isUrdu && styles.rowRtl]}>
            <Ionicons name="phone-portrait-outline" size={18} color={WarshPalette.sageDeep} />
            <Text style={[styles.webNoteText, isUrdu && styles.urduText]}>{t("paywall.webInstruction")}</Text>
          </View>
        ) : (
          <View accessibilityRole="radiogroup" style={styles.planList}>
            <TouchableOpacity
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === "annual" }}
              style={[styles.planCard, selected === "annual" && styles.planCardSelected]}
              onPress={() => setSelected("annual")}
              activeOpacity={0.82}
            >
              <Ionicons
                name={selected === "annual" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={selected === "annual" ? WarshPalette.gold : WarshPalette.sageSoft}
              />
              <View style={styles.planMain}>
                <Text style={[styles.planTitle, isUrdu && styles.urduText]}>{t("paywall.yearly")}</Text>
                <Text style={[styles.planMeta, isUrdu && styles.urduText]}>
                  {t("paywall.yearlyPrice", { price: getPriceLabel("annual") })}
                </Text>
              </View>
              <View style={[styles.valueBadge, currentPlanKey === "annual" && styles.currentBadge]}>
                <Text style={[styles.valueBadgeText, isUrdu && styles.urduText]}>
                  {currentPlanKey === "annual" ? t("paywall.currentPlan") : t("paywall.bestValue")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === "monthly" }}
              style={[styles.planCard, selected === "monthly" && styles.planCardSelected]}
              onPress={() => setSelected("monthly")}
              activeOpacity={0.82}
            >
              <Ionicons
                name={selected === "monthly" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={selected === "monthly" ? WarshPalette.gold : WarshPalette.sageSoft}
              />
              <Text style={[styles.planTitle, styles.planMain, isUrdu && styles.urduText]}>{t("paywall.monthly")}</Text>
              <Text style={[styles.monthlyPrice, isUrdu && styles.urduText]}>
                {t("paywall.monthlyPrice", { price: getPriceLabel("monthly") })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isWeb ? (
          <>
            <BrandButton
              title={t("paywall.refreshAccess")}
              onPress={handleWebRefreshAccess}
              loading={restoring}
              disabled={restoring}
              style={styles.primaryButton}
            />
            <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")} style={styles.textAction}>
              <Text style={[styles.restoreText, isUrdu && styles.urduText]}>{t("paywall.backToFree")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <BrandButton
              title={primaryCtaTitle}
              onPress={ctaOnPress}
              loading={purchasing}
              disabled={purchasing || !purchaseReady || selectedIsCurrent}
              style={styles.primaryButton}
            />
            <View style={[styles.reassuranceRow, isUrdu && styles.rowRtl]}>
              <Ionicons name="shield-checkmark-outline" size={13} color={WarshPalette.subtleBrown} />
              <Text style={[styles.reassuranceText, isUrdu && styles.urduText]}>{t("paywall.playReassurance")}</Text>
            </View>
            <TouchableOpacity
              onPress={handleRestore}
              disabled={restoring || !billingSupported}
              style={styles.textAction}
            >
              {restoring
                ? <ActivityIndicator color={WarshPalette.goldDeep} size="small" />
                : <Text style={[styles.restoreText, isUrdu && styles.urduText]}>{t("paywall.restore")}</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace("/(app)/(tabs)/vocabulary")}
              style={styles.textAction}
            >
              <Text style={[styles.freeAccessText, isUrdu && styles.urduText]}>{t("paywall.continueVocabulary")}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={[styles.legalLinks, isUrdu && styles.rowRtl]}>
          <Text onPress={() => openLegal("terms")} style={[styles.legalLink, isUrdu && styles.urduText]}>
            {t("paywall.terms")}
          </Text>
          <Text style={styles.legalDivider}>·</Text>
          <Text onPress={() => openLegal("privacy")} style={[styles.legalLink, isUrdu && styles.urduText]}>
            {t("paywall.privacy")}
          </Text>
        </View>
        <Text style={[styles.legal, isUrdu && styles.urduText]}>
          {isWeb ? t("paywall.webLegal") : t("paywall.subscriptionLegal")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.gutter,
  },
  closeButton: {
    position: "absolute",
    left: Spacing.gutter,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  headerArabic: {
    color: WarshPalette.ink,
    fontSize: 23,
  },
  content: {
    paddingHorizontal: Spacing.gutter,
  },
  trialChip: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.sageTintBg,
    marginBottom: Spacing.md,
  },
  trialChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.navy,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: 32,
    marginBottom: 5,
  },
  heroSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.md,
  },
  urduText: {
    fontFamily: Fonts.urduFallback,
    textAlign: "right",
    writingDirection: "rtl",
  },
  rowRtl: {
    flexDirection: "row-reverse",
  },
  benefitsCard: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.sm,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 36,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.sageTintBg,
  },
  benefitText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
    lineHeight: LineHeights.bodyM,
  },
  featuresLink: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.goldDeep,
    paddingTop: 4,
    paddingBottom: 2,
  },
  planList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  planCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  planMain: {
    flex: 1,
  },
  planTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h3,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: LineHeights.h3,
  },
  planMeta: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    color: WarshPalette.subtleBrown,
    lineHeight: LineHeights.label,
  },
  monthlyPrice: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    fontWeight: "700",
    color: WarshPalette.ink,
  },
  valueBadge: {
    maxWidth: 128,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.sageTintBg,
  },
  valueBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    color: WarshPalette.navy,
    textAlign: "center",
  },
  currentBadge: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBg,
  },
  primaryButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
  },
  reassuranceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 2,
  },
  reassuranceText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    lineHeight: LineHeights.label,
  },
  textAction: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  restoreText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    textDecorationLine: "underline",
  },
  freeAccessText: {
    color: WarshPalette.sageDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    textDecorationLine: "underline",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: 2,
  },
  legalLink: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    textDecorationLine: "underline",
  },
  legalDivider: {
    color: WarshPalette.sageSoft,
  },
  legal: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    lineHeight: 13,
    marginTop: 4,
  },
  webNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: WarshPalette.sageTintBg,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    marginBottom: Spacing.md,
  },
  webNoteText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.bodyM,
  },
});
