import { NextResponse } from "next/server";
import { passwordTokenFingerprint, signToken } from "../../../../../lib/auth";
import { toAuthUser } from "../../../../../lib/authUser";
import { hit, clientKey } from "../../../../../lib/rateLimit";
import { RestoreCredentialError, verifyAuthentication } from "../../../../../lib/restoreCredential";

// Zero-Tap Sign-In: the restored device signs the challenge with the restore
// key it carried over. A valid assertion from an unrevoked key issues the
// same session a password or Google sign-in would — nothing about the JWT
// itself is backed up or transferred.
export async function POST(request: Request) {
  const rl = await hit(clientKey(request, "restore-verify"), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", code: "bad_request" }, { status: 400 });
  }

  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const response = body.response;
  if (!challengeId || !response || typeof response !== "object") {
    return NextResponse.json({ error: "challengeId and response are required", code: "bad_request" }, { status: 400 });
  }

  try {
    const { user, credentialId } = await verifyAuthentication({ challengeId, response: response as never });
    return NextResponse.json({
      data: {
        user: toAuthUser(user),
        token: signToken(user.id, { pwFingerprint: passwordTokenFingerprint(user.passwordHash) }),
        credentialId,
      },
    });
  } catch (error) {
    if (error instanceof RestoreCredentialError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    throw error;
  }
}
