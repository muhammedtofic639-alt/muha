import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const matches = await prisma.match.findMany({
    where: { OR: [{ seekerId: accountId }, { recruiterId: accountId }] },
    include: {
      job: { include: { company: true } },
      seeker: { include: { seekerProfile: true } },
      recruiter: { include: { companyProfile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ matches });
}
