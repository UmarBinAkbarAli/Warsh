import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";
import { getAssistantReply } from "../../../lib/openai";
import { getPKTStartOfDay } from "../../../lib/date";
import { ACHIEVEMENT_KEYS } from "../../../lib/achievements";

const DAILY_MESSAGE_LIMIT = Number(process.env.AI_DAILY_MESSAGE_LIMIT ?? 5);

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { message } = body;
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message", code: "bad_request" }, { status: 400 });
  }

  const today = getPKTStartOfDay(new Date());

  const [messagesUsedToday, totalMessageCount, userRecord] = await Promise.all([
    prisma.chatMessage.count({
      where: { userId, role: "USER", createdAt: { gte: today } },
    }),
    prisma.chatMessage.count({ where: { userId, role: "USER" } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLanguage: true, noorOverageBalance: true },
    }),
  ]);

  let usingPackCredit = false;

  if (messagesUsedToday >= DAILY_MESSAGE_LIMIT) {
    const packBalance = userRecord?.noorOverageBalance ?? 0;
    if (packBalance <= 0) {
      return NextResponse.json({ error: "daily_limit_reached", code: "too_many_requests" }, { status: 429 });
    }
    // Consume one pack credit
    await prisma.user.update({
      where: { id: userId },
      data: { noorOverageBalance: { decrement: 1 } },
    });
    usingPackCredit = true;
  }

  const recentHistory = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 10,
    select: { role: true, content: true },
  });

  await prisma.chatMessage.create({ data: { userId, role: "USER", content: message } });
  const reply = await getAssistantReply(message, recentHistory, userRecord?.nativeLanguage ?? undefined);
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

  const remainingPackBalance = usingPackCredit
    ? (userRecord?.noorOverageBalance ?? 1) - 1
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
