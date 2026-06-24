import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentAccount } from "@/lib/session";

export default async function RejectedPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");
  if (account.status !== "REJECTED") redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-red-400">
        <ShieldAlert size={36} aria-hidden="true" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Verification unsuccessful</h1>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-navy-600">
          We couldn&apos;t verify your documents. You can resubmit clearer copies for another review.
        </p>
      </div>
      <a
        href="/onboarding/documents"
        className="cursor-pointer rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-800"
      >
        Resubmit documents
      </a>
    </main>
  );
}
