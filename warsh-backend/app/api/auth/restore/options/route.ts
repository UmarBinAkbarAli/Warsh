import { NextResponse } from "next/server";
import { hit, clientKey } from "../../../../../lib/rateLimit";
import { createAuthenticationOptions, pruneExpiredChallenges } from "../../../../../lib/restoreCredential";

// Unauthenticated by nature: a freshly restored device has no session yet.
// Returns only a random challenge, so the worst an abuser gets is a row that
// expires in five minutes; the rate limit keeps even that bounded.
export async function POST(request: Request) {
  const rl = await hit(clientKey(request, "restore-options"), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const { challengeId, options } = await createAuthenticationOptions();
  void pruneExpiredChallenges().catch(() => {});
  return NextResponse.json({ data: { challengeId, options } });
}
