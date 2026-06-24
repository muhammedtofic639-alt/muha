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
    return <p className="mt-6 text-sm text-navy-600">No accounts are waiting for review. 🎉</p>;
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
          <li key={account.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                {isSeeker ? <User size={20} aria-hidden="true" /> : <Building2 size={20} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-navy-900">{name}</p>
                <p className="text-xs text-navy-500">
                  {isSeeker ? "Job Seeker" : "Employer"}
                  {account.username ? ` · @${account.username}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {documents.map((doc) =>
                doc.url ? (
                  <a
                    key={doc.label}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-navy-100 px-2.5 py-1.5 text-xs font-medium text-navy-800 transition-colors duration-200 hover:bg-navy-200"
                  >
                    <FileText size={14} aria-hidden="true" />
                    {doc.label}
                  </a>
                ) : (
                  <span
                    key={doc.label}
                    className="flex items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-300"
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
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gold-500 py-2.5 text-sm font-semibold text-navy-900 transition-colors duration-200 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={16} aria-hidden="true" />
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === account.id}
                onClick={() => decide(account.id, "REJECTED")}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-navy-200 py-2.5 text-sm font-semibold text-navy-700 transition-colors duration-200 hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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
