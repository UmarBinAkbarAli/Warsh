import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "../../../../lib/prisma";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { withDbRetry } from "../../../../lib/dbRetry";
import { getAssistantReply } from "../../../../lib/openai";
import { runProductionProbe } from "../../../../lib/productionProbe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Five database reads with a cold-Neon retry budget, one HEAD against R2 and one
// real OpenAI completion — comfortably inside a minute, far outside the default.
export const maxDuration = 60;

// Vercel cron: runs daily at 03:00 UTC = 08:00 PKT, once the overnight crons
// have finished and before the day's learners arrive.
//
// No Sentry.withMonitor here: the organisation has a single monitor seat and
// reset-streaks holds it. This route alerts by *emitting an event* on failure
// and answering 500, which Vercel's cron log also records as a failed run.
export async function GET(request: Request) {
  const secret = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(secret, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const report = await runProductionProbe({
    countPublishedWords: () =>
      withDbRetry("probe/words", () => prisma.vocabularyWord.count({ where: { status: "PUBLISHED" } })),
    countCore500Words: () =>
      withDbRetry("probe/core500", () =>
        prisma.vocabularyWord.count({ where: { status: "PUBLISHED", quranicRank: { not: null } } }),
      ),
    countPublishedSurahs: () =>
      withDbRetry("probe/tadabbur", () => prisma.tadabburSurah.count({ where: { status: "PUBLISHED" } })),
    countLessons: () => withDbRetry("probe/lessons", () => prisma.lesson.count()),
    sampleMediaUrl: async () => {
      const word = await withDbRetry("probe/media", () =>
        prisma.vocabularyWord.findFirst({
          where: { status: "PUBLISHED", audioUrl: { not: null } },
          orderBy: { sortOrder: "asc" },
          select: { audioUrl: true },
        }),
      );
      return word?.audioUrl ?? null;
    },
    headMedia: async (url) => {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      return response.status;
    },
    // The same function /api/chat calls, so a dead key, a retired model id or a
    // provider outage fails here exactly as it would for a learner.
    askNoor: () => getAssistantReply("Reply with the single word: ready", [], "en"),
  });

  if (!report.ok) {
    const summary = `[probe] production probe failed: ${report.failures.join("; ")}`;
    console.error(summary);
    Sentry.captureMessage(summary, {
      level: "error",
      tags: { subsystem: "probe" },
      extra: { checks: report.checks },
    });
    return NextResponse.json({ error: "Production probe failed", code: "probe_failed", data: report }, { status: 500 });
  }

  return NextResponse.json({ data: report });
}
