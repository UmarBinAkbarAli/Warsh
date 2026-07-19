import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";
import { LessonContentSchema } from "../../../../../lib/content-schema";

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

const lessonUpdateSchema = z.object({
  title: z.string().trim().min(1).max(140),
  titleAr: z.string().trim().min(1).max(140),
  template: z.enum(["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"]),
  xpReward: z.number().int().min(0).max(500),
  content: jsonValueSchema.refine((v: unknown) => v !== null, "Content cannot be null."),
  updatedAt: z.number().int().positive(), // Unix ms — required for optimistic concurrency
});

interface Props {
  params: { id: string };
}

// GET /api/admin/lessons/[id] — fetch a single lesson's full content on demand
// (the curriculum editor loads content lazily rather than all lessons at once).
export async function GET(request: Request, { params }: Props) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, order: true, title: true, titleAr: true, template: true, xpReward: true, updatedAt: true, content: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ data: { lesson: { ...lesson, updatedAt: lesson.updatedAt.toISOString() } } });
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const body = await request.json();
  const parsed = lessonUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid lesson payload.",
        code: "invalid_input",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { content, updatedAt: clientUpdatedAt, ...meta } = parsed.data;

  // --- Optimistic concurrency ---
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { updatedAt: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }
  const serverMs = lesson.updatedAt.getTime();
  if (Math.abs(serverMs - clientUpdatedAt) > 1000) {
    // > 1s drift tolerance
    return NextResponse.json(
      {
        error: "This lesson was changed by another author. Please re-open and re-apply your edits.",
        code: "conflict",
        serverUpdatedAt: serverMs,
      },
      { status: 409 },
    );
  }

  // --- Schema validation of content field ---
  const contentParse = LessonContentSchema.safeParse(content);
  if (!contentParse.success) {
    return NextResponse.json(
      {
        error: "Invalid lesson content.",
        code: "schema_error",
        details: contentParse.error.flatten(),
      },
      { status: 400 },
    );
  }

  // --- Exercise ID uniqueness across the entire curriculum ---
  // An ID collides only if it (a) exists in another lesson AND (b) is new to this save.
  // Unchanged own IDs are always permitted (re-saves are no-ops for existing IDs).
  const payloadContent = content as Record<string, unknown>;
  const payloadExercises = payloadContent?.exercises as Array<{ id?: string }> | undefined;
  const payloadIds = payloadExercises?.map((ex) => ex.id).filter(Boolean) as string[] | undefined;

  if (payloadIds && payloadIds.length > 0) {
    // Detect within-payload duplicates (author error)
    const payloadIdSet = new Set<string>();
    for (const id of payloadIds) {
      if (payloadIdSet.has(id)) {
        return NextResponse.json(
          {
            error: "Duplicate exercise ID within this lesson.",
            code: "duplicate_exercise_id",
            details: [{ path: "exercises[?].id", message: `ID "${id}" appears more than once in this lesson.` }],
          },
          { status: 400 },
        );
      }
      payloadIdSet.add(id);
    }

    // Build global ID set from all OTHER lessons (skip self)
    const otherLessons = await prisma.lesson.findMany({
      where: { id: { not: params.id } },
      select: { id: true, content: true },
    });

    const globalIds = new Set<string>();
    for (const lesson of otherLessons) {
      const c = lesson.content as Record<string, unknown>;
      const exArr = c?.exercises as Array<{ id?: string }> | undefined;
      if (Array.isArray(exArr)) {
        for (const ex of exArr) {
          if (ex.id) globalIds.add(ex.id);
        }
      }
    }

    // Block only if ID exists in another lesson (truly new to this curriculum position)
    for (const id of payloadIds) {
      if (globalIds.has(id)) {
        return NextResponse.json(
          {
            error: "Exercise ID collision.",
            code: "exercise_id_collision",
            details: [
              {
                path: "exercises[?].id",
                message: `Exercise id "${id}" is already used in another lesson. Use a different ID or duplicate from the source lesson.`,
              },
            ],
          },
          { status: 400 },
        );
      }
    }
  }

  // --- Persist ---
  const updated = await prisma.lesson.update({
    where: { id: params.id },
    data: { ...meta, content },
  });

  return NextResponse.json({ data: { lesson: updated } });
}
