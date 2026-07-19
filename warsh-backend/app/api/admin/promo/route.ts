import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

const createSchema = z.object({
  code: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/, "Code may contain letters, numbers, - and _ only."),
  freeDays: z.number().int().min(1).max(3650),
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
});

// GET /api/admin/promo — list all promo codes with stats.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    data: codes.map((c) => ({
      id: c.id,
      code: c.code,
      freeDays: c.freeDays,
      maxRedemptions: c.maxRedemptions,
      redemptionCount: c.redemptionCount,
      active: c.active,
      expiresAt: c.expiresAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

// POST /api/admin/promo — create a code.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid promo payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const code = parsed.data.code.toUpperCase();
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: `Code "${code}" already exists.`, code: "duplicate_code" }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      freeDays: parsed.data.freeDays,
      maxRedemptions: parsed.data.maxRedemptions ?? null,
      active: parsed.data.active,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return NextResponse.json({ data: { promo } }, { status: 201 });
}
