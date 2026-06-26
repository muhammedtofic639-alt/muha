"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { TopBar } from "@/components/TopBar";
import { telegramChatUrl } from "@/lib/telegram/chatLink";

interface MatchRow {
  id: string;
  createdAt: string;
  seekerId: string;
  recruiterId: string;
  job: { title: string; company: { companyName: string } };
  seeker: { username: string | null; telegramId: string; seekerProfile: { fullName: string } | null };
  recruiter: { username: string | null; telegramId: string; companyProfile: { companyName: string } | null };
}

/** Open a t.me link natively inside Telegram; fall back to a normal navigation. */
function openChat(url: string) {
  if (url.startsWith("https://t.me/") && openTelegramLink.isAvailable()) {
    openTelegramLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Identity (and which side of each match the viewer is on) comes from the
    // session-scoped endpoint, not a client-held id.
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.matches ?? []);
        setAccountId(data.accountId ?? null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <TopBar active="matches" />
      <div className="flex-1 px-4 py-6">
        <h1 className="font-display text-xl font-bold text-gray-50">Your Matches</h1>

        {isLoading && <p className="mt-4 text-sm text-gray-400">Loading matches…</p>}

        {!isLoading && matches.length === 0 && (
          <p className="mt-4 text-sm text-gray-400">No matches yet — keep swiping!</p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {matches.map((match) => {
            // The viewer is the seeker on this match when their account id is
            // the seekerId; the partner is therefore the other party.
            const viewerIsSeeker = match.seekerId === accountId;
            const partnerName = viewerIsSeeker
              ? match.recruiter.companyProfile?.companyName ?? "Recruiter"
              : match.seeker.seekerProfile?.fullName ?? "Candidate";
            const partner = viewerIsSeeker ? match.recruiter : match.seeker;
            const chatUrl = telegramChatUrl(partner.username, partner.telegramId);

            return (
              <li
                key={match.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-ink-800 p-4 shadow-card"
              >
                <div>
                  <p className="font-display text-base font-semibold text-gray-50">{partnerName}</p>
                  <p className="text-sm text-gray-400">{match.job.title}</p>
                </div>
                <button
                  type="button"
                  disabled={!chatUrl}
                  onClick={() => chatUrl && openChat(chatUrl)}
                  aria-label={`Open Telegram chat with ${partnerName}`}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-lime-500 text-ink-900 transition-colors duration-200 hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle size={20} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
