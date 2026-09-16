import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { revokeCredential } from "../../../../lib/restoreCredential";

// Sign-out on a device: the app clears the local restore key through
// Credential Manager and tells the server the same credential must never
// assert again, so a backup taken before sign-out cannot revive the session.
export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // An empty body is allowed; credentialId is checked below.
  }
  const credentialId = typeof body.credentialId === "string" ? body.credentialId : "";
  if (!credentialId) {
    return NextResponse.json({ error: "credentialId is required", code: "bad_request" }, { status: 400 });
  }

  const revoked = await revokeCredential(userId, credentialId);
  return NextResponse.json({ data: { revoked: revoked > 0 } });
}
