import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { isoCBOR } from "@simplewebauthn/server/helpers";
import { prisma } from "../lib/prisma";
import {
  CHALLENGE_TTL_MS,
  RESTORE_RP_ID,
  RestoreCredentialError,
  createAuthenticationOptions,
  createRegistrationOptions,
  revokeAllCredentials,
  revokeCredential,
  verifyAuthentication,
  verifyRegistration,
} from "../lib/restoreCredential";

// ---------------------------------------------------------------------------
// In-memory stand-ins for the two tables, patched onto the Prisma singleton the
// same way the Noor credit tests do. Only the calls the library makes exist.
// ---------------------------------------------------------------------------

type ChallengeRow = {
  id: string;
  challenge: string;
  purpose: string;
  userId: string | null;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};
type CredentialRow = {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: bigint;
  transports: string[];
  cloudBackup: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};

const users = new Map<string, { id: string; email: string; name: string; passwordHash: string }>();
let challenges: ChallengeRow[] = [];
let credentials: CredentialRow[] = [];
let seq = 0;
let now = Date.now();

const matches = (row: Record<string, unknown>, where: Record<string, unknown>) =>
  Object.entries(where).every(([key, expected]) => {
    const actual = row[key];
    if (expected && typeof expected === "object" && !(expected instanceof Date)) {
      const cond = expected as { gt?: Date; lt?: Date };
      if (cond.gt) return (actual as Date).getTime() > cond.gt.getTime();
      if (cond.lt) return (actual as Date).getTime() < cond.lt.getTime();
    }
    if (expected instanceof Date) return (actual as Date)?.getTime() === expected.getTime();
    return actual === expected;
  });

(prisma as unknown as { restoreChallenge: unknown }).restoreChallenge = {
  create: async ({ data }: { data: Omit<ChallengeRow, "id" | "usedAt" | "createdAt"> }) => {
    const row = { id: `ch${++seq}`, usedAt: null, createdAt: new Date(now), ...data };
    challenges.push(row);
    return row;
  },
  updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<ChallengeRow> }) => {
    const hits = challenges.filter((row) => matches(row, where));
    hits.forEach((row) => Object.assign(row, data));
    return { count: hits.length };
  },
  findUnique: async ({ where }: { where: { id: string } }) => challenges.find((row) => row.id === where.id) ?? null,
  deleteMany: async () => ({ count: 0 }),
};

(prisma as unknown as { restoreCredential: unknown }).restoreCredential = {
  findMany: async ({ where }: { where: Record<string, unknown> }) => credentials.filter((row) => matches(row, where)),
  findUnique: async ({ where, include }: { where: { credentialId: string }; include?: { user: true } }) => {
    const row = credentials.find((candidate) => candidate.credentialId === where.credentialId);
    if (!row) return null;
    return include?.user ? { ...row, user: users.get(row.userId) ?? null } : row;
  },
  upsert: async ({ where, create, update }: { where: { credentialId: string }; create: Omit<CredentialRow, "id" | "createdAt" | "lastUsedAt" | "revokedAt">; update: Partial<CredentialRow> }) => {
    const existing = credentials.find((row) => row.credentialId === where.credentialId);
    if (existing) {
      Object.assign(existing, update);
      return existing;
    }
    const row: CredentialRow = { id: `cr${++seq}`, createdAt: new Date(now), lastUsedAt: null, revokedAt: null, ...create };
    credentials.push(row);
    return row;
  },
  update: async ({ where, data }: { where: { id: string }; data: Partial<CredentialRow> }) => {
    const row = credentials.find((candidate) => candidate.id === where.id)!;
    Object.assign(row, data);
    return row;
  },
  updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<CredentialRow> }) => {
    const hits = credentials.filter((row) => matches(row, where));
    hits.forEach((row) => Object.assign(row, data));
    return { count: hits.length };
  },
};

// ---------------------------------------------------------------------------
// A minimal software authenticator producing what Android's Credential Manager
// returns for a restore key: ES256, attestation "none", origin reported as the
// calling app's apk-key-hash.
// ---------------------------------------------------------------------------

