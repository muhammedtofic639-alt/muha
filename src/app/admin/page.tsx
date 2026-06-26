import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminReviewList, PendingAccount } from "@/components/AdminReviewList";

/**
 * Admin verification queue. Server-gated: a non-admin (or signed-out) visitor
 * is bounced to the launch splash rather than shown the page. The initial
 * pending list is fetched here so the page renders populated on first paint.
 */
export default async function AdminPage() {
  const account = await getCurrentAccount();
  if (!account || !isAdmin(account.telegramId)) {
    redirect("/");
  }

  const pending = await prisma.account.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: { seekerProfile: true, companyProfile: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex-1 px-4 py-6">
      <h1 className="font-display text-xl font-bold text-gray-50">Verification Queue</h1>
      <p className="mt-1 text-sm text-gray-400">
        Review submitted documents and approve or reject each applicant.
      </p>
      <AdminReviewList initialAccounts={pending as unknown as PendingAccount[]} />
    </main>
  );
}
