/**
 * Daily production probe.
 *
 * Three silent outages were found by hand on 2026-09-10, each having run for
 * days or weeks: Noor answered every message with its offline fallback since
 * 2026-08-11 (bad OPENAI_MODEL), the Vocabulary tab served nothing because all
 * 500 words were DRAFT, and the Tadabbur Surahs were missing after an
 * interrupted seed. None produced a 5xx, a Sentry event, or an alert — a
 * degraded reply and an empty list are both successful responses.
 *
 * This probe asks the same questions a learner's first screens would, with
 * thresholds low enough that only a real outage trips them. It is deliberately
 * dependency-injected so the decision logic is testable without a database or a
 * provider; the cron route wires the real Prisma, OpenAI and R2 calls.
 */

export type ProbeCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type ProbeReport = {
  ok: boolean;
  checks: ProbeCheck[];
  failures: string[];
};

export type ProbeDeps = {
  /** VocabularyWord rows with status PUBLISHED — what /api/vocabulary/words lists. */
  countPublishedWords: () => Promise<number>;
  /** PUBLISHED words with a quranicRank — what /api/core500 lists. */
  countCore500Words: () => Promise<number>;
  /** TadabburSurah rows with status PUBLISHED — the Learn-tab Tadabbur card. */
  countPublishedSurahs: () => Promise<number>;
  /** Every lesson in the course map. */
  countLessons: () => Promise<number>;
  /** One media URL a learner would actually load, or null when none exists. */
  sampleMediaUrl: () => Promise<string | null>;
  /**
   * Catalogue clips the most recently edited lesson depends on, as the public
   * URLs /api/audio/catalog redirects to. Word media above is stored in the
   * database, so it cannot notice R2_PUBLIC_URL pointing at a bucket the
   * generator never uploaded to; these URLs are built from that variable.
   */
  sampleCatalogAudioUrls: () => Promise<string[]>;
  /** HTTP status of a HEAD against that URL. */
  headMedia: (url: string) => Promise<number>;
  /** Round-trips a trivial prompt through the real Noor path; throws when it cannot answer. */
  askNoor: () => Promise<string>;
};

/**
 * Floors, not targets. Production holds ~920 published words, ~500 with a
 * Quranic rank, 12 Surahs and ~410 lessons; the numbers below only trip when a
 * table has been emptied or mass-drafted, never on ordinary editing.
 */
export const PROBE_THRESHOLDS = {
  publishedWords: 400,
  core500Words: 400,
  publishedSurahs: 1,
  lessons: 100,
} as const;

/**
 * Every check runs even after an earlier one fails, so one report names every
 * broken surface instead of the first. A check that throws is a failure of that
 * check, never of the probe.
 */
export async function runProductionProbe(deps: ProbeDeps): Promise<ProbeReport> {
  const checks: ProbeCheck[] = [];

  async function check(name: string, run: () => Promise<{ ok: boolean; detail: string }>) {
    try {
      const result = await run();
      checks.push({ name, ...result });
    } catch (error) {
      checks.push({ name, ok: false, detail: `threw: ${describeError(error)}` });
    }
  }

  const atLeast = (label: string, count: number, floor: number) => ({
    ok: count >= floor,
    detail: `${count} ${label} (floor ${floor})`,
  });

  await check("published_words", async () =>
    atLeast("published words", await deps.countPublishedWords(), PROBE_THRESHOLDS.publishedWords),
  );
  await check("core500_words", async () =>
    atLeast("Core 500 words", await deps.countCore500Words(), PROBE_THRESHOLDS.core500Words),
  );
  await check("published_surahs", async () =>
    atLeast("published Surahs", await deps.countPublishedSurahs(), PROBE_THRESHOLDS.publishedSurahs),
  );
  await check("lessons", async () => atLeast("lessons", await deps.countLessons(), PROBE_THRESHOLDS.lessons));

  await check("media", async () => {
    const url = await deps.sampleMediaUrl();
    if (!url) return { ok: false, detail: "no published word carries a media URL" };
    const status = await deps.headMedia(url);
    return { ok: status >= 200 && status < 300, detail: `HEAD ${url} → ${status}` };
  });

  await check("catalog_audio", async () => {
    const urls = await deps.sampleCatalogAudioUrls();
    if (urls.length === 0) return { ok: false, detail: "no lesson carries catalogue audio" };
    const statuses = await Promise.all(urls.map(async (url) => ({ url, status: await deps.headMedia(url) })));
    const missing = statuses.filter((s) => s.status < 200 || s.status >= 300);
    return {
      ok: missing.length === 0,
      detail: missing.length === 0
        ? `${urls.length} clips resolve`
        : missing.map((m) => `HEAD ${m.url} → ${m.status}`).join("; "),
    };
  });

  await check("noor", async () => {
    const reply = await deps.askNoor();
    // Anything non-blank proves the key, the model id and the provider are all
    // live; the wording is the model's business.
    return { ok: reply.trim().length > 0, detail: reply.trim() ? "replied" : "blank reply" };
  });

  const failures = checks.filter((c) => !c.ok).map((c) => `${c.name}: ${c.detail}`);
  return { ok: failures.length === 0, checks, failures };
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
