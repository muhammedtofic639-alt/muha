"use client";

import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export function MatchModal({ partnerName, onClose }: { partnerName: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Match found"
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-card animate-pop-in"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-navy-400 transition-colors duration-200 hover:text-navy-800"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 text-gold-500">
          <Sparkles size={32} aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl font-bold text-navy-900">It&apos;s a Match!</h2>
        <p className="mt-2 text-[15px] text-navy-600">
          You and {partnerName} both swiped right. Head to your matches to start the conversation.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-800"
        >
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  );
}
