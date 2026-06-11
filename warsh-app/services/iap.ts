import Constants from "expo-constants";
import { Platform } from "react-native";

type IapModule = typeof import("react-native-iap");

export type IapSubscription = import("react-native-iap").ProductOrSubscription;
export type IapSubscriptionPurchase = import("react-native-iap").Purchase;

let iapModule: IapModule | null | undefined;
let connected = false;
let connectionAttempt: Promise<boolean> | null = null;

export class IapUnavailableError extends Error {
  code = "IAP_UNAVAILABLE";

  constructor() {
    super("In-app purchases are not available in this build or on this device.");
    this.name = "IapUnavailableError";
  }
}

export function isBillingSupportedEnvironment() {
  return Constants.appOwnership !== "expo" && (Platform.OS === "android" || Platform.OS === "ios");
}

export function isIapUnavailableError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "IAP_UNAVAILABLE" || code === "E_IAP_NOT_AVAILABLE" || code === "iap-not-available" || code === "billing-unavailable";
}

async function getIapModule() {
  if (!isBillingSupportedEnvironment()) {
    return null;
  }

  if (iapModule !== undefined) {
    return iapModule;
  }

  try {
    iapModule = await import("react-native-iap");
  } catch {
    iapModule = null;
  }

  return iapModule;
}

export async function connectIap() {
  if (connected) {
    return true;
  }

  if (connectionAttempt) {
    return connectionAttempt;
  }

  connectionAttempt = (async () => {
    const IAP = await getIapModule();
    if (!IAP) {
      return false;
    }

    try {
      await IAP.initConnection();
      connected = true;
      return true;
    } catch {
      return false;
    } finally {
      connectionAttempt = null;
    }
  })();

  return connectionAttempt;
}

export async function endIapConnection() {
  if (!connected) {
    return;
  }

  const IAP = await getIapModule();
  connected = false;

  if (!IAP) {
    return;
  }

  await IAP.endConnection().catch(() => {});
}

export async function getSubscriptionProducts(skus: string[]) {
  const available = await connectIap();
  if (!available) {
    return [];
  }

  const IAP = await getIapModule();
  if (!IAP) {
    return [];
  }

  try {
    return (await IAP.fetchProducts({ skus, type: "subs" })) ?? [];
  } catch {
    return [];
  }
}

export function getIapProductId(product: IapSubscription) {
  return product.id;
}

export function getIapDisplayPrice(product: IapSubscription) {
  const anyProduct = product as any;
  return anyProduct.displayPrice ?? anyProduct.localizedPrice;
}

function getAndroidSubscriptionOffer(product: IapSubscription | undefined, basePlanId?: string) {
  if (!product) return undefined;
  const offers = ((product as any)?.subscriptionOffers ?? []) as Array<any>;
  // Prefer the offer matching the requested base plan; fall back to first available.
  // NOTE: in react-native-iap v14 the field is `basePlanIdAndroid`, NOT `basePlanId`.
  // Using the wrong name made this match always fail and silently sent the FIRST
  // offer (monthly), so the Play sheet always showed the monthly price.
  const offer = basePlanId
    ? (offers.find((o) => o.basePlanIdAndroid === basePlanId && o.offerTokenAndroid) ?? offers.find((o) => o.offerTokenAndroid))
    : offers.find((o) => o.offerTokenAndroid);
  if (!offer?.offerTokenAndroid) return undefined;
  return [{ sku: product.id, offerToken: offer.offerTokenAndroid }];
}

/**
 * Subscribe to purchase result events. In react-native-iap v14 `requestPurchase`
 * is event-based: it resolves once the billing flow is *launched*, NOT when the
 * purchase completes. The completed purchase (with `purchaseToken`) is delivered
 * here via `purchaseUpdatedListener`; failures/cancellations via `purchaseErrorListener`.
 *
 * Returns a cleanup function that removes both listeners. Safe to call in Expo Go
 * (returns a no-op cleanup).
 */
export async function addIapPurchaseListeners(
  onPurchase: (purchase: IapSubscriptionPurchase) => void,
  onError: (error: unknown) => void,
): Promise<() => void> {
  const IAP = await getIapModule();
  if (!IAP) {
    return () => {};
  }

  const updateSub = IAP.purchaseUpdatedListener(onPurchase);
  const errorSub = IAP.purchaseErrorListener(onError);

  return () => {
    updateSub.remove();
    errorSub.remove();
  };
}

/**
 * Acknowledge (subscriptions) or consume (consumables) a completed purchase.
 * This replaces the raw `acknowledgePurchaseAndroid(token)` call for flows where
 * we hold the full purchase object from a listener.
 */
export async function finishIapTransaction(purchase: IapSubscriptionPurchase, isConsumable = false) {
  const IAP = await getIapModule();
  if (!IAP) {
    return;
  }

  await IAP.finishTransaction({ purchase, isConsumable });
}

/**
 * Launches the native billing flow. The resolved value is NOT the purchase —
 * listen via `addIapPurchaseListeners` for the actual result. See note above.
 */
export async function requestSubscriptionPurchase(productId: string, product?: IapSubscription, basePlanId?: string) {
  const available = await connectIap();
  const IAP = await getIapModule();

  if (!available || !IAP) {
    throw new IapUnavailableError();
  }

  return IAP.requestPurchase({
    type: "subs",
    request: {
      apple: { sku: productId },
      google: {
        skus: [productId],
        subscriptionOffers: getAndroidSubscriptionOffer(product, basePlanId),
      },
    },
  });
}

export async function getAvailableIapPurchases() {
  const available = await connectIap();
  const IAP = await getIapModule();

  if (!available || !IAP) {
    throw new IapUnavailableError();
  }

  return IAP.getAvailablePurchases();
}

export async function requestConsumablePurchase(productId: string) {
  const available = await connectIap();
  const IAP = await getIapModule();

  if (!available || !IAP) {
    throw new IapUnavailableError();
  }

  return IAP.requestPurchase({
    type: "in-app",
    request: {
      apple: { sku: productId },
      google: { skus: [productId] },
    },
  });
}

export async function finishConsumableAndroidPurchase(token: string) {
  if (Platform.OS !== "android") return;
  const available = await connectIap();
  const IAP = await getIapModule();
  if (!available || !IAP) return;
  // Tell the billing library the consumable is done so it's available to buy again
  try {
    await (IAP as any).consumePurchaseAndroid({ token });
  } catch {
    await (IAP as any).acknowledgePurchaseAndroid(token).catch(() => {});
  }
}

export async function acknowledgeAndroidPurchase(token: string) {
  if (Platform.OS !== "android") {
    return;
  }

  const available = await connectIap();
  const IAP = await getIapModule();

  if (!available || !IAP) {
    return;
  }

  await IAP.acknowledgePurchaseAndroid(token);
}
