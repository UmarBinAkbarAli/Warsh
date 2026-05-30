import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          titleAr: true,
          template: true,
          xpReward: true,
          content: true,
        },
      },
    },
  });

  return NextResponse.json({ data: { chapters } });
}
