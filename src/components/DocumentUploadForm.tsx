"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, IdCard, Link as LinkIcon, FileText, LucideIcon } from "lucide-react";
import { CategoryOption } from "@/lib/types";

export function DocumentUploadForm({
  role,
  categories,
}: {
  role: "SEEKER" | "RECRUITER";
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [licenseName, setLicenseName] = useState<string | null>(null);
  const [ownerIdName, setOwnerIdName] = useState<string | null>(null);

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
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-[18px] text-left">
      {role === "SEEKER" ? (
        <>
          <PhotoField name="profilePhoto" fileName={photoName} onPick={setPhotoName} />

          <TextField name="fullName" label="Full name" placeholder="e.g. Selam Tesfaye" required />

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-400">About you</label>
            <textarea
              name="bio"
              rows={3}
              placeholder="A short pitch — 2–3 sentences about your work…"
              className="w-full resize-none rounded-sm border border-[var(--border-default)] bg-ink-700 px-4 py-3.5 font-sans text-[15px] text-gray-50 outline-none placeholder:text-gray-600"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-400">Category</label>
            <select
              name="categoryId"
              required
              defaultValue=""
              className="cursor-pointer rounded-sm border border-[var(--border-default)] bg-ink-700 px-4 py-3.5 font-sans text-[15px] text-gray-50 outline-none"
            >
              <option value="" disabled>
                Select your primary category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-400">Video pitch link</label>
            <div className="flex h-[52px] items-center gap-2.5 rounded-sm border border-[var(--border-default)] bg-ink-700 px-4">
              <LinkIcon size={18} className="shrink-0 text-gray-600" aria-hidden="true" />
              <input
                name="videoPitchUrl"
                type="url"
                required
                placeholder="YouTube or TikTok URL"
                className="w-full bg-transparent font-sans text-[15px] text-gray-50 outline-none placeholder:text-gray-600"
              />
            </div>
            <span className="text-[11px] text-gray-600">Optional — but 3× more likely to be discovered.</span>
          </div>

          <FileField name="governmentId" label="Government ID" hint="Required for verification" icon={IdCard} />
        </>
      ) : (
        <>
          <TextField name="companyName" label="Company name" placeholder="e.g. Lucy Coffee Roasters" required />
          <FileField
            name="commercialLicense"
            label="Commercial license"
            hint="Official business registration doc"
            icon={FileText}
          />
          <FileField name="ownerId" label="Owner / Director ID" hint="National ID or passport photo" icon={IdCard} />
        </>
      )}

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
        {role === "SEEKER" ? "Go live ✓" : isSubmitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

function TextField({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-gray-400">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-sm border border-[var(--border-default)] bg-ink-700 px-4 py-3.5 font-sans text-[15px] text-gray-50 outline-none placeholder:text-gray-600"
      />
    </div>
  );
}

function PhotoField({
  name,
  fileName,
  onPick,
}: {
  name: string;
  fileName: string | null;
  onPick: (name: string) => void;
}) {
  return (
    <label
      className={`flex w-full cursor-pointer items-center gap-3.5 rounded-md border-[1.5px] border-dashed p-4 text-left transition-colors duration-200 ${
        fileName ? "border-lime-500 bg-[rgba(212,255,0,0.07)]" : "border-[var(--border-strong)] bg-ink-700"
      }`}
    >
      <span
        className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-sm ${
          fileName ? "bg-lime-500 text-ink-900" : "bg-[var(--glass)] text-gray-400"
        }`}
      >
        {fileName ? <Check size={22} aria-hidden="true" /> : <Camera size={22} aria-hidden="true" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-sans text-[15px] font-bold text-gray-50">{fileName ?? "Portrait photo"}</span>
        <span className={`text-xs ${fileName ? "text-lime-500" : "text-gray-600"}`}>
          {fileName ? "Uploaded · tap to replace" : "Your best headshot or clear photo"}
        </span>
      </span>
      <input
        type="file"
        name={name}
        accept="image/*"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0].name)}
      />
    </label>
  );
}

function FileField({
  name,
  label,
  hint,
  icon: Icon,
}: {
  name: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <label
      className={`flex w-full cursor-pointer items-center gap-3.5 rounded-md border-[1.5px] border-dashed p-[18px] text-left transition-colors duration-200 ${
        fileName ? "border-lime-500 bg-[rgba(212,255,0,0.07)]" : "border-[var(--border-strong)] bg-ink-700"
      }`}
    >
      <span
        className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-sm ${
          fileName ? "bg-lime-500 text-ink-900" : "bg-[var(--glass)] text-gray-400"
        }`}
      >
        {fileName ? <Check size={22} aria-hidden /> : <Icon size={22} aria-hidden />}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-sans text-[15px] font-bold text-gray-50">{fileName ?? label}</span>
        <span className={`text-xs ${fileName ? "text-lime-500" : "text-gray-600"}`}>
          {fileName ? "Uploaded · tap to replace" : hint}
        </span>
      </span>
      <input
        type="file"
        name={name}
        accept="image/*,.pdf"
        required
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && setFileName(e.target.files[0].name)}
      />
    </label>
  );
}
