import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const updateSchema = z.object({
  code: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/).optional(),
  freeDays: z.number().int().min(1).max(3650).optional(),
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().optional(),
});

interface Props {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid promo payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.promoCode.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Promo code not found.", code: "not_found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.code !== undefined) {
    const code = parsed.data.code.toUpperCase();
    const clash = await prisma.promoCode.findFirst({ where: { code, id: { not: params.id } }, select: { id: true } });
    if (clash) {
      return NextResponse.json({ error: `Code "${code}" already exists.`, code: "duplicate_code" }, { status: 409 });
    }
    data.code = code;
  }
  if (parsed.data.freeDays !== undefined) data.freeDays = parsed.data.freeDays;
  if (parsed.data.maxRedemptions !== undefined) data.maxRedemptions = parsed.data.maxRedemptions;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.expiresAt !== undefined) data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;

  const promo = await prisma.promoCode.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: { promo } });
}

// DELETE — removes the code and its redemption records (PromoRedemption cascades
// on the promoCode relation).
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const existing = await prisma.promoCode.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Promo code not found.", code: "not_found" }, { status: 404 });
  }

  await prisma.promoCode.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { ok: true } });
}
