import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { StoreVerificationError, verifyGooglePlayConsumable } from "../../../../lib/storeVerification";
import {
  getNoorPackCredits,
  getStoreAccountId,
  hashPurchaseToken,
  NOOR_PACK_PRODUCT_ID,
} from "../../../../lib/noorPackPurchase";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", code: "bad_request" }, { status: 400 });
  }

  const { purchaseToken, platform } = body as Record<string, unknown>;

  if (platform !== "android" && platform !== "ios") {
    return NextResponse.json({ error: "Invalid platform", code: "bad_request" }, { status: 400 });
  }

  if (!purchaseToken || typeof purchaseToken !== "string") {
    return NextResponse.json({ error: "Missing purchase token", code: "bad_request" }, { status: 400 });
  }

  const normalizedToken = purchaseToken.trim();
  if (!normalizedToken) {
    return NextResponse.json({ error: "Missing purchase token", code: "bad_request" }, { status: 400 });
  }

  const tokenHash = hashPurchaseToken(normalizedToken);
  const existingPurchase = await prisma.storePurchase.findUnique({
    where: { tokenHash },
    select: { userId: true, productId: true },
  });

  if (existingPurchase) {
    if (existingPurchase.userId !== userId || existingPurchase.productId !== NOOR_PACK_PRODUCT_ID) {
      return NextResponse.json(
        { error: "This purchase token has already been claimed.", code: "purchase_token_in_use" },
        { status: 409 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { noorOverageBalance: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      data: { noorOverageBalance: user.noorOverageBalance, alreadyGranted: true },
    });
  }

  let verifiedPurchase: Awaited<ReturnType<typeof verifyGooglePlayConsumable>>;
  if (platform === "android") {
    try {
      verifiedPurchase = await verifyGooglePlayConsumable(
        NOOR_PACK_PRODUCT_ID,
        normalizedToken,
        getStoreAccountId(userId),
      );
    } catch (error) {
      if (error instanceof StoreVerificationError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
      }
      throw error;
    }
  } else {
    // iOS consumable verification (StoreKit 2) is not implemented yet. We must
    // NOT grant credits on an unverified receipt — doing so let any client send
    // platform:"ios" with an arbitrary token and mint free AI messages. Reject
    // until Apple-side verification exists.
    return NextResponse.json(
      { error: "iOS purchases are not supported yet.", code: "store_not_configured" },
      { status: 503 },
    );
  }

  const creditsGranted = getNoorPackCredits(verifiedPurchase.quantity);

  try {
    const user = await prisma.$transaction(async (tx) => {
      // Create the unique ledger row before incrementing. If a concurrent retry
      // races this request, the unique constraint aborts the entire transaction,
      // including the balance update.
      await tx.storePurchase.create({
        data: {
          userId,
          platform,
          productId: NOOR_PACK_PRODUCT_ID,
          tokenHash,
          orderId: verifiedPurchase.orderId,
          quantity: verifiedPurchase.quantity,
          creditsGranted,
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: { noorOverageBalance: { increment: creditsGranted } },
        select: { noorOverageBalance: true },
      });
    });

    return NextResponse.json({
      data: { noorOverageBalance: user.noorOverageBalance, alreadyGranted: false },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const racedPurchase = await prisma.storePurchase.findUnique({
        where: { tokenHash },
        select: { userId: true, productId: true },
      });
      if (racedPurchase?.userId === userId && racedPurchase.productId === NOOR_PACK_PRODUCT_ID) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { noorOverageBalance: true },
        });
        if (user) {
          return NextResponse.json({
            data: { noorOverageBalance: user.noorOverageBalance, alreadyGranted: true },
          });
        }
      }
      return NextResponse.json(
        { error: "This purchase token has already been claimed.", code: "purchase_token_in_use" },
        { status: 409 },
      );
    }
    throw error;
  }
}
