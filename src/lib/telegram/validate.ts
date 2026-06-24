import crypto from "crypto";

/**
 * Validates a Telegram Mini App `initData` string on the server.
 *
 * Telegram signs the launch parameters with a key derived from the bot token:
 *   secret_key   = HMAC_SHA256(key = "WebAppData", data = BOT_TOKEN)
 *   check_string = the initData fields (except `hash`) sorted by key and
 *                  joined as "key=value" with "\n"
 *   expected     = HMAC_SHA256(key = secret_key, data = check_string)  (hex)
 *
 * We recompute `expected` and compare it (in constant time) to the `hash`
 * field. We also reject stale launches via `auth_date` to limit replay.
 *
 * Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24; // reject initData older than 24h

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

export interface ValidatedInitData {
  user: TelegramUser;
  authDate: number;
}

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
  }
  return token;
}

/**
 * Returns the validated payload, or null if the signature is invalid, the
 * data is malformed, or the launch is too old.
 */
export function validateInitData(initDataRaw: string): ValidatedInitData | null {
  if (!initDataRaw) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initDataRaw);
  } catch {
    return null;
  }

  const hash = params.get("hash");
  if (!hash) return null;

  // Build the data-check-string from every field except `hash`, sorted by key.
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const checkString = pairs.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(getBotToken()).digest();
  const expected = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

  // Constant-time comparison to avoid leaking the signature via timing.
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(hash, "hex");
  if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
    return null;
  }

  // Replay protection: reject launches older than MAX_AUTH_AGE_SECONDS.
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) return null;
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > MAX_AUTH_AGE_SECONDS) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return null;
  }
  if (typeof user.id !== "number") return null;

  return { user, authDate };
}
