import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { claimNoorPackCredit, refundNoorPackCredit } from "../lib/noorCredits";
import { applyVoidedPurchase } from "../lib/voidedPurchase";
import { hashPurchaseToken } from "../lib/noorPackPurchase";

/**
 * These cover the two ways a purchased Noor credit used to go missing or stay
 * when it should not. The database is stubbed: what matters is the shape of the
 * writes, specifically that the guards live in the WHERE clause rather than in a
 * prior read.
 */

interface UserHarness {
  updateManyArgs: Array<Record<string, unknown>>;
  updateArgs: Array<Record<string, unknown>>;
  updateManyCount: number;
}

async function withUserStub(
  updateManyCount: number,
  callback: (harness: UserHarness) => Promise<void>,
) {
  const originalUpdateMany = prisma.user.updateMany;
  const originalUpdate = prisma.user.update;
  const harness: UserHarness = { updateManyArgs: [], updateArgs: [], updateManyCount };

  (prisma.user as { updateMany: unknown }).updateMany = (async (args: Record<string, unknown>) => {
    harness.updateManyArgs.push(args);
    return { count: harness.updateManyCount };
  }) as unknown as typeof prisma.user.updateMany;
  (prisma.user as { update: unknown }).update = (async (args: Record<string, unknown>) => {
    harness.updateArgs.push(args);
    return {};
  }) as unknown as typeof prisma.user.update;

  try {
    await callback(harness);
  } finally {
    (prisma.user as { updateMany: unknown }).updateMany = originalUpdateMany;
    (prisma.user as { update: unknown }).update = originalUpdate;
  }
}

test("claiming a pack credit guards on the balance in the WHERE clause", async () => {
  await withUserStub(1, async (harness) => {
    assert.equal(await claimNoorPackCredit("user-1"), true);
    const args = harness.updateManyArgs[0] as {
      where: { id: string; noorOverageBalance: { gt: number } };
      data: { noorOverageBalance: { decrement: number } };
    };
    // The guard must be part of the write. A prior read plus an unconditional
    // decrement is exactly what drove balances negative.
    assert.deepEqual(args.where, { id: "user-1", noorOverageBalance: { gt: 0 } });
    assert.deepEqual(args.data, { noorOverageBalance: { decrement: 1 } });
  });
});

test("a concurrent send that loses the last credit is refused, not overdrawn", async () => {
  await withUserStub(0, async () => {
    // updateMany matched no row: another request already took the last credit.
    assert.equal(await claimNoorPackCredit("user-1"), false);
  });
});

test("a failed assistant reply hands the claimed credit back", async () => {
  await withUserStub(1, async (harness) => {
    await refundNoorPackCredit("user-1");
    assert.deepEqual(harness.updateArgs[0], {
      where: { id: "user-1" },
      data: { noorOverageBalance: { increment: 1 } },
    });
  });
});

interface VoidHarness {
  purchase: Record<string, unknown> | null;
  balance: number;
  claimCount: number;
  purchaseUpdates: Array<Record<string, unknown>>;
  userUpdates: Array<Record<string, unknown>>;
  userUpdateMany: Array<Record<string, unknown>>;
}

async function withVoidStub(
  seed: { purchase: Record<string, unknown> | null; balance: number; claimCount?: number },
  callback: (harness: VoidHarness) => Promise<void>,
) {
  const original = {
    findUnique: prisma.storePurchase.findUnique,
    updateMany: prisma.storePurchase.updateMany,
    userFind: prisma.user.findUnique,
    userUpdate: prisma.user.update,
    userUpdateMany: prisma.user.updateMany,
    transaction: prisma.$transaction,
  };
  const harness: VoidHarness = {
    purchase: seed.purchase,
    balance: seed.balance,
    claimCount: seed.claimCount ?? 1,
    purchaseUpdates: [],
    userUpdates: [],
    userUpdateMany: [],
  };

  (prisma.storePurchase as { findUnique: unknown }).findUnique = (async () =>
    harness.purchase) as unknown as typeof prisma.storePurchase.findUnique;
  (prisma.storePurchase as { updateMany: unknown }).updateMany = (async (
    args: Record<string, unknown>,
  ) => {
    harness.purchaseUpdates.push(args);
    return { count: harness.claimCount };
  }) as unknown as typeof prisma.storePurchase.updateMany;
  (prisma.user as { findUnique: unknown }).findUnique = (async () => ({
    noorOverageBalance: harness.balance,
  })) as unknown as typeof prisma.user.findUnique;
  (prisma.user as { update: unknown }).update = (async (args: Record<string, unknown>) => {
    harness.userUpdates.push(args);
    return {};
  }) as unknown as typeof prisma.user.update;
  (prisma.user as { updateMany: unknown }).updateMany = (async (args: Record<string, unknown>) => {
    harness.userUpdateMany.push(args);
    return { count: 1 };
  }) as unknown as typeof prisma.user.updateMany;
  (prisma as { $transaction: unknown }).$transaction = (async (
    fn: (tx: typeof prisma) => Promise<unknown>,
  ) => fn(prisma)) as unknown as typeof prisma.$transaction;

  try {
    await callback(harness);
  } finally {
    (prisma.storePurchase as { findUnique: unknown }).findUnique = original.findUnique;
    (prisma.storePurchase as { updateMany: unknown }).updateMany = original.updateMany;
    (prisma.user as { findUnique: unknown }).findUnique = original.userFind;
    (prisma.user as { update: unknown }).update = original.userUpdate;
    (prisma.user as { updateMany: unknown }).updateMany = original.userUpdateMany;
    (prisma as { $transaction: unknown }).$transaction = original.transaction;
  }
}

