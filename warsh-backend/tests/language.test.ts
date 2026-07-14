import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isSupportedLanguage,
  resolveRegistrationLanguages,
  resolveContentLanguage,
  SUPPORTED_LANGUAGES,
} from "../lib/language";

test("SUPPORTED_LANGUAGES is exactly en and ur", () => {
  assert.deepEqual([...SUPPORTED_LANGUAGES], ["en", "ur"]);
});

test("isSupportedLanguage accepts only en/ur", () => {
  assert.equal(isSupportedLanguage("en"), true);
  assert.equal(isSupportedLanguage("ur"), true);
  assert.equal(isSupportedLanguage("ar"), false);
  assert.equal(isSupportedLanguage("EN"), false);
  assert.equal(isSupportedLanguage(""), false);
  assert.equal(isSupportedLanguage(undefined), false);
  assert.equal(isSupportedLanguage(null), false);
  assert.equal(isSupportedLanguage(1), false);
});

test("registration: honours explicit translationLanguage", () => {
  assert.deepEqual(
    resolveRegistrationLanguages({ nativeLanguage: "en", translationLanguage: "ur" }),
    { nativeLanguage: "en", translationLanguage: "ur" },
  );
});

test("registration: older client omitting translationLanguage falls back to nativeLanguage", () => {
  // An English user on an old build must NOT be switched to Urdu.
  assert.deepEqual(
    resolveRegistrationLanguages({ nativeLanguage: "en" }),
    { nativeLanguage: "en", translationLanguage: "en" },
  );
  assert.deepEqual(
    resolveRegistrationLanguages({ nativeLanguage: "ur" }),
    { nativeLanguage: "ur", translationLanguage: "ur" },
  );
});

test("registration: neither provided defaults to ur", () => {
  assert.deepEqual(
    resolveRegistrationLanguages({}),
    { nativeLanguage: "ur", translationLanguage: "ur" },
  );
});

test("registration: unsupported values are ignored, not stored", () => {
  assert.deepEqual(
    resolveRegistrationLanguages({ nativeLanguage: "fr", translationLanguage: "de" }),
    { nativeLanguage: "ur", translationLanguage: "ur" },
  );
  // Bad translationLanguage but valid nativeLanguage -> fall back to native
  assert.deepEqual(
    resolveRegistrationLanguages({ nativeLanguage: "en", translationLanguage: "xx" }),
    { nativeLanguage: "en", translationLanguage: "en" },
  );
});

test("content language: prefers translationLanguage over nativeLanguage", () => {
  assert.equal(resolveContentLanguage({ translationLanguage: "ur", nativeLanguage: "en" }), "ur");
  assert.equal(resolveContentLanguage({ translationLanguage: "en", nativeLanguage: "ur" }), "en");
});

test("content language: falls back to nativeLanguage when translationLanguage missing", () => {
  assert.equal(resolveContentLanguage({ translationLanguage: null, nativeLanguage: "en" }), "en");
  assert.equal(resolveContentLanguage({ nativeLanguage: "ur" }), "ur");
});

test("content language: returns undefined when nothing usable", () => {
  assert.equal(resolveContentLanguage({ translationLanguage: null, nativeLanguage: null }), undefined);
  assert.equal(resolveContentLanguage({}), undefined);
});
