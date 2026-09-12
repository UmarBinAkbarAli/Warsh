import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIntParam, readIntEnv } from "../lib/env";
import { DEFAULT_DAILY_MESSAGE_LIMIT, resolveDailyMessageLimit } from "../lib/noorLimit";

const VAR = "WARSH_TEST_INT";

function withEnv(value: string | undefined, run: () => void) {
  const previous = process.env[VAR];
  if (value === undefined) delete process.env[VAR];
  else process.env[VAR] = value;
  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => errors.push(args.map(String).join(" "));
  try {
    run();
  } finally {
    console.error = originalError;
    if (previous === undefined) delete process.env[VAR];
    else process.env[VAR] = previous;
  }
  return errors;
}

test("readIntEnv returns the fallback silently when unset or blank", () => {
  for (const value of [undefined, "", "   "]) {
    const errors = withEnv(value, () => assert.equal(readIntEnv(VAR, 7), 7));
    assert.deepEqual(errors, []);
  }
});

test("readIntEnv accepts integers inside the range, with surrounding whitespace", () => {
  withEnv(" 12 ", () => assert.equal(readIntEnv(VAR, 3, { min: 1, max: 20 }), 12));
  withEnv("0", () => assert.equal(readIntEnv(VAR, 5, { min: 0 }), 0));
});

test("readIntEnv fails closed on the fallback and logs, never echoing the value", () => {
  for (const value of ["abc", "NaN", "Infinity", "2.5", "-1", "99", "5 messages"]) {
    const errors = withEnv(value, () => assert.equal(readIntEnv(VAR, 3, { min: 1, max: 20 }), 3, value));
    assert.equal(errors.length, 1, value);
    assert.match(errors[0], /WARSH_TEST_INT is not a usable integer/);
    assert.doesNotMatch(errors[0], /abc|messages/);
  }
});

test("AI_DAILY_MESSAGE_LIMIT still falls back to the default cap on garbage", () => {
  const previous = process.env.AI_DAILY_MESSAGE_LIMIT;
  const originalError = console.error;
  console.error = () => {};
  try {
    process.env.AI_DAILY_MESSAGE_LIMIT = "unlimited";
    assert.equal(resolveDailyMessageLimit(), DEFAULT_DAILY_MESSAGE_LIMIT);
    process.env.AI_DAILY_MESSAGE_LIMIT = "-3";
    assert.equal(resolveDailyMessageLimit(), DEFAULT_DAILY_MESSAGE_LIMIT);
    process.env.AI_DAILY_MESSAGE_LIMIT = "8";
    assert.equal(resolveDailyMessageLimit(), 8);
  } finally {
    console.error = originalError;
    if (previous === undefined) delete process.env.AI_DAILY_MESSAGE_LIMIT;
    else process.env.AI_DAILY_MESSAGE_LIMIT = previous;
  }
});

test("parseIntParam clamps and never yields NaN", () => {
  assert.equal(parseIntParam(null, 50, { min: 1, max: 200 }), 50);
  assert.equal(parseIntParam("abc", 50, { min: 1, max: 200 }), 50);
  assert.equal(parseIntParam("1e3", 50, { min: 1, max: 200 }), 200);
  assert.equal(parseIntParam("999", 50, { min: 1, max: 200 }), 200);
  assert.equal(parseIntParam("0", 50, { min: 1, max: 200 }), 1);
  assert.equal(parseIntParam("-4", 0, { min: 0 }), 0);
  assert.equal(parseIntParam("2.5", 1, { min: 1 }), 1);
  assert.equal(parseIntParam("17", 1, { min: 1 }), 17);
});
