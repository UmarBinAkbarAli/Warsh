import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../../lib/auth";
import { assertCoreSetAccess, coreCompletionSummary, Core500Error } from "../../../../../../lib/core500Session";
import { CORE_SET_COUNT } from "../../../../../../lib/core500";

interface Props {
  params: { setNumber: string };
}

const completeSchema = z.object({
  knownWordIds: z.array(z.string().min(1)).max(50),
});

/**
 * Legacy completion endpoint, kept only so builds that predate the set test
 * get a clear answer instead of a 404.
 *
 * A set now completes only by passing its five-word test
 * (`POST .../assessment`). Self-reported "I know it" taps are no longer
 * accepted: they would skip the test, grant coverage and advance the streak.
 * For a set that is already complete this is a read-only summary.
 */
export async function POST(request: Request, { params }: Props) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const setNumber = Number(params.setNumber);
  if (!/^\d+$/.test(params.setNumber) || !Number.isInteger(setNumber) || setNumber < 1 || setNumber > CORE_SET_COUNT) {
    return NextResponse.json(
      { error: "That set does not exist.", code: "set_not_found" },
      { status: 404 },
    );
  }

  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "knownWordIds is required.", code: "bad_request" },
      { status: 400 },
    );
  }

  const setWordCount = await prisma.vocabularyWord.count({
    where: { coreSetNumber: setNumber, status: "PUBLISHED" },
  });
  if (setWordCount === 0) {
    return NextResponse.json(
      { error: "That set does not exist.", code: "set_not_found" },
      { status: 404 },
    );
  }

  try {
    await assertCoreSetAccess(userId, setNumber);
  } catch (err) {
    if (err instanceof Core500Error) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    throw err;
  }

  const summary = await coreCompletionSummary(userId, setNumber);
  if (!summary.completed) {
    return NextResponse.json(
      { error: "Update Warsh to take this set's test. A set completes when the test is passed.", code: "test_required" },
      { status: 409 },
    );
  }

  return NextResponse.json({
    data: {
      setNumber,
      completed: true,
      knownCount: summary.knownCount,
      coveragePercent: summary.coveragePercent,
      currentStreak: summary.currentStreak,
      streakAdvanced: false,
    },
  });
}
