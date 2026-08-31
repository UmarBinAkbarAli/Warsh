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
  // sha256(userId), matching what the client sends to Play at purchase time.
  expectedObfuscatedAccountId?: string;
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
  // Google's acknowledgement state at verification time. An unacknowledged
  // subscription is auto-refunded by Google after three days even though the
  // payment succeeded, so this is entitlement-critical, not cosmetic.
  // Undefined on iOS (Apple has no equivalent step).
  acknowledged?: boolean;
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

/**
 * Google reports server-side configuration failures (unlinked Cloud project,
 * revoked service-account access, wrong package name) with ordinary HTTP error
 * codes on the same endpoint that rejects genuinely bad purchase tokens.
 * Collapsing them all into `invalid_purchase` told a charged customer that THEIR
 * purchase was invalid when the fault was entirely ours, and made the failure
 * look final to the client instead of retryable. Classify before throwing.
 */
function classifyGoogleApiFailure(status: number, reason: string | undefined) {
  // "No application was found for the given package name" and friends: nothing
  // about the token is wrong, so the purchase must stay recoverable.
  const configReasons = new Set([
    "applicationNotFound",
    "projectNotLinked",
    "accessNotConfigured",
    "forbidden",
    "permissionDenied",
    "unauthorized",
  ]);

  if (reason && configReasons.has(reason)) {
    return {
      message: "Google Play verification is temporarily unavailable.",
      status: 503,
      code: "store_unavailable",
    };
  }

  // 401/403 -> our credentials. 404 without a token-specific reason -> almost
  // always package/app resolution. 5xx and 429 -> Google-side, retry later.
  if (status === 401 || status === 403 || status === 404 || status === 429 || status >= 500) {
    return {
      message: "Google Play verification is temporarily unavailable.",
      status: 503,
      code: "store_unavailable",
    };
  }

  // Everything else (notably a 400 naming the token) really is a bad purchase.
  return {
    message: "Google Play rejected the purchase token.",
    status: 400,
    code: "invalid_purchase",
  };
}

