import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { prisma } from "../lib/prisma";
import { refreshLapsedStoreSubscription } from "../lib/subscriptionRefresh";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = JSON.stringify({
  client_email: "warsh-play-verifier@warsh-test.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  token_uri: "https://oauth.example.test/token",
});

const NOW = new Date("2026-08-29T08:00:00.000Z");
const LAPSED = new Date("2026-08-29T07:38:59.000Z");
const RENEWED = new Date("2026-08-29T08:08:59.000Z");

function lapsedUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    subscriptionStatus: "active",
    subscriptionActiveUntil: LAPSED,
    subscriptionProductId: "monthly",
    lastPurchaseToken: "token-1",
    ...overrides,
  };
}

function googleBody(state: string, expiry: Date, basePlanId = "yearly") {
  return JSON.stringify({
    subscriptionState: state,
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [
      {
        productId: "warsh_premium",
        expiryTime: expiry.toISOString(),
        autoRenewingPlan: { autoRenewEnabled: state === "SUBSCRIPTION_STATE_ACTIVE" },
        offerDetails: { basePlanId },
      },
    ],
  });
}

interface Harness {
  googleCalls: number;
  updates: Array<Record<string, unknown>>;
}

async function withStore(
  response: { status: number; body: string } | null,
  callback: (harness: Harness) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalUpdate = prisma.user.update;
  const originalKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  const originalPackage = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  const harness: Harness = { googleCalls: 0, updates: [] };

  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = serviceAccount;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app";
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("oauth")) return Response.json({ access_token: "test-token" });
    harness.googleCalls += 1;
    if (!response) throw new Error("store unreachable");
    return new Response(response.body, { status: response.status });
  }) as typeof fetch;
  // The refresh is about what gets persisted; the database itself is not.
  (prisma.user as { update: unknown }).update = (async (args: { data: Record<string, unknown> }) => {
    harness.updates.push(args.data);
    return {};
  }) as unknown as typeof prisma.user.update;

  try {
    await callback(harness);
  } finally {
    globalThis.fetch = originalFetch;
    (prisma.user as { update: unknown }).update = originalUpdate;
    if (originalKey === undefined) delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    else process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = originalKey;
    if (originalPackage === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = originalPackage;
  }
}

test("a renewal we were never notified about is recovered from the store", async () => {
  await withStore(
    { status: 200, body: googleBody("SUBSCRIPTION_STATE_ACTIVE", RENEWED) },
    async (harness) => {
      const refreshed = await refreshLapsedStoreSubscription(lapsedUser(), NOW);
      assert.equal(refreshed.subscriptionStatus, "active");
      assert.equal(refreshed.subscriptionActiveUntil?.toISOString(), RENEWED.toISOString());
      // The plan is refreshed too — a plan change also arrives this way.
      assert.equal(refreshed.subscriptionProductId, "yearly");
      assert.equal(harness.updates.length, 1);
    },
  );
});

test("a subscription that really ended is written as expired, ending the retries", async () => {
  await withStore(
    { status: 200, body: googleBody("SUBSCRIPTION_STATE_EXPIRED", LAPSED) },
    async (harness) => {
      const refreshed = await refreshLapsedStoreSubscription(lapsedUser(), NOW);
      assert.equal(refreshed.subscriptionStatus, "expired");
      assert.equal(harness.updates.length, 1);
      // "expired" no longer grants access, so the next call short-circuits.
      const again = await refreshLapsedStoreSubscription(refreshed, NOW);
      assert.equal(harness.googleCalls, 1);
      assert.equal(again.subscriptionStatus, "expired");
    },
  );
});

test("a subscription still inside its paid period is never re-fetched", async () => {
  await withStore({ status: 200, body: googleBody("SUBSCRIPTION_STATE_ACTIVE", RENEWED) }, async (harness) => {
    const user = lapsedUser({ subscriptionActiveUntil: RENEWED });
    const refreshed = await refreshLapsedStoreSubscription(user, NOW);
    assert.equal(harness.googleCalls, 0);
    assert.equal(harness.updates.length, 0);
    assert.equal(refreshed.subscriptionActiveUntil, RENEWED);
  });
});

test("a trial user with no purchase token costs nothing", async () => {
  await withStore({ status: 200, body: googleBody("SUBSCRIPTION_STATE_ACTIVE", RENEWED) }, async (harness) => {
    await refreshLapsedStoreSubscription(
      lapsedUser({ subscriptionStatus: "trial", lastPurchaseToken: null }),
      NOW,
    );
    assert.equal(harness.googleCalls, 0);
  });
});

test("an unreachable store leaves the stored state untouched", async () => {
  await withStore(null, async (harness) => {
    const user = lapsedUser();
    const refreshed = await refreshLapsedStoreSubscription(user, NOW);
    assert.equal(refreshed.subscriptionStatus, "active");
    assert.equal(refreshed.subscriptionActiveUntil, LAPSED);
    assert.equal(harness.updates.length, 0);
  });
});
