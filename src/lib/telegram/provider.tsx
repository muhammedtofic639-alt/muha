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
          if (!cancelled) setState("error");
          return;
        }
        const data = (await res.json()) as { next: string; status: string };
        if (cancelled) return;
        setTelegramId(retrieveLaunchParams().initData?.user?.id?.toString() ?? null);
        setState("ready");
        router.replace(data.next);
        router.refresh();
      } catch {
        if (!cancelled) setState("error");
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

  return (
    <TelegramContext.Provider value={{ state, telegramId }}>{children}</TelegramContext.Provider>
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
