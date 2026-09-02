import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { getUserCourseState } from "../../../../../lib/course";

interface Props {
  params: { id: string };
}

// Every media URL a chapter's published lessons reference, flattened.
//
// The app warms a chapter's assets in the background so the learner never waits
// on a download mid-lesson. Doing that from /lessons would mean shipping every
// lesson's full `content` blob to the client just to read a handful of URLs out
// of it — hundreds of KB of exercise text, translations and explanations for
// something that only needs the links. This returns the links alone.
function collectMedia(content: unknown, images: Set<string>, audio: Set<string>) {
  if (!content || typeof content !== "object") return;
  if (Array.isArray(content)) {
    for (const entry of content) collectMedia(entry, images, audio);
    return;
  }
  for (const [key, value] of Object.entries(content)) {
    if (typeof value === "string") {
      // Only absolute URLs are prefetchable. Cards without an explicit URL fall
      // back to the generated audio catalogue, which the player warms itself.
      if (!/^https?:\/\//i.test(value)) continue;
      if (key === "image_url") images.add(value);
      else if (key === "audio_url") audio.add(value);
    } else {
      collectMedia(value, images, audio);
    }
  }
}

export async function GET(request: Request, { params }: Props) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      order: true,
      status: true,
      imageUrl: true,
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { content: true },
      },
    },
  });

  if (!chapter || chapter.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Chapter not found", code: "not_found" }, { status: 404 });
  }

  // A locked chapter's assets are not the client's to warm yet. Mirrors the
  // same gate on /lessons so prefetch cannot be used to read ahead.
  const { chapterStateById } = await getUserCourseState(userId);
  if (chapterStateById.get(params.id)?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  const images = new Set<string>();
  const audio = new Set<string>();
  if (chapter.imageUrl) images.add(chapter.imageUrl);
  for (const lesson of chapter.lessons) collectMedia(lesson.content, images, audio);

  return NextResponse.json({
    data: {
      chapterId: chapter.id,
      order: chapter.order,
      images: [...images],
      audio: [...audio],
    },
  });
}
