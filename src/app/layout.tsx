import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/lib/telegram/provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Abyssinia Jobs",
  description: "Swipe-based job matching for Ethiopia's tech hub",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // respect Telegram's safe-area insets on the webview
  themeColor: "#0B0B0C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      {/*
        Height is driven by Telegram's stable viewport variable (bound by the
        provider) so the layout fits the webview exactly, with a 100dvh fallback
        when running outside Telegram. Safe-area padding keeps content clear of
        the Telegram header and the device home indicator.
      */}
      <body className="font-sans">
        <div
          className="mx-auto flex max-w-md flex-col bg-ink-900 sm:max-w-lg"
          style={{
            minHeight: "var(--tg-viewport-stable-height, 100dvh)",
            paddingTop: "var(--tg-safe-area-inset-top, 0px)",
            paddingBottom: "var(--tg-safe-area-inset-bottom, 0px)",
          }}
        >
          <TelegramProvider>{children}</TelegramProvider>
        </div>
      </body>
    </html>
  );
}
