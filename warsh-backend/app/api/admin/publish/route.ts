import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

// Centralized publish/unpublish for every admin-authored content type. Keeping
// this in one place means the DRAFT/PUBLISHED semantics (and publishedAt
// stamping) live in exactly one spot rather than being duplicated across each
// content type's PATCH handler.
const schema = z.object({
  type: z.enum(["chapter", "lesson", "vocabulary", "tadabbur", "achievement"]),
  id: z.string().trim().min(1),
  action: z.enum(["publish", "unpublish"]),
  // Chapters only: also apply the same action to every lesson in the chapter,
  // so an author can take a whole chapter live (or dark) in one click.
  cascadeLessons: z.boolean().optional(),
});

// Maps each content type to its Prisma delegate. All five models share the
// `status` / `publishedAt` shape added by the add_content_status migration.
const DELEGATES = {
  chapter: () => prisma.chapter,
  lesson: () => prisma.lesson,
  vocabulary: () => prisma.vocabularyWord,
  tadabbur: () => prisma.tadabburSurah,
  achievement: () => prisma.achievement,
} as const;

export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid publish payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { type, id, action, cascadeLessons } = parsed.data;
  const publish = action === "publish";
  // Stamp publishedAt the moment content first goes live; leave it in place on
  // unpublish so it records when the item was last live.
  const data = publish
    ? { status: "PUBLISHED" as const, publishedAt: new Date() }
    : { status: "DRAFT" as const };

  // Each Prisma delegate has a distinct generic type, so the union can't be
  // called directly — narrow to the minimal read/write shape we use here.
  const delegate = DELEGATES[type]() as unknown as {
    findUnique: (args: { where: { id: string }; select: { id: true } }) => Promise<{ id: string } | null>;
    update: (args: { where: { id: string }; data: typeof data }) => Promise<unknown>;
  };

  const existing = await delegate.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: `${type} not found.`, code: "not_found" }, { status: 404 });
  }

  if (type === "chapter" && cascadeLessons) {
    const [, lessonResult] = await prisma.$transaction([
      prisma.chapter.update({ where: { id }, data }),
      prisma.lesson.updateMany({ where: { chapterId: id }, data }),
    ]);
    return NextResponse.json({
      data: { ok: true, status: data.status, cascadedLessons: lessonResult.count },
    });
  }

  await delegate.update({ where: { id }, data });
  return NextResponse.json({ data: { ok: true, status: data.status } });
}
