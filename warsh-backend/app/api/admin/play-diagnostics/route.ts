import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { runGooglePlayDiagnostics } from "../../../../lib/storeVerification";

// GET /api/admin/play-diagnostics
// Admin-gated live self-test of the Google Play verification path. Answers the
// question a failed purchase cannot: is the app itself resolvable for our
// service account, or is only the token being rejected? Reports the service
// account identity and a non-secret fingerprint of the configured package name —
// never key material.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const diagnostics = await runGooglePlayDiagnostics();

  const healthy =
    diagnostics.packageName.configured &&
    diagnostics.serviceAccount.configured &&
    diagnostics.oauth.ok &&
    diagnostics.applicationResolves.ok;

  return NextResponse.json({ data: { healthy, ...diagnostics } });
}
