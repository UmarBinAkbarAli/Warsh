import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import {
  getNoorPackCredits,
  getStoreAccountId,
  hashPurchaseToken,
  NOOR_PACK_PRODUCT_ID,
} from "../lib/noorPackPurchase";
import { StoreVerificationError, verifyGooglePlayConsumable } from "../lib/storeVerification";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = JSON.stringify({
  client_email: "billing-test@example.test",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  token_uri: "https://oauth.example.test/token",
});

async function withGooglePurchase(
  purchase: Record<string, unknown>,
  callback: () => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  const originalPackage = process.env.GOOGLE_PLAY_PACKAGE_NAME;

  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = serviceAccount;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app";
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://oauth.example.test/token") {
      return Response.json({ access_token: "test-access-token" });
    }
    assert.match(url, /\/purchases\/products\/warsh_noor_pack\/tokens\/test-token$/);
    return Response.json(purchase);
  }) as typeof fetch;

  try {
    await callback();
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    else process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = originalKey;
    if (originalPackage === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = originalPackage;
  }
}

test("Noor purchase identifiers are deterministic and do not retain raw values", () => {
  assert.equal(hashPurchaseToken("  purchase-token  "), hashPurchaseToken("purchase-token"));
  assert.notEqual(hashPurchaseToken("purchase-token"), "purchase-token");
  assert.equal(getStoreAccountId("user-123").length, 64);
  assert.notEqual(getStoreAccountId("user-123"), "user-123");
});

test("Noor pack credits scale with the verified Play quantity", () => {
  assert.equal(getNoorPackCredits(1), 20);
  assert.equal(getNoorPackCredits(3), 60);
  assert.throws(() => getNoorPackCredits(0), /Invalid Noor pack quantity/);
});

test("Google Play verifier accepts only an unconsumed purchase bound to this user", async () => {
  const accountId = getStoreAccountId("user-123");
  await withGooglePurchase({
    purchaseState: 0,
    consumptionState: 0,
    productId: NOOR_PACK_PRODUCT_ID,
    obfuscatedExternalAccountId: accountId,
    orderId: "GPA.test-order",
    quantity: 2,
  }, async () => {
    const result = await verifyGooglePlayConsumable(NOOR_PACK_PRODUCT_ID, "test-token", accountId);
    assert.deepEqual(result, { orderId: "GPA.test-order", quantity: 2 });
  });
});

test("Google Play verifier reports pending purchases without granting", async () => {
  await withGooglePurchase({ purchaseState: 2, consumptionState: 0 }, async () => {
    await assert.rejects(
      () => verifyGooglePlayConsumable(NOOR_PACK_PRODUCT_ID, "test-token", getStoreAccountId("user-123")),
      (error: unknown) => error instanceof StoreVerificationError && error.code === "purchase_pending" && error.status === 409,
    );
  });
});

test("Google Play verifier rejects consumed and cross-account purchases", async () => {
  const accountId = getStoreAccountId("user-123");
  await withGooglePurchase({
    purchaseState: 0,
    consumptionState: 1,
    productId: NOOR_PACK_PRODUCT_ID,
    obfuscatedExternalAccountId: accountId,
  }, async () => {
    await assert.rejects(
      () => verifyGooglePlayConsumable(NOOR_PACK_PRODUCT_ID, "test-token", accountId),
      (error: unknown) => error instanceof StoreVerificationError && error.code === "purchase_already_consumed",
    );
  });

  await withGooglePurchase({
    purchaseState: 0,
    consumptionState: 0,
    productId: NOOR_PACK_PRODUCT_ID,
    obfuscatedExternalAccountId: getStoreAccountId("another-user"),
  }, async () => {
    await assert.rejects(
      () => verifyGooglePlayConsumable(NOOR_PACK_PRODUCT_ID, "test-token", accountId),
      (error: unknown) => error instanceof StoreVerificationError && error.code === "purchase_account_mismatch",
    );
  });
});
