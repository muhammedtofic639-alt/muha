import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

/**
 * Lists accounts awaiting verification (PENDING_APPROVAL) with the documents an
 * admin needs to review. Admin-only — gated on the Telegram allowlist.
 */
export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!isAdmin(account.telegramId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pending = await prisma.account.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: { seekerProfile: true, companyProfile: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ accounts: pending });
}
