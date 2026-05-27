import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { StoreVerificationError, verifyStoreSubscription } from "../../../../lib/storeVerification";

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { productId, purchaseToken, receiptData, platform } = body;

  if (!productId || !["warsh_monthly", "warsh_annual"].includes(productId)) {
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

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      subscriptionProductId: verifiedSubscription.productId,
      subscriptionActiveUntil: verifiedSubscription.activeUntil,
    },
    select: { subscriptionStatus: true, subscriptionActiveUntil: true },
  });

  return NextResponse.json({ data: { ...user, productId: verifiedSubscription.productId } });
}
