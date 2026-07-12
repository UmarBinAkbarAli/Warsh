import crypto from "crypto";
import {
  ACCESS_GRANTING_STORE_STATES,
  mapGoogleSubscriptionState,
  type StoreSubscriptionState,
} from "./subscription";

const VALID_PRODUCT_IDS = new Set(["warsh_premium"]);
const GOOGLE_ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const APPLE_PRODUCTION_VERIFY_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_VERIFY_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

type StorePlatform = "android" | "ios";

interface VerifySubscriptionInput {
  platform: StorePlatform;
  productId: string;
  purchaseToken?: string;
  receiptData?: string;
}

export interface VerifiedStoreSubscription {
  productId: string;
  // The purchased base plan ("monthly" / "yearly") when the store exposes it.
  // On Android this is subscriptionsv2 lineItems[].productId; undefined on iOS.
  basePlanId?: string;
  // Real expiry / next-billing instant from the store — never computed locally.
  activeUntil: Date;
  platform: StorePlatform;
  // Raw store state string (e.g. "SUBSCRIPTION_STATE_ACTIVE").
  storeStatus: string;
  // Normalized state persisted into User.subscriptionStatus.
  storeState: StoreSubscriptionState;
  // Whether the store will auto-renew at activeUntil (false once cancelled).
  autoRenew: boolean;
}

export class StoreVerificationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "invalid_purchase") {
    super(message);
    this.name = "StoreVerificationError";
    this.status = status;
    this.code = code;
  }
}

interface GoogleServiceAccountKey {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
}

interface GoogleSubscriptionLineItem {
  productId?: string;
  expiryTime?: string;
  autoRenewingPlan?: { autoRenewEnabled?: boolean };
}

interface GoogleSubscriptionPurchase {
  subscriptionState?: string;
  lineItems?: GoogleSubscriptionLineItem[];
}

interface AppleReceiptTransaction {
  product_id?: string;
  expires_date_ms?: string;
  cancellation_date_ms?: string;
}

interface AppleReceiptResponse {
  status?: number;
  receipt?: {
    bundle_id?: string;
    in_app?: AppleReceiptTransaction[];
  };
  latest_receipt_info?: AppleReceiptTransaction[] | AppleReceiptTransaction;
}

export async function verifyGooglePlayConsumable(productId: string, purchaseToken: string): Promise<void> {
  const token = purchaseToken.trim();
  if (!token) throw new StoreVerificationError("Missing Google Play purchase token.", 400, "bad_request");

  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) throw new StoreVerificationError("Google Play package name is not configured.", 503, "store_not_configured");

  const accessToken = await getGoogleAccessToken();

  const verifyUrl =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(token)}`;

  const verifyResponse = await fetch(verifyUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });

  if (!verifyResponse.ok) {
    throw new StoreVerificationError("Google Play rejected the purchase token.", 400, "invalid_purchase");
  }

  const purchase = (await verifyResponse.json()) as { purchaseState?: number };
  if (purchase.purchaseState !== 0) {
    throw new StoreVerificationError("Google Play purchase is not in a purchased state.", 400, "invalid_purchase");
  }

  // Consume the token server-side so the product can be purchased again
  const consumeUrl =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(token)}:consume`;

  const consumeResponse = await fetch(consumeUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Length": "0" },
  });

  if (!consumeResponse.ok) {
    console.warn(`[noor-pack] Could not consume Google Play token (ending ...${token.slice(-6)}): HTTP ${consumeResponse.status}`);
  }
}

export async function verifyStoreSubscription(input: VerifySubscriptionInput): Promise<VerifiedStoreSubscription> {
  if (!VALID_PRODUCT_IDS.has(input.productId)) {
    throw new StoreVerificationError("Invalid product.", 400, "bad_request");
  }

  if (input.platform === "android") {
    return verifyGooglePlaySubscription(input);
  }

  return verifyAppleSubscription(input);
}

