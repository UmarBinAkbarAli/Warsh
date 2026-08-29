import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import {
  acknowledgeGooglePlaySubscription,
  fetchGooglePlaySubscriptionSnapshot,
  verifyStoreSubscription,
} from "../lib/storeVerification";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = JSON.stringify({
  client_email: "warsh-play-verifier@warsh-test.iam.gserviceaccount.com",
  project_id: "warsh-test",
  private_key_id: "testkeyid",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  token_uri: "https://oauth.example.test/token",
});

const FUTURE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const NEARER_FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

function subscriptionBody(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
    lineItems: [
      { productId: "yearly", expiryTime: FUTURE, autoRenewingPlan: { autoRenewEnabled: true } },
    ],
    ...overrides,
  });
}

interface Recorded {
  acknowledgeCalls: number;
  acknowledgeUrls: string[];
}

/**
 * Runs `callback` against a fake Android Publisher API. `acknowledgeResponse`
 * controls what the `:acknowledge` endpoint answers, which is the branch that
 * decides whether a paid subscriber survives Google's three-day auto-refund.
 */
async function withGooglePlay(
  options: {
    subscription?: { status: number; body: string };
    acknowledgeResponse?: { status: number; body?: string };
  },
  callback: (recorded: Recorded) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  const originalPackage = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  const recorded: Recorded = { acknowledgeCalls: 0, acknowledgeUrls: [] };

  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = serviceAccount;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app";
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("oauth")) {
      return new Response(JSON.stringify({ access_token: "test-token" }), { status: 200 });
    }
    if (url.includes(":acknowledge")) {
      recorded.acknowledgeCalls += 1;
      recorded.acknowledgeUrls.push(url);
      const ack = options.acknowledgeResponse ?? { status: 200 };
      return new Response(ack.body ?? "", { status: ack.status });
    }
    const sub = options.subscription ?? { status: 200, body: subscriptionBody() };
    return new Response(sub.body, { status: sub.status });
  }) as typeof fetch;

  try {
    await callback(recorded);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    else process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = originalKey;
    if (originalPackage === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = originalPackage;
  }
}

test("the yearly base plan is read from the line item, not assumed from the product", async () => {
  await withGooglePlay({}, async () => {
    const snapshot = await fetchGooglePlaySubscriptionSnapshot("com.warsh.app", "token");
    assert.equal(snapshot.basePlanId, "yearly");
    assert.equal(snapshot.storeState, "active");
    assert.equal(snapshot.autoRenew, true);
    // The expiry must be the store's own instant — a yearly plan that reported a
    // month of access is exactly the bug this guards.
    assert.equal(snapshot.activeUntil?.toISOString(), FUTURE);
  });
});

test("after a plan change the furthest-out line item wins", async () => {
  const body = subscriptionBody({
    lineItems: [
      { productId: "monthly", expiryTime: NEARER_FUTURE, autoRenewingPlan: { autoRenewEnabled: false } },
      { productId: "yearly", expiryTime: FUTURE, autoRenewingPlan: { autoRenewEnabled: true } },
    ],
    linkedPurchaseToken: "superseded-monthly-token",
  });
  await withGooglePlay({ subscription: { status: 200, body } }, async () => {
    const snapshot = await fetchGooglePlaySubscriptionSnapshot("com.warsh.app", "token");
    assert.equal(snapshot.basePlanId, "yearly");
    assert.equal(snapshot.activeUntil?.toISOString(), FUTURE);
    assert.equal(snapshot.linkedPurchaseToken, "superseded-monthly-token");
  });
});

test("a pending purchase is acknowledged during verification", async () => {
  await withGooglePlay({}, async (recorded) => {
    const verified = await verifyStoreSubscription({
      platform: "android",
      productId: "warsh_premium",
      purchaseToken: "pending-token",
    });
    assert.equal(verified.acknowledged, true);
    assert.equal(verified.basePlanId, "yearly");
    assert.equal(recorded.acknowledgeCalls, 1);
    // Acknowledgement is addressed by subscription product id, never by base plan.
    assert.ok(recorded.acknowledgeUrls[0].includes("/purchases/subscriptions/warsh_premium/tokens/pending-token:acknowledge"));
  });
});

test("an already-acknowledged purchase is not acknowledged again", async () => {
  const body = subscriptionBody({ acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED" });
  await withGooglePlay({ subscription: { status: 200, body } }, async (recorded) => {
    const verified = await verifyStoreSubscription({
      platform: "android",
      productId: "warsh_premium",
      purchaseToken: "restored-token",
    });
    assert.equal(verified.acknowledged, true);
    assert.equal(recorded.acknowledgeCalls, 0);
  });
});

test("Google refusing the acknowledgement transition counts as acknowledged", async () => {
  // Google answers an already-acknowledged token with a 400 rather than a
  // distinct code; retrying forever would be wrong.
  await withGooglePlay({ acknowledgeResponse: { status: 400, body: "{}" } }, async (recorded) => {
    const acknowledged = await acknowledgeGooglePlaySubscription("com.warsh.app", "warsh_premium", "token");
    assert.equal(acknowledged, true);
    assert.equal(recorded.acknowledgeCalls, 1);
  });
});

test("a failed acknowledgement never fails the purchase, but is reported", async () => {
  await withGooglePlay({ acknowledgeResponse: { status: 500, body: "boom" } }, async () => {
    const verified = await verifyStoreSubscription({
      platform: "android",
      productId: "warsh_premium",
      purchaseToken: "unlucky-token",
    });
    // The buyer keeps their verified subscription...
    assert.equal(verified.storeState, "active");
    // ...and the caller can see it is still at refund risk.
    assert.equal(verified.acknowledged, false);
  });
});
