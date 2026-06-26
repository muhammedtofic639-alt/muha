import { redirect } from "next/navigation";
import { Clock, ShieldCheck } from "lucide-react";
import { getCurrentAccount } from "@/lib/session";
import { BackToStartButton } from "@/components/BackToStartButton";

export default async function PendingPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/");
  if (account.status === "APPROVED") redirect("/");
  if (account.status === "REJECTED") redirect("/rejected");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
      <div className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-lg border-[1.5px] border-[rgba(255,197,61,0.35)] bg-[rgba(255,197,61,0.15)]">
        <Clock size={40} className="text-warning" aria-hidden="true" />
      </div>
      <h1 className="mb-2.5 font-display text-2xl font-bold tracking-tight text-gray-50">Awaiting Approval</h1>
      <p className="mb-9 max-w-xs text-[15px] leading-relaxed text-gray-400">
        Your documents are under review. We&apos;ll notify you within 24 hours once your account is approved.
      </p>
      <div className="mb-8 flex w-full flex-col items-center gap-2.5 rounded-md border border-[var(--border-subtle)] bg-ink-750 px-6 py-[18px]">
        <ShieldCheck size={20} className="text-gray-600" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-gray-400">
          Your documents are encrypted and reviewed by our admin team. No access until approval.
        </p>
      </div>
      {account.username && <p className="mb-6 text-sm text-gray-600">@{account.username}</p>}
      <BackToStartButton />
    </main>
  );
}
