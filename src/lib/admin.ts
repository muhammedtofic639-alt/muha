/**
 * Admin access is granted by an allowlist of Telegram user ids, configured via
 * the ADMIN_TELEGRAM_IDS env var (comma-separated). This keeps approval power
 * out of the database/UI and requires no schema migration — an admin is simply
 * a known Telegram account.
 */
function getAdminIds(): Set<string> {
  const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

export function isAdmin(telegramId: string | null | undefined): boolean {
  if (!telegramId) return false;
  return getAdminIds().has(telegramId);
}
