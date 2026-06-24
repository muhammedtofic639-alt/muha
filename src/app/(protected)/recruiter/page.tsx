"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SwipeDeck, DeckCard } from "@/components/SwipeDeck";
import { CandidateCardData } from "@/lib/types";

// In a Telegram Web App, this would come from window.Telegram.WebApp.initDataUnsafe.user.
const DEMO_RECRUITER_ACCOUNT_ID = process.env.NEXT_PUBLIC_DEMO_RECRUITER_ID ?? "";

export default function RecruiterPage() {
  const [jobOptions, setJobOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs?accountId=${DEMO_RECRUITER_ACCOUNT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setJobOptions(data.jobs ?? []);
        if (data.jobs?.[0]) setSelectedJobId(data.jobs[0].id);
      });
  }, []);

  const loadFeed = useCallback(async () => {
    if (!selectedJobId) return;
    setIsLoading(true);
    const res = await fetch(
      `/api/feed?view=recruiter&accountId=${DEMO_RECRUITER_ACCOUNT_ID}&jobId=${selectedJobId}`
    );
    const data = await res.json();
    setCandidates(data.cards ?? []);
    setIsLoading(false);
  }, [selectedJobId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  async function handleSwipe(card: DeckCard, action: "LIKE" | "PASS") {
    if (card.kind !== "candidate") return { matched: false };
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorId: DEMO_RECRUITER_ACCOUNT_ID,
        jobId: selectedJobId,
        targetAccountId: card.data.accountId,
        action,
      }),
    });
    const data = await res.json();
    return { matched: Boolean(data.matched), partnerChatUrl: data.partnerChatUrl };
  }

  return (
    <>
      <TopBar active="recruiter" />
      <div className="px-4 pt-4">
        <label htmlFor="job-select" className="sr-only">
          Select job opening
        </label>
        <select
          id="job-select"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-900"
        >
          {jobOptions.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>
      <SwipeDeck
        cards={candidates.map((candidate) => ({ kind: "candidate" as const, data: candidate }))}
        isLoading={isLoading}
        onSwipe={handleSwipe}
        matchPartnerName={(card) => (card.kind === "candidate" ? card.data.fullName : "")}
      />
    </>
  );
}
