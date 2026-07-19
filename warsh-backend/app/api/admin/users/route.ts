import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

// GET /api/admin/users?q=&page=1&pageSize=25
// Paginated user directory plus headline signup stats. Admin-gated (read).
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(500, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "25", 10) || 25));

  const and: Record<string, unknown>[] = [];
  if (q) {
    and.push({
      OR: [
        { email: { contains: q, mode: "insensitive" as const } },
        { name: { contains: q, mode: "insensitive" as const } },
      ],
    });
  }
  if (status) and.push({ subscriptionStatus: status });
  const where = and.length ? { AND: and } : {};

  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, matched, newLast7, newLast30, activeSubs, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where }),
    prisma.user.count({ where: { createdAt: { gte: last7 } } }),
    prisma.user.count({ where: { createdAt: { gte: last30 } } }),
    prisma.user.count({ where: { subscriptionStatus: { in: ["active", "grace"] } } }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        nativeLanguage: true,
        xp: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
        subscriptionActiveUntil: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    data: {
      stats: { total, newLast7, newLast30, activeSubs },
      matched,
      page,
      pageSize,
      users: users.map((u) => ({
        ...u,
        trialExpiresAt: u.trialExpiresAt?.toISOString() ?? null,
        subscriptionActiveUntil: u.subscriptionActiveUntil?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
    },
  });
}
