import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateInitData } from "@/lib/telegram/validate";
import { signSession, sessionCookieOptions } from "@/lib/auth";

interface TelegramAuthBody {
  initDataRaw: string;
}

/**
 * The single authentication entry point for the Mini App. The client posts the
 * raw `initData` string from the Telegram WebApp launch; we validate its HMAC
 * signature, then upsert the Account keyed by `telegramId` and issue our own
 * session cookie. The session JWT carries only { accountId, role } — account
 * status is always read fresh, so admin approval takes effect with no re-auth.
 *
 * The response includes `next`: the path the client should route to based on
 * the account's onboarding/approval state.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as TelegramAuthBody;
  const validated = validateInitData(body.initDataRaw);

  if (!validated) {
    return NextResponse.json({ error: "Invalid Telegram initData" }, { status: 401 });
  }

  const telegramId = String(validated.user.id);
  const username = validated.user.username ?? null;

  // First launch creates a bare, role-less account in PENDING_APPROVAL; repeat
  // launches just refresh the cached username (it can change on Telegram's side).
  const account = await prisma.account.upsert({
    where: { telegramId },
    update: { username },
    create: { telegramId, username, role: "SEEKER" },
    include: { seekerProfile: true, companyProfile: true },
  });

  const token = await signSession({ accountId: account.id, role: account.role });

  const next = resolveNextPath(account);

  const res = NextResponse.json({ accountId: account.id, status: account.status, next });
  res.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
  return res;
}

/** Decide where the user should land right after authenticating. */
function resolveNextPath(account: {
  status: string;
  role: string;
  seekerProfile: unknown;
  companyProfile: unknown;
}) {
  const hasProfile = account.seekerProfile !== null || account.companyProfile !== null;
  if (!hasProfile) return "/onboarding/role";
  if (account.status === "PENDING_APPROVAL") return "/pending";
  if (account.status === "REJECTED") return "/rejected";
  return account.role === "RECRUITER" ? "/recruiter" : "/seeker";
}
