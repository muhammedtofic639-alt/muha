"use client";

import { useRouter } from "next/navigation";

export function BackToStartButton() {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer rounded-full border border-[var(--border-default)] bg-transparent px-6 py-3 text-sm text-gray-400"
    >
      ← Back to start
    </button>
  );
}
