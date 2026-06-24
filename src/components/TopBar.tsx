import Link from "next/link";
import { Briefcase, Users2, MessageCircle } from "lucide-react";

export function TopBar({ active }: { active: "seeker" | "recruiter" | "matches" }) {
  return (
    <header className="sticky top-4 z-40 mx-4 flex items-center justify-between rounded-2xl bg-navy-900 px-4 py-3 shadow-card">
      <Link href="/" className="font-display text-lg font-bold text-white">
        Abyssinia <span className="text-gold-400">Jobs</span>
      </Link>
      <nav className="flex items-center gap-1 rounded-full bg-navy-800 p-1">
        <Link
          href="/seeker"
          aria-label="Seeker feed"
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ${
            active === "seeker" ? "bg-gold-500 text-navy-900" : "text-navy-100 hover:text-white"
          }`}
        >
          <Briefcase size={18} aria-hidden="true" />
        </Link>
        <Link
          href="/recruiter"
          aria-label="Recruiter feed"
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ${
            active === "recruiter" ? "bg-gold-500 text-navy-900" : "text-navy-100 hover:text-white"
          }`}
        >
          <Users2 size={18} aria-hidden="true" />
        </Link>
        <Link
          href="/matches"
          aria-label="Matches"
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ${
            active === "matches" ? "bg-gold-500 text-navy-900" : "text-navy-100 hover:text-white"
          }`}
        >
          <MessageCircle size={18} aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}
