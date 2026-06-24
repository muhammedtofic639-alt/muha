"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IdCard, FileText, Upload } from "lucide-react";

export function DocumentUploadForm({ role }: { role: "SEEKER" | "RECRUITER" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/onboarding/documents", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      router.push("/pending");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {role === "SEEKER" ? (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy-800">Full name</span>
            <input
              name="fullName"
              required
              className="rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-[15px] text-navy-900 outline-none"
            />
          </label>
          <FileField name="governmentId" label="Government ID" icon={<IdCard size={18} aria-hidden="true" />} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy-800">Elevator pitch video link</span>
            <input
              name="videoPitchUrl"
              type="url"
              required
              placeholder="https://youtube.com/... or https://tiktok.com/..."
              className="rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-[15px] text-navy-900 outline-none"
            />
            <span className="text-xs text-navy-500">
              Paste a link to a YouTube or TikTok video — no file upload needed.
            </span>
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy-800">Company name</span>
            <input
              name="companyName"
              required
              className="rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-[15px] text-navy-900 outline-none"
            />
          </label>
          <FileField
            name="commercialLicense"
            label="Commercial License (Business Registration)"
            icon={<FileText size={18} aria-hidden="true" />}
          />
          <FileField
            name="ownerId"
            label="Owner / Representative's Government ID"
            icon={<IdCard size={18} aria-hidden="true" />}
          />
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 cursor-pointer rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

function FileField({ name, label, icon }: { name: string; label: string; icon: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-navy-800">{label}</span>
      <div className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-navy-300 bg-white px-3 py-3 text-navy-600 transition-colors duration-200 hover:border-gold-500">
        {icon}
        <Upload size={18} className="text-navy-400" aria-hidden="true" />
        <input
          type="file"
          name={name}
          accept="image/*,.pdf"
          required
          className="w-full cursor-pointer text-sm outline-none file:cursor-pointer"
        />
      </div>
    </label>
  );
}
