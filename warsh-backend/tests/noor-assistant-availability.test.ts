import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { AssistantUnavailableError, getAssistantReply } from "../lib/openai";

/**
 * Noor used to answer a dead API key with a canned "I am unavailable at the
 * moment" string. /api/chat could not tell that apart from a real reply, so it
 * stored the turn, counted it against the student's daily allowance and kept any
 * purchased Noor credit it had claimed — production served nothing but that
 * fallback from 2026-08-11 until 2026-09-10 and charged every user for it.
 *
 * The route's refund and "persist only on success" logic is already correct; it
 * only works because these paths throw. These tests hold that line.
 *
 * The OpenAI SDK does not go through globalThis.fetch, so the provider is stood
 * up as a real loopback server and reached via OPENAI_BASE_URL. Nothing here
 * touches the network.
 */

type Handler = (request: http.IncomingMessage, response: http.ServerResponse) => void;

async function withProvider(handler: Handler, callback: (baseUrl: string) => Promise<void>) {
  const server = http.createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await callback(`http://127.0.0.1:${port}/v1`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function respondJson(response: http.ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

function completion(content: unknown) {
  return { choices: [{ message: { role: "assistant", content } }] };
}

async function withEnv(env: Record<string, string | undefined>, callback: () => Promise<void>) {
  const original: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    original[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    await callback();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function assertUnavailable(reason: string, promise: Promise<unknown>) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof AssistantUnavailableError, `expected AssistantUnavailableError, got ${error}`);
    assert.equal(error.reason, reason);
    return true;
  });
}

test("a missing API key fails instead of answering, and never calls the provider", async () => {
  let called = false;
  await withProvider(
    (_request, response) => {
      called = true;
      respondJson(response, 200, completion("should never be reached"));
    },
    async (baseUrl) => {
      await withEnv({ OPENAI_API_KEY: undefined, OPENAI_BASE_URL: baseUrl }, async () => {
        await assertUnavailable("missing_api_key", getAssistantReply("assalamu alaikum"));
      });
      assert.equal(called, false, "provider must not be called without a key");
    },
  );
});

test("a key that is only whitespace counts as missing", async () => {
  let called = false;
  await withProvider(
    (_request, response) => {
      called = true;
      respondJson(response, 200, completion("should never be reached"));
    },
    async (baseUrl) => {
      await withEnv({ OPENAI_API_KEY: "   \n", OPENAI_BASE_URL: baseUrl }, async () => {
        await assertUnavailable("missing_api_key", getAssistantReply("hello"));
      });
      assert.equal(called, false, "provider must not be called for a blank key");
    },
  );
});

test("a rejected key surfaces as provider_error rather than a stored reply", async () => {
  await withProvider(
    (_request, response) => respondJson(response, 401, { error: { message: "Incorrect API key provided" } }),
    async (baseUrl) => {
      await withEnv(
        { OPENAI_API_KEY: "sk-test-revoked", OPENAI_MODEL: "gpt-4o-mini", OPENAI_BASE_URL: baseUrl },
        async () => {
          await assertUnavailable("provider_error", getAssistantReply("what is إضافة?"));
        },
      );
    },
  );
});

test("an empty completion is a failure, not a blank turn charged to the student", async () => {
  for (const empty of ["", "   ", null]) {
    await withProvider(
      (_request, response) => respondJson(response, 200, completion(empty)),
      async (baseUrl) => {
        await withEnv(
          { OPENAI_API_KEY: "sk-test-ok", OPENAI_MODEL: "gpt-4o-mini", OPENAI_BASE_URL: baseUrl },
          async () => {
            await assertUnavailable("empty_reply", getAssistantReply("explain هَذَا"));
          },
        );
      },
    );
  }
});

test("a real reply is returned unchanged", async () => {
  const expected = "السلام عليكم. هَذَا means 'this'.";
  let sawAuthHeader = "";
  await withProvider(
    (request, response) => {
      sawAuthHeader = String(request.headers.authorization ?? "");
      respondJson(response, 200, completion(expected));
    },
    async (baseUrl) => {
      await withEnv(
        { OPENAI_API_KEY: "sk-test-ok", OPENAI_MODEL: "gpt-4o-mini", OPENAI_BASE_URL: baseUrl },
        async () => {
          assert.equal(await getAssistantReply("what does هَذَا mean?"), expected);
          assert.equal(sawAuthHeader, "Bearer sk-test-ok");
        },
      );
    },
  );
});
