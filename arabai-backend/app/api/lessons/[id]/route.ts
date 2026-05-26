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
  const spokenPhrases = content.spoken_phrases as Record<string, unknown> | undefined;

  function getWrongExplanation(ex: Record<string, unknown>) {
    const wrongMsg = ex.explanation_on_wrong as Record<string, unknown> | undefined;
    const explObj = ex.explanation as Record<string, unknown> | undefined;
    return (wrongMsg?.en ?? explObj?.en) as string | undefined;
  }

  const mappedHook = ayah
    ? {
        ayahAr: ayah.ar as string,
        ayahRef: ayah.label as string,
        question: noorIntro?.en as string | undefined,
      }
    : null;

  const mappedCards = (discoverCards ?? []).map((card) => {
    const cardType = card.type as string | undefined;
    const text = card.text as Record<string, unknown> | undefined;
    const concept = card.concept as Record<string, unknown> | undefined;
    const explanation = card.explanation as Record<string, unknown> | undefined;
    const examples = card.examples as Array<Record<string, unknown>> | undefined;
    // GRAMMAR_NOTE cards use title/body instead of text/concept
    const titleObj = card.title as Record<string, unknown> | undefined;
    const bodyObj = card.body as Record<string, unknown> | undefined;
    // SENTENCE cards use text directly
    const sentenceText = card.text as Record<string, unknown> | undefined;
    if (cardType === "GRAMMAR_NOTE") {
      return {
        arabicText: titleObj?.ar as string | undefined,
        translation: titleObj?.en as string | undefined,
        transliteration: undefined,
        explanation: bodyObj?.en as string | undefined,
      };
    }
    if (cardType === "SENTENCE") {
      return {
        arabicText: sentenceText?.ar as string | undefined,
        translation: sentenceText?.en as string | undefined,
        transliteration: sentenceText?.translit as string | undefined,
        explanation: undefined,
      };
    }
    // CONCEPT cards have no "text" — fall back to concept.ar / concept.en
    const arabicText = (text?.ar ?? concept?.ar) as string | undefined;
    const translation = (text?.en ?? concept?.en) as string | undefined;
    // For CONCEPT cards, append the first example to give learners context
    const exampleLine = !text && examples?.[0]
      ? `${examples[0].ar as string} — ${examples[0].en as string}`
      : undefined;
    return {
      arabicText,
      translation,
      transliteration: (text?.translit) as string | undefined,
      explanation: (explanation?.en ?? exampleLine) as string | undefined,
    };
  });

  const mappedExercises = (rawExercises ?? []).map((ex) => {
    const type = ex.type as string;

    if (type === "TAP_TRANSLATION") {
      const prompt = ex.prompt as Record<string, unknown>;
      const explanationOnWrong = getWrongExplanation(ex);
      // Schema v1 (Ch1/Ch2): options = [{en, ur}], correct_index = int
      const optionsV1 = ex.options as Array<Record<string, unknown>> | undefined;
      const correctIndex = ex.correct_index as number | undefined;
      // Schema v2 (Ch3): choices = [string], answer = string
      const choicesV2 = ex.choices as string[] | undefined;
      const answerV2 = ex.answer as string | undefined;
      let options: string[];
      let correctAnswer: string;
      const direction = ex.direction as string | undefined;
      if (optionsV1 && correctIndex !== undefined) {
        options = optionsV1.map((o) => o.en as string);
        correctAnswer = optionsV1[correctIndex].en as string;
      } else {
        options = choicesV2 ?? [];
        correctAnswer = answerV2 ?? "";
      }
      // en_to_ar: English prompt, Arabic choices — show the English as the question
      if (direction === "en_to_ar") {
        const promptEn = prompt.en as string | undefined;
        return {
          type,
          prompt: promptEn ? `Which Arabic means: "${promptEn}"?` : "Choose the correct Arabic.",
          arabicText: undefined,
          options,
          correctAnswer,
          explanation_on_wrong: explanationOnWrong,
        };
      }
      return {
        type,
        prompt: "What does this Arabic mean?",
        arabicText: prompt.ar as string | undefined,
        options,
        correctAnswer,
        explanation_on_wrong: explanationOnWrong,
      };
    }

    if (type === "MATCHING") {
      const explanationOnWrong = getWrongExplanation(ex);
      // Schema v1 (Ch1/Ch2): left_column, right_column, correct_pairs
      const leftCol = ex.left_column as Array<Record<string, unknown>> | undefined;
      const rightCol = ex.right_column as Array<Record<string, unknown>> | undefined;
      const correctPairs = ex.correct_pairs as Array<[number, number]> | undefined;
      // Schema v2 (Ch3): pairs = [{ar, en}]
      const pairsV2 = ex.pairs as Array<Record<string, unknown>> | undefined;
      if (leftCol && rightCol && correctPairs) {
        return {
          type,
          prompt: "Match each Arabic word with its meaning.",
          pairs: correctPairs.map(([l, r]) => ({ left: leftCol[l].ar as string, right: rightCol[r].en as string })),
          options: rightCol.map((r) => r.en as string),
          explanation_on_wrong: explanationOnWrong,
        };
      } else if (pairsV2) {
        return {
          type,
          prompt: "Match each Arabic word with its meaning.",
          pairs: pairsV2.map((p) => ({ left: p.ar as string, right: p.en as string })),
          options: pairsV2.map((p) => p.en as string),
          explanation_on_wrong: explanationOnWrong,
        };
      }
      return ex;
    }

    if (type === "BUILD_SENTENCE") {
      const explanationOnWrong = getWrongExplanation(ex);
      // Schema v1 (Ch1/Ch2): tiles = [{ar,...}], correct_order = [int], target_translation
      const tiles = ex.tiles as Array<Record<string, unknown>> | undefined;
      const order = ex.correct_order as number[] | undefined;
      const target = ex.target_translation as Record<string, unknown> | undefined;
      // Schema v2 (Ch3): word_bank = [string], answer = [string], instruction
      const wordBank = ex.word_bank as string[] | undefined;
      const answerArr = ex.answer as string[] | undefined;
      const instruction = ex.instruction as Record<string, unknown> | undefined;
      if (tiles && order && target) {
        return {
          type,
          prompt: target.en as string,
          options: tiles.map((t) => t.ar as string),
          correctAnswer: order.map((i) => tiles[i].ar as string).join(" "),
          explanation_on_wrong: explanationOnWrong,
        };
      } else if (wordBank && answerArr) {
        return {
          type,
          prompt: instruction?.en as string ?? "Build the sentence.",
          options: wordBank,
          correctAnswer: answerArr.join(" "),
          explanation_on_wrong: explanationOnWrong,
        };
      }
      return ex;
    }

    if (type === "FILL_BLANK") {
      const explanationOnWrong = getWrongExplanation(ex);
      // Schema v1 (Ch1/Ch2): hint, sentence_ar, options = [{ar,...}], correct_answer = {ar,...}
      const hint = ex.hint as Record<string, unknown> | undefined;
      const optionsV1 = ex.options as Array<Record<string, unknown>> | undefined;
      const correctAnswerV1 = ex.correct_answer as Record<string, unknown> | undefined;
      // Schema v2 (Ch3): template = {en}, blank_label = {en}, answer = string, choices = [string]
      const template = ex.template as Record<string, unknown> | undefined;
      const blankLabel = ex.blank_label as Record<string, unknown> | undefined;
      const answerV2 = ex.answer as string | undefined;
      const choicesV2 = ex.choices as string[] | undefined;
      if (hint && optionsV1 && correctAnswerV1) {
        return {
          type,
          prompt: hint.en as string,
          arabicText: ex.sentence_ar as string,
          options: optionsV1.map((o) => o.ar as string),
          correctAnswer: correctAnswerV1.ar as string,
          explanation_on_wrong: explanationOnWrong,
        };
      } else if (template || blankLabel) {
        const templateEn = template?.en as string ?? "";
        const eqIdx = templateEn.indexOf(" = ");
        const arabicPart = eqIdx > 0 ? templateEn.slice(0, eqIdx) : templateEn;
        const hintPart = eqIdx > 0 ? templateEn.slice(eqIdx + 3) : (blankLabel?.en as string ?? "");
        return {
          type,
          prompt: hintPart,
          arabicText: arabicPart,
          options: choicesV2 ?? [],
          correctAnswer: answerV2 ?? "",
          explanation_on_wrong: explanationOnWrong,
        };
      }
      return ex;
    }

    if (type === "TRUE_FALSE") {
      const statement = ex.statement as Record<string, unknown>;
      const arExample = statement.ar_example as Record<string, unknown> | undefined;
      // Schema v1 uses correct_answer; schema v2 uses answer
      const correct = (ex.correct_answer ?? ex.answer) as boolean;
      return {
        type,
        prompt: statement.en as string,
        arabicText: arExample?.ar as string | undefined,
        options: ["True", "False"],
        correctAnswer: correct ? "True" : "False",
        explanation_on_wrong: getWrongExplanation(ex),
      };
    }

    if (type === "GRAMMAR_PARSE") {
      const words = ex.words as Array<Record<string, unknown>>;
      const roles = ex.correct_roles as string[];
      return {
        type,
        parseTokens: words.map((w, i) => ({ word: w.ar as string, label: roles[i], gloss: w.en as string })),
        labels: ex.available_roles as string[],
        explanation_on_wrong: getWrongExplanation(ex),
      };
    }

    // Pass through any unhandled exercise types while normalizing the wrong-answer explanation.
    return {
      ...ex,
      explanation_on_wrong: getWrongExplanation(ex),
    };
  });

  // Build revealAyah with all indexed highlights while preserving the legacy first-word field.
  let mappedRevealAyah = null;
  let revealText: string | null = null;
  if (reveal && revealAyah) {
    const ayahWords = (revealAyah.ar as string).split(" ");
    const highlightIndices = highlightedIndices ?? [];
    const highlightedWords = highlightIndices.map((index) => ayahWords[index]).filter(Boolean);
    mappedRevealAyah = {
      ayahAr: revealAyah.ar as string,
      ayahRef: revealAyah.label as string,
      highlightedWord: highlightedWords[0] ?? "",
      highlightedWords,
      highlightedWordIndices: highlightIndices,
    };
    const explanation = (reveal.noor_explanation ?? reveal.noor_comment) as Record<string, unknown> | undefined;
    revealText = explanation?.en as string ?? null;
  }

  // Template → legacy type that drives the lesson player routing:
  // STANDARD / REVIEW / VERB_PATTERN → "VOCABULARY" (triggers 5-beat flow)
  // SPOKEN_PHRASES → "SPOKEN_PHRASES"
  const legacyType = template === "SPOKEN_PHRASES" ? "SPOKEN_PHRASES" : "VOCABULARY";

  const schemaSpokenPhraseRows = spokenPhrases?.phrases as Record<string, unknown>[] | undefined;
  const schemaPhraseById = new Map(
    (schemaSpokenPhraseRows ?? []).map((row) => {
      const phrase = row.phrase as Record<string, unknown> | undefined;
      return [row.id as string, phrase];
    })
  );
  const mappedSchemaPhrases = (schemaSpokenPhraseRows ?? []).map((row) => {
    const phrase = row.phrase as Record<string, unknown> | undefined;
    const translation = phrase?.en as string | undefined;
    return {
      arabic: phrase?.ar as string | undefined,
      transliteration: phrase?.translit as string | undefined,
      translation,
      recognitionOptions: translation ? [translation] : [],
    };
  });
  const schemaDialogue = spokenPhrases?.dialogue as Record<string, unknown>[] | undefined;
  const mappedSchemaDialogue = (schemaDialogue ?? []).map((line) => {
    const phrase = schemaPhraseById.get(line.phrase_id as string);
    return {
      speaker: line.speaker as string | undefined,
      line: phrase?.ar as string | undefined,
      translation: phrase?.en as string | undefined,
    };
  });

  const mappedSpokenContent = template === "SPOKEN_PHRASES"
    ? {
        contextTitle: (content.contextTitle ?? (spokenPhrases?.scene as Record<string, unknown> | undefined)?.ar) as string | undefined,
        contextTitleEn: (content.contextTitleEn ?? (spokenPhrases?.scene as Record<string, unknown> | undefined)?.en) as string | undefined,
        contextBody: content.contextBody as string | undefined,
        phrases: (content.phrases as Record<string, unknown>[] | undefined) ?? mappedSchemaPhrases,
        dialogue: (content.dialogue as Record<string, unknown>[] | undefined) ?? mappedSchemaDialogue,
      }
    : undefined;

  return {
    hook: mappedHook,
    discoverCards: mappedCards,
    exercises: mappedExercises,
    revealText,
    revealAyah: mappedRevealAyah,
    type: legacyType,
    content: mappedSpokenContent,
  };
}

export async function GET(request: Request, { params }: Props) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, titleAr: true, template: true, xpReward: true, content: true, chapterId: true, chapter: { select: { order: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
  }

  const [{ chapterStateById }, user] = await Promise.all([
    getUserCourseState(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, trialStartAt: true, trialExpiresAt: true, subscriptionStatus: true, subscriptionActiveUntil: true, subscriptionProductId: true, noorOverageBalance: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  if (chapterStateById.get(lesson.chapterId)?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  const isChapterOneFree = lesson.chapter?.order === 1;
  if (!isChapterOneFree && user && requiresSubscription(getSubscriptionState(user))) {
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
