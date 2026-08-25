import test from "node:test";
import assert from "node:assert/strict";
import { asSafeJwtParam, toInlineScriptJson } from "../lib/inlineScript";

// Regression cover for the reflected XSS on GET /reset-password, where the
// `?token=` query parameter was interpolated into an inline <script> with a
// bare JSON.stringify. JSON.stringify escapes for JavaScript string context but
// not for the HTML parser, so a token containing `</script>` closed the element
// and injected markup on api.warsh.app — the same origin that serves Warsh
// Studio and its admin session cookie.

const SCRIPT_BREAKERS = [
  "</script><img src=x onerror=alert(document.domain)>",
  "</SCRIPT ><svg onload=alert(1)>",
  "</script\t><script>alert(1)</script>",
  "</script >",
  "<!--<script>",
];

test("toInlineScriptJson leaves no character the HTML parser can act on", () => {
  for (const payload of SCRIPT_BREAKERS) {
    const escaped = toInlineScriptJson(payload);
    assert.ok(!escaped.includes("<"), `raw < survived escaping: ${escaped}`);
    assert.ok(!escaped.includes(">"), `raw > survived escaping: ${escaped}`);
    assert.doesNotMatch(escaped, /<\/script/i);
  }
});

test("toInlineScriptJson preserves the value it escapes", () => {
  for (const payload of [...SCRIPT_BREAKERS, "plain", "", "quote\"and\\backslash"]) {
    assert.equal(JSON.parse(toInlineScriptJson(payload)), payload);
  }
});

// Written as escapes rather than literal characters so the separators survive
// editors and tooling that would otherwise normalise them away.
const LS = "\u2028";
const PS = "\u2029";

test("toInlineScriptJson escapes JS line terminators that are legal in JSON", () => {
  const raw = `a${LS}b${PS}c`;
  const escaped = toInlineScriptJson(raw);
  assert.ok(!escaped.includes(LS), "raw U+2028 survived escaping");
  assert.ok(!escaped.includes(PS), "raw U+2029 survived escaping");
  assert.equal(JSON.parse(escaped), raw);
});

test("asSafeJwtParam drops anything that is not JWT-shaped", () => {
  for (const payload of SCRIPT_BREAKERS) {
    assert.equal(asSafeJwtParam(payload), "", `gate admitted: ${payload}`);
  }
  assert.equal(asSafeJwtParam(null), "");
  assert.equal(asSafeJwtParam(undefined), "");
  assert.equal(asSafeJwtParam(""), "");
  // Too short to be a real token.
  assert.equal(asSafeJwtParam("a".repeat(19)), "");
  // Unbounded input must not be reflected either.
  assert.equal(asSafeJwtParam("a".repeat(2049)), "");
});

test("asSafeJwtParam passes a real reset token through untouched", () => {
  const jwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
    ".eyJzdWIiOiJjbHgxMjMiLCJwdXJwb3NlIjoicGFzc3dvcmQtcmVzZXQifQ" +
    ".s1gn4tur3-_wxyz";
  assert.equal(asSafeJwtParam(jwt), jwt);
  assert.equal(JSON.parse(toInlineScriptJson(jwt)), jwt);

  // The deep links built from that token must survive escaping unchanged too.
  const deepLink = `warsh://reset-password?token=${encodeURIComponent(jwt)}`;
  assert.equal(JSON.parse(toInlineScriptJson(deepLink)), deepLink);
});
