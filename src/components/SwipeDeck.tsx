"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Heart, X } from "lucide-react";
import { JobCardData, CandidateCardData } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { DualSlideCard } from "@/components/DualSlideCard";
import { MatchModal } from "@/components/MatchModal";

export type DeckCard =
  | { kind: "job"; data: JobCardData }
  | { kind: "candidate"; data: CandidateCardData };

interface SwipeDeckProps {
  cards: DeckCard[];
  isLoading: boolean;
  onSwipe: (
    card: DeckCard,
    action: "LIKE" | "PASS"
  ) => Promise<{ matched: boolean; partnerChatUrl?: string | null }>;
  matchPartnerName?: (card: DeckCard) => string;
  onRateCompany?: (companyAccountId: string, rating: number) => Promise<void>;
}

const SWIPE_THRESHOLD = 120;

export function SwipeDeck({
  cards,
  isLoading,
  onSwipe,
  matchPartnerName,
  onRateCompany,
}: SwipeDeckProps) {
  const [stack, setStack] = useState(cards);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [matchedCard, setMatchedCard] = useState<DeckCard | null>(null);
  const [matchedChatUrl, setMatchedChatUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep local stack in sync when a fresh page of cards arrives.
  useEffect(() => {
    if (cards.length && stack.length === 0) {
      setStack(cards);
    }
  }, [cards, stack.length]);

  async function handleSwipe(action: "LIKE" | "PASS") {
    const top = stack[0];
    if (!top || isSubmitting) return;
    setIsSubmitting(true);
    setExitDirection(action === "LIKE" ? "right" : "left");

    try {
      const result = await onSwipe(top, action);
      setStack((prev) => prev.slice(1));
      if (result.matched) {
        setMatchedCard(top);
        setMatchedChatUrl(result.partnerChatUrl ?? null);
      }
    } finally {
      setIsSubmitting(false);
      setExitDirection(null);
    }
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      handleSwipe("LIKE");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      handleSwipe("PASS");
    }
  }

  if (isLoading) {
    return <DeckSkeleton />;
  }

  if (stack.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 text-center text-gray-400">
        <p className="font-display text-lg font-semibold text-gray-50">You&apos;re all caught up</p>
        <p className="text-sm">Check back soon for new matches.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-4">
      <div className="relative h-[480px] w-full max-w-sm">
        <AnimatePresence>
          {stack.slice(0, 3).map((card, index) => (
            <motion.div
              key={card.data.id}
              className="absolute inset-0"
              style={{ zIndex: 30 - index }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: 1 - index * 0.04,
                y: index * 10,
                opacity: 1,
              }}
              exit={{
                x: exitDirection === "right" ? 500 : -500,
                rotate: exitDirection === "right" ? 20 : -20,
                opacity: 0,
                transition: { duration: 0.25 },
              }}
              drag={index === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={index === 0 ? handleDragEnd : undefined}
              whileDrag={{ rotate: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {card.kind === "job" ? (
                <JobCard job={card.data} onRateCompany={onRateCompany} />
              ) : (
                <DualSlideCard candidate={card.data} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Pass"
          disabled={isSubmitting}
          onClick={() => handleSwipe("PASS")}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-[var(--border-default)] bg-ink-750 text-gray-300 shadow-card transition-colors duration-200 hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={28} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Like"
          disabled={isSubmitting}
          onClick={() => handleSwipe("LIKE")}
          className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-lime-500 text-ink-900 shadow-accent-btn transition-colors duration-200 hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart size={30} aria-hidden="true" fill="currentColor" />
        </button>
      </div>

      <AnimatePresence>
        {matchedCard && (
          <MatchModal
            partnerName={matchPartnerName ? matchPartnerName(matchedCard) : "your match"}
            chatUrl={matchedChatUrl}
            onClose={() => setMatchedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeckSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-4">
      <div className="h-[480px] w-full max-w-sm animate-pulse rounded-xl bg-ink-800" />
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 animate-pulse rounded-full bg-ink-800" />
        <div className="h-16 w-16 animate-pulse rounded-full bg-ink-800" />
      </div>
    </div>
  );
}
