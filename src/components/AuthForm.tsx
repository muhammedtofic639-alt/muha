"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(mode === "signup" ? "/onboarding/role" : "/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-navy-800">Email</span>
        <div className="flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-3 py-2.5">
          <Mail size={18} className="text-navy-400" aria-hidden="true" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-[15px] text-navy-900 outline-none"
            placeholder="you@example.com"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-navy-800">Password</span>
        <div className="flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-3 py-2.5">
          <Lock size={18} className="text-navy-400" aria-hidden="true" />
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-[15px] text-navy-900 outline-none"
            placeholder="At least 8 characters"
          />
        </div>
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 cursor-pointer rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
