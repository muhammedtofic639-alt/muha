"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SwipeDeck, DeckCard } from "@/components/SwipeDeck";
import { JobCardData } from "@/lib/types";

export default function SeekerPage() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    // Identity comes from the session cookie server-side — no account id needed.
    const res = await fetch("/api/feed");
    const data = await res.json();
    setJobs(data.cards ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  async function handleSwipe(card: DeckCard, action: "LIKE" | "PASS") {
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: card.data.id, action }),
    });
    const data = await res.json();
    return { matched: Boolean(data.matched), partnerChatUrl: data.partnerChatUrl };
  }

  async function handleRateCompany(companyAccountId: string, rating: number) {
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyAccountId, rating }),
    });
  }

  return (
    <>
      <TopBar active="seeker" />
      <SwipeDeck
        cards={jobs.map((job) => ({ kind: "job" as const, data: job }))}
        isLoading={isLoading}
        onSwipe={handleSwipe}
        matchPartnerName={(card) => (card.kind === "job" ? card.data.company.companyName : "")}
        onRateCompany={handleRateCompany}
      />
    </>
  );
}
