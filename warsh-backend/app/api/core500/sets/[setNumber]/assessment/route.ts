import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "../../../../../../lib/auth";
import { actOnCoreAssessment, Core500Error, readCoreAssessment } from "../../../../../../lib/core500Session";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), language: z.enum(["en", "ur"]), restart: z.boolean().optional() }).strict(),
  z.object({ action: z.literal("answer"), questionId: z.string().uuid(), optionId: z.string().uuid(), round: z.number().int().positive() }).strict(),
  z.object({ action: z.literal("retry"), round: z.number().int().positive() }).strict(),
]);
type Context = { params: { setNumber: string } };
async function handle(request: Request, context: Context, write: boolean) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  const n = Number(context.params.setNumber);
  if (!/^\d+$/.test(context.params.setNumber) || !Number.isInteger(n) || n < 1 || n > 100) {
    return NextResponse.json({ error: "That set does not exist.", code: "set_not_found" }, { status: 404 });
  }
  try {
    if (!write) return NextResponse.json({ data: await readCoreAssessment(userId, n) });
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid test request.", code: "bad_request" }, { status: 400 });
    return NextResponse.json({ data: await actOnCoreAssessment(userId, n, parsed.data) });
  } catch (err) {
    if (err instanceof Core500Error) return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    throw err;
  }
}
export const GET = (request: Request, context: Context) => handle(request, context, false);
export const POST = (request: Request, context: Context) => handle(request, context, true);
