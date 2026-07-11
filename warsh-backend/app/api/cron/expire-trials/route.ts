import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { timingSafeStringEqual } from "../../../../lib/auth";

// Vercel cron: runs every 6 hours
export async function GET(request: Request) {
  const secret = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(secret, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.user.updateMany({
    where: {
      subscriptionStatus: "trial",
      trialExpiresAt: { lte: now },
    },
    data: { subscriptionStatus: "expired" },
  });

  return NextResponse.json({ data: { expired: result.count } });
}
