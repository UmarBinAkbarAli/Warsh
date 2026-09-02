import { test } from "node:test";
import assert from "node:assert/strict";
import { isTransientDbError, withDbRetry } from "../lib/dbRetry";

// The exact shapes Sentry captured from the two cron jobs in August 2026.
const NEON_AUTH_FAILURE = Object.assign(
  new Error(
    "\nInvalid `prisma.streak.findMany()` invocation:\n\n\nAuthentication failed against the database server, the provided database credentials for `(not available)` are not valid",
  ),
  { code: "P1000" },
);

const POOL_EXHAUSTED = Object.assign(
  new Error(
    "\nInvalid `prisma.user.findUnique()` invocation:\n\n\nToo many database connections opened: Failed to acquire permit to connect to the database. Too many database connection attempts are currently ongoing.",
  ),
  { name: "PrismaClientKnownRequestError" },
);

test("classifies a waking Neon endpoint as transient", () => {
  assert.equal(isTransientDbError(NEON_AUTH_FAILURE), true);
});

test("classifies pool exhaustion as transient even with no error code", () => {
  assert.equal(isTransientDbError(POOL_EXHAUSTED), true);
});

test("recognises transient failures by code alone", () => {
  assert.equal(isTransientDbError(Object.assign(new Error("nope"), { code: "P1001" })), true);
  assert.equal(isTransientDbError(Object.assign(new Error("nope"), { errorCode: "P1017" })), true);
});

test("a query that reached the database is not transient", () => {
  const constraintViolation = Object.assign(
    new Error("Unique constraint failed on the fields: (`email`)"),
    { code: "P2002" },
  );
  assert.equal(isTransientDbError(constraintViolation), false);
  assert.equal(isTransientDbError(new Error("streak not found")), false);
  assert.equal(isTransientDbError(null), false);
  assert.equal(isTransientDbError("P1000"), false);
});

test("retries a transient failure and returns the eventual result", async () => {
  let calls = 0;
  const result = await withDbRetry(
    "test",
    async () => {
      calls += 1;
      if (calls === 1) throw NEON_AUTH_FAILURE;
      return "reset 12 streaks";
    },
    // Two attempts is enough here; the real callers use the full budget.
    2,
  );

  assert.equal(result, "reset 12 streaks");
  assert.equal(calls, 2);
});

test("a real query error surfaces immediately, without a second attempt", async () => {
  let calls = 0;
  const constraintViolation = Object.assign(new Error("boom"), { code: "P2002" });

  await assert.rejects(
    withDbRetry("test", async () => {
      calls += 1;
      throw constraintViolation;
    }),
    /boom/,
  );
  assert.equal(calls, 1);
});

test("gives up after the attempt budget and rethrows the last failure", async () => {
  let calls = 0;

  await assert.rejects(
    withDbRetry(
      "test",
      async () => {
        calls += 1;
        throw NEON_AUTH_FAILURE;
      },
      2,
    ),
    /Authentication failed against the database server/,
  );
  assert.equal(calls, 2);
});
