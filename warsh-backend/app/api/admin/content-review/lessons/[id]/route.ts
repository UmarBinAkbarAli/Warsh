import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";

interface Props {
  params: { id: string };
}

const reviewUpdateSchema = z.object({
  status: z.enum(["NOT_REVIEWED", "NEEDS_CORRECTION", "APPROVED"]),
  reviewerNote: z.string().trim().max(4000).nullable().optional(),
});

export async function GET(request: Request, { params }: Props) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      order: true,
      title: true,
      titleUr: true,
      titleAr: true,
      template: true,
      xpReward: true,
      content: true,
      status: true,
      updatedAt: true,
      chapter: {
        select: {
          id: true,
          order: true,
          title: true,
          titleUr: true,
          titleAr: true,
          description: true,
          descriptionUr: true,
          imageUrl: true,
        },
      },
      contentReview: {
        select: {
          id: true,
          status: true,
          reviewerNote: true,
          reviewedAt: true,
          updatedAt: true,
          issues: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              blockPath: true,
              blockLabel: true,
              issueType: true,
              note: true,
              mediaUrl: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              resolvedAt: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }

  const review = lesson.contentReview
    ? {
        ...lesson.contentReview,
        reviewedAt: lesson.contentReview.reviewedAt?.toISOString() ?? null,
        updatedAt: lesson.contentReview.updatedAt.toISOString(),
        issues: lesson.contentReview.issues.map((issue) => ({
          ...issue,
          createdAt: issue.createdAt.toISOString(),
          updatedAt: issue.updatedAt.toISOString(),
          resolvedAt: issue.resolvedAt?.toISOString() ?? null,
        })),
      }
    : {
        id: null,
        status: "NOT_REVIEWED" as const,
        reviewerNote: null,
        reviewedAt: null,
        updatedAt: null,
        issues: [],
      };

  return NextResponse.json({
    data: {
      lesson: {
        ...lesson,
        updatedAt: lesson.updatedAt.toISOString(),
        contentReview: undefined,
        review,
      },
    },
  });
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = reviewUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }

  if (parsed.data.status === "APPROVED") {
    const openIssueCount = await prisma.contentReviewIssue.count({
      where: {
        review: { lessonId: params.id },
        status: "OPEN",
      },
    });
    if (openIssueCount > 0) {
      return NextResponse.json(
        {
          error: "Resolve or dismiss every open issue before approving this lesson.",
          code: "open_review_issues",
        },
        { status: 409 },
      );
    }
  }

  const reviewedAt = parsed.data.status === "NOT_REVIEWED" ? null : new Date();
  const review = await prisma.lessonContentReview.upsert({
    where: { lessonId: params.id },
    create: {
      lessonId: params.id,
      status: parsed.data.status,
      reviewerNote: parsed.data.reviewerNote || null,
      reviewedAt,
    },
    update: {
      status: parsed.data.status,
      reviewerNote: parsed.data.reviewerNote || null,
      reviewedAt,
    },
  });

  return NextResponse.json({
    data: {
      review: {
        ...review,
        reviewedAt: review.reviewedAt?.toISOString() ?? null,
        updatedAt: review.updatedAt.toISOString(),
      },
    },
  });
}
