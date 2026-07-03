import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";
import { getJobFeedForSeeker, getCandidateFeedForJob } from "@/lib/feed";

/**
 * Returns the next batch of swipe cards for the authenticated user. Identity
 * comes from the session cookie (never the client), and the card type follows
 * the account's role: seekers get job cards, recruiters get candidate cards
 * for one of their own job openings.
 */
export async function GET(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const categoryId = params.get("categoryId") ?? undefined;

  if (account.role === "RECRUITER") {
    const jobId = params.get("jobId");
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required for recruiter view" }, { status: 400 });
    }
    // Recruiters may only review candidates for their own openings.
    const job = await prisma.job.findFirst({
      where: { id: jobId, company: { accountId: account.id } },
      select: { id: true },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    const candidates = await getCandidateFeedForJob(jobId, account.id, categoryId);
    return NextResponse.json({ cards: candidates });
  }

  const jobs = await getJobFeedForSeeker(account.id, categoryId);
  return NextResponse.json({ cards: jobs });
}
