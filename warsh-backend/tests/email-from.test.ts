import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveFrom } from "../lib/email";

// Every password reset failed on a Resend 422 for three days because
// SMTP_FROM_EMAIL was interpolated into `Warsh <${...}>` and trusted to be a
// bare address. Vercel stores whatever is pasted in, verbatim. These are the
// shapes that value has actually taken, plus the ones it could take next.
const DEFAULT_FROM = "Warsh <noreply@warsh.app>";

function withValue<T>(value: string | undefined, run: () => T): T {
  const previous = process.env.SMTP_FROM_EMAIL;
  if (value === undefined) delete process.env.SMTP_FROM_EMAIL;
  else process.env.SMTP_FROM_EMAIL = value;
  try {
    return run();
  } finally {
    if (previous === undefined) delete process.env.SMTP_FROM_EMAIL;
    else process.env.SMTP_FROM_EMAIL = previous;
  }
}

test("wraps a bare address in the display name", () => {
  assert.equal(withValue("noreply@warsh.app", resolveFrom), DEFAULT_FROM);
});

// The production value, pasted out of .env with its quotes attached. This is
// the exact shape that produced `Warsh <"noreply@warsh.app">` and the 422.
test("strips quotes pasted in from a .env file", () => {
  assert.equal(withValue('"noreply@warsh.app"', resolveFrom), DEFAULT_FROM);
  assert.equal(withValue("'noreply@warsh.app'", resolveFrom), DEFAULT_FROM);
});

test("passes through a value that already carries a display name", () => {
  assert.equal(withValue("Warsh <noreply@warsh.app>", resolveFrom), DEFAULT_FROM);
  assert.equal(withValue("Warsh Support <help@warsh.app>", resolveFrom), "Warsh Support <help@warsh.app>");
});

// Both quoting mistakes at once: a display name AND surrounding quotes.
test("strips quotes from a value that already carries a display name", () => {
  assert.equal(withValue('"Warsh <noreply@warsh.app>"', resolveFrom), DEFAULT_FROM);
});

test("tolerates surrounding whitespace", () => {
  assert.equal(withValue("  noreply@warsh.app  ", resolveFrom), DEFAULT_FROM);
  assert.equal(withValue(' "noreply@warsh.app" ', resolveFrom), DEFAULT_FROM);
});

test("falls back to the default when the value is unset or empty", () => {
  assert.equal(withValue(undefined, resolveFrom), DEFAULT_FROM);
  assert.equal(withValue("", resolveFrom), DEFAULT_FROM);
  assert.equal(withValue('""', resolveFrom), DEFAULT_FROM);
  assert.equal(withValue("   ", resolveFrom), DEFAULT_FROM);
});

// A misconfigured variable should cost us the display name, not the email.
test("falls back to the default rather than sending an unusable header", () => {
  assert.equal(withValue("not an address", resolveFrom), DEFAULT_FROM);
  assert.equal(withValue("Warsh <noreply@warsh.app", resolveFrom), DEFAULT_FROM);
  assert.equal(withValue("<<noreply@warsh.app>>", resolveFrom), DEFAULT_FROM);
});

// The header the fixed code produces is the one Resend accepted and delivered
// on 2026-09-05; never let it regress to an interpolated bare wrap.
test("never double-wraps a display name", () => {
  const resolved = withValue("Warsh <noreply@warsh.app>", resolveFrom);
  assert.ok(!resolved.includes("Warsh <Warsh"));
  assert.equal((resolved.match(/</g) ?? []).length, 1);
});
