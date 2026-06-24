import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

// Lists the jobs the authenticated recruiter has posted, so they can pick which
// opening to review candidates for. Identity comes from the session cookie.
export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { company: { accountId: account.id }, isActive: true },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
