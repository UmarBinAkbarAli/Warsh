import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../lib/course";
import { getSubscriptionState, requiresSubscription } from "../../../../lib/subscription";

interface Props {
  params: { id: string };
}

// Map the new content schema (warsh-content-schema.ts) to the shape the lesson
// player already reads. This keeps the app untouched while we migrate content.
function transformContent(template: string, content: Record<string, unknown>) {
  const hook = content.hook as Record<string, unknown> | undefined;
  const ayah = hook?.ayah as Record<string, unknown> | undefined;
  const noorIntro = hook?.noor_intro as Record<string, unknown> | undefined;
  const discoverCards = content.discover_cards as Record<string, unknown>[] | undefined;
  const rawExercises = content.exercises as Record<string, unknown>[] | undefined;
  const reveal = content.reveal as Record<string, unknown> | undefined;
  const revealAyah = reveal?.ayah as Record<string, unknown> | undefined;
  const highlightedIndices = reveal?.highlighted_word_indices as number[] | undefined;

  const mappedHook = ayah
    ? {
        ayahAr: ayah.ar as string,
        ayahRef: ayah.label as string,
        question: noorIntro?.en as string | undefined,
      }
    : null;

  const mappedCards = (discoverCards ?? []).map((card) => {
    const text = card.text as Record<string, unknown> | undefined;
    const explanation = card.explanation as Record<string, unknown> | undefined;
    return {
      arabicText: text?.ar as string | undefined,
      translation: text?.en as string | undefined,
      transliteration: text?.translit as string | undefined,
      explanation: explanation?.en as string | undefined,
    };
  });

  const mappedExercises = (rawExercises ?? []).map((ex) => {
    const type = ex.type as string;

    if (type === "TAP_TRANSLATION") {
      const prompt = ex.prompt as Record<string, unknown>;
      const options = ex.options as Array<Record<string, unknown>>;
      const correctIndex = ex.correct_index as number;
      const wrongMsg = ex.explanation_on_wrong as Record<string, unknown> | undefined;
      return {
        type,
        prompt: "What does this Arabic mean?",
        arabicText: prompt.ar as string,
        options: options.map((o) => o.en as string),
        correctAnswer: options[correctIndex].en as string,
        explanation_on_wrong: wrongMsg?.en as string | undefined,
      };
    }

    if (type === "MATCHING") {
      const leftCol = ex.left_column as Array<Record<string, unknown>>;
      const rightCol = ex.right_column as Array<Record<string, unknown>>;
      const pairs = ex.correct_pairs as Array<[number, number]>;
      return {
        type,
        prompt: "Match each Arabic word with its meaning.",
        pairs: pairs.map(([l, r]) => ({ left: leftCol[l].ar as string, right: rightCol[r].en as string })),
        options: rightCol.map((r) => r.en as string),
      };
    }

    if (type === "BUILD_SENTENCE") {
      const tiles = ex.tiles as Array<Record<string, unknown>>;
      const order = ex.correct_order as number[];
      const target = ex.target_translation as Record<string, unknown>;
      const wrongMsg = ex.explanation_on_wrong as Record<string, unknown> | undefined;
      return {
        type,
        prompt: target.en as string,
        options: tiles.map((t) => t.ar as string),
        correctAnswer: order.map((i) => tiles[i].ar as string).join(" "),
        explanation_on_wrong: wrongMsg?.en as string | undefined,
      };
    }

    if (type === "FILL_BLANK") {
      const hint = ex.hint as Record<string, unknown>;
      const options = ex.options as Array<Record<string, unknown>> | undefined;
      const correctAnswer = ex.correct_answer as Record<string, unknown>;
      return {
        type,
        prompt: hint.en as string,
        arabicText: ex.sentence_ar as string,
        options: (options ?? []).map((o) => o.ar as string),
        correctAnswer: correctAnswer.ar as string,
      };
    }

    if (type === "TRUE_FALSE") {
      const statement = ex.statement as Record<string, unknown>;
      const arExample = statement.ar_example as Record<string, unknown> | undefined;
      const correct = ex.correct_answer as boolean;
      const wrongMsg = ex.explanation_on_wrong as Record<string, unknown> | undefined;
      return {
        type,
        prompt: statement.en as string,
        arabicText: arExample?.ar as string | undefined,
        options: ["True", "False"],
        correctAnswer: correct ? "True" : "False",
        explanation_on_wrong: wrongMsg?.en as string | undefined,
      };
    }

    if (type === "GRAMMAR_PARSE") {
      const words = ex.words as Array<Record<string, unknown>>;
      const roles = ex.correct_roles as string[];
      return {
        type,
        parseTokens: words.map((w, i) => ({ word: w.ar as string, label: roles[i], gloss: w.en as string })),
        labels: ex.available_roles as string[],
      };
    }

    // Pass through any unhandled exercise types as-is
    return ex;
  });

  // Build revealAyah: highlight the first indexed word
  let mappedRevealAyah = null;
  let revealText: string | null = null;
  if (reveal && revealAyah) {
    const ayahWords = (revealAyah.ar as string).split(" ");
    const firstHighlight = highlightedIndices?.[0] ?? 0;
    mappedRevealAyah = {
      ayahAr: revealAyah.ar as string,
      ayahRef: revealAyah.label as string,
      highlightedWord: ayahWords[firstHighlight] ?? "",
    };
    const explanation = reveal.noor_explanation as Record<string, unknown> | undefined;
    revealText = explanation?.en as string ?? null;
  }

  // Template → legacy type that drives the lesson player routing:
  // STANDARD / REVIEW / VERB_PATTERN → "VOCABULARY" (triggers 5-beat flow)
  // SPOKEN_PHRASES → "SPOKEN_PHRASES"
  const legacyType = template === "SPOKEN_PHRASES" ? "SPOKEN_PHRASES" : "VOCABULARY";

  return {
    hook: mappedHook,
    discoverCards: mappedCards,
    exercises: mappedExercises,
    revealText,
    revealAyah: mappedRevealAyah,
    type: legacyType,
  };
}

export async function GET(request: Request, { params }: Props) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, titleAr: true, template: true, xpReward: true, content: true, chapterId: true },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
  }

  const [{ chapterStateById }, user] = await Promise.all([
    getUserCourseState(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { trialStartAt: true, trialExpiresAt: true, subscriptionStatus: true, subscriptionActiveUntil: true, subscriptionProductId: true, noorOverageBalance: true },
    }),
  ]);

  if (chapterStateById.get(lesson.chapterId)?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  if (user && requiresSubscription(getSubscriptionState(user))) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  const progress = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
  const progressStatus = progress?.status || (progress?.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED);

  const transformed = transformContent(lesson.template, lesson.content as Record<string, unknown>);

  return NextResponse.json({
    data: {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        titleAr: lesson.titleAr,
        xpReward: lesson.xpReward,
        template: lesson.template,
        ...transformed,
        isCompleted: progressStatus === PROGRESS_STATUS.COMPLETED,
        isSkippedByPlacement: progressStatus === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT,
      },
    },
  });
}
