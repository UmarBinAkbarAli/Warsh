import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { generateTtsMp3 } from "../../../../lib/tts";
import { getPKTStartOfDay } from "../../../../lib/date";

const MAX_TTS_TEXT_LENGTH = 160;
const TTS_DAILY_LIMIT = Number(process.env.TTS_DAILY_LIMIT ?? 50);

function getTextFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("text")?.trim() ?? "";
}

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const text = getTextFromRequest(request);
  if (!text) {
    return NextResponse.json({ error: "Missing text", code: "bad_request" }, { status: 400 });
  }

  if (text.length > MAX_TTS_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text is too long for TTS", code: "bad_request" }, { status: 400 });
  }

  const today = getPKTStartOfDay(new Date());
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ttsUsageCount: true, ttsUsageResetAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const needsReset = !user.ttsUsageResetAt || user.ttsUsageResetAt < today;
  const currentCount = needsReset ? 0 : user.ttsUsageCount;
  if (currentCount >= TTS_DAILY_LIMIT) {
    return NextResponse.json({ error: "Daily audio limit reached", code: "too_many_requests" }, { status: 429 });
  }

  // Row lock on the UPDATE serializes concurrent requests for the same user,
  // so the count<limit check is re-evaluated per request rather than raced.
  const claimed = await prisma.user.updateMany({
    where: {
      id: userId,
      OR: [
        { ttsUsageResetAt: null },
        { ttsUsageResetAt: { lt: today } },
        { ttsUsageResetAt: { gte: today }, ttsUsageCount: { lt: TTS_DAILY_LIMIT } },
      ],
    },
    data: needsReset
      ? { ttsUsageCount: 1, ttsUsageResetAt: today }
      : { ttsUsageCount: { increment: 1 } },
  });

  if (claimed.count === 0) {
    return NextResponse.json({ error: "Daily audio limit reached", code: "too_many_requests" }, { status: 429 });
  }

  try {
    const audio = await generateTtsMp3(text);
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "private, max-age=2592000",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS generation failed.";
    return NextResponse.json({ error: message, code: "tts_unavailable" }, { status: 503 });
  }
}
