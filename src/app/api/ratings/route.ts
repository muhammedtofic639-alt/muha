import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

interface RatingBody {
  companyAccountId: string;
  rating: number;
}

function isValidRating(rating: unknown): rating is number {
  return typeof rating === "number" && rating >= 1 && rating <= 10 && Math.round(rating * 2) === rating * 2;
}

export async function POST(req: NextRequest) {
  // The rater is always the authenticated seeker — taken from the session, not
  // the body, so ratings can't be attributed to another account.
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as RatingBody;

  if (!body.companyAccountId) {
    return NextResponse.json({ error: "companyAccountId is required" }, { status: 400 });
  }
  if (!isValidRating(body.rating)) {
    return NextResponse.json({ error: "rating must be between 1 and 10 in 0.5 steps" }, { status: 400 });
  }

  const rating = await prisma.companyRating.upsert({
    where: { seekerId_companyId: { seekerId: account.id, companyId: body.companyAccountId } },
    update: { rating: body.rating },
    create: { seekerId: account.id, companyId: body.companyAccountId, rating: body.rating },
  });

  const aggregate = await prisma.companyRating.aggregate({
    where: { companyId: body.companyAccountId },
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json({
    rating,
    average: aggregate._avg.rating,
    count: aggregate._count,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyAccountId = searchParams.get("companyAccountId");

  if (!companyAccountId) {
    return NextResponse.json({ error: "companyAccountId is required" }, { status: 400 });
  }

  const aggregate = await prisma.companyRating.aggregate({
    where: { companyId: companyAccountId },
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json({ average: aggregate._avg.rating, count: aggregate._count });
}
