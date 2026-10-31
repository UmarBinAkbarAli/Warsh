import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";
import { AUTO_CHECK_ISSUE } from "../../../../../../lib/lessonReview";

interface Props {
  params: { id: string };
}

const dismissSchema = z.object({
  key: z.string().trim().min(1).max(600),
  where: z.string().trim().min(1).max(240),
  text: z.string().trim().min(1).max(4000),
});

// POST /api/admin/review/[id]/dismiss — the owner decided an automatic problem
// is not a problem for this lesson. Kept until the owner restores it.
export async function POST(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = dismissSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid dismiss payload.", code: "invalid_input" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }

  const review = await prisma.lessonContentReview.upsert({
    where: { lessonId: params.id },
    create: { lessonId: params.id },
    update: {},
    select: { id: true },
  });
  const existing = await prisma.contentReviewIssue.findFirst({
    where: { reviewId: review.id, issueType: AUTO_CHECK_ISSUE, blockPath: parsed.data.key },
    select: { id: true },
  });
  const now = new Date();
  if (existing) {
    await prisma.contentReviewIssue.update({ where: { id: existing.id }, data: { status: "DISMISSED", resolvedAt: now } });
  } else {
    await prisma.contentReviewIssue.create({
      data: {
        reviewId: review.id,
        issueType: AUTO_CHECK_ISSUE,
        blockPath: parsed.data.key,
        blockLabel: parsed.data.where,
        note: parsed.data.text,
        status: "DISMISSED",
        resolvedAt: now,
      },
    });
  }
  return NextResponse.json({ data: { key: parsed.data.key, dismissed: true } });
}

// DELETE /api/admin/review/[id]/dismiss?key=… — bring a dismissed problem back.
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const key = new URL(request.url).searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key.", code: "invalid_input" }, { status: 400 });
  }
  await prisma.contentReviewIssue.deleteMany({
    where: { review: { lessonId: params.id }, issueType: AUTO_CHECK_ISSUE, blockPath: key },
  });
  return NextResponse.json({ data: { key, dismissed: false } });
}
