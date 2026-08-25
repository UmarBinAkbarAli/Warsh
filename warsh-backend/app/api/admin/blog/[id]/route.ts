import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";
import { estimateReadingMinutes, slugifyTitle } from "../../../../../lib/blog";
import { sanitizeBlogHtml } from "../../../../../lib/blogSanitize";

const updateSchema = z.object({
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/).optional(),
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().min(1).max(400),
  body: z.string().trim().min(1).max(60000),
  coverImageUrl: z.string().trim().url().max(500).nullable().optional(),
  authorName: z.string().trim().min(1).max(80).optional(),
  readingMinutes: z.number().int().min(1).max(120).nullable().optional(),
});

interface Props {
  params: { id: string };
}

// GET — full record including the body, for the editor.
export async function GET(request: Request, { params }: Props) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Blog post not found.", code: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: { post } });
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid blog post payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const slug = parsed.data.slug?.trim() || slugifyTitle(parsed.data.title);
  if (!slug) {
    return NextResponse.json(
      { error: "Could not derive a slug from that title — enter one manually.", code: "invalid_slug" },
      { status: 400 },
    );
  }

  const clash = await prisma.blogPost.findFirst({
    where: { slug, id: { not: params.id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json({ error: `Slug "${slug}" is already used.`, code: "duplicate_slug" }, { status: 409 });
  }

  const body = sanitizeBlogHtml(parsed.data.body);
  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      body,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      authorName: parsed.data.authorName ?? "Warsh",
      readingMinutes: parsed.data.readingMinutes ?? estimateReadingMinutes(body),
    },
  });

  return NextResponse.json({ data: { post } });
}

// DELETE — blog posts have no user-join rows, so this is a plain delete.
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const found = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!found) {
    return NextResponse.json({ error: "Blog post not found.", code: "not_found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { ok: true } });
}
