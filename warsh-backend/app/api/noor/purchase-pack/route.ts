import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { StoreVerificationError, verifyGooglePlayConsumable } from "../../../../lib/storeVerification";

const NOOR_PACK_PRODUCT_ID = "warsh_noor_pack";
const NOOR_PACK_MESSAGES = 20;

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
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

  if (platform === "android") {
    try {
      await verifyGooglePlayConsumable(NOOR_PACK_PRODUCT_ID, purchaseToken);
    } catch (error) {
      if (error instanceof StoreVerificationError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
      }
      throw error;
    }
  }
  // iOS: Apple consumable verification via StoreKit 2 is deferred to v1.1

  const user = await prisma.user.update({
    where: { id: userId },
    data: { noorOverageBalance: { increment: NOOR_PACK_MESSAGES } },
    select: { noorOverageBalance: true },
  });

  return NextResponse.json({ data: { noorOverageBalance: user.noorOverageBalance } });
}
