import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ageInYears,
  evaluateSignupAge,
  formatDateOfBirth,
  isAgePermitted,
  isMinor,
  parseDateOfBirth,
} from "../lib/age";

// 2026-09-11 12:00 PKT (07:00 UTC).
const NOW = new Date("2026-09-11T07:00:00.000Z");

function req(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/auth/register", { method: "POST", headers });
}

test("parseDateOfBirth accepts only real ISO dates in the plausible past", () => {
  assert.equal(formatDateOfBirth(parseDateOfBirth("2011-03-14", NOW)), "2011-03-14");
  assert.equal(parseDateOfBirth("2011-02-30", NOW), null);
  assert.equal(parseDateOfBirth("2011-13-01", NOW), null);
  assert.equal(parseDateOfBirth("14-03-2011", NOW), null);
  assert.equal(parseDateOfBirth("2026-09-12", NOW), null, "future dates are refused");
  assert.equal(formatDateOfBirth(parseDateOfBirth("2026-09-11", NOW)), "2026-09-11", "today is allowed (it is simply under 13)");
  assert.equal(parseDateOfBirth("1899-01-01", NOW), null);
  assert.equal(parseDateOfBirth(20110314, NOW), null);
  assert.equal(parseDateOfBirth(undefined, NOW), null);
});

test("ageInYears turns over on the birthday itself, on the PKT calendar day", () => {
  assert.equal(ageInYears(parseDateOfBirth("2013-09-11", NOW)!, NOW), 13, "birthday today counts");
  assert.equal(ageInYears(parseDateOfBirth("2013-09-12", NOW)!, NOW), 12, "birthday tomorrow does not");
  // 23:30 UTC on the 10th is already the 11th in PKT.
  const latePkt = new Date("2026-09-10T23:30:00.000Z");
  assert.equal(ageInYears(parseDateOfBirth("2013-09-11", NOW)!, latePkt), 13);
});

test("isAgePermitted and isMinor use the 13 and 18 thresholds", () => {
  assert.equal(isAgePermitted(parseDateOfBirth("2013-09-11", NOW)!, NOW), true);
  assert.equal(isAgePermitted(parseDateOfBirth("2013-09-12", NOW)!, NOW), false);
  assert.equal(isMinor(parseDateOfBirth("2008-09-12", NOW), NOW), true, "turns 18 tomorrow");
  assert.equal(isMinor(parseDateOfBirth("2008-09-11", NOW), NOW), false, "18 today");
  assert.equal(isMinor(null, NOW), null, "unanswered is neither");
});

test("evaluateSignupAge refuses a missing date from a current client", () => {
  const modern = req({ "X-Warsh-App-Version": "1.0.9" });
  assert.deepEqual(evaluateSignupAge(modern, undefined, NOW), { kind: "missing" });
  assert.deepEqual(evaluateSignupAge(modern, "", NOW), { kind: "missing" });
  assert.deepEqual(evaluateSignupAge(modern, "nope", NOW), { kind: "invalid" });
  assert.deepEqual(evaluateSignupAge(modern, "2015-01-01", NOW), { kind: "too_young" });
  const ok = evaluateSignupAge(modern, "2011-03-14", NOW);
  assert.equal(ok.kind, "ok");
  assert.equal(formatDateOfBirth(ok.kind === "ok" ? ok.dateOfBirth : null), "2011-03-14");
});

test("evaluateSignupAge lets a legacy client through without a date but never under 13", () => {
  const legacy = req();
  assert.deepEqual(evaluateSignupAge(legacy, undefined, NOW), { kind: "legacy", dateOfBirth: null });
  assert.deepEqual(evaluateSignupAge(legacy, "2015-01-01", NOW), { kind: "too_young" });
});