const pack = (overrides: Record<string, unknown> = {}) => ({
  id: "sp-1",
  userId: "user-1",
  creditsGranted: 20,
  voidedAt: null,
  ...overrides,
});

test("a refunded Noor pack has its credits clawed back", async () => {
  await withVoidStub({ purchase: pack(), balance: 20 }, async (harness) => {
    await applyVoidedPurchase({ purchaseToken: "tok", productType: 2, refundType: 1 });
    assert.deepEqual(harness.userUpdates[0], {
      where: { id: "user-1" },
      data: { noorOverageBalance: 0 },
    });
    // The claim must be conditional on voidedAt still being null.
    const claim = harness.purchaseUpdates[0] as { where: Record<string, unknown> };
    assert.deepEqual(claim.where, { id: "sp-1", voidedAt: null });
  });
});

test("clawback floors at zero when the buyer already spent the credits", async () => {
  await withVoidStub({ purchase: pack(), balance: 5 }, async (harness) => {
    await applyVoidedPurchase({ purchaseToken: "tok", productType: 2, refundType: 1 });
    // 5 - 20 must not leave -15, which would tax the next pack they buy.
    assert.deepEqual(harness.userUpdates[0], {
      where: { id: "user-1" },
      data: { noorOverageBalance: 0 },
    });
  });
});

test("a redelivered void notification does not claw back twice", async () => {
  await withVoidStub({ purchase: pack({ voidedAt: new Date() }), balance: 20 }, async (harness) => {
    await applyVoidedPurchase({ purchaseToken: "tok", productType: 2, refundType: 1 });
    assert.equal(harness.userUpdates.length, 0);
    assert.equal(harness.purchaseUpdates.length, 0);
  });
});

test("losing the voidedAt race changes no balance", async () => {
  await withVoidStub({ purchase: pack(), balance: 20, claimCount: 0 }, async (harness) => {
    await applyVoidedPurchase({ purchaseToken: "tok", productType: 2, refundType: 1 });
    assert.equal(harness.userUpdates.length, 0);
  });
});

test("a partial refund is surfaced for review rather than guessed at", async () => {
  await withVoidStub({ purchase: pack(), balance: 20 }, async (harness) => {
    await applyVoidedPurchase({ purchaseToken: "tok", productType: 2, refundType: 2 });
    assert.equal(harness.userUpdates.length, 0);
    assert.equal(harness.purchaseUpdates.length, 0);
  });
});

test("a voided subscription revokes access without touching the pack ledger", async () => {
  await withVoidStub({ purchase: pack(), balance: 20 }, async (harness) => {
    await applyVoidedPurchase({ purchaseToken: "tok", productType: 1, refundType: 1 });
    const revoke = harness.userUpdateMany[0] as {
      where: { lastPurchaseToken: string };
      data: { subscriptionStatus: string };
    };
    assert.equal(revoke.where.lastPurchaseToken, "tok");
    assert.equal(revoke.data.subscriptionStatus, "expired");
    assert.equal(harness.purchaseUpdates.length, 0);
  });
});

test("the ledger is looked up by token hash, never the raw token", async () => {
  assert.equal(hashPurchaseToken("tok").length, 64);
  assert.notEqual(hashPurchaseToken("tok"), "tok");
});
