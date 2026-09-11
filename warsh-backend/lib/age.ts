// Age handling for the neutral age-check step.
//
// Google Play declares Warsh for ages 13–17 and adults, so an account must not
// exist for anyone younger than MIN_AGE and the backend must know who is a
// minor. Age is derived here, never trusted from the client, and computed on
// the PKT calendar day like every other date rule in this backend.

import { getPKTDateString } from "./date";

export const MIN_AGE = 13;
export const ADULT_AGE = 18;
const MAX_AGE = 120;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a client-supplied `YYYY-MM-DD` date of birth. Returns null for anything
 * that is not a real calendar date in the plausible past. The returned Date is
 * midnight UTC so it round-trips through Prisma's `@db.Date` unchanged.
 */
export function parseDateOfBirth(value: unknown, now = new Date()): Date | null {
  if (typeof value !== "string") return null;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects 31 February and friends, which Date.UTC would silently roll over.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  const todayIso = getPKTDateString(now);
  if (value > todayIso) return null;
  if (year < Number(todayIso.slice(0, 4)) - MAX_AGE) return null;
  return date;
}

/** ISO `YYYY-MM-DD` for a stored date of birth, or null. */
export function formatDateOfBirth(date: Date | null | undefined): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

/** Whole years completed as of today's PKT calendar date. */
export function ageInYears(dateOfBirth: Date, now = new Date()): number {
  const today = getPKTDateString(now);
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const d = Number(today.slice(8, 10));
  let age = y - dateOfBirth.getUTCFullYear();
  const birthdayPassed =
    m > dateOfBirth.getUTCMonth() + 1 ||
    (m === dateOfBirth.getUTCMonth() + 1 && d >= dateOfBirth.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

export function isAgePermitted(dateOfBirth: Date, now = new Date()): boolean {
  return ageInYears(dateOfBirth, now) >= MIN_AGE;
}

/** Null when the account has not answered the age check yet. */
export function isMinor(dateOfBirth: Date | null | undefined, now = new Date()): boolean | null {
  if (!dateOfBirth) return null;
  return ageInYears(dateOfBirth, now) < ADULT_AGE;
}

/**
 * Builds with the age-check step send `X-Warsh-App-Version`. Older installs
 * (≤ 1.0.8) cannot supply a date of birth, and refusing them would break every
 * new sign-up on a build that is still rolling out on Play. They are allowed
 * through without one and are prompted in-app after they update. Flip this to
 * `false` once 1.0.8 is no longer a supported build.
 */
export const ALLOW_LEGACY_SIGNUP_WITHOUT_DOB = true;

export function isLegacyClient(request: Request): boolean {
  return !request.headers.get("x-warsh-app-version");
}

export type AgeCheckOutcome =
  | { kind: "ok"; dateOfBirth: Date }
  | { kind: "legacy"; dateOfBirth: null }
  | { kind: "missing" }
  | { kind: "invalid" }
  | { kind: "too_young" };

/**
 * Shared decision for the sign-up routes: what to do with the submitted date of
 * birth given the client that sent it.
 */
export function evaluateSignupAge(request: Request, value: unknown, now = new Date()): AgeCheckOutcome {
  if (value === undefined || value === null || value === "") {
    if (ALLOW_LEGACY_SIGNUP_WITHOUT_DOB && isLegacyClient(request)) {
      return { kind: "legacy", dateOfBirth: null };
    }
    return { kind: "missing" };
  }
  const dateOfBirth = parseDateOfBirth(value, now);
  if (!dateOfBirth) return { kind: "invalid" };
  if (!isAgePermitted(dateOfBirth, now)) return { kind: "too_young" };
  return { kind: "ok", dateOfBirth };
}

/** Route-level mapping of a refused outcome to the API error envelope. */
export function ageCheckError(outcome: Exclude<AgeCheckOutcome, { kind: "ok" | "legacy" }>): {
  status: number;
  body: { error: string; code: string };
} {
  switch (outcome.kind) {
    case "missing":
      return { status: 400, body: { error: "Date of birth is required", code: "age_check_required" } };
    case "invalid":
      return { status: 400, body: { error: "Date of birth is not a valid date", code: "bad_request" } };
    case "too_young":
      return {
        status: 403,
        body: { error: "Warsh is for learners aged 13 and older", code: "age_not_permitted" },
      };
  }
}
