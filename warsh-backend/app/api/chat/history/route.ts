import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getUserSubscriptionState, requiresSubscription } from "../../../../lib/subscription";
import { getPKTStartOfDay } from "../../../../lib/date";

const DAILY_MESSAGE_LIMIT = Number(process.env.AI_DAILY_MESSAGE_LIMIT ?? 5);

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

  const today = getPKTStartOfDay(new Date());
  const [newestMessages, messagesUsedToday, userRecord] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.chatMessage.count({
      where: { userId, role: "USER", createdAt: { gte: today } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { noorOverageBalance: true } }),
  ]);

  return NextResponse.json({
    data: {
      messages: newestMessages.reverse(),
      // Usage mirrors POST /api/chat so the counter is correct on every open,
      // not just after sending a message in the current session.
      messagesUsedToday,
      messagesLimit: DAILY_MESSAGE_LIMIT,
      noorOverageBalance: userRecord?.noorOverageBalance ?? 0,
    },
  });
}
