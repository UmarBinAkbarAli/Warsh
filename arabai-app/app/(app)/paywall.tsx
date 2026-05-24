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

// ─── product IDs ─────────────────────────────────────────────────────────────

export const PRODUCT_IDS = {
  monthly: "warsh_monthly",
  annual: "warsh_annual",
} as const;

const SKUS = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual];

// ─── feature list ─────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "book-outline", text: "All 72 chapters and ~380 lessons" },
  { icon: "chatbubble-ellipses-outline", text: "Ustaad Noor — your AI tutor (5 msgs/day)" },
  { icon: "document-text-outline", text: "Tadabbur — understand the Quran word by word" },
  { icon: "shield-checkmark-outline", text: "Streak protection + freezes" },
  { icon: "volume-medium-outline", text: "Audio for every word and ayah" },
  { icon: "mic-outline", text: "Speaking practice — SHADOW_REPEAT" },
  { icon: "star-outline", text: "All future content and updates" },
];

// ─── main screen ─────────────────────────────────────────────────────────────

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
  const [userName, setUserName] = useState("");

  useFocusEffect(
    useCallback(() => {
      // Load subscription state (for personalised copy)
      getSubscriptionStatus()
        .then((res) => {
          setTrialDaysRemaining(res.data.data.trialDaysRemaining ?? null);
        })
        .catch(() => {});

      trackPaywallViewed();

      let cancelled = false;

      // Load IAP products from store. Expo Go and non-billing builds get static fallback prices.
      (async () => {
        const connected = await connectIap();
        if (!connected) {
          if (!cancelled) {
            setProducts([]);
          }
          return;
        }

        if (cancelled) {
          await endIapConnection();
          return;
        }

        const subs = await getSubscriptionProducts(SKUS);
        if (!cancelled) {
          setProducts(subs);
        }
      })();

      return () => {
        cancelled = true;
        endIapConnection();
      };
    }, [])
  );

  function getPriceLabel(productId: string) {
    const product = products.find((p) => getIapProductId(p) === productId);
    if (!product) {
      return productId === PRODUCT_IDS.annual ? "$10 / year" : "$1 / month";
    }
    return getIapDisplayPrice(product) ?? (productId === PRODUCT_IDS.annual ? "$10 / year" : "$1 / month");
  }

  async function handlePurchase() {
    if (purchasing) return;
    if (!isBillingSupportedEnvironment()) {
      Alert.alert(
        "Purchases unavailable",
        "Subscriptions can only be tested in a development or Play Store test build, not Expo Go."
      );
      return;
    }

    setPurchasing(true);

    const productId = selected === "annual" ? PRODUCT_IDS.annual : PRODUCT_IDS.monthly;
    const product = products.find((item) => getIapProductId(item) === productId);

    try {
      // Trigger native IAP purchase
      const purchase = await requestSubscriptionPurchase(productId, product);
      const token = Array.isArray(purchase)
        ? (purchase[0] as IapSubscriptionPurchase).purchaseToken
        : (purchase as IapSubscriptionPurchase)?.purchaseToken;

      // Verify with our backend
      await verifyPurchase({
        productId,
        purchaseToken: token ?? undefined,
        platform: Platform.OS as "android" | "ios",
      });

      // Acknowledge the purchase (required on Android)
      if (token && Platform.OS === "android") {
        await acknowledgeAndroidPurchase(token);
      }

      trackSubscriptionStarted(selected);
      Alert.alert(
        "Subscribed!",
        "JazakAllah khair. Welcome to Warsh.",
        [{ text: "Continue", onPress: () => router.replace("/(app)/(tabs)") }]
      );
    } catch (err: any) {
      // User cancelled — silent
      if (isIapUnavailableError(err)) {
        Alert.alert(
          "Purchases unavailable",
          "In-app purchases are not available on this build or device. Use a Play Store test build to test subscriptions."
        );
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
      Alert.alert(
        "Restore unavailable",
        "Purchases can only be restored in a development or Play Store test build, not Expo Go."
      );
      return;
    }

    setRestoring(true);

    try {
      const purchases = await getAvailableIapPurchases();
      const activePurchase = purchases.find(
        (p) => p.productId === PRODUCT_IDS.annual || p.productId === PRODUCT_IDS.monthly
      );

      if (!activePurchase) {
        Alert.alert("No subscription found", "No active subscription was found for this account.");
        return;
      }

      await verifyPurchase({
        productId: activePurchase.productId,
        purchaseToken: (activePurchase as IapSubscriptionPurchase).purchaseToken ?? undefined,
        platform: Platform.OS as "android" | "ios",
      });

      trackSubscriptionRestored(activePurchase.productId);
      Alert.alert(
        "Subscription restored",
        "Your subscription has been restored.",
        [{ text: "Continue", onPress: () => router.replace("/(app)/(tabs)") }]
      );
    } catch (err) {
      if (isIapUnavailableError(err)) {
        Alert.alert(
          "Restore unavailable",
          "In-app purchases are not available on this build or device. Use a Play Store test build to restore subscriptions."
        );
      } else {
        Alert.alert("Restore failed", "Could not restore purchases. Please try again.");
      }
    } finally {
      setRestoring(false);
    }
  }

  const trialCopy =
    trialDaysRemaining !== null && trialDaysRemaining > 0
      ? `Your free trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""}.`
      : "Your free trial has ended.";
  const billingSupported = isBillingSupportedEnvironment();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {dismissable ? (
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={WarshPalette.bodyBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <ArabicText size="sm" style={styles.headerArabic}>وَرْش</ArabicText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.lampIcon}>
            <Ionicons name="book" size={48} color={WarshPalette.gold} />
          </View>
          <Text style={styles.heroTitle}>Continue your journey.</Text>
          <Text style={styles.heroSubtitle}>{trialCopy}</Text>
          <Text style={styles.heroTagline}>Less than a cup of chai — per month.</Text>
        </View>

        {/* Pricing tiles */}
        <View style={styles.pricingSection}>
          {/* Annual — pre-selected */}
          <TouchableOpacity
            style={[styles.priceTile, selected === "annual" ? styles.priceTileSelected : null]}
            onPress={() => setSelected("annual")}
            activeOpacity={0.8}
          >
            <View style={styles.priceTileRow}>
              <View style={styles.radioOuter}>
                {selected === "annual" ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.priceTileText}>
                <Text style={[styles.priceLabel, selected === "annual" ? styles.priceLabelSelected : null]}>
                  {getPriceLabel(PRODUCT_IDS.annual)}
                </Text>
                <Text style={styles.priceSub}>Billed annually</Text>
              </View>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Save 17%</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.priceTile, selected === "monthly" ? styles.priceTileSelected : null]}
            onPress={() => setSelected("monthly")}
            activeOpacity={0.8}
          >
            <View style={styles.priceTileRow}>
              <View style={styles.radioOuter}>
                {selected === "monthly" ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.priceTileText}>
                <Text style={[styles.priceLabel, selected === "monthly" ? styles.priceLabelSelected : null]}>
                  {getPriceLabel(PRODUCT_IDS.monthly)}
                </Text>
                <Text style={styles.priceSub}>Billed monthly</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, purchasing || !billingSupported ? styles.ctaBtnDisabled : null]}
          onPress={handlePurchase}
          disabled={purchasing || !billingSupported}
          activeOpacity={0.85}
        >
          {purchasing ? (
            <ActivityIndicator color={WarshPalette.white} />
          ) : (
            <Text style={styles.ctaBtnText}>
              {billingSupported ? "Start subscription" : "Unavailable in Expo Go"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.cancelNote}>
          {billingSupported
            ? "Cancel anytime in your device settings."
            : "Use a development or Play Store test build to test subscriptions."}
        </Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={f.icon as any} size={18} color={WarshPalette.sage} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Restore */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring || !billingSupported}
          style={[styles.restoreBtn, !billingSupported ? styles.restoreBtnDisabled : null]}
        >
          {restoring ? (
            <ActivityIndicator color={WarshPalette.gold} size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore purchases</Text>
          )}
        </TouchableOpacity>

        {/* Free vocabulary note */}
        <View style={styles.freeNote}>
          <Ionicons name="library-outline" size={16} color={WarshPalette.sage} />
          <Text style={styles.freeNoteText}>
            Vocabulary Bank remains free, whether you subscribe or not.
          </Text>
        </View>

        {/* Legal */}
        <Text style={styles.legalText}>
          Subscription auto-renews unless cancelled at least 24 hours before the end of the current
          period. Payment charged to your Google Play account. Manage or cancel in Google Play
          Settings.
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

  // Hero
  hero: { alignItems: "center", paddingVertical: Spacing.xl },
  lampIcon: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1, borderColor: WarshPalette.gold + "55",
    alignItems: "center", justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h1, fontWeight: "700",
    lineHeight: LineHeights.h1, textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, textAlign: "center",
    lineHeight: LineHeights.bodyL,
  },
  heroTagline: {
    marginTop: Spacing.xs, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyM,
    fontStyle: "italic", textAlign: "center",
  },

  // Pricing
  pricingSection: { gap: Spacing.sm, marginBottom: Spacing.lg },
  priceTile: {
    padding: Spacing.md, borderRadius: Radii.lg,
    borderWidth: 1.5, borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  priceTileSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  priceTileRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: WarshPalette.gold,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: WarshPalette.gold,
  },
  priceTileText: { flex: 1 },
  priceLabel: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700",
  },
  priceLabelSelected: { color: WarshPalette.sage },
  priceSub: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, marginTop: 2,
  },
  popularBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radii.full ?? 999,
    backgroundColor: WarshPalette.sage,
  },
  popularText: {
    color: WarshPalette.white, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, fontWeight: "700",
  },

  // CTA
  ctaBtn: {
    backgroundColor: WarshPalette.ink,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: {
    color: WarshPalette.gold, fontFamily: Fonts.display,
    fontSize: FontSizes.h3, fontWeight: "700",
    textAlign: "center",
  },
  cancelNote: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, textAlign: "center",
    marginBottom: Spacing.lg,
  },

  // Features
  featureList: {
    gap: Spacing.sm, marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 0.5, borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  featureRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
  },
  featureText: {
    flex: 1, color: WarshPalette.ink,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },

  // Restore
  restoreBtn: {
    alignItems: "center", paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  restoreBtnDisabled: { opacity: 0.5 },
  restoreText: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, textDecorationLine: "underline",
  },

  // Free vocab note
  freeNote: {
    flexDirection: "row", alignItems: "flex-start",
    gap: Spacing.sm, padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: "#EDF5ED",
    borderWidth: 0.5, borderColor: WarshPalette.sage + "55",
    marginBottom: Spacing.lg,
  },
  freeNoteText: {
    flex: 1, color: WarshPalette.sage,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },

  // Legal
  legalText: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, textAlign: "center",
    lineHeight: 16, marginBottom: Spacing.md,
  },
});
