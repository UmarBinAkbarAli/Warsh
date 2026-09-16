import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { prisma } from "./prisma";

/**
 * Android Restore Credentials (Credential Manager restore keys) for Zero-Tap
 * Sign-In. A restore key is a FIDO2 credential the app creates silently after
 * sign-in; Google Backup / device-to-device transfer carries it to the new
 * device, where the app signs a challenge with it and exchanges the assertion
 * for a normal Warsh JWT. It is identity proof only: the session that comes
 * out is the same 30-day token every other sign-in path issues, and the
 * credential can be revoked independently of the password and Google link.
 *
 * Verification is standard WebAuthn (SimpleWebAuthn). The platform
 * authenticator reports the calling app as its origin —
 * `android:apk-key-hash:<base64url sha256(signing cert)>` — so only bundles
 * signed by a known Warsh certificate can register or assert. Digital Asset
 * Links are not involved (restore keys never leave the app; there is no browser
 * or cross-app relying-party check to satisfy).
 */

export const RESTORE_RP_ID = "warsh.app";
export const RESTORE_RP_NAME = "Warsh";

// sha256 of the DER signing certificate, base64url, prefixed the way Android's
// Credential Manager reports it. Play app signing key first, then the upload
// key (local release builds), then the debug keystore (Metro/`expo run`).
// Not secrets: every installed APK carries its certificate.
const KNOWN_ORIGINS = [
  "android:apk-key-hash:jyTdIqavzne6Y7Owz5VtEovgtLL4b93O27OJqF4UmRU",
  "android:apk-key-hash:B4UIItsbxpc1NzyhzqP3o5hR2cg9M4t7BHL-V-e6TJg",
  "android:apk-key-hash:-sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w",
];

// Extra origins (e.g. a future signing key) can be appended without a deploy
// of this file; a value that is not an apk-key-hash origin is ignored.
export function expectedOrigins(): string[] {
  const extra = (process.env.RESTORE_CREDENTIAL_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.startsWith("android:apk-key-hash:"));
  return [...KNOWN_ORIGINS, ...extra];
}

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export type ChallengePurpose = "register" | "authenticate";

export class RestoreCredentialError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

// Marks the challenge used in the same statement that checks it is unused and
// unexpired, so two assertions racing on one challenge cannot both pass.
async function consumeChallenge(id: string, purpose: ChallengePurpose) {
  const result = await prisma.restoreChallenge.updateMany({
    where: { id, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (result.count !== 1) {
    throw new RestoreCredentialError(
      "restore_challenge_invalid",
      "This restore challenge has expired or was already used.",
    );
  }
  return prisma.restoreChallenge.findUnique({ where: { id } });
}

// Opportunistic cleanup so the table does not grow with abandoned challenges.
export async function pruneExpiredChallenges() {
  await prisma.restoreChallenge.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - CHALLENGE_TTL_MS) } },
  });
}

