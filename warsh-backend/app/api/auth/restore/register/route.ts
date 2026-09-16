import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { RestoreCredentialError, verifyRegistration } from "../../../../../lib/restoreCredential";

// Step 2: the device sends back the attestation the platform authenticator
// produced. Verified server-side; the credential is stored against the
// account only when the challenge, origin and rpId all check out.
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

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
    const result = await verifyRegistration({
      userId,
      challengeId,
      response: response as never,
      cloudBackup: body.cloudBackup !== false,
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof RestoreCredentialError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    throw error;
  }
}