const PLAY_ORIGIN = "android:apk-key-hash:jyTdIqavzne6Y7Owz5VtEovgtLL4b93O27OJqF4UmRU";
const b64u = (bytes: Uint8Array | Buffer) => Buffer.from(bytes).toString("base64url");
const sha256 = (data: Buffer | string) => crypto.createHash("sha256").update(data).digest();

class FakeAuthenticator {
  readonly credentialId = crypto.randomBytes(16);
  readonly key = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
  counter = 0;

  private coseKey() {
    const jwk = this.key.publicKey.export({ format: "jwk" }) as { x: string; y: string };
    return isoCBOR.encode(
      new Map<number, unknown>([
        [1, 2], // kty EC2
        [3, -7], // alg ES256
        [-1, 1], // crv P-256
        [-2, Buffer.from(jwk.x, "base64url")],
        [-3, Buffer.from(jwk.y, "base64url")],
      ]),
    );
  }

  private authData(flags: number, attested: boolean) {
    const parts: Buffer[] = [sha256(RESTORE_RP_ID), Buffer.from([flags])];
    const counter = Buffer.alloc(4);
    counter.writeUInt32BE(this.counter);
    parts.push(counter);
    if (attested) {
      const idLength = Buffer.alloc(2);
      idLength.writeUInt16BE(this.credentialId.length);
      parts.push(Buffer.alloc(16), idLength, this.credentialId, Buffer.from(this.coseKey()));
    }
    return Buffer.concat(parts);
  }

  register(challenge: string, origin = PLAY_ORIGIN) {
    const clientDataJSON = Buffer.from(JSON.stringify({ type: "webauthn.create", challenge, origin }));
    const attestationObject = isoCBOR.encode(
      new Map<string, unknown>([
        ["fmt", "none"],
        ["attStmt", new Map()],
        ["authData", this.authData(0x41, true)], // UP + AT
      ]),
    );
    return {
      id: b64u(this.credentialId),
      rawId: b64u(this.credentialId),
      type: "public-key" as const,
      clientExtensionResults: {},
      response: {
        clientDataJSON: b64u(clientDataJSON),
        attestationObject: b64u(attestationObject),
        transports: ["internal"],
      },
    };
  }

  assert(challenge: string, origin = PLAY_ORIGIN) {
    this.counter += 1;
    const clientDataJSON = Buffer.from(JSON.stringify({ type: "webauthn.get", challenge, origin }));
    const authenticatorData = this.authData(0x01, false); // UP only, no UV
    const signature = crypto.sign("sha256", Buffer.concat([authenticatorData, sha256(clientDataJSON)]), {
      key: this.key.privateKey,
      dsaEncoding: "der",
    });
    return {
      id: b64u(this.credentialId),
      rawId: b64u(this.credentialId),
      type: "public-key" as const,
      clientExtensionResults: {},
      response: {
        clientDataJSON: b64u(clientDataJSON),
        authenticatorData: b64u(authenticatorData),
        signature: b64u(signature),
      },
    };
  }
}

const alice = { id: "user_alice", email: "alice@example.com", name: "Alice", passwordHash: "hash-a" };
const bob = { id: "user_bob", email: "bob@example.com", name: "Bob", passwordHash: "hash-b" };

async function registerFor(user: typeof alice, authenticator = new FakeAuthenticator()) {
  const { challengeId, options } = await createRegistrationOptions(user);
  const result = await verifyRegistration({
    userId: user.id,
    challengeId,
    response: authenticator.register(options.challenge),
    cloudBackup: true,
  });
  return { authenticator, credentialId: result.credentialId };
}

async function restoreWith(authenticator: FakeAuthenticator, origin?: string) {
  const { challengeId, options } = await createAuthenticationOptions();
  return verifyAuthentication({ challengeId, response: authenticator.assert(options.challenge, origin) });
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof RestoreCredentialError, `expected RestoreCredentialError, got ${String(error)}`);
    assert.equal(error.code, code);
    return true;
  });
}

beforeEach(() => {
  users.clear();
  users.set(alice.id, alice);
  users.set(bob.id, bob);
  challenges = [];
  credentials = [];
  now = Date.now();
});

