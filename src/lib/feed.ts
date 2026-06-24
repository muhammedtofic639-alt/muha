import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

/**
 * Job feed for a seeker: active jobs, excluding any job the seeker has already
 * swiped on. Self-exclusion isn't needed here since seekers don't post jobs,
 * but is included for safety in case roles change.
 */
export async function getJobFeedForSeeker(seekerAccountId: string) {
  return prisma.job.findMany({
    where: {
      isActive: true,
      company: { accountId: { not: seekerAccountId } },
      swipes: {
        none: { actorId: seekerAccountId },
      },
    },
    include: {
      company: { select: { companyName: true, logoUrl: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

/**
 * Candidate feed for a recruiter reviewing applicants for one of their jobs:
 * every seeker who has not already been swiped on for this job, excluding
 * the recruiter's own account (can't happen by role, kept for safety).
 */
export async function getCandidateFeedForJob(jobId: string, recruiterAccountId: string) {
  const alreadySwiped = await prisma.swipe.findMany({
    where: { actorId: recruiterAccountId, jobId, targetAccountId: { not: null } },
    select: { targetAccountId: true },
  });
  const excludedAccountIds = [recruiterAccountId, ...alreadySwiped.map((s) => s.targetAccountId as string)];

  return prisma.seekerProfile.findMany({
    where: { accountId: { notIn: excludedAccountIds } },
    include: { account: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}
