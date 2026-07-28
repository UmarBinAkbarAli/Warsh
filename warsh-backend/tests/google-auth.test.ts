import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import {
  signGoogleLinkToken,
  verifyGoogleLinkToken,
  verifyToken,
} from "../lib/auth";

const previousJwtSecret = process.env.JWT_SECRET;

before(() => {
  process.env.JWT_SECRET = "test-only-google-auth-secret";
});

after(() => {
  if (previousJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousJwtSecret;
  }
});

test("Google link tokens preserve the verified identity and purpose", () => {
  const token = signGoogleLinkToken({
    googleSubject: "google-subject-123",
    email: "learner@example.com",
    name: "Warsh Learner",
  });

  const payload = verifyGoogleLinkToken(token);
  assert.equal(payload?.purpose, "google-link");
  assert.equal(payload?.googleSubject, "google-subject-123");
  assert.equal(payload?.email, "learner@example.com");
  assert.equal(payload?.name, "Warsh Learner");
});

test("Google link tokens cannot be used as Warsh session tokens", () => {
  const token = signGoogleLinkToken({
    googleSubject: "google-subject-123",
    email: "learner@example.com",
    name: "Warsh Learner",
  });

  assert.equal(verifyToken(token).userId, undefined);
});

test("invalid Google link tokens are rejected", () => {
  assert.equal(verifyGoogleLinkToken("not-a-jwt"), null);
});
