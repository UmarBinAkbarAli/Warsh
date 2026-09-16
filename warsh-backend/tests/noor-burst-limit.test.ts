import { test, before, after } from "node:test";
import assert from "node:assert/strict";

/**
 * /api/chat has a daily quota per account, but until this limit existed nothing
 * bounded how fast messages arrived: a credit-pack holder or a script minting
 * throwaway accounts could saturate the OpenAI concurrency for every user.
 *
 * The burst check runs before the body is parsed and before any database or
 * OpenAI work, so these requests carry an invalid body: every allowed request
 * is answered 400 without touching a store, and the first refused one is a 429
 * with code `rate_limited` — distinct from the quota's `too_many_requests`,
 * which the app answers with the buy-credits modal.
 */

const previousJwtSecret = process.env.JWT_SECRET;
const previousRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const previousKvUrl = process.env.KV_REST_API_URL;

let POST: (request: Request) => Promise<Response>;
let signToken: (userId: string) => string;

before(async () => {
  process.env.JWT_SECRET = "test-only-noor-burst-secret";
  // Force the in-process limiter so the test never reaches a shared Redis.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.KV_REST_API_URL;
  ({ POST } = await import("../app/api/chat/route"));
  ({ signToken } = await import("../lib/auth"));
});

after(() => {
  if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousJwtSecret;
  if (previousRedisUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = previousRedisUrl;
  if (previousKvUrl !== undefined) process.env.KV_REST_API_URL = previousKvUrl;
});

function send(userId: string, ip: string) {
  return POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: {
        authorization: `Bearer ${signToken(userId)}`,
        "content-type": "application/json",
        "x-real-ip": ip,
      },
      body: "not json",
    }),
  );
}

async function expectRateLimited(response: Response) {
  assert.equal(response.status, 429);
  assert.ok(response.headers.get("Retry-After"), "Retry-After header must be set");
  const body = (await response.json()) as { code: string };
  assert.equal(body.code, "rate_limited");
}

test("the 16th message from one user inside a minute is refused as rate_limited", async () => {
  for (let i = 0; i < 15; i += 1) {
    const response = await send("burst-user", "10.0.0.1");
    assert.equal(response.status, 400, `request ${i + 1} should pass the burst check`);
  }
  await expectRateLimited(await send("burst-user", "10.0.0.1"));
});

test("the 61st message from one IP inside a minute is refused even across accounts", async () => {
  for (let i = 0; i < 60; i += 1) {
    const response = await send(`ip-user-${i}`, "10.0.0.2");
    assert.equal(response.status, 400, `request ${i + 1} should pass the burst check`);
  }
  await expectRateLimited(await send("ip-user-fresh", "10.0.0.2"));
});

test("a user on another IP is unaffected by a saturated one", async () => {
  const response = await send("other-user", "10.0.0.3");
  assert.equal(response.status, 400);
});
