import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { toPublicPost } from "../../../lib/blog";

export const dynamic = "force-dynamic";

// Public list of published posts, consumed by warsh-site's /blog index with ISR.
// No auth: this is the same content anyone can read on warsh.app. Bodies are
// included so the site can also pre-render post pages from a single request.
export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    { data: { posts: posts.map(toPublicPost) } },
    {
      headers: {
        // Public content, safe to share cross-origin, and cheap to serve stale
        // while the site's ISR revalidation catches up.
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
