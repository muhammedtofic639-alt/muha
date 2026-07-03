import { NextRequest, NextResponse } from "next/server";
import { JobType, WorkMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

// Lists the jobs the authenticated recruiter has posted, so they can pick which
// opening to review candidates for. Identity comes from the session cookie.
export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { company: { accountId: account.id }, isActive: true },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

interface CreateJobBody {
  title: string;
  description: string;
  categoryId: string;
  jobType: string;
  workMode: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  tags?: string[];
}

// Creates a job opening for the authenticated recruiter's company. Without
// this, a recruiter has nothing to review candidates against and the seeker
// feed stays empty — job creation is the entry point of the whole match loop.
export async function POST(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (account.role !== "RECRUITER" || !account.companyProfile) {
    return NextResponse.json({ error: "Only recruiters with a company profile can post jobs" }, { status: 403 });
  }

  let body: CreateJobBody;
  try {
    body = (await req.json()) as CreateJobBody;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!title || !description || typeof body.categoryId !== "string" || !body.categoryId) {
    return NextResponse.json({ error: "title, description, and categoryId are required" }, { status: 400 });
  }
  if (!Object.values(JobType).includes(body.jobType as JobType)) {
    return NextResponse.json({ error: `jobType must be one of ${Object.values(JobType).join(", ")}` }, { status: 400 });
  }
  if (!Object.values(WorkMode).includes(body.workMode as WorkMode)) {
    return NextResponse.json({ error: `workMode must be one of ${Object.values(WorkMode).join(", ")}` }, { status: 400 });
  }

  const salaryMin = normalizeSalary(body.salaryMin);
  const salaryMax = normalizeSalary(body.salaryMax);
  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    return NextResponse.json({ error: "salaryMin cannot be greater than salaryMax" }, { status: 400 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      companyId: account.companyProfile.id,
      title,
      description,
      categoryId: body.categoryId,
      jobType: body.jobType as JobType,
      workMode: body.workMode as WorkMode,
      salaryMin,
      salaryMax,
      tags,
    },
    select: { id: true, title: true },
  });

  return NextResponse.json({ job }, { status: 201 });
}

function normalizeSalary(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}
