import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";
import { getAssistantReply } from "../../../lib/openai";
import { getPKTStartOfDay } from "../../../lib/date";
import { ACHIEVEMENT_KEYS } from "../../../lib/achievements";
import { getSubscriptionState, requiresSubscription } from "../../../lib/subscription";
import { resolveContentLanguage } from "../../../lib/language";
import { resolveDailyMessageLimit } from "../../../lib/noorLimit";
import { claimNoorPackCredit, refundNoorPackCredit } from "../../../lib/noorCredits";

const DAILY_MESSAGE_LIMIT = resolveDailyMessageLimit();

// A tutoring question is a few sentences. The daily quota bounds how MANY calls
// reach OpenAI, but nothing bounded their SIZE — so one user could spend five
// multi-megabyte prompts a day against an unbounded input-token bill.
const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Message must be between 1 and 2000 characters.", code: "bad_request" },
      { status: 400 },
    );
  }
  const message = parsed.data.message;

  const today = getPKTStartOfDay(new Date());

  const [messagesUsedToday, totalMessageCount, userRecord] = await Promise.all([
    prisma.chatMessage.count({
      where: { userId, role: "USER", createdAt: { gte: today } },
    }),
    prisma.chatMessage.count({ where: { userId, role: "USER" } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        nativeLanguage: true,
        translationLanguage: true,
        noorOverageBalance: true,
        trialStartAt: true,
        trialExpiresAt: true,
        subscriptionStatus: true,
        subscriptionActiveUntil: true,
        subscriptionProductId: true,
      },
    }),
  ]);

  if (!userRecord) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  if (requiresSubscription(getSubscriptionState(userRecord))) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  let usingPackCredit = false;

  if (messagesUsedToday >= DAILY_MESSAGE_LIMIT) {
    // Atomic: see lib/noorCredits. A read-then-decrement let concurrent sends
    // drive the balance negative, so the claim itself is the check.
    if (!(await claimNoorPackCredit(userId))) {
      return NextResponse.json({ error: "daily_limit_reached", code: "too_many_requests" }, { status: 429 });
    }
    usingPackCredit = true;
  }

  const recentHistoryNewestFirst = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { role: true, content: true },
  });
  const recentHistory = recentHistoryNewestFirst.reverse();

  // Noor replies in the user's translationLanguage, falling back to
  // nativeLanguage for rows written before that column existed.
  //
  // Nothing is charged until this succeeds. The credit was claimed above to stop
  // concurrent sends from overspending it, but a failed reply delivers nothing,
  // so it is handed straight back — a paid message must not evaporate because
  // OpenAI timed out. The user's message is likewise persisted only after a
  // successful reply, so a failure does not burn a daily quota slot either.
  let reply: string;
  try {
    reply = await getAssistantReply(message, recentHistory, resolveContentLanguage(userRecord));
  } catch (error) {
    if (usingPackCredit) await refundNoorPackCredit(userId);
    console.error("[chat] assistant reply failed:", (error as Error)?.message ?? error);
    return NextResponse.json(
      { error: "Noor is unavailable right now. Please try again.", code: "assistant_unavailable" },
      { status: 503 },
    );
  }

  await prisma.chatMessage.create({ data: { userId, role: "USER", content: message } });
  await prisma.chatMessage.create({ data: { userId, role: "ASSISTANT", content: reply, tokens: reply.length } });

  // Award FIRST_NOOR on the user's very first message
  let firstNoorAchievement: { key: string; title: string; xpReward: number } | null = null;
  if (totalMessageCount === 0) {
    const achievement = await prisma.achievement.findUnique({ where: { key: ACHIEVEMENT_KEYS.FIRST_NOOR } });
    if (achievement) {
      const alreadyUnlocked = await prisma.userAchievement.findFirst({ where: { userId, achievementId: achievement.id } });
      if (!alreadyUnlocked) {
        await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
        if (achievement.xpReward > 0) {
          await prisma.user.update({ where: { id: userId }, data: { xp: { increment: achievement.xpReward } } });
        }
        firstNoorAchievement = { key: achievement.key, title: achievement.title, xpReward: achievement.xpReward };
      }
    }
  }

  // Re-read after a claim rather than subtracting from the value we read before
  // it: under concurrent sends the pre-claim number is already stale, and this is
  // the balance the app renders back to a user who just spent real money.
  const remainingPackBalance = usingPackCredit
    ? (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { noorOverageBalance: true },
        })
      )?.noorOverageBalance ?? 0
    : (userRecord?.noorOverageBalance ?? 0);

  return NextResponse.json({
    data: {
      reply,
      messagesUsedToday: messagesUsedToday + 1,
      messagesLimit: DAILY_MESSAGE_LIMIT,
      noorOverageBalance: remainingPackBalance,
      usingPackCredit,
      newAchievement: firstNoorAchievement ?? undefined,
    },
  });
}
