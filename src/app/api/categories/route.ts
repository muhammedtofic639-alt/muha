import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

// Lists every job category, alphabetically. Used by the seeker onboarding
// category picker and the employer's candidate-feed category filter menu.
export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}
