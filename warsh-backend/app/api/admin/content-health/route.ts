import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import { LessonContentSchema } from "../../../../lib/content-schema";
import { lessonAudioTargets } from "../../../../lib/audioTargets";
import { listR2Keys } from "../../../../lib/r2";

export const dynamic = "force-dynamic";

type Item = { label: string; detail?: string; href: string };
type Category = {
  key: string;
  label: string;
  severity: "high" | "medium" | "low";
  count: number;
  items: Item[];
  /** Set when a category could not be scanned, so zero doesn't read as clean. */
  unavailable?: string;
  /** Operator hint shown under the category, e.g. the command that fixes it. */
  hint?: string;
};

const CAP = 60; // max items reported per category (count still reflects the true total)

function nonEmpty(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

// GET /api/admin/content-health — scans the whole library for gaps and errors.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const [chapters, words] = await Promise.all([
    prisma.chapter.findMany({
      orderBy: { order: "asc" },
      include: { lessons: { orderBy: { order: "asc" }, select: { id: true, order: true, title: true, content: true } } },
    }),
    prisma.vocabularyWord.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, arabic: true, arabicPlain: true, translationEn: true, translationUr: true, imageUrl: true, audioUrl: true },
    }),
  ]);

  const cats: Record<string, Category> = {
    schema_invalid: { key: "schema_invalid", label: "Lessons that fail schema validation", severity: "high", count: 0, items: [] },
    empty_lesson: { key: "empty_lesson", label: "Empty lessons (no cards or exercises)", severity: "high", count: 0, items: [] },
    empty_chapter: { key: "empty_chapter", label: "Empty chapters (no lessons)", severity: "medium", count: 0, items: [] },
    chapter_missing_urdu: { key: "chapter_missing_urdu", label: "Chapters missing Urdu title or description", severity: "medium", count: 0, items: [] },
    hook_missing_audio: { key: "hook_missing_audio", label: "Lesson hooks with an ayah but no audio", severity: "medium", count: 0, items: [] },
    card_missing_image: { key: "card_missing_image", label: "Word cards missing an image", severity: "low", count: 0, items: [] },
    card_missing_urdu: { key: "card_missing_urdu", label: "Cards missing Urdu translation", severity: "medium", count: 0, items: [] },
    audio_missing: {
      key: "audio_missing",
      label: "Lessons whose Arabic text has no recorded audio",
      severity: "medium",
      count: 0,
      items: [],
      hint: "Editing Arabic text changes the clip it points at. Generate the new clips with: npm run audio:prebuild-catalog -- --from-db",
    },
    vocab_missing_urdu: { key: "vocab_missing_urdu", label: "Vocabulary words missing Urdu", severity: "medium", count: 0, items: [] },
    vocab_missing_image: { key: "vocab_missing_image", label: "Vocabulary words missing an image", severity: "low", count: 0, items: [] },
    vocab_missing_audio: { key: "vocab_missing_audio", label: "Vocabulary words missing audio", severity: "low", count: 0, items: [] },
  };

  function push(key: string, item: Item) {
    const c = cats[key];
    c.count += 1;
    if (c.items.length < CAP) c.items.push(item);
  }

  let totalLessons = 0;
  const audioByLesson: { label: string; href: string; keys: string[] }[] = [];

  for (const ch of chapters) {
    if (ch.lessons.length === 0) {
      push("empty_chapter", { label: `Ch ${ch.order} — ${ch.title}`, href: `/dashboard/curriculum?chapter=${ch.id}` });
    }
    if (!nonEmpty(ch.titleUr) || !nonEmpty(ch.descriptionUr)) {
      const missing = [!nonEmpty(ch.titleUr) ? "title" : null, !nonEmpty(ch.descriptionUr) ? "description" : null].filter(Boolean).join(", ");
      push("chapter_missing_urdu", { label: `Ch ${ch.order} — ${ch.title}`, detail: `missing Urdu ${missing}`, href: `/dashboard/curriculum?chapter=${ch.id}` });
    }

    for (const lesson of ch.lessons) {
      totalLessons += 1;
      const href = `/dashboard/curriculum?chapter=${ch.id}&lesson=${lesson.id}`;
      const label = `Ch ${ch.order} · L${lesson.order} — ${lesson.title}`;
      const content = (lesson.content ?? {}) as Record<string, unknown>;

      // Schema validity
      if (!LessonContentSchema.safeParse(content).success) {
        push("schema_invalid", { label, href });
      }

      const cards = (Array.isArray(content.discover_cards) ? content.discover_cards : []) as Record<string, unknown>[];
      const exercises = (Array.isArray(content.exercises) ? content.exercises : []) as unknown[];

      if (cards.length === 0 && exercises.length === 0) {
        push("empty_lesson", { label, href });
      }

      // Hook audio
      const hook = content.hook as Record<string, unknown> | null | undefined;
      const ayah = hook?.ayah as Record<string, unknown> | undefined;
      if (ayah && nonEmpty(ayah.ar) && !nonEmpty(ayah.audio_url)) {
        push("hook_missing_audio", { label, href });
      }

      // Card-level checks
      let cardImgMissing = 0;
      let cardUrduMissing = 0;
      for (const card of cards) {
        const type = card.type as string;
        if (type === "WORD") {
          if (!nonEmpty(card.image_url)) cardImgMissing += 1;
          const text = card.text as Record<string, unknown> | undefined;
          if (text && nonEmpty(text.en) && !nonEmpty(text.ur)) cardUrduMissing += 1;
        }
        if (type === "CONCEPT" || type === "CONTRAST" || type === "AYAH_PREVIEW") {
          const concept = card.concept as Record<string, unknown> | undefined;
          if (concept && nonEmpty(concept.en) && !nonEmpty(concept.ur)) cardUrduMissing += 1;
        }
      }
      if (cardImgMissing > 0) push("card_missing_image", { label, detail: `${cardImgMissing} word card(s)`, href });
      if (cardUrduMissing > 0) push("card_missing_urdu", { label, detail: `${cardUrduMissing} card(s)`, href });

      // Audio is keyed by a hash of the Arabic text and runtime lookup has no
      // generation fallback, so any text edit silently orphans its clip. The
      // R2 comparison happens once, after the whole library is walked.
      try {
        const targets = lessonAudioTargets(content);
        if (targets.length > 0) audioByLesson.push({ label, href, keys: targets.map((t) => t.key) });
      } catch {
        // A malformed lesson is already reported as schema_invalid; it should
        // not take the whole health scan down with it.
      }
    }
  }

  // One paginated R2 listing for the entire library rather than a HEAD per clip.
  try {
    const present = new Set(await listR2Keys("audio/catalog/v1/"));
    for (const lesson of audioByLesson) {
      const missing = lesson.keys.filter((key) => !present.has(key)).length;
      if (missing > 0) {
        push("audio_missing", { label: lesson.label, detail: `${missing} clip(s) to generate`, href: lesson.href });
      }
    }
  } catch (error) {
    // R2 unconfigured or unreachable: say so rather than reporting a clean zero.
    cats.audio_missing.unavailable = error instanceof Error ? error.message : "R2 could not be reached.";
  }

  for (const w of words) {
    const href = `/dashboard/vocabulary?q=${encodeURIComponent(w.arabicPlain || w.arabic)}`;
    const wl = `${w.arabic} — ${w.translationEn}`;
    if (!nonEmpty(w.translationUr)) push("vocab_missing_urdu", { label: wl, href });
    if (!nonEmpty(w.imageUrl)) push("vocab_missing_image", { label: wl, href });
    if (!nonEmpty(w.audioUrl)) push("vocab_missing_audio", { label: wl, href });
  }

  const categories = Object.values(cats).sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.severity] - rank[b.severity] || b.count - a.count;
  });
  const issueCount = categories.reduce((s, c) => s + c.count, 0);

  return NextResponse.json({
    data: {
      summary: {
        totalChapters: chapters.length,
        totalLessons,
        totalWords: words.length,
        issueCount,
        cleanCategories: categories.filter((c) => c.count === 0 && !c.unavailable).length,
      },
      categories,
    },
  });
}
