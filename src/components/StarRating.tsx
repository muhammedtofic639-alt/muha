"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  /** Average rating out of 10, or null if no ratings yet. Always shown. */
  average: number | null;
  count: number;
  /** When provided, renders an interactive 1-10 (half-step) picker that POSTs on change. */
  onRate?: (rating: number) => Promise<void> | void;
  initialRating?: number | null;
}

const MAX_STARS = 10;

export function StarRating({ average, count, onRate, initialRating }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<number | null>(initialRating ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const displayValue = hovered ?? submitted ?? average ?? 0;

  async function handlePick(starIndex: number, half: boolean) {
    if (!onRate) return;
    const rating = half ? starIndex - 0.5 : starIndex;
    setSubmitted(rating);
    setIsSaving(true);
    try {
      await onRate(rating);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setHovered(null)}>
        {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map((starIndex) => {
          const fillRatio = Math.max(0, Math.min(1, displayValue - (starIndex - 1)));
          return (
            <button
              key={starIndex}
              type="button"
              disabled={!onRate || isSaving}
              aria-label={`Rate ${starIndex} out of ${MAX_STARS} stars`}
              className={`relative h-5 w-5 ${onRate ? "cursor-pointer" : "cursor-default"}`}
              onMouseEnter={() => onRate && setHovered(starIndex)}
              onClick={(e) => {
                if (!onRate) return;
                const { left, width } = e.currentTarget.getBoundingClientRect();
                const half = e.clientX - left < width / 2;
                handlePick(starIndex, half);
              }}
            >
              <Star size={20} className="absolute inset-0 text-navy-200" aria-hidden="true" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillRatio * 100}%` }}>
                <Star size={20} className="text-gold-500" fill="currentColor" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-navy-700">
        {average !== null ? `${average.toFixed(1)}/10` : "No ratings yet"}
        {count > 0 && <span className="ml-1 font-normal text-navy-400">({count})</span>}
      </span>
    </div>
  );
}
