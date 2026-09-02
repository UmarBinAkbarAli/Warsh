import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { withDbRetry } from "../../../../lib/dbRetry";

// Cron endpoints mutate rows on GET (Vercel Cron only issues GET), so no cache
// layer may ever serve or replay this response.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// The retry budget below can add several seconds while Neon wakes its compute,
// which is more than the platform's default allowance for a route this small.
export const maxDuration = 60;

// Vercel cron: runs daily at 00:00 UTC
export async function GET(request: Request) {
  const secret = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(secret, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Safe to retry: the predicate only matches rows still marked "trial", so a
  // second pass after a partial failure sees exactly the ones left over.
  const result = await withDbRetry("cron/expire-trials", () =>
    prisma.user.updateMany({
      where: {
        subscriptionStatus: "trial",
        trialExpiresAt: { lte: now },
      },
      data: { subscriptionStatus: "expired" },
    }),
  );

  return NextResponse.json({ data: { expired: result.count } });
}
