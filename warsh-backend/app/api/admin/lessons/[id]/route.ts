import { NextResponse } from "next/server";
import { LessonTemplate } from "@prisma/client";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

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

const lessonSchema = z.object({
  title: z.string().trim().min(1).max(140),
  titleAr: z.string().trim().min(1).max(140),
  template: z.nativeEnum(LessonTemplate),
  xpReward: z.number().int().min(0).max(500),
  content: jsonValueSchema.refine((value) => value !== null, "Content cannot be null."),
});

interface Props {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = lessonSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lesson payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lesson = await prisma.lesson.update({
    where: { id: params.id },
    data: parsed.data as any,
  });

  return NextResponse.json({ data: { lesson } });
}
