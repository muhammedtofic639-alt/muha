import { NextRequest, NextResponse } from "next/server";
import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

interface DecisionBody {
  status: "APPROVED" | "REJECTED";
}

/**
 * Admin decision on a pending account. Because the protected layout reads
 * Account.status live on every request, flipping it here takes effect for the
 * user immediately — no re-login or token refresh needed.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!isAdmin(account.telegramId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as DecisionBody;
  if (body.status !== "APPROVED" && body.status !== "REJECTED") {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const updated = await prisma.account.update({
    where: { id: params.id },
    data: { status: body.status as AccountStatus },
    select: { id: true, status: true },
  });

  return NextResponse.json(updated);
}
