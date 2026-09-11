import { test } from "node:test";
import assert from "node:assert/strict";
import { PROBE_THRESHOLDS, runProductionProbe, type ProbeDeps } from "../lib/productionProbe";

/**
 * The probe exists because an empty Vocabulary tab, a missing Tadabbur card and
 * a Noor that could not answer all looked like healthy 200s. Each case below is
 * one of those outages replayed against the decision logic.
 */

function healthyDeps(overrides: Partial<ProbeDeps> = {}): ProbeDeps {
  return {
    countPublishedWords: async () => 920,
    countCore500Words: async () => 500,
    countPublishedSurahs: async () => 12,
    countLessons: async () => 411,
    sampleMediaUrl: async () => "https://assets.warsh.app/audio/words/abc.mp3",
    headMedia: async () => 200,
    askNoor: async () => "ready",
    ...overrides,
  };
}

test("a healthy production passes every check", async () => {
  const report = await runProductionProbe(healthyDeps());
  assert.equal(report.ok, true);
  assert.deepEqual(report.failures, []);
  assert.equal(report.checks.length, 6);
});

test("all vocabulary words left DRAFT fails the words and Core 500 checks", async () => {
  // 2026-09-10: 500 rows, all DRAFT, so /api/vocabulary/words returned [] with a 200.
  const report = await runProductionProbe(
    healthyDeps({ countPublishedWords: async () => 0, countCore500Words: async () => 0 }),
  );
  assert.equal(report.ok, false);
  assert.deepEqual(
    report.checks.filter((c) => !c.ok).map((c) => c.name),
    ["published_words", "core500_words"],
  );
});

test("missing Tadabbur Surahs fail the probe", async () => {
  const report = await runProductionProbe(healthyDeps({ countPublishedSurahs: async () => 0 }));
  assert.equal(report.ok, false);
  assert.match(report.failures.join(), /published_surahs/);
});

test("Noor unable to answer fails the probe without hiding the other checks", async () => {
  // A dead key or a retired model id throws AssistantUnavailableError; the probe
  // must report it as a Noor failure and still run everything after it.
  const report = await runProductionProbe(
    healthyDeps({
      askNoor: async () => {
        throw new Error("Noor assistant unavailable: provider_error");
      },
    }),
  );
  assert.equal(report.ok, false);
  assert.equal(report.checks.length, 6);
  assert.deepEqual(report.failures, ["noor: threw: Noor assistant unavailable: provider_error"]);
});

test("a blank Noor reply is a failure", async () => {
  const report = await runProductionProbe(healthyDeps({ askNoor: async () => "   " }));
  assert.equal(report.ok, false);
  assert.match(report.failures.join(), /noor: blank reply/);
});

test("media that no longer resolves on the public host fails the probe", async () => {
  // A seed run re-ids every word and strands its R2 objects; the URL is still
  // stored but answers 404.
  const report = await runProductionProbe(healthyDeps({ headMedia: async () => 404 }));
  assert.equal(report.ok, false);
  assert.match(report.failures.join(), /media: HEAD .* → 404/);
});

test("no published word carrying a media URL is itself a failure", async () => {
  const report = await runProductionProbe(healthyDeps({ sampleMediaUrl: async () => null }));
  assert.equal(report.ok, false);
  assert.match(report.failures.join(), /media: no published word/);
});

test("a database that cannot be reached fails the affected checks, not the run", async () => {
  const unreachable = async () => {
    throw new Error("Can't reach database server");
  };
  const report = await runProductionProbe(
    healthyDeps({ countPublishedWords: unreachable, countLessons: unreachable }),
  );
  assert.equal(report.ok, false);
  assert.equal(report.checks.length, 6);
  assert.deepEqual(
    report.checks.filter((c) => !c.ok).map((c) => c.name),
    ["published_words", "lessons"],
  );
});

test("thresholds are floors, so ordinary editing never trips them", async () => {
  const report = await runProductionProbe(
    healthyDeps({
      countPublishedWords: async () => PROBE_THRESHOLDS.publishedWords,
      countCore500Words: async () => PROBE_THRESHOLDS.core500Words,
      countPublishedSurahs: async () => PROBE_THRESHOLDS.publishedSurahs,
      countLessons: async () => PROBE_THRESHOLDS.lessons,
    }),
  );
  assert.equal(report.ok, true);
});
