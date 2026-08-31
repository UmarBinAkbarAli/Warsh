import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { prisma } from "../lib/prisma";
import { applySubscriptionNotification } from "../lib/subscriptionNotification";
import { StoreVerificationError, verifyStoreSubscription } from "../lib/storeVerification";
import { getStoreAccountId } from "../lib/noorPackPurchase";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = JSON.stringify({
  client_email: "warsh-play-verifier@warsh-production.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  token_uri: "https://oauth.example.test/token",
});

const FUTURE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

function googleBody(extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [
      {
        productId: "warsh_premium",
        expiryTime: FUTURE.toISOString(),
        autoRenewingPlan: { autoRenewEnabled: true },
        offerDetails: { basePlanId: "yearly" },
      },
    ],
    ...extra,
  });
}

interface Harness {
  usersByToken: Record<string, string>;
  updates: Array<{ id: string; data: Record<string, unknown> }>;
}

async function withHarness(
  seed: { usersByToken: Record<string, string>; body: string },
  callback: (harness: Harness) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalFindFirst = prisma.user.findFirst;
  const originalUpdate = prisma.user.update;
  const originalKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  const originalPackage = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  const harness: Harness = { usersByToken: { ...seed.usersByToken }, updates: [] };

  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = serviceAccount;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app";
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("oauth")) return Response.json({ access_token: "t" });
    return new Response(seed.body, { status: 200 });
  }) as typeof fetch;

  (prisma.user as { findFirst: unknown }).findFirst = (async (args: {
    where: { lastPurchaseToken: string };
  }) => {
    const id = harness.usersByToken[args.where.lastPurchaseToken];
    return id ? { id } : null;
  }) as unknown as typeof prisma.user.findFirst;

  (prisma.user as { update: unknown }).update = (async (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => {
    harness.updates.push({ id: args.where.id, data: args.data });
    if (typeof args.data.lastPurchaseToken === "string") {
      for (const [token, id] of Object.entries(harness.usersByToken)) {
        if (id === args.where.id) delete harness.usersByToken[token];
      }
      harness.usersByToken[args.data.lastPurchaseToken] = args.where.id;
    }
    return {};
  }) as unknown as typeof prisma.user.update;

  try {
    await callback(harness);
  } finally {
    globalThis.fetch = originalFetch;
    (prisma.user as { findFirst: unknown }).findFirst = originalFindFirst;
    (prisma.user as { update: unknown }).update = originalUpdate;
    if (originalKey === undefined) delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    else process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = originalKey;
    if (originalPackage === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = originalPackage;
  }
}

test("a plan change is followed onto its replacement token", async () => {
  await withHarness(
    {
      usersByToken: { "old-monthly-token": "user-1" },
      body: googleBody({ linkedPurchaseToken: "old-monthly-token" }),
    },
    async (harness) => {
      // The notification carries the NEW token, which no row is keyed to yet.
      await applySubscriptionNotification({ notificationType: 2, purchaseToken: "new-yearly-token" });

      // The row must be re-keyed onto the live token, or every later
      // notification for this subscription is dropped forever.
      const rekey = harness.updates.find((u) => u.data.lastPurchaseToken);
      assert.equal(rekey?.id, "user-1");
      assert.equal(rekey?.data.lastPurchaseToken, "new-yearly-token");

      // ...and the state itself still gets written.
      const stateWrite = harness.updates.find((u) => u.data.subscriptionStatus);
      assert.equal(stateWrite?.data.subscriptionStatus, "active");
      assert.equal(stateWrite?.data.subscriptionProductId, "yearly");
    },
  );
});

test("after re-keying, the next notification resolves directly", async () => {
  await withHarness(
    {
      usersByToken: { "old-monthly-token": "user-1" },
      body: googleBody({ linkedPurchaseToken: "old-monthly-token" }),
    },
    async (harness) => {
      await applySubscriptionNotification({ notificationType: 2, purchaseToken: "new-yearly-token" });
      harness.updates.length = 0;
      await applySubscriptionNotification({ notificationType: 2, purchaseToken: "new-yearly-token" });
      // No second re-key: the direct lookup now hits.
      assert.equal(harness.updates.some((u) => u.data.lastPurchaseToken), false);
      assert.equal(harness.updates.length, 1);
    },
  );
});

test("a token that matches nothing and supersedes nothing is ignored", async () => {
  await withHarness({ usersByToken: {}, body: googleBody() }, async (harness) => {
    await applySubscriptionNotification({ notificationType: 2, purchaseToken: "stranger-token" });
    assert.equal(harness.updates.length, 0);
  });
});

test("a revoked replacement still revokes the re-keyed user", async () => {
  await withHarness(
    {
      usersByToken: { "old-token": "user-1" },
      body: googleBody({ linkedPurchaseToken: "old-token" }),
    },
    async (harness) => {
      await applySubscriptionNotification({ notificationType: 12, purchaseToken: "new-token" });
      const revoke = harness.updates.find((u) => u.data.subscriptionStatus === "expired");
      assert.equal(revoke?.id, "user-1");
    },
  );
});

test("a subscription Google attributes to another account is refused", async () => {
  await withHarness(
    {
      usersByToken: {},
      body: googleBody({
        externalAccountIdentifiers: { obfuscatedExternalAccountId: getStoreAccountId("someone-else") },
      }),
    },
    async () => {
      await assert.rejects(
        () =>
          verifyStoreSubscription({
            platform: "android",
            productId: "warsh_premium",
            purchaseToken: "tok",
            expectedObfuscatedAccountId: getStoreAccountId("user-1"),
          }),
        (error: unknown) => {
          assert.ok(error instanceof StoreVerificationError);
          assert.equal(error.code, "purchase_account_mismatch");
          assert.equal(error.status, 403);
          return true;
        },
      );
    },
  );
});

test("a subscription bought before we sent an account id is still accepted", async () => {
  // Every existing subscriber is in this state. Demanding the identifier would
  // lock all of them out, so an ABSENT id must pass while a mismatched one fails.
  await withHarness({ usersByToken: {}, body: googleBody() }, async () => {
    const verified = await verifyStoreSubscription({
      platform: "android",
      productId: "warsh_premium",
      purchaseToken: "tok",
      expectedObfuscatedAccountId: getStoreAccountId("user-1"),
    });
    assert.equal(verified.storeState, "active");
    assert.equal(verified.basePlanId, "yearly");
  });
});

test("a matching account id verifies normally", async () => {
  await withHarness(
    {
      usersByToken: {},
      body: googleBody({
        externalAccountIdentifiers: { obfuscatedExternalAccountId: getStoreAccountId("user-1") },
      }),
    },
    async () => {
      const verified = await verifyStoreSubscription({
        platform: "android",
        productId: "warsh_premium",
        purchaseToken: "tok",
        expectedObfuscatedAccountId: getStoreAccountId("user-1"),
      });
      assert.equal(verified.storeState, "active");
    },
  );
});
