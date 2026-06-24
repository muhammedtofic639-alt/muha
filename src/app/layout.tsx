import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/lib/telegram/provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
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
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable}`}>
      {/*
        Height is driven by Telegram's stable viewport variable (bound by the
        provider) so the layout fits the webview exactly, with a 100dvh fallback
        when running outside Telegram. Safe-area padding keeps content clear of
        the Telegram header and the device home indicator.
      */}
      <body className="font-sans">
        <div
          className="mx-auto flex max-w-md flex-col bg-navy-50 sm:max-w-lg"
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
