"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { CategoryOption } from "@/lib/types";

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

const WORK_MODES = [
  { value: "ON_SITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const inputClass =
  "w-full rounded-sm border border-[var(--border-default)] bg-ink-700 px-4 py-3.5 font-sans text-[15px] text-gray-50 outline-none placeholder:text-gray-600";

export default function NewJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = new FormData(e.currentTarget);
      const salaryMin = Number(form.get("salaryMin"));
      const salaryMax = Number(form.get("salaryMax"));

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          categoryId: form.get("categoryId"),
          jobType: form.get("jobType"),
          workMode: form.get("workMode"),
          salaryMin: salaryMin > 0 ? salaryMin : null,
          salaryMax: salaryMax > 0 ? salaryMax : null,
          tags: String(form.get("tags") ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create the job");
        return;
      }

      router.push("/recruiter");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <TopBar active="recruiter" />
      <main className="flex flex-1 flex-col items-center px-6 py-8">
        <div className="mb-6 w-full max-w-sm">
          <h1 className="mb-1.5 font-display text-[28px] font-bold tracking-tight text-gray-50">Post a job</h1>
          <p className="text-sm text-gray-400">Candidates in this category will see it in their feed right away.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-[18px] text-left">
          <Field label="Job title">
            <input name="title" required placeholder="e.g. Frontend Engineer" className={inputClass} />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              required
              rows={4}
              placeholder="What the role involves, what you're looking for…"
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Category">
            <select name="categoryId" required defaultValue="" className={`${inputClass} cursor-pointer`}>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Job type">
              <select name="jobType" defaultValue="FULL_TIME" className={`${inputClass} cursor-pointer`}>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Work mode">
              <select name="workMode" defaultValue="ON_SITE" className={`${inputClass} cursor-pointer`}>
                {WORK_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary min (ETB/mo)">
              <input name="salaryMin" type="number" min={0} placeholder="Optional" className={inputClass} />
            </Field>
            <Field label="Salary max (ETB/mo)">
              <input name="salaryMax" type="number" min={0} placeholder="Optional" className={inputClass} />
            </Field>
          </div>

          <Field label="Tags (comma-separated)">
            <input name="tags" placeholder="e.g. React, TypeScript, Tailwind" className={inputClass} />
          </Field>

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-14 w-full cursor-pointer rounded-full bg-lime-500 font-sans text-[17px] font-extrabold text-ink-900 shadow-accent-btn transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Posting…" : "Post job"}
          </button>
        </form>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-gray-400">{label}</label>
      {children}
    </div>
  );
}
