"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  init,
  retrieveLaunchParams,
  miniApp,
  themeParams,
  viewport,
} from "@telegram-apps/sdk-react";

type AuthState = "loading" | "outside-telegram" | "authenticating" | "ready" | "error";

interface TelegramContextValue {
  state: AuthState;
  /** Telegram user id of the signed-in account, once authenticated. */
  telegramId: string | null;
}

const TelegramContext = createContext<TelegramContextValue>({ state: "loading", telegramId: null });

export function useTelegram() {
  return useContext(TelegramContext);
}

/**
 * Boots the Telegram Mini App SDK and performs auto-authentication:
 *  1. init() the SDK and mount theme/viewport so Telegram's colors and the
 *     stable viewport height are exposed as CSS variables (--tg-*).
 *  2. Read the raw initData and POST it to /api/auth/telegram, which validates
 *     the signature server-side and sets our session cookie.
 *  3. Route to the path the server returns (onboarding / pending / decks).
 *
 * Outside Telegram (no initData) we render an "open in Telegram" notice instead
 * of the app — there is no password fallback by design.
 */
export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>("loading");
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let initDataRaw: string | undefined;
      try {
        init();
        // Bind Telegram theme + viewport to CSS variables for native-feeling UI.
        if (miniApp.mount.isAvailable()) miniApp.mount();
        if (themeParams.mount.isAvailable()) themeParams.mount();
        if (themeParams.bindCssVars.isAvailable()) themeParams.bindCssVars();
        if (viewport.mount.isAvailable()) {
          await viewport.mount();
          if (viewport.bindCssVars.isAvailable()) viewport.bindCssVars();
          // Expand to full height so the webview uses the whole available area.
          if (viewport.expand.isAvailable()) viewport.expand();
        }

        const launchParams = retrieveLaunchParams();
        initDataRaw = launchParams.initDataRaw;
      } catch {
        // SDK init throws when not running inside a Telegram client.
        if (!cancelled) setState("outside-telegram");
        return;
      }

      if (!initDataRaw) {
        if (!cancelled) setState("outside-telegram");
        return;
      }

      if (!cancelled) setState("authenticating");
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initDataRaw }),
        });
        if (!res.ok) {
          // Surface the server's diagnostic (missing env vars, DB unreachable,
          // expired initData) instead of hanging on the splash forever.
          let message = `Sign-in failed (HTTP ${res.status}).`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data.error) message = data.error;
          } catch {
            // Non-JSON error body (e.g. a hosting platform's HTML error page).
          }
          if (!cancelled) {
            setErrorMessage(message);
            setState("error");
          }
          return;
        }
        const data = (await res.json()) as { next: string; status: string };
        if (cancelled) return;
        setTelegramId(retrieveLaunchParams().initData?.user?.id?.toString() ?? null);
        setState("ready");
        router.replace(data.next);
        router.refresh();
      } catch {
        if (!cancelled) {
          setErrorMessage("Could not reach the server. Check your connection and try again.");
          setState("error");
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "outside-telegram") {
    return <OpenInTelegramNotice />;
  }

  if (state === "error") {
    return <AuthErrorNotice message={errorMessage} />;
  }

  return (
    <TelegramContext.Provider value={{ state, telegramId }}>{children}</TelegramContext.Provider>
  );
}

function AuthErrorNotice({ message }: { message: string | null }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-[1.5px] border-[rgba(255,90,90,0.35)] bg-[rgba(255,90,90,0.15)] font-display text-2xl font-bold text-danger">
        !
      </div>
      <h1 className="font-display text-xl font-bold text-gray-50">Couldn&apos;t sign you in</h1>
      <p className="max-w-xs text-sm leading-relaxed text-gray-400">
        {message ?? "Something went wrong during Telegram sign-in."}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 cursor-pointer rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink-900 shadow-accent-btn"
      >
        Try again
      </button>
    </main>
  );
}

function OpenInTelegramNotice() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <h1 className="font-display text-xl font-bold text-gray-50">Open in Telegram</h1>
      <p className="max-w-xs text-sm text-gray-400">
        Abyssinia Jobs runs as a Telegram Mini App. Please open it from inside the Telegram app to
        continue.
      </p>
    </main>
  );
}
