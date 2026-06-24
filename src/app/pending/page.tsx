import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentAccount } from "@/lib/session";

export default async function PendingPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");
  if (account.status === "APPROVED") redirect("/");
  if (account.status === "REJECTED") redirect("/rejected");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-400">
        <ShieldCheck size={36} aria-hidden="true" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Under Review</h1>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-navy-600">
          We&apos;re verifying your documents. We will notify you via email once your account is approved
          — this usually takes less than 24 hours.
        </p>
      </div>
      <p className="text-sm text-navy-400">{account.email}</p>
    </main>
  );
}
