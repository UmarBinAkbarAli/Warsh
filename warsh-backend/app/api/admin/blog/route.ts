import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import { estimateReadingMinutes, slugifyTitle } from "../../../../lib/blog";
import { sanitizeBlogHtml } from "../../../../lib/blogSanitize";

const blogPostSchema = z.object({
  // Blank slug means "derive it from the title" — the common case when writing
  // a new post in the dashboard.
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, "Slug may contain only lowercase letters, numbers, and hyphens.").optional(),
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().min(1).max(400),
  body: z.string().trim().min(1).max(60000),
  coverImageUrl: z.string().trim().url().max(500).nullable().optional(),
  authorName: z.string().trim().min(1).max(80).optional(),
  // Blank means "recalculate from the body".
  readingMinutes: z.number().int().min(1).max(120).nullable().optional(),
});

// GET /api/admin/blog — list every post, newest first. Bodies are omitted so the
// list stays light; the editor fetches the full record via /api/admin/blog/[id].
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      authorName: true,
      readingMinutes: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data: posts });
}

// POST /api/admin/blog — create a post. New posts start as DRAFT (schema
// default) and stay off warsh.app until published via /api/admin/publish.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = blogPostSchema.safeParse(await request.json().catch(() => null));
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

  const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: `Slug "${slug}" is already used.`, code: "duplicate_slug" }, { status: 409 });
  }

  const body = sanitizeBlogHtml(parsed.data.body);
  const post = await prisma.blogPost.create({
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

  return NextResponse.json({ data: { post } }, { status: 201 });
}
