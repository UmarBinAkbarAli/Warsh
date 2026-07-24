import assert from "node:assert/strict";
import test from "node:test";
import type { Event } from "@sentry/nextjs";
import { scrubSentryEvent } from "../sentry.shared";

test("scrubSentryEvent removes identity and request secrets", () => {
  const event: Event = {
    event_id: "0123456789abcdef0123456789abcdef",
    timestamp: Date.now() / 1000,
    platform: "javascript",
    user: {
      id: "user-123",
      email: "learner@example.com",
      ip_address: "203.0.113.10",
    },
    request: {
      url: "https://api.warsh.app/reset-password?token=secret#fragment",
      query_string: "token=secret",
      cookies: { session: "secret" },
      headers: {
        authorization: "Bearer abc.def.ghi",
        cookie: "session=secret",
        accept: "application/json",
      },
      data: {
        email: "learner@example.com",
        password: "secret",
        harmless: "kept",
      },
    },
    extra: {
      prompt: "private Noor question",
      harmless: "kept",
    },
    breadcrumbs: [
      {
        message: "Request failed for learner@example.com",
        data: {
          authorization: "Bearer abc.def.ghi",
          status: 401,
        },
      },
    ],
  };

  const scrubbed = scrubSentryEvent(event);

  assert.deepEqual(scrubbed.user, { id: "user-123" });
  assert.equal(scrubbed.request?.url, "https://api.warsh.app/reset-password");
  assert.equal(scrubbed.request?.query_string, undefined);
  assert.equal(scrubbed.request?.cookies, undefined);
  assert.deepEqual(scrubbed.request?.headers, {
    authorization: "[Filtered]",
    cookie: "[Filtered]",
    accept: "application/json",
  });
  assert.deepEqual(scrubbed.request?.data, {
    email: "[Filtered]",
    password: "[Filtered]",
    harmless: "kept",
  });
  assert.deepEqual(scrubbed.extra, {
    prompt: "[Filtered]",
    harmless: "kept",
  });
  assert.equal(scrubbed.breadcrumbs?.[0]?.message, "[Filtered]");
  assert.deepEqual(scrubbed.breadcrumbs?.[0]?.data, {
    authorization: "[Filtered]",
    status: 401,
  });
});
