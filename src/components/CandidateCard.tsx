import { MapPin, BriefcaseBusiness } from "lucide-react";
import { CandidateCardData } from "@/lib/types";

export function CandidateCard({ candidate }: { candidate: CandidateCardData }) {
  const initials = candidate.fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="flex items-center gap-3 bg-navy-900 px-6 py-5">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 font-display text-lg font-semibold text-gold-400"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">{candidate.fullName}</p>
          {candidate.location && (
            <p className="flex items-center gap-1 text-sm text-navy-100">
              <MapPin size={14} aria-hidden="true" />
              {candidate.location}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <h2 className="font-display text-2xl font-bold leading-tight text-navy-900">{candidate.headline}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-base font-semibold text-gold-600">
            <BriefcaseBusiness size={18} aria-hidden="true" />
            {candidate.yearsExp} {candidate.yearsExp === 1 ? "year" : "years"} of experience
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-navy-100 px-3 py-1 text-xs font-medium text-navy-800">
              {skill}
            </span>
          ))}
        </div>

        <p className="text-[15px] leading-relaxed text-navy-600">{candidate.bio}</p>
      </div>
    </div>
  );
}
