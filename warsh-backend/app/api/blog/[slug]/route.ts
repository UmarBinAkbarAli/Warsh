import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { toPublicPost } from "../../../../lib/blog";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

// Public single post. Drafts 404 exactly like a slug that never existed, so an
// unpublished post is not discoverable by guessing its URL.
export async function GET(_request: Request, { params }: Props) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found.", code: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    { data: { post: toPublicPost(post) } },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