test("registers a restore key and restores the account from it", async () => {
  const { authenticator, credentialId } = await registerFor(alice);
  assert.equal(credentials.length, 1);
  assert.equal(credentials[0].userId, alice.id);
  assert.equal(credentials[0].cloudBackup, true);

  const restored = await restoreWith(authenticator);
  assert.equal(restored.user.id, alice.id);
  assert.equal(restored.credentialId, credentialId);
  assert.equal(credentials[0].counter, 1n);
  assert.ok(credentials[0].lastUsedAt);
});

test("a challenge can only be used once", async () => {
  const { authenticator } = await registerFor(alice);
  const { challengeId, options } = await createAuthenticationOptions();
  const response = authenticator.assert(options.challenge);
  await verifyAuthentication({ challengeId, response });
  await expectCode(verifyAuthentication({ challengeId, response }), "restore_challenge_invalid");
});

test("an expired challenge is refused", async () => {
  const { authenticator } = await registerFor(alice);
  const { challengeId, options } = await createAuthenticationOptions();
  const row = challenges.find((candidate) => candidate.id === challengeId)!;
  row.expiresAt = new Date(Date.now() - CHALLENGE_TTL_MS);
  await expectCode(
    verifyAuthentication({ challengeId, response: authenticator.assert(options.challenge) }),
    "restore_challenge_invalid",
  );
});

test("a registration challenge cannot be spent on an assertion, nor by another user", async () => {
  const authenticator = new FakeAuthenticator();
  const { challengeId, options } = await createRegistrationOptions(alice);
  await expectCode(
    verifyAuthentication({ challengeId, response: authenticator.assert(options.challenge) }),
    "restore_challenge_invalid",
  );
  await expectCode(
    verifyRegistration({ userId: bob.id, challengeId, response: authenticator.register(options.challenge), cloudBackup: true }),
    "restore_challenge_invalid",
  );
  assert.equal(credentials.length, 0);
});

test("an assertion from a key the server never saw is refused", async () => {
  await registerFor(alice);
  const stranger = new FakeAuthenticator();
  await expectCode(restoreWith(stranger), "restore_credential_unknown");
});

test("a revoked key reads as unknown and no longer restores", async () => {
  const { authenticator, credentialId } = await registerFor(alice);
  assert.equal(await revokeCredential(alice.id, credentialId), 1);
  await expectCode(restoreWith(authenticator), "restore_credential_unknown");
  // Revoking again, or revoking someone else's key, changes nothing.
  assert.equal(await revokeCredential(alice.id, credentialId), 0);
  assert.equal(await revokeCredential(bob.id, credentialId), 0);
});

test("a password change revokes every device's key", async () => {
  const first = await registerFor(alice);
  const second = await registerFor(alice);
  assert.equal(await revokeAllCredentials(alice.id), 2);
  await expectCode(restoreWith(first.authenticator), "restore_credential_unknown");
  await expectCode(restoreWith(second.authenticator), "restore_credential_unknown");
});

test("a key registered by one account cannot be claimed by another", async () => {
  const { authenticator } = await registerFor(alice);
  const { challengeId, options } = await createRegistrationOptions(bob);
  await expectCode(
    verifyRegistration({ userId: bob.id, challengeId, response: authenticator.register(options.challenge), cloudBackup: true }),
    "restore_credential_conflict",
  );
  assert.equal(credentials[0].userId, alice.id);
});

test("a deleted account's key cannot restore anything", async () => {
  const { authenticator } = await registerFor(alice);
  // The row is cascade-deleted with the user in Postgres; the in-memory table
  // mirrors that outcome.
  credentials = [];
  users.delete(alice.id);
  await expectCode(restoreWith(authenticator), "restore_credential_unknown");
});

test("a signature over the wrong challenge or from an unknown signing certificate is refused", async () => {
  const { authenticator } = await registerFor(alice);
  const { challengeId } = await createAuthenticationOptions();
  const other = await createAuthenticationOptions();
  await expectCode(
    verifyAuthentication({ challengeId, response: authenticator.assert(other.options.challenge) }),
    "restore_assertion_invalid",
  );
  await expectCode(
    restoreWith(authenticator, "android:apk-key-hash:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
    "restore_assertion_invalid",
  );
});

test("a replayed authenticator counter is refused", async () => {
  const { authenticator } = await registerFor(alice);
  await restoreWith(authenticator);
  authenticator.counter = 0; // cloned key replaying an old state
  await expectCode(restoreWith(authenticator), "restore_assertion_invalid");
});
