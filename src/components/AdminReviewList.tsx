"use client";

import { useState } from "react";
import { Check, X, FileText, Building2, User } from "lucide-react";

export interface PendingAccount {
  id: string;
  telegramId: string;
  username: string | null;
  role: "SEEKER" | "RECRUITER";
  createdAt: string;
  seekerProfile: {
    fullName: string;
    governmentIdUrl: string | null;
    profilePhotoUrl: string | null;
    videoPitchUrl: string | null;
  } | null;
  companyProfile: {
    companyName: string;
    commercialLicenseUrl: string | null;
    ownerIdUrl: string | null;
  } | null;
}

export function AdminReviewList({ initialAccounts }: { initialAccounts: PendingAccount[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Drop the decided account from the queue.
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (accounts.length === 0) {
    return <p className="mt-6 text-sm text-gray-400">No accounts are waiting for review. 🎉</p>;
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {accounts.map((account) => {
        const isSeeker = account.role === "SEEKER";
        const name = isSeeker
          ? account.seekerProfile?.fullName ?? "Unnamed seeker"
          : account.companyProfile?.companyName ?? "Unnamed company";

        const documents = isSeeker
          ? [
              { label: "Government ID", url: account.seekerProfile?.governmentIdUrl },
              { label: "Profile photo", url: account.seekerProfile?.profilePhotoUrl },
              { label: "Video pitch", url: account.seekerProfile?.videoPitchUrl },
            ]
          : [
              { label: "Commercial license", url: account.companyProfile?.commercialLicenseUrl },
              { label: "Owner's ID", url: account.companyProfile?.ownerIdUrl },
            ];

        return (
          <li key={account.id} className="rounded-2xl border border-[var(--border-subtle)] bg-ink-800 p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-700 text-lime-400">
                {isSeeker ? <User size={20} aria-hidden="true" /> : <Building2 size={20} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-gray-50">{name}</p>
                <p className="text-xs text-gray-500">
                  {isSeeker ? "Job Seeker" : "Employer"}
                  {account.username ? ` · @${account.username}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {documents.map((doc) =>
                doc.url ? (
                  // Browsers block top-frame navigation to data: URLs, so
                  // inline-stored documents are offered as downloads instead.
                  <a
                    key={doc.label}
                    href={doc.url}
                    {...(doc.url.startsWith("data:")
                      ? { download: doc.label.replace(/\s+/g, "-").toLowerCase() }
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    className="flex items-center gap-1.5 rounded-lg bg-ink-700 px-2.5 py-1.5 text-xs font-medium text-gray-200 transition-colors duration-200 hover:bg-ink-600"
                  >
                    <FileText size={14} aria-hidden="true" />
                    {doc.label}
                  </a>
                ) : (
                  <span
                    key={doc.label}
                    className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-2.5 py-1.5 text-xs font-medium text-gray-600"
                  >
                    <FileText size={14} aria-hidden="true" />
                    {doc.label} (missing)
                  </span>
                )
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={busyId === account.id}
                onClick={() => decide(account.id, "APPROVED")}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-lime-500 py-2.5 text-sm font-semibold text-ink-900 shadow-accent-btn transition-colors duration-200 hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={16} aria-hidden="true" />
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === account.id}
                onClick={() => decide(account.id, "REJECTED")}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--border-default)] py-2.5 text-sm font-semibold text-gray-300 transition-colors duration-200 hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={16} aria-hidden="true" />
                Reject
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
