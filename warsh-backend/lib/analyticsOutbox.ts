import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { isMinor } from "./age";
import { prisma } from "./prisma";

type Transaction = Prisma.TransactionClient;

// Called inside the same transaction as the entitlement change. The key is
// hashed locally; neither the purchase token nor its hash leaves for Mixpanel.
export async function queuePurchaseEvent(tx: Transaction, userId: string, event: string, key: string, properties: Prisma.InputJsonObject) {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { dateOfBirth: true } });
  if (!user?.dateOfBirth || isMinor(user.dateOfBirth) !== false) return;
  const id = createHash("sha256").update(`${event}:${key}`).digest("hex");
  await tx.analyticsOutbox.createMany({ data: [{ id, userId, event, properties }], skipDuplicates: true });
}

export async function deliverAnalyticsOutbox() {
  const token = process.env.MIXPANEL_TOKEN?.trim();
  if (!token) return { sent: 0, skipped: "MIXPANEL_TOKEN is not set" };
  // /track accepts at most five days of history. Leave older rows in place for
  // operator recovery through /import, without letting them block newer events.
  const cutoff = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  const expired = await prisma.analyticsOutbox.count({ where: { deliveredAt: null, occurredAt: { lt: cutoff } } });
  const rows = await prisma.analyticsOutbox.findMany({ where: { deliveredAt: null, occurredAt: { gte: cutoff } }, orderBy: { occurredAt: "asc" }, take: 1000 });
  const eligible: typeof rows = [];
  for (const row of rows) {
    const user = await prisma.user.findUnique({ where: { id: row.userId }, select: { dateOfBirth: true } });
    if (!user?.dateOfBirth || isMinor(user.dateOfBirth) !== false) {
      await prisma.analyticsOutbox.delete({ where: { id: row.id } });
      continue;
    }
    eligible.push(row);
  }
  if (eligible.length) {
    const body = eligible.map(row => ({ event: row.event, properties: { ...(row.properties as object), token, distinct_id: row.userId, time: Math.floor(row.occurredAt.getTime() / 1000), $insert_id: row.id, surface: "backend" } }));
    const response = await fetch("https://api.mixpanel.com/track/?ip=0&verbose=1", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const result = await response.json().catch(() => null) as { status?: number } | null;
    if (!response.ok || result?.status !== 1) throw new Error("Mixpanel rejected analytics batch");
    await prisma.analyticsOutbox.updateMany({ where: { id: { in: eligible.map(row => row.id) }, deliveredAt: null }, data: { deliveredAt: new Date() } });
  }
  return { sent: eligible.length, expired };
}
