import { prisma } from "./prisma";

/**
 * Claims one purchased Noor message credit, atomically.
 *
 * Reading the balance and then decrementing it unconditionally was a race: two
 * concurrent sends against a balance of 1 both saw 1, both decremented, and the
 * balance went to -1. Nothing ever repaired it, so the next pack the user bought
 * was silently worth one message less than they paid for.
 *
 * The `gt: 0` guard makes the claim itself the check — `updateMany` reports how
 * many rows it actually changed, so exactly one concurrent caller can win the
 * last credit. Returns whether this caller got one.
 */
export async function claimNoorPackCredit(userId: string): Promise<boolean> {
  const claimed = await prisma.user.updateMany({
    where: { id: userId, noorOverageBalance: { gt: 0 } },
    data: { noorOverageBalance: { decrement: 1 } },
  });
  return claimed.count === 1;
}

/**
 * Hands a claimed credit back after the work it paid for failed.
 *
 * The credit is claimed before the assistant call so concurrent sends cannot
 * overspend it, which means a failed call has already taken it. That is real
 * money for a message the user never received, so it must be returned rather
 * than quietly kept.
 */
export async function refundNoorPackCredit(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { noorOverageBalance: { increment: 1 } },
  });
}
