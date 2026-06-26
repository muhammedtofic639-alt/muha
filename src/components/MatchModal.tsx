"use client";

import { motion } from "framer-motion";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { Sparkles, X, MessageCircle } from "lucide-react";

function openChat(url: string) {
  if (url.startsWith("https://t.me/") && openTelegramLink.isAvailable()) {
    openTelegramLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function MatchModal({
  partnerName,
  chatUrl,
  onClose,
}: {
  partnerName: string;
  chatUrl?: string | null;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Match found"
    >
      <motion.div
        className="relative w-full max-w-sm rounded-xl border border-[var(--border-default)] bg-ink-750 p-8 text-center shadow-card animate-pop-in"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-gray-500 transition-colors duration-200 hover:text-gray-50"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(212,255,0,0.15)] text-lime-400">
          <Sparkles size={32} aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-50">It&apos;s a Match!</h2>
        <p className="mt-2 text-[15px] text-gray-400">
          You and {partnerName} both swiped right. Head to your matches to start the conversation.
        </p>
        {chatUrl && (
          <button
            type="button"
            onClick={() => openChat(chatUrl)}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-semibold text-ink-900 shadow-accent-btn transition-colors duration-200 hover:bg-lime-400"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Message on Telegram
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className={`${chatUrl ? "mt-2" : "mt-6"} w-full cursor-pointer rounded-xl border border-[var(--border-default)] bg-ink-700 py-3 text-sm font-semibold text-gray-50 transition-colors duration-200 hover:bg-ink-600`}
        >
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  );
}
