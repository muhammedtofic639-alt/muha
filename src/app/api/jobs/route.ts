import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lists the jobs a recruiter has posted, so they can pick which opening
// to review candidates for.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const jobs = await prisma.job.findMany({
    where: { company: { accountId }, isActive: true },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
