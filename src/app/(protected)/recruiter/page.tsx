"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SwipeDeck, DeckCard } from "@/components/SwipeDeck";
import { CandidateCardData, CategoryOption } from "@/lib/types";

export default function RecruiterPage() {
  const [jobOptions, setJobOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The recruiter's own postings — identity resolved from the session cookie.
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobOptions(data.jobs ?? []);
        if (data.jobs?.[0]) setSelectedJobId(data.jobs[0].id);
      });
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  const loadFeed = useCallback(async () => {
    if (!selectedJobId) return;
    setIsLoading(true);
    const categoryParam = selectedCategoryId ? `&categoryId=${selectedCategoryId}` : "";
    const res = await fetch(`/api/feed?jobId=${selectedJobId}${categoryParam}`);
    const data = await res.json();
    setCandidates(data.cards ?? []);
    setIsLoading(false);
  }, [selectedJobId, selectedCategoryId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  async function handleSwipe(card: DeckCard, action: "LIKE" | "PASS") {
    if (card.kind !== "candidate") return { matched: false };
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
          className="w-full cursor-pointer rounded-xl border border-[var(--border-default)] bg-ink-800 px-3 py-2 text-sm font-medium text-gray-50"
        >
          {jobOptions.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setSelectedCategoryId("")}
          className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
            selectedCategoryId === ""
              ? "bg-lime-500 text-ink-900"
              : "bg-ink-800 text-gray-300 hover:bg-ink-700"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategoryId(category.id)}
            className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
              selectedCategoryId === category.id
                ? "bg-lime-500 text-ink-900"
                : "bg-ink-800 text-gray-300 hover:bg-ink-700"
            }`}
          >
            {category.name}
          </button>
        ))}
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
