import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";
import { getAssistantReply } from "../../../lib/openai";
import { getPKTStartOfDay } from "../../../lib/date";

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
  const messagesUsedToday = await prisma.chatMessage.count({
    where: {
      userId,
      role: "USER",
      createdAt: {
        gte: today
      }
    }
  });

  if (messagesUsedToday >= DAILY_MESSAGE_LIMIT) {
    return NextResponse.json({ error: "daily_limit_reached", code: "too_many_requests" }, { status: 429 });
  }

  const [recentHistory, userRecord] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: { role: true, content: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { nativeLanguage: true } }),
  ]);

  await prisma.chatMessage.create({ data: { userId, role: "USER", content: message } });
  const reply = await getAssistantReply(message, recentHistory, userRecord?.nativeLanguage ?? undefined);
  await prisma.chatMessage.create({ data: { userId, role: "ASSISTANT", content: reply, tokens: reply.length } });

  return NextResponse.json({ data: { reply, messagesUsedToday: messagesUsedToday + 1, messagesLimit: DAILY_MESSAGE_LIMIT } });
}
