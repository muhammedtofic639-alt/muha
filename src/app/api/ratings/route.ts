import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RatingBody {
  seekerAccountId: string;
  companyAccountId: string;
  rating: number;
}

function isValidRating(rating: unknown): rating is number {
  return typeof rating === "number" && rating >= 1 && rating <= 10 && Math.round(rating * 2) === rating * 2;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RatingBody;

  if (!body.seekerAccountId || !body.companyAccountId) {
    return NextResponse.json({ error: "seekerAccountId and companyAccountId are required" }, { status: 400 });
  }
  if (!isValidRating(body.rating)) {
    return NextResponse.json({ error: "rating must be between 1 and 10 in 0.5 steps" }, { status: 400 });
  }

  const rating = await prisma.companyRating.upsert({
    where: { seekerId_companyId: { seekerId: body.seekerAccountId, companyId: body.companyAccountId } },
    update: { rating: body.rating },
    create: { seekerId: body.seekerAccountId, companyId: body.companyAccountId, rating: body.rating },
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
