export interface JobCardData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string;
  currency: string;
  company: { companyName: string; logoUrl: string | null; location: string | null };
}

export interface CandidateCardData {
  id: string;
  accountId: string;
  fullName: string;
  headline: string;
  yearsExp: number;
  bio: string;
  skills: string[];
  avatarUrl: string | null;
  location: string | null;
}

export function formatSalary(job: Pick<JobCardData, "salaryMin" | "salaryMax" | "salaryPeriod" | "currency">) {
  if (!job.salaryMin && !job.salaryMax) return "Negotiable";
  const fmt = (n: number) => n.toLocaleString("en-US");
  const period = job.salaryPeriod === "YEARLY" ? "/yr" : "/mo";
  if (job.salaryMin && job.salaryMax) {
    return `${job.currency} ${fmt(job.salaryMin)} - ${fmt(job.salaryMax)}${period}`;
  }
  const single = job.salaryMin ?? job.salaryMax!;
  return `${job.currency} ${fmt(single)}+${period}`;
}
