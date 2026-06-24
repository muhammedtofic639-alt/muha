"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2 } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function chooseRole(role: "SEEKER" | "RECRUITER") {
    setIsSubmitting(true);
    await fetch("/api/onboarding/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push("/onboarding/documents");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">What brings you here?</h1>
        <p className="mt-1 text-sm text-navy-600">Step 2 of 4 — Choose your path</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => chooseRole("SEEKER")}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-navy-200 bg-white p-4 text-left transition-colors duration-200 hover:border-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
            <Briefcase size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display font-semibold text-navy-900">Job Seeker</p>
            <p className="text-sm text-navy-600">I&apos;m looking for my next role</p>
          </div>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => chooseRole("RECRUITER")}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-navy-200 bg-white p-4 text-left transition-colors duration-200 hover:border-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
            <Building2 size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display font-semibold text-navy-900">Employer / Company</p>
            <p className="text-sm text-navy-600">I&apos;m looking for employees</p>
          </div>
        </button>
      </div>
    </main>
  );
}
