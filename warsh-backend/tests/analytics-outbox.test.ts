import test from "node:test";
import assert from "node:assert/strict";

const url = process.env.ANALYTICS_TEST_DATABASE_URL;
const enabled = !!url && /^postgres(?:ql)?:\/\/[^@]+@127\.0\.0\.1:55439\/warsh_analytics(?:\?|$)/.test(url);

test("purchase outbox is transactional, deduplicated and excludes minors", { skip: !enabled }, async () => {
  process.env.DATABASE_URL = url;
  process.env.MIXPANEL_TOKEN = "test-token";
  const { prisma } = await import("../lib/prisma");
  const { queuePurchaseEvent, deliverAnalyticsOutbox } = await import("../lib/analyticsOutbox");
  const id = `analytics-test-${Date.now()}`;
  const adult = await prisma.user.create({ data: { id, email: `${id}@example.test`, name: "Test", passwordHash: "x", dateOfBirth: new Date("1990-01-01") } });
  const minor = await prisma.user.create({ data: { id: `${id}-minor`, email: `${id}-minor@example.test`, name: "Test", passwordHash: "x", dateOfBirth: new Date("2015-01-01") } });
  const originalFetch = globalThis.fetch;
  const bodies: any[] = [];
  try {
    await prisma.$transaction(async tx => {
      await queuePurchaseEvent(tx, adult.id, "test_grant", "same-purchase", { product_id: "test" });
      await queuePurchaseEvent(tx, adult.id, "test_grant", "same-purchase", { product_id: "test" });
      await queuePurchaseEvent(tx, minor.id, "test_grant", "minor-purchase", {});
    });
    await assert.rejects(prisma.$transaction(async tx => {
      await queuePurchaseEvent(tx, adult.id, "test_grant", "rolled-back", {});
      throw new Error("rollback");
    }));
    assert.equal(await prisma.analyticsOutbox.count({ where: { userId: adult.id } }), 1);
    assert.equal(await prisma.analyticsOutbox.count({ where: { userId: minor.id } }), 0);
    globalThis.fetch = async () => new Response(JSON.stringify({ status: 0 }), { status: 200 });
    await assert.rejects(deliverAnalyticsOutbox());
    assert.equal(await prisma.analyticsOutbox.count({ where: { userId: adult.id, deliveredAt: null } }), 1);
    globalThis.fetch = async (_url, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ status: 1 }), { status: 200 });
    };
    assert.equal((await deliverAnalyticsOutbox()).sent, 1);
    assert.equal((await deliverAnalyticsOutbox()).sent, 0);
    assert.equal(bodies[0][0].properties.distinct_id, adult.id);
    assert.ok(bodies[0][0].properties.$insert_id);
    assert.ok(!JSON.stringify(bodies).includes("same-purchase"));
    await prisma.$transaction(tx => queuePurchaseEvent(tx, adult.id, "test_grant", "age-changed", {}));
    await prisma.user.update({ where: { id: adult.id }, data: { dateOfBirth: new Date("2015-01-01") } });
    assert.equal((await deliverAnalyticsOutbox()).sent, 0);
    assert.equal(await prisma.analyticsOutbox.count({ where: { userId: adult.id, deliveredAt: null } }), 0);
  } finally {
    globalThis.fetch = originalFetch;
    await prisma.user.deleteMany({ where: { id: { in: [adult.id, minor.id] } } });
    await prisma.$disconnect();
  }
});
