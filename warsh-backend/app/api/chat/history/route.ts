import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getUserSubscriptionState, requiresSubscription } from "../../../../lib/subscription";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const subscriptionState = await getUserSubscriptionState(userId);
  if (!subscriptionState) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }
  if (requiresSubscription(subscriptionState)) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  const newestMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ data: { messages: newestMessages.reverse() } });
}
