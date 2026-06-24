import Link from "next/link";
import { Briefcase, Users2, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-400">
        <Heart size={36} aria-hidden="true" fill="currentColor" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          Abyssinia <span className="text-gold-500">Jobs</span>
        </h1>
        <p className="mt-2 max-w-xs text-[15px] text-navy-600">
          Swipe your way to your next opportunity or your next great hire.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/seeker"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-800"
        >
          <Briefcase size={18} aria-hidden="true" />
          I&apos;m looking for a job
        </Link>
        <Link
          href="/recruiter"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-navy-900 py-3 text-sm font-semibold text-navy-900 transition-colors duration-200 hover:bg-navy-100"
        >
          <Users2 size={18} aria-hidden="true" />
          I&apos;m hiring
        </Link>
        <Link
          href="/matches"
          className="cursor-pointer py-2 text-sm font-medium text-gold-600 transition-colors duration-200 hover:text-gold-500"
        >
          View my matches
        </Link>
      </div>
    </main>
  );
}
