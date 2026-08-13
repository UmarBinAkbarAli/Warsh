import { OAuth2Client } from "google-auth-library";

export type VerifiedGoogleIdentity = {
  subject: string;
  email: string;
  name: string;
};

function getGoogleClientId() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID environment variable is required.");
  }
  return clientId;
}

function getGoogleAudienceAllowlist(clientId: string) {
  const configured = (process.env.GOOGLE_OAUTH_CLIENT_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([clientId, ...configured])];
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
  const clientId = getGoogleClientId();
  const ticket = await new OAuth2Client(clientId).verifyIdToken({
    idToken,
    audience: getGoogleAudienceAllowlist(clientId),
  });
  const payload = ticket.getPayload();
  console.info("[google-auth] token verified", {
    subject: payload?.sub,
    email: payload?.email,
    audience: payload?.aud,
    issuer: payload?.iss,
  });

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google did not return a verified email identity.");
  }

  const email = payload.email.trim().toLowerCase();
  return {
    subject: payload.sub,
    email,
    name: payload.name?.trim() || email.split("@")[0] || "Warsh learner",
  };
}
