import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { LessonContentSchema } from "../../../../../lib/content-schema";

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

const validateSchema = z.object({
  content: jsonValueSchema,
});

export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const body = await request.json();
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { content } = parsed.data;

  // Validate against the shared Zod schema
  const result = LessonContentSchema.safeParse(content);
  if (!result.success) {
    return NextResponse.json(
      {
        data: {
          valid: false,
          errors: result.error.flatten(),
        },
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ data: { valid: true, errors: null } });
}
