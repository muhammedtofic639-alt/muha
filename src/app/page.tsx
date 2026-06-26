import { Heart } from "lucide-react";

/**
 * Launch splash. The TelegramProvider (mounted in the root layout) validates
 * the Mini App's initData, signs the user in, and redirects to the correct
 * next step — onboarding, the "under review" screen, or a swipe deck. This
 * page is just what the user sees for the brief moment that handshake runs.
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-lg bg-lime-500 text-ink-900">
        <Heart size={36} aria-hidden="true" fill="currentColor" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-50">
          abyssinia <span className="text-gray-400">jobs</span>
        </h1>
        <p className="mt-2 max-w-xs text-[15px] text-gray-400">Signing you in via Telegram…</p>
      </div>
    </main>
  );
}