function extractGoogleErrorReason(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as {
      error?: { status?: string; errors?: Array<{ reason?: string }> };
    };
    return parsed.error?.errors?.[0]?.reason ?? parsed.error?.status ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Non-secret fingerprint of the configured package name. The value itself is not
 * a credential, but the *shape* is what actually breaks: a copy/paste that keeps
 * surrounding quotes or a trailing newline produces a package name Google cannot
 * resolve while looking identical in a dashboard that masks the value.
 */
export function describePackageNameConfig() {
  const raw = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  if (raw == null) return { configured: false as const };
  const trimmed = raw.trim();
  return {
    configured: true as const,
    value: trimmed,
    rawLength: raw.length,
    trimmedLength: trimmed.length,
    hasSurroundingQuotes: /^["'].*["']$/.test(trimmed),
    hasWhitespace: /\s/.test(trimmed),
    differsAfterTrim: raw !== trimmed,
  };
}

/** Service-account identity actually presented to Google. Email only — never key material. */
export function describeServiceAccountConfig() {
  const rawKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY?.trim();
  if (!rawKey) return { configured: false as const };
  try {
    const key = JSON.parse(rawKey) as GoogleServiceAccountKey & { project_id?: string; private_key_id?: string };
    return {
      configured: true as const,
      clientEmail: key.client_email,
      projectId: key.project_id,
      // Identifies WHICH key is deployed without revealing it, so a rotation can
      // be confirmed against the key list in Google Cloud.
      privateKeyId: key.private_key_id,
      parsed: true as const,
    };
  } catch {
    return { configured: true as const, parsed: false as const };
  }
}

interface GoogleServiceAccountKey {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
}

interface GoogleSubscriptionLineItem {
  // The SUBSCRIPTION product id ("warsh_premium") — not the base plan.
  productId?: string;
  expiryTime?: string;
  autoRenewingPlan?: { autoRenewEnabled?: boolean };
  // Where the purchased base plan ("monthly" / "yearly") actually lives.
  offerDetails?: { basePlanId?: string; offerId?: string; offerTags?: string[] };
}

interface GoogleSubscriptionPurchase {
  subscriptionState?: string;
  // Set only when the buying client passed an obfuscated account id at purchase
  // time. Absent for every subscription bought before we started sending one.
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  lineItems?: GoogleSubscriptionLineItem[];
  // "ACKNOWLEDGEMENT_STATE_PENDING" | "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED"
  acknowledgementState?: string;
  // Present when this subscription replaced an earlier one (plan change,
  // re-subscribe, restore after reinstall). The old token stops receiving
  // notifications, so any record still keyed to it is stale.
  linkedPurchaseToken?: string;
}

interface GoogleProductPurchase {
  purchaseState?: number;
  consumptionState?: number;
  orderId?: string;
  productId?: string;
  quantity?: number;
  obfuscatedExternalAccountId?: string;
}

export interface VerifiedGooglePlayConsumable {
  orderId?: string;
  quantity: number;
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

export async function verifyGooglePlayConsumable(
  productId: string,
  purchaseToken: string,
  expectedObfuscatedAccountId: string,
): Promise<VerifiedGooglePlayConsumable> {
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
    const errBody = await verifyResponse.text().catch(() => "");
    const reason = extractGoogleErrorReason(errBody);
    console.error(`[verify] Google products HTTP ${verifyResponse.status}: ${errBody.slice(0, 300)}`);
    logGooglePlayConfigContext(reason);
    const { message, status, code } = classifyGoogleApiFailure(verifyResponse.status, reason);
    throw new StoreVerificationError(message, status, code);
  }

  const purchase = (await verifyResponse.json()) as GoogleProductPurchase;
  if (purchase.purchaseState === 2) {
    throw new StoreVerificationError("Google Play purchase is still pending.", 409, "purchase_pending");
  }
  if (purchase.purchaseState !== 0) {
    throw new StoreVerificationError("Google Play purchase is canceled or invalid.", 400, "invalid_purchase");
  }
  if (purchase.consumptionState !== 0) {
    throw new StoreVerificationError("Google Play purchase was already consumed.", 409, "purchase_already_consumed");
  }
  if (purchase.productId && purchase.productId !== productId) {
    throw new StoreVerificationError("Google Play purchase does not match this product.", 400, "invalid_purchase");
  }
  if (purchase.obfuscatedExternalAccountId !== expectedObfuscatedAccountId) {
    throw new StoreVerificationError("Google Play purchase does not belong to this account.", 403, "purchase_account_mismatch");
  }

  const quantity = purchase.quantity ?? 1;
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new StoreVerificationError("Google Play purchase quantity is invalid.", 400, "invalid_purchase");
  }

  return { orderId: purchase.orderId, quantity };
}

/**
 * Emits the configuration context alongside a Google API failure. Without this
 * the logs record Google's complaint but not what we actually sent, which is the
 * single hardest part of diagnosing an `applicationNotFound`.
 */
function logGooglePlayConfigContext(reason: string | undefined) {
  const pkg = describePackageNameConfig();
  const sa = describeServiceAccountConfig();
  console.error(
    "[verify] google play config context:",
    JSON.stringify({
      reason: reason ?? null,
      packageName: pkg.configured
        ? {
            value: pkg.value,
            trimmedLength: pkg.trimmedLength,
            hasSurroundingQuotes: pkg.hasSurroundingQuotes,
            hasWhitespace: pkg.hasWhitespace,
            differsAfterTrim: pkg.differsAfterTrim,
          }
        : null,
      serviceAccount: sa.configured && sa.parsed
        ? { clientEmail: sa.clientEmail, projectId: sa.projectId, privateKeyId: sa.privateKeyId }
        : { configured: sa.configured, parsed: sa.configured ? sa.parsed : false },
    }),
  );
}

export interface GooglePlayDiagnostics {
  packageName: ReturnType<typeof describePackageNameConfig>;
  serviceAccount: ReturnType<typeof describeServiceAccountConfig>;
  oauth: { ok: boolean; error?: string };
  applicationResolves: { ok: boolean; httpStatus?: number; reason?: string; body?: string; error?: string };
}

/**
 * Live self-test of the Google Play verification path, independent of any real
 * purchase. Authenticates, then probes the package with a deliberately invalid
 * token: a reachable, correctly-linked app answers with a token-specific 400,
 * whereas a configuration fault answers 404 `applicationNotFound` regardless of
 * the token. That distinction is exactly what a purchase-driven failure cannot
 * show you, because a real purchase confounds the two.
 */
export async function runGooglePlayDiagnostics(): Promise<GooglePlayDiagnostics> {
  const packageName = describePackageNameConfig();
  const serviceAccount = describeServiceAccountConfig();

  const result: GooglePlayDiagnostics = {
    packageName,
    serviceAccount,
    oauth: { ok: false },
    applicationResolves: { ok: false },
  };

  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken();
    result.oauth = { ok: true };
  } catch (error) {
    result.oauth = { ok: false, error: (error as Error)?.message ?? "unknown" };
    return result;
  }

  if (!packageName.configured) {
    result.applicationResolves = { ok: false, error: "GOOGLE_PLAY_PACKAGE_NAME is not set" };
    return result;
  }

  // Intentionally invalid token — this probe must never touch a real purchase.
  const probeToken = "warsh-diagnostic-probe-token";
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName.value)}` +
    `/purchases/subscriptionsv2/tokens/${encodeURIComponent(probeToken)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    const body = await response.text().catch(() => "");
    const reason = extractGoogleErrorReason(body);
    result.applicationResolves = {
      // The app resolved if Google got far enough to complain about the token
      // rather than about the application itself.
      ok: response.status !== 404 || (reason != null && reason !== "applicationNotFound"),
      httpStatus: response.status,
      reason,
      body: body.slice(0, 500),
    };
  } catch (error) {
    result.applicationResolves = { ok: false, error: (error as Error)?.message ?? "unknown" };
  }

  return result;
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

  // Reject a subscription Google says belongs to a different Warsh account.
  //
  // Deliberately asymmetric with the consumable path, which requires the id: every
  // subscription bought before the client started sending one has no identifier at
  // all, and demanding it would lock out existing paying subscribers. So an absent
  // id is accepted (uniqueness on lastPurchaseToken remains the backstop) while a
  // PRESENT id that does not match is refused.
  if (
    input.expectedObfuscatedAccountId &&
    snapshot.obfuscatedExternalAccountId &&
    snapshot.obfuscatedExternalAccountId !== input.expectedObfuscatedAccountId
  ) {
    throw new StoreVerificationError(
      "This subscription belongs to a different Warsh account.",
      403,
      "purchase_account_mismatch",
    );
  }

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

  // Acknowledge server-side. The client also calls finishTransaction, but that
  // only runs if the app survives long enough to do it: a crash, a kill, or a
  // dropped connection between paying and acknowledging leaves Google refunding
  // a customer we already marked active. Doing it here makes acknowledgement a
  // property of a verified purchase rather than of a lucky app lifecycle.
  let acknowledged = snapshot.acknowledged;
  if (!acknowledged) {
    acknowledged = await acknowledgeGooglePlaySubscription(packageName, input.productId, token);
  }

  return {
    productId: input.productId,
    basePlanId: snapshot.basePlanId,
    activeUntil: snapshot.activeUntil as Date,
    platform: "android",
    storeStatus: snapshot.storeStatus,
    storeState: snapshot.storeState,
    autoRenew: snapshot.autoRenew,
    acknowledged,
  };
}

