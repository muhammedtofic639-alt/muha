import { prisma } from "@/lib/prisma";
import { Role, SwipeAction } from "@prisma/client";

export class SwipeError extends Error {}

interface SwipeInput {
  actorId: string;
  jobId: string;
  action: SwipeAction;
  /** Required when the actor is a recruiter swiping on a specific candidate. */
  targetAccountId?: string;
}

interface SwipeResult {
  swipeId: string;
  matched: boolean;
  matchId?: string;
}

/**
 * Records a swipe and, on a mutual LIKE, creates the Match in the same
 * transaction so the check-then-create is atomic under concurrent swipes.
 */
export async function recordSwipe(input: SwipeInput): Promise<SwipeResult> {
  const actor = await prisma.account.findUniqueOrThrow({ where: { id: input.actorId } });

  return prisma.$transaction(async (tx) => {
    if (actor.role === Role.SEEKER) {
      const subjectKey = input.jobId;
      const swipe = await tx.swipe.upsert({
        where: { actorId_subjectKey: { actorId: input.actorId, subjectKey } },
        update: { action: input.action },
        create: { actorId: input.actorId, jobId: input.jobId, subjectKey, action: input.action },
      });

      if (input.action !== SwipeAction.LIKE) {
        return { swipeId: swipe.id, matched: false };
      }

      const job = await tx.job.findUniqueOrThrow({
        where: { id: input.jobId },
        include: { company: true },
      });

      const recruiterLike = await tx.swipe.findFirst({
        where: {
          jobId: input.jobId,
          targetAccountId: input.actorId,
          action: SwipeAction.LIKE,
        },
      });

      if (!recruiterLike) {
        return { swipeId: swipe.id, matched: false };
      }

      const match = await tx.match.upsert({
        where: { seekerId_jobId: { seekerId: input.actorId, jobId: input.jobId } },
        update: {},
        create: {
          seekerId: input.actorId,
          recruiterId: job.company.accountId,
          jobId: input.jobId,
        },
      });

      return { swipeId: swipe.id, matched: true, matchId: match.id };
    }

    // Recruiter swiping a candidate for a specific job opening.
    if (!input.targetAccountId) {
      throw new SwipeError("targetAccountId is required for recruiter swipes");
    }

    const subjectKey = `${input.jobId}:${input.targetAccountId}`;
    const swipe = await tx.swipe.upsert({
      where: { actorId_subjectKey: { actorId: input.actorId, subjectKey } },
      update: { action: input.action },
      create: {
        actorId: input.actorId,
        jobId: input.jobId,
        targetAccountId: input.targetAccountId,
        subjectKey,
        action: input.action,
      },
    });

    if (input.action !== SwipeAction.LIKE) {
      return { swipeId: swipe.id, matched: false };
    }

    const seekerLike = await tx.swipe.findFirst({
      where: {
        actorId: input.targetAccountId,
        jobId: input.jobId,
        action: SwipeAction.LIKE,
      },
    });

    if (!seekerLike) {
      return { swipeId: swipe.id, matched: false };
    }

    const match = await tx.match.upsert({
      where: { seekerId_jobId: { seekerId: input.targetAccountId, jobId: input.jobId } },
      update: {},
      create: {
        seekerId: input.targetAccountId,
        recruiterId: input.actorId,
        jobId: input.jobId,
      },
    });

    return { swipeId: swipe.id, matched: true, matchId: match.id };
  });
}
