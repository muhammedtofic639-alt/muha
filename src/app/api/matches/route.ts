import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: { OR: [{ seekerId: account.id }, { recruiterId: account.id }] },
    include: {
      job: { include: { company: true } },
      seeker: { include: { seekerProfile: true } },
      recruiter: { include: { companyProfile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Return the viewer's own id so the client can tell which side of each match
  // it is on (and therefore who the "partner" is) without trusting a guess.
  return NextResponse.json({ matches, accountId: account.id });
}