export interface GoogleSubscriptionSnapshot {
  storeState: StoreSubscriptionState;
  storeStatus: string;
  // Purchased base plan ("monthly" / "yearly") from offerDetails.
  basePlanId?: string;
  // Subscription product the line item belongs to ("warsh_premium").
  storeProductId?: string;
  // Introductory/promotional offer applied to this base plan, when any.
  offerId?: string;
  autoRenew: boolean;
  // Real expiry from the store's latest line item; null when none is present.
  activeUntil: Date | null;
  // Raw acknowledgement state string as Google reported it.
  acknowledgementState: string;
  // True once Google considers the purchase acknowledged. Until it is, Google
  // will refund the buyer after three days and revoke access, regardless of what
  // our own database says.
  acknowledged: boolean;
  // Token this subscription superseded, when Google reports one.
  linkedPurchaseToken?: string;
  // The obfuscated account id the buyer's client sent at purchase time, when any.
  obfuscatedExternalAccountId?: string;
}

/**
 * Acknowledges a Google Play subscription purchase (Android Publisher v3
 * `purchases.subscriptions:acknowledge`). Google auto-refunds and revokes any
 * purchase left unacknowledged for three days, so this is the step that actually
 * keeps a paid subscriber subscribed.
 *
 * Never throws: acknowledgement failing must not turn a successfully verified
 * purchase into an error for the buyer. Returns whether the purchase is now
 * acknowledged. A 400 here means Google refuses the transition — in practice an
 * already-acknowledged token — which is reported as acknowledged, since the
 * caller only reaches this path when the snapshot said otherwise.
 */
