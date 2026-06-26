import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentAccount } from "@/lib/session";

export default async function RejectedPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/");
  if (account.status !== "REJECTED") redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
      <div className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-lg border-[1.5px] border-[rgba(255,90,90,0.35)] bg-[rgba(255,90,90,0.15)]">
        <ShieldAlert size={40} className="text-danger" aria-hidden="true" />
      </div>
      <h1 className="mb-2.5 font-display text-2xl font-bold tracking-tight text-gray-50">
        Verification unsuccessful
      </h1>
      <p className="mb-9 max-w-xs text-[15px] leading-relaxed text-gray-400">
        We couldn&apos;t verify your documents. You can resubmit clearer copies for another review.
      </p>
      <a
        href="/onboarding/documents"
        className="cursor-pointer rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink-900 shadow-accent-btn"
      >
        Resubmit documents
      </a>
    </main>
  );
}