async function verifyGooglePlaySubscription(input: VerifySubscriptionInput): Promise<VerifiedStoreSubscription> {
  const token = input.purchaseToken?.trim();
  if (!token) {
    throw new StoreVerificationError("Missing Google Play purchase token.", 400, "bad_request");
  }

  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) {
    throw new StoreVerificationError("Google Play package name is not configured.", 503, "store_not_configured");
  }

  // No service account key configured — never trust the client for this.
  const rawKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY?.trim();
  if (!rawKey) {
    // Fail closed unless a developer has explicitly opted into granting
    // unverified subscriptions for local testing. NODE_ENV alone is not enough:
    // a preview/staging deploy that forgets to set it would otherwise hand out
    // free 1-year subscriptions to anyone.
    if (process.env.ALLOW_UNVERIFIED_PURCHASES !== "true") {
      throw new StoreVerificationError(
        "Google Play verification is not configured.",
        503,
        "store_not_configured",
      );
    }
    console.warn("[verify] GOOGLE_PLAY_SERVICE_ACCOUNT_KEY not set — granting subscription without server-side verification (ALLOW_UNVERIFIED_PURCHASES opt-in).");
    return {
      productId: input.productId,
      activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      platform: "android",
      storeStatus: "SUBSCRIPTION_STATE_ACTIVE",
      storeState: "active",
      autoRenew: true,
    };
  }

  const snapshot = await fetchGooglePlaySubscriptionSnapshot(packageName, token);

  // Grant/refresh access for any state Google still considers entitled
  // (active, cancelled-but-in-period, grace period) with a future expiry.
  const hasAccess =
    ACCESS_GRANTING_STORE_STATES.has(snapshot.storeState) &&
    snapshot.activeUntil != null &&
    snapshot.activeUntil > new Date();

  if (!hasAccess) {
    throw new StoreVerificationError(
      "Google Play subscription is not active.",
      402,
      "subscription_inactive",
    );
  }

  return {
    productId: input.productId,
    basePlanId: snapshot.basePlanId,
    activeUntil: snapshot.activeUntil as Date,
    platform: "android",
    storeStatus: snapshot.storeStatus,
    storeState: snapshot.storeState,
    autoRenew: snapshot.autoRenew,
  };
}

export interface GoogleSubscriptionSnapshot {
  storeState: StoreSubscriptionState;
  storeStatus: string;
  basePlanId?: string;
  autoRenew: boolean;
  // Real expiry from the store's latest line item; null when none is present.
  activeUntil: Date | null;
}

/**
 * Fetches and normalizes the current state of a Google Play subscription token via
 * `subscriptionsv2`. Throws StoreVerificationError on config/HTTP failure but does
 * NOT throw for inactive states — callers decide how to treat them (the verify
 * endpoint rejects; the RTDN webhook persists them). This is the single source of
 * truth for plan, expiry, auto-renew and state.
 */
export async function fetchGooglePlaySubscriptionSnapshot(
  packageName: string,
  purchaseToken: string,
): Promise<GoogleSubscriptionSnapshot> {
  const accessToken = await getGoogleAccessToken();
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    // Truncate — Google's error payloads can be verbose and we don't want to
    // retain more than needed for debugging in long-lived log storage.
    console.error(`[verify] Google subscriptionsv2 HTTP ${response.status}: ${errBody.slice(0, 300)}`);
    throw new StoreVerificationError("Google Play rejected the purchase token.", 400, "invalid_purchase");
  }

  const purchase = (await response.json()) as GoogleSubscriptionPurchase;
  const storeState = mapGoogleSubscriptionState(purchase.subscriptionState);

  // NOTE: subscriptionsv2 lineItems[].productId is the BASE PLAN ID ("monthly"/"yearly"),
  // not the subscription product ID ("warsh_premium"). The expiry is the store's real
  // next-billing / access-end instant — never computed by adding a fixed interval.
  const latestLineItem = purchase.lineItems
    ?.filter((item) => item.expiryTime)
    .map((item) => ({ ...item, expiryDate: new Date(item.expiryTime as string) }))
    .filter((item) => Number.isFinite(item.expiryDate.getTime()))
    .sort((a, b) => b.expiryDate.getTime() - a.expiryDate.getTime())[0];

  return {
    storeState,
    storeStatus: purchase.subscriptionState ?? "SUBSCRIPTION_STATE_UNSPECIFIED",
    basePlanId: latestLineItem?.productId,
    autoRenew: latestLineItem?.autoRenewingPlan?.autoRenewEnabled ?? (storeState === "active"),
    activeUntil: latestLineItem?.expiryDate ?? null,
  };
}

