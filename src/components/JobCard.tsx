import { Building2, MapPin, Wallet } from "lucide-react";
import { JobCardData, formatSalary } from "@/lib/types";
import { StarRating } from "@/components/StarRating";

const WORK_MODE_LABEL: Record<string, string> = {
  REMOTE: "Remote",
  ON_SITE: "On-site",
  HYBRID: "Hybrid",
};

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export function JobCard({
  job,
  onRateCompany,
}: {
  job: JobCardData;
  onRateCompany?: (companyAccountId: string, rating: number) => Promise<void>;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="flex items-center gap-3 bg-navy-900 px-6 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400">
          <Building2 size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">{job.company.companyName}</p>
          {job.company.location && (
            <p className="flex items-center gap-1 text-sm text-navy-100">
              <MapPin size={14} aria-hidden="true" />
              {job.company.location}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <StarRating
          average={job.company.rating.average}
          count={job.company.rating.count}
          onRate={onRateCompany ? (rating) => onRateCompany(job.company.accountId, rating) : undefined}
        />
        <div>
          <h2 className="font-display text-2xl font-bold leading-tight text-navy-900">{job.title}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-base font-semibold text-gold-600">
            <Wallet size={18} aria-hidden="true" />
            {formatSalary(job)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-700">
            {job.category.name}
          </span>
          <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-medium text-navy-800">
            {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
          </span>
          <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-medium text-navy-800">
            {WORK_MODE_LABEL[job.workMode] ?? job.workMode}
          </span>
          {job.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-[15px] leading-relaxed text-navy-600">{job.description}</p>
      </div>
    </div>
  );
}
