"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SwipeDeck, DeckCard } from "@/components/SwipeDeck";
import { JobCardData } from "@/lib/types";

// In a Telegram Web App, this would come from window.Telegram.WebApp.initDataUnsafe.user.
const DEMO_SEEKER_ACCOUNT_ID = process.env.NEXT_PUBLIC_DEMO_SEEKER_ID ?? "";

export default function SeekerPage() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/feed?view=seeker&accountId=${DEMO_SEEKER_ACCOUNT_ID}`);
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
      body: JSON.stringify({ actorId: DEMO_SEEKER_ACCOUNT_ID, jobId: card.data.id, action }),
    });
    const data = await res.json();
    return { matched: Boolean(data.matched) };
  }

  return (
    <>
      <TopBar active="seeker" />
      <SwipeDeck
        cards={jobs.map((job) => ({ kind: "job" as const, data: job }))}
        isLoading={isLoading}
        onSwipe={handleSwipe}
        matchPartnerName={(card) => (card.kind === "job" ? card.data.company.companyName : "")}
      />
    </>
  );
}
