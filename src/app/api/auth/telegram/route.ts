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
  // Fail loud and specific when the deployment is missing configuration —
  // otherwise every launch dies as an opaque 500 and the app looks broken.
  const missing = ["TELEGRAM_BOT_TOKEN", "SESSION_SECRET", "DATABASE_URL"].filter(
    (name) => !process.env[name]
  );
  if (missing.length > 0) {
    console.error(`/api/auth/telegram: missing environment variables: ${missing.join(", ")}`);
    return NextResponse.json(
      {
        error: `Server is not configured yet — missing ${missing.join(", ")}. Set ${
          missing.length === 1 ? "it" : "them"
        } in the deployment's environment variables and redeploy.`,
      },
      { status: 503 }
    );
  }

  let body: TelegramAuthBody;
  try {
    body = (await req.json()) as TelegramAuthBody;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON with initDataRaw" }, { status: 400 });
  }

  const validated = validateInitData(body.initDataRaw);
  if (!validated) {
    return NextResponse.json(
      { error: "Telegram sign-in data is invalid or expired. Close and reopen the Mini App." },
      { status: 401 }
    );
  }

  const telegramId = String(validated.user.id);
  const username = validated.user.username ?? null;

  try {
    // First launch creates a bare account in PENDING_APPROVAL; repeat launches
    // just refresh the cached username (it can change on Telegram's side).
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
  } catch (err) {
    console.error("/api/auth/telegram: database error", err);
    return NextResponse.json(
      {
        error:
          "Could not reach the database. Check DATABASE_URL and make sure the schema has been pushed (npx prisma db push).",
      },
      { status: 500 }
    );
  }
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
