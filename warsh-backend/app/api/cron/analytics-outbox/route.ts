import { NextResponse } from "next/server";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { deliverAnalyticsOutbox } from "../../../../lib/analyticsOutbox";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(request.headers.get("authorization") ?? "", `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ data: await deliverAnalyticsOutbox() });
  } catch {
    return NextResponse.json({ error: "Analytics delivery failed", code: "analytics_delivery_failed" }, { status: 502 });
  }
}
