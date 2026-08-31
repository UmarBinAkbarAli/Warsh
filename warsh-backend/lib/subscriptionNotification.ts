import { prisma } from "./prisma";
import {
  fetchGooglePlaySubscriptionSnapshot,
  type GoogleSubscriptionSnapshot,
} from "./storeVerification";

// Refund/chargeback: cut access immediately rather than trusting snapshot timing.
export const SUBSCRIPTION_REVOKED = 12;

export interface SubscriptionNotification {
  notificationType?: number;
  purchaseToken?: string;
  subscriptionId?: string;
}

/**
 * Resolves the Warsh user a subscription notification belongs to.
 *
 * Google issues a NEW purchase token whenever a subscription is replaced — a plan
 * upgrade or downgrade, a re-subscribe, a restore after reinstall. The old token
 * stops receiving notifications, and until the app happens to verify the new one
 * our row is still keyed to the dead token, so every notification for the live
 * subscription was looked up, missed, and dropped. A subscriber who switched from
 * monthly to yearly could stop receiving renewals entirely.
 *
 * The replacement carries `linkedPurchaseToken` pointing back at the token it
 * superseded, which is the only link between the two. When the direct lookup
 * misses, this follows that pointer and re-keys the row onto the live token, so
 * the miss is self-healing rather than permanent.
 *
 * Returns the user and, when one was already fetched to resolve them, the
 * snapshot — so the caller does not pay for a second Google call.
 */
export async function resolveSubscriptionUser(
  purchaseToken: string,
  packageName: string | undefined,
): Promise<{ userId: string; snapshot?: GoogleSubscriptionSnapshot } | null> {
  const direct = await prisma.user.findFirst({
    where: { lastPurchaseToken: purchaseToken },
    select: { id: true },
  });
  if (direct) return { userId: direct.id };

  if (!packageName) return null;

  let snapshot: GoogleSubscriptionSnapshot;
  try {
    snapshot = await fetchGooglePlaySubscriptionSnapshot(packageName, purchaseToken);
  } catch (error) {
    console.warn("[rtdn] snapshot fetch failed while resolving user:", (error as Error)?.message ?? error);
    return null;
  }

  const linked = snapshot.linkedPurchaseToken;
  if (!linked) {
    console.warn("[rtdn] subscription token matches no user and supersedes nothing");
    return null;
  }

  const superseded = await prisma.user.findFirst({
    where: { lastPurchaseToken: linked },
    select: { id: true },
  });
  if (!superseded) {
    console.warn("[rtdn] superseded token matches no user either");
    return null;
  }

  // Move the row onto the live token so every later notification resolves
  // directly. lastPurchaseToken is unique: if another account somehow already
  // holds it, keep the user we resolved rather than failing the notification.
  try {
    await prisma.user.update({
      where: { id: superseded.id },
      data: { lastPurchaseToken: purchaseToken },
    });
    console.log("[rtdn] re-keyed subscription onto its replacement token for user", superseded.id);
  } catch (error) {
    console.warn("[rtdn] could not re-key purchase token:", (error as Error)?.message ?? error);
  }

  return { userId: superseded.id, snapshot };
}

export async function applySubscriptionNotification(notif: SubscriptionNotification) {
  const { notificationType, purchaseToken } = notif;
  if (!purchaseToken || notificationType == null) return;

  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  const resolved = await resolveSubscriptionUser(purchaseToken, packageName);
  if (!resolved) return;

  if (notificationType === SUBSCRIPTION_REVOKED) {
    await prisma.user.update({
      where: { id: resolved.userId },
      data: { subscriptionStatus: "expired", subscriptionActiveUntil: new Date() },
    });
    return;
  }

  if (!packageName) return;

  // Reuse the snapshot the resolution already paid for, when there was one.
  let snapshot = resolved.snapshot;
  if (!snapshot) {
    try {
      snapshot = await fetchGooglePlaySubscriptionSnapshot(packageName, purchaseToken);
    } catch (error) {
      console.warn("[rtdn] subscription snapshot fetch failed:", (error as Error)?.message ?? error);
      return;
    }
  }

  await prisma.user.update({
    where: { id: resolved.userId },
    data: {
      subscriptionStatus: snapshot.storeState,
      subscriptionActiveUntil: snapshot.activeUntil ?? undefined,
      subscriptionProductId: snapshot.basePlanId ?? undefined,
    },
  });
}
