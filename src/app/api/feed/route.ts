import { NextRequest, NextResponse } from "next/server";
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

  if (account.role === "RECRUITER") {
    const jobId = new URL(req.url).searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required for recruiter view" }, { status: 400 });
    }
    const candidates = await getCandidateFeedForJob(jobId, account.id);
    return NextResponse.json({ cards: candidates });
  }

  const jobs = await getJobFeedForSeeker(account.id);
  return NextResponse.json({ cards: jobs });
}
