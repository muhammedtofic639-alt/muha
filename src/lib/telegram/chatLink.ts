/**
 * Builds a direct Telegram chat link for a matched user.
 *
 * Prefer the public `t.me/<username>` form — it opens natively inside Telegram
 * and via `openTelegramLink()`. When the user has no public username we fall
 * back to the `tg://user?id=<id>` deep link, which Telegram clients resolve to
 * a private chat.
 */
export function telegramChatUrl(username: string | null, telegramId: string | null): string | null {
  if (username) return `https://t.me/${username}`;
  if (telegramId) return `tg://user?id=${telegramId}`;
  return null;
}
