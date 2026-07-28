import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";

interface Props {
  params: { id: string };
}

const issueUpdateSchema = z.object({
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]).optional(),
  note: z.string().trim().min(1).max(4000).optional(),
});

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = issueUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "Invalid issue payload.", code: "invalid_input", details: parsed.success ? undefined : parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.contentReviewIssue.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Review issue not found.", code: "not_found" }, { status: 404 });
  }

  const status = parsed.data.status;
  const issue = await prisma.contentReviewIssue.update({
    where: { id: params.id },
    data: {
      ...(status ? { status, resolvedAt: status === "OPEN" ? null : new Date() } : {}),
      ...(parsed.data.note ? { note: parsed.data.note } : {}),
    },
  });

  return NextResponse.json({
    data: {
      issue: {
        ...issue,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        resolvedAt: issue.resolvedAt?.toISOString() ?? null,
      },
    },
  });
}
