import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import {
  StoreVerificationError,
  describePackageNameConfig,
  fetchGooglePlaySubscriptionSnapshot,
  runGooglePlayDiagnostics,
} from "../lib/storeVerification";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = JSON.stringify({
  client_email: "warsh-play-verifier@warsh-test.iam.gserviceaccount.com",
  project_id: "warsh-test",
  private_key_id: "testkeyid",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  token_uri: "https://oauth.example.test/token",
});

// Google's real 404 body when the app cannot be resolved for the caller.
const APPLICATION_NOT_FOUND_BODY = JSON.stringify({
  error: {
    code: 404,
    message: "No application was found for the given package name.",
    errors: [{ reason: "applicationNotFound", message: "No application was found." }],
  },
});

const TOKEN_REJECTED_BODY = JSON.stringify({
  error: {
    code: 400,
    message: "Invalid Value",
    errors: [{ reason: "invalid", message: "Invalid Value" }],
  },
});

async function withGoogleResponse(
  purchasesResponse: { status: number; body: string },
  callback: () => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  const originalPackage = process.env.GOOGLE_PLAY_PACKAGE_NAME;

  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = serviceAccount;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app";
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("oauth")) {
      return new Response(JSON.stringify({ access_token: "test-token" }), { status: 200 });
    }
    return new Response(purchasesResponse.body, { status: purchasesResponse.status });
  }) as typeof fetch;

  try {
    await callback();
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    else process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY = originalKey;
    if (originalPackage === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = originalPackage;
  }
}

test("applicationNotFound is reported as a retryable store outage, not an invalid purchase", async () => {
  await withGoogleResponse({ status: 404, body: APPLICATION_NOT_FOUND_BODY }, async () => {
    await assert.rejects(
      () => fetchGooglePlaySubscriptionSnapshot("com.warsh.app", "any-token"),
      (error: unknown) => {
        assert.ok(error instanceof StoreVerificationError);
        // The buyer must never be told their purchase was invalid for our misconfiguration.
        assert.equal(error.code, "store_unavailable");
        assert.equal(error.status, 503);
        return true;
      },
    );
  });
});

test("a genuine token rejection is still an invalid purchase", async () => {
  await withGoogleResponse({ status: 400, body: TOKEN_REJECTED_BODY }, async () => {
    await assert.rejects(
      () => fetchGooglePlaySubscriptionSnapshot("com.warsh.app", "bad-token"),
      (error: unknown) => {
        assert.ok(error instanceof StoreVerificationError);
        assert.equal(error.code, "invalid_purchase");
        assert.equal(error.status, 400);
        return true;
      },
    );
  });
});

test("Google 5xx is retryable rather than blamed on the purchase", async () => {
  await withGoogleResponse({ status: 503, body: "upstream unavailable" }, async () => {
    await assert.rejects(
      () => fetchGooglePlaySubscriptionSnapshot("com.warsh.app", "any-token"),
      (error: unknown) => {
        assert.ok(error instanceof StoreVerificationError);
        assert.equal(error.code, "store_unavailable");
        return true;
      },
    );
  });
});

test("diagnostics flag an unresolvable application while confirming OAuth works", async () => {
  await withGoogleResponse({ status: 404, body: APPLICATION_NOT_FOUND_BODY }, async () => {
    const result = await runGooglePlayDiagnostics();
    assert.equal(result.oauth.ok, true);
    assert.equal(result.applicationResolves.ok, false);
    assert.equal(result.applicationResolves.reason, "applicationNotFound");
    assert.equal(
      result.serviceAccount.configured && result.serviceAccount.parsed
        ? result.serviceAccount.clientEmail
        : null,
      "warsh-play-verifier@warsh-test.iam.gserviceaccount.com",
    );
  });
});

test("diagnostics treat a token-specific rejection as a resolvable application", async () => {
  await withGoogleResponse({ status: 400, body: TOKEN_REJECTED_BODY }, async () => {
    const result = await runGooglePlayDiagnostics();
    assert.equal(result.applicationResolves.ok, true);
  });
});

test("package name fingerprint exposes quote/whitespace corruption", () => {
  const original = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  try {
    process.env.GOOGLE_PLAY_PACKAGE_NAME = '"com.warsh.app"';
    const quoted = describePackageNameConfig();
    assert.equal(quoted.configured && quoted.hasSurroundingQuotes, true);

    process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app\n";
    const trailing = describePackageNameConfig();
    assert.equal(trailing.configured && trailing.differsAfterTrim, true);

    process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.warsh.app";
    const clean = describePackageNameConfig();
    assert.equal(clean.configured && clean.hasSurroundingQuotes, false);
    assert.equal(clean.configured && clean.differsAfterTrim, false);
  } finally {
    if (original === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = original;
  }
});
