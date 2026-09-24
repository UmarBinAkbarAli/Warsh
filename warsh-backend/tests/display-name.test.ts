import { test } from "node:test";
import assert from "node:assert/strict";
import { DISPLAY_NAME_MAX_LENGTH, parseDisplayName } from "../lib/displayName";

test("a display name is trimmed and inner whitespace collapsed", () => {
  assert.equal(parseDisplayName("  Umar   bin  Akbar "), "Umar bin Akbar");
});

test("Urdu and Arabic names are accepted", () => {
  assert.equal(parseDisplayName("عمر"), "عمر");
  assert.equal(parseDisplayName("محمد علی"), "محمد علی");
});

test("empty, whitespace-only and non-string names are refused", () => {
  assert.equal(parseDisplayName(""), null);
  assert.equal(parseDisplayName("   "), null);
  assert.equal(parseDisplayName(undefined), null);
  assert.equal(parseDisplayName(42), null);
});

test("names over the length limit are refused", () => {
  assert.equal(parseDisplayName("a".repeat(DISPLAY_NAME_MAX_LENGTH)), "a".repeat(DISPLAY_NAME_MAX_LENGTH));
  assert.equal(parseDisplayName("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1)), null);
});

test("control characters are refused", () => {
  assert.equal(parseDisplayName("Umar\u0000"), null);
});
