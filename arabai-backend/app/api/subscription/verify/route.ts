import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";

// In production this would verify the receipt with Apple/Google.
// For v1 we trust the client receipt claim and record the subscription.
// Full server-side verification should be added before public launch.

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { productId, purchaseToken, platform } = body;

  if (!productId || !["warsh_monthly", "warsh_annual"].includes(productId)) {
    return NextResponse.json({ error: "Invalid product", code: "bad_request" }, { status: 400 });
  }

  // Compute expiry based on product
  const now = new Date();
  const activeUntil = new Date(now);
  if (productId === "warsh_monthly") {
    activeUntil.setMonth(activeUntil.getMonth() + 1);
  } else {
    activeUntil.setFullYear(activeUntil.getFullYear() + 1);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      subscriptionProductId: productId,
      subscriptionActiveUntil: activeUntil,
    },
    select: { subscriptionStatus: true, subscriptionActiveUntil: true },
  });

  return NextResponse.json({ data: { ...user, productId } });
}
