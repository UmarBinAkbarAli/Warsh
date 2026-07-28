import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const issueTypes = [
  "ARABIC_INCORRECT",
  "TRANSLATION_INCORRECT",
  "ANSWER_INCORRECT",
  "INSTRUCTION_UNCLEAR",
  "DUPLICATE_CONTENT",
  "MISSING_CONTENT",
  "FORMATTING_DISPLAY",
  "WRONG_IMAGE",
  "IMAGE_QUALITY",
  "IMAGE_MISSING_BROKEN",
  "WRONG_PRONUNCIATION",
  "AUDIO_UNCLEAR",
  "AUDIO_MISMATCH",
  "AUDIO_MISSING_BROKEN",
  "AUDIO_TIMING",
  "OTHER",
] as const;

const issueCreateSchema = z.object({
  lessonId: z.string().min(1).max(100),
  blockPath: z.string().trim().min(1).max(600),
  blockLabel: z.string().trim().min(1).max(240),
  issueType: z.enum(issueTypes),
  note: z.string().trim().min(1).max(4000),
  mediaUrl: z.string().trim().max(1500).nullable().optional(),
});

export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = issueCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid issue payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    select: { id: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }

  const review = await prisma.lessonContentReview.upsert({
    where: { lessonId: parsed.data.lessonId },
    create: {
      lessonId: parsed.data.lessonId,
      status: "NEEDS_CORRECTION",
      reviewedAt: new Date(),
    },
    update: {
      status: "NEEDS_CORRECTION",
      reviewedAt: new Date(),
    },
  });

  const issue = await prisma.contentReviewIssue.create({
    data: {
      reviewId: review.id,
      blockPath: parsed.data.blockPath,
      blockLabel: parsed.data.blockLabel,
      issueType: parsed.data.issueType,
      note: parsed.data.note,
      mediaUrl: parsed.data.mediaUrl || null,
    },
  });

  return NextResponse.json(
    {
      data: {
        issue: {
          ...issue,
          createdAt: issue.createdAt.toISOString(),
          updatedAt: issue.updatedAt.toISOString(),
          resolvedAt: null,
        },
      },
    },
    { status: 201 },
  );
}
