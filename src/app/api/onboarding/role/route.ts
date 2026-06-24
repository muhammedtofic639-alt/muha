import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";

interface RoleBody {
  role: "SEEKER" | "RECRUITER";
}

export async function POST(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as RoleBody;
  if (body.role !== "SEEKER" && body.role !== "RECRUITER") {
    return NextResponse.json({ error: "role must be SEEKER or RECRUITER" }, { status: 400 });
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { role: body.role as Role },
  });

  return NextResponse.json({ ok: true });
}