export async function acknowledgeGooglePlaySubscription(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string,
): Promise<boolean> {
  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken();
  } catch (error) {
    console.error("[verify] acknowledge skipped - no access token:", (error as Error)?.message ?? error);
    return false;
  }

  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/subscriptions/${encodeURIComponent(subscriptionId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (response.ok) return true;

    const errBody = await response.text().catch(() => "");
    const reason = extractGoogleErrorReason(errBody);
    console.error(
      `[verify] acknowledge HTTP ${response.status} (reason: ${reason ?? "none"}): ${errBody.slice(0, 300)}`,
    );
    // Google answers an already-acknowledged token with a 400 "not in a valid
    // state" rather than a distinct code. Treating that as success is correct and
    // safe; every other status means the purchase is still at refund risk.
    return response.status === 400;
  } catch (error) {
    console.error("[verify] acknowledge request failed:", (error as Error)?.message ?? error);
    return false;
  }
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
    const reason = extractGoogleErrorReason(errBody);
    // Truncate — Google's error payloads can be verbose and we don't want to
    // retain more than needed for debugging in long-lived log storage.
    console.error(`[verify] Google subscriptionsv2 HTTP ${response.status}: ${errBody.slice(0, 300)}`);
    logGooglePlayConfigContext(reason);
    const { message, status, code } = classifyGoogleApiFailure(response.status, reason);
    throw new StoreVerificationError(message, status, code);
  }

  const purchase = (await response.json()) as GoogleSubscriptionPurchase;
  const storeState = mapGoogleSubscriptionState(purchase.subscriptionState);

  // NOTE: subscriptionsv2 lineItems[].productId is the SUBSCRIPTION product id
  // ("warsh_premium"). The purchased base plan ("monthly"/"yearly") is in
  // offerDetails.basePlanId — reading productId as the plan (as this once did)
  // stored "warsh_premium" as the plan, so the app could never tell which plan a
  // subscriber was on and offered "Subscribe" to people who already had. The
  // expiry is the store's real next-billing / access-end instant — never computed
  // by adding a fixed interval.
  const latestLineItem = purchase.lineItems
    ?.filter((item) => item.expiryTime)
    .map((item) => ({ ...item, expiryDate: new Date(item.expiryTime as string) }))
    .filter((item) => Number.isFinite(item.expiryDate.getTime()))
    .sort((a, b) => b.expiryDate.getTime() - a.expiryDate.getTime())[0];

  const acknowledgementState = purchase.acknowledgementState ?? "ACKNOWLEDGEMENT_STATE_UNSPECIFIED";

  return {
    storeState,
    storeStatus: purchase.subscriptionState ?? "SUBSCRIPTION_STATE_UNSPECIFIED",
    basePlanId: latestLineItem?.offerDetails?.basePlanId,
    storeProductId: latestLineItem?.productId,
    offerId: latestLineItem?.offerDetails?.offerId,
    autoRenew: latestLineItem?.autoRenewingPlan?.autoRenewEnabled ?? (storeState === "active"),
    activeUntil: latestLineItem?.expiryDate ?? null,
    acknowledgementState,
    acknowledged: acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    linkedPurchaseToken: purchase.linkedPurchaseToken,
    obfuscatedExternalAccountId: purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId,
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

/**
 * Consumes a Google Play one-time product purchase (Android Publisher v3
 * `purchases.products:consume`).
 *
 * This is the consumable counterpart of `acknowledgeGooglePlaySubscription`, and
 * it exists for the same reason: Google auto-refunds and revokes any purchase
 * left unacknowledged for three days. Consuming a product both acknowledges it
 * and releases the entitlement so the buyer can purchase the pack again — an
 * unconsumed product stays owned, and Play refuses to sell a second copy of it.
 *
 * Leaving this to the client alone meant that any kill, crash or dropped
 * connection between the server granting the credits and the app calling
 * `finishTransaction` produced the worst possible outcome: the user keeps the
 * granted messages, Google refunds the money three days later, and the still-owned
 * purchase blocks every future pack purchase for that account.
 *
 * MUST be called only after the credits are durably granted. Consuming first
 * would drop the entitlement for a purchase we might then fail to record,
 * leaving the buyer with neither the money nor the messages.
 *
 * Never throws: a failed consume must not turn a successfully granted pack into
 * an error for the buyer. The client's own `finishTransaction` and the retry on
 * the already-granted path are the remaining safety nets.
 */
export async function consumeGooglePlayProduct(
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<boolean> {
  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken();
  } catch (error) {
    console.error("[verify] consume skipped - no access token:", (error as Error)?.message ?? error);
    return false;
  }

  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:consume`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (response.ok) return true;

    const errBody = await response.text().catch(() => "");
    const reason = extractGoogleErrorReason(errBody);
    console.error(
      `[verify] consume HTTP ${response.status} (reason: ${reason ?? "none"}): ${errBody.slice(0, 300)}`,
    );
    // As with acknowledgement, Google answers an already-consumed token with a
    // 400 rather than a distinct code. That is the desired end state, so report
    // it as consumed; every other status leaves the purchase at refund risk.
    return response.status === 400;
  } catch (error) {
    console.error("[verify] consume request failed:", (error as Error)?.message ?? error);
    return false;
  }
}