export async function createRegistrationOptions(user: { id: string; email: string; name: string }) {
  const existing = await prisma.restoreCredential.findMany({
    where: { userId: user.id, revokedAt: null },
    select: { credentialId: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName: RESTORE_RP_NAME,
    rpID: RESTORE_RP_ID,
    userName: user.email,
    userDisplayName: user.name,
    // Stable per-user handle; the user id is a cuid, not PII.
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    // A device may only hold one restore key; asking Android to exclude the
    // ones we already know about makes a re-register replace, not duplicate.
    excludeCredentials: existing.map((credential) => ({
      id: credential.credentialId,
      transports: credential.transports as never,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      // Restore is silent by design: no biometric/PIN prompt on the new device.
      userVerification: "discouraged",
    },
    supportedAlgorithmIDs: [-7, -257],
    timeout: 60_000,
  });

  const challenge = await prisma.restoreChallenge.create({
    data: {
      challenge: options.challenge,
      purpose: "register",
      userId: user.id,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });

  return { challengeId: challenge.id, options };
}

export async function verifyRegistration(input: {
  userId: string;
  challengeId: string;
  response: RegistrationResponseJSON;
  cloudBackup: boolean;
}) {
  const challenge = await consumeChallenge(input.challengeId, "register");
  if (!challenge || challenge.userId !== input.userId) {
    throw new RestoreCredentialError("restore_challenge_invalid", "Restore challenge does not belong to this account.");
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: expectedOrigins(),
      expectedRPID: RESTORE_RP_ID,
      requireUserVerification: false,
    });
  } catch (error) {
    throw new RestoreCredentialError(
      "restore_registration_invalid",
      error instanceof Error ? error.message : "Restore key could not be verified.",
    );
  }
  if (!verification.verified || !verification.registrationInfo) {
    throw new RestoreCredentialError("restore_registration_invalid", "Restore key could not be verified.");
  }

  const { credential } = verification.registrationInfo;
  // A credential id is unique per authenticator key, so one already stored
  // under another account is a forged or replayed registration, refused before
  // anything is written. The same account re-registering (a retry after a lost
  // response) simply refreshes the key material.
  const existing = await prisma.restoreCredential.findUnique({
    where: { credentialId: credential.id },
    select: { userId: true },
  });
  if (existing && existing.userId !== input.userId) {
    throw new RestoreCredentialError("restore_credential_conflict", "This restore key belongs to another account.", 409);
  }
  const stored = await prisma.restoreCredential.upsert({
    where: { credentialId: credential.id },
    create: {
      userId: input.userId,
      credentialId: credential.id,
      publicKey: toBase64Url(credential.publicKey),
      counter: BigInt(credential.counter),
      transports: credential.transports ?? [],
      cloudBackup: input.cloudBackup,
    },
    update: {
      publicKey: toBase64Url(credential.publicKey),
      counter: BigInt(credential.counter),
      transports: credential.transports ?? [],
      cloudBackup: input.cloudBackup,
      revokedAt: null,
    },
  });

  return { credentialId: stored.credentialId };
}

export async function createAuthenticationOptions() {
  const options = await generateAuthenticationOptions({
    rpID: RESTORE_RP_ID,
    userVerification: "discouraged",
    // No allowCredentials: the restored device presents whichever key it
    // carried, and the server identifies the account from the credential id.
    timeout: 60_000,
  });

  const challenge = await prisma.restoreChallenge.create({
    data: {
      challenge: options.challenge,
      purpose: "authenticate",
      userId: null,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });

  return { challengeId: challenge.id, options };
}

export async function verifyAuthentication(input: {
  challengeId: string;
  response: AuthenticationResponseJSON;
}) {
  const challenge = await consumeChallenge(input.challengeId, "authenticate");
  if (!challenge) {
    throw new RestoreCredentialError("restore_challenge_invalid", "This restore challenge has expired or was already used.");
  }

  const credentialId = typeof input.response?.id === "string" ? input.response.id : "";
  const stored = credentialId
    ? await prisma.restoreCredential.findUnique({
        where: { credentialId },
        include: { user: true },
      })
    : null;
  if (!stored || stored.revokedAt) {
    // Unknown and revoked read the same from outside so a captured assertion
    // cannot be used to probe which keys still exist.
    throw new RestoreCredentialError("restore_credential_unknown", "No active restore key matches this device.", 401);
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: input.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: expectedOrigins(),
      expectedRPID: RESTORE_RP_ID,
      requireUserVerification: false,
      credential: {
        id: stored.credentialId,
        publicKey: Buffer.from(stored.publicKey, "base64url"),
        counter: Number(stored.counter),
        transports: stored.transports as never,
      },
    });
  } catch (error) {
    throw new RestoreCredentialError(
      "restore_assertion_invalid",
      error instanceof Error ? error.message : "Restore key could not be verified.",
      401,
    );
  }
  if (!verification.verified) {
    throw new RestoreCredentialError("restore_assertion_invalid", "Restore key could not be verified.", 401);
  }

  await prisma.restoreCredential.update({
    where: { id: stored.id },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsedAt: new Date(),
    },
  });

  return { user: stored.user, credentialId: stored.credentialId };
}

// Sign-out on a device, or the server deciding this device may no longer
// restore. Revoking keeps the row so the credential id can never be re-used
// by a later registration from a different account.
export async function revokeCredential(userId: string, credentialId: string) {
  const result = await prisma.restoreCredential.updateMany({
    where: { userId, credentialId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

// Password change/reset and other security resets: every device's restore key
// stops working, exactly as every JWT does through the password fingerprint.
export async function revokeAllCredentials(userId: string) {
  const result = await prisma.restoreCredential.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
