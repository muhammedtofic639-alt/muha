import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Explicit selects: only what the matches list renders. Full profile rows
  // include verification documents (governmentIdUrl etc.) that must never be
  // sent to the other side of a match.
  const matches = await prisma.match.findMany({
    where: { OR: [{ seekerId: account.id }, { recruiterId: account.id }] },
    select: {
      id: true,
      createdAt: true,
      seekerId: true,
      recruiterId: true,
      job: { select: { title: true, company: { select: { companyName: true } } } },
      seeker: {
        select: {
          username: true,
          telegramId: true,
          seekerProfile: { select: { fullName: true } },
        },
      },
      recruiter: {
        select: {
          username: true,
          telegramId: true,
          companyProfile: { select: { companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Return the viewer's own id so the client can tell which side of each match
  // it is on (and therefore who the "partner" is) without trusting a guess.
  return NextResponse.json({ matches, accountId: account.id });
}
