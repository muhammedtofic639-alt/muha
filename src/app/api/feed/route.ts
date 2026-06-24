import { NextRequest, NextResponse } from "next/server";
import { getJobFeedForSeeker, getCandidateFeedForJob } from "@/lib/feed";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view"); // "seeker" | "recruiter"
  const accountId = searchParams.get("accountId");
  const jobId = searchParams.get("jobId");

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  if (view === "recruiter") {
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required for recruiter view" }, { status: 400 });
    }
    const candidates = await getCandidateFeedForJob(jobId, accountId);
    return NextResponse.json({ cards: candidates });
  }

  const jobs = await getJobFeedForSeeker(accountId);
  return NextResponse.json({ cards: jobs });
}
