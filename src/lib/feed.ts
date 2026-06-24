import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

/**
 * Job feed for a seeker: active jobs, excluding any job the seeker has already
 * swiped on. Self-exclusion isn't needed here since seekers don't post jobs,
 * but is included for safety in case roles change.
 */
export async function getJobFeedForSeeker(seekerAccountId: string, categoryId?: string) {
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      company: { accountId: { not: seekerAccountId } },
      swipes: {
        none: { actorId: seekerAccountId },
      },
    },
    include: {
      company: { select: { accountId: true, companyName: true, logoUrl: true, location: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  if (jobs.length === 0) return [];

  const companyAccountIds = [...new Set(jobs.map((job) => job.company.accountId))];
  const ratingGroups = await prisma.companyRating.groupBy({
    by: ["companyId"],
    where: { companyId: { in: companyAccountIds } },
    _avg: { rating: true },
    _count: true,
  });
  const ratingByCompany = new Map(ratingGroups.map((g) => [g.companyId, { average: g._avg.rating, count: g._count }]));

  return jobs.map((job) => ({
    ...job,
    company: {
      ...job.company,
      rating: ratingByCompany.get(job.company.accountId) ?? { average: null, count: 0 },
    },
  }));
}

/**
 * Candidate feed for a recruiter reviewing applicants for one of their jobs:
 * every seeker who has not already been swiped on for this job, excluding
 * the recruiter's own account (can't happen by role, kept for safety).
 * An optional categoryId narrows the deck to seekers in that one category
 * (e.g. "Software Engineer") via the employer's category filter menu.
 */
export async function getCandidateFeedForJob(jobId: string, recruiterAccountId: string, categoryId?: string) {
  const alreadySwiped = await prisma.swipe.findMany({
    where: { actorId: recruiterAccountId, jobId, targetAccountId: { not: null } },
    select: { targetAccountId: true },
  });
  const excludedAccountIds = [recruiterAccountId, ...alreadySwiped.map((s) => s.targetAccountId as string)];

  return prisma.seekerProfile.findMany({
    where: {
      accountId: { notIn: excludedAccountIds },
      ...(categoryId ? { categoryId } : {}),
      // Only surface candidates who've actually finished their card media —
      // an empty photo/video slide isn't swipeable.
      profilePhotoUrl: { not: null },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}
