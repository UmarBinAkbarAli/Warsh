import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { fetchGooglePlayVoidedPurchases } from "../../../../lib/storeVerification";
import { applyVoidedPurchase } from "../../../../lib/voidedPurchase";
import { reconcileVoidedPurchases } from "../../../../lib/voidedPurchaseReconcile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// One Google OAuth exchange, a paged list call, and a handful of small writes
// with a cold-Neon retry budget behind each.
export const maxDuration = 60;

// Vercel cron: runs daily at 03:30 UTC = 08:30 PKT, after the production probe.
//
// No Sentry.withMonitor: the organisation's single monitor seat belongs to
// reset-streaks. A failed reconciliation emits an error event and answers 500
// so Vercel's cron log shows the failed run too.
export async function GET(request: Request) {
  const secret = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(secret, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) {
    // Not an outage: a deployment without Play credentials has no refunds to
    // reconcile. Say so rather than failing every morning.
    return NextResponse.json({ data: { skipped: "GOOGLE_PLAY_PACKAGE_NAME is not set" } });
  }

  let report;
  try {
    report = await reconcileVoidedPurchases({
      fetchVoided: (since) => fetchGooglePlayVoidedPurchases(packageName, since),
      apply: applyVoidedPurchase,
    });
  } catch (error) {
    // The list itself could not be read — a revoked service account or a Play
    // outage — so nothing was reconciled and nobody would otherwise know.
    Sentry.captureException(error, { level: "error", tags: { subsystem: "voided_reconcile" } });
    console.error("[voided-reconcile] could not list voided purchases:", error);
    return NextResponse.json(
      { error: "Could not list voided purchases", code: "voided_reconcile_failed" },
      { status: 500 },
    );
  }

  console.log("[voided-reconcile]", JSON.stringify(report));

  if (report.failed.length > 0) {
    Sentry.captureMessage(
      `[voided-reconcile] ${report.failed.length} of ${report.found} voided purchases could not be applied`,
      { level: "error", tags: { subsystem: "voided_reconcile" }, extra: { report } },
    );
    return NextResponse.json(
      { error: "Some voided purchases could not be applied", code: "voided_reconcile_partial", data: report },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: report });
}
