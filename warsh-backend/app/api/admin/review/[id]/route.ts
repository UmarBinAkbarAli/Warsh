import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";
import { AUTO_CHECK_ISSUE, loadDismissedKeys, loadVocabIntros, remainingProblems } from "../../../../../lib/lessonReview";

interface Props {
  params: { id: string };
}

const statusSchema = z.object({
  status: z.enum(["NOT_REVIEWED", "NEEDS_CORRECTION", "APPROVED"]),
});

// GET /api/admin/review/[id] — what the lesson editor needs to run the checks
// live: the review status, dismissed problem keys and the curriculum's
// introduced words.
export async function GET(request: Request, { params }: Props) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const [review, dismissed, intros] = await Promise.all([
    prisma.lessonContentReview.findUnique({ where: { lessonId: params.id }, select: { status: true, reviewedAt: true } }),
    loadDismissedKeys([params.id]),
    loadVocabIntros(),
  ]);

  return NextResponse.json({
    data: {
      status: review?.status ?? "NOT_REVIEWED",
      reviewedAt: review?.reviewedAt?.toISOString() ?? null,
      dismissed: [...(dismissed.get(params.id) ?? [])],
      intros,
    },
  });
}

// PATCH /api/admin/review/[id] — set the review status. Approving is refused
// while automatic problems or open review issues remain.
export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review status.", code: "invalid_input" }, { status: 400 });
  }
  const { status } = parsed.data;

  if (status === "APPROVED") {
    const problems = await remainingProblems(params.id);
    if (!problems) {
      return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
    }
    if (problems.length > 0) {
      return NextResponse.json(
        { error: `Fix or dismiss the ${problems.length} remaining problem${problems.length === 1 ? "" : "s"} first.`, code: "lesson_problems" },
        { status: 409 },
      );
    }
    const openIssues = await prisma.contentReviewIssue.count({
      where: { review: { lessonId: params.id }, status: "OPEN", issueType: { not: AUTO_CHECK_ISSUE } },
    });
    if (openIssues > 0) {
      return NextResponse.json(
        { error: "Resolve the open review issues on this lesson first.", code: "open_review_issues" },
        { status: 409 },
      );
    }
  }

  const reviewedAt = status === "NOT_REVIEWED" ? null : new Date();
  const review = await prisma.lessonContentReview.upsert({
    where: { lessonId: params.id },
    create: { lessonId: params.id, status, reviewedAt },
    update: { status, reviewedAt },
    select: { status: true, reviewedAt: true },
  });

  return NextResponse.json({ data: { status: review.status, reviewedAt: review.reviewedAt?.toISOString() ?? null } });
}
