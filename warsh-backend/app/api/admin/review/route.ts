import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { reviewSummaries } from "../../../../lib/lessonReview";

export const dynamic = "force-dynamic";

// GET /api/admin/review — review status and remaining automatic problems for
// every lesson. Loaded after the Studio curriculum renders, because it reads
// every lesson's content.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  return NextResponse.json({ data: { lessons: await reviewSummaries() } });
}
