import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { StoreVerificationError, verifyStoreSubscription } from "../../../../lib/storeVerification";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { productId, purchaseToken, receiptData, platform } = body;

  if (!productId || !["warsh_premium"].includes(productId)) {
    return NextResponse.json({ error: "Invalid product", code: "bad_request" }, { status: 400 });
  }

  if (platform !== "android" && platform !== "ios") {
    return NextResponse.json({ error: "Invalid platform", code: "bad_request" }, { status: 400 });
  }

  let verifiedSubscription;
  try {
    verifiedSubscription = await verifyStoreSubscription({ productId, purchaseToken, receiptData, platform });
  } catch (error) {
    if (error instanceof StoreVerificationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    throw error;
  }

  let user;
  try {
    user = await prisma.user.update({
      where: { id: userId },
      data: {
        // Persist the verified store state (active / canceled-but-in-period /
        // in_grace) so the app renders the correct status — not a hard-coded "active".
        subscriptionStatus: verifiedSubscription.storeState,
        // Store the purchased base plan ("monthly"/"yearly") when known so the app
        // can show which plan the user is on. Falls back to the product id (iOS /
        // unverified dev path). The RTDN webhook writes the same field on renewal.
        subscriptionProductId: verifiedSubscription.basePlanId ?? verifiedSubscription.productId,
        // Real store expiry — never computed by adding a fixed interval.
        subscriptionActiveUntil: verifiedSubscription.activeUntil,
        lastPurchaseToken: purchaseToken ?? null,
      },
      select: { subscriptionStatus: true, subscriptionActiveUntil: true },
    });
  } catch (error) {
    // lastPurchaseToken is unique. If this exact token is already attached to a
    // different account, surface a clean conflict instead of an unhandled 500.
    if (
      error && typeof error === "object" && "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This purchase is already linked to another account.", code: "conflict" },
        { status: 409 },
      );
    }
    throw error;
  }

  // Surfaced so the client (and device QA) can see whether the purchase is safe
  // from Google's three-day auto-refund without reading Play Console. The server
  // acknowledges during verification; false here means it could not, and the
  // client's own finishTransaction is the remaining safety net.
  if (verifiedSubscription.platform === "android" && verifiedSubscription.acknowledged === false) {
    console.error("[verify] purchase verified but NOT acknowledged - at risk of auto-refund", {
      userId,
      basePlanId: verifiedSubscription.basePlanId ?? null,
    });
  }

  return NextResponse.json({
    data: {
      ...user,
      productId: verifiedSubscription.productId,
      basePlanId: verifiedSubscription.basePlanId ?? null,
      acknowledged: verifiedSubscription.acknowledged ?? null,
    },
  });
}
