"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Briefcase, Check } from "lucide-react";

const ROLES = [
  {
    id: "SEEKER" as const,
    icon: UserCircle,
    title: "I'm looking for work",
    desc: "Build a video profile, get discovered by employers.",
  },
  {
    id: "RECRUITER" as const,
    icon: Briefcase,
    title: "I'm hiring",
    desc: "Browse verified talent, find your next great hire.",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [role, setRole] = useState<"SEEKER" | "RECRUITER" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!role || isSubmitting) return;
    setIsSubmitting(true);
    await fetch("/api/onboarding/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push("/onboarding/documents");
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="mb-9">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-md bg-lime-500 font-display text-lg font-bold text-ink-900">
            A
          </div>
          <span className="font-display text-xl font-bold text-gray-50">
            abyssinia <span className="text-gray-400">jobs</span>
          </span>
        </div>
        <h1 className="mb-2.5 font-display text-[32px] font-bold leading-[1.1] tracking-tight text-gray-50">
          How will you
          <br />
          use the app?
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-400">Choose your role. You can switch later.</p>
      </div>

      <div className="flex flex-1 flex-col gap-3.5">
        {ROLES.map((r) => {
          const selected = role === r.id;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border-[1.5px] p-[18px_20px] text-left transition-all duration-200 ${
                selected
                  ? "border-lime-500 bg-[rgba(212,255,0,0.09)] shadow-[0_10px_30px_rgba(212,255,0,0.18)]"
                  : "border-[var(--border-default)] bg-ink-750"
              }`}
            >
              <span
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[15px] ${
                  selected ? "bg-lime-500 text-ink-900" : "bg-ink-700 text-gray-400"
                }`}
              >
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="mb-1 block font-display text-[17px] font-bold text-gray-50">{r.title}</span>
                <span className="text-[13px] leading-snug text-gray-400">{r.desc}</span>
              </span>
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? "border-lime-500 bg-lime-500 text-ink-900" : "border-[var(--border-strong)] bg-transparent"
                }`}
              >
                {selected && <Check size={13} strokeWidth={3} aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!role || isSubmitting}
        onClick={handleContinue}
        className={`mt-6 h-14 w-full rounded-full font-sans text-[17px] font-extrabold transition-all duration-200 ${
          role
            ? "cursor-pointer bg-lime-500 text-ink-900 shadow-accent-btn"
            : "cursor-not-allowed bg-ink-700 text-gray-600"
        }`}
      >
        Continue →
      </button>
    </main>
  );
}