async function getGoogleAccessToken() {
  const rawKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY?.trim();
  if (!rawKey) {
    throw new StoreVerificationError("Google Play service account key is not configured.", 503, "store_not_configured");
  }

  let key: GoogleServiceAccountKey;
  try {
    key = JSON.parse(rawKey) as GoogleServiceAccountKey;
  } catch {
    throw new StoreVerificationError("Google Play service account key is not valid JSON.", 503, "store_not_configured");
  }

  if (!key.client_email || !key.private_key) {
    throw new StoreVerificationError("Google Play service account key is missing required fields.", 503, "store_not_configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = signGoogleJwt({
    iss: key.client_email,
    scope: GOOGLE_ANDROID_PUBLISHER_SCOPE,
    aud: key.token_uri ?? GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }, key.private_key);

  const response = await fetch(key.token_uri ?? GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new StoreVerificationError("Could not authenticate with Google Play.", 503, "store_unavailable");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new StoreVerificationError("Google OAuth response did not include an access token.", 503, "store_unavailable");
  }

  return data.access_token;
}

function signGoogleJwt(payload: Record<string, string | number>, privateKey: string) {
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKey);
  return `${signingInput}.${base64Url(signature)}`;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function verifyAppleSubscription(input: VerifySubscriptionInput): Promise<VerifiedStoreSubscription> {
  const receiptData = (input.receiptData ?? input.purchaseToken)?.trim();
  if (!receiptData) {
    throw new StoreVerificationError("Missing App Store receipt data.", 400, "bad_request");
  }

  const sharedSecret = process.env.APPLE_SHARED_SECRET?.trim();
  if (!sharedSecret) {
    throw new StoreVerificationError("Apple shared secret is not configured.", 503, "store_not_configured");
  }

  const productionResult = await postAppleReceipt(APPLE_PRODUCTION_VERIFY_URL, receiptData, sharedSecret);
  const result = productionResult.status === 21007
    ? await postAppleReceipt(APPLE_SANDBOX_VERIFY_URL, receiptData, sharedSecret)
    : productionResult;

  if (result.status !== 0) {
    throw new StoreVerificationError("Apple rejected the receipt.", 400, "invalid_purchase");
  }

  const expectedBundleId = process.env.APPLE_BUNDLE_ID?.trim();
  if (expectedBundleId && result.receipt?.bundle_id && result.receipt.bundle_id !== expectedBundleId) {
    throw new StoreVerificationError("Apple receipt bundle id does not match this app.", 400, "invalid_purchase");
  }

  const latestReceiptInfo = Array.isArray(result.latest_receipt_info)
    ? result.latest_receipt_info
    : result.latest_receipt_info
      ? [result.latest_receipt_info]
      : [];
  const transactions = [...latestReceiptInfo, ...(result.receipt?.in_app ?? [])];
  const matchingTransaction = transactions
    .filter((item) => item.product_id === input.productId && item.expires_date_ms && !item.cancellation_date_ms)
    .map((item) => ({ ...item, expiryDate: new Date(Number(item.expires_date_ms)) }))
    .filter((item) => Number.isFinite(item.expiryDate.getTime()))
    .sort((a, b) => b.expiryDate.getTime() - a.expiryDate.getTime())[0];

  if (!matchingTransaction || matchingTransaction.expiryDate <= new Date()) {
    throw new StoreVerificationError("Apple subscription is expired or does not match this product.", 402, "subscription_inactive");
  }

  return {
    productId: input.productId,
    activeUntil: matchingTransaction.expiryDate,
    platform: "ios",
    storeStatus: String(result.status),
    // Apple's /verifyReceipt does not expose auto-renew state without parsing
    // pending_renewal_info; treat a non-cancelled, unexpired receipt as active.
    storeState: "active",
    autoRenew: true,
  };
}

async function postAppleReceipt(url: string, receiptData: string, sharedSecret: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      password: sharedSecret,
      "exclude-old-transactions": true,
    }),
  });

  if (!response.ok) {
    throw new StoreVerificationError("Apple receipt verification is unavailable.", 503, "store_unavailable");
  }

  return response.json() as Promise<AppleReceiptResponse>;
}
