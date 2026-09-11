import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileVoidedPurchases, VOIDED_RECONCILE_LOOKBACK_MS } from "../lib/voidedPurchaseReconcile";
import type { VoidedPurchaseNotification } from "../lib/voidedPurchase";

/**
 * The reconciliation exists for the day an RTDN void never arrives. These tests
 * pin the contract between Google's list and the shared void handler: every
 * entry is replayed, the window is generous, and one bad token cannot shadow
 * the rest.
 */

const NOW = new Date("2026-09-11T03:30:00Z");

test("every voided purchase Google lists is replayed through the void handler", async () => {
  const applied: VoidedPurchaseNotification[] = [];
  const report = await reconcileVoidedPurchases(
    {
      fetchVoided: async () => [
        { purchaseToken: "pack-tok", orderId: "GPA.1" },
        { purchaseToken: "sub-tok", orderId: "GPA.2" },
      ],
      apply: async (notif) => {
        applied.push(notif);
      },
    },
    NOW,
  );

  assert.deepEqual(applied, [
    { purchaseToken: "pack-tok", orderId: "GPA.1" },
    { purchaseToken: "sub-tok", orderId: "GPA.2" },
  ]);
  assert.equal(report.found, 2);
  assert.equal(report.applied, 2);
  assert.deepEqual(report.failed, []);
});

test("the lookback window is seven days ending now", async () => {
  let seen: Date | null = null;
  await reconcileVoidedPurchases(
    {
      fetchVoided: async (since) => {
        seen = since;
        return [];
      },
      apply: async () => {},
    },
    NOW,
  );
  assert.equal(VOIDED_RECONCILE_LOOKBACK_MS, 7 * 24 * 60 * 60 * 1000);
  assert.equal(seen!.toISOString(), "2026-09-04T03:30:00.000Z");
});

test("productType is left undefined so the handler resolves the token itself", async () => {
  // Google's list does not distinguish subscriptions from one-time products;
  // a guessed type would send a subscription token down the pack path.
  let notif: VoidedPurchaseNotification | null = null;
  await reconcileVoidedPurchases(
    {
      fetchVoided: async () => [{ purchaseToken: "tok", orderId: "GPA.9", voidedQuantity: 1 }],
      apply: async (n) => {
        notif = n;
      },
    },
    NOW,
  );
  assert.equal(notif!.productType, undefined);
  assert.equal(notif!.refundType, undefined);
});

test("one failing token is reported and does not stop the others", async () => {
  const applied: string[] = [];
  const report = await reconcileVoidedPurchases(
    {
      fetchVoided: async () => [
        { purchaseToken: "a", orderId: "GPA.a" },
        { purchaseToken: "b", orderId: "GPA.b" },
        { purchaseToken: "c", orderId: "GPA.c" },
      ],
      apply: async (n) => {
        if (n.purchaseToken === "b") throw new Error("database gone");
        applied.push(n.purchaseToken!);
      },
    },
    NOW,
  );
  assert.deepEqual(applied, ["a", "c"]);
  assert.equal(report.applied, 2);
  assert.deepEqual(report.failed, [{ orderId: "GPA.b", error: "database gone" }]);
});

test("an unreadable list propagates so the cron fails loudly", async () => {
  await assert.rejects(
    reconcileVoidedPurchases(
      {
        fetchVoided: async () => {
          throw new Error("Could not authenticate with Google Play.");
        },
        apply: async () => {},
      },
      NOW,
    ),
    /authenticate/,
  );
});
